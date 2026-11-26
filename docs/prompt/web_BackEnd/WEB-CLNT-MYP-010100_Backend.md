# Antigravity AI Prompt – WEB-CLNT-MYP-010100 (내정보 관리 화면 Backend)

[Prompt ID] WEB-CLNT-MYP-010100 (내정보 관리 화면 Backend)

## 목적
Antigravity AI에게 `내정보 관리` 화면 관련 백엔드 로직을 유지보수하거나 확장할 때 필요한 정보를 제공한다.

## 주요 API 엔드포인트
- `POST /api/web/client/leave` – 회원탈회 처리. 중간 일련번호에 `+1`을 더한 새로운 Frontend ID 생성 로직 포함.
- `GET /api/web/client/myp_010100` – 사용자 프로필 조회.
- 기타 기존 프로필/알림 API.

## 유지보수 체크리스트
1. **회원탈회 로직**:
   - 요청 시 `userNo`를 받아 진행 중인 청소 용역을 조회.
   - 진행 중인 용역이 없을 경우 `state='탈회'` 로 업데이트하고 `phone`, `email` 컬럼을 `NULL` 로 설정.
   - 용역이 남아있으면 `{ success:false, message:'진행 중인 용역이 있습니다.' }` 반환.
2. **트랜잭션**: 회원탈회와 정산 로직은 DB 트랜잭션으로 묶어 원자성을 보장.
3. **에러 처리**: 모든 예외는 JSON 형태 `{ success:false, error:'...' }` 로 반환.
4. **테스트 케이스**:
   - 진행 중인 용역이 없을 때 정상 탈회.
   - 진행 중인 용역이 있을 때 탈회 차단.
5. **코드 스타일**: ES6 `async/await`, `try/catch`, `module.exports` 사용.

## Antigravity AI에게 요청 가능한 예시
- "회원탈회 API에 진행 중인 청소 용역 검증 로직을 추가해줘."
- "탈회 성공 시 사용자 레코드의 `state`와 `phone`, `email` 필드를 업데이트하는 SQL을 작성해줘."
- "탈회 API에 대한 Jest 단위 테스트 스크립트를 작성해줘."

---

*이 프롬프트는 `.cursorrules`에 기록된 UI/백엔드 사양과 일치하도록 유지보수 시 활용한다.*