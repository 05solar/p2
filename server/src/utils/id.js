import { randomUUID } from 'node:crypto';

// 접두사 + 짧은 UUID 로 사람이 읽기 쉬운 식별자를 만듭니다.
export const newId = (prefix = 'id') => `${prefix}_${randomUUID().slice(0, 8)}`;

// 6자리 숫자 출석 인증번호
export const newAttendanceCode = () =>
  String(Math.floor(100000 + Math.random() * 900000));
