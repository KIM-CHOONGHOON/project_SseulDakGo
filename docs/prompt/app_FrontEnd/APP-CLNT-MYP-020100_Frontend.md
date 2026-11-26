# STITCH AI Prompt – APP-CLNT-MYP-020100 (내정보 관리 화면 App Frontend)

[Prompt ID] APP-CLNT-MYP-020100 (내정보 관리 화면 App Frontend)

## 목적
STITCH AI에게 모바일 앱 `내정보 관리` 화면(마이 페이지)의 프론트엔드 코드를 유지보수·확장할 때 필요한 정보를 제공한다.

## 주요 컴포넌트
- 프로필 정보 표시 영역
- 비밀번호 재설정 버튼
- 로그아웃 버튼
- 회원탈회 버튼 (빨간색 강조)
- 회원탈퇴 안내 버튼
- 추후 구현될 **회원탈회 모달**

## 유지보수 체크리스트
1. **버튼 배치**: 비밀번호 재설정 아래에 `flex-row` 컨테이너를 만들어 로그아웃·회원탈회·회원탈퇴 안내 3개 버튼을 가로 배치.
2. **스타일**: Tailwind CSS 사용. 회원탈회 버튼은 `bg-red-600 hover:bg-red-700 text-white` 로 강조.
3. **핸들러**:
   - `handleLogout` – 로그아웃 로직 (앱 전역 로그아웃 함수 호출).
   - `handleOpenLeaveModal` – 회원탈회 모달 열기 (플레이스홀더 alert, 추후 React Native Modal 로 교체).
   - `handleOpenDeleteModal` – 회원탈퇴 안내 alert.
4. **상태 관리**: `hasPendingJobs` 를 백엔드 `/api/app/client/leave` 로부터 받아 `회원탈회` 버튼 `disabled` 처리 및 툴팁 표시.
5. **접근성**: 버튼에 `accessibilityLabel` 및 `testID` 제공.

## STITCH AI에게 요청 가능한 예시
- "앱 내정보 관리 화면에 회원탈회 버튼을 빨간색으로 강조하고, 비활성시 툴팁을 추가하는 코드를 작성해줘."
- "React Native에서 회원탈회 모달을 Hook 형태로 구현하는 예시를 보여줘."

---

*이 프롬프트는 앱 UI 유지보수 시 `.cursorrules`에 정의된 사양과 일치하도록 사용한다.*