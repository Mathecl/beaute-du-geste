import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';
import { verifyAuth } from '@/utils/auth/auth';

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
          const userCompany = dataToVerify.split(',')[2]?.trim() || '';

          const user = await prisma.user.findFirst({
            where: {
              email: userEmail,
            },
          });

          // Encrypt price id: <iv>:<encrypted priceid>
          const secretKey = process.env.CRYPTO_SECRET_KEY;
          const key = CryptoJS.enc.Utf8.parse(secretKey);
          let cipher = CryptoJS.AES.encrypt(priceId, key, {
            iv: key,
          }).toString();
          // `${iv.toString('hex')}:${encryptedPriceId}`;

          const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
          // https://stripe.com/docs/api/checkout/sessions/create
          const session = await stripe.checkout.sessions.create({
            success_url:
              process.env.NEXT_PUBLIC_APP_URL +
              '/client/' +
              userCompany.toLowerCase(),
            // + '/unidmin',
            cancel_url: req.headers.origin,
            customer: user?.stripecustomerid,
            line_items: [
              {
                price: priceId,
                quantity: 1,
              },
            ],
            mode: 'subscription',
          });
          return res.status(200).send(session.url);
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
