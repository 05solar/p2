import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';

// ─────────────────────────────────────────────────────────────
// 의존성 없는 JSON 파일 저장소.
// 단일 인스턴스에서 별도 DB 프로세스 없이 동작하도록 설계했습니다.
// 컬렉션은 메모리에 로드되고, 변경 시 디스크에 동기 저장됩니다.
// ─────────────────────────────────────────────────────────────

const COLLECTIONS = ['users', 'lectures', 'enrollments', 'sessions', 'records'];

function emptyData() {
  return Object.fromEntries(COLLECTIONS.map((c) => [c, []]));
}

let data = emptyData();

function load() {
  try {
    const raw = fs.readFileSync(config.dataFile, 'utf-8');
    data = { ...emptyData(), ...JSON.parse(raw) };
  } catch {
    data = emptyData();
  }
}

function save() {
  fs.mkdirSync(path.dirname(config.dataFile), { recursive: true });
  const tmp = `${config.dataFile}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, config.dataFile);
}

function reset() {
  data = emptyData();
  save();
}

// 첫 로드
load();

export const store = {
  get users() { return data.users; },
  get lectures() { return data.lectures; },
  get enrollments() { return data.enrollments; },
  get sessions() { return data.sessions; },
  get records() { return data.records; },
  save,
  load,
  reset,
  isEmpty: () => data.users.length === 0,
};
