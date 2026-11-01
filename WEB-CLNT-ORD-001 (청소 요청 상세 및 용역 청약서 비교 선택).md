# [SseulDakGo (쓸고닦고)] WEB-CLNT-ORD-001 (청소 요청 상세 및 용역 청약서 비교 선택) 개발 및 테스트 명세서

---

## 1. 화면 및 아키텍처 개요

| 항목 | 내용 |
| :--- | :--- |
| **화면 ID** | `WEB-CLNT-ORD-001` |
| **화면명** | 청소 요청 상세 및 용역 청약서 비교/선택 (Request Details & Contractor Bids Comparison) |
| **지원 채널** | Web [Y] / Mobile Web [Y] |
| **도메인 역할** | `Client` (고객 전용 청약서 비교 및 시공 파트너 채택) |
| **프론트엔드 파일** | [`SseulDakGo_Web/Client/frontend/WEB-CLNT-ORD-001/index.jsx`](file:///Users/handsupbus/project_SseulDakGo/SseulDakGo_Web/Client/frontend/WEB-CLNT-ORD-001/index.jsx) |
| **백엔드 라우터 파일** | [`SseulDakGo_Web/Client/backend/api_WEB_CLNT_ORD_001/route.js`](file:///Users/handsupbus/project_SseulDakGo/SseulDakGo_Web/Client/backend/api_WEB_CLNT_ORD_001/route.js) |
| **API 엔드포인트** | `POST /api/web/client/ord_001` |
| **데이터베이스** | `ssuldak_db` (MySQL 8.0 / InnoDB / `utf8mb4_0900_ai_ci`) |
| **DB 모듈 경로** | `lib/db.js` (`lib/db.ts`) |

### 핵심 아키텍처 준수 규칙
1. **단일 책임 원칙 (SRP) 및 1:1 독립 엔드포인트 매핑**:
   - 발주 상세 및 접수된 파트너 청약서 목록 조회는 오직 `POST /api/web/client/ord_001`에서 수행합니다.
2. **역경매 수수료 없는 고정가(정찰제) 청약 모델**:
   - 파트너 간 무리한 저가 경쟁(덤핑)을 원천 차단하며, 모든 파트너는 고객이 제시한 지정 노무 대금을 100% 수용하는 조건으로 청약서를 제출합니다.
   - 비교 기준은 **"가격"**이 아닌 **"방문 가능 일정, 보유 장비 스펙, 영업배상책임보험, 평점/리뷰, 마스터 등급"**입니다.
3. **공식 브랜드 로고 반영 (`.cursorrules` 2.5)**:
   - 상단 헤더 및 푸터에 공식 상표 로고([`/logo.png`](file:///Users/handsupbus/project_SseulDakGo/public/logo.png))를 적용합니다.
4. **결제 및 계약 체결 모달(`WEB-CLNT-PAY-000`) 연동**:
   - 마음에 드는 파트너 카드의 `[ 이 파트너와 계약 진행하기 ]` 클릭 시 `WEB-CLNT-PAY-000` 모달을 즉시 오픈하여 배타적 계약 체결 단계로 인입합니다.

---

## 2. 연관 데이터베이스 테이블 및 스키마 명세

| 테이블 물리명 | 논리명 | 주 사용 목적 |
| :--- | :--- | :--- |
| `TB_ORDER_MSTR` | 주발주 마스터 | 발주 관리번호(`ORDER_NO`), 고객번호, 확정 제안가, 주소, 마감일시 조회 |
| `TB_ORDER_DTL` | 발주 상세 | 대/중분류 코드, 시공 시작일, 주기, 주차/승강기 환경 정보 조회 |
| `TB_QUOTE_APPLY` | 파트너 청약서 | 접수된 파트너 청약 정보(`APPLY_NO`, `SERVICE_USER_NO`, 제안 일정, 장비 목록 등) 조회 |
| `TB_USER` | 회원 마스터 | 시공 파트너의 업체명(`COMPANY_NM`), 대표자명(`USER_NM`), 연락처, 등급 조회 |

---

## 3. 프론트엔드 (FrontEnd) 구현 명세

### 3.1 UI/UX 구성 요소
1. **상단 서브 브레드크럼 및 헤더**:
   - `< 뒤로가기 (나의 신청현황)` 버튼 및 발주 관리번호 배지
   - 청약 마감 잔여 시간 실시간 카운트다운 배지 (`⏰ 잔여 3일 08시간`)
2. **좌측/상단 발주 원본 스펙 카드 (Order Spec Card)**:
   - 서비스 구분(정기청소/가전청소/입주청소) 및 장소 상세
   - 시공 희망 일정 및 정기 주기 (주 2회, 월 8회 등)
   - 시공 현장 주소 및 진입 여건 (무료 주차 가능 여부, 승강기 탑승 여부)
   - 고객 지정 확정 시공 대금 (₩720,000원 / 월)
3. **우측/하단 접수된 시공 파트너 청약서 비교 갤러리 (Bids Comparison List)**:
   - **추천 순위 배지**: `쓸고닦고 추천 1위`, `안심 마스터 뱃지`
   - **업체 프로필**: 업체명, 대표 마스터 실명, 시공 평점(예: 4.9점), 누적 시공 리뷰 수
   - **스펙 일치도**: 고객 요구 일정 및 장비 조건 일치율(100% 매칭)
   - **보유 전문 장비 및 약품**: 독일산 고압세척기, 친환경 피톤치드 살균 소독기 등
   - **안심 보증 배지**: 현대해상 영업배상책임 1억원 가입, 본인 신원 인증 완료
4. **계약 체결 CTA 액션**:
   - `[ 이 파트너와 계약 진행하기 > ]` 버튼 클릭 시 `WEB-CLNT-PAY-000` 결제 모달 호출

---

## 4. 백엔드 (BackEnd) API 구현 명세

### 4.1 기본 정보
- **엔드포인트**: `POST /api/web/client/ord_001`
- **구현 함수**: `processWebClntOrd001(payload)` 및 Next.js App Router `POST(request)`

### 4.2 요청 명세 (Request JSON)
```json
{
  "orderNo": "ORD2026103100001",
  "clientUserNo": "C20261000001"
}
```

### 4.3 응답 명세 (Response JSON)
```json
{
  "success": true,
  "code": "OK",
  "data": {
    "order": {
      "orderNo": "ORD2026103100001",
      "cleanLargeNm": "정기청소",
      "cleanMidNm": "계단, 복도, 외곽 공용부",
      "addrText": "경기 고양시 일산동구 마두동 123-45 한빛빌딩",
      "proposedPrice": 720000,
      "serviceStartDt": "2026-11-01",
      "remainingTimeText": "3일 08시간 12분"
    },
    "applies": [
      {
        "applyNo": "APPLY20261031001",
        "serviceUserNo": "S20261000001",
        "companyNm": "반짝빌라클린",
        "userNm": "이*수",
        "rating": 4.9,
        "reviewCount": 84,
        "matchRateText": "100% 일치",
        "equipmentList": ["독일산 고압 세척기", "친환경 살균 소독제"],
        "insuranceNm": "현대해상 영업배상 1억원",
        "visitPossibleDt": "2026-11-01 오전 09:00"
      }
    ]
  },
  "message": "청약서 비교 정보가 정상 조회되었습니다."
}
```

### 4.4 주요 SQL 쿼리
```sql
-- 1. 발주 마스터 및 상세 조회
SELECT M.ORDER_NO, M.CLIENT_USER_NO, M.ORDER_STATUS, M.PROPOSED_PRICE, M.ADDR_TEXT, M.ADDR_DETAIL,
       D.CLEAN_LARGE_CD, D.CLEAN_MID_CD, D.SERVICE_START_DT, D.SERVICE_END_DT, M.BID_EXPIRE_DT
  FROM TB_ORDER_MSTR M
 INNER JOIN TB_ORDER_DTL D ON M.ORDER_NO = D.ORDER_NO
 WHERE M.ORDER_NO = ? AND M.DEL_YN = 'N'
 LIMIT 1;

-- 2. 해당 발주에 접수된 파트너 청약서 및 마스터 정보 조회
SELECT A.APPLY_NO, A.ORDER_NO, A.SERVICE_USER_NO, A.APPLY_STATUS, A.VISIT_POSSIBLE_DT, A.EQUIPMENT_NOTE,
       U.COMPANY_NM, U.USER_NM, U.USER_TEL, U.RATING, U.REVIEW_CNT
  FROM TB_QUOTE_APPLY A
 INNER JOIN TB_USER U ON A.SERVICE_USER_NO = U.USER_NO
 WHERE A.ORDER_NO = ? AND A.DEL_YN = 'N'
 ORDER BY A.REG_DT ASC;
```

---

## 5. 검증 및 테스트 결과

1. **상세 스펙 정확성**: 요청서 작성 시 기입한 공정 상세 및 주소 정보가 오차 없이 렌더링됨을 확인.
2. **파트너 청약서 카드 리스트**: 접수된 파트너들의 프로필, 추천 배지, 보유 장비가 1:1로 정확하게 렌더링됨을 확인.
3. **결제 모달 연계**: 특정 파트너의 `[계약 진행하기]` 클릭 시 해당 파트너 정보가 바인딩된 상태로 `WEB-CLNT-PAY-000` 모달이 오픈됨을 확인.

