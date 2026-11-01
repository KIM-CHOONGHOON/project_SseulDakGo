import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

console.log('🔄 Building WEB-CLNT-COM-000 for preview...');

execSync('node_modules/.bin/tsc SseulDakGo_Web/Client/frontend/WEB-CLNT-COM-000/index.jsx --ignoreConfig --jsx react --target es2020 --module es2020 --outDir /tmp/preview-build --allowJs');

let code = fs.readFileSync('/tmp/preview-build/index.js', 'utf8');

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
  window.WebClntCom000 = WebClntCom000;
  window.WebClntReq000 = WebClntReq000;
  window.WebClntAth000 = WebClntAth000;
  window.WebClntAth010 = WebClntAth010;
  window.WebClntAth011 = WebClntAth011;
  window.WebClntOrd000 = WebClntOrd000;
  window.WebClntOrd001 = WebClntOrd001;
  window.WebClntPay000 = WebClntPay000;
  window.WebClntJob000 = WebClntJob000;
  function mountApp() {
    const rootEl = document.getElementById('root');
    if (rootEl && window.ReactDOM) {
      const root = window.ReactDOM.createRoot(rootEl);
      root.render(React.createElement(WebClntCom000));
      console.log('✅ WEB-CLNT-COM-000 React App successfully mounted!');
    } else {
      console.error('❌ Root element or ReactDOM not found');
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

// ============================================================================
// APP-CLNT-REQ-000 하이브리드 앱 청소 서비스 신청 스크린 빌드
// ============================================================================
console.log('🔄 Building APP-CLNT-REQ-000 Mobile App Screen for preview...');
execSync('node_modules/.bin/tsc SseulDakGo_App/Client/screens/APP-CLNT-REQ-000/index.tsx --ignoreConfig --jsx react --target es2020 --module es2020 --outDir /tmp/app-req-preview-build');

let reqCode = fs.readFileSync('/tmp/app-req-preview-build/index.js', 'utf8');
reqCode = reqCode.replace(/import\s+React\s*,?\s*\{([^}]+)\}\s+from\s+['"]react['"];?/g, (match, hooks) => {
  return `const { ${hooks.trim()} } = window.React;\nconst React = window.React;`;
});
reqCode = reqCode.replace(/import\s+React\s+from\s+['"]react['"];?/g, 'const React = window.React;');
reqCode = reqCode.replace(/export\s+function\s+/g, 'function ');
reqCode = reqCode.replace(/export\s+const\s+/g, 'const ');
reqCode = reqCode.replace(/export\s+default\s+function\s+/g, 'function ');
reqCode = reqCode.replace(/export\s+default\s+/g, '');
reqCode = reqCode.replace(/export\s+\{[^}]+\};?/g, '');

reqCode += `
if (typeof window !== 'undefined') {
  window.AppClntReq000 = AppClntReq000;
  console.log('✅ APP-CLNT-REQ-000 Mobile Screen registered to window.AppClntReq000');
}
`;

const wrappedReqCode = `(function() {\n${reqCode}\n})();`;
fs.writeFileSync('preview/app_clnt_req_000.js', wrappedReqCode);
console.log('✅ Successfully generated preview/app_clnt_req_000.js:', fs.statSync('preview/app_clnt_req_000.js').size, 'bytes');

// ============================================================================
// APP-CLNT-ATH-000 하이브리드 앱 고객/시공사 로그인 스크린 빌드
// ============================================================================
console.log('🔄 Building APP-CLNT-ATH-000 Mobile Login Screen for preview...');
execSync('node_modules/.bin/tsc SseulDakGo_App/Client/screens/APP-CLNT-ATH-000/index.tsx --ignoreConfig --jsx react --target es2020 --module es2020 --outDir /tmp/app-ath-preview-build');

let athCode = fs.readFileSync('/tmp/app-ath-preview-build/index.js', 'utf8');
athCode = athCode.replace(/import\s+React\s*,?\s*\{([^}]+)\}\s+from\s+['"]react['"];?/g, (match, hooks) => {
  return `const { ${hooks.trim()} } = window.React;\nconst React = window.React;`;
});
athCode = athCode.replace(/import\s+React\s+from\s+['"]react['"];?/g, 'const React = window.React;');
athCode = athCode.replace(/export\s+function\s+/g, 'function ');
athCode = athCode.replace(/export\s+const\s+/g, 'const ');
athCode = athCode.replace(/export\s+default\s+function\s+/g, 'function ');
athCode = athCode.replace(/export\s+default\s+/g, '');
athCode = athCode.replace(/export\s+\{[^}]+\};?/g, '');

athCode += `
if (typeof window !== 'undefined') {
  window.AppClntAth000 = AppClntAth000;
  console.log('✅ APP-CLNT-ATH-000 Mobile Screen registered to window.AppClntAth000');
}
`;

const wrappedAthCode = `(function() {\n${athCode}\n})();`;
fs.writeFileSync('preview/app_clnt_ath_000.js', wrappedAthCode);
console.log('✅ Successfully generated preview/app_clnt_ath_000.js:', fs.statSync('preview/app_clnt_ath_000.js').size, 'bytes');

// ============================================================================
// APP-CLNT-ATH-010 하이브리드 앱 통합 회원가입 및 약관동의 스크린 빌드
// ============================================================================
console.log('🔄 Building APP-CLNT-ATH-010 Mobile Register Screen for preview...');
execSync('node_modules/.bin/tsc SseulDakGo_App/Client/screens/APP-CLNT-ATH-010/index.tsx --ignoreConfig --jsx react --target es2020 --module es2020 --outDir /tmp/app-ath010-preview-build');

let ath010Code = fs.readFileSync('/tmp/app-ath010-preview-build/index.js', 'utf8');
ath010Code = ath010Code.replace(/import\s+React\s*,?\s*\{([^}]+)\}\s+from\s+['"]react['"];?/g, (match, hooks) => {
  return `const { ${hooks.trim()} } = window.React;\nconst React = window.React;`;
});
ath010Code = ath010Code.replace(/import\s+React\s+from\s+['"]react['"];?/g, 'const React = window.React;');
ath010Code = ath010Code.replace(/export\s+function\s+/g, 'function ');
ath010Code = ath010Code.replace(/export\s+const\s+/g, 'const ');
ath010Code = ath010Code.replace(/export\s+default\s+function\s+/g, 'function ');
ath010Code = ath010Code.replace(/export\s+default\s+/g, '');
ath010Code = ath010Code.replace(/export\s+\{[^}]+\};?/g, '');

ath010Code += `
if (typeof window !== 'undefined') {
  window.AppClntAth010 = AppClntAth010;
  console.log('✅ APP-CLNT-ATH-010 Mobile Screen registered to window.AppClntAth010');
}
`;

const wrappedAth010Code = `(function() {\n${ath010Code}\n})();`;
fs.writeFileSync('preview/app_clnt_ath_010.js', wrappedAth010Code);
console.log('✅ Successfully generated preview/app_clnt_ath_010.js:', fs.statSync('preview/app_clnt_ath_010.js').size, 'bytes');

// ============================================================================
// APP-CLNT-ATH-011 하이브리드 앱 고객 가입 환영 / 회원정보 / 약관 및 서명 관리 스크린 빌드
// ============================================================================
console.log('🔄 Building APP-CLNT-ATH-011 Mobile Welcome & Terms Management Screen for preview...');
execSync('node_modules/.bin/tsc SseulDakGo_App/Client/screens/APP-CLNT-ATH-011/index.tsx --ignoreConfig --jsx react --target es2020 --module es2020 --outDir /tmp/app-ath011-preview-build');

let ath011Code = fs.readFileSync('/tmp/app-ath011-preview-build/index.js', 'utf8');
ath011Code = ath011Code.replace(/import\s+React\s*,?\s*\{([^}]+)\}\s+from\s+['"]react['"];?/g, (match, hooks) => {
  return `const { ${hooks.trim()} } = window.React;\nconst React = window.React;`;
});
ath011Code = ath011Code.replace(/import\s+React\s+from\s+['"]react['"];?/g, 'const React = window.React;');
ath011Code = ath011Code.replace(/export\s+function\s+/g, 'function ');
ath011Code = ath011Code.replace(/export\s+const\s+/g, 'const ');
ath011Code = ath011Code.replace(/export\s+default\s+function\s+/g, 'function ');
ath011Code = ath011Code.replace(/export\s+default\s+/g, '');
ath011Code = ath011Code.replace(/export\s+\{[^}]+\};?/g, '');

ath011Code += `
if (typeof window !== 'undefined') {
  window.AppClntAth011 = AppClntAth011;
  console.log('✅ APP-CLNT-ATH-011 Mobile Screen registered to window.AppClntAth011');
}
`;

const wrappedAth011Code = `(function() {\n${ath011Code}\n})();`;
fs.writeFileSync('preview/app_clnt_ath_011.js', wrappedAth011Code);
console.log('✅ Successfully generated preview/app_clnt_ath_011.js:', fs.statSync('preview/app_clnt_ath_011.js').size, 'bytes');

// ============================================================================
// APP-CLNT-COM-000 하이브리드 앱 모바일 스크린 빌드
// ============================================================================
console.log('🔄 Building APP-CLNT-COM-000 Mobile App for preview...');
execSync('node_modules/.bin/tsc SseulDakGo_App/Client/screens/APP-CLNT-COM-000/index.tsx --ignoreConfig --jsx react --target es2020 --module es2020 --outDir /tmp/app-preview-build');

let appCode = fs.readFileSync('/tmp/app-preview-build/index.js', 'utf8');
appCode = appCode.replace(/import\s+React\s*,?\s*\{([^}]+)\}\s+from\s+['"]react['"];?/g, (match, hooks) => {
  return `const { ${hooks.trim()} } = window.React;\nconst React = window.React;`;
});
appCode = appCode.replace(/import\s+React\s+from\s+['"]react['"];?/g, 'const React = window.React;');
appCode = appCode.replace(/export\s+function\s+/g, 'function ');
appCode = appCode.replace(/export\s+const\s+/g, 'const ');
appCode = appCode.replace(/export\s+default\s+function\s+/g, 'function ');
appCode = appCode.replace(/export\s+default\s+/g, '');
appCode = appCode.replace(/export\s+\{[^}]+\};?/g, '');

appCode += `
if (typeof window !== 'undefined') {
  window.AppClntCom000 = AppClntCom000;
  function mountMobileApp() {
    const rootEl = document.getElementById('root');
    if (rootEl && window.ReactDOM && window.React) {
      const isReqScreen = window.location.pathname.includes('/req_000') || window.location.search.includes('screen=req');
      const isRegisterScreen = window.location.search.includes('screen=register') || window.location.search.includes('screen=ath_010');
      let TargetComponent = window.AppClntCom000;
      if (isReqScreen && window.AppClntReq000) TargetComponent = window.AppClntReq000;
      if (isRegisterScreen && window.AppClntAth010) TargetComponent = window.AppClntAth010;
      const root = window.ReactDOM.createRoot(rootEl);
      root.render(window.React.createElement(TargetComponent));
      console.log('✅ Mounted component:', TargetComponent?.name || 'Mobile App');
    } else {
      console.error('❌ Root element or ReactDOM not found');
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountMobileApp);
  } else {
    mountMobileApp();
  }
}
`;

const wrappedAppCode = `(function() {\n${appCode}\n})();`;
fs.writeFileSync('preview/app_clnt_com_000.js', wrappedAppCode);
console.log('✅ Successfully generated preview/app_clnt_com_000.js:', fs.statSync('preview/app_clnt_com_000.js').size, 'bytes');


