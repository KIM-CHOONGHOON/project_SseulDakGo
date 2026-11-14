import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const dir = path.resolve('docs/program_md');

const targetScreens = [
  {
    id: 'WEB-CLNT-COM-010000',
    type: 'Main',
    name: '고객 메인 홈',
    filename: 'WEB-CLNT-COM-010000_Main_고객 메인 홈.md',
    legacyFilename: 'WEB-CLNT-COM-010000 (고객 메인 홈).md',
    frontend: 'SseulDakGo_Web/Client/frontend/WEB-CLNT-COM-010000/index.jsx',
    backend: 'SseulDakGo_Web/Client/backend/api_WEB_CLNT_COM_010000/route.js',
    api: 'POST /api/web/client/com_010000',
    tables: ['TB_USER', 'TB_ORDER_MSTR', 'TB_ORDER_DTL', 'TB_COM_CODE']
  },
  {
    id: 'WEB-CLNT-REQ-010100',
    type: 'Sub (모달)',
    name: '청소 서비스 신청 (발주서 작성)',
    filename: 'WEB-CLNT-REQ-010100_Sub (모달)_청소 서비스 신청 (발주서 작성).md',
    legacyFilename: 'WEB-CLNT-REQ-010100 (통합 청소 서비스 신청).md',
    frontend: 'SseulDakGo_Web/Client/frontend/WEB-CLNT-REQ-010100/index.jsx',
    backend: 'SseulDakGo_Web/Client/backend/api_WEB_CLNT_REQ_010100/route.js',
    api: 'POST /api/web/client/req_010100',
    tables: ['TB_ORDER_MSTR', 'TB_ORDER_DTL', 'TB_ORDER_PHOTO', 'TB_COM_CODE']
  },
  {
    id: 'WEB-CLNT-REQ-010101',
    type: 'Sub (모달)',
    name: '동일 시공 현장 주소 확인 및 변경 안내',
    filename: 'WEB-CLNT-REQ-010101_Sub (모달)_동일 시공 현장 주소 확인 및 변경 안내.md',
    legacyFilename: 'WEB-CLNT-REQ-010101 (동일 시공 현장 주소 확인 및 변경 안내 모달).md',
    frontend: 'SseulDakGo_Web/Client/frontend/WEB-CLNT-REQ-010101/index.jsx',
    backend: 'SseulDakGo_Web/Client/backend/api_WEB_CLNT_REQ_010101/route.js',
    api: 'POST /api/web/client/req_010101',
    tables: ['TB_ORDER_MSTR', 'TB_ORDER_DTL', 'TB_SYS_AUDIT_LOG', 'TB_COM_CODE']
  },
  {
    id: 'WEB-CLNT-ATH-010100',
    type: 'Sub (모달)',
    name: '고객 로그인',
    filename: 'WEB-CLNT-ATH-010100_Sub (모달)_고객 로그인.md',
    legacyFilename: 'WEB-CLNT-ATH-010100 (고객 및 시공사 로그인).md',
    frontend: 'SseulDakGo_Web/Client/frontend/WEB-CLNT-ATH-010100/index.jsx',
    backend: 'SseulDakGo_Web/Client/backend/api_WEB_CLNT_ATH_010100/route.js',
    api: 'POST /api/web/client/ath_010100',
    tables: ['TB_USER']
  },
  {
    id: 'WEB-CLNT-ATH-010200',
    type: 'Sub (모달)',
    name: '통합 회원가입 및 약관동의 서명',
    filename: 'WEB-CLNT-ATH-010200_Sub (모달)_통합 회원가입 및 약관동의 서명.md',
    legacyFilename: 'WEB-CLNT-ATH-010200 (통합 회원가입 및 약관동의 서명).md',
    frontend: 'SseulDakGo_Web/Client/frontend/WEB-CLNT-ATH-010200/index.jsx',
    backend: 'SseulDakGo_Web/Client/backend/api_WEB_CLNT_ATH_010200/route.js',
    api: 'POST /api/web/client/ath_010200',
    tables: ['TB_USER', 'TB_TERMS_MASTER', 'TB_TERMS_AGREE_SIGN']
  },
  {
    id: 'WEB-CLNT-ATH-010201',
    type: 'Sub (모달)',
    name: '고객 가입 완료 환영 안내',
    filename: 'WEB-CLNT-ATH-010201_Sub (모달)_고객 가입 완료 환영 안내.md',
    legacyFilename: 'WEB-CLNT-ATH-010201 (회원가입 완료 및 웰컴 안내).md',
    frontend: 'SseulDakGo_Web/Client/frontend/WEB-CLNT-ATH-010201/index.jsx',
    backend: 'SseulDakGo_Web/Client/backend/api_WEB_CLNT_ATH_010201/route.js',
    api: 'POST /api/web/client/ath_010201',
    tables: ['TB_USER', 'TB_TERMS_MASTER', 'TB_TERMS_AGREE_SIGN']
  },
  {
    id: 'WEB-CLNT-ORD-010000',
    type: 'Main',
    name: '나의 청소 신청 현황',
    filename: 'WEB-CLNT-ORD-010000_Main_나의 청소 신청 현황.md',
    legacyFilename: 'WEB-CLNT-ORD-010000 (나의 청소 신청 현황).md',
    frontend: 'SseulDakGo_Web/Client/frontend/WEB-CLNT-ORD-010000/index.jsx',
    backend: 'SseulDakGo_Web/Client/backend/api_WEB_CLNT_ORD_010000/route.js',
    api: 'POST /api/web/client/ord_010000',
    tables: ['TB_ORDER_MSTR', 'TB_ORDER_DTL', 'TB_QUOTE_APPLY', 'TB_CLEAN_CONTRACT']
  },
  {
    id: 'WEB-CLNT-ORD-010100',
    type: 'Sub',
    name: '청소 요청 상세 및 용역 청약서 비교선택',
    filename: 'WEB-CLNT-ORD-010100_Sub_청소 요청 상세 및 용역 청약서 비교선택.md',
    legacyFilename: 'WEB-CLNT-ORD-010100 (청소 요청 상세 및 용역 청약서 비교 선택).md',
    frontend: 'SseulDakGo_Web/Client/frontend/WEB-CLNT-ORD-010100/index.jsx',
    backend: 'SseulDakGo_Web/Client/backend/api_WEB_CLNT_ORD_010100/route.js',
    api: 'POST /api/web/client/ord_010100',
    tables: ['TB_ORDER_MSTR', 'TB_ORDER_DTL', 'TB_QUOTE_APPLY', 'TB_USER', 'TB_CLEAN_CONTRACT']
  },
  {
    id: 'WEB-CLNT-PAY-010100',
    type: 'Sub (모달)',
    name: '고객 데이터 이용료 결제 및 배타적 계약 확정',
    filename: 'WEB-CLNT-PAY-010100_Sub (모달)_고객 데이터 이용료 결제 및 배타적 계약 확정.md',
    legacyFilename: 'WEB-CLNT-PAY-010100 (결제 승인 및 배타적 계약 체결).md',
    frontend: 'SseulDakGo_Web/Client/frontend/WEB-CLNT-PAY-010100/index.jsx',
    backend: 'SseulDakGo_Web/Client/backend/api_WEB_CLNT_PAY_010100/route.js',
    api: 'POST /api/web/client/pay_010100',
    tables: ['TB_ORDER_MSTR', 'TB_ORDER_DTL', 'TB_CLEAN_CONTRACT', 'TB_PAYMENT_LOG', 'TB_ALLIANCE_SETTLE_DTL']
  },
  {
    id: 'WEB-CLNT-JOB-010100',
    type: 'Sub',
    name: '청소 시공 검수 및 현장 직불 완료 승인',
    filename: 'WEB-CLNT-JOB-010100_Sub_청소 시공 검수 및 현장 직불 완료 승인.md',
    legacyFilename: 'WEB-CLNT-JOB-010100 (청소 시공 검수 및 현장 직불 완료 승인).md',
    frontend: 'SseulDakGo_Web/Client/frontend/WEB-CLNT-JOB-010100/index.jsx',
    backend: 'SseulDakGo_Web/Client/backend/api_WEB_CLNT_JOB_010100/route.js',
    api: 'POST /api/web/client/job_010100',
    tables: ['TB_CLEAN_CONTRACT', 'TB_ORDER_MSTR', 'TB_ORDER_PHOTO', 'TB_USER']
  }
];

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

