import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';
import { redisSet, redisGet } from '@/utils/redisUtils/redisUtils';

import { verifyAuth } from '@/utils/auth/auth';
import jwt from 'jsonwebtoken';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method == 'GET') {
    const userBearerAuth = req.headers.authorization;
    const userJWT = userBearerAuth?.slice(7);

    // verifyAuth()
    const verifiedToken =
      userJWT &&
      (await verifyAuth(userJWT).catch((err) => {
        console.log(err);
      }));

    if (
      !userBearerAuth ||
      !userBearerAuth.startsWith('Bearer ') ||
      !verifiedToken
    ) {
      return res.status(401).json({ error: 'Unauthorized' });
    } else {
      try {
        const secretKey = process.env.JWT_SECRET_KEY;
        if (!secretKey || secretKey.length === 0) {
          throw new Error('The environment variable JWT_SECRET_KEY is not set');
        }
        const payload = jwt.verify(userJWT, secretKey);
        const jwtPayload: string | JwtPayload = payload;

        let parsedPayload: JwtPayload;
        if (typeof jwtPayload === 'string') {
          // If jwtPayload is a string, parse it into a JwtPayload object
          try {
            parsedPayload = JSON.parse(jwtPayload);
          } catch (error) {
            console.error('Error parsing jwtPayload:', error);
            // Handle parsing error if necessary
          }
        } else {
          // If jwtPayload is already a JwtPayload object, use it directly
          parsedPayload = jwtPayload;
        }

        if (parsedPayload.userPrismaStripeCash == true) {
          const userCompany = (jwtPayload as { userPrismaCompany: string })
            .userPrismaCompany;
          const userCity = (jwtPayload as { userPrismaCity: string })
            .userPrismaCity;
          // .replace(/\s/g, "") to erase spaces
          const userCompanyWithoutSpaces =
            'list' + userCompany.replace(/\s/g, '') + 'CashDesksUnicash';

          const cachedValue = await redisGet(userCompanyWithoutSpaces);
          if (cachedValue) {
            // console.log('value is already cached and value is correct');
            const parsedCachedValue = JSON.parse(cachedValue);
            return res.status(200).json(parsedCachedValue);
          } else {
            // console.log('value is not cached and/or value is not correct');
            const listCashDesks = await prisma.compCashDesks.findMany({
              where: {
                AND: {
                  company: userCompany,
                  city: userCity,
                },
              },
            });

            redisSet(userCompanyWithoutSpaces, listCashDesks, 'userMngmt'); // no need to await this (and then impact timing) because we res something else: listCashDesks
            return res.status(200).json(listCashDesks);
          }
        } else {
          return res.status(401).json({ error: 'Unauthorized' });
        }
      } catch (error) {
        return res.status(500).json(error);
      }
    }
  } else {
    res.status(405).send({ message: 'Only GET requests allowed' });
    return;
  }
}
