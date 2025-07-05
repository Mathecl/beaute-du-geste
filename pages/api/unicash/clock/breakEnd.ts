import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';

import { verifyAuth } from '@/utils/auth/auth';
import jwt from 'jsonwebtoken';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method == 'GET') {
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

        if (parsedPayload.userPrismaStripeCash == true) {
          try {
            // Company and email
            const companyFromPayload = parsedPayload.userPrismaCompany;
            const emailFromPayload = parsedPayload.userPrismaEmail;
            const emailParts = emailFromPayload.split('@');

            // Get the current date and time
            let currentDate = new Date();
            // Format the date and time in French locale ('fr-FR')
            const formattedDate = currentDate.toLocaleString('fr-FR', {
              timeZone: 'Europe/Paris',
            });
            const dateParts = formattedDate.split(' ');

            const createdUID =
              companyFromPayload.toLowerCase() + emailParts[0] + dateParts[0];

            const timeTrackingData = await prisma.compEmployees.findFirst({
              where: {
                uid: createdUID,
                email: parsedPayload.userPrismaEmail,
              },
            });
            const clocksTrackingData = timeTrackingData?.clock[0];
            clocksTrackingData.clockState = 'in';
            // Update the last break's end time
            // Iterate over the breaks array in reverse to find the last break with an empty "end" time
            for (let i = clocksTrackingData.breaks.length - 1; i >= 0; i--) {
              if (clocksTrackingData.breaks[i].end === '') {
                // Update the "end" time of the last break that is still empty
                clocksTrackingData.breaks[i].end = formattedDate;
                break; // Exit the loop once the first empty break is found and updated
              }
            }
            const timeTrackingDataArray = [clocksTrackingData];
            const hourlyRate = 8.9;
            const fixedHourlyRate = hourlyRate.toFixed(2);

            try {
              await prisma.compEmployees.update({
                where: { uid: createdUID, email: emailFromPayload },
                data: { clock: timeTrackingDataArray },
              });
            } catch (e) {
              console.log(e);
            }
            return res.status(200).json({ message: 'Break updated' });
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
    res.status(405).send({ message: 'Only GET requests allowed' });
    return;
  }
}
