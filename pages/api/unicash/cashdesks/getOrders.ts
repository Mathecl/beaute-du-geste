import { NextApiRequest, NextApiResponse } from 'next';

import { verifyAuth } from '@/utils/auth/auth';
import jwt from 'jsonwebtoken';

import prisma from '@/utils/prisma';

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

        if (parsedPayload.userPrismaVerified == true) {
          const userCompany = (jwtPayload as { userPrismaCompany: string })
            .userPrismaCompany;
          const userCity = (jwtPayload as { userPrismaCity: string })
            .userPrismaCity;

          const listOrders = await prisma.cons.findMany({
            where: {
              OR: [
                // unpaid -> paid -> cooking -> cooked -> delivered / canceled
                {
                  state: 'paid',
                },
                { state: 'cooking' },
                { state: 'cooked' },
                { state: 'delivered' },
                { state: 'canceled' },
              ],
              AND: {
                company: userCompany,
                city: userCity,
              },
            },
          });

          return res.status(200).json(listOrders);
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
