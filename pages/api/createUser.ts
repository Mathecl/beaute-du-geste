import { NextApiRequest, NextApiResponse } from 'next';

import supabase from '@/utils/supabase/supabaseClient';

import prisma from '@/utils/prisma';
// import { PrismaClient } from '@prisma/client';

import { hash } from 'bcrypt';

async function createHashedPassword(hashLength: number, password: string) {
  const hashedPassword = await hash(password, hashLength);
  return hashedPassword;
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
    const { userName, userEmail, userPassword, companyName, city } = req.body;
    const userHashedPassword = await createHashedPassword(12, userPassword);

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

      const { data, error } = await supabase.auth.signUp({
        email: userEmail,
        password: userHashedPassword,
      })      

      res.status(200).json({ message: 'Unverified user created' });
    } catch (error) {
      return res
        .status(500)
        .json({ message: 'Unverified user not created' + error });
    }
  } else {
    res.status(405).send({ message: 'Only POST requests allowed' });
    return;
  }
}
