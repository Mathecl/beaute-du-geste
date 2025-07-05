import { Redis } from '@upstash/redis';

const getUpstashRestUrl = () => {
  if (process.env.UPSTASH_REDIS_REST_URL) {
    return process.env.UPSTASH_REDIS_REST_URL;
  }
  throw new Error('UPSTASH_REDIS_REST_URL is not defined');
};

const getUpstashRestToken = () => {
  if (process.env.UPSTASH_REDIS_REST_TOKEN) {
    return process.env.UPSTASH_REDIS_REST_TOKEN;
  }
  throw new Error('UPSTASH_REDIS_REST_TOKEN is not defined');
};

export const upstash = new Redis({
  url: getUpstashRestUrl(),
  token: getUpstashRestToken(),
});
