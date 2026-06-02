import { createApp } from './app.js';
import { config } from './config.js';
import { seedIfEmpty } from './db/seed.js';

seedIfEmpty();

const app = createApp();
app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`\n  자동출석 서버 실행 중 → http://localhost:${config.port}`);
  console.log(`  API 헬스체크        → http://localhost:${config.port}/api/health\n`);
});
