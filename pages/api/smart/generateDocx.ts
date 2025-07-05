import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

import { verifyAuth } from '@/utils/auth/auth';
import { Document, Packer, Paragraph, TextRun } from 'docx';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method == 'POST') {
    try {
      const userBearerAuth = req.headers.authorization;
      const userJWT = userBearerAuth?.slice(7);

      const { textFromReq } = req.body;
      if (!textFromReq) {
        return res
          .status(400)
          .send({ message: 'Bad request: request body is empty' });
      }

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

        if (parsedPayload.userPrismaStripeAssistant == true) {
          try {
            const doc = new Document({
              sections: [
                {
                  properties: {},
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun(textFromReq),
                        // new TextRun({
                        //   text: 'Foo Bar',
                        //   bold: true,
                        // }),
                        // new TextRun({
                        //   text: '\tGithub is the best',
                        //   bold: true,
                        // }),
                      ],
                    }),
                  ],
                },
              ],
            });

            const buffer = await Packer.toBuffer(doc);

            res.setHeader(
              'Content-Disposition',
              'attachment; filename=document.docx',
            );
            res.setHeader(
              'Content-Type',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            );
            res.status(200).send(buffer);
          } catch (error) {
            console.error('Error generating document:', error);
            res.status(500).end();
          }
        } else {
          return res.status(401).json({ error: 'Unauthorized' });
        }
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    res.status(405).send({ message: 'Only POST requests allowed' });
    return;
  }
}
