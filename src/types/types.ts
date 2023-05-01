// eslint-disable-next-line @typescript-eslint/array-type
export type ArrayType<T> = T extends Array<infer U> ? U : never;
