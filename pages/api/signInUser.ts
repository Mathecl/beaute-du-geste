// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';
import { compare } from 'bcrypt';
import { SignJWT } from 'jose';
import jwt from 'jsonwebtoken';
import { getJwtSecretKey } from '@/utils/auth/auth';
import cookie from 'cookie';

import { redisSet, redisGet } from '@/utils/redisUtils/redisUtils';

type DataRes = {
  id?: number;
  name?: string;
  email?: string;
  accessToken?: string;
  password?: string;
  pincode?: string;
  role?: string;
  subscription?: string;
  verified?: boolean;
  message?: string;
};

async function createJwtId(jwtIdLength: number) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < jwtIdLength) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

// const corsMiddleware = cors({
//   origin: 'https://<APP_NAME_HERE>/', // Replace this with frontend's origin
//   methods: ['POST'], // Adjust the allowed HTTP methods as needed
//   credentials: true, // Allow cookies to be sent
// });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DataRes>,
) {
  // await corsMiddleware(req, res); // Apply the CORS middleware

  if (req.method == 'POST') {
    if (!req.body) {
      return res
        .status(400)
        .send({ message: 'Bad request: request body is empty' });
    }

    const { email, password } = req.body;
    const userFilledEmail: string = email;
    const userFilledPassword: string = password;

    // To avoid password bruteforce cyberattacks
    function wait(ms: number): Promise<void> {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    }

    try {
      const user = await prisma.user.findFirst({
        where: {
          email: userFilledEmail,
        },
      });

      const userPrismaName: string = user?.name; // replace - by spaces so it fits to all situations (first name or last name or full name)
      const userPrismaNameLowerCase = userPrismaName.toLowerCase();
      const userFinalPrismaName =
        'get' + userPrismaNameLowerCase.replace(/\s/g, '') + 'Infos';

      const userPrismaEmail: string = user?.email;
      const userPrismaPassword: string = user?.password;
      const userPrismaLanguage: string = user?.language;
      const userPrismaVoice: string = user?.voice;
      const userPrismaPinCode: string = user?.pinCode;
      const userPrismaCompany: string = user?.company;
      const userPrismaCity: string = user?.city;
      const userPrismaRole: string = user?.role;
      const userPrismaSubscription: string = user?.subscription;
      const userPrismaStripeCustomerId: string = user?.stripecustomerid;
      const userPrismaStripeAssistant: boolean = user?.stripeassistant;
      const userPrismaStripeCollab: boolean = user?.stripecollab;
      const userPrismaStripeMeet: boolean = user?.stripemeet;
      const userPrismaBizNetwork: boolean = user?.stripebiznetwork;
      const userPrismaStripeCash: boolean = user?.stripecash;
      const userPrismaVerified: boolean = user?.verified;
      const userPrismaApproved: boolean = user?.approved;
      let userLastTokenUpdateDate;
      let userCurrentTokensUsed;

      const cachedValue = await redisGet(userFinalPrismaName);

      if (cachedValue) {
        const parsedCachedValue = JSON.parse(cachedValue);
        userLastTokenUpdateDate = parsedCachedValue[0].userLastTokenUpdateDate;
        userCurrentTokensUsed = parsedCachedValue[0].userCurrentTokensUsed;
      } else {
        const todayDate = new Date();
        const todayISODate = todayDate.toISOString().split('T')[0]; // Extract date part only;

        userLastTokenUpdateDate = todayISODate;
        userCurrentTokensUsed = 0;
      }

      const isValid = await compare(userFilledPassword, userPrismaPassword);

      if (isValid === true) {
        // create an Id that will be used for JWT
        const jwtId: string = await createJwtId(16);

        // return a jwt cookie to the user
        const token = await new SignJWT({
          userPrismaName,
          userPrismaEmail,
          userPrismaLanguage,
          userPrismaVoice,
          userPrismaCompany,
          userPrismaCity,
          userPrismaRole,
          userPrismaSubscription,
          userPrismaStripeCustomerId,
          userPrismaStripeAssistant,
          userPrismaStripeCollab,
          userPrismaStripeMeet,
          userPrismaStripeCash,
          userPrismaBizNetwork,
          userPrismaVerified,
          userPrismaApproved,
          userLastTokenUpdateDate,
          userCurrentTokensUsed,
        })
          .setProtectedHeader({
            alg: 'HS256',
            typ: 'JWT',
          })
          .setJti(jwtId)
          .setIssuedAt()
          .setExpirationTime('1d') // session expires in 1 day
          // will be client-side valid / logged-in for 1 day
          // Key for the HS256 algorithm must be one of type KeyObject, CryptoKey, or Uint8Array
          .sign(new TextEncoder().encode(getJwtSecretKey()));

        res.setHeader(
          'Set-Cookie',
          cookie.serialize('user-token', token, {
            httpOnly: true,
            path: '/',
            // secure: process.env.NODE_ENV === 'production',
          }),
        );

        const secretKey = process.env.JWT_SECRET_KEY;
        if (!secretKey || secretKey.length === 0) {
          throw new Error('The environment variable JWT_SECRET_KEY is not set');
        }
        // Verify and decode the JWT token
        const payload = jwt.verify(token, secretKey);
        const jwtPayload = payload;

        // Log jwt payload
        jwtPayload['jwt'] = token;
        // Delete unnecessary fields
        // delete jwtPayload['exp'];
        // delete jwtPayload['iat'];
        // delete jwtPayload['jti'];
        // delete jwtPayload['jwt'];

        await redisSet(userFinalPrismaName, jwtPayload, 'userMngmt');

        res.status(200).json({
          // name: userPrismaName,
          // email: userFilledEmail,
          // password: userFilledPassword,
          // pincode: userPrismaPinCode,
          // role: userPrismaRole,
          // subscription: userPrismaSubscription,
          // verified: userPrismaVerified,
          message: 'User successfully signed in',
        });
      } else {
        wait(2500).then(() => {
          console.log('Password incorrect: anti bruteforce...');
        });
        return res
          .status(500)
          .json({ message: 'User not signed in: bad password' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'User not signed in' + error });
    }
  } else {
    res.status(405).json({ message: 'Only POST requests are allowed' });
    return;
  }
}
