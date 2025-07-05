import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';

import jwt from 'jsonwebtoken';

import { redisSet, redisGet } from '@/utils/redisUtils/redisUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method == 'GET') {
    try {
      // Use req.headers to get the headers from the request
      const userToken = req.headers.cookie
        ?.split('; ')
        .find((row) => row.startsWith('user-token'))
        ?.split('=')[1];
      const userTokenValue = userToken?.valueOf();

      const secretKey = process.env.JWT_SECRET_KEY;
      if (!secretKey || secretKey.length === 0) {
        throw new Error('The environment variable JWT_SECRET_KEY is not set');
      }

      // Verify and decode the JWT token
      const payload = jwt.verify(userTokenValue, secretKey);
      const jwtPayload = payload;

      // Log jwt payload
      jwtPayload['jwt'] = userTokenValue;

      // Date handler && JWT Handler & Redis key: get / set
      const userName = (
        jwtPayload as { userPrismaName: string }
      ).userPrismaName.toLowerCase();
      // .replace(/\s/g, "") to erase spaces
      const userNameWithoutSpaces =
        'get' + userName.replace(/\s/g, '') + 'Infos';

      const cachedValue = await redisGet(userNameWithoutSpaces);

      if (cachedValue) {
        const parsedCachedValue = JSON.parse(cachedValue);
        const currentTokensUsed = parsedCachedValue[0].userCurrentTokensUsed;
        payload.userCurrentTokensUsed = currentTokensUsed + 1;

        if (currentTokensUsed > 24) {
          return res.status(206).json(payload);
        }
      }

      const updatedJwtPayload = payload;

      await redisSet(userNameWithoutSpaces, updatedJwtPayload, 'userMngmt');

      return res.status(200).json('Successfully updated tokens usage');
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    res.status(405).send({ message: 'Only GET requests allowed' });
    return;
  }
}
