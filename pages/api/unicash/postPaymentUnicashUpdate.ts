import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';
import { verifyAuth } from '@/utils/auth/auth';
import jwt from 'jsonwebtoken';

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

      const uidFromReq = reqData.substring(0, reqData.indexOf(','));
      const stateFromReq = reqData.split(',')[1]?.trim() || '';
      const companyFromReq = reqData.split(',')[2]?.trim() || '';
      const cityFromReq = reqData.split(',')[3]?.trim() || '';

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
          const jwtSecretKey = process.env.JWT_SECRET_KEY;
          if (!jwtSecretKey || jwtSecretKey.length === 0) {
            throw new Error(
              'The environment variable JWT_SECRET_KEY is not set',
            );
          }
          const payload = jwt.verify(userJWT, jwtSecretKey);
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
            try {
              await prisma.cons.update({
                where: {
                  uid: uidFromReq,
                  city: cityFromReq,
                  company: companyFromReq,
                },
                data: { state: stateFromReq },
              });

              return res
                .status(200)
                .send({ message: 'Successfully updated cons state' });
            } catch (e) {
              return res.status(500).send(e);
            }
          } else {
            return res.status(401).json({ error: 'Unauthorized' });
          }
        } catch (e) {
          console.log(e);
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
