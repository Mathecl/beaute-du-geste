import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';
import { compare } from 'bcrypt';

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

    if (!filledPinCode && !filledEmail) {
      return res
        .status(400)
        .send({ message: 'Bad request: request body is empty' });
    }

    try {
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
        let stripe;
        if (user?.company == "TheBrother's" || user?.company == 'TheBrothers') {
          stripe = require('stripe')(
            process.env.STRIPE_THEBROTHERS_TEST_SECRET_KEY,
          );
        } else {
          stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        }

        const customer = await stripe.customers.create({
          name: user?.name,
          email: user?.email,
        });

        await prisma.user.update({
          where: { email: filledEmail },
          data: {
            verified: true,
            subscription: 'free',
            stripecustomerid: customer.id,
          },
        });
        return res.status(200).json({ message: 'ok' });
      } else {
        return res.status(500).json({ message: 'User not signed in' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'User not signed in' + error });
    }
  } else {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }
};
export default handler;
