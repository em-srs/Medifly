const fs = require('fs');
const path = require('path');

const iconMap = {
  '🏠': 'Home',
  '🛍️': 'ShoppingBag',
  '🔬': 'TestTubes',
  '🔄': 'RefreshCw',
  '📁': 'Folder',
  'ℹ️': 'Info',
  '📞': 'Phone',
  '🛒': 'ShoppingCart',
  '👤': 'User',
  '⚙️': 'Settings',
  '🚪': 'LogOut',
  '🔑': 'Key',
  '📦': 'Package',
  '🩺': 'Stethoscope',
  '✅': 'CheckCircle2',
  '✓': 'Check',
  '✔️': 'Check',
  '⚠️': 'AlertTriangle',
  '⚡': 'Zap',
  '🚨': 'ShieldAlert',
  '🌟': 'Star',
  '🌙': 'Moon',
  '❄️': 'Snowflake',
  '📊': 'BarChart3',
  '💳': 'CreditCard',
  '✨': 'Sparkles',
  '👥': 'Users',
  '💰': 'IndianRupee',
  '💊': 'Pill',
  '🕒': 'Clock',
  '📅': 'Calendar',
  '🔍': 'Search',
  '📍': 'MapPin',
  '🚴': 'Bike',
  '💬': 'MessageSquare',
  '💡': 'Lightbulb',
  '🗑️': 'Trash2',
  '✕': 'X',
  '⭐': 'Star',
  '🔥': 'Flame',
  '🎉': 'PartyPopper',
  '👦': 'UserCircle2',
  '👨': 'UserCircle2',
  '🔔': 'Bell',
  '🏥': 'Hospital',
  '🚚': 'Truck'
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
      // Replace emoji globally
      content = content.split(emoji).join(`<${iconName} size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />`);
      modified = true;
    }
  }

  if (modified) {
    // Also clean up literal string wrapping in jsx like: icon: '<Home ... />'
    content = content.replace(/'(<[a-zA-Z0-9]+ size=\{18\}.*?\/>)'/g, '$1');
    content = content.replace(/"(<[a-zA-Z0-9]+ size=\{18\}.*?\/>)"/g, '$1');

    const importsString = `import { ${Array.from(iconsUsed).join(', ')} } from 'lucide-react';\n`;
    const lines = content.split('\n');
    let injectIdx = 0;
    
    // find index to inject import mostly after other imports
    for(let i=0; i<lines.length; i++){
       if(lines[i].startsWith('import')) {
           injectIdx = i;
       }
    }
    
    // Inject just below the last import, or at top
    lines.splice(injectIdx + 1, 0, importsString);
    content = lines.join('\\n');

    fs.writeFileSync(file, content);
    console.log(`Updated ${file} with icons: ${Array.from(iconsUsed).join(', ')}`);
  }
});
