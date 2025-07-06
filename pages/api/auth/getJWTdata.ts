import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

// import { redisSet, redisGet } from '@/utils/redisUtils/redisUtils';

export const todayISODate = () => {
  const todayDate = new Date();
  const todayISODate = todayDate.toISOString().split('T')[0]; // Extract date part only;
  return todayISODate;
};

export const isDateToday = (date: Date): boolean => {
  const todayDate = new Date();
  return (
    date.getFullYear() === todayDate.getFullYear() &&
    date.getMonth() === todayDate.getMonth() &&
    date.getDate() === todayDate.getDate()
  );
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
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

      // const cachedValue = await redisGet(userNameWithoutSpaces);
      const parsedCachedValue = JSON.parse(cachedValue);

      let userTokenUpdateDate = parsedCachedValue[0].userLastTokenUpdateDate;
      // console.log('date from redis:', userTokenUpdateDate);
      // console.log('date from today:', todayISODate());
      let userTokensUsed = parsedCachedValue[0].userCurrentTokensUsed;

      if (
        userTokenUpdateDate === '' ||
        userTokenUpdateDate === undefined ||
        userTokenUpdateDate === null ||
        userTokenUpdateDate !== todayISODate()
      ) {
        // console.log('is not today');
        const todayDate = todayISODate();
        userTokensUsed = 0;
        userTokenUpdateDate = todayDate;
        payload.userCurrentTokensUsed = 0;
        payload.userLastTokenUpdateDate = todayDate;
      } else {
        // console.log('is today');
        if (userTokensUsed > 24) {
          return res.status(206).json(payload);
        }
      }

      const updatedJwtPayload = payload;
      // delete updatedJwtPayload['exp'];
      // delete updatedJwtPayload['iat'];
      // delete updatedJwtPayload['jti'];
      // delete updatedJwtPayload['jwt'];
      // await redisSet(userNameWithoutSpaces, updatedJwtPayload, 'userMngmt');

      return res.status(200).json(updatedJwtPayload);
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    res.status(405).send({ message: 'Only GET requests allowed' });
    return;
  }
}
