import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';

import * as CryptoJS from 'crypto-js';
import jwt from 'jsonwebtoken';

import cookie from 'cookie';

import { verifyAuth } from '@/utils/auth/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method == 'POST') {
    try {
      // STRIPE
      const dataToVerify: string =
        typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      if (!dataToVerify) {
        return res
          .status(400)
          .send({ message: 'Bad request: request body is empty' });
      }

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
        const priceId = dataToVerify.substring(0, dataToVerify.indexOf(','));
        const userEmail = dataToVerify.split(',')[1]?.trim() || '';
        // Get user on db with prisma based on email from jwt
        const user = await prisma.user.findFirst({
          where: {
            email: userEmail,
          },
        });
        const userEmailFromJWT = JSON.stringify(userEmail);
        const userEmailFromPrisma = JSON.stringify(user?.email);
        // Decrypt price id: <iv>:<encrypted priceid>
        const secretKey = process.env.CRYPTO_SECRET_KEY;
        // const [iv, encryptedText] = priceId.split(':');
        const key = CryptoJS.enc.Utf8.parse(secretKey);
        let decryptedData = CryptoJS.AES.decrypt(priceId, key, {
          iv: key,
        });
        const decryptedPriceId = decryptedData.toString(CryptoJS.enc.Utf8);

        // JWT cookie
        // Use req.headers to get the headers from the request
        const userToken = req.headers.cookie
          ?.split('; ')
          .find((row) => row.startsWith('user-token'))
          ?.split('=')[1];
        const userTokenValue = userToken?.valueOf();
        const jwtSecretKey = process.env.JWT_SECRET_KEY;
        if (!jwtSecretKey || jwtSecretKey.length === 0) {
          throw new Error('The environment variable JWT_SECRET_KEY is not set');
        }
        // Verify and decode the JWT token
        const decodedToken = jwt.verify(userTokenValue, jwtSecretKey) as {
          [key: string]: any;
        };

        // Verify that emails are identical
        if (userEmailFromJWT == userEmailFromPrisma) {
          // Update the correct user subscription on db with prisma
          if (decryptedPriceId == 'price_1OpQwIJNpqoZVop2eokYOfbv') {
            // Modify the decoded payload
            decodedToken.userPrismaStripeAssistant = true;
            decodedToken.userPrismaSubscription = 'paid';

            await prisma.user.update({
              where: { email: userEmail },
              data: {
                stripeassistant: true,
                subscription: 'paid',
              },
            });
          } else if (decryptedPriceId == 'price_1OpQwbJNpqoZVop2rBLHdg84') {
            // Modify the decodedToken payload
            decodedToken.userPrismaStripeMeet = true;
            decodedToken.userPrismaSubscription = 'paid';

            await prisma.user.update({
              where: { email: userEmail },
              data: {
                stripemeet: true,
                subscription: 'paid',
              },
            });
          }
          // else if (decryptedPriceId == 'price_1OytbzJNpqoZVop2vq0YMGXg') {
          //   // Modify the decodedToken payload
          //   decodedToken.userPrismaStripeCollab = true;
          //   decodedToken.userPrismaSubscription = 'paid';

          //   await prisma.user.update({
          //     where: { email: userEmail },
          //     data: {
          //       stripecollab: true,
          //       subscription: 'paid',
          //     },
          //   });
          // }
        } else {
          return res.status(401).send('email not corresponding');
        }

        // console.log('updated token:' + JSON.stringify(decodedToken));

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
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    res.status(405).send({ message: 'Only POST requests allowed' });
    return;
  }
}