for (const scr of targetScreens) {
  const targetPath = path.join(dir, scr.filename);
  let content = '';

  // 1. 기존 파일 탐색
  const candidatePaths = [
    path.join(dir, scr.filename),
    path.join(dir, scr.legacyFilename),
    path.join(rootDir, scr.legacyFilename)
  ];

  for (const cp of candidatePaths) {
    if (fs.existsSync(cp)) {
      content = fs.readFileSync(cp, 'utf8');
      break;
    }
  }

  // 경로 및 링크 정규화
  if (content) {
    content = content.replaceAll('file:///Users/handsupbus/project_SseulDakGo/', 'file:///c:/GongGanDaWon_Project/project_SseulDakGo/');
    content = content.replaceAll('/Users/handsupbus/project_SseulDakGo/', 'c:/GongGanDaWon_Project/project_SseulDakGo/');
  } else {
    // 템플릿 기반 신규 생성
    content = `# [SseulDakGo (쓸고닦고)] ${scr.id} (${scr.name}) 개발 및 분석 명세서

---

## 1. 화면 및 아키텍처 개요

| 항목 | 내용 |
| :--- | :--- |
| **화면 ID** | \`${scr.id}\` |
| **화면 구분** | \`${scr.type}\` |
| **화면명** | ${scr.name} |
| **지원 채널** | Web [Y] / Mobile Web [Y] |
| **도메인 역할** | \`Client\` (고객 전용) |
| **프론트엔드 파일** | [\`${scr.frontend}\`](file:///c:/GongGanDaWon_Project/project_SseulDakGo/${scr.frontend}) |
| **백엔드 라우터 파일** | [\`${scr.backend}\`](file:///c:/GongGanDaWon_Project/project_SseulDakGo/${scr.backend}) |
| **API 엔드포인트** | \`${scr.api}\` |
| **데이터베이스** | \`ssuldak_db\` (MySQL 8.0 / InnoDB / \`utf8mb4_0900_ai_ci\`) |
| **DB 모듈 경로** | \`lib/db.js\` (\`lib/db.ts\`) |

---

## 2. 연관 데이터베이스 테이블 및 스키마 명세

| 테이블 물리명 | 논리명 | 주 사용 목적 |
| :--- | :--- | :--- |
${scr.tables.map(t => `| \`${t}\` | 연관 테이블 | CRUD 데이터 정합성 관리 |`).join('\n')}

