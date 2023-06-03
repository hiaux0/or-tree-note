export class ObjectService {
  public static pick<T, Prop extends keyof T>(obj: T, keys: Prop[]) {
    const result: Partial<T> = {};
    keys.forEach((key) => {
      result[key] = obj[key];
    });

    return result;
  }
}
