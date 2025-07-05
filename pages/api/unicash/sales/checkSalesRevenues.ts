import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';

import { verifyAuth } from '@/utils/auth/auth';
import jwt from 'jsonwebtoken';

// Function to get the start and end dates of the current week
function getCurrentWeekRange() {
  // Calculate the start and end dates of the current week
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  return [startOfWeek, endOfWeek];
}

// Get the current date and time
const currentDate = new Date();
// Function to get the start and end dates of the current month
function getCurrentMonthRange() {
  // Calculate the start and end dates of the current month
  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  );
  const endOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  );
  return [startOfMonth, endOfMonth];
}
// Filter data entries by date range
function filterByDateRange(data, startDate, endDate) {
  return data.filter((obj) => {
    const entryDate = new Date(obj.date);
    return entryDate >= startDate && entryDate <= endDate;
  });
}
// Get the date ranges for today, this week, and this month
const todayStartDate = new Date(currentDate.toISOString().split('T')[0]); // Only use the date part (YYYY-MM-DD)
const todayEndDate = new Date(todayStartDate);
todayEndDate.setDate(todayStartDate.getDate() + 1); // Add one day to include the whole day

const [weekStartDate, weekEndDate] = getCurrentWeekRange();
const [monthStartDate, monthEndDate] = getCurrentMonthRange();

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
        const reqData: string =
          typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

        if (!reqData) {
          return res
            .status(400)
            .send({ message: 'Bad request: request body is empty' });
        }

        const timePeriod = reqData.substring(0, reqData.indexOf(','));
        const userEmail = reqData.split(',')[1]?.trim() || '';

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
            // Get the current date and format it to ISO for DB
            let currentDate = new Date();
            let currentISODate = new Date();
            const currentISODatePart = currentDate.toISOString().split('T')[0]; // Extract only the date part in ISO format
            currentISODate.setHours(currentISODate.getHours() + 2);
            const isoDateStr = currentISODate.toISOString();

            // Get user related content
            const companyFromPayload = parsedPayload.userPrismaCompany;

            // Orders history
            let historyTrackingData;
            historyTrackingData = await prisma.cons.findMany({
              where: {
                AND: [
                  {
                    company: companyFromPayload,
                  },
                  { state: 'paid' },
                ],
              },
            });

            let timeBasedHistoryTrackingData;
            if (timePeriod === 'Journalier') {
              timeBasedHistoryTrackingData = filterByDateRange(
                historyTrackingData,
                todayStartDate,
                todayEndDate,
              );
            } else if (timePeriod === 'Hebdomadaire') {
              timeBasedHistoryTrackingData = filterByDateRange(
                historyTrackingData,
                weekStartDate,
                weekEndDate,
              );
            } else if (timePeriod === 'Mensuel') {
              timeBasedHistoryTrackingData = filterByDateRange(
                historyTrackingData,
                monthStartDate,
                monthEndDate,
              );
            }

            return res.status(200).json({
              data: { timeBasedHistoryTrackingData },
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
