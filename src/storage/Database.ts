import localforage from 'localforage';

export type DatabaseKeys = 'vimState' | 'vimEditors';

// fake a cache so we don't slow down stuff we've already seen
let fakeCache: Record<string, unknown> = {};

export async function fakeNetwork(key?: string): Promise<unknown> {
  if (!key) {
    fakeCache = {};
  }

  if (key) {
    if (fakeCache[key]) {
      return;
    }

    fakeCache[key] = true;
  }
  return new Promise((res) => {
    setTimeout(res, Math.random() * 800);
  });
}

export function setInDatabase<T>(key: DatabaseKeys, items: T): Promise<T> {
  return localforage.setItem<T>(key, items);
}
