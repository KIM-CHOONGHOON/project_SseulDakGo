# [SseulDakGo (쓸고닦고)] WEB-CLNT-REQ-010101 (동일 시공 현장 주소 확인 및 변경 안내 모달) 개발 및 아키텍처 명세서

---

## 1. 화면 및 아키텍처 개요

| 항목 | 내용 |
| :--- | :--- |
| **화면 ID** | `WEB-CLNT-REQ-010101` |
| **화면 구분** | `Sub (모달)` |
| **화면명** | 동일 시공 현장 주소 확인 및 변경 안내 모달 (Duplicate Address Confirmation & Selection Modal) |
| **지원 채널** | Web [Y] / Mobile Web [Y] (상위 발주 모달 내 종속 서브 모달) |
| **도메인 역할** | `Client` (고객 전용 청소 신청 정합성 검증 안내) |
| **상위 부모 화면** | `WEB-CLNT-REQ-010100` (청소 서비스 신청 및 발주서 작성 모달) |
| **프론트엔드 파일** | [`SseulDakGo_Web/Client/frontend/WEB-CLNT-REQ-010101/index.jsx`](file:///c:/GongGanDaWon_Project/project_SseulDakGo/SseulDakGo_Web/Client/frontend/WEB-CLNT-REQ-010101/index.jsx) |
| **백엔드 라우터 파일** | [`SseulDakGo_Web/Client/backend/api_WEB_CLNT_REQ_010101/route.js`](file:///c:/GongGanDaWon_Project/project_SseulDakGo/SseulDakGo_Web/Client/backend/api_WEB_CLNT_REQ_010101/route.js) |
| **API 엔드포인트** | `POST /api/web/client/req_010101` |
| **데이터베이스** | `ssuldak_db` (MySQL 8.0 / InnoDB / `utf8mb4_0900_ai_ci`) |
| **DB 모듈 경로** | `lib/db.js` (`lib/db.ts`) |

---

### 핵심 비즈니스 로직 및 6자리 채번 거버넌스 규칙

1. **6자리 계층형 채번 규칙 (소분류 01 부합)**:
   - 대분류: `01` (청소 의뢰 업무)
   - 중분류: `01` (`WEB-CLNT-REQ-010100` 청소 서비스 신청 및 발주서 작성 모달)
   - 소분류: `01` (중분류 01 모달 내부에서 호출되는 하위 종속 모달 및 분기 로직 처리)
   - 결합 ID: **`WEB-CLNT-REQ-010101`** / **`API_WEB-CLNT-REQ-010101`**

2. **비즈니스 목적**:
   - 고객이 복수 탭(정기청소, 입주/이사 청소, 계절 가전 청소)에 청소 요청 정보를 입력하고 발주를 신청할 때, 탭 간 시공 현장 주소가 동일한 경우 의도된 것인지 오입력인지 확인합니다.
   - **동일 주소 계속 등록([네])**: 확인 즉시 상위 신청 로직으로 복귀하여 등록을 계속 진행합니다.
   - **주소 변경([아니요])**: 주소를 다르게 지정하고자 하는 청소 탭(예: `[🏢 정기청소 주소 변경]`, `[🏠 입주/이사 청소 주소 변경]`, `[❄️ 계절 가전 청소 주소 변경]`)을 선택받아 해당 탭으로 화면을 즉시 전환하고 네이버 주소 검색 팝업을 연계 실행합니다.

3. **단일 책임 원칙 (SRP) 및 독립 컴포넌트화**:
   - 상위 모달의 코드 비대화를 방지하고, 독립적인 Props 인터페이스(`duplicateTabs`, `tabAddresses`, `onConfirmContinue`, `onSelectChangeTab`)를 통해 재사용성과 유지보수성을 극대화합니다.

---

## 2. 프론트엔드 (FrontEnd) 구현 명세

### 2.1 Props 인터페이스 명세
```typescript
interface WebClntReq010101ModalProps {
  isOpen: boolean;                                     // 모달 노출 여부
  duplicateTabs: Array<'REGULAR' | 'MOVEIN' | 'APPLIANCE'>; // 주소가 동일하게 감지된 탭 목록
  tabAddresses: Record<string, {                       // 탭별 시공 현장 주소 데이터
    addrText: string;
    addrDetail?: string;
    sidoNm?: string;
    sigunguNm?: string;
  }>;
  tabNameMap?: Record<string, string>;                 // 탭 한글 명칭 맵
  onConfirmContinue: () => void;                       // [네 (계속 등록)] 클릭 핸들러
  onSelectChangeTab: (tabKey: string) => void;         // [아니요 -> 탭 선택] 클릭 핸들러
  onClose?: () => void;                                // 모달 닫기
}
```

### 2.2 화면 단계(Step) 상태 머신
1. **`CONFIRM` 단계**:
   - 주소가 동일한 탭 목록(예: `[정기청소]`, `[입주/이사 청소]`)과 해당 주소 텍스트 요약 표출.
   - 메시지: *"입력하신 [정기청소, 입주/이사 청소] 탭의 시공 주소가 동일합니다. 동일한 주소로 계속 등록하시겠습니까?"*
   - 액션:
     - `[네 (계속 등록)]` -> `onConfirmContinue()` 호출 후 모달 종료
     - `[아니요 (주소 변경)]` -> 상태를 `SELECT_TAB`으로 전환
2. **`SELECT_TAB` 단계**:
   - 중복된 탭 목록을 개별 카드 버튼으로 표출.
   - 사용자가 주소를 바꿀 탭 클릭 시 `onSelectChangeTab(tabKey)` 호출 -> 해당 탭 전환 및 주소 검색창 자동 오픈.

---

## 3. 백엔드 (BackEnd) 구현 명세

### 3.1 엔드포인트: `POST /api/web/client/req_010101`
- **프로그램 ID**: `API_WEB-CLNT-REQ-010101`
- **물리 경로**: `SseulDakGo_Web/Client/backend/api_WEB_CLNT_REQ_010101/route.js`
- **핵심 역할**:
  1. 클라이언트가 제출하기 전 복수 탭의 주소 정합성 및 중복 여부를 사전 검증 (`action: 'CHECK_DUPLICATE'`)
  2. 고객의 동일 주소 계속 등록 승인 이력 또는 변경 선택 이력 감사 로깅 (`action: 'LOG_CONFIRMATION'`)
- **요청 Body**:
  ```json
  {
    "clientUserNo": "C20261000001",
    "action": "CHECK_DUPLICATE",
    "tabsData": [
      { "tabKey": "REGULAR", "addrText": "경기 고양시 일산동구 마두동 802-1", "addrDetail": "삼혜빌딩 4층" },
      { "tabKey": "MOVEIN", "addrText": "경기 고양시 일산동구 마두동 802-1", "addrDetail": "삼혜빌딩 4층" }
    ]
  }
  ```
- **응답 Body**:
  ```json
  {
    "success": true,
    "hasDuplicates": true,
    "duplicateGroups": [
      {
        "address": "경기 고양시 일산동구 마두동 802-1 삼혜빌딩 4층",
        "tabKeys": ["REGULAR", "MOVEIN"],
        "tabNames": ["정기청소", "입주/이사 청소"]
      }
    ],
    "message": "2개 이상의 청소 요청 탭에서 동일한 주소가 감지되었습니다."
  }
  ```

