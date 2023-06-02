import { ArrayType } from 'types/types';

export type ThreeSplitType<T extends unknown[]> = [
  ArrayType<T>,
  T,
  ArrayType<T>
];

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

  /**
   * const input = [0, 1, 2, 3, 4, 5, 6];
   * const result = ArrayUtils.splitFirstMiddleLast(input);
   * result // [0, [1, 2, 3, 4, 5], 6]
   */
  public static splitFirstMiddleLast<T extends unknown[]>(
    array: T
  ): T | ThreeSplitType<T> {
    if (array.length <= 2) return array;

    const split = this.splitIntoParts(array, [1, array.length - 1]);
    const result = [split[0][0], split[1], split[2][0]];
    // @ts-ignore
    return result;
  }

  public static splitIntoParts<T extends unknown[]>(
    array: T,
    splitIndeces: number[]
  ): T {
    // @ts-ignore
    const result: T[] = Array.from(
      { length: splitIndeces.length + 1 },
      () => []
    );
    let splitTracker = 0;
    array.forEach((entry, entryIndex) => {
      const inSplitIndeces = splitIndeces.includes(entryIndex);
      // const legalIndex = splitTracker + 1 < splitIndeces.length;
      const legalIndex = true;
      if (inSplitIndeces && legalIndex) {
        splitTracker++;
      }

      result[splitTracker].push(entry);
    });

    // @ts-ignore
    return result;
  }
}

// const input = [0, 1, 2, 3, 4, 5, 6];
// const result = ArrayUtils.splitIntoParts(input, [1, 3, 7]);
// const result = ArrayUtils.splitIntoParts(input, [1, 3]);
// result; /* ? */
// const expected = [[0], [1, 2], [3, 4, 5, 6]]; /* ? */
// ArrayUtils.splitFirstMiddleLast(input); /*?*/

// const asht: ArrayType<string[]>;
