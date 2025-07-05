import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';
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
        const userEmail = dataToVerify;

        const user = await prisma.user.findFirst({
          where: {
            email: userEmail,
          },
        });

        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        // https://stripe.com/docs/api/checkout/sessions/create
        const session = await stripe.billingPortal.sessions.create({
          customer: user?.stripecustomerid,
          return_url: process.env.NEXT_PUBLIC_APP_URL + '/profile',
        });

        return res.status(200).send(session.url);
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    res.status(405).send({ message: 'Only POST requests allowed' });
    return;
  }
}
