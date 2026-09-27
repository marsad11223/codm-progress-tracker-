export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppError";
  }
}

export function actionError(error: unknown, fallback: string): string {
  if (error instanceof AppError) return error.message;
  return fallback;
}
