import fs from 'fs';

// Read job components directly from preview/job_020000.html
const jobHtml = fs.readFileSync('preview/job_020000.html', 'utf8');
const scriptStart = jobHtml.indexOf('<script type="text/babel">');
const scriptEnd = jobHtml.lastIndexOf('ReactDOM.createRoot');

if (scriptStart === -1 || scriptEnd === -1) {
  console.error('Could not locate script block in preview/job_020000.html');
  process.exit(1);
}

// Extract component definitions (everything between React import and ReactDOM render)
let jobComponentsCode = jobHtml.substring(scriptStart + '<script type="text/babel">'.length, scriptEnd);
jobComponentsCode = jobComponentsCode.replace('const { useState, useEffect } = React;', '');
jobComponentsCode = jobComponentsCode.replace('function WebSrvcJob020000Dashboard()', 'function WebSrvcJob020000({ currentUser, onNavigate, onLogout })');

// Change href="/" or href="/preview/..." inside WebSrvcJob020000 to onNavigate
jobComponentsCode = jobComponentsCode.replaceAll('href="/"', 'onClick={() => onNavigate?.("home")}');
jobComponentsCode = jobComponentsCode.replaceAll('href="/preview/job_020000"', 'onClick={() => onNavigate?.("WEB-SRVC-JOB-020000")}');
jobComponentsCode = jobComponentsCode.replaceAll('href="/preview/myp_010100"', 'onClick={() => onNavigate?.("WEB-CLNT-MYP-010100")}');
jobComponentsCode = jobComponentsCode.replaceAll('a href="#" onClick={() => alert', 'a onClick={() => alert');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Insert components before WebClntMyp010100
  if (!content.includes('function WebSrvcJob020000(')) {
    const target = 'function WebClntMyp010100({';
    content = content.replace(target, '\n' + jobComponentsCode + '\n\n    ' + target);
    console.log('Inserted WebSrvcJob020000 components in', filePath);
  }

  // 2. Add route condition for WEB-SRVC-JOB-020000
  const routeTarget = '// [신규] 내정보 (WEB-CLNT-MYP-010100) 화면 라우팅';
  const routeCode = `// [신규] 시공 파트너 현장 진행 현황 (WEB-SRVC-JOB-020000) 화면 라우팅
      if (activeNavPath && (activeNavPath === "WEB-SRVC-JOB-020000" || activeNavPath === "job-progress")) {
        return (
          <WebSrvcJob020000
            currentUser={userInfo}
            onLogout={() => {
              setUserInfo({
                isGuest: true,
                USER_NO: "GUEST",
                USER_NM: "비회원",
                USER_ROLE_CD: "GUEST",
              });
              setActiveNavPath("home");
            }}
            onNavigate={(path) => {
              if (path === 'home') {
                setActiveNavPath('home');
              } else {
                setActiveNavPath(path);
              }
            }}
          />
        );
      }

      // [신규] 내정보 (WEB-CLNT-MYP-010100) 화면 라우팅`;

  if (!content.includes('activeNavPath === "WEB-SRVC-JOB-020000"')) {
    content = content.replace(routeTarget, routeCode);
    console.log('Inserted route in', filePath);
  }

  // 3. Update buttons in myp_010100 to link to WEB-SRVC-JOB-020000
  content = content.replace(
    /onClick=\{\(\) => onNavigate\?\.?\('quotes'\)\}/g,
    "onClick={() => onNavigate?.(isContractor ? 'WEB-SRVC-JOB-020000' : 'quotes')}"
  );

  // 4. Update Section 5 header in WebClntMyp010100 to add "현장 진행 현황 바로가기" button
  const section5Target = `{isContractor ? '시공 파트너 현장 진행 현황' : '진행 중인 공간 케어 현황'}
                    </h2>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#006a61]">`;
  const section5Replacement = `{isContractor ? '시공 파트너 현장 진행 현황' : '진행 중인 공간 케어 현황'}
                    </h2>
                    {isContractor && (
                      <button
                        type="button"
                        onClick={() => onNavigate?.('WEB-SRVC-JOB-020000')}
                        className="ml-2 px-3 py-1 rounded-full bg-[#003d9b] hover:bg-[#002b6e] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                      >
                        <span>현장 진행 현황 바로가기</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </button>
                    )}
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#006a61]">`;

  if (content.includes(section5Target)) {
    content = content.replace(section5Target, section5Replacement);
    console.log('Updated Section 5 header in', filePath);
  }

  // 5. Update photo button in Section 5 of WebClntMyp010100
  const photoBtnTarget = `onClick={() => showToast('실시간 시공 갤러리(사진 8장)를 불러옵니다.')}`;
  const photoBtnReplacement = `onClick={() => isContractor ? onNavigate?.('WEB-SRVC-JOB-020000') : showToast('실시간 시공 갤러리(사진 8장)를 불러옵니다.')}`;
  if (content.includes(photoBtnTarget)) {
    content = content.replace(photoBtnTarget, photoBtnReplacement);
    console.log('Updated photo button in', filePath);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully saved', filePath);
}

updateFile('preview_client/index.html');
updateFile('preview/index.html');
updateFile('preview_client/WEB-CLNT-COM-010000.html');
