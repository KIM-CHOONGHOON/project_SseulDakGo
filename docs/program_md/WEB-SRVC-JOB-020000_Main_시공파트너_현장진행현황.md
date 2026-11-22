# [프로그램 상세 명세서] 시공 파트너 현장 진행 현황 (WEB-SRVC-JOB-020000)

## 1. 화면 및 아키텍처 개요
- **화면 ID**: `WEB-SRVC-JOB-020000`
- **화면명**: 시공 파트너 현장 진행 현황 (`Contractor On-Site Progress Dashboard`)
- **화면 구분**: Main 화면 (시공사 GNB 네비게이션 "현장 진행 현황" 메뉴 연동)
- **프론트엔드 경로**: `SseulDakGo_Web/Service/frontend/WEB-SRVC-JOB-020000/index.jsx`
- **백엔드 모듈 경로**: `SseulDakGo_Web/Service/backend/api_WEB_SRVC_JOB_020000/route.js`
- **API 엔드포인트**: `GET /api/web/service/job_020000`
- **목적**:
  - 시공사(용역) 회원이 수주/배차 확정된 진행 현장의 실시간 작업 상황을 모니터링하고 관제합니다.
  - 현장별 시공 5단계 진행 상태 시각화 및 현장 책임자 정보를 제공합니다.
  - 시공사 담당자 성명 우측에 `[시공사진첨부]` 및 `[시공완료 등록]` 액션 버튼을 제공하여 2종의 하위 모달을 직결 호출합니다.

---

## 2. 핵심 비즈니스 규칙 및 화면 UI 명세

### 2.1 필수 출력 항목
1. **발주고객 성명**: 발주 고객명 및 안심번호(0504) 연동 상태 (예: `김충훈 님 (안심번호 0504 연결 상태)`)
2. **현장 주소**: 시공 대상 건물의 정확한 주소 (예: `경기 고양시 일산동구 백석동 120-1 (백석 상가빌딩 1~2층)`)
3. **진행 상태 (5단계 시각화 Stepper)**:
   - 1단계: 예약 확정 (10:00 완료)
   - 2단계: 현장 도착 (13:45 체크)
   - 3단계: 시공 진행중 (현재 72% 진행 - Active)
   - 4단계: 현장 최종검수 (17:00 예정)
   - 5단계: 서명 및 완료 (안심정산 대기)
4. **시공사 담당자 성명**: 현장 투입 책임자 정보 (예: `공간다원 시공팀 (담당: 김태호 팀장 / 1급 위생관리사 · 평점 4.98)`)

### 2.2 제어 버튼 배치
- "시공사 담당자 성명" 우측에 가로로 2개의 액션 버튼을 배치:
  1. 📷 **`[시공사진첨부]`** (Emerald #006a61 스타일): 클릭 시 `WEB-SRVC-JOB-020100` 모달 호출
  2. ✅ **`[시공완료 등록]`** (Primary Navy #003d9b 스타일): 클릭 시 `WEB-SRVC-JOB-020200` 모달 호출

---

## 3. 하위 종속 모달 채번 규칙 (중분류 1씩 증가)
- 메인 화면: `WEB-SRVC-JOB-020000` (중분류 `00`)
- **모달 1**: `WEB-SRVC-JOB-020100` (중분류 `01` - 시공사진첨부)
- **모달 2**: `WEB-SRVC-JOB-020200` (중분류 `02` - 시공완료등록)

---

## 4. 백엔드 API 규격 (`GET /api/web/service/job_020000`)
- **Request Query**: `?contractorNo=S20261100001&status=IN_PROGRESS`
- **Response JSON**:
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "orderNo": "SDG202611200001",
        "clientName": "김충훈",
        "safePhone": "0504-1234-5678",
        "address": "경기 고양시 일산동구 백석동 120-1 (백석 상가빌딩 1~2층)",
        "serviceType": "정기청소 (상가 공용부)",
        "progressStep": 3,
        "progressRate": 72,
        "managerName": "김태호 팀장",
        "managerTitle": "1급 위생관리사",
        "rating": 4.98,
        "photoCount": 8
      }
    ]
  }
}
```

---

## 5. 연동 데이터베이스 명세
- `TB_CLEAN_CONTRACT`: 계약 기본 및 진행 상태 (`CONTRACT_STATUS`: 'IN_PROGRESS', 'SVC_COMPLETED' 등)
- `TB_ORDER_MSTR` / `TB_ORDER_DTL`: 발주 정보, 고객명, 현장 주소, 카테고리
- `TB_JOB_PROGRESS`: 현장 5단계 진행 이력 및 실시간 진척도(`PROGRESS_RATE`)
- `TB_USER`: 시공사 담당자 프로필 및 고객 안심번호 매핑
