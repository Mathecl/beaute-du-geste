import { useEffect } from 'react';

import { AppContext, appContext } from '@/types/appContext';

let db: IDBDatabase | null = null;

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(appContext.indbName, 1);

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(appContext.indbStoreName)) {
        database.createObjectStore(appContext.indbStoreName, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

export async function storeMP3Blob(id: number, mp3Blob: Blob): Promise<void> {
  const database = await openDB();
  const transaction = database.transaction(
    appContext.indbStoreName,
    'readwrite',
  );
  const store = transaction.objectStore(appContext.indbStoreName);
  const request = store.put({ id, mp3Blob });

  return new Promise<void>((resolve, reject) => {
    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

export async function getMP3Blob(id: number): Promise<Blob | undefined> {
  const database = await openDB();
  const transaction = database.transaction(
    appContext.indbStoreName,
    'readonly',
  );
  const store = transaction.objectStore(appContext.indbStoreName);

  const request = store.get(id);

  return new Promise<Blob | undefined>((resolve, reject) => {
    request.onsuccess = () => {
      const result = request.result;
      if (result && result.mp3Blob) {
        resolve(result.mp3Blob);
      } else {
        resolve(undefined);
      }
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

export async function isDBEmpty(): Promise<boolean> {
  const database = await openDB();
  const transaction = database.transaction(
    appContext.indbStoreName,
    'readonly',
  );
  const store = transaction.objectStore(appContext.indbStoreName);

  const request = store.count();

  return new Promise<boolean>((resolve, reject) => {
    request.onsuccess = () => {
      const count = request.result;
      resolve(count === 0);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

export async function clearDB(): Promise<void> {
  const database = await openDB();
  const transaction = database.transaction(
    appContext.indbStoreName,
    'readwrite',
  );
  const store = transaction.objectStore(appContext.indbStoreName);

  const request = store.clear();

  return new Promise<void>((resolve, reject) => {
    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

export function useIndexedDBEffect(effect: () => void): void {
  useEffect(() => {
    effect();
  }, []);
}
// Use this effect hook to open the IndexedDB when your component mounts
// import { useEffect } from 'react';
// import { openDB, storeMP3Blob, getMP3Blob, clearDB, useIndexedDBEffect } from './indexedDBFunctions';
// useIndexedDBEffect(async () => {
// try {
// const isEmpty = await isDBEmpty();
// if (isEmpty) {
// } else {
// }
// const mp3Blob = new Blob(/* MP3 data */, { type: 'audio/mpeg' });
// await storeMP3Blob('your-mp3-id', mp3Blob);
// const retrievedMP3 = await getMP3Blob('your-mp3-id');
// if (retrievedMP3) {
// }
// await clearDB();
// } catch (error) {
//console.error('IndexedDB Error:', error);
// }
// } catch (error) {
// }
// });
