import { NextApiRequest, NextApiResponse } from 'next';

// import Stripe from 'stripe';

import { verifyAuth } from '@/utils/auth/auth';

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
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const prices = await stripe.prices.list({
          // https://dashboard.stripe.com/test/products
          // product: 'prod_PA6YpR12aCTGyD', // TEMPORARLY list only "assistant intelligent" product (delete this to come back to normal behavior)
          active: true,
          limit: 3, // set this as much as there are products
          expand: ['data.product'], // prices + products info all in one, i.e: setPriceId(data.map((price) => price.product.metadata.name));
        });

        const data = prices.data.reverse();
        return res.status(200).json(data);
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    res.status(405).send({ message: 'Only GET requests allowed' });
    return;
  }
}
