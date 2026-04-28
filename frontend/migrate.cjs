const fs = require('fs');
const path = require('path');

const srcBackup = path.join(__dirname, 'src_nextjs_backup');
const srcDir = path.join(__dirname, 'src');

if (!fs.existsSync(srcBackup)) {
  console.log('src_nextjs_backup not found, exiting.');
  process.exit(0);
}

// Ensure dirs exist
['pages', 'components', 'context', 'hooks', 'data'].forEach(d => {
  fs.mkdirSync(path.join(srcDir, d), { recursive: true });
});

function capitalize(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

function processContent(content, toPath) {
  // Remove 'use client'
  content = content.replace(/'use client';?\n?/g, '');
  content = content.replace(/"use client";?\n?/g, '');

  // next/link -> react-router-dom Link
  content = content.replace(/import Link from 'next\/link';?/g, "import { Link } from 'react-router-dom';");
  // Change Link href to Link to
  content = content.replace(/<Link([^>]+?)href=/g, '<Link$1to=');

  // next/navigation -> react-router-dom
  if (content.includes('next/navigation')) {
    content = content.replace(/import\s+\{([^}]+)\}\s+from\s+'next\/navigation';?/g, (match, importsStr) => {
      let imports = importsStr.split(',').map(i => i.trim());
      let reactRouterImports = [];
      if (imports.includes('useRouter')) reactRouterImports.push('useNavigate');
      if (imports.includes('usePathname')) reactRouterImports.push('useLocation');
      return `import { ${reactRouterImports.join(', ')} } from 'react-router-dom';`;
    });

    // Replace usages
    content = content.replace(/useRouter\(\)/g, "useNavigate()");
    content = content.replace(/const\s+router\s*=\s*useNavigate\(\);?/g, "const navigate = useNavigate();");
    content = content.replace(/router\.push\(/g, "navigate(");
    content = content.replace(/usePathname\(\)/g, "useLocation().pathname");
  }

  // Handle page.module.css renames
  content = content.replace(/import styles from '(?:\.\/)?page\.module\.css';/g, (match) => {
    const pageName = path.basename(toPath).replace('.jsx', '');
    return `import styles from './${pageName}.module.css';`;
  });
  
  content = content.replace(/import styles from '\.\.\/(.*?)\/page\.module\.css';/g, (match, folder) => {
      const pageName = capitalize(folder) + 'Page';
      return `import styles from '../${pageName}.module.css';`;
  });

  return content;
}

function copyAndTransform(from, to) {
  if (!fs.existsSync(from)) return;
  let content = fs.readFileSync(from, 'utf-8');
  content = processContent(content, to);
  fs.writeFileSync(to, content);
}

function copyDirRecursive(src, dest, transform = false) {
  if (!fs.existsSync(src)) return;
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    let destName = entry.name;
    
    // Convert .js to .jsx
    if (transform && destName.endsWith('.js')) destName = destName.replace('.js', '.jsx');

    const destPath = path.join(dest, destName);

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDirRecursive(srcPath, destPath, transform);
    } else {
      if (transform && (srcPath.endsWith('.js') || srcPath.endsWith('.jsx'))) {
        copyAndTransform(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

// 1. Copy contexts, hooks, data, components
copyDirRecursive(path.join(srcBackup, 'context'), path.join(srcDir, 'context'), true);
copyDirRecursive(path.join(srcBackup, 'hooks'), path.join(srcDir, 'hooks'), true);
copyDirRecursive(path.join(srcBackup, 'data'), path.join(srcDir, 'data'), true);
copyDirRecursive(path.join(srcBackup, 'components'), path.join(srcDir, 'components'), true);

// 2. Map app/ pages to src/pages
const appDir = path.join(srcBackup, 'app');
if (fs.existsSync(appDir)) {
  const folders = fs.readdirSync(appDir, { withFileTypes: true });
  for (let folder of folders) {
    if (folder.isDirectory() && folder.name !== 'api') {
      const folderName = folder.name;
      const pageName = capitalize(folderName) + 'Page';
      
      const pageJsPath = path.join(appDir, folderName, 'page.js');
      if (fs.existsSync(pageJsPath)) {
        copyAndTransform(pageJsPath, path.join(srcDir, 'pages', `${pageName}.jsx`));
      }

      const cssPath = path.join(appDir, folderName, 'page.module.css');
      if (fs.existsSync(cssPath)) {
        fs.copyFileSync(cssPath, path.join(srcDir, 'pages', `${pageName}.module.css`));
      }
    }
  }
  // Root page
  if (fs.existsSync(path.join(appDir, 'page.js'))) {
    copyAndTransform(path.join(appDir, 'page.js'), path.join(srcDir, 'pages', 'HomePage.jsx'));
  }
  if (fs.existsSync(path.join(appDir, 'page.module.css'))) {
    fs.copyFileSync(path.join(appDir, 'page.module.css'), path.join(srcDir, 'pages', 'HomePage.module.css'));
  }
}

console.log('Migration script complete.');
