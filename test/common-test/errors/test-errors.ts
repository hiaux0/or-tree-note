export class TestError {
  message: string;

  constructor(message?: string) {
    const finalMessage = `[TestError] ${message}`;
    this.message = finalMessage;
  }

  log(message: string): void {
    console.log(`[TestError] ${message}`);
  }
}

export const testError = new TestError();
