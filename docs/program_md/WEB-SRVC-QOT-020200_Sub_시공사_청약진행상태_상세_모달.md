# WEB-SRVC-QOT-020200: 시공사 청약진행상태 및 청소 요청 상세 (Modal)

## ① 화면 및 아키텍처 개요
- **화면 ID**: `WEB-SRVC-QOT-020200` (APP 대칭: `APP-SRVC-QOT-020200`)
- **화면명**: 시공사 청약진행상태 및 청소 요청 상세 (Modal)
- **프론트엔드 경로**: `SseulDakGo_Web/Service/frontend/WEB-SRVC-QOT-020200/index.jsx`
- **백엔드 모듈**: `SseulDakGo_Web/Service/backend/api_WEB_SRVC_QOT_020200/route.js`
- **API 엔드포인트**: `GET /api/srvc/qot/020200?userNo={SERVICE_USER_NO}&orderNo={ORDER_NO}`

## ② 핵심 아키텍처 및 비즈니스 규칙 (Before vs After)
| 항목 | 변경 전 (Before) | 변경 후 (After) |
| :--- | :--- | :--- |
| 화면 분리 | `WEB-SRVC-MYP-010100` 내 인라인 모달 | 독립 컴포넌트 `WEB-SRVC-QOT-020200/index.jsx` + 1:1 백엔드 `api_WEB_SRVC_QOT_020200/route.js` |
| 승인 전/후 정보 노출 | 구분 없이 동일 정보 출력 | 이용자 청약 승인 전: 시/도/시군구 부분 출력 / 승인 후: 상세주소·고객 안심번호 전체 출력 |

## ③ 프론트엔드 UI/UX 레이아웃 및 상태(State) 관리 명세
- 상단 요약 배너: 발주번호(`ORD-...`) + 진행상태 배지(`#003d9b`)
- 상세 그리드: 청소요청구분, 고객 확정 지정가(`#006a61`), 현장주소(승인 전 `"상세주소는 수락 후 공개"` 배지), 청소범위, (승인 후) 고객 연락처
- 하단 푸터: 가운데 단일 `[확인]` 버튼

## ④ 백엔드 API 명세
- `GET /api/srvc/qot/020200?userNo=...&orderNo=...`
- `isApproved` (`APPLY_STAT_CD === 'ACCEPTED'` 또는 계약 확정 이후 상태) 여부에 따라 `addrDetail`, `contactPersonNm`, `contactTel` 마스킹/공개 제어.

## ⑤ 연동 데이터베이스 명세
- `TB_ORDER_MSTR`, `TB_ORDER_DTL`, `TB_QUOTE_APPLY` (`lib/db.ts` 싱글톤 풀 `executeQuery` 사용)

## ⑥ 테스트 및 검증 체크리스트
- [x] `WEB-SRVC-QOT-020200/index.jsx` 및 `api_WEB_SRVC_QOT_020200/route.js` 작성 완료
- [x] `preview/server.js` 라우트 연결 및 `scripts/build-preview.js` 번들 빌드 완료

## ⑦ 프로그램 유지보수 가이드 및 개발자 주의사항
- 상세주소(`ADDR_DETAIL`) 및 고객 연락처(`CONTACT_TEL`)는 반드시 백엔드에서 승인 상태(`isApproved`)를 검증한 뒤에만 응답에 포함해야 합니다.
