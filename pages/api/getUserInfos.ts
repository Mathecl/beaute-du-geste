import { NextApiRequest, NextApiResponse } from 'next';

import prisma from '@/utils/prisma';
// import { PrismaClient } from '@prisma/client';
import { hash, compare } from 'bcrypt';
import { verifyAuth } from '@/utils/auth/auth';
import jwt from 'jsonwebtoken';

import { redisSet, redisGet } from '@/utils/redisUtils/redisUtils';

async function createHashedPassword(hashLength: number, password: string) {
  const hashedPassword = await hash(password, hashLength);
  return hashedPassword;
}

async function comparePasswords(
  filledUserPassword: string,
  currentUserPassword: string,
) {
  const passwordMatch = await compare(filledUserPassword, currentUserPassword);
  return passwordMatch;
}

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
    const userEmail = req.body;

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
      return res.status(401).json({ message: 'Unauthorized' });
    } else {
      const secretKey = process.env.JWT_SECRET_KEY;
      if (!secretKey || secretKey.length === 0) {
        throw new Error('The environment variable JWT_SECRET_KEY is not set');
      }
      const payload = jwt.verify(userJWT, secretKey);
      const jwtPayload = payload;

      const userName = (
        jwtPayload as { userPrismaName: string }
      ).userPrismaName.toLowerCase();
      // .replace(/\s/g, "") to erase spaces
      const userNameWithoutSpaces =
        'get' + userName.replace(/\s/g, '') + 'Infos';

      const cachedValue = await redisGet(userNameWithoutSpaces);
      if (cachedValue) {
        // console.log('value is already cached');
        const parsedCachedValue = JSON.parse(cachedValue);
        return res.status(200).json(parsedCachedValue);
      } else {
        // console.log('value is not cached');
        // let prisma: PrismaClient;
        // prisma = new PrismaClient();
        try {
          const user = await prisma.user.findFirst({
            where: {
              email: userEmail,
            },
          });
          redisSet(userNameWithoutSpaces, user, 'userMngmt'); // no need to await this (and then impact timing) because we res something else: listUsers
          return res.status(200).json(user);
        } catch (error) {
          return res
            .status(500)
            .json({ message: 'Can not get user infos because: ' + error });
        }
      }
    }
  } else {
    res.status(405).send({ message: 'Only POST requests allowed' });
    return;
  }
}
