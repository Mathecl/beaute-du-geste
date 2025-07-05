import { NextApiRequest, NextApiResponse } from 'next';

import prisma from '@/utils/prisma';
import jwt from 'jsonwebtoken';

import { verifyAuth } from '@/utils/auth/auth';

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
          const priceId = dataToVerify.substring(0, dataToVerify.indexOf(','));
          const userEmail = dataToVerify.split(',')[1]?.trim() || '';
          const subscriptionToUpdate = dataToVerify.split(',')[2]?.trim() || '';
          // Get user on db with prisma based on email from jwt
          const user = await prisma.user.findFirst({
            where: {
              email: userEmail,
            },
          });
          const userEmailFromJWT = JSON.stringify(userEmail);
          const userEmailFromPrisma = JSON.stringify(user?.email);

          // Verify that emails are identical
          if (userEmailFromJWT == userEmailFromPrisma) {
            // Update the correct user subscription on db with prisma
            if (priceId == 'price_1OpQwIJNpqoZVop2eokYOfbv') {
              // Modify the decoded payload
              await prisma.user.update({
                where: { email: userEmail },
                data: {
                  stripeassistant: true,
                  subscription: 'paid',
                },
              });
            } else if (priceId == 'price_1OpQwbJNpqoZVop2rBLHdg84') {
              // Modify the decodedToken payload
              await prisma.user.update({
                where: { email: userEmail },
                data: {
                  stripemeet: true,
                  subscription: 'paid',
                },
              });
            }
            // else if (priceId == 'price_1OytbzJNpqoZVop2vq0YMGXg') {
            //   // Modify the decodedToken payload
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
        } else {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        return res.status(200).json('ok'); // was originally: res.status(200).json('jwtPayload');
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    res.status(405).send({ message: 'Only POST requests allowed' });
    return;
  }
}
