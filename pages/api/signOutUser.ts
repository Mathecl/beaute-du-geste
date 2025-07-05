import { NextApiRequest, NextApiResponse } from 'next';

import cookie from 'cookie';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method == 'GET') {
    try {
      const currentDomain = process.env.NEXT_PUBLIC_APP_URL;

      // Delete the 'user-token' cookie
      const deletedCookie = cookie.serialize('user-token', '', {
        maxAge: -1, // Set maxAge to a negative value to delete the cookie
        httpOnly: true,
        path: '/', // Specify the path of the cookie
      });
      res.setHeader('Set-Cookie', [deletedCookie]);
      res.setHeader('Access-Control-Allow-Origin', currentDomain);

      console.log(JSON.stringify(res));

      return res.status(200).json('jwt token deleted');
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    res.status(405).send({ message: 'Only GET requests allowed' });
    return;
  }
}
