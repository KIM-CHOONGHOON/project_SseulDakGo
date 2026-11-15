import fs from 'fs';
import path from 'path';

// 대화 트랜스크립트 파일 경로
const convId = '87962c37-9758-416c-8c41-d45163da578e';
const transcriptPath = path.join(
  process.env.USERPROFILE || 'C:\\Users\\chung',
  '.gemini',
  'antigravity',
  'brain',
  convId,
  '.system_generated',
  'logs',
  'transcript.jsonl'
);

function printUsage() {
  if (!fs.existsSync(transcriptPath)) {
    console.log('트랜스크립트 파일을 찾을 수 없습니다.');
    return;
  }

  const lines = fs.readFileSync(transcriptPath, 'utf8').trim().split('\n');
  let totalInput = 0;
  let totalOutput = 0;
  let lastCache = 0;
  let lastStep = null;

  for (const line of lines) {
    try {
      const step = JSON.parse(line);
      if (step.input_tokens || step.output_tokens) {
        totalInput += (step.input_tokens || 0);
        totalOutput += (step.output_tokens || 0);
        lastCache = step.cache_read_tokens || lastCache;
        lastStep = step;
      }
    } catch (e) {}
  }

  console.clear();
  console.log('===============================================================');
  console.log('📊 [Antigravity 실시간 토큰 사용량 모니터]');
  console.log('===============================================================');
  if (lastStep) {
    console.log(`⏱ 최근 응답 스텝: Step ${lastStep.step_index} (${lastStep.created_at})`);
    console.log(`🤖 모델: ${lastStep.model || 'Gemini'}`);
    console.log('---------------------------------------------------------------');
    console.log(`🔹 [최근 턴] 신규 입력(Prompt):   ${(lastStep.input_tokens || 0).toLocaleString()} tokens`);
    console.log(`⚡ [최근 턴] 캐시 읽기(Context):  ${(lastStep.cache_read_tokens || 0).toLocaleString()} tokens`);
    console.log(`🔸 [최근 턴] 모델 출력(Output):   ${(lastStep.output_tokens || 0).toLocaleString()} tokens`);
    console.log('---------------------------------------------------------------');
    console.log(`📈 [누적 사용량] 총 신규 입력:    ${totalInput.toLocaleString()} tokens`);
    console.log(`📈 [누적 사용량] 총 모델 출력:    ${totalOutput.toLocaleString()} tokens`);
    console.log(`💡 [현재 컨텍스트 유지량]:        ${lastCache.toLocaleString()} tokens`);
  } else {
    console.log('토큰 데이터 수집 중...');
  }
  console.log('===============================================================');
  console.log('🔔 3초 주기로 자동 갱신됩니다. (종료: Ctrl + C)');
}

printUsage();
setInterval(printUsage, 3000);
