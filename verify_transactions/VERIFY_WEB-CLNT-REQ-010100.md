# [거래검증 기준서] WEB-CLNT-REQ-010100 : 청소 서비스 신청 및 발주서 작성

## 1. 화면 및 트랜잭션 개요
- **화면 ID**: `WEB-CLNT-REQ-010100`
- **화면명**: 청소 서비스 신청 및 발주서 작성 (모달 / 독립 페이지)
- **사용자 역할**: 고객 (`CLIENT`, `USER_ROLE_CD = 'C'`)
- **프론트엔드 소스**: [index.jsx](file:///c:/GongGanDaWon_Project/project_SseulDakGo/SseulDakGo_Web/Client/frontend/WEB-CLNT-REQ-010100/index.jsx)
- **프리뷰 URL**: `http://localhost:3000/preview_client/WEB-CLNT-REQ-010100.html`
- **백엔드 API 엔드포인트**: `POST /api/web/client/req_010100`
- **백엔드 소스**: [route.js](file:///c:/GongGanDaWon_Project/project_SseulDakGo/SseulDakGo_Web/Client/backend/api_WEB_CLNT_REQ_010100/route.js)

---

## 2. 연관 DB 테이블 명세 및 정합성 기준

| 테이블명 | 작업 유형 | 필수 검증 컬럼 및 기대값 | 비고 |
| :--- | :---: | :--- | :--- |
| **`TB_ORDER_MSTR`** | `INSERT` (1건) | • `ORDER_NO`: `ORD` + `YYYYMMDD` + 5자리 순번 (예: `ORD2026111600001`)<br/>• `CLIENT_USER_NO`: 로그인 고객 번호 (예: `C20261100001`)<br/>• `ORDER_STATUS`: `'BID_OPEN'` (청약 대기)<br/>• `PROPOSED_PRICE`: 고객 지정 월/건 대금 (양의 정수)<br/>• `ADDR_TEXT`, `ADDR_DETAIL`: 입력한 시공지 도로명 주소<br/>• `BID_EXPIRE_DT`: 등록일시 + 7일 (`NOW() + INTERVAL 7 DAY`) | 발주 마스터 원장 |
| **`TB_ORDER_DTL`** | `INSERT` (1건) | • `ORDER_DTL_NO`: `{ORDER_NO}01` (18자리)<br/>• `ORDER_NO`: 상위 주발주번호<br/>• `CLEAN_LARGE_CD`: `'REGULAR'`(정기) / `'MOVEIN'`(입주) / `'APPLIANCE'`(가전)<br/>• `CLEAN_MID_CD`: `'STAIR_HANDRAIL'`, `'MOVEIN_FULL'`, `'APPLIANCE_ALL'` 등<br/>• `SERVICE_STATUS`: `'WAIT_BID'`<br/>• `HOPE_CLEAN_DATE`: 용역 개시 희망일 (`YYYY-MM-DD`)<br/>• `HOPE_CLEAN_TIME`: 방문 희망 시작 시각 (기본 `'09:00'` 또는 입력 시간)<br/>• `CONTRACT_TERM_DAYS`: 정기청소 시 최소 90일 (3개월)<br/>• `WEEK_CLEAN_FREQ`: 정기청소 주간 빈도 (1~5)<br/>• `CLEAN_DAYS_CONFIG`: 방문 요일 (예: `'MON,WED,FRI'`)<br/>• `REG_ID`: 등록자 회원번호 | 발주 상세 품목 원장 |
| **`TB_ORDER_PHOTO`** | `INSERT` (0~10건) | • `ORDER_NO`, `ORDER_DTL_NO`<br/>• `PHOTO_TIMING_CD`: `'BEFORE'` (시공 전 사진)<br/>• `LOGICAL_FILE_NM`, `PHYSICAL_FILE_NM`: 첨부 파일명<br/>• `FILE_EXT`: `'JPG'`, `'PNG'` 등<br/>• `SORT_ORD`: 1부터 순차 증가 | 현장 사진 첨부 시 |
| **`TB_ORDER_APPLIANCE_ITEM`** | `INSERT` (대수별) | • `APPLIANCE_TYPE_CD`: 가전 유형 (벽걸이, 드럼세탁기 등)<br/>• `ITEM_SEQ_NO`: 기기 순번 (1, 2, ...)<br/>• `SPEC_NUM_VAL` / `SPEC_TEXT_VAL`: 평형, kg 등 세부 스펙 | **계절가전청소** 신청 시 |
| **`TB_USER_NOTIFICATION`** | `INSERT` (시공사별) | • `USER_NO`: 시공사 회원번호 (`S20261100001` 등)<br/>• `NOTI_TYPE`: `'NEW_ORDER'`<br/>• `TITLE`: `[신규 청소 발주] 새로운 ...`<br/>• `TARGET_URL`: `/preview_client/WEB-CLNT-ORD-010100.html?orderNo=...` | 활성 시공사 자동 알림 |

---

## 3. 프론트엔드 입력값 검증 기준 (Validation Rules)

1. **단일 청소 카테고리 선택 (정기청소 / 입주청소 / 계절가전 택 1)**
   - 3개 탭 중 반드시 1개 카테고리만 활성화되어 등록되어야 함.
2. **청소 대금 입력값 포맷팅**
   - 숫자 입력 시 세자리마다 콤마(`,`) 자동 표출 (예: `350000` → `350,000`).
   - 0원 이하이거나 비어있을 경우 제출 차단 (`ERR_PRICE_INVALID`).
3. **정기청소 최소 계약기간 검증**
   - 최소 3개월(90일) 이상 선택 강제 (`diffDays >= 89`).
4. **시공 현장 주소 필수 입력**
   - 네이버 도로명 주소 검색을 통해 `addrText`가 반드시 입력되어야 함.
5. **비회원(Guest) 임시저장 분기**
   - 미로그인 상태일 경우 DB 호출 전 로컬스토리지(`SSEULDAKGO_GUEST_TEMP_REQ`)에 사진(Base64) 포함 안전 임시 저장 후 로그인 모달 호출.
   - 로그인 완료 시 임시저장 데이터 100% 자동 복원.

---

## 4. 거래 테스트 시나리오

### 시나리오 1: [정상] 로그인 고객의 정기청소 발주 등록
1. **사전 조건**: 로컬스토리지에 고객 로그인 정보(`C20261100001`) 세팅.
2. **수행 절차**:
   - `정기청소` 탭 선택
   - 주소: `경기 고양시 일산동구 중앙로 1275`, 상세: `302호`
   - 개시일: `2026-12-01`, 종료일: `2027-02-28` (90일 자동)
   - 주 2회 (월, 목), 청소대금: `350,000원`
   - 현장사진 1장 첨부 후 `+ 청소 서비스 신청 완료 (확정 발주)` 클릭.
3. **검증 결과 확인**:
   - 브라우저 네이티브 alert 헤더(`localhost:3000 내용:`)가 노출되지 않음.
   - 커스텀 안심 완료 모달 오픈: `청소 요청 완료`, 전체 발주번호 `ORD202611...`, 문구 `성공적으로 접수되었습니다! 시공사에 메시지 전달되었습니다.` 표출.
   - DB 확인:
     - `TB_ORDER_MSTR` 1건 INSERT 확인
     - `TB_ORDER_DTL` 1건 INSERT 확인 (`HOPE_CLEAN_DATE = '2026-12-01'`, `HOPE_CLEAN_TIME = '09:00'`)
     - `TB_ORDER_PHOTO` 1건 INSERT 확인
     - `TB_USER_NOTIFICATION` 시공사(`S20261100001`) 알림 1건 INSERT 확인

---

## 5. 자동 검증 스크립트 (CLI One-liner)

아래 명령을 터미널에서 실행하여 백엔드 API 및 DB 정상 적재를 즉시 검증할 수 있습니다:

```powershell
node -e "
fetch('http://localhost:3000/api/web/client/req_010100', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clientUserNo: 'C20261100001',
    cleanLargeCd: 'REGULAR',
    companyOrOrgNm: '테스트빌딩',
    contactPersonNm: '김충훈',
    contactTel: '010-8286-3457',
    contactEmail: 'chunggiwa@naver.com',
    facilityTypeCd: 'COMMERCIAL',
    parkingAvailCd: 'FREE',
    sidoCd: '41',
    sigunguCd: '41281',
    addrText: '경기 고양시 일산동구 중앙로 1275',
    addrDetail: '302호',
    proposedPrice: 350000,
    detailReqNote: '정기청소 테스트',
    contractTypeCd: '정기 용역 계약',
    selectedSrvItems: 'STAIR_HANDRAIL',
    serviceStartDt: '2026-12-01',
    serviceEndDt: '2027-02-28',
    contractTermDays: 90,
    weekCleanFreq: 2,
    cleanDaysConfig: 'MON,THU',
    supplyPyeong: 45,
    cleanMidCd: 'STAIR_HANDRAIL',
    photoList: []
  })
}).then(r => r.json()).then(console.log).catch(console.error);
"
```