---

## 3. 프론트엔드 (FrontEnd) 구현 명세

- 컴포넌트 경로: \`${scr.frontend}\`
- 화면 구분: \`${scr.type}\`
- 독립 컴포넌트 아키텍처 및 반응형 모달/페이지 레이아웃 지원

---

## 4. 백엔드 (BackEnd) API 구현 명세

- API 엔드포인트: \`${scr.api}\`
- 라우트 모듈: \`${scr.backend}\`
- 1:1 SRP (단일 책임 원칙) 엔드포인트 매핑

---

## 5. 비즈니스 룰 및 예외 처리 정책

1. 데이터 무결성 검증 및 예외 처리
2. 자전거래 방지 및 사용자 권한 검증
3. 오프라인/통신 장애 시 스마트 폴백 지원
`;
  }

  // 헤더 타이틀 및 개요 테이블 보정
  if (!content.includes(`**화면 구분**`)) {
    content = content.replace(
      `| **화면명** |`,
      `| **화면 구분** | \`${scr.type}\` |\n| **화면명** |`
    );
  }

  fs.writeFileSync(targetPath, content, 'utf8');
  console.log(`✅ [PROCESSED] ${scr.filename} (${content.length} bytes)`);
}

console.log('\n🎉 화면작성완료 대상 10개 MD 파일 생성/정규화 완료!');

