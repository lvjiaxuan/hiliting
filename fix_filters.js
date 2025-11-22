const fs = require('fs');
const path = require('path');

const NAMED_SIZES = {
  'pico': [16, 16],
  'icon': [32, 32],
  'thumb': [50, 50],
  'small': [100, 100],
  'compact': [160, 160],
  'medium': [240, 240],
  'large': [480, 480],
  'grande': [600, 600],
  'original': [null, null],
  'master': [null, null],
  '1024x1024': [1024, 1024],
  '2048x2048': [2048, 2048],
};

function replaceMatch(match, filterName, quote, sizeStr) {
  let crop = null;
  if (sizeStr.includes('_cropped')) {
    sizeStr = sizeStr.replace('_cropped', '');
    crop = 'center';
  }

  let width = null;
  let height = null;

  if (NAMED_SIZES[sizeStr]) {
    [width, height] = NAMED_SIZES[sizeStr];
  } else {
    if (sizeStr.includes('x')) {
      const parts = sizeStr.split('x');
      if (parts[0]) width = parseInt(parts[0], 10);
      if (parts.length > 1 && parts[1]) height = parseInt(parts[1], 10);
    }
  }

  const params = [];
  if (width) params.push(`width: ${width}`);
  if (height) params.push(`height: ${height}`);
  if (crop) params.push(`crop: '${crop}'`);

  if (params.length === 0) {
    if (['master', 'original'].includes(sizeStr)) {
      return `| image_url`;
    }
    return match; // No change if unknown format
  }

  return `| image_url: ${params.join(', ')}`;
}

function processFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  // Regex for | img_url: '...' or | product_img_url: '...'
  const pattern = /\|\s*(img_url|product_img_url)\s*:\s*(['"])(.*?)\2/g;

  const newContent = content.replace(pattern, replaceMatch);

  if (newContent !== content) {
    console.log(`Fixing ${filepath}`);
    fs.writeFileSync(filepath, newContent, 'utf8');
  }
}

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

function main() {
  const dirs = ['layout', 'sections', 'snippets', 'templates'];
  const baseDir = process.cwd();

  dirs.forEach(d => {
    walkDir(path.join(baseDir, d), (filepath) => {
      if (filepath.endsWith('.liquid')) {
        processFile(filepath);
      }
    });
  });
}

main();
