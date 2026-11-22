# [프로그램 상세 명세서] 시공 파트너 현장 진행 현황 (APP-SRVC-JOB-020000)

## 1. 화면 및 아키텍처 개요
- **화면 ID**: `APP-SRVC-JOB-020000`
- **화면명**: 시공 파트너 현장 진행 현황 (`Contractor Mobile On-Site Progress Hub`)
- **화면 구분**: Main 화면 (모바일 하단 탭 네비게이션 "현장 진행" 연동)
- **프론트엔드 경로**: `SseulDakGo_App/Service/screens/APP-SRVC-JOB-020000/index.tsx`
- **백엔드 모듈 경로**: `SseulDakGo_App/Service/backend/api_APP_SRVC_JOB_020000/route.js`
- **API 엔드포인트**: `GET /api/app/service/job_020000`
- **아키텍처 방식**: 모바일 앱 (React Native / Capacitor WebView Shell)
- **목적**:
  - 모바일 환경에서 시공사(용역) 회원이 배차 및 수주 확정된 현장의 실시간 시공 상태를 확인하고 관제합니다.
  - 모바일 터치 환경에 최적화된 5단계 시공 타임라인 시각화 및 고객 안심번호(0504) 원터치 전화 연결을 제공합니다.
  - 시공사 담당자 성명 우측에 `[시공사진첨부]` 및 `[시공완료 등록]` 액션 버튼을 배치하여 모바일 전용 모달/바텀시트(`APP-SRVC-JOB-020100`, `APP-SRVC-JOB-020200`)를 호출합니다.

---

## 2. 핵심 비즈니스 규칙 및 모바일 UI 명세

### 2.1 필수 출력 항목
1. **발주고객 성명**: 발주 고객명 및 안심번호(0504) 원터치 전화 통화 연결 배지 (예: `김충훈 님 (안심번호 0504 통화)`)
2. **현장 주소**: 시공 현장 기본주소 및 상세주소, 모바일 지도 네비게이션 연동 버튼 (예: `경기 고양시 일산동구 백석동 120-1 (백석 상가빌딩 1~2층)`)
3. **진행 상태 (모바일 5단계 Stepper)**:
   - 1단계: 예약 확정 (10:00 완료)
   - 2단계: 현장 도착 (13:45 GPS 체크)
   - 3단계: 시공 진행중 (현재 72% 진행 - Active)
   - 4단계: 현장 최종검수 (17:00 예정)
   - 5단계: 서명 및 완료 (안심정산 대기)
4. **시공사 담당자 성명**: 현장 배정 책임자 (예: `공간다원 김태호 팀장 / 1급 위생관리사`)

### 2.2 제어 버튼 배치
- "시공사 담당자 성명" 우측에 가로/터치 친화형 2개 액션 버튼 배치:
  1. 📷 **`[시공사진첨부]`** (Emerald #006a61): `APP-SRVC-JOB-020100` 모달/바텀시트 호출 (카메라 촬영 연동)
  2. ✅ **`[시공완료 등록]`** (Primary Navy #003d9b): `APP-SRVC-JOB-020200` 모달/바텀시트 호출 (체크리스트 & 완료 승인 요청)

---

## 3. 하위 종속 모달 채번 규칙 (중분류 1씩 증가)
- 메인 화면: `APP-SRVC-JOB-020000` (중분류 `00`)
- **모달 1**: `APP-SRVC-JOB-020100` (중분류 `01` - 시공사진첨부)
- **모달 2**: `APP-SRVC-JOB-020200` (중분류 `02` - 시공완료등록)

---

## 4. 백엔드 API 규격 (`GET /api/app/service/job_020000`)
- **WEB/APP 백엔드 비즈니스 로직 동등성 원칙**에 따라 `WEB-SRVC-JOB-020000`과 100% 동일한 쿼리 및 응답 구조 유지.
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
