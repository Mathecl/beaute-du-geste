import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';

import { verifyAuth } from '@/utils/auth/auth';
import jwt from 'jsonwebtoken';
import { hash } from 'bcrypt';
import nodemailer from 'nodemailer';

async function createHashedPassword(hashLength: number, password: string) {
  const hashedPassword = await hash(password, hashLength);
  return hashedPassword;
}

async function hashPinCode(hashLength: number, pincode: string) {
  const hashedPinCode = await hash(pincode, hashLength);
  return hashedPinCode;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method == 'POST') {
    const dataToUpdate: string =
      typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (!dataToUpdate) {
      return res
        .status(400)
        .send({ message: 'Bad request: request body is empty' });
    }
    const parsedData = JSON.parse(dataToUpdate);
    const { column, whereEmailData, columnData } = parsedData;

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
      try {
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

        if (parsedPayload.userPrismaRole == 'admin') {
          try {
            switch (column) {
              case 'role':
                await prisma.user.update({
                  where: { email: whereEmailData },
                  data: {
                    role: columnData,
                  },
                });
                return res.status(200).json({ message: 'ok' });
              case 'subscription':
                await prisma.user.update({
                  where: { email: whereEmailData },
                  data: {
                    subscription: columnData,
                  },
                });
                return res.status(200).json({ message: 'ok' });
              case 'stripecustomerid':
                await prisma.user.update({
                  where: { email: whereEmailData },
                  data: {
                    stripecustomerid: columnData,
                  },
                });
                return res.status(200).json({ message: 'ok' });
              case 'company':
                await prisma.user.update({
                  where: { email: whereEmailData },
                  data: {
                    company: columnData,
                  },
                });
                return res.status(200).json({ message: 'ok' });
              case 'name':
                await prisma.user.update({
                  where: { email: whereEmailData },
                  data: {
                    name: columnData,
                  },
                });
                return res.status(200).json({ message: 'ok' });
              case 'verified':
                await prisma.user.update({
                  where: { email: whereEmailData },
                  data: {
                    verified: JSON.parse(columnData), // from string to boolean
                  },
                });
                return res.status(200).json({ message: 'ok' });
              case 'approved':
                await prisma.user.update({
                  where: { email: whereEmailData },
                  data: {
                    approved: JSON.parse(columnData), // from string to boolean
                  },
                });
                return res.status(200).json({ message: 'ok' });
              case 'stripebiznetwork':
                await prisma.user.update({
                  where: { email: whereEmailData },
                  data: {
                    stripebiznetwork: JSON.parse(columnData), // from string to boolean
                  },
                });
                return res.status(200).json({ message: 'ok' });
              case 'stripeassistant':
                // tbd: add logic here to add "stripeassistant" subscription for stripecustomerid from whereEmailData
                await prisma.user.update({
                  where: { email: whereEmailData },
                  data: {
                    stripeassistant: JSON.parse(columnData), // from string to boolean
                  },
                });
                return res.status(200).json({ message: 'ok' });
              case 'stripemeet':
                // tbd: add logic here to add "stripemeet" subscription for stripecustomerid from whereEmailData
                await prisma.user.update({
                  where: { email: whereEmailData },
                  data: {
                    stripemeet: JSON.parse(columnData), // from string to boolean
                  },
                });
                return res.status(200).json({ message: 'ok' });
              // case 'stripecollab':
              //   // tbd: add logic here to add "stripecollab" subscription for stripecustomerid from whereEmailData
              //   await prisma.user.update({
              //     where: { email: whereEmailData },
              //     data: {
              //       stripecollab: JSON.parse(columnData), // from string to boolean
              //     },
              //   });
              //   return res.status(200).json({ message: 'ok' });
              case 'password':
                const userHashedPassword: string = await createHashedPassword(
                  12,
                  columnData,
                );
                await prisma.user.update({
                  where: { email: whereEmailData },
                  data: {
                    password: userHashedPassword,
                  },
                });
                return res
                  .status(200)
                  .json({ message: 'ok', value: userHashedPassword });
              case 'pinCode':
                const userHashedPinCode: string = await hashPinCode(
                  12,
                  columnData,
                );
                await prisma.user.update({
                  where: { email: whereEmailData },
                  data: {
                    pinCode: userHashedPinCode,
                  },
                });

                const emailSrc = process.env.EMAIL;
                const pwdSrc = process.env.EMAIL_PASS;
                const emailDst: string = whereEmailData;
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
                  html: `<h1>Cher(e) ${whereEmailData.userName},</h1><br/><p>Veuillez trouver le code PIN ci-après à remplir pour activer votre compte ${userPinCode}</p><br/><p>De la même manière, si vous êtes voué(e) à avoir le rôle d'administat(eur/trice), veuillez noter que celui-ci devra être coservé car sera nécessaire pour accéder à certaines ressources de Unigate.</p>`,
                };
                await transporter.sendMail({
                  ...mailOptions,
                  subject: `Email de Unigate pour l'activation de votre compte`,
                  // test: 'text test',
                  html: `<h1>Cher(e) ${whereEmailData.userName},</h1><br/><p>Veuillez trouver le code PIN ci-après à remplir pour activer votre compte ${userPinCode}</p><br/><p>De la même manière, si vous êtes voué(e) à avoir le rôle d'administat(eur/trice), veuillez noter que celui-ci devra être conservé car sera nécessaire pour accéder à certaines ressources de Unigate.</p>`,
                });
                // transporter.sendMail(mailData, function (err, info) {
                //   if (err) console.log('error:' + err);
                //   else console.log('info:' + info);
                // });

                return res
                  .status(200)
                  .json({ message: 'ok', value: userHashedPinCode });
            }
          } catch (e) {
            return res.status(500).json(e);
          }
        } else {
          return res.status(401).json({ error: 'Unauthorized' });
        }
      } catch (error) {
        return res.status(500).json(error);
      }
    }
  } else {
    res.status(405).send({ message: 'Only POST requests allowed' });
    return;
  }
}
