import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';
import { verifyAuth } from '@/utils/auth/auth';
import { redisSet, redisGet, redisDel } from '@/utils/redisUtils/redisUtils';

import * as CryptoJS from 'crypto-js';
import jwt from 'jsonwebtoken';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Generate shareable id
  async function createShareId(sidLength: number) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < sidLength) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }
  // Generate json structure
  async function generateJsonStructure(sid, company) {
    const currentDate = new Date();
    const expirationDate = new Date(currentDate.getTime() + 4 * 60 * 60 * 1000); // 4 hours later

    const jsonStructure = {
      Sid: sid,
      Company: company,
      CurrentDate: currentDate.toISOString(),
      ExpirationDate: expirationDate.toISOString(),
    };

    return jsonStructure;
  }

  if (req.method == 'GET') {
    try {
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

        if (parsedPayload.userPrismaRole == 'admin') {
          // Generate share id
          const sid = await createShareId(8);
          // Encrypt sid: <iv>:<encrypted sid>
          const secretKey = process.env.CRYPTO_SECRET_KEY;
          const key = CryptoJS.enc.Utf8.parse(secretKey);
          let encryptedCipherSid = CryptoJS.AES.encrypt(sid, key, {
            iv: key,
          }).toString();
          // `${iv.toString('hex')}:${encryptedSid}`;
          // Generate JSON structure
          const jsonStructure = await generateJsonStructure(
            encryptedCipherSid,
            parsedPayload.userPrismaCompany.toLowerCase(),
          );

          const cachedValue = await redisGet(encryptedCipherSid);
          if (cachedValue) {
            try {
              redisDel(encryptedCipherSid);
              return res
                .status(206)
                .json(
                  'A similar link already existed and has been deleted. Please create a new one',
                );
            } catch (error) {
              return res.status(500).json({
                message:
                  'Unable to delete an already existing link because: ' + error,
              });
            }
          } else {
            try {
              // Convert string structure to json
              // const parsedCachedValue = JSON.parse(cachedValue);
              // Return decrypted sid
              redisSet(encryptedCipherSid, jsonStructure, 'sidMngmt');
              return res.status(200).json(sid);
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
    res.status(405).send({ message: 'Only GET requests allowed' });
    return;
  }
}
