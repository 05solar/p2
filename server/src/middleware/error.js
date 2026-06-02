// 컨트롤러에서 throw 된 에러를 일관된 JSON 형태로 변환합니다.
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function notFound(req, res) {
  res.status(404).json({ error: '요청한 리소스를 찾을 수 없습니다.' });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  res.status(status).json({ error: err.message || '서버 오류가 발생했습니다.' });
}

// async 컨트롤러 래퍼 — try/catch 보일러플레이트 제거
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
