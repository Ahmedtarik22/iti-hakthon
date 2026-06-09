export class AppError extends Error {
  constructor(message, status = 400, code = 'VALIDATION_ERROR') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function sendError(res, status, message, code) {
  return res.status(status).json({ error: message, code });
}
