import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';
import { verifyAuth } from '@/utils/auth/auth';
import { redisGet, redisDel } from '@/utils/redisUtils/redisUtils';

import * as CryptoJS from 'crypto-js';
import jwt from 'jsonwebtoken';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method == 'POST') {
    try {
      const dataToVerify: string =
        typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      if (!dataToVerify) {
        return res
          .status(400)
          .send({ message: 'Bad request: request body is empty' });
      }

      const midFromReq = dataToVerify.substring(0, dataToVerify.indexOf(','));
      const midForRedis = midFromReq.replace(/-/g, '');

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

        if (parsedPayload.userPrismaStripeMeet == true) {
          // console.log('room code', midFromReq);
          // console.log('room code for redis', midForRedis);
          // Perform Redis requests without special characters such as -
          const cachedValue = await redisGet(midForRedis);
          if (cachedValue) {
            // console.log('value is cached');
            try {
              const parsedData = JSON.parse(cachedValue);

              // console.log('parsed data', parsedData);
              // console.log('mid from parsed data (redis)', parsedData[0].Mid);
              // console.log('mid from req (url)', midFromReq);

              // With special characters from URL such as -
              if (parsedData[0].Mid == midFromReq) {
                // console.log('URL is correct');

                const currentDate = new Date();
                currentDate.setHours(currentDate.getHours() + 1);

                const clientSideDate = currentDate.toLocaleString('en-US', {
                  timeZone: 'UTC',
                });
                const serverSideStartDateISO = parsedData[0].Start;
                const serverSideEndDateISO = parsedData[0].End;

                const newSSStartDateISO = new Date(serverSideStartDateISO);
                const serverSideStartDate = newSSStartDateISO.toLocaleString(
                  'en-US',
                  {
                    month: 'numeric',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    hour12: true,
                  },
                );
                const newSSEndDateISO = new Date(serverSideEndDateISO);
                const serverSideEndDate = newSSEndDateISO.toLocaleString(
                  'en-US',
                  {
                    month: 'numeric',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    hour12: true,
                  },
                );

                // console.log('client side date:', clientSideDate);
                // console.log('server side start meet:', serverSideStartDate);
                // console.log('server side end meet:', serverSideEndDate);

                if (clientSideDate > serverSideEndDate) {
                  // console.log('meet has expired: deleting...');
                  // Perform Redis requests without special characters such as -
                  redisDel(midForRedis);
                  return res
                    .status(206)
                    .json('Le meet a expiré et a été supprimé');
                } else if (clientSideDate < serverSideStartDate) {
                  // console.log('meet has not started yet: waiting...');
                  return res
                    .status(206)
                    .json("Le meet n'a pas encore commencé");
                } else {
                  // console.log('OK');
                  return res.status(200).json(parsedData[0]);
                }
              } else {
                return res.status(401).json('Unauthorized');
              }
            } catch (error) {
              return res
                .status(500)
                .json(
                  'Unable to delete an already existing meet because: ' + error,
                );
            }
          } else {
            return res.status(206).json("Le meet n'a pas encore commencé");
          }
        } else {
          return res.status(401).json({ error: 'Unauthorized' });
        }
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    res.status(405).send({ message: 'Only POST requests allowed' });
    return;
  }
}
