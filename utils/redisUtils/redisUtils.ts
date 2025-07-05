import { redis } from '@/utils/redis';

// EX seconds -- Set the specified expire time, in seconds.
// PX milliseconds -- Set the specified expire time, in milliseconds.
// NX -- Only set the key if it does not already exist.
// XX -- Only set the key if it already exist.
// KEEPTTL -- Retain the time to live associated with the key
// GT -- Set expiry only when the new expiry is greater than current one
// LT -- Set expiry only when the new expiry is less than current one
// Integer reply: TTL in seconds.
// Integer reply: -1 if the key exists but has no associated expiration.
// Integer reply: -2 if the key does not exist.

export async function redisDel(key) {
  if (redis.status === 'end') {
    console.log('reconnect to redis...');
    redis.connect();
  }

  const stringifiedKey: string = key;

  const redisDel = await redis.del(stringifiedKey);

  // await redis.expire(stringifiedKey, 10);
  // const ttl = await redis.ttl(stringifiedKey);
  // console.log('TTL:', ttl);
  // await redis.quit();
  return redisDel;
}

export async function redisSet(key: string, value, operationType: string) {
  if (redis.status === 'end') {
    console.log('reconnect to redis...');
    redis.connect();
  }

  const stringifiedKey: string = key;

  // Check if the value is already an array
  const isArray = Array.isArray(value);
  // If not an array, convert it to an array
  const arrayValue = isArray ? value : [value];
  const stringifiedValue: string = JSON.stringify(arrayValue);

  const currentDate = new Date();
  const fixedCurrentDate = new Date(currentDate.getTime() + 43 * 60 * 1000); // 43 minutes later
  const currentDateString = fixedCurrentDate.toLocaleString('fr-FR', {
    timeZone: 'Europe/Paris',
  });
  const expirationDate = new Date(fixedCurrentDate.getTime() + 30 * 60 * 1000); // 30 minutes later
  const expirationDateString = expirationDate.toLocaleString('fr-FR', {
    timeZone: 'Europe/Paris',
  });

  // Switch case to parse the JSON string into a TypeScript object based on operationType
  switch (operationType) {
    case 'userMngmt':
      // Parse the JSON string into a TypeScript object
      const unidminJson: Array<{
        approved: boolean;
        company: string;
        createdAt: string;
        email: string;
        id: string;
        name: string;
        password: string;
        pinCode: string;
        role: string;
        stripeassistant: boolean;
        stripecollab: boolean;
        stripebiznetwork: boolean;
        stripecustomerid: string;
        subscription: string;
        verified: boolean;
        expirationTime?: string; // expirationTime field is optional
      }> = JSON.parse(stringifiedValue);
      // Add the "expirationTime" field if it doesn't exist
      const unidminKeyValue = unidminJson.map((item) => ({
        ...item,
        expirationTime: item.expirationTime || expirationDateString, // Add if not exists, replace with the actual expiration time
      }));
      const stringifiedFinalKeyValue = JSON.stringify(unidminKeyValue);
      const redisSetUser = await redis.set(
        stringifiedKey,
        stringifiedFinalKeyValue,
        'EX',
        24 * 60 * 60,
      );
      // await redis.expire(stringifiedKey, 10);
      // const ttl = await redis.ttl(stringifiedKey);
      // console.log('TTL:', ttl);
      // await redis.quit();
      return redisSetUser;

    case 'sidMngmt':
      // Parse the JSON string into a TypeScript object
      const sidJson: Array<{
        Sid: any;
        Company: any;
        CurrentDate: string;
        ExpirationDate: string;
        expirationTime?: string; // expirationTime field is optional
      }> = JSON.parse(stringifiedValue);
      // Add the "expirationTime" field if it doesn't exist
      const sidKeyValue = sidJson.map((item) => ({
        ...item,
        expirationTime: item.expirationTime || expirationDateString, // Add if not exists, replace with the actual expiration time
      }));
      const stringifiedFinalSidKeyValue = JSON.stringify(sidKeyValue);
      const redisSetSid = await redis.set(
        stringifiedKey,
        stringifiedFinalSidKeyValue,
        'EX',
        24 * 60 * 60,
      );
      // await redis.expire(stringifiedKey, 10);
      // const ttl = await redis.ttl(stringifiedKey);
      // console.log('TTL:', ttl);
      // await redis.quit();
      return redisSetSid;

    case 'midMngmt':
      // Parse the JSON string into a TypeScript object
      const midJson: Array<{
        Sid: any;
        Company: any;
        CurrentDate: string;
        // ExpirationDate: string;
        // expirationTime?: string; // expirationTime field is optional
      }> = JSON.parse(stringifiedValue);
      // Add the "expirationTime" field if it doesn't exist
      const midKeyValue = midJson.map((item) => ({
        ...item,
        // expirationTime: item.expirationTime || expirationDateString, // Add if not exists, replace with the actual expiration time
      }));
      const stringifiedFinalMidKeyValue = JSON.stringify(midKeyValue);
      const redisSetMid = await redis.set(
        stringifiedKey,
        stringifiedFinalMidKeyValue,
        'EX',
        24 * 60 * 60,
      );
      // await redis.expire(stringifiedKey, 10);
      // const ttl = await redis.ttl(stringifiedKey);
      // console.log('TTL:', ttl);
      // await redis.quit();
      return redisSetMid;

    case 'unicashProductMngmt':
      // Parse the JSON string into a TypeScript object
      const unicashJson: Array<{
        uid: number;
        company: string;
        product: string;
        description: string;
        category: string;
        quantity: number;
        price: number;
        inventoryStatus: string;
        rate: number;
        city: string;
        expirationTime?: string; // expirationTime field is optional
      }> = JSON.parse(stringifiedValue);
      // Add the "expirationTime" field if it doesn't exist
      const unicashKeyValue = unicashJson.map((item) => ({
        ...item,
        expirationTime: item.expirationTime || expirationDateString, // Add if not exists, replace with the actual expiration time
      }));
      const stringFinalKeyValue = JSON.stringify(unicashKeyValue);
      const redisSetProduct = await redis.set(
        stringifiedKey,
        stringFinalKeyValue,
        'EX',
        24 * 60 * 60,
      );
      // await redis.expire(stringifiedKey, 10);
      // const ttl = await redis.ttl(stringifiedKey);
      // console.log('TTL:', ttl);
      // await redis.quit();
      return redisSetProduct;

    case 'unicashCartMngmt':
      // Parse the JSON string into a TypeScript object
      const unicashCartJson: Array<{
        uid: number;
        name: string;
        description: string;
        price: string;
        category: string;
        quantity: number;
        inventoryStatus: string;
        rating: string;
        expirationTime?: string; // expirationTime field is optional
      }> = JSON.parse(stringifiedValue);
      // Add the "expirationTime" field if it doesn't exist
      const unicashCartKeyValue = unicashCartJson.map((item) => ({
        ...item,
        expirationTime: item.expirationTime || expirationDateString, // Add if not exists, replace with the actual expiration time
      }));
      const stringCartFinalKeyValue = JSON.stringify(unicashCartKeyValue);
      const redisSetCart = await redis.set(
        stringifiedKey,
        stringCartFinalKeyValue,
        'EX',
        24 * 60 * 60,
      );
      // await redis.expire(stringifiedKey, 10);
      // const ttl = await redis.ttl(stringifiedKey);
      // console.log('TTL:', ttl);
      // await redis.quit();
      return redisSetCart;

    default:
      console.error('Invalid operationType');
      break;
  }
}

export async function redisGet(key) {
  if (redis.status === 'end') {
    console.log('reconnect to redis...');
    redis.connect();
  }

  const currentDate = new Date();
  const fixedCurrentDate = new Date(currentDate.getTime() + 43 * 60 * 1000); // 43 minutes later
  const currentDateString = fixedCurrentDate.toLocaleString('fr-FR', {
    timeZone: 'Europe/Paris',
  });

  const redisKeyGet = await redis.get(key);
  // Parse the JSON string into a TypeScript object
  const parsedRedisJson: Array<{ expirationTime: string }> | null =
    JSON.parse(redisKeyGet);

  // Check if data is not null before accessing the createdAt property
  if (parsedRedisJson !== null && parsedRedisJson.length > 0) {
    const expirationTime = parsedRedisJson[0].expirationTime;

    if (currentDateString > expirationTime) {
      redisDel(key);
    } else {
      // await redis.quit();
      return redisKeyGet;
    }
  } else {
    // console.error('No key found or value is null');
  }
}
