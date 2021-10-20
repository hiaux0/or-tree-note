export class GherkinTestUtil {
  static replaceQuotes(input: string): string {
    const result = input.replace(/['"]/g, '');
    return result;
  }
}
