import { NextApiRequest, NextApiResponse } from 'next';

import cookie from 'cookie';

import { verifyAuth } from '@/utils/auth/auth';
import jwt from 'jsonwebtoken';

function generateRandomCharacters(amount) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < amount; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    try {
      const entityName = 'unicash-cart-uid';

      // Use req.headers to get the headers from the request
      const userCartUID = req.headers.cookie
        ?.split('; ')
        .find((row) => row.startsWith(entityName))
        ?.split('=')[1];
      const userCartUIDValue = userCartUID?.valueOf();

      if (userCartUIDValue && userCartUIDValue !== undefined) {
        return res.status(200).json(userCartUIDValue);
      } else {
        const cartUID = generateRandomCharacters(8);

        res.setHeader(
          'Set-Cookie',
          cookie.serialize(entityName, cartUID, {
            httpOnly: true,
            path: '/',
            // secure: process.env.NODE_ENV === 'production',
          }),
        );

        return res.status(200).json(userCartUIDValue);
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    res.status(405).send({ message: 'Only GET requests allowed' });
    return;
  }
}
