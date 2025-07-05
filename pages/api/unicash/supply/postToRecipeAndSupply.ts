import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';

import { verifyAuth } from '@/utils/auth/auth';
import jwt from 'jsonwebtoken';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    if (!req.body) {
      return res
        .status(400)
        .send({ message: 'Bad request: request body is empty' });
    }

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
      const jsonFromReq = req.body;
      // console.log('form data:', jsonFromReq.formData);
      // console.log('recipe name:', jsonFromReq.recipeName);
      // console.log('operation type:', jsonFromReq.operationType);
      // console.log('selected operation type:', jsonFromReq.selectedOperationType);
      // console.log('selected recipe type:', jsonFromReq.recipeType);
      // console.log('company:', jsonFromReq.company);
      // console.log('city:', jsonFromReq.city);

      // Clean names
      const recipeNameWithoutSpace = jsonFromReq.recipeName.replace(/\s+/g, '');
      const cleanRecipeName = recipeNameWithoutSpace.toLowerCase();

      // Parse the JSON string into an array of objects
      const ingredientsJson = JSON.parse(jsonFromReq.formData);

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
          if (jsonFromReq.operationType === 'Ajouter') {
            // PRISMA ADD OPERATION
            // ====================

            if (jsonFromReq.selectedOperationType === 'Recette') {
              // RECETTE
              // =======

              // Initialize an object with a recipe property
              const recipeObject = {
                recipe: {
                  name: jsonFromReq.recipeName, // Set the recipe name
                  ingredients: [], // Initialize an empty array for ingredients
                },
              };

              // Iterate through each ingredient in the array
              ingredientsJson.forEach((ingredient) => {
                // Create an ingredient object with the desired structure
                const ingredientObject = {
                  name: ingredient.name,
                  unit: ingredient.unit,
                  quantity: parseFloat(ingredient.quantity), // Convert quantity to a number
                };

                // Add the ingredient object to the ingredients array
                recipeObject.recipe.ingredients.push(ingredientObject);
              });

              // Convert the final object to a JSON string (optional) and log it
              // console.log(JSON.stringify(recipeObject, null, 2));

              await prisma.compRecipes.create({
                data: {
                  uid: cleanRecipeName,
                  company: jsonFromReq.company,
                  recipeandsupply: recipeObject,
                  type: jsonFromReq.selectedOperationType,
                  city: jsonFromReq.city,
                },
              });
            } else if (jsonFromReq.selectedOperationType === 'Stock') {
              // STOCK
              // =====

              // Initialize an array to hold the transformed JSON objects
              const transformedSupplies = [];

              // Iterate through each supply in the array
              ingredientsJson.forEach((supply) => {
                // Create the transformed JSON object for the current supply
                const transformedSupply = {
                  supply: {
                    name: supply.name,
                    unit: supply.unit,
                    quantity: parseFloat(supply.quantity), // Convert quantity to number
                  },
                };

                // Add the transformed JSON object to the array
                transformedSupplies.push(transformedSupply);
              });

              // For each transformed JSON object
              transformedSupplies.forEach(async (transformedSupply) => {
                // console.log(JSON.stringify(transformedSupply));

                const ingredientNameWithoutSpace =
                  transformedSupply.supply.name.replace(/\s+/g, '');
                const cleanIngredientName =
                  ingredientNameWithoutSpace.toLowerCase();

                await prisma.compRecipes.create({
                  data: {
                    uid: cleanIngredientName,
                    company: jsonFromReq.company,
                    recipeandsupply: transformedSupply,
                    type: 'Ingredient',
                    city: jsonFromReq.city,
                  },
                });
              });
            } else {
              return res.status(400).send({
                message:
                  'Bad request: operation type (recipe or stock) is invalid',
              });
            }
          } else if (jsonFromReq.operationType === 'Supprimer') {
            // Prisma DELETE operation

            if (jsonFromReq.selectedOperationType === 'Recette') {
              // RECETTE
              // =======

              await prisma.compRecipes.delete({
                where: {
                  uid: cleanRecipeName,
                  company: jsonFromReq.company,
                  type: jsonFromReq.selectedOperationType,
                  city: jsonFromReq.city,
                },
              });
            } else if (jsonFromReq.selectedOperationType === 'Stock') {
              // STOCK
              // =====

              // Initialize an array to hold the transformed JSON objects
              const transformedSupplies = [];

              // Iterate through each supply in the array
              ingredientsJson.forEach((supply) => {
                // Create the transformed JSON object for the current supply
                const transformedSupply = {
                  supply: {
                    name: supply.name,
                    unit: supply.unit,
                    quantity: parseFloat(supply.quantity), // Convert quantity to number
                  },
                };

                // Add the transformed JSON object to the array
                transformedSupplies.push(transformedSupply);
              });

              // For each transformed JSON object
              transformedSupplies.forEach(async (transformedSupply) => {
                // console.log(JSON.stringify(transformedSupply));

                const ingredientNameWithoutSpace =
                  transformedSupply.supply.name.replace(/\s+/g, '');
                const cleanIngredientName =
                  ingredientNameWithoutSpace.toLowerCase();

                await prisma.compRecipes.delete({
                  where: {
                    uid: cleanIngredientName,
                    company: jsonFromReq.company,
                    type: 'Ingredient',
                    city: jsonFromReq.city,
                  },
                });
              });
            } else {
              return res.status(400).send({
                message:
                  'Bad request: operation type (recipe or stock) is invalid',
              });
            }
          } else {
            return res.status(400).send({
              message: 'Bad request: operation type (add or delete) is invalid',
            });
          }
          return res.status(200).json({ message: 'ok' });
        } else {
          return res.status(401).json({ error: 'Unauthorized' });
        }
      } catch (error) {
        return res
          .status(500)
          .json({ message: 'Recipe or ingredient not created' + error });
      }
    }
  } else {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }
};
export default handler;
