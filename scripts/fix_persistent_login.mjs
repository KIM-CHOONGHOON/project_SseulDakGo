import fs from 'fs';
import path from 'path';

const files = [
  path.join(process.cwd(), 'preview', 'index.html'),
  path.join(process.cwd(), 'SseulDakGo_Web', 'Client', 'frontend', 'WEB-CLNT-COM-010000', 'index.jsx')
];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/\r\n/g, '\n');

  // 1. userInfo 초기 state 로딩: localStorage/sessionStorage에서 우선 안전 로드
  const oldInitPattern = /const \[userInfo, setUserInfo\] = useState\(\(\) => \{[\s\S]*?return \{\s*isGuest: true,\s*USER_NO: 'GUEST',\s*USER_NM: '비회원',\s*USER_ROLE_CD: 'GUEST',\s*\};\s*\}\);/;
  const newInitCode = `const [userInfo, setUserInfo] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('SSEULDAKGO_AUTH_USER') || sessionStorage.getItem('SSEULDAKGO_AUTH_USER');
        if (stored) {
          const parsed = JSON.parse(stored);
          const userNo = parsed.USER_NO || parsed.userNo;
          const userNm = parsed.USER_NM || parsed.userNm;
          if (userNo && userNo !== 'GUEST') {
            return {
              isGuest: false,
              ...parsed,
              USER_NO: userNo,
              USER_NM: userNm || (userNo.startsWith('S') ? '시공사' : '고객'),
              USER_ROLE_CD: parsed.USER_ROLE_CD || parsed.userRoleCd || (userNo.startsWith('S') ? 'S' : 'C')
            };
          }
        }
      }
    } catch (e) {
      // ignore
    }
    return {
      isGuest: true,
      USER_NO: 'GUEST',
      USER_NM: '비회원',
      USER_ROLE_CD: 'GUEST',
    };
  });`;

  if (oldInitPattern.test(content)) {
    content = content.replace(oldInitPattern, newInitCode);
    console.log(`Updated userInfo initialization in: ${f}`);
  } else {
    console.warn(`oldInitPattern not found in: ${f}`);
  }

  // 2. fetchHomeData 내부: 현재 클라이언트에 이미 로그인된 상태이면 백엔드의 게스트 응답으로 덮어쓰지 않음
  const oldFetchUserBlock = `          if (data.userInfo) {
            setUserInfo({
              isGuest: Boolean(data.isGuest),
              USER_NO: data.userInfo.USER_NO || data.userInfo.userNo || 'C20261100001',
              USER_NM: data.userInfo.USER_NM || data.userInfo.userNm || '김충훈',
              USER_ROLE_CD: data.userInfo.USER_ROLE_CD || data.userInfo.userRoleCd || 'C',
            });
          }`;

  const newFetchUserBlock = `          if (data.userInfo) {
            // 현재 로그인된 유효 회원이 있는데 백엔드가 비회원을 반환하는 경우 덮어쓰기 방지
            const isTargetGuest = Boolean(data.isGuest);
            if (!isTargetGuest || userInfo.isGuest) {
              setUserInfo({
                isGuest: isTargetGuest,
                USER_NO: data.userInfo.USER_NO || data.userInfo.userNo || 'GUEST',
                USER_NM: data.userInfo.USER_NM || data.userInfo.userNm || '비회원',
                USER_ROLE_CD: data.userInfo.USER_ROLE_CD || data.userInfo.userRoleCd || 'GUEST',
              });
            }
          }`;

  if (content.includes(oldFetchUserBlock)) {
    content = content.replace(oldFetchUserBlock, newFetchUserBlock);
    console.log(`Updated fetchHomeData user block in: ${f}`);
  } else {
    console.warn(`oldFetchUserBlock not found in: ${f}`);
  }

  // 3. onSuccessLogin: 무조건 영구 보관 (새로고침 시 로그인 유지 보장)
  const oldSuccessPattern = /onSuccessLogin=\{\(userData\) => \{[\s\S]*?if \(userData\.keepLogin\) \{[\s\S]*?\} else \{[\s\S]*?\}\s*setUserInfo\(updated\);/;
  const newSuccessCode = `onSuccessLogin={(userData) => {
                const roleCd = userData.userRoleCd || userData.USER_ROLE_CD || (userData.userNo?.startsWith('S') ? 'S' : 'C');
                const updated = {
                  isGuest: false,
                  USER_NO: userData.userNo || userData.USER_NO || (roleCd === 'S' ? 'S20261100001' : 'C20261100001'),
                  USER_NM: userData.userNm || userData.USER_NM || userData.name || (roleCd === 'S' ? '공간다원' : '고객'),
                  USER_ROLE_CD: roleCd,
                  USER_EMAIL: userData.userEmail || userData.USER_EMAIL || '',
                };
                localStorage.setItem('SSEULDAKGO_KEEP_LOGIN', 'Y');
                localStorage.setItem('SSEULDAKGO_AUTH_USER', JSON.stringify(updated));
                sessionStorage.setItem('SSEULDAKGO_AUTH_USER', JSON.stringify(updated));
                setUserInfo(updated);`;

  if (oldSuccessPattern.test(content)) {
    content = content.replace(oldSuccessPattern, newSuccessCode);
    console.log(`Updated onSuccessLogin in: ${f}`);
  } else {
    console.warn(`oldSuccessPattern not found in: ${f}`);
  }

  content = content.replace(/\n/g, '\r\n');
  fs.writeFileSync(f, content, 'utf8');
}

// preview_client 동기화
if (fs.existsSync('preview/index.html') && fs.existsSync('preview_client/index.html')) {
  fs.copyFileSync('preview/index.html', 'preview_client/index.html');
  console.log('Synced to preview_client/index.html');
}
