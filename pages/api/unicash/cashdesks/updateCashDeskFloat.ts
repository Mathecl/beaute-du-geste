import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';

import { verifyAuth } from '@/utils/auth/auth';
import jwt from 'jsonwebtoken';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method == 'POST') {
    const dataToUpdate: string =
      typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    if (!dataToUpdate) {
      return res
        .status(400)
        .send({ message: 'Bad request: request body is empty' });
    }

    const cashDeskName = dataToUpdate.substring(0, dataToUpdate.indexOf('|'));
    const cashDeskFloat = dataToUpdate.split('|')[1]?.trim() || '';

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
            await prisma.compCashDesks.update({
              where: {
                cashdesk: cashDeskName,
                company: userCompany,
                city: userCity,
              },
              data: { cashfloat: JSON.parse(cashDeskFloat) },
            });

            return res.status(200).json({
              message: 'Successfully updated cash desk float',
            });
          } catch (e) {
            console.error('Error updating cash desk:', e);
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
