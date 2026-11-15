import fs from 'fs';
import path from 'path';

const files = [
  path.join(process.cwd(), 'preview', 'index.html'),
  path.join(process.cwd(), 'SseulDakGo_Web', 'Client', 'frontend', 'WEB-CLNT-COM-010000', 'index.jsx'),
  path.join(process.cwd(), 'preview_client', 'index.html')
];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let content = fs.readFileSync(f, 'utf8');

  // OAuth 2.0 (Project: sseuldakgo) </div> 바로 뒤에 </div> 추가
  content = content.replace(
    /(OAuth 2\.0 \(Project: sseuldakgo\)\s*<\/div>)(\s*<div className="bg-slate-50 p-4)/,
    `$1
              </div>$2`
  );

  fs.writeFileSync(f, content, 'utf8');
  console.log('Fixed google modal header in:', f);
}

