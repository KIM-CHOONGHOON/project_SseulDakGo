# [화면 및 백엔드 명세서] WEB-CLNT-NOT-010100_Sub (드롭다운 & 모달)_공통 헤더 알림센터 및 실시간 청약 신청/푸시 연동

---

## 1. 개요 및 화면 목적

| 항목 | 내용 |
| :--- | :--- |
| **화면 ID** | `WEB-CLNT-NOT-010100` |
| **화면 구분** | `Sub` (공통 헤더 GNB 알림 센터 드롭다운 팝오버 & 알림 상세 안내 모달) |
| **화면명** | 실시간 알림 센터 및 푸시메시지 수신 목록 / 상세 안내 모달 & 시공 청약 원클릭 신청 연계 |
| **트리거 경로** | 최상단 공통 GNB 헤더의 벨(Notification Bell 🔔) 이모티콘 클릭 및 목록 내 카드 선택 |
| **도메인 역할** | `Common` / `Client` (고객 C) 및 `Contractor` (시공사 S) 공통 상시 제공 |
| **프론트엔드 파일** | [`preview/index.html`](file:///c:/GongGanDaWon_Project/project_SseulDakGo/preview/index.html)<br/>[`preview_client/index.html`](file:///c:/GongGanDaWon_Project/project_SseulDakGo/preview_client/index.html)<br/>[`preview_client/WEB-CLNT-COM-010000.html`](file:///c:/GongGanDaWon_Project/project_SseulDakGo/preview_client/WEB-CLNT-COM-010000.html)<br/>[`SseulDakGo_Web/Client/frontend/WEB-CLNT-MYP-010100/index.jsx`](file:///c:/GongGanDaWon_Project/project_SseulDakGo/SseulDakGo_Web/Client/frontend/WEB-CLNT-MYP-010100/index.jsx) |
| **백엔드 라우터 파일** | [`preview/server.js`](file:///c:/GongGanDaWon_Project/project_SseulDakGo/preview/server.js)<br/>[`SseulDakGo_Web/Client/backend/api_WEB_CLNT_COM_010000/route.js`](file:///c:/GongGanDaWon_Project/project_SseulDakGo/SseulDakGo_Web/Client/backend/api_WEB_CLNT_COM_010000/route.js) |
| **API 엔드포인트** | `GET /api/common/notifications` (알림 목록 및 미확인 건수 조회)<br/>`POST /api/common/notifications/read` (단건 읽음 처리)<br/>`POST /api/common/notifications/read-all` (전체 모두 읽음 처리)<br/>`POST /api/contractor/bid/apply` (시공사 청약 신청 및 발주 상태 갱신 / 고객 실시간 푸시 발송) |
| **연관 데이터베이스** | `TB_ORDER_MSTR`, `TB_ORDER_DTL`, `TB_QUOTE_APPLY`, `TB_USER_NOTIFICATION`, `TB_USER` |

---

## 2. 핵심 비즈니스 로직 및 인터랙션 규격

### 2.1 [핵심 기능] "이 발주에 청약 신청하기" 원클릭 신청 및 고객 푸시 자동 전송
시공사 파트너가 수신된 신규 발주 알림(예: `NT202611160001001`) 상세 모달에서 **`[이 발주에 청약 신청하기]`** 버튼을 클릭했을 때 단일 트랜잭션으로 원자적으로 수행되는 업무 흐름은 다음과 같습니다:

```
[시공사 모달 액션] "이 발주에 청약 신청하기" 클릭
       │
       ▼
[백엔드 API 호출] POST /api/contractor/bid/apply
       │
       ├─ 1) 발주 마스터 상태 갱신: TB_ORDER_MSTR.ORDER_STATUS = 'BID_APPLIED'
       ├─ 2) 발주 상세 용역 상태 갱신: TB_ORDER_DTL.SERVICE_STATUS = 'BID_APPLIED', SELECTED_SERVICE_USER_NO = {contractorUserNo}
       ├─ 3) 시공사 청약 원장 생성: TB_QUOTE_APPLY 레코드 생성 (APPLY_STAT_CD = 'APPLIED')
       ├─ 4) 시공사 수신 알림 확인: TB_USER_NOTIFICATION (IS_READ = 'Y')
       └─ 5) 이용자(고객) 실시간 푸시 발송: TB_USER_NOTIFICATION (USER_NO = {clientUserNo}, NOTI_TYPE = 'QUOTE_MATCH', IS_READ = 'N')
       │
       ▼
[프론트엔드 피드백] 
       ├─ 성공 배너 표출: "[공간다원] 본 발주에 대한 시공 청약 신청이 정상 접수되었습니다!"
       ├─ 안내 문구: "청소 용역 상태가 '청약(BID_APPLIED)'으로 갱신되었으며, 이용자(고객)에게 실시간 청약 도착 푸시 메시지가 발송되었습니다."
       └─ 버튼 전환: [확인 완료] 버튼으로 동적 전환
```

---

### 2.2 업데이트 데이터베이스 테이블 및 컬럼 상세 명세표

시공사가 **`[이 발주에 청약 신청하기]`** 를 클릭하여 실행되었을 때 갱신 및 생성되는 테이블과 컬럼값의 세부 매핑은 다음과 같습니다:

| 테이블 물리명 | 논리 테이블명 | 대상 컬럼명 | 변경 전 값 (Before) | 갱신/등록된 값 (After) | 컬럼 역할 및 비즈니스 의미 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`TB_ORDER_MSTR`** | 주발주 마스터 | `ORDER_STATUS` | `'BID_OPEN'` (공고 중) | **`'BID_APPLIED'`** | 발주 전체의 상태를 **"청약 접수 완료"**로 전환 |
| | | `MOD_DT` | 이전 수정 일시 | **`NOW()`** | 최종 데이터 변경 일시 기록 |
| **`TB_ORDER_DTL`** | 발주 상세 및 용역 상태 | `SERVICE_STATUS` | `'WAIT_BID'` (대기) | **`'BID_APPLIED'`** | 시공사/이용자 양측의 **청소 용역 진행 상태를 "청약"**으로 동기화 |
| | | `SELECTED_SERVICE_USER_NO` | `NULL` | **`'S20261100001'`** (공간다원) | 해당 발주에 1순위로 청약을 제출한 시공사 식별번호 매핑 |
| | | `MOD_DT` | 이전 수정 일시 | **`NOW()`** | 용역 상태 변경 일시 기록 |
| **`TB_QUOTE_APPLY`** | 파트너 청약서 접수 원장 | `APPLY_NO` | *(신규 레코드)* | **`'AP'` + 타임스탬프 (18자 이내)** | 시공사가 정식 제출한 청약서 고유 관리번호 |
| | | `ORDER_NO` | *(신규 레코드)* | **`'ORD202611160001'`** | 연계된 주발주 번호 |
| | | `ORDER_DTL_NO` | *(신규 레코드)* | **`'ORD20261116000101'`** | 연계된 발주 상세 품목 번호 |
| | | `SERVICE_USER_NO` | *(신규 레코드)* | **`'S20261100001'`** | 청약 신청한 시공사 회원번호 |
| | | `APPLY_STAT_CD` | *(신규 레코드)* | **`'APPLIED'`** | 청약서 접수 완료 상태 코드 |
| | | `APPEAL_MSG` | *(신규 레코드)* | **`'[공간다원] 전문 시공 청약 신청 완료'`** | 시공사 공식 청약 제안 소견 |
| | | `REG_DT` / `MOD_DT` | *(신규 레코드)* | **`NOW()`** | 청약 접수 일시 |
| **`TB_USER_NOTIFICATION`**<br/>*(고객 실시간 푸시)* | 사용자 알림 원장 | `NOTI_ID` | *(신규 레코드)* | **`'NT'` + 타임스탬프 (20자 이내)** | 고객에게 전송된 푸시메시지 고유 식별자 |
| | | `USER_NO` | *(신규 레코드)* | **`'C20261100001'`** (발주 의뢰 고객) | **푸시를 수신할 이용자(고객) 회원번호** |
| | | `NOTI_TYPE` | *(신규 레코드)* | **`'QUOTE_MATCH'`** | 청약 접수 및 매칭 알림 분류 코드 |
| | | `TITLE` | *(신규 레코드)* | **`'[청약 접수] 전문 시공사(공간다원)에서 청약 신청을 완료하였습니다.'`** | 고객 모바일/웹 상단 알림 바에 노출되는 타이틀 |
| | | `CONTENT` | *(신규 레코드)* | **`'[쓸고닦고] 발주번호: ORD-20261116-0001\n시공사: 공간다원\n현장: 경기 고양시 일산동구 백석동 120-1...\n고객님이 의뢰하신 청소 발주에 대해 [공간다원] 시공사 파트너가 청약 신청을 완료하였습니다.'`** | 고객이 청약서를 확인하도록 유도하는 상세 푸시 본문 |
| | | `TARGET_URL` | *(신규 레코드)* | **`'/preview_client/WEB-CLNT-ORD-010100.html?orderNo=ORD202611160001'`** | 고객 클릭 시 청약서 비교/선택 화면으로 바로 이동하는 링크 |
| | | `IS_READ` | *(신규 레코드)* | **`'N'`** | 미확인 상태 (고객 GNB 벨 뱃지 카운트 +1 반영) |
| | | `REG_DT` | *(신규 레코드)* | **`NOW()`** | 알림 발송 일시 |

---

## 3. 백엔드 (BackEnd) API 명세

### 3.1 시공사 청약 신청 및 고객 푸시 발송 API
- **Endpoint**: `POST /api/contractor/bid/apply` (동의어: `/api/web/contractor/bid_apply`)
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "orderNo": "ORD-20261116-0001",
    "contractorUserNo": "S20261100001",
    "contractorNm": "공간다원",
    "notiId": "NT202611160001001"
  }
  ```
- **Response Body (200 OK)**:
  ```json
  {
    "success": true,
    "message": "시공 청약 신청이 성공적으로 접수되었으며, 이용자(고객)에게 청약 도착 푸시 알림이 발송되었습니다.",
    "data": {
      "orderNo": "ORD202611160001",
      "rawOrderNo": "ORD-20261116-0001",
      "orderStatus": "BID_APPLIED",
      "serviceStatus": "BID_APPLIED",
      "applyStatCd": "APPLIED",
      "contractorUserNo": "S20261100001",
      "contractorNm": "공간다원",
      "targetClientUserNo": "C20261100001",
      "clientNotiId": "NT1795164875499",
      "clientNotiTitle": "[청약 접수] 전문 시공사(공간다원)에서 청약 신청을 완료하였습니다."
    }
  }
  ```

---

## 4. 프론트엔드 모달 UI 및 상태 관리 명세

### 4.1 상태 정의
```javascript
const [activeNotiModal, setActiveNotiModal] = useState(null); // 활성화된 알림 모달 객체
const [bidSubmitSuccessMsg, setBidSubmitSuccessMsg] = useState(''); // 청약 완료 결과 피드백 문구
const [isSubmittingBid, setIsSubmittingBid] = useState(false); // 중복 클릭 방지 로딩 상태
```

### 4.2 청약 제출 핸들러 (`handleApplyContractorBid`)
```javascript
const handleApplyContractorBid = async (notiItem) => {
  if (!notiItem || isSubmittingBid) return;
  setIsSubmittingBid(true);
  try {
    const res = await fetch('/api/contractor/bid/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNo: notiItem.orderNo || 'ORD-20261116-0001',
        notiId: notiItem.notiId || 'NT202611160001001',
        contractorUserNo: profileData?.userNo || userInfo?.USER_NO || 'S20261100001',
        contractorNm: profileData?.companyNm || userInfo?.USER_NM || '공간다원'
      })
    });
    const result = await res.json();
    if (result && result.success) {
      setBidSubmitSuccessMsg(
        `[${profileData?.companyNm || userInfo?.USER_NM || '공간다원'}] 본 발주에 대한 시공 청약 신청이 정상 접수되었습니다!\n\n` +
        `• 청소 용역 상태: '청약(BID_APPLIED)'으로 갱신 완료\n` +
        `• 이용자(고객)에게 실시간 청약 도착 푸시 메시지 발송 완료`
      );
      if (typeof fetchNotifications === 'function') fetchNotifications();
    } else {
      alert(result.message || '청약 신청 중 오류가 발생했습니다.');
    }
  } catch (err) {
    console.error('Bid apply error:', err);
    alert('서버 통신 오류가 발생했습니다.');
  } finally {
    setIsSubmittingBid(false);
  }
};
```

---

## 5. 테스트 및 검증 체크리스트

| 번호 | 검증 항목 | 기대 결과 | 실제 검증 결과 |
| :---: | :--- | :--- | :---: |
| 1 | **청약 신청 버튼 클릭 시 API 호출** | `POST /api/contractor/bid/apply` 호출 및 정규화된 발주/회원 파라미터 전달 | **PASS (200 OK)** |
| 2 | **발주 상태('BID_APPLIED') 갱신** | `TB_ORDER_MSTR.ORDER_STATUS`가 `'BID_APPLIED'`(청약 완료)로 정상 UPDATE 되는가? | **PASS** |
| 3 | **용역 진행 상태('BID_APPLIED') 갱신** | `TB_ORDER_DTL.SERVICE_STATUS`가 `'BID_APPLIED'`, `SELECTED_SERVICE_USER_NO`가 시공사로 정상 UPDATE 되는가? | **PASS** |
| 4 | **시공사 청약서 원장 생성** | `TB_QUOTE_APPLY`에 `APPLY_STAT_CD = 'APPLIED'` 레코드가 신규 생성되는가? | **PASS** |
| 5 | **이용자(고객) 실시간 푸시 발송** | `TB_USER_NOTIFICATION`에 고객(`C20261100001`) 수신용 `'QUOTE_MATCH'` 알림이 `IS_READ = 'N'`으로 정상 INSERT 되는가? | **PASS** |
| 6 | **화면 UI 성공 피드백** | 모달 내 에메랄드 성공 배너 출력 및 `[확인 완료]` 버튼으로 정상 전환되는가? | **PASS** |

---

## 6. 결론 및 유지보수 가이드
1. **상태의 원자적 일치성**: 시공사가 청약 신청을 클릭하는 즉시 `TB_ORDER_MSTR`(발주 마스터), `TB_ORDER_DTL`(용역 상태), `TB_QUOTE_APPLY`(시공사 청약), `TB_USER_NOTIFICATION`(고객 푸시)이 하나의 비즈니스 트랜잭션으로 일괄 동기화되므로 데이터 정합성이 완벽히 보장됩니다.
2. **실시간 푸시 알림 수신**: 이용자(고객)는 다음 턴 접속 시 상단 GNB 벨 이모티콘에 미확인 알림 뱃지(+1)가 즉시 표출되며, 클릭 시 "시공사(공간다원)에서 청약 신청을 완료하였습니다" 푸시를 열람하고 청약서 비교 선택 화면(`WEB-CLNT-ORD-010100`)으로 바로 진입할 수 있습니다.
