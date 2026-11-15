import fs from 'fs';
import path from 'path';

const storageRoot = 'C:\\SseulDakGo_Storage';

// 1. D 드라이브에 혹시 파일이 있다면 C 드라이브로 복사
try {
  const dRoot = 'D:\\SseulDakGo_Storage';
  if (fs.existsSync(dRoot)) {
    console.log('D:\\SseulDakGo_Storage 발견. 파일 확인 및 복사 진행...');
    function copyRec(src, dest) {
      if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
      const entries = fs.readdirSync(src, { withFileTypes: true });
      for (const ent of entries) {
        const s = path.join(src, ent.name);
        const d = path.join(dest, ent.name);
        if (ent.isDirectory()) {
          copyRec(s, d);
        } else {
          if (!fs.existsSync(d)) {
            fs.copyFileSync(s, d);
            console.log('Copied from D to C:', d);
          }
        }
      }
    }
    copyRec(dRoot, storageRoot);
  } else {
    console.log('D:\\SseulDakGo_Storage 없음 또는 접근 불가.');
  }
} catch (e) {
  console.log('D 드라이브 복사 스킵:', e.message);
}

// 2. public/uploads/signatures 내의 서명 파일들을 C:\SseulDakGo_Storage\signatures\{client|partner}\{USER_NO}\ 로 복사
const pubSigRoot = path.join(process.cwd(), 'public', 'uploads', 'signatures');
function scanAndMigrate(dir) {
  if (!fs.existsSync(dir)) return;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      scanAndMigrate(full);
    } else if (item.isFile() && item.name.endsWith('.png')) {
      const match = item.name.match(/(C\d{11}|S\d{11}|P\d{11}|U\d{11})/);
      if (match) {
        const userNo = match[1];
        const isPartner = userNo.startsWith('S') || userNo.startsWith('P');
        const roleType = isPartner ? 'partner' : 'client';
        const targetDir = path.join(storageRoot, 'signatures', roleType, userNo);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        const targetFile = path.join(targetDir, item.name);
        if (!fs.existsSync(targetFile)) {
          fs.copyFileSync(full, targetFile);
          console.log(`Migrated: ${item.name} -> ${targetFile}`);
        }
      }
    }
  }
}
scanAndMigrate(pubSigRoot);
console.log('✅ 서명 파일 마이그레이션 완료.');

