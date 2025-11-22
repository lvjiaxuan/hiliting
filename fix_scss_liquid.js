const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'assets', 'theme.scss.liquid');

console.log('Reading file...');
let content = fs.readFileSync(filePath, 'utf-8');

// Fix pattern like:
// {
//     {
//     settings.something
//   }
// }
// to: {{ settings.something }}

// Also fix pattern like:
//   {
//   %- assign ... -%
// }
// to: {% assign ... %}

console.log('Fixing Liquid syntax...');
let fixed = content;

// Fix {{ }} pattern (for output)
fixed = fixed.replace(/\{\s*\{\s*\n\s*([\s\S]*?)\n\s*\}\s*\}/g, (match, inner) => {
  // Remove extra whitespace and newlines
  const cleaned = inner.trim().replace(/\s+/g, ' ');
  return `{{ ${cleaned} }}`;
});

// Fix {% %} pattern (for logic tags)
fixed = fixed.replace(/\{\s*\n\s*%-?(.*?)-%?\s*\n\s*\}/g, (match, inner) => {
  const cleaned = inner.trim().replace(/\s+/g, ' ');
  return `{% ${cleaned} %}`;
});

console.log('Writing fixed file...');
fs.writeFileSync(filePath, fixed, 'utf-8');

console.log('✓ Fixed Liquid syntax in theme.scss.liquid');
