import fs from 'fs';
import path from 'path';
import { COMPREHENSIVE_ADDRESS_DB } from '../lib/naver-map.js';

const ROOT_DIR = process.cwd();
const PREVIEW_DIR = path.join(ROOT_DIR, 'preview_client');
const FRONTEND_DIR = path.join(ROOT_DIR, 'SseulDakGo_Web', 'Client', 'frontend');

if (!fs.existsSync(PREVIEW_DIR)) {
  fs.mkdirSync(PREVIEW_DIR, { recursive: true });
}

// 로고 에셋 복사
const logoSrc = path.join(ROOT_DIR, 'public', 'logo.png');
const logoDest = path.join(PREVIEW_DIR, 'logo.png');
if (fs.existsSync(logoSrc)) {
  fs.copyFileSync(logoSrc, logoDest);
}

const SCREENS = [
  {
    id: 'WEB-CLNT-COM-010000',
    title: '고객 메인 홈',
    category: 'Main 화면',
    folder: 'WEB-CLNT-COM-010000',
    mainComponent: 'WebClntCom010000',
    isModal: false,
    desc: '3대 청소 선택 카드 및 실시간 접수 피드 표출, 청소 요청 등록 진입'
  },
  {
    id: 'WEB-CLNT-REQ-010100',
    title: '청소 서비스 신청 (발주서 작성)',
    category: 'Sub 화면 (모달)',
    folder: 'WEB-CLNT-REQ-010100',
    mainComponent: 'WebClntReq010100Modal',
    isModal: true,
    desc: '3대 탭(정기/입주/가전), 현장 주소 검색, 고객 확정 지정가 입력'
  },
  {
    id: 'WEB-CLNT-REQ-010101',
    title: '동일 시공 주소 확인 및 변경 안내',
    category: 'Sub 화면 (모달)',
    folder: 'WEB-CLNT-REQ-010101',
    mainComponent: 'WebClntReq010101Modal',
    isModal: true,
    desc: '정기/입주/가전 탭 간 동일 주소 중복 감지 시 계속 등록 여부 확인 및 탭별 주소 변경 모달'
  },
  {
    id: 'WEB-CLNT-ATH-010100',
    title: '고객 로그인',
    category: 'Sub 화면 (모달)',
    folder: 'WEB-CLNT-ATH-010100',
    mainComponent: 'WebClntAth010100',
    isModal: true,
    desc: '이메일/비밀번호 로그인, 소셜 간편로그인, 임시 발주 데이터 복원'
  },
  {
    id: 'WEB-CLNT-ATH-010200',
    title: '통합 회원가입 및 약관동의 서명',
    category: 'Sub 화면 (모달)',
    folder: 'WEB-CLNT-ATH-010200',
    mainComponent: 'WebClntAth010200',
    isModal: true,
    desc: '본인확인, 4대 필수약관 100% 스크롤 동의, 자필 캔버스 전자서명'
  },
  {
    id: 'WEB-CLNT-ATH-010201',
    title: '고객 가입 완료 환영 안내',
    category: 'Sub 화면 (모달)',
    folder: 'WEB-CLNT-ATH-010201',
    mainComponent: 'WebClntAth010201',
    isModal: true,
    desc: '가입 환영 메시지 및 즉시 첫 청소 요청 신청 유도'
  },
  {
    id: 'WEB-CLNT-ORD-010000',
    title: '나의 청소 신청 현황',
    category: 'Main 화면',
    folder: 'WEB-CLNT-ORD-010000',
    mainComponent: 'WebClntOrd010000',
    isModal: false,
    desc: '발주 오더 진행 상태 라이프사이클, 7일 청약 만료 타이머 표출'
  },
  {
    id: 'WEB-CLNT-ORD-010100',
    title: '청소 요청 상세 및 청약서 비교/선택',
    category: 'Sub 화면',
    folder: 'WEB-CLNT-ORD-010100',
    mainComponent: 'WebClntOrd010100',
    isModal: false,
    desc: '접수된 파트너들의 제안 일정, 투입인원, 장비 어필 비교 후 1인 선택'
  },
  {
    id: 'WEB-CLNT-PAY-010100',
    title: '고객 데이터 이용료 결제 및 계약 확정',
    category: 'Sub 화면 (모달)',
    folder: 'WEB-CLNT-PAY-010100',
    mainComponent: 'WebClntPay010100',
    isModal: true,
    desc: '매칭 수수료(16,500원~) 전자결제 및 배타적 단일 계약 체결'
  },
  {
    id: 'WEB-CLNT-JOB-010100',
    title: '청소 시공 검수 및 현장 직불 완료 승인',
    category: 'Sub 화면',
    folder: 'WEB-CLNT-JOB-010100',
    mainComponent: 'WebClntJob010100',
    isModal: false,
    desc: '시공 전/후 사진 갤러리 열람, 작업 완료 승인 및 현장 직불 안내'
  }
];

