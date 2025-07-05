import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAuth } from '@/utils/auth/auth';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_SECRET,
});

type Data = {
  success?: boolean;
  data?: string;
  error?: unknown;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (req.method == 'POST') {
    if (!req.body) {
      return res
        .status(400)
        .send({ error: 'Bad request: request body is empty' });
    }

    const userBearerAuth = req.headers.authorization;
    const userJWT = userBearerAuth?.slice(7);

    // console.log('text from req body to translate:' + req.body);

    // verifyAuth()
    const verifiedToken =
      userJWT &&
      (await verifyAuth(userJWT).catch((err) => {
        console.log(err);
      }));

    if (
      !userBearerAuth ||
      !userBearerAuth.startsWith('Bearer ') ||
      !verifiedToken ||
      !verifiedToken?.userPrismaSubscription ||
      !verifiedToken?.userPrismaStripeAssistant
    ) {
      return res.status(401).json({ error: 'Unauthorized' });
    } else {
      try {
        const response = await openai.completions.create({
          model: 'gpt-3.5-turbo-instruct',
          prompt: `${req.body}`,
          max_tokens: 1000,
          temperature: 0.5,
        });

        // console.log('response:' + response.choices[0].text?.trim());

        res.status(200).json({
          success: true,
          data: response.choices[0].text?.trim(), // data.choices[0].text?.trim()
        });
      } catch (error) {
        if (error) {
          console.log('Translate error:' + error);
        }
        res.status(400).json({
          success: false,
          error: error,
        });
      }
    }
  } else {
    res.status(405).send({ error: 'Only POST requests are allowed' });
    return;
  }
}
