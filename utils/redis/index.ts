// import { Redis } from 'ioredis';

const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  throw new Error('REDIS_URL is not defined');
};

const getUpstashUrl = () => {
  if (process.env.UPSTASH_REDIS_REST_URL) {
    return process.env.UPSTASH_REDIS_REST_URL;
  }
  throw new Error('UPSTASH_REDIS_REST_URL is not defined');
};

const getUpstashToken = () => {
  if (process.env.UPSTASH_REDIS_REST_TOKEN) {
    return process.env.UPSTASH_REDIS_REST_TOKEN;
  }
  throw new Error('UPSTASH_REDIS_REST_TOKEN is not defined');
};

export const redis = new Redis(getRedisUrl(), getUpstashToken());
