import fs from 'fs';
import path from 'path';

const files = [
  path.join(process.cwd(), 'preview', 'index.html'),
  path.join(process.cwd(), 'SseulDakGo_Web', 'Client', 'frontend', 'WEB-CLNT-COM-010000', 'index.jsx')
];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let content = fs.readFileSync(f, 'utf8');
  const wasCrlf = content.includes('\r\n');
  content = content.replace(/\r\n/g, '\n');

  // 1. NAVER 모달 본문 교체
  // <div className="text-center ... 네이버 개인정보 제3자 제공 동의 ... </div> 바로 다음부터
  // <div className="p-4 bg-white border-t border-slate-200 space-y-2"> 전까지 교체
  content = content.replace(
    /(네이버 개인정보 제3자 제공 동의[\s\S]*?<\/div>\s*<\/div>)([\s\S]*?)(<div className="p-4 bg-white border-t border-slate-200 space-y-2">)/,
    (m, p1, p2, p3) => {
      const newBody = `
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/60">
                  <span className="font-bold text-slate-700">제공 항목 (필수 연동 정보)</span>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    전체 동의 필수
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="font-medium text-slate-600">실명 (성명)</span>
                    <span className="font-bold text-slate-900">{naverModalProfile.name}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="font-medium text-slate-600">로그인 이메일</span>
                    <span className="font-bold text-slate-900">{naverModalProfile.email}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="font-medium text-slate-600">휴대전화번호</span>
                    <span className="font-bold text-slate-900">{naverModalProfile.mobile}</span>
                  </div>
                </div>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 leading-relaxed flex items-start gap-1.5">
                <span className="font-bold text-emerald-600">🔒</span>
                <span>네이버 실명인증으로 수신된 회원정보는 안전하게 자동 조립되며, 별도의 입력 없이 즉시 가입이 진행됩니다.</span>
              </div>
            </div>
            `;
      return p1 + newBody + p3;
    }
  );

  // 2. KAKAO 모달 본문 교체
  content = content.replace(
    /(카카오 개인정보 제3자 제공 동의[\s\S]*?<\/div>\s*<\/div>)([\s\S]*?)(<div className="p-4 bg-white border-t border-slate-200 space-y-2">)/,
    (m, p1, p2, p3) => {
      const newBody = `
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/60">
                  <span className="font-bold text-slate-700">제공 항목 (필수 연동 정보)</span>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    전체 동의 필수
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="font-medium text-slate-600">실명 (성명)</span>
                    <span className="font-bold text-slate-900">{kakaoModalProfile.name}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="font-medium text-slate-600">로그인 이메일</span>
                    <span className="font-bold text-slate-900">{kakaoModalProfile.email}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="font-medium text-slate-600">휴대전화번호</span>
                    <span className="font-bold text-slate-900">{kakaoModalProfile.mobile}</span>
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed flex items-start gap-1.5">
                <span className="font-bold text-amber-600">🔒</span>
                <span>카카오 인증으로 수신된 회원정보는 안전하게 자동 조립되며, 별도의 입력 없이 즉시 가입이 진행됩니다.</span>
              </div>
            </div>
            `;
      return p1 + newBody + p3;
    }
  );

  // 3. GOOGLE 모달 본문 교체
  content = content.replace(
    /(Google 개인정보 제공 동의[\s\S]*?OAuth 2\.0 \(Project: sseuldakgo\)\s*<\/div>\s*<\/div>)([\s\S]*?)(<div className="p-4 bg-white border-t border-slate-200 space-y-2">)/,
    (m, p1, p2, p3) => {
      const newBody = `
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/60">
                  <span className="font-bold text-slate-700">제공 항목 (필수 연동 정보)</span>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    전체 동의 필수
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="font-medium text-slate-600">실명 (성명)</span>
                    <span className="font-bold text-slate-900">{googleModalProfile.name}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="font-medium text-slate-600">로그인 이메일</span>
                    <span className="font-bold text-slate-900">{googleModalProfile.email}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="font-medium text-slate-600">휴대전화번호</span>
                    <span className="font-bold text-slate-900">{googleModalProfile.mobile}</span>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-[11px] text-blue-900 leading-relaxed flex items-start gap-1.5">
                <span className="font-bold text-blue-600">🔒</span>
                <span>Google 인증으로 수신된 회원정보는 안전하게 자동 조립되며, 별도의 입력 없이 즉시 가입이 진행됩니다.</span>
              </div>
            </div>
            `;
      return p1 + newBody + p3;
    }
  );

  // CRLF 복원
  if (wasCrlf) {
    content = content.replace(/\n/g, '\r\n');
  }
  fs.writeFileSync(f, content, 'utf8');
  console.log('Successfully replaced modals in:', f);
}

// preview_client 동기화
const src = path.join(process.cwd(), 'preview', 'index.html');
const dest = path.join(process.cwd(), 'preview_client', 'index.html');
if (fs.existsSync(dest)) {
  fs.copyFileSync(src, dest);
  console.log('Synchronized to preview_client/index.html');
}