// HTML 템플릿 생성기
function generateHtmlPage(screen, transformedCode) {
  const mountScript = screen.isModal
    ? `
      function AppWrapper() {
        const [isOpen, setIsOpen] = React.useState(true);
        return (
          <div className="min-h-screen bg-slate-900/30 flex flex-col items-center justify-center p-4">
            {!isOpen && (
              <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md w-full border border-slate-200">
                <div className="w-16 h-16 bg-blue-50 text-[#1F497D] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">${screen.title}</h3>
                <p className="text-sm text-slate-500 mb-6">모달이 닫힌 상태입니다. 아래 버튼을 눌러 다시 열 수 있습니다.</p>
                <button
                  onClick={() => setIsOpen(true)}
                  className="w-full py-3 bg-[#1F497D] text-white font-bold rounded-xl shadow hover:bg-[#16365c] transition-all"
                >
                  [${screen.id}] 모달 다시 열기
                </button>
              </div>
            )}
            <${screen.mainComponent} 
              isOpen={isOpen} 
              onClose={() => setIsOpen(false)}
              onSuccessLogin={() => alert('로그인 성공 이벤트 감지')}
              onNavigate={(url) => console.log('Navigate to:', url)}
              duplicateTabs={['REGULAR', 'MOVEIN']}
              tabAddresses={{
                REGULAR: { addrText: '경기 고양시 일산동구 마두동 802-1', addrDetail: '삼혜빌딩 4층 402호' },
                MOVEIN: { addrText: '경기 고양시 일산동구 마두동 802-1', addrDetail: '삼혜빌딩 4층 402호' },
                APPLIANCE: { addrText: '경기 고양시 일산동구 마두동 802-1', addrDetail: '삼혜빌딩 4층 402호' },
              }}
              onConfirmContinue={() => alert('[네 (계속 등록)] 클릭 감지: 동일 주소로 발주 등록 계속 진행')}
              onSelectChangeTab={(t) => alert('[주소 변경 탭 선택] 감지: ' + t + ' 탭 주소 검색 실행')}
            />
          </div>
        );
      }
      ReactDOM.createRoot(document.getElementById('root')).render(<AppWrapper />);
    `
    : `
      function AppWrapper() {
        return (
          <div className="min-h-screen bg-[#F8FAFC]">
            <${screen.mainComponent} onNavigate={(url) => console.log('Navigate to:', url)} />
          </div>
        );
      }
      ReactDOM.createRoot(document.getElementById('root')).render(<AppWrapper />);
    `;

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>[${screen.id}] ${screen.title} - 쓸고닦고 프리뷰</title>
  <link rel="icon" type="image/png" href="logo.png"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""/>
  <link href="https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet"/>
  
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          colors: {
            primary: "#1F497D",
            navy: "#1F497D",
            teal: "#0D9488",
            action: "#0D9488",
            alert: "#EF4444",
            warning: "#F59E0B",
            success: "#10B981"
          },
          fontFamily: {
            sans: ["Pretendard", "Inter", "-apple-system", "sans-serif"]
          }
        }
      }
    };
  </script>
  
  <!-- React 18 & ReactDOM -->
  <script src="https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.production.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
  <!-- Babel Standalone (JSX 실행 지원) -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <!-- Daum 주소 검색 SDK (https 명시로 file:/// 로컬 뷰어 호환) -->
  <script src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>

  <!-- [네이버 주소 검색 클라이언트 엔진 & 모의 백엔드 인터셉터] -->
  <script>
    window.COMPREHENSIVE_ADDRESS_DB = ${JSON.stringify(COMPREHENSIVE_ADDRESS_DB)};
    window.searchNaverAddressClient = function(query) {
      const rawTrimmed = String(query || '').trim();
      if (!rawTrimmed) return [];
      const compactQ = rawTrimmed.replace(/[\\s\\-_,.]+/g, '').toLowerCase();

      const poiExact = [];
      const poiPartial = [];
      for (const item of window.COMPREHENSIVE_ADDRESS_DB) {
        const compactBld = (item.bldNm || '').replace(/[\\s\\-_,.]+/g, '').toLowerCase();
        const compactRoad = (item.roadAddress || '').replace(/[\\s\\-_,.]+/g, '').toLowerCase();
        const compactJibun = (item.jibunAddress || '').replace(/[\\s\\-_,.]+/g, '').toLowerCase();
        if (compactBld.includes(compactQ) || compactQ.includes(compactBld)) {
          poiExact.push(item);
        } else if (compactRoad.includes(compactQ) || compactJibun.includes(compactQ)) {
          poiPartial.push(item);
        }
      }

      const tokens = rawTrimmed.toLowerCase().split(/\\s+/).filter(Boolean);
      const tokenMatched = window.COMPREHENSIVE_ADDRESS_DB.filter((item) => {
        const fullText = (item.roadAddress + ' ' + (item.jibunAddress || '') + ' ' + (item.bldNm || '') + ' ' + item.dong + ' ' + item.sigungu + ' ' + item.sido).toLowerCase();
        return tokens.every((token) => fullText.includes(token)) ||
          tokens.some((token) => token.length >= 2 && (
            (item.bldNm && item.bldNm.toLowerCase().includes(token)) ||
            item.roadAddress.toLowerCase().includes(token) ||
            (item.jibunAddress && item.jibunAddress.toLowerCase().includes(token)) ||
            item.dong.toLowerCase().includes(token)
          ));
      });

      const combined = [...poiExact, ...poiPartial, ...tokenMatched];
      const seen = new Set();
      const result = [];
      for (const it of combined) {
        const key = it.roadAddress + '_' + it.bldNm;
        if (!seen.has(key)) {
          seen.add(key);
          result.push(it);
        }
      }
      return result;
    };

    // Global fetch interceptor for standalone preview (Chrome local viewing)
    (function() {
      const originalFetch = window.fetch;
      window.fetch = async function(url, options) {
        const urlStr = String(url || '');

        // 1. 네이버 주소 검색 목업 인터셉트
        if (urlStr.includes('/api/web/client/search_address') || (urlStr.includes('/api/web/client/com_010000') && options?.body && String(options.body).includes('SEARCH_NAVER_ADDRESS'))) {
          try {
            const body = options?.body ? JSON.parse(options.body) : {};
            const q = body.query || body.keyword || '';
            const items = window.searchNaverAddressClient(q);
            return new Response(JSON.stringify({
              success: true,
              provider: 'NAVER_MAPS_GEOCODE_LOCAL',
              query: q,
              total: items.length,
              items: items
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          } catch (e) {
            console.warn('Address mock fetch error:', e);
          }
        }

        // 2. 실제 백엔드 API 우선 호출 (실제 MySQL DB TB_USER 반영)
        // (오프라인 / 단독 프리뷰 환경일 때만 catch 블록에서 모의 폴백 실행)

        // 4. 청소 서비스 신청 발주 등록 (/api/web/client/req_010100)
        if (urlStr.includes('/api/web/client/req_010100')) {
          try {
            const orderNo = 'ORD-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);
            return new Response(JSON.stringify({
              success: true,
              code: 'OK',
              orderNo: orderNo,
              message: '청소 서비스 신청 및 확정 발주서 작성이 성공적으로 접수되었습니다.'
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          } catch (e) {
            console.warn('req_010100 mock error:', e);
          }
        }

        // 5. 결제 승인 (/api/web/client/pay_010100)
        if (urlStr.includes('/api/web/client/pay_010100')) {
          try {
            return new Response(JSON.stringify({
              success: true,
              code: 'OK',
              paymentId: 'PAY-' + Date.now(),
              message: '데이터 이용료 결제 및 배타적 단일 계약 체결이 완료되었습니다.'
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          } catch (e) {
            console.warn('pay_010100 mock error:', e);
          }
        }

        // 6. 시공 검수 완료 승인 (/api/web/client/job_010100)
        if (urlStr.includes('/api/web/client/job_010100')) {
          try {
            return new Response(JSON.stringify({
              success: true,
              code: 'OK',
              message: '청소 시공 검수 및 현장 직불 완료 승인이 처리되었습니다.'
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          } catch (e) {
            console.warn('job_010100 mock error:', e);
          }
        }

        // 7. 가입 환영 안내 (/api/web/client/ath_010201)
        if (urlStr.includes('/api/web/client/ath_010201') || urlStr.includes('/api/web/client/ath_010200201')) {
          return new Response(JSON.stringify({
            success: true,
            code: 'OK',
            data: {
              userNo: 'C202611130001',
              userNm: '홍길동',
              userEmail: 'hong.gd@example.com',
              userRoleCd: 'CUSTOMER'
            }
          }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        // 실제 fetch 시도 (서버가 띄워져 있는 환경용 - file:/// 환경에서는 http://localhost:3000로 프록시)
        try {
          let reqUrl = url;
          if (typeof url === 'string' && url.startsWith('/') && window.location.protocol === 'file:') {
            reqUrl = 'http://localhost:3000' + url;
          }
          return await originalFetch(reqUrl, options);
        } catch (err) {
          if (urlStr.includes('/api/web/client/ath_010100')) {
            console.warn('[PREVIEW_FALLBACK] Backend server offline, returning smart auth fallback for:', urlStr);
            try {
              const body = options?.body ? JSON.parse(options.body) : {};
              const email = (body.userEmail || '').toLowerCase();
              let savedUser = null;
              try {
                savedUser = JSON.parse(localStorage.getItem('SSEULDAKGO_AUTH_USER') || 'null');
              } catch (e) {}

              // 방금 가입한 김충훈님 계정(chunggiwa@naver.com) 또는 로컬스토리지 저장 계정 검증
              if (email.includes('chunggiwa') || (savedUser && savedUser.userEmail && savedUser.userEmail.toLowerCase() === email)) {
                const targetUser = savedUser || {
                  userNo: 'C20261100001',
                  userNm: '김충훈',
                  userEmail: 'chunggiwa@naver.com',
                  userRoleCd: 'C'
                };
                return new Response(JSON.stringify({
                  success: true,
                  isNewUser: false,
                  code: 'OK',
                  data: targetUser,
                  message: '네이버 연동 계정으로 로그인되었습니다.'
                }), { status: 200, headers: { 'Content-Type': 'application/json' } });
              }
            } catch (authFallbackErr) {
              console.warn('Auth fallback error:', authFallbackErr);
            }
          }

          if (urlStr.includes('/api/web/client/')) {
            console.warn('[PREVIEW_FALLBACK] Backend server offline, returning mock response for:', urlStr);
            return new Response(JSON.stringify({
              success: true,
              code: 'OK',
              message: '로컬 크롬 프리뷰 오프라인 모의 응답이 성공적으로 반환되었습니다.',
              data: { status: 'MOCK_SUCCESS' }
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          throw err;
        }
      };
    })();
  </script>

  <style>
    body { font-family: 'Pretendard', 'Inter', sans-serif; margin: 0; padding: 0; }
    /* 스크롤바 미려하게 처리 */
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: #F1F5F9; }
    ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
  </style>
</head>
<body class="bg-[#F8FAFC] text-[#0F172A] antialiased">
  <div id="root"></div>

  <script type="text/babel">
    ${transformedCode}

    ${mountScript}
  </script>
</body>
</html>`;
}

// 개별 화면 HTML 생성 루프
console.log('🚀 [Preview Client] 9개 고객 화면 HTML 생성 시작...');

for (const screen of SCREENS) {
  const jsxPath = path.join(ROOT_DIR, 'SseulDakGo_Web', 'Client', 'frontend', screen.folder, 'index.jsx');
  if (!fs.existsSync(jsxPath)) {
    console.warn(`⚠️ [NOT_FOUND] ${jsxPath}`);
    continue;
  }

  let code = fs.readFileSync(jsxPath, 'utf8');

  // React import 구문 변환
  code = code.replace(/import\s+React\s*,\s*\{([^}]+)\}\s+from\s+['"]react['"];?/g, (match, hooks) => {
    return `const { ${hooks.trim()} } = React;\nconst ReactHooks = { ${hooks.trim()} };`;
  });
  code = code.replace(/import\s+React\s+from\s+['"]react['"];?/g, '// React loaded via window.React');

  // 외부 컴포넌트 import 처리 (WEB-CLNT-ORD-001)
  code = code.replace(/import\s+WebClntPay000\s+from\s+['"][^'"]+['"];?/g, `
    // Mock WebClntPay000
    const WebClntPay000 = ({ isOpen, onClose }) => isOpen ? (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl max-w-md w-full text-center shadow-xl">
          <h3 className="text-lg font-bold text-[#1F497D] mb-2">[WEB-CLNT-PAY-000] 결제 모달</h3>
          <p className="text-sm text-slate-600 mb-4">데이터 이용료 결제 모달 연동 프리뷰입니다.</p>
          <button onClick={onClose} className="px-4 py-2 bg-[#1F497D] text-white rounded-lg font-bold">닫기</button>
        </div>
      </div>
    ) : null;
  `);

  // 외부 서브모달 import 처리 (WEB-CLNT-REQ-010101)
  code = code.replace(/import\s+(?:WebClntReq010101Modal|\{[^}]*\})\s+from\s+['"][^'"]*WEB-CLNT-REQ-010101[^'"]*['"];?/g, () => {
    const subModalPath = path.join(FRONTEND_DIR, 'WEB-CLNT-REQ-010101', 'index.jsx');
    if (fs.existsSync(subModalPath)) {
      let subCode = fs.readFileSync(subModalPath, 'utf8');
      subCode = subCode.replace(/import\s+React[^\n]*;/g, '');
      subCode = subCode.replace(/export\s+default\s+function\s+/g, 'function ');
      subCode = subCode.replace(/export\s+function\s+/g, 'function ');
      subCode = subCode.replace(/export\s+const\s+/g, 'const ');
      subCode = subCode.replace(/export\s+default\s+([^;]+);?/g, '');
      return `\n// --- [EMBEDDED SUB-MODAL WEB-CLNT-REQ-010101] ---\n${subCode}\n`;
    }
    return '';
  });

  // export 구문 변환 (일반 함수로 전환)
  code = code.replace(/export\s+default\s+function\s+/g, 'function ');
  code = code.replace(/export\s+function\s+/g, 'function ');
  code = code.replace(/export\s+const\s+/g, 'const ');
  code = code.replace(/export\s+default\s+([^;]+);?/g, '// export default $1');
  code = code.replace(/export\s+\{[^}]+\};?/g, '');

  const htmlContent = generateHtmlPage(screen, code);
  const outPath = path.join(PREVIEW_DIR, `${screen.id}.html`);
  fs.writeFileSync(outPath, htmlContent, 'utf8');
  console.log(`✅ [CREATED] ${screen.id}.html (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
}

// ----------------------------------------------------------------------------
// 통합 대시보드 네비게이터 (index.html) 생성
// ----------------------------------------------------------------------------
const indexHtmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>쓸고닦고 (SseulDakGo) - Client 웹 프론트엔드 통합 크롬 프리뷰어</title>
  <link rel="icon" type="image/png" href="logo.png"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""/>
  <link href="https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet"/>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif; }
    .screen-tab.active {
      background-color: #1F497D;
      color: #FFFFFF;
      font-weight: 700;
      border-color: #1F497D;
      box-shadow: 0 4px 6px -1px rgba(31, 73, 125, 0.2);
    }
    .device-btn.active {
      background-color: #0F172A;
      color: #FFFFFF;
    }
  </style>
</head>
<body class="bg-slate-100 h-screen flex flex-col overflow-hidden text-slate-800">

  <!-- 최상단 헤더 네비게이션 바 -->
  <header class="bg-white border-b border-slate-200 shadow-sm shrink-0 z-30">
    <div class="px-6 py-3 flex items-center justify-between">
      <!-- 좌측: 브랜드 로고 및 타이틀 -->
      <div class="flex items-center gap-3">
        <img src="logo.png" alt="쓸고닦고 로고" class="h-8 object-contain" onerror="this.style.display='none'"/>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold px-2 py-0.5 bg-blue-100 text-[#1F497D] rounded-full">Client Web</span>
            <h1 class="text-lg font-extrabold text-[#1F497D] tracking-tight">쓸고닦고 프론트엔드 프리뷰어</h1>
          </div>
          <p class="text-xs text-slate-400">총 9개 고객 전용 화면 실시간 크롬 뷰어</p>
        </div>
      </div>

      <!-- 우측: 뷰포트 디바이스 해상도 전환 & 새창 열기 버튼 -->
      <div class="flex items-center gap-3">
        <div class="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200 text-xs">
          <button id="devDesktop" onclick="setDevice('100%')" class="device-btn active px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">desktop_windows</span>
            <span>데스크톱 (Full)</span>
          </button>
          <button id="devTablet" onclick="setDevice('768px')" class="device-btn px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 text-slate-600 hover:text-slate-900">
            <span class="material-symbols-outlined text-[16px]">tablet</span>
            <span>태블릿 (768px)</span>
          </button>
          <button id="devMobile" onclick="setDevice('390px')" class="device-btn px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 text-slate-600 hover:text-slate-900">
            <span class="material-symbols-outlined text-[16px]">smartphone</span>
            <span>모바일 (390px)</span>
          </button>
        </div>

        <a id="btnNewTab" href="${SCREENS[0].id}.html" target="_blank" class="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-sm text-slate-700">
          <span>단독 새 탭 열기</span>
          <span class="material-symbols-outlined text-[14px]">open_in_new</span>
        </a>
      </div>
    </div>

    <!-- 하단 탭 버튼 목록 (9개 화면) -->
    <div class="px-6 py-2 bg-slate-50/80 border-t border-slate-200/60 overflow-x-auto flex items-center gap-2 scrollbar-none">
      ${SCREENS.map((s, idx) => `
        <button
          onclick="loadScreen('${s.id}', this)"
          class="screen-tab ${idx === 0 ? 'active' : 'bg-white text-slate-600 hover:bg-slate-100'} px-3.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 transition-all shrink-0 flex items-center gap-1.5"
          title="${s.title}"
        >
          <span class="text-[11px] font-mono font-bold opacity-70">${s.id.replace('WEB-CLNT-', '')}</span>
          <span>${s.title.split(' ')[0]}</span>
          ${s.isModal ? '<span class="text-[9px] px-1 py-0.2 bg-amber-100 text-amber-700 rounded font-bold">모달</span>' : ''}
        </button>
      `).join('')}
    </div>
  </header>

  <!-- 메인 뷰포트 영역 (iframe 컨테이너) -->
  <main class="flex-1 bg-slate-200/80 p-4 flex items-center justify-center overflow-hidden">
    <div id="viewportContainer" class="w-full h-full bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 border border-slate-300/80 flex flex-col">
      <!-- 프레임 상단 주소 바 표시창 -->
      <div class="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <div class="flex items-center gap-2">
          <div class="flex gap-1.5">
            <div class="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
            <div class="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
            <div class="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
          </div>
          <span id="currentTitle" class="font-bold text-slate-800 ml-2">${SCREENS[0].title}</span>
          <span id="currentId" class="text-slate-400 font-mono text-[11px]">(${SCREENS[0].id})</span>
        </div>
        <div id="currentDesc" class="text-[11px] text-slate-500 truncate max-w-xl">
          ${SCREENS[0].desc}
        </div>
      </div>

      <!-- 메인 렌더링 iframe -->
      <iframe id="previewFrame" src="${SCREENS[0].id}.html" class="w-full flex-1 border-none bg-white"></iframe>
    </div>
  </main>

  <script>
    const screensData = ${JSON.stringify(SCREENS)};

    function loadScreen(screenId, btnEl) {
      // 1. 활성 탭 스타일 전환
      document.querySelectorAll('.screen-tab').forEach(b => b.classList.remove('active'));
      if (btnEl) btnEl.classList.add('active');

      // 2. iframe 주소 변경
      const frame = document.getElementById('previewFrame');
      frame.src = screenId + '.html';

      // 3. 새 탭 열기 링크 동기화
      document.getElementById('btnNewTab').href = screenId + '.html';

      // 4. 정보 텍스트 갱신
      const info = screensData.find(s => s.id === screenId);
      if (info) {
        document.getElementById('currentTitle').innerText = info.title;
        document.getElementById('currentId').innerText = '(' + info.id + ')';
        document.getElementById('currentDesc').innerText = info.desc;
      }
    }

    function setDevice(width) {
      const container = document.getElementById('viewportContainer');
      container.style.width = width;
      if (width === '100%') {
        container.style.maxWidth = '100%';
      } else {
        container.style.maxWidth = width;
      }

      // 버튼 토글
      document.querySelectorAll('.device-btn').forEach(b => {
        b.classList.remove('active', 'bg-[#0F172A]', 'text-white');
        b.classList.add('text-slate-600');
      });
      event.currentTarget.classList.add('active', 'bg-[#0F172A]', 'text-white');
      event.currentTarget.classList.remove('text-slate-600');
    }
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(PREVIEW_DIR, 'index.html'), indexHtmlContent, 'utf8');
console.log('✅ [CREATED] preview_client/index.html (통합 프리뷰어 대시보드)');
console.log('🎉 전체 9개 화면 및 통합 크롬 뷰어 생성 완료!');

