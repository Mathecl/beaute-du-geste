import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';

import { verifyAuth } from '@/utils/auth/auth';
import jwt from 'jsonwebtoken';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
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
          const listRecipeAndSupply = await prisma.compRecipes.findMany({
            where: {
              AND: [
                {
                  company: parsedPayload.userPrismaCompany,
                },
                { city: parsedPayload.userPrismaCity },
              ],
            },
          });

          function transformData(data) {
            const transformedData = [];

            data.forEach((item) => {
              if (item.recipeandsupply) {
                const { recipe, supply } = item.recipeandsupply;

                if (recipe) {
                  const recipeNode = {
                    key: transformedData.length.toString(),
                    data: {
                      name: recipe.name,
                      type: 'Recette',
                    },
                    children: recipe.ingredients.map((ingredient, index) => ({
                      key: `${transformedData.length}-${index}`,
                      data: {
                        name: ingredient.name,
                        size: ingredient.quantity.toString(),
                        unit: ingredient.unit,
                        type: 'Ingredient',
                      },
                    })),
                  };

                  transformedData.push(recipeNode);
                }

                if (supply) {
                  const supplyNode = {
                    key: transformedData.length.toString(),
                    data: {
                      name: supply.name,
                      size: supply.quantity.toString(),
                      unit: supply.unit,
                      type: 'Ingredient',
                    },
                  };

                  transformedData.push(supplyNode);
                }
              }
            });

            return transformedData;
          }

          const transformedData = transformData(listRecipeAndSupply);

          return res.status(200).json(transformedData);
        } else {
          return res.status(401).json({ error: 'Unauthorized' });
        }
      } catch (error) {
        return res.status(500).json({ message: 'User not signed in' + error });
      }
    }
  } else {
    return res.status(405).json({ message: 'Only GET requests are allowed' });
  }
};
export default handler;
