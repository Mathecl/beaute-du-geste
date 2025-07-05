import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';
import { compare } from 'bcrypt';

import { verifyAuth } from '@/utils/auth/auth';
import jwt from 'jsonwebtoken';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const dataToVerify: string =
      typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    if (!dataToVerify) {
      return res
        .status(400)
        .send({ message: 'Bad request: request body is empty' });
    }

    const filledPinCode = dataToVerify.substring(0, dataToVerify.indexOf(','));
    const filledEmail = dataToVerify.split(',')[1]?.trim() || '';

    // console.log('data to verify:' + dataToVerify);
    // console.log('filled pin code:' + filledPinCode);
    // console.log('filled email:' + filledEmail);
    // console.log('filled name:' + filledName);

    if (!filledPinCode && !filledEmail) {
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
          const user = await prisma.user.findFirst({
            where: {
              email: filledEmail,
            },
          });

          const hashedPinCode: string = user?.pinCode;
          // console.log('hashed pin code:' + hashedPinCode);
          const isValid = await compare(filledPinCode, hashedPinCode);
          // console.log('is valid:' + isValid);

          if (isValid === true) {
            return res.status(200).json({ message: 'ok' });
          } else {
            return res.status(500).json({ message: 'nok' });
          }
        } else {
          return res.status(401).json({ error: 'Unauthorized' });
        }
      } catch (error) {
        return res.status(500).json({ message: 'User not signed in' + error });
      }
    }
  } else {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }
};
export default handler;
