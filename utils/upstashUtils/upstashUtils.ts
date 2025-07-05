import { upstash } from '@/utils/upstash';

// interface UserJwtPayload {
//   jti: string; // jwt id
//   iat: number;
// }

export async function upstashSet(key, value) {
  if (upstash.status === 'end') {
    console.log('reconnect to upstash...');
    upstash.connect();
  }
  const upstashSet = await upstash.set(key, JSON.stringify(value), { ex: 24 });
  // await upstash.quit();
  return upstashSet;
}

export async function upstashShortSet(key, value) {
  if (upstash.status === 'end') {
    console.log('reconnect to upstash...');
    upstash.connect();
  }
  const upstashSet = await upstash.set(key, JSON.stringify(value), { ex: 1 });
  // await upstash.quit();
  return upstashSet;
}

export async function upstashGet(key) {
  if (upstash.status === 'end') {
    console.log('reconnect to upstash...');
    upstash.connect();
  }
  const upstashGet = await upstash.get(key);
  // await upstash.quit();
  return upstashGet;
}
