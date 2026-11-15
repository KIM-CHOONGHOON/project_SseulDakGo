import fs from 'fs';
import path from 'path';

const files = [
  path.join(process.cwd(), 'preview', 'index.html'),
  path.join(process.cwd(), 'SseulDakGo_Web', 'Client', 'frontend', 'WEB-CLNT-COM-010000', 'index.jsx')
];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/\r\n/g, '\n');

  // 1. 이메일 input 스타일
  content = content.replace(
    /className="w-full h-12 px-3\.5 bg-surface-container-lowest text-on-surface placeholder:text-outline rounded-xl font-body-md text-body-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary\/20 shadow-sm"/,
    'className={`w-full h-12 px-3.5 rounded-xl font-body-md text-body-md border border-slate-200 shadow-sm ${socialProvider ? \'bg-slate-100 text-slate-700 cursor-not-allowed font-medium\' : \'bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20\'}`}'
  );

  // 2. 성명 input 스타일
  content = content.replace(
    /className="w-full h-12 px-3\.5 bg-surface-container-lowest text-on-surface placeholder:text-slate-400 placeholder:opacity-60 focus:placeholder-transparent rounded-xl font-body-md text-body-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary\/20 shadow-sm transition-all"/,
    'className={`w-full h-12 px-3.5 rounded-xl font-body-md text-body-md border border-slate-200 shadow-sm transition-all ${socialProvider ? \'bg-slate-100 text-slate-700 cursor-not-allowed font-medium\' : \'bg-surface-container-lowest text-on-surface placeholder:text-slate-400 placeholder:opacity-60 focus:placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primary/20\'}`}'
  );

  // 3. 전화번호 input 스타일 & 레이블
  content = content.replace(
    /className="w-full h-12 px-3\.5 bg-surface-container-lowest text-on-surface placeholder:text-slate-400 placeholder:opacity-60 focus:placeholder-transparent rounded-xl font-body-md text-body-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary\/20 shadow-sm transition-all"/,
    'className={`w-full h-12 px-3.5 rounded-xl font-body-md text-body-md border border-slate-200 shadow-sm transition-all ${socialProvider ? \'bg-slate-100 text-slate-700 cursor-not-allowed font-medium\' : \'bg-surface-container-lowest text-on-surface placeholder:text-slate-400 placeholder:opacity-60 focus:placeholder-transparent focus:outline-none focus:ring-2 focus:ring-secondary/20\'}`}'
  );

  content = content.replace(
    /<span className="text-secondary font-label-sm text-label-sm font-semibold">알리고 SMS \/ 본인확인<\/span>/,
    `<div className="flex items-center gap-2">
                {socialProvider && (
                  <span className="text-[11px] text-slate-500 font-bold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[13px]">lock</span>
                    SNS 연동 (수정 불가)
                  </span>
                )}
                <span className="text-secondary font-label-sm text-label-sm font-semibold">알리고 SMS / 본인확인</span>
              </div>`
  );

  content = content.replace(/\n/g, '\r\n');
  fs.writeFileSync(f, content, 'utf8');
  console.log(`Updated input styling in: ${f}`);
}

// preview_client 동기화
if (fs.existsSync('preview/index.html') && fs.existsSync('preview_client/index.html')) {
  fs.copyFileSync('preview/index.html', 'preview_client/index.html');
  console.log('Synced to preview_client/index.html');
}
