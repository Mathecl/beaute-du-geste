export interface AppContext {
  appUrl: string;
  // indexeddb = indb
  indbName: string;
  indbStoreName: string;
  indbKeyId: number;
  indbBlob: Blob;
}

export const appContext: AppContext = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || '',
  indbName: 'localcache',
  indbStoreName: 'mp3blobs',
};
