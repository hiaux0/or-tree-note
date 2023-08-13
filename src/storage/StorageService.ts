import localforage from 'localforage';

import { DatabaseKeys, setInDatabase } from './Database';

export class StorageService<T> {
  constructor(
    private readonly key: DatabaseKeys,
    private readonly defaultValue: T
  ) {}

  public static create<T>(key: DatabaseKeys, defaultValue?: T) {
    return new StorageService<T>(key, defaultValue);
  }

  public async save<T>(data: T): Promise<T> {
    await setInDatabase(this.key, data);
    return data;
  }

  public async get(): Promise<T> {
    let data = await localforage.getItem<T>(this.key);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!data) data = this.defaultValue;
    return data;
  }

  public async clear(): Promise<void> {
    await this.save(this.defaultValue);
  }
}
