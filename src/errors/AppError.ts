export class AppError extends Error {
  statusCode: number;
  code?: string;

  constructor(message: string, statusCode = 403, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export default AppError;
