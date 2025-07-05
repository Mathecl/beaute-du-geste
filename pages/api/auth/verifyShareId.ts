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

      const sidFromReq = dataToVerify.substring(0, dataToVerify.indexOf(','));
      const companyFromReq = dataToVerify.split(',')[1]?.trim() || '';

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

        if (parsedPayload) {
          // Encrypt sid: <iv>:<encrypted sid>
          const secretKey = process.env.CRYPTO_SECRET_KEY;
          const key = CryptoJS.enc.Utf8.parse(secretKey);
          let encryptedCipherSid = CryptoJS.AES.encrypt(sidFromReq, key, {
            iv: key,
          }).toString();

          const cachedValue = await redisGet(encryptedCipherSid);
          if (cachedValue) {
            try {
              const parsedData = JSON.parse(cachedValue);
              if (
                parsedData.Sid == encryptedCipherSid
                // && parsedData.Company == companyFromReq
              ) {
                const currentDate = new Date();
                if (currentDate.toISOString() > parsedData.ExpirationDate) {
                  redisDel(encryptedCipherSid);
                  return res
                    .status(401)
                    .json('Shareable link is expired and has been deleted');
                } else {
                  return res
                    .status(200)
                    .json(JSON.stringify(parsedData.Company));
                }
              } else {
                return res.status(401).json('Unauthorized');
              }
            } catch (error) {
              return res.status(500).json({
                message:
                  'Unable to delete an already existing link because: ' + error,
              });
            }
          } else {
            try {
              return res.status(206).json('This shareable link does not exist');
            } catch (error) {
              return res.status(500).json({
                message: 'Can not create shareable link because: ' + error,
              });
            }
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
