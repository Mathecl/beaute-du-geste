import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';
import { hash, compare } from 'bcrypt';

async function createHashedPassword(hashLength: number, password: string) {
  const hashedPassword = await hash(password, hashLength);
  return hashedPassword;
}

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
    const filledPassword = dataToVerify.split(',')[2]?.trim() || '';

    // console.log('data to verify:' + dataToVerify);
    // console.log('filled pin code:' + filledPinCode);
    // console.log('filled email:' + filledEmail);
    // console.log('filled name:' + filledName);

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
        const newUserHashedPassword = await createHashedPassword(
          12,
          filledPassword,
        );

        try {
          await prisma.user.update({
            where: { email: filledEmail },
            data: {
              password: newUserHashedPassword,
            },
          });
          res.status(200).json({ message: 'User password updated' });
        } catch (error) {
          return res.status(500).json({
            message: 'User password not updated because: ' + error,
          });
        }
      } else {
        return res.status(500).json({ message: 'Pin code not correct' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Error:' + error });
    }
  } else {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }
};
export default handler;
