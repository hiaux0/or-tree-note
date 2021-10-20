export class TestError extends Error {
  message: string;

  constructor(message?: string) {
    const finalMessage = `[TestError] ${message}`;
    super(finalMessage);
  }

  log(message: string): void {
    console.log(`[TestError] ${message}`);
  }
}

export const testError = new TestError();
