import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';

import { verifyAuth } from '@/utils/auth/auth';
import jwt from 'jsonwebtoken';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method == 'POST') {
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
        const bodyFromReq = req.body;

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

        if (parsedPayload.userPrismaStripeCash == true) {
          try {
            // Get the current date and time
            const currentDate = new Date();
            // Format the date and time in French locale ('fr-FR')
            const formattedDate = currentDate.toLocaleString('fr-FR', {
              timeZone: 'Europe/Paris',
            });
            const dateParts = formattedDate.split(' ');

            const companyFromPayload = parsedPayload.userPrismaCompany;
            const emailFromPayload = parsedPayload.userPrismaEmail;
            const emailParts = emailFromPayload.split('@');
            const hourlyRate = 8.9;
            const fixedHourlyRate = hourlyRate.toFixed(2);

            const createdUID =
              companyFromPayload.toLowerCase() + emailParts[0] + dateParts[0];
            let timeTrackingData;
            let historyTrackingData;

            if (bodyFromReq === null) {
              timeTrackingData = await prisma.compEmployees.findFirst({
                where: { uid: createdUID, email: emailFromPayload },
              });

              historyTrackingData = await prisma.compEmployees.findMany({
                where: { email: emailFromPayload },
              });
            } else {
              timeTrackingData = await prisma.compEmployees.findFirst({
                where: { uid: createdUID, email: bodyFromReq.email },
              });

              historyTrackingData = await prisma.compEmployees.findMany({
                where: { email: bodyFromReq.email },
              });
            }

            const clocksTrackingData = timeTrackingData?.clock[0];

            let clockStatus = '';
            if (timeTrackingData == undefined) {
              clockStatus = 'Clock is not already created';
            } else if (clocksTrackingData.clockState === 'in') {
              clockStatus = 'Clock is in in mode';
            } else if (clocksTrackingData.clockState === 'break') {
              clockStatus = 'Clock is in break mode';
            }

            return res.status(200).json({
              message: { clockStatus },
              data: { historyTrackingData },
            });
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
