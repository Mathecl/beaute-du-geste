import prisma from '@/utils/prisma';
import { hash } from 'bcrypt';
import nodemailer from 'nodemailer';

const handler = async (req, res) => {
  async function createPinCode(pinCodeLength: number) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < pinCodeLength) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }
  async function hashPinCode(hashLength: number, pincode: string) {
    const hashedPinCode = await hash(pincode, hashLength);
    return hashedPinCode;
  }

  if (req.method === 'POST') {
    const reqData = req.body;
    if (!reqData) {
      return res
        .status(400)
        .send({ message: 'Bad request: request body is empty' });
    }

    const userPinCode: string = await createPinCode(16);
    const userHashedPinCode: string = await hashPinCode(12, userPinCode);

    try {
      // console.log('userEmail (sendVerificationEmail):' + reqData.userEmail);
      // console.log('userHashedPinCode (sendVerificationEmail):' + userHashedPinCode);
      await prisma.user.update({
        where: { email: reqData.userEmail },
        data: { pinCode: userHashedPinCode },
      });

      const emailSrc = process.env.EMAIL;
      const pwdSrc = process.env.EMAIL_PASS;
      const emailDst: string = reqData.userEmail;
      // let nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        // port: 465,
        // host: 'smtp.gmail.com',
        // auth: {
        //   user: 'demo email',
        //   pass: process.env.password,
        // },
        // secure: true,
        service: 'gmail',
        auth: {
          user: emailSrc,
          pass: pwdSrc,
        },
      });
      const mailOptions = {
        from: emailSrc,
        to: emailDst,
        subject: `Email de Unigate pour l'activation de votre compte`,
        html: `<h1>Cher(e) ${reqData.userName},</h1><br/><p>Veuillez trouver le code PIN ci-après à remplir pour activer votre compte ${userPinCode}</p><br/><p>De la même manière, si vous êtes voué(e) à avoir le rôle d'administat(eur/trice), veuillez noter que celui-ci devra être coservé car sera nécessaire pour accéder à certaines ressources de Unigate.</p>`,
      };
      await transporter.sendMail({
        ...mailOptions,
        subject: `Email de Unigate pour l'activation de votre compte`,
        // test: 'text test',
        html: `<h1>Cher(e) ${reqData.userName},</h1><br/><p>Veuillez trouver le code PIN ci-après à remplir pour activer votre compte ${userPinCode}</p><br/><p>De la même manière, si vous êtes voué(e) à avoir le rôle d'administat(eur/trice), veuillez noter que celui-ci devra être conservé car sera nécessaire pour accéder à certaines ressources de Unigate.</p>`,
      });
      // transporter.sendMail(mailData, function (err, info) {
      //   if (err) console.log('error:' + err);
      //   else console.log('info:' + info);
      // });
      return res.status(200).json();
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: err });
    }
  } else {
    res.status(405).json({ message: 'Only POST requests are allowed' });
    return;
  }
};
export default handler;
