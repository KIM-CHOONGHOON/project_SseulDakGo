import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import os from 'os';

console.log('🔄 Building WEB-CLNT-COM-010000 for preview...');

const tempBuildDir = path.join(process.cwd(), '.temp_build');
if (!fs.existsSync(tempBuildDir)) {
  fs.mkdirSync(tempBuildDir, { recursive: true });
}

// 1. WEB-CLNT-COM-010000 컴파일
try {
  const tscPath = path.join(process.cwd(), 'node_modules', 'typescript', 'bin', 'tsc');
  execSync(`node "${tscPath}" SseulDakGo_Web/Client/frontend/WEB-CLNT-COM-010000/index.jsx --ignoreConfig --jsx react --target es2020 --module es2020 --outDir "${tempBuildDir}" --allowJs`, { stdio: 'inherit' });
} catch (e) {
  console.error('❌ TypeScript build error for WEB-CLNT-COM-010000:', e.message);
}

let code = fs.readFileSync(path.join(tempBuildDir, 'index.js'), 'utf8');

// Replace any import React from 'react' with window.React
code = code.replace(/import\s+React\s*,?\s*\{([^}]+)\}\s+from\s+['"]react['"];?/g, (match, hooks) => {
  return `const { ${hooks.trim()} } = window.React;\nconst React = window.React;`;
});
code = code.replace(/import\s+React\s+from\s+['"]react['"];?/g, 'const React = window.React;');

// Strip ES module exports so it can run as a standalone browser script
code = code.replace(/export\s+function\s+/g, 'function ');
code = code.replace(/export\s+const\s+/g, 'const ');
code = code.replace(/export\s+default\s+function\s+/g, 'function ');
code = code.replace(/export\s+default\s+/g, '');
code = code.replace(/export\s+\{[^}]+\};?/g, '');

code += `
if (typeof window !== 'undefined') {
  const MainComp = typeof WebClntCom010000 !== 'undefined' ? WebClntCom010000 : (typeof WebClntCom000 !== 'undefined' ? WebClntCom000 : null);
  window.WebClntCom000 = MainComp;
  window.WebClntCom010000 = MainComp;
  function mountApp() {
    const rootEl = document.getElementById('root');
    if (rootEl && window.ReactDOM && MainComp) {
      const root = window.ReactDOM.createRoot(rootEl);
      root.render(React.createElement(MainComp));
      console.log('✅ WEB-CLNT-COM-010000 React App successfully mounted!');
    } else {
      console.error('❌ Root element, ReactDOM or Component not found');
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountApp);
  } else {
    mountApp();
  }
}
`;

const wrappedWebCode = `(function() {\n${code}\n})();`;
fs.writeFileSync('preview/web_clnt_com_000.js', wrappedWebCode);
console.log('✅ Successfully generated preview/web_clnt_com_000.js:', fs.statSync('preview/web_clnt_com_000.js').size, 'bytes');

// 임시 빌드 디렉터리 정리
try {
  fs.rmSync(tempBuildDir, { recursive: true, force: true });
} catch (e) {}

console.log('🎉 Preview build completed successfully!');
