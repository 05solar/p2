import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';
import api from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // API
  app.use('/api', api);

  // ── 단일 인스턴스 서빙 ──────────────────────────────────
  // 빌드된 프론트엔드(client/dist)가 있으면 정적 파일 + SPA 폴백 처리.
  const indexHtml = path.join(config.clientDist, 'index.html');
  if (fs.existsSync(indexHtml)) {
    app.use(express.static(config.clientDist));
    // API 가 아닌 모든 GET 요청은 SPA 로 폴백
    app.get(/^\/(?!api).*/, (req, res) => res.sendFile(indexHtml));
  } else {
    app.get('/', (req, res) =>
      res.json({
        name: '자동출석 API',
        note: '프론트엔드가 아직 빌드되지 않았습니다. client 에서 `npm run build` 후 다시 시작하세요.',
        health: '/api/health',
      }),
    );
  }

  // API 404 + 에러 핸들러
  app.use('/api', notFound);
  app.use(errorHandler);

  return app;
}
