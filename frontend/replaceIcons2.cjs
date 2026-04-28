const fs = require('fs');
const path = require('path');

const iconMap = {
  '🌐': 'Globe',
  '🛡': 'Shield',
  '🏅': 'Award',
  '🧑': 'User',
  '👧': 'User',
  '👁': 'Eye',
  '📄': 'FileText',
  '🗺': 'Map',
  '💼': 'Briefcase',
  '💳': 'CreditCard',
  '🔒': 'Lock',
  '🚀': 'Rocket'
};

function walk(dir, fileList = []) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walk(filePath, fileList);
    } else if (filePath.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const files = walk('src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let iconsUsed = new Set();
  let modified = false;

  for (const [emoji, iconName] of Object.entries(iconMap)) {
    if (content.includes(emoji)) {
      iconsUsed.add(iconName);
      content = content.replace(new RegExp(emoji, 'g'), `<${iconName} size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />`);
      modified = true;
    }
  }

  if (modified) {
    const lines = content.split('\n');
    let hasIconsImport = false;
    let importLineIdx = -1;
    let existingIcons = [];

    // Find if lucide-react is already imported
    for(let i=0; i<lines.length; i++){
       if(lines[i].includes('lucide-react')) {
           hasIconsImport = true;
           importLineIdx = i;
           // Extract existing imports
           const match = lines[i].match(/import\s+\{(.*?)\}\s+from\s+'lucide-react';/);
           if (match) {
             existingIcons = match[1].split(',').map(s => s.trim());
           }
       }
    }

    if (hasIconsImport) {
       for(const icon of existingIcons) {
         if (icon) iconsUsed.add(icon);
       }
       lines[importLineIdx] = `import { ${Array.from(iconsUsed).join(', ')} } from 'lucide-react';`;
    } else {
       const importsString = `import { ${Array.from(iconsUsed).join(', ')} } from 'lucide-react';`;
       let injectIdx = 0;
       for(let i=0; i<lines.length; i++){
          if(lines[i].startsWith('import')) {
              injectIdx = i;
          }
       }
       lines.splice(injectIdx + 1, 0, importsString);
    }
    
    content = lines.join('\n');
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
