# STITCH AI Prompt – WEB-CLNT-MYP-010100 (내정보 관리 화면 Frontend)

[Prompt ID] WEB-CLNT-MYP-010100 (내정보 관리 화면 Frontend)

## 목적
STITCH AI에게 `내정보 관리` 화면의 프론트엔드 코드를 유지보수하거나 확장할 때 필요한 정보를 제공한다.

## 주요 컴포넌트
- 비밀번호 변경 섹션
- 로그아웃 버튼
- 회원탈회 버튼 (빨간색 강조)
- 회원탈퇴 안내 버튼
- 신규 회원탈회 모달 및 확인 모달 (추후 구현)

## 유지보수 체크리스트
1. **버튼 배치**: 로그아웃·회원탈회·회원탈퇴 안내 버튼은 비밀번호 재설정 버튼 바로 아래, `flex items-center space-x-2 mt-2` 컨테이너 안에 있어야 함.
2. **스타일**: 회원탈회 버튼은 `bg-red-600 hover:bg-red-700 text-white` 로 강조. 로그아웃 버튼도 동일 색상 사용.
3. **핸들러**:
   - `handleConfirmLogout` – 로그아웃 확인.
   - `handleOpenLeaveModal` – 회원탈회 모달 열기 (플레이스홀더 alert, 추후 모달 교체).
   - `handleOpenDeleteModal` – 회원탈퇴 안내 alert.
4. **상태 관리**: `hasPendingJobs` 상태를 백엔드 `/api/web/client/leave` 로부터 받아 `회원탈회` 버튼 `disabled` 처리 및 툴팁 표시.
5. **접근성**: 버튼에 `type="button"` 명시, 적절한 `aria-label` 추가.

## STITCH AI에게 요청 가능한 예시
- "로그아웃과 회원탈회 버튼을 현재 디자인 가이드에 맞게 Tailwind 클래스로 업데이트 해줘."
- "회원탈회 버튼을 비활성화할 때 툴팁을 추가하는 코드를 작성해줘."
- "새로운 회원탈회 모달 컴포넌트를 React Hook 형태로 구현해줘."

---

*이 프롬프트는 `.cursorrules`에 명시된 UI 변경 명세와 일치하도록 유지보수 시 활용한다.*