import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';

import { verifyAuth } from '@/utils/auth/auth';
import jwt from 'jsonwebtoken';

function updateDataByKey(jsonData, key, newData, type) {
  if (type === 'Recette') {
    // Traverse through the children array
    for (const child of jsonData.children) {
      if (child.key === key) {
        // Update the data of the item
        child.data = { ...child.data, ...newData };
        return; // Exit the loop if the item is found
      }
    }
    console.log(`Item with key ${key} not found.`);
  } else {
    console.log('Invalid type:', type);
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
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
      return res.status(401).json({ message: 'Unauthorized' });
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
          const reqData: string =
            typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

          if (!reqData) {
            return res
              .status(400)
              .send({ message: 'Bad request: request body is empty' });
          }

          const json = reqData.substring(0, reqData.indexOf('|'));
          // console.log('JSON:', JSON.stringify(json));
          const parsedJson = JSON.parse(json);

          const jsonKeyToUpdate = reqData.split('|')[1]?.trim() || '';
          // i.e: 2-2
          // console.log('JSON Key to update:', jsonKeyToUpdate);
          const isQuantityOrUnit = reqData.split('|')[4]?.trim() || '';
          // i.e: Unit
          // console.log('JSON Quantity or unit:', isQuantityOrUnit);

          const dbLineToUpdate = parsedJson.data.name;
          const dbLineToUpdateWithoutSpaces = dbLineToUpdate.replace(
            /\s+/g,
            '',
          );
          const dbCleanLineToUpdate = dbLineToUpdateWithoutSpaces.toLowerCase();
          // i.e: lasagne
          // console.log('DB UID to update:', dbCleanLineToUpdate);
          const dbIngredientToUpdate = reqData.split('|')[2]?.trim() || '';
          // i.e: Crème fraiche
          // console.log('DB Ingredient to update:', dbIngredientToUpdate);
          const dbValueToUpdate = reqData.split('|')[3]?.trim() || '';
          // i.e: 125
          // console.log('DB Ingredient value to update:', dbValueToUpdate);

          // Update data of key
          let cleanValueToUpdate = {};
          if (isQuantityOrUnit == 'Quantity') {
            cleanValueToUpdate = { quantity: dbValueToUpdate };
          } else {
            cleanValueToUpdate = { unit: dbValueToUpdate };
          }

          if (parsedJson.data.type == 'Recette') {
            // console.log('Recette');
            // {"recipe":{"name":"Lasagne","ingredients":[{"name":"Boeuf haché","unit":"g","quantity":250},{"name":"Sauce tomate","unit":"ml","quantity":100},{"name":"Crème fraiche","unit":"ml","quantity":100}]}}

            updateDataByKey(
              parsedJson,
              jsonKeyToUpdate,
              cleanValueToUpdate,
              parsedJson.data.type,
            );

            // Extract the relevant data from the "children" array
            const ingredients = parsedJson.children.map((child) => ({
              name: child.data.name,
              unit: child.data.unit,
              quantity: parseInt(child.data.size), // Assuming "size" represents quantity
            }));

            // Structure the data into the desired format
            const transformedJson = {
              recipe: {
                name: parsedJson.data.name,
                ingredients: ingredients,
              },
            };

            await prisma.compRecipes.update({
              where: {
                uid: dbCleanLineToUpdate,
                company: parsedPayload.userPrismaCompany,
                city: parsedPayload.userPrismaCity,
              },

              data: { recipeandsupply: transformedJson },
            });
          } else {
            // console.log('Ingredient');
            // {"supply":{"name":"Tomate","unit":"g","quantity":500}}

            // Construct the desired object
            const transformedObject = {
              supply: {
                name: parsedJson.data.name,
                unit: parsedJson.data.unit,
                quantity: parseInt(parsedJson.data.size), // Assuming "size" represents quantity
              },
            };

            await prisma.compRecipes.update({
              where: {
                uid: dbCleanLineToUpdate,
                company: parsedPayload.userPrismaCompany,
                city: parsedPayload.userPrismaCity,
              },

              data: { recipeandsupply: transformedObject },
            });
          }

          return res
            .status(200)
            .json({ message: 'Mise à jour effectuée avec succès' });
        } else {
          return res.status(401).json({ message: 'Unauthorized' });
        }
      } catch (error) {
        return res.status(500).json({ message: 'Value not updated' + error });
      }
    }
  } else {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }
};
export default handler;
