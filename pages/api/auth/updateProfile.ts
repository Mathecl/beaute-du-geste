import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';
import { verifyAuth } from '@/utils/auth/auth';

import * as CryptoJS from 'crypto-js';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method == 'POST') {
    try {
      const reqData: string =
        typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

      if (!reqData) {
        return res
          .status(400)
          .send({ message: 'Bad request: request body is empty' });
      }

      const userEmail = reqData.substring(0, reqData.indexOf(','));
      const dbColumn = reqData.split(',')[1]?.trim() || '';
      const dbData = reqData.split(',')[2]?.trim() || '';

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
        if (
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail) &&
          dbColumn &&
          dbColumn !== null &&
          dbColumn !== undefined &&
          dbColumn !== '' &&
          dbData &&
          dbData !== null &&
          dbData !== undefined &&
          dbData !== ''
        ) {
          // JWT cookie
          // Use req.headers to get the headers from the request
          const userToken = req.headers.cookie
            ?.split('; ')
            .find((row) => row.startsWith('user-token'))
            ?.split('=')[1];
          const userTokenValue = userToken?.valueOf();
          const jwtSecretKey = process.env.JWT_SECRET_KEY;
          if (!jwtSecretKey || jwtSecretKey.length === 0) {
            throw new Error(
              'The environment variable JWT_SECRET_KEY is not set',
            );
          }
          // Verify and decode the JWT token
          const decodedToken = jwt.verify(userTokenValue, jwtSecretKey) as {
            [key: string]: any;
          };

          // Pscale DB
          switch (dbColumn) {
            case 'voice':
              await prisma.user.update({
                where: { email: userEmail },
                data: { voice: dbData },
              });
              decodedToken.userPrismaVoice = dbData;
              break;

            case 'language':
              await prisma.user.update({
                where: { email: userEmail },
                data: { language: dbData },
              });
              decodedToken.userPrismaLanguage = dbData;
              break;

            default:
              return res
                .status(206)
                .send(
                  'Requested field can not be updated because currently not supported',
                );
              break;
          }

          // Delete the 'user-token' cookie
          const deletedCookie = cookie.serialize('user-token', '', {
            maxAge: -1, // Set maxAge to a negative value to delete the cookie
            httpOnly: true,
            path: '/', // Specify the path of the cookie
          });
          // Sign a new JWT token with the updated payload
          const updatedToken = jwt.sign(decodedToken, jwtSecretKey); // jwtSecretKey,{ expiresIn: '1h' } (already has an expire, so don't need to add one)
          const newCookie = cookie.serialize('user-token', updatedToken, {
            // maxAge: 3600, // expiration time already exists
            httpOnly: true,
            path: '/',
          });
          // console.log('encoded token:' + JSON.stringify(updatedToken));
          // Set the new JWT token in the response header
          res.setHeader('Set-Cookie', [
            deletedCookie,
            newCookie,
            // `user-updated-token=${updatedToken}; HttpOnly; Secure; SameSite=None`,
            // add new cookies here as wished
          ]);

          // Log jwt payload
          const jwtPayload = decodedToken;

          return res.status(200).json(jwtPayload); // was originally: res.status(200).json('jwtPayload');
        } else {
          return res
            .status(206)
            .send('Requested field can not be updated because data is invalid');
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
