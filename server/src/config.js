import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 모든 환경 설정을 한 곳에서 관리합니다.
export const config = {
  port: Number(process.env.PORT) || 4000,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-자동출석-change-me',
  jwtExpires: process.env.JWT_EXPIRES || '7d',
  // 기본 데이터 파일: server/data/db.json
  dataFile: process.env.DATA_FILE
    ? path.resolve(process.env.DATA_FILE)
    : path.resolve(__dirname, '..', 'data', 'db.json'),
  // 빌드된 프론트엔드 정적 파일 위치 (단일 인스턴스 서빙)
  clientDist: path.resolve(__dirname, '..', '..', 'client', 'dist'),
};
