import type { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '@/utils/redis';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method == 'GET') {
    const bearerAuth = req.headers.authorization;
    const bearerToken = bearerAuth?.slice(7);

    if (bearerToken !== process.env.CRON_SECRET) {
      return res.status(401).end('Unauthorized');
    } else {
      console.log('OK');
      try {
        console.log('TRY');
        const keys = await new Promise<string[]>((resolve, reject) => {
          var stream = redis.scanStream({
            match: 'get*',
          });
          const keys: string[] = [];
          stream.on('data', function (data) {
            keys.push(...data);
          });
          stream.on('end', function () {
            resolve(keys);
          });
          stream.on('error', function (error) {
            reject(error);
          });
        });

        console.log('STREAM');
        if (keys.length) {
          console.log('IF STREAM');
          var pipeline = redis.pipeline();
          keys.forEach(function (key) {
            console.log('KEY');
            pipeline.del(key);
          });
          await pipeline.exec();
        }
      } catch (e) {
        console.log('erreur:' + e);
        return res.status(500).end('Internal Server Error');
      }

      res.status(200).end('cleaned cached lists');
    }
  } else {
    res.status(405).send({ error: 'Only GET requests are allowed' });
    return;
  }
}
