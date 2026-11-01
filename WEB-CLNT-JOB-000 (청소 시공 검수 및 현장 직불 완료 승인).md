# [SseulDakGo (쓸고닦고)] WEB-CLNT-JOB-000 (청소 시공 검수 및 현장 직불 완료 승인) 개발 및 테스트 명세서

---

## 1. 화면 및 아키텍처 개요

| 항목 | 내용 |
| :--- | :--- |
| **화면 ID** | `WEB-CLNT-JOB-000` |
| **화면명** | 청소 시공 검수 및 현장 직불 완료 승인 (Cleaning Inspection & Direct Settlement Approval) |
| **지원 채널** | Web [Y] / Mobile Web [Y] |
| **도메인 역할** | `Client` (고객 전용 시공 사진 검수 및 현장 직불 종결) |
| **프론트엔드 파일** | [`SseulDakGo_Web/Client/frontend/WEB-CLNT-JOB-000/index.jsx`](file:///Users/handsupbus/project_SseulDakGo/SseulDakGo_Web/Client/frontend/WEB-CLNT-JOB-000/index.jsx) |
| **백엔드 라우터 파일** | [`SseulDakGo_Web/Client/backend/api_WEB_CLNT_JOB_000/route.js`](file:///Users/handsupbus/project_SseulDakGo/SseulDakGo_Web/Client/backend/api_WEB_CLNT_JOB_000/route.js) |
| **API 엔드포인트** | `POST /api/web/client/job_000` |
| **데이터베이스** | `ssuldak_db` (MySQL 8.0 / InnoDB / `utf8mb4_0900_ai_ci`) |
| **DB 모듈 경로** | `lib/db.js` (`lib/db.ts`) |

### 핵심 아키텍처 준수 규칙
1. **단일 책임 원칙 (SRP) 및 1:1 독립 엔드포인트 매핑**:
   - 시공 전/후 사진 및 계약 정보 조회(`GET_INSPECT_DATA`), 최종 완료 승인 트랜잭션(`CONFIRM_COMPLETE`)은 오직 `POST /api/web/client/job_000`에서 전담합니다.
2. **시공 전/후 사진 1:1 비교 검증 및 라이트박스 확대 (Photo Comparison & Lightbox)**:
   - 기사님이 현장에서 실시간 업로드한 작업 전(`BEFORE`) 사진과 완료 후(`AFTER`) 사진을 구역별로 1:1 매칭하여 고객에게 제공합니다.
   - 탭 필터(`전체 1:1 비교`, `BEFORE`, `AFTER`) 및 클릭 시 전체 화면 라이트박스 모달을 지원합니다.
3. **파트너 수취 계좌 원터치 복사 및 에스크로 미보유 고지**:
   - 마스터 기사님의 실명 수취 계좌(은행명, 계좌번호, 예금주)를 원터치로 클립보드에 복사할 수 있는 상호작용 피드백을 제공합니다.
   - 플랫폼이 에스크로를 보유하지 않으며 고객이 기사님께 직접 노무비를 정산하는 직불제임을 강조 고지합니다.
4. **대면 검수 체크박스 필수 및 원자적 3개 테이블 상태 종결**:
   - 대면 검수 체크박스를 선택하지 않으면 승인 버튼이 비활성화되며, 승인 완료 시 `TB_CLEAN_CONTRACT`(`COMPLETED`), `TB_ORDER_MSTR`(`SVC_COMPLETED`), `TB_ORDER_DTL`(`SERVICE_DONE`)이 원자적 단일 트랜잭션으로 종결됩니다.

---

## 2. 연관 데이터베이스 테이블 및 스키마 명세

| 테이블 물리명 | 논리명 | 주 사용 목적 |
| :--- | :--- | :--- |
| `TB_CLEAN_CONTRACT` | 체결 계약 마스터 | 계약 기본 정보, 확정 노무 대금, 파트너 식별번호, 상태(`CONTRACT_STAT_CD = 'COMPLETED'`) 갱신 |
| `TB_ORDER_MSTR` | 주발주 마스터 | 시공 현장 주소 조회 및 최종 상태(`ORDER_STATUS = 'SVC_COMPLETED'`) 갱신 |
| `TB_ORDER_DTL` | 발주 상세 | 공정 상세 상태(`SERVICE_STATUS = 'APPR_CONTRACT'`, `DETAIL_STATUS = 'SERVICE_DONE'`) 갱신 |
| `TB_ORDER_PHOTO` | 시공 전/후 사진 | 구역별 촬영 시점(`PHOTO_TIMING_CD`: `BEFORE`, `AFTER`) 사진 경로 및 메타데이터 조회 |
| `TB_USER` | 회원 마스터 | 기사님의 정산 수취 계좌(은행명, 계좌번호, 예금주), 실명, 안심번호 조회 |

---

## 3. 프론트엔드 (FrontEnd) 구현 명세

### 3.1 8:4 비대칭 레이아웃 구성
1. **상단 서브 헤더 & 브레드크럼**:
   - `< 나의 신청현황으로 이동 (WEB-CLNT-ORD-000)` 링크 및 화면 ID 배지
   - 계약 관리번호(`CONTRACT_NO`) 및 시공 완료/검수 대기 상태 칩
2. **좌측 메인 컬럼 (8 Cols)**:
   - **시공 현장 개요 카드**: 시공 공간, 현장 주소, 시공 일시 및 소요 시간
   - **담당 시공 마스터 카드**: 업체명, 대표자명, MASTER TIER 뱃지, 영업배상책임 1억원 뱃지, 안심번호 통화 링크
   - **시공 전/후 사진 비교 갤러리**:
     - 상단 3단 탭 스위치: `[전체 1:1 비교]`, `[📷 작업 전 (BEFORE)]`, `[✨ 작업 후 (AFTER)]`
     - 구역별 1:1 사진 카드 (촬영 시각, 시공 내역 태그, 돋보기 버튼 클릭 시 라이트박스 확대)
   - **품질 보증 안내 카드**: 시공일 기준 최대 7일 이내 무상 재방문 보완(A/S) 안내
3. **우측 스티키 사이드바 (4 Cols)**:
   - **Deep Royal Navy 현장 직불 정산 카드**:
     - 최종 현장 지급 노무 대금 (₩720,000원 - 중개 수수료 0원)
     - 기사님 지정 수취 계좌 및 예금주 안내
     - `[복사]` 버튼 클릭 시 실시간 클립보드 복사 및 `복사됨!` 텍스트 전환
     - 에스크로 미보유 및 직접 송금 의무 경고 박스
   - **검수 확인 및 승인 박스**:
     - 대면 검수 확인 체크박스 (`[V] 현장 시공 상태와 전/후 증빙 사진을 모두 확인하였으며...`)
     - `[ 최종 청소 완료 승인하기 ]` CTA 버튼
     - `[현장 A/S 재요청]` 및 `[고객센터 접수]` 보조 액션 버튼

---

## 4. 백엔드 (BackEnd) API 구현 명세

### 4.1 기본 정보
- **엔드포인트**: `POST /api/web/client/job_000`
- **구현 함수**: `processWebClntJob000(payload)` 및 Next.js App Router `POST(request)`

### 4.2 요청 명세 (Request JSON)
```json
// 1) 검수 데이터 조회 요청
{
  "action": "GET_INSPECT_DATA",
  "contractNo": "CNT2026103100001",
  "clientUserNo": "C20261000001"
}

// 2) 시공 완료 최종 승인 요청
{
  "action": "CONFIRM_COMPLETE",
  "contractNo": "CNT2026103100001",
  "clientUserNo": "C20261000001"
}
```

### 4.3 응답 명세 (Response JSON)
```json
{
  "success": true,
  "code": "OK",
  "data": {
    "contractNo": "CNT2026103100001",
    "orderStatus": "SVC_COMPLETED",
    "contractStatCd": "COMPLETED",
    "totalServiceAmt": 720000,
    "completedDt": "2026-10-31T04:55:00.000Z"
  },
  "message": "청소 완료 승인이 정상 처리되었습니다. 파트너에게 대금을 직접 지급해 주세요."
}
```

### 4.4 최종 승인 원자적 트랜잭션 SQL
```sql
-- 1. 계약 마스터 완료 처리
UPDATE TB_CLEAN_CONTRACT 
   SET CONTRACT_STAT_CD = 'COMPLETED', MOD_DT = NOW() 
 WHERE CONTRACT_NO = ? AND CLIENT_USER_NO = ?;

-- 2. 발주 마스터 상태 완료 전환
UPDATE TB_ORDER_MSTR 
   SET ORDER_STATUS = 'SVC_COMPLETED', COMPLETED_DT = NOW() 
 WHERE ORDER_NO = ?;

-- 3. 발주 상세 공정 완료 전환
UPDATE TB_ORDER_DTL 
   SET SERVICE_STATUS = 'APPR_CONTRACT', DETAIL_STATUS = 'SERVICE_DONE', MOD_DT = NOW() 
 WHERE ORDER_DTL_NO = ?;
```

---

## 5. 검증 및 테스트 결과

1. **사진 필터 및 라이트박스**: `전체`, `BEFORE`, `AFTER` 탭 전환 및 원본 사진 클릭 시 라이트박스 팝업 확대 정상 동작 확인.
2. **계좌번호 복사**: `navigator.clipboard.writeText` 호출 및 `복사됨!` 시각 피드백 2초 유지 후 복원 확인.
3. **승인 트랜잭션 및 완료 모달**: 체크박스 선택 후 승인 클릭 시 3개 테이블 상태가 `SVC_COMPLETED`로 동시 전이되며 성공 팝업 출력 확인.
4. **신청현황 연동**: 팝업 확인 버튼 클릭 시 `나의 신청현황(WEB-CLNT-ORD-000)`으로 자동 전환되어 완료 상태로 갱신됨을 확인.

