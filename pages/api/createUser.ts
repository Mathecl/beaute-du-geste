// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from '@/utils/supabase/supabaseClient';

// import { PrismaClient } from '@prisma/client';

type DataRes = {
  message: string;
  email?: string;
};

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DataRes>,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: 'Bad request: missing email or password' });
  }

  try {
      // const client = await clientPromise;
      // const db = client.db('beaute-du-geste');
      // const collection = db.collection('users');
      // const data = {
      //   data: {
      //     name: userName,
      //     email: userEmail,
      //     password: userHashedPassword,
      //     company: companyName,
      //     city: city,
      //     role: 'consumer',
      //     subscription: 'free',
      //     verified: false,
      //     approved: true,
      //   },
      // }

      // const result = await collection.insertOne(data);

    // console.log('Supabase auth exists:', !!supabase.auth);

    const { data, error } = await supabase.auth.signUp({ // signInWithPassword
      email,
      password,
    });

    if (error) {
      await wait(2500); // anti-bruteforce
      console.log('Login failed:', error.message);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.status(200).json({
      message: 'User successfully signed in',
      email: data.user?.email,
    });
  } catch (err: any) {
    console.error('Unexpected login error:', err);
    return res
      .status(500)
      .json({ message: 'Unexpected error during sign in' });
  }
}
