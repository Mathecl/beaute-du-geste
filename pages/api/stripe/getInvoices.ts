import { NextApiRequest, NextApiResponse } from 'next';

import jwt from 'jsonwebtoken';
import { verifyAuth } from '@/utils/auth/auth';

import Stripe from 'stripe';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method == 'GET') {
    try {
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

        // if (parsedPayload.userPrismaStripeCash == true) {
        try {
          const stripe = new Stripe(
            process.env.STRIPE_THEBROTHERS_TEST_SECRET_KEY,
          );
          // const invoices = await stripe.invoices.list({
          //   limit: 10,
          // });
          // console.log(invoices);

          // console.log('-----------');

          try {
            const retrieveInvoices = await stripe.invoices.search({
              // query: `total>1"`,
              query: `customer:"${parsedPayload.userPrismaStripeCustomerId}"`,
            });
            // console.log(retrieveInvoices);

            if (retrieveInvoices.data.length > 0) {
              // Sort the invoices by the created timestamp in descending order
              const sortedInvoices = retrieveInvoices.data.sort(
                (a, b) => b.created - a.created,
              );
              // Get the latest invoice
              const latestInvoice = sortedInvoices[0];
              // console.log(latestInvoice);

              return res.status(200).json(latestInvoice);
            } else {
              console.log('No invoices found for the customer.');
            }
          } catch (e) {
            console.log(e);
          }

          // const data = invoices.data.reverse();
          // const data = invoices;
          // return res.status(200).json(data);
        } catch (error) {
          return res.status(500).end();
        }
        // } else {
        // return res.status(401).json({ error: 'Unauthorized' });
        // }
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    res.status(405).send({ message: 'Only GET requests allowed' });
    return;
  }
}
