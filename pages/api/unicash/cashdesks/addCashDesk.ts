import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';

import { verifyAuth } from '@/utils/auth/auth';
import jwt from 'jsonwebtoken';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method == 'POST') {
    if (!req.body) {
      return res
        .status(400)
        .send({ message: 'Bad request: request body is empty' });
    }
    const cashDeskName = req.body;

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

          try {
            await prisma.compCashDesks.create({
              data: {
                cashdesk: cashDeskName,
                company: userCompany,
                city: userCity,
                cashfloat: {
                  coins: [
                    { label: '0,01€', value: 0.01, amount: 0 },
                    { label: '0,02€', value: 0.02, amount: 0 },
                    { label: '0,05€', value: 0.05, amount: 0 },
                    { label: '0,10€', value: 0.1, amount: 0 },
                    { label: '0,20€', value: 0.2, amount: 0 },
                    { label: '0,50€', value: 0.5, amount: 0 },
                    { label: '1,00€', value: 1, amount: 0 },
                    { label: '2,00€', value: 2, amount: 0 },
                  ],
                  notes: [
                    { label: '5€', value: 5, amount: 0 },
                    { label: '10€', value: 10, amount: 0 },
                    { label: '20€', value: 20, amount: 0 },
                    { label: '50€', value: 50, amount: 0 },
                    { label: '100€', value: 100, amount: 0 },
                    { label: '200€', value: 200, amount: 0 },
                    { label: '500€', value: 500, amount: 0 },
                  ],
                  coinsTotal: 0,
                  notesTotal: 0,
                },
              },
            });

            return res.status(200).json({
              message: 'Successfully created a new cash desk',
            });
          } catch (e) {
            console.error('Error creating cash desk:', e);
            return res.status(403).json({ error: e });
          }
        } else {
          return res.status(401).json({ error: 'Unauthorized' });
        }
      } catch (error) {
        return res.status(500).json(error);
      }
    }
  } else {
    res.status(405).send({ message: 'Only POST requests allowed' });
    return;
  }
}
