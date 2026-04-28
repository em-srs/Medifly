const fs = require('fs');
const path = require('path');
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
  let original = content;

  // We are looking for strings like:
  // icon: '<Shield size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />'
  // Where the outer literal is ' or \"
  // My previous search regex didn't account for the single quotes inside the style object.
  // We can just use string replace since the inner part is consistent:
  
  const singleRegex = /'(<[A-Za-z0-9]+ size=\{18\} style=\{\{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' \}\} \/>)'/g;
  const doubleRegex = /"(<[A-Za-z0-9]+ size=\{18\} style=\{\{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' \}\} \/>)"/g;

  content = content.replace(singleRegex, '$1');
  content = content.replace(doubleRegex, '$1');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Fixed quotes in:', file);
  }
});
