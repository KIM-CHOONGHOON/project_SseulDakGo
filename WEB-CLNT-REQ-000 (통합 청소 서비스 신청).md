# [SseulDakGo (쓸고닦고)] WEB-CLNT-REQ-000 (통합 청소 서비스 신청) 개발 및 테스트 명세서

---

## 1. 화면 및 아키텍처 개요

| 항목 | 내용 |
| :--- | :--- |
| **화면 ID** | `WEB-CLNT-REQ-000` |
| **화면명** | 통합 청소 서비스 신청 및 발주서 작성 (Integrated Cleaning Service Request) |
| **지원 채널** | Web [Y] / Mobile Web [Y] (반응형 모달/풀스크린 뷰) |
| **도메인 역할** | `Client` (고객 전용 발주서 등록) |
| **프론트엔드 파일** | [`SseulDakGo_Web/Client/frontend/WEB-CLNT-REQ-000/index.jsx`](file:///Users/handsupbus/project_SseulDakGo/SseulDakGo_Web/Client/frontend/WEB-CLNT-REQ-000/index.jsx) |
| **백엔드 라우터 파일** | [`SseulDakGo_Web/Client/backend/api_WEB_CLNT_REQ_000/route.js`](file:///Users/handsupbus/project_SseulDakGo/SseulDakGo_Web/Client/backend/api_WEB_CLNT_REQ_000/route.js) |
| **API 엔드포인트** | `POST /api/web/client/req_000` |
| **데이터베이스** | `ssuldak_db` (MySQL 8.0 / InnoDB / `utf8mb4_0900_ai_ci`) |
| **DB 모듈 경로** | `lib/db.js` (`lib/db.ts`) |

### 핵심 아키텍처 준수 규칙
1. **단일 책임 원칙 (SRP) 및 1:1 전용 라우팅**:
   - `WEB-CLNT-REQ-000` 화면 컴포넌트와 백엔드 `POST /api/web/client/req_000` 핸들러 간 1:1 전용 통신을 수행합니다.
2. **표준 주발주번호 채번 체계 (16자리)**:
   $$\mathbf{ORDER\_NO} = \mathbf{ORD} + \mathbf{YYYYMMDD(8자리)} + \mathbf{Sequence(5자리)}$$
   - 예시: `ORD2026103100001`
   - 상세 품목 번호(`ORDER_DTL_NO`): `ORD202610310000101`, `ORD202610310000102` (18자리)
3. **비즈니스 룰 및 이중 유효성 검증**:
   - **정기청소 최소 3개월(90일) 의무 락**: (시공종료일 - 시공시작일) < 90일일 경우 프론트엔드 등록 차단 및 백엔드 `ERR_MIN_PERIOD_NOT_MET` (HTTP 400) 에러 반환.
   - **확정 지정 제안가 양수 검증**: 고객이 직접 지불하고자 하는 현장 직불 노무비를 양수(`> 0`)로 확정 지정.
   - **7일 청약 기한 설정**: `BID_EXPIRE_DT`를 발주 접수일 기준 `NOW() + INTERVAL 7 DAY`로 자동 바인딩.
4. **원자적 다중 테이블 트랜잭션 (Atomic Multi-table Insert)**:
   - `TB_ORDER_MSTR` (주발주 마스터), `TB_ORDER_DTL` (상세 공정 스펙), `TB_ORDER_PHOTO` (현장 사진) 일괄 `executeTransaction` 처리.

---

## 2. 연관 데이터베이스 테이블 및 스키마 명세

### 2.1 `TB_ORDER_MSTR` (주발주 마스터)
| 컬럼명 | 데이터 타입 | 제약 조건 | 설명 |
| :--- | :--- | :--- | :--- |
| `ORDER_NO` | VARCHAR(16) | PK | 주발주 고유번호 (`ORDYYYYMMDD#####`) |
| `CLIENT_USER_NO` | VARCHAR(20) | NOT NULL | 발주 고객 식별번호 (FK: `TB_USER`) |
| `ORDER_STATUS` | VARCHAR(20) | NOT NULL | 발주 상태 (`BID_OPEN`, `CNTR_CONFIRMED` 등) |
| `ADDR_TEXT` | VARCHAR(200) | NOT NULL | 기본 도로명/지번 주소 |
| `ADDR_DETAIL` | VARCHAR(200) | NULL | 상세 주소 (동, 호수, 층수 등) |
| `PROPOSED_PRICE` | INT | NOT NULL | 고객 지정 총 현장 직불금액 |
| `BID_EXPIRE_DT` | DATETIME | NOT NULL | 7일 매칭 공고 마감일시 |
| `REG_DT` / `MOD_DT` | DATETIME | NOT NULL | 등록 및 수정 감사 일시 |

### 2.2 `TB_ORDER_DTL` (발주 상세)
| 컬럼명 | 데이터 타입 | 제약 조건 | 설명 |
| :--- | :--- | :--- | :--- |
| `ORDER_DTL_NO` | VARCHAR(18) | PK | 상세 발주번호 (`{ORDER_NO}01`) |
| `ORDER_NO` | VARCHAR(16) | FK | 소속 주발주 번호 |
| `CLEAN_LARGE_CD` | VARCHAR(20) | NOT NULL | 대분류 (`REGULAR`, `APPLIANCE`, `MOVEIN`) |
| `CLEAN_MID_CD` | VARCHAR(20) | NOT NULL | 중분류 (`VILLA_COMM`, `AIRCON_4WAY`, `APT_30P` 등) |
| `SERVICE_START_DT`| DATE | NOT NULL | 시공 시작(희망)일자 |
| `SERVICE_END_DT` | DATE | NULL | 정기청소 계약 종료일자 |
| `SERVICE_STATUS` | VARCHAR(20) | NOT NULL | 상태 (`MATCH_WAIT`, `APPR_CONTRACT` 등) |

### 2.3 `TB_ORDER_PHOTO` (현장 사진 첨부)
| 컬럼명 | 데이터 타입 | 제약 조건 | 설명 |
| :--- | :--- | :--- | :--- |
| `PHOTO_SEQ` | BIGINT | PK (AI) | 사진 시퀀스 ID |
| `ORDER_NO` | VARCHAR(16) | FK | 연결 발주 번호 |
| `PHOTO_TIMING_CD` | VARCHAR(10) | NOT NULL | 촬영 시점 (`BEFORE`, `AFTER`, `REQ`) |
| `STORAGE_PATH` | VARCHAR(500) | NOT NULL | 물리 파일 저장 경로 |
| `LOGICAL_FILE_NM` | VARCHAR(200) | NOT NULL | 업로드 원본 파일명 |

---

## 3. 프론트엔드 (FrontEnd) 구현 명세

### 3.1 탭 및 UI 구성
1. **헤더 및 카테고리 탭 선택**:
   - `[🏢 정기청소]` / `[❄️ 가전청소]` / `[🏠 입주청소]` 3개 탭 전환
   - 상단 모달 닫기(`X`) 버튼 및 브랜드 로고 안내
2. **시공 주소 및 현장 여건 입력 폼**:
   - Daum/Kakao 우편번호 서비스 및 네이버 지도 지오코딩 연동
   - 상세 주소, 승강기 유무(`있음`/`없음`), 주차 여건(`무료`/`유료 지원`/`불가`)
3. **정기청소 특화 설정 블록**:
   - 3개월 의무 계약 락 캘린더 (시작일 ~ 종료일 선택 시 최소 90일 미만일 경우 즉시 경고 안내 배지 노출)
   - 방문 주기(주 1회/2회/3회/월 4회 등) 및 작업 희망 요일 선택
4. **가전 및 입주청소 세부 스펙 선택**:
   - 에어컨(벽걸이/스탠드/시스템 1way, 4way), 세탁기(통돌이/드럼) 수량 및 기종
   - 공급 평형수, 방 개수, 욕실 개수, 외창 샷시 청소 옵션 토글
5. **확정 제안 금액 및 현장 직불 안내**:
   - 고객 희망 직불 금액 입력 인풋 (천단위 콤마 포맷팅)
   - "역경매 수수료 없는 100% 현장 직불 정찰제" 안내 고지

---

## 4. 백엔드 (BackEnd) API 구현 명세

### 4.1 기본 정보
- **엔드포인트**: `POST /api/web/client/req_000`
- **구현 함수**: `processWebClntReq000(payload)` 및 Next.js App Router `POST(request)`

### 4.2 요청 명세 (Request JSON)
```json
{
  "clientUserNo": "C20261000001",
  "cleanLargeCd": "REGULAR",
  "cleanMidCd": "VILLA_COMM",
  "addrText": "경기 고양시 일산동구 마두동 123-45",
  "addrDetail": "한빛빌딩 1~4층 공용 계단",
  "proposedPrice": 720000,
  "serviceStartDt": "2026-11-01",
  "serviceEndDt": "2027-01-31",
  "weekCleanFreq": 2,
  "cleanDaysConfig": "매주 월, 수",
  "parkingAvailCd": "YES",
  "elevatorYn": "Y",
  "detailReqNote": "복도 난간 및 1층 분리수거장 물청소 포함 요청합니다.",
  "photoList": [
    {
      "photoTimingCd": "BEFORE",
      "storagePath": "/uploads/orders/202610/photo_01.jpg",
      "logicalFileNm": "entrance_before.jpg"
    }
  ]
}
```

### 4.3 응답 명세 (Response JSON)
```json
{
  "success": true,
  "code": "OK",
  "orderNo": "ORD2026103100001",
  "message": "청소 서비스 신청 및 발주서가 성공적으로 등록되었습니다."
}
```

### 4.4 트랜잭션 비즈니스 로직
```javascript
// 1. 최소 90일 유효성 검증
if (cleanLargeCd === 'REGULAR') {
  const diffDays = Math.ceil((new Date(serviceEndDt) - new Date(serviceStartDt)) / (1000 * 60 * 60 * 24));
  if (diffDays < 90) {
    return { status: 400, body: { success: false, code: 'ERR_MIN_PERIOD_NOT_MET', message: '정기청소는 최소 3개월(90일) 이상 선택하셔야 합니다.' } };
  }
}

// 2. 주발주번호 채번 (ORD + YYYYMMDD + 5자리)
const orderNo = await generateOrderNo(connection);

// 3. TB_ORDER_MSTR INSERT
// 4. TB_ORDER_DTL INSERT (ORDER_DTL_NO = orderNo + '01')
// 5. TB_ORDER_PHOTO INSERT (존재 시 루프 실행)
```

---

## 5. 검증 및 테스트 결과

1. **정기청소 3개월 검증**: 89일 선택 시 등록 차단 및 경고 모달 출력 확인. 92일 선택 시 정상 등록.
2. **트랜잭션 정합성**: 마스터 1건 + 상세 1건 + 사진 1건이 롤백 없이 일괄 커밋됨을 단위 테스트로 확인.
3. **피드 연동**: 발주 완료 후 `WEB-CLNT-COM-000` 홈 실시간 피드에 즉시 1순위로 추가 노출됨을 확인.

