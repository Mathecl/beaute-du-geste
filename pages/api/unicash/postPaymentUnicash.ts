import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';
import { verifyAuth } from '@/utils/auth/auth';
import jwt from 'jsonwebtoken';

import { AppContext, appContext } from '@/types/appContext';

import * as CryptoJS from 'crypto-js';

function createProductData(parsedCartData) {
  // Map each product in parsedCartData to the desired format
  const productDataArray = parsedCartData.map((product) => {
    return {
      price_data: {
        currency: 'eur',
        unit_amount: parseInt(product.price, 10) * 100, // Convert price to cents and ensure it's an integer
        product_data: {
          name: product.name,
          description: product.category + ' - ' + product.description,
        },
      },
      quantity: 1,
    };
  });

  return productDataArray;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method == 'POST') {
    try {
      const reqData: string =
        typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

      if (!reqData) {
        return res
          .status(400)
          .send({ message: 'Bad request: request body is empty' });
      }

      const cartData = reqData.substring(0, reqData.indexOf('|'));
      const userEmail = reqData.split('|')[1]?.trim() || '';
      const payMethod = reqData.split('|')[2]?.trim() || '';
      const decodedPayMethod = decodeURI(payMethod);
      const consType = reqData.split('|')[3]?.trim() || '';
      const decodedConsType = decodeURI(consType);

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
          const jwtSecretKey = process.env.JWT_SECRET_KEY;
          if (!jwtSecretKey || jwtSecretKey.length === 0) {
            throw new Error(
              'The environment variable JWT_SECRET_KEY is not set',
            );
          }
          const payload = jwt.verify(userJWT, jwtSecretKey);
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

          const entityName = 'unicash-cart-uid';

          // Use req.headers to get the headers from the request
          const userCartUID = req.headers.cookie
            ?.split('; ')
            .find((row) => row.startsWith(entityName))
            ?.split('=')[1];
          const userCartUIDValue = userCartUID?.valueOf();
          // Get the current date and time
          let currentDate = new Date();
          let currentISODate = new Date();
          const currentISODatePart = currentDate.toISOString().split('T')[0]; // Extract only the date part in ISO format
          currentISODate.setHours(currentISODate.getHours() + 2);
          // Format the date to ISO for DB
          const isoDateStr = currentISODate.toISOString();
          // Format the date and time in French locale ('fr-FR')
          const formattedDate = currentDate.toLocaleString('fr-FR', {
            timeZone: 'Europe/Paris',
          });
          const dateParts = formattedDate.split(' ');

          const listUserUnpaidOrders = await prisma.cons.findMany({
            where: {
              consumeremail: userEmail,
              company: parsedPayload.userPrismaCompany,
              city: parsedPayload.userPrismaCity,
              OR: [
                {
                  state: 'paid',
                },
                { state: 'unpaid' },
              ],
            },
          });

          // Get the most recent payment order
          // Initialize variables to keep track of the maximum number and corresponding object
          let maxNumber = -Infinity;
          let mostRecentJSON = null;
          // Iterate through the data array
          listUserUnpaidOrders.forEach((obj) => {
            // Convert the object's date to an ISO string and extract the date part
            const objectDate = new Date(obj.date).toISOString().split('T')[0]; // Convert the date to ISO string and split to get only the date part

            // Check if the object's date matches the current date
            if (objectDate === currentISODatePart) {
              // Use a regular expression to extract the number after the hyphen in the uid field
              const regex = /-(\d+)$/;
              const match = obj.uid.match(regex);

              if (match) {
                // Convert the extracted number to an integer
                const number = parseInt(match[1], 10);

                // Check if the extracted number is greater than the current maximum number
                if (number > maxNumber) {
                  maxNumber = number;
                  mostRecentJSON = obj;
                }
              }
            }
          });

          // Set payment details
          // Create the paymentdata object
          const paymentdata = {
            method: decodedPayMethod,
            type: decodedConsType,
          };
          // Construct the final JSON structure
          const finalJSON = {
            paymentdata: paymentdata,
            products: JSON.parse(cartData),
          };
          let paymentUID;
          if (!mostRecentJSON) {
            paymentUID = userCartUIDValue + dateParts[0] + '-1';
          } else {
            // Use a regular expression to match the number after the hyphen
            const regex = /-(\d+)/; // This regex captures one or more digits after the hyphen
            const match = mostRecentJSON.uid.match(regex);

            if (match) {
              // Extract the number after the hyphen and convert it to an integer
              let numberAfterHyphen = parseInt(match[1], 10);

              // Increment the number by one
              numberAfterHyphen += 1;

              paymentUID =
                userCartUIDValue + dateParts[0] + '-' + numberAfterHyphen;
            } else {
              console.log('No number found after the hyphen.');
            }
          }

          const parsedCartData = JSON.parse(cartData);
          const productDataArray = createProductData(parsedCartData);
          // const stringifiedProductDataArray = JSON.stringify(productDataArray);

          const user = await prisma.user.findFirst({
            where: {
              email: userEmail,
            },
          });

          try {
            // console.log('payment UID', paymentUID);
            // console.log('user company', user?.company);
            // console.log('user email', user?.email);
            // console.log('iso date', isoDateStr);
            // console.log('order', finalJSON);

            await prisma.cons.create({
              data: {
                uid: paymentUID,
                company: user?.company,
                consumeremail: user?.email,
                date: isoDateStr,
                state: 'unpaid',
                city: parsedPayload.userPrismaCity,
                order: finalJSON,
              },
            });
          } catch (e) {
            console.log(e);
          }

          // Encrypt price id: <iv>:<encrypted priceid>
          const secretKey = process.env.CRYPTO_SECRET_KEY;
          const key = CryptoJS.enc.Utf8.parse(secretKey);
          let cipher = CryptoJS.AES.encrypt(paymentUID, key, {
            iv: key,
          }).toString();

          // `${iv.toString('hex')}:${encryptedPriceId}`;

          // Stringified product data array is, for example:
          // [
          //   {
          //     price_data: {
          //       currency: 'eur',
          //       unit_amount: 900,
          //       product_data: {
          //         name: 'Burger',
          //         description: 'Plat - Ceci est la description du produit burger',
          //       },
          //     },
          //     quantity: 1,
          //   },
          //   {
          //     price_data: {
          //       currency: 'eur',
          //       unit_amount: 400,
          //       product_data: {
          //         name: 'Frites',
          //         description: 'Entrée - Ceci est la description des frites',
          //       },
          //     },
          //     quantity: 1,
          //   },
          // ];

          if (payMethod == 'cash') {
            return res
              .status(200)
              .send(
                appContext.appUrl +
                  '/paymentsuccess?pid=' +
                  encodeURIComponent(cipher),
              );
          } else {
            const stripe = require('stripe')(
              process.env.STRIPE_THEBROTHERS_TEST_SECRET_KEY,
            );
            // https://stripe.com/docs/api/checkout/sessions/create
            const session = await stripe.checkout.sessions.create({
              success_url:
                appContext.appUrl +
                '/paymentsuccess?pid=' +
                encodeURIComponent(cipher),
              cancel_url:
                appContext.appUrl + '/unicash/' + user?.company?.toLowerCase(),
              customer: user?.stripecustomerid,
              line_items: productDataArray,
              mode: 'payment',
              // payment_method_types: ['card'],
            });

            return res.status(200).send(session.url);
          }
        } catch (e) {
          console.log(e);
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
