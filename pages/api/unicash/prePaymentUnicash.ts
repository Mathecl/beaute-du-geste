import { NextApiRequest, NextApiResponse } from 'next';

import cookie from 'cookie';

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
  if (req.method === 'POST') {
    try {
      const dataFromReq: string =
        typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

      if (!dataFromReq) {
        return res
          .status(400)
          .send({ message: 'Bad request: request body is empty' });
      }

      const paymentMethod = dataFromReq.substring(0, dataFromReq.indexOf('|'));
      const consType = dataFromReq.split('|')[1]?.trim() || '';
      const geolocationCity = dataFromReq.split('|')[2]?.trim() || '';
      const companyValue = dataFromReq.split('|')[3]?.trim() || '';

      const paymentMethodCookieName = 'unicash-payment-method';
      const consTypeCookieName = 'unicash-cons-type';
      const geolocationCookieName = 'unicash-geolocation';
      const companyCookieName = 'unicash-comp';

      // Use req.headers to get the headers from the request
      // const paymentMethodCookie = req.headers.cookie
      //   ?.split('; ')
      //   .find((row) => row.startsWith(paymentMethodCookieName))
      //   ?.split('=')[1];
      // const paymentMethodCookieValue = paymentMethodCookie?.valueOf();
      // const consTypeCookie = req.headers.cookie
      //   ?.split('; ')
      //   .find((row) => row.startsWith(consTypeCookieName))
      //   ?.split('=')[1];
      // const consTypeCookieValue = consTypeCookie?.valueOf();

      // res.setHeader(
      //   'Set-Cookie',
      //   cookie.serialize(consTypeCookieName, consType, {
      //     httpOnly: true,
      //     path: '/',
      //     // secure: process.env.NODE_ENV === 'production',
      //   }),
      // );

      res.setHeader('Set-Cookie', [
        cookie.serialize(paymentMethodCookieName, paymentMethod, {
          httpOnly: true,
          path: '/',
          // secure: process.env.NODE_ENV === 'production',
        }),
        cookie.serialize(consTypeCookieName, consType, {
          httpOnly: true,
          path: '/',
          // secure: process.env.NODE_ENV === 'production',
        }),
        cookie.serialize(companyCookieName, companyValue, {
          httpOnly: true,
          path: '/',
          // secure: process.env.NODE_ENV === 'production',
        }),
        cookie.serialize(geolocationCookieName, geolocationCity, {
          httpOnly: true,
          path: '/',
          // secure: process.env.NODE_ENV === 'production',
        }),
      ]);

      return res.status(200).json({
        message:
          'Cookies created for payment method, cons type, geolocation and comp',
      });
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    res.status(405).send({ message: 'Only POST requests allowed' });
    return;
  }
}
