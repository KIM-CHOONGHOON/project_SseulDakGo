# [SseulDakGo (쓸고닦고)] WEB-CLNT-ORD-000 (나의 청소 신청 현황) 개발 및 테스트 명세서

---

## 1. 화면 및 아키텍처 개요

| 항목 | 내용 |
| :--- | :--- |
| **화면 ID** | `WEB-CLNT-ORD-000` |
| **화면명** | 나의 청소 신청 현황 (My Cleaning Requests Dashboard) |
| **지원 채널** | Web [Y] / Mobile Web [Y] |
| **도메인 역할** | `Client` (고객 전용 발주 목록 및 매칭 진행 현황 대시보드) |
| **프론트엔드 파일** | [`SseulDakGo_Web/Client/frontend/WEB-CLNT-ORD-000/index.jsx`](file:///Users/handsupbus/project_SseulDakGo/SseulDakGo_Web/Client/frontend/WEB-CLNT-ORD-000/index.jsx) |
| **백엔드 라우터 파일** | [`SseulDakGo_Web/Client/backend/api_WEB_CLNT_ORD_000/route.js`](file:///Users/handsupbus/project_SseulDakGo/SseulDakGo_Web/Client/backend/api_WEB_CLNT_ORD_000/route.js) |
| **API 엔드포인트** | `POST /api/web/client/ord_000` |
| **데이터베이스** | `ssuldak_db` (MySQL 8.0 / InnoDB / `utf8mb4_0900_ai_ci`) |
| **DB 모듈 경로** | `lib/db.js` (`lib/db.ts`) |

### 핵심 아키텍처 준수 규칙
1. **단일 책임 원칙 (SRP) 및 1:1 독립 엔드포인트 매핑**:
   - 고객 발주 목록 조회 및 상태 집계는 오직 `POST /api/web/client/ord_000`에서 전담합니다.
2. **7일 경과 미체결 공고 자동 만료 배치 동기화 (Auto-Expire Sync)**:
   - 조회 쿼리 실행 직전, 등록일로부터 7일이 경과하였으나 계약 체결에 이르지 못한 발주 건을 `BID_EXPIRED` 상태로 원자적 일괄 갱신합니다.
3. **공식 브랜드 아이덴티티 준수 (`.cursorrules` 2.5)**:
   - 공식 상표 로고([`/logo.png`](file:///Users/handsupbus/project_SseulDakGo/public/logo.png)) 적용.
   - 쿠폰 및 역경매 단어 배제, 100% 현장 직불 및 확정 노무비 중심의 명확한 상태 안내.
4. **단계별 워크플로우 화면 전환 트리거**:
   - `BID_OPEN` (청약 접수 중): `[ 파트너 청약서 비교 및 선택하기 ({applyCount}건) ]` -> `WEB-CLNT-ORD-001` 전환
   - `CNTR_CONFIRMED` (계약 체결/진행 중): `[ 현장 시공 검수 및 직불 승인 ]` -> `WEB-CLNT-JOB-000` 전환
   - `SVC_COMPLETED` (시공 완료): `[ 시공 검수 내역 및 전/후 사진 보기 ]` -> `WEB-CLNT-JOB-000` 전환

---

## 2. 연관 데이터베이스 테이블 및 스키마 명세

| 테이블 물리명 | 논리명 | 주 사용 목적 |
| :--- | :--- | :--- |
| `TB_ORDER_MSTR` | 주발주 마스터 | 고객 발주 기본 정보, 총 제안가, 발주 상태(`ORDER_STATUS`) 관리 |
| `TB_ORDER_DTL` | 발주 상세 | 대분류(`CLEAN_LARGE_CD`), 중분류(`CLEAN_MID_CD`), 시공 희망 일정 조인 |
| `TB_QUOTE_APPLY` | 파트너 청약서 | 발주별 접수된 파트너 청약 건수(`COUNT(*)`) 서브쿼리 집계 |
| `TB_USER` | 회원 마스터 | 고객 본인 여부 검증 및 담당 마스터(시공사) 프로필 정보 매핑 |

---

## 3. 프론트엔드 (FrontEnd) 구현 명세

### 3.1 UI 구성 요소
1. **상단 GNB 헤더**:
   - 공식 로고([`/logo.png`](file:///Users/handsupbus/project_SseulDakGo/public/logo.png)) 및 `나의 신청현황` 활성 탭
   - 고객 실명 및 회원 번호 배지
2. **4종 핵심 KPI 요약 카드 (Summary Cards)**:
   - **전체 신청내역**: 총 발주 건수
   - **청약 접수중 (`BID_OPEN`)**: 기사 청약서 접수 중인 건수 (Secondary 청록 강조)
   - **배차/진행중 (`CNTR_CONFIRMED`)**: 계약 체결 후 시공 대기/진행 중인 건수
   - **시공 완료 (`SVC_COMPLETED`)**: 현장 검수 및 직불 종결된 건수
3. **상태 필터 탭 바 (Filter Tabs)**:
   - `[전체 보기]`, `[청약 접수중]`, `[배차·계약 체결]`, `[시공 진행중]`, `[시공 완료]`, `[기한 만료]`
4. **발주 상세 카드 (4-Grid Card)**:
   - **Col 1 (서비스 구분)**: 대분류/중분류 칩 및 상세 요청 내용
   - **Col 2 (현장 주소)**: 도로명 주소 및 상세 주소
   - **Col 3 (시공 일정)**: 시공 희망일자, D-Day 배지, 작업 주기
   - **Col 4 (확정 대금)**: 고객 지정 현장 직불 금액 (정찰제 안내 문구 포함)
5. **하단 액션 바**:
   - 상태에 따른 최적 CTA 버튼 동적 노출 (`청약서 비교하기`, `현장 검수/직불 승인`, `검수 내역 보기`, `재신청하기`)

---

## 4. 백엔드 (BackEnd) API 구현 명세

### 4.1 기본 정보
- **엔드포인트**: `POST /api/web/client/ord_000`
- **구현 함수**: `processWebClntOrd000(payload)` 및 Next.js App Router `POST(request)`

### 4.2 요청 명세 (Request JSON)
```json
{
  "clientUserNo": "C20261000001",
  "statusFilter": "ALL"
}
```

### 4.3 응답 명세 (Response JSON)
```json
{
  "success": true,
  "code": "OK",
  "data": {
    "summary": {
      "totalCount": 4,
      "bidOpenCount": 2,
      "confirmedCount": 1,
      "completedCount": 1
    },
    "orders": [
      {
        "orderNo": "ORD2026103100001",
        "orderStatus": "BID_OPEN",
        "cleanLargeNm": "정기청소",
        "cleanMidNm": "빌라/상가 공용부 주 1회 관리",
        "addrText": "경기 고양시 일산동구 마두동 123-45",
        "proposedPrice": 720000,
        "serviceStartDt": "2026-11-05",
        "applyCount": 3,
        "contractMaster": null
      }
    ]
  },
  "message": "신청 현황 조회가 완료되었습니다."
}
```

### 4.4 주요 SQL 쿼리
```sql
-- 1. 7일 경과 자동 만료 처리
UPDATE TB_ORDER_MSTR
   SET ORDER_STATUS = 'BID_EXPIRED', MOD_DT = NOW()
 WHERE ORDER_STATUS = 'BID_OPEN'
   AND (BID_EXPIRE_DT < NOW() OR (BID_EXPIRE_DT IS NULL AND REG_DT < NOW() - INTERVAL 7 DAY));

-- 2. 요약 통계 집계
SELECT 
    COUNT(*) AS TOTAL_CNT,
    SUM(CASE WHEN ORDER_STATUS = 'BID_OPEN' THEN 1 ELSE 0 END) AS BID_OPEN_CNT,
    SUM(CASE WHEN ORDER_STATUS = 'CNTR_CONFIRMED' THEN 1 ELSE 0 END) AS CONFIRMED_CNT,
    SUM(CASE WHEN ORDER_STATUS = 'SVC_COMPLETED' THEN 1 ELSE 0 END) AS COMPLETED_CNT
  FROM TB_ORDER_MSTR
 WHERE CLIENT_USER_NO = ? AND DEL_YN = 'N';

-- 3. 발주 목록 및 청약 건수 조회
SELECT 
    M.ORDER_NO,
    M.ORDER_STATUS,
    M.ADDR_TEXT,
    M.ADDR_DETAIL,
    M.PROPOSED_PRICE,
    D.CLEAN_LARGE_CD,
    D.CLEAN_MID_CD,
    D.SERVICE_START_DT,
    (SELECT COUNT(*) FROM TB_QUOTE_APPLY A WHERE A.ORDER_NO = M.ORDER_NO AND A.DEL_YN = 'N') AS APPLY_COUNT
  FROM TB_ORDER_MSTR M
 INNER JOIN TB_ORDER_DTL D ON M.ORDER_NO = D.ORDER_NO
 WHERE M.CLIENT_USER_NO = ? AND M.DEL_YN = 'N'
 ORDER BY M.REG_DT DESC;
```

---

## 5. 검증 및 테스트 결과

1. **자동 만료 배치**: 7일 초과 미체결 건이 조회 트리거 시 `BID_EXPIRED`로 갱신됨을 확인.
2. **청약서 수신 수량 연동**: 서브쿼리를 통해 실시간 접수된 파트너 청약서 수가 카드에 정확히 노출됨을 확인.
3. **화면 분기 내비게이션**: 각 상태별 버튼 클릭 시 `WEB-CLNT-ORD-001` 및 `WEB-CLNT-JOB-000`으로 쿼리 파라미터를 유지한 채 정상 이동 확인.

