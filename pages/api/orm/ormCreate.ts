import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';

import { hash } from 'bcrypt';
import { verifyAuth } from '@/utils/auth/auth';
import jwt from 'jsonwebtoken';

async function createHashedPassword(hashLength: number, password: string) {
  const hashedPassword = await hash(password, hashLength);
  return hashedPassword;
}

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
    const { userName, userEmail, userPassword, companyName } = req.body;
    const userHashedPassword = await createHashedPassword(12, userPassword);

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

        if (parsedPayload.userPrismaRole == 'admin') {
          try {
            await prisma.user.create({
              data: {
                name: userName,
                email: userEmail,
                password: userHashedPassword,
                company: companyName,
                role: 'employee',
                subscription: 'free',
                verified: false,
              },
            });
            return res.status(200).json({ message: 'Unverified user created' });
          } catch (e) {
            return res.status(500).json(e);
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
