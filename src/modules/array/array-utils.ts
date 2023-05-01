import { ArrayType } from 'types/types';

export class ArrayUtils {
  public static findIndexBackwardFromIndex<
    T extends unknown[],
    Result extends ArrayType<T>
  >(
    array: T,
    startIndex: number,
    callback: (arg: Result, index: number, array: T) => boolean
  ): number {
    const newArray = array.slice(0, startIndex).reverse(); // - 1: start from previous block
    const targetIndex = newArray.findIndex(callback);

    const result = startIndex - targetIndex - 1;
    const finalResult = Math.max(0, result);
    return finalResult;
  }

  public static findIndexFromIndex<
    T extends unknown[],
    Result extends ArrayType<T>
  >(
    array: T,
    startIndex: number,
    callback: (arg: Result, index: number, array: T) => boolean
  ): number {
    const newArray = array.slice(startIndex + 1); // + 1: start from next block
    const targetIndex = newArray.findIndex(callback);
    const result = targetIndex + startIndex + 1; // + 1: account for `newArray` adjustment. It also to fix edge case, where we start on an empty new line
    return result;
  }
}
