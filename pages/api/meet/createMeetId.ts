import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';
import { verifyAuth } from '@/utils/auth/auth';
import { redisSet, redisGet, redisDel } from '@/utils/redisUtils/redisUtils';

import * as CryptoJS from 'crypto-js';
import jwt from 'jsonwebtoken';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Generate shareable id
  async function createMeetId(midLength: number) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < midLength) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }
  // Generate json structure
  async function generateJsonStructure(
    mid: string,
    type: boolean,
    company: string,
    langue: string,
    start: Date,
    end: Date,
  ) {
    // const currentDate = new Date();
    // const expirationDate = new Date(currentDate.getTime() + 4 * 60 * 60 * 1000); // 4 hours later

    const jsonStructure = {
      Mid: mid,
      Private: type,
      Company: company,
      Language: langue,
      Start: start,
      End: end,
      //   CurrentDate: currentDate.toISOString(),
      //   ExpirationDate: expirationDate.toISOString(),
    };

    return jsonStructure;
  }

  if (req.method == 'POST') {
    try {
      const userBearerAuth = req.headers.authorization;
      const userJWT = userBearerAuth?.slice(7);

      const meetConfiguration = req.body;
      if (!meetConfiguration) {
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

        if (parsedPayload.userPrismaStripeMeet == true) {
          // Generate meet id
          const mid = await createMeetId(8);
          // Encrypt mid: <iv>:<encrypted mid>
          //   const secretKey = process.env.CRYPTO_SECRET_KEY;
          //   const key = CryptoJS.enc.Utf8.parse(secretKey);
          //   let encryptedCipherMid = CryptoJS.AES.encrypt(mid, key, {
          //     iv: key,
          //   }).toString();
          // `${iv.toString('hex')}:${encryptedMid}`;

          // Generate JSON structure
          const bodyData = {
            name: `room-${mid}`,
            description: `Room ${mid} for ${parsedPayload.userPrismaCompany.toLowerCase()}`,
            template_id: '65eb388748b3dd31b94ff07b',
          };
          const managementToken = process.env.MS_MANAGEMENT_TOKEN;

          // Create room: https://www.100ms.live/docs/server-side/v2/api-reference/Rooms/create-via-api
          const createRoomRes = await fetch('https://api.100ms.live/v2/rooms', {
            body: JSON.stringify(bodyData),
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              authorization: `Bearer ${managementToken}`,
            },
            method: 'POST',
          });

          if (createRoomRes.ok) {
            const createRoomCodeData = await createRoomRes.json();

            // Create room code: https://www.100ms.live/docs/server-side/v2/api-reference/room-codes/create-room-code-api
            await fetch(
              `https://api.100ms.live/v2/room-codes/room/${createRoomCodeData.id}`,
              {
                body: JSON.stringify(createRoomCodeData.id),
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                  authorization: `Bearer ${managementToken}`,
                },
                method: 'POST',
              },
            );

            // Get previously created room code:https://www.100ms.live/docs/server-side/v2/api-reference/room-codes/get-room-code-api
            const getRoomCodeRes = await fetch(
              `https://api.100ms.live/v2/room-codes/room/${createRoomCodeData.id}`,
              {
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                  authorization: `Bearer ${managementToken}`,
                },
                method: 'GET',
              },
            );

            const getRoomCodeJson = await getRoomCodeRes.json();
            // ==========
            // TODO LATER
            // Add here the feature to return the room code according to the user email
            // -> add "host" on json structure with user email
            // ==========
            // [0] = room code for host, while [1] = room code for guest
            const getRoomCode = getRoomCodeJson.data[1]?.code;
            const getRoomCodeForRedis = getRoomCode.replace(/-/g, '');

            // console.log('room code for guests', getRoomCode);
            // console.log('room code for guests for redis', getRoomCodeForRedis);

            // console.log('createmeetid: start:', meetConfiguration.startMeet);
            // console.log('createmeetid: end:', meetConfiguration.endMeet);

            const jsonStructure = await generateJsonStructure(
              getRoomCode,
              meetConfiguration.privateMeet,
              parsedPayload.userPrismaCompany.toLowerCase(),
              meetConfiguration.languageMeet,
              meetConfiguration.startMeet,
              meetConfiguration.endMeet,
            );

            // Perform Redis requests without special characters such as -
            const cachedValue = await redisGet(getRoomCodeForRedis);
            if (cachedValue) {
              // console.log('createmeetid: value is already cached: deleting...');
              try {
                redisDel(getRoomCodeForRedis);
                return res
                  .status(206)
                  .json(
                    'A similar link already existed and has been deleted. Please create a new one',
                  );
              } catch (error) {
                return res.status(500).json({
                  message:
                    'Unable to delete an already existing link because: ' +
                    error,
                });
              }
            } else {
              // console.log('createmeetid: value does not exist: creating...');
              try {
                redisSet(getRoomCodeForRedis, jsonStructure, 'midMngmt');
                return res.status(200).json(getRoomCode);
              } catch (error) {
                return res.status(500).json({
                  message: 'Can not create shareable link because: ' + error,
                });
              }
            }
          } else {
            console.error('Failed to create room:', createRoomRes.statusText);
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
