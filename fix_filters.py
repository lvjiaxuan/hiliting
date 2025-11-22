import os
import re

# Mapping of named sizes to dimensions (width, height)
# If only one dimension is relevant (square), we can use width.
# Shopify docs: https://shopify.dev/docs/api/liquid/filters/img_url
NAMED_SIZES = {
    'pico': (16, 16),
    'icon': (32, 32),
    'thumb': (50, 50),
    'small': (100, 100),
    'compact': (160, 160),
    'medium': (240, 240),
    'large': (480, 480),
    'grande': (600, 600),
    'original': (None, None),
    'master': (None, None),
    '1024x1024': (1024, 1024),
    '2048x2048': (2048, 2048),
}

def replace_match(match):
    filter_name = match.group(1) # img_url or product_img_url
    quote = match.group(2)
    size_str = match.group(3)
    
    # Check for crop
    crop = None
    if '_cropped' in size_str:
        size_str = size_str.replace('_cropped', '')
        crop = 'center' # Default assumption for _cropped

    width = None
    height = None

    if size_str in NAMED_SIZES:
        w, h = NAMED_SIZES[size_str]
        width = w
        height = h
    else:
        # Parse 100x, x100, 100x100
        if 'x' in size_str:
            parts = size_str.split('x')
            if parts[0]:
                width = int(parts[0])
            if len(parts) > 1 and parts[1]:
                height = int(parts[1])
        else:
            # Assume it might be a number? Or unknown.
            # If it's just a number like '100', usually treated as width?
            # Shopify img_url requires 'x' for dimensions usually, unless named.
            pass

    params = []
    if width:
        params.append(f"width: {width}")
    if height:
        params.append(f"height: {height}")
    if crop:
        params.append(f"crop: '{crop}'")
    
    # If original/master and no params, image_url defaults to master? 
    # Actually image_url without params returns a URL.
    # But let's be explicit if we can.
    
    if not params:
        # If we couldn't parse, keep original but warn? 
        # Or just return match.group(0) to skip.
        # For 'master' or 'original', we can just use `image_url`.
        if size_str in ['master', 'original']:
             return f"| image_url"
        return match.group(0)

    return f"| image_url: {', '.join(params)}"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Regex to find | img_url: '...' or | product_img_url: '...'
    # We handle both single and double quotes.
    # We also handle whitespace.
    pattern = re.compile(r'\|\s*(img_url|product_img_url)\s*:\s*([\'"])(.*?)\2')
    
    new_content = pattern.sub(replace_match, content)
    
    if new_content != content:
        print(f"Fixing {filepath}")
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

def main():
    # Walk through directories
    dirs = ['layout', 'sections', 'snippets', 'templates']
    base_dir = os.getcwd()
    
    for d in dirs:
        target_dir = os.path.join(base_dir, d)
        if not os.path.exists(target_dir):
            continue
            
        for root, _, files in os.walk(target_dir):
            for file in files:
                if file.endswith('.liquid'):
                    process_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
