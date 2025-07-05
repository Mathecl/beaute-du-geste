import { NextApiRequest, NextApiResponse } from 'next';

import cookie from 'cookie';

import { verifyAuth } from '@/utils/auth/auth';
import jwt from 'jsonwebtoken';

import { redisSet, redisGet } from '@/utils/redisUtils/redisUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method == 'GET') {
    // Use req.headers to get the headers from the request
    const userCartUID = req.headers.cookie
      ?.split('; ')
      .find((row) => row.startsWith('unicash-cart-uid'))
      ?.split('=')[1];
    const userCartUIDValue = userCartUID?.valueOf();

    try {
      const keyCartUID = 'get' + userCartUIDValue + 'Cart';

      const cachedValue = await redisGet(keyCartUID);
      if (cachedValue) {
        const parsedCachedValue = JSON.parse(cachedValue);
        return res.status(200).json(parsedCachedValue);
      } else {
        return res.status(200).json([]);
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    res.status(405).send({ message: 'Only GET requests allowed' });
    return;
  }
}
