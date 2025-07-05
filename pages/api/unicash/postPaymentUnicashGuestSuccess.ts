import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/utils/prisma';

import * as CryptoJS from 'crypto-js';

import cookie from 'cookie';

// Function to find ingredient by name
function findIngredientByName(ingredientsArray, name) {
  return ingredientsArray.find((ingredient) => ingredient.uid === name);
}
let maxAmountOfAvailableProducts: number = 0;
let currAmountOfAvailableProducts: number = 0;
let supplyState: string = '';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method == 'POST') {
    try {
      // STRIPE
      const dataToVerify: string =
        typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      if (!dataToVerify) {
        return res
          .status(400)
          .send({ message: 'Bad request: request body is empty' });
      }

      const paymentUID = dataToVerify;
      const decodeURIPaymentUID = decodeURIComponent(paymentUID);

      const payMethod = req.headers.cookie
        ?.split('; ')
        .find((row) => row.startsWith('unicash-payment-method'))
        ?.split('=')[1];
      const payMethodValue = payMethod?.valueOf();
      const decodedPayMethodValue = decodeURI(JSON.stringify(payMethodValue));

      const cityName = req.headers.cookie
        ?.split('; ')
        .find((row) => row.startsWith('unicash-geolocation'))
        ?.split('=')[1];
      const cityValue = cityName?.valueOf();
      const decodedCityValue = decodeURI(
        JSON.stringify(cityValue).replace(/"/g, ''), // Remove double quotes
      );
      // console.log('unicash-comp:', cityValue);
      // console.log('decoded unicash-comp:', decodedCityValue);

      const companyName = req.headers.cookie
        ?.split('; ')
        .find((row) => row.startsWith('unicash-comp'))
        ?.split('=')[1];
      const companyNameValue = companyName?.valueOf();
      const decodedCompanyNameValue = decodeURI(
        JSON.stringify(companyNameValue).replace(/"/g, ''), // Remove double quotes,
      );
      // console.log('unicash-comp:', companyNameValue);
      // console.log('decoded unicash-comp:', decodedCompanyNameValue);

      // Decrypt price id: <iv>:<encrypted decodeURIPaymentUID>
      const secretKey = process.env.CRYPTO_SECRET_KEY;
      // const [iv, encryptedText] = decodeURIPaymentUID.split(':');
      const key = CryptoJS.enc.Utf8.parse(secretKey);
      let decryptedData = CryptoJS.AES.decrypt(decodeURIPaymentUID, key, {
        iv: key,
      });
      const decryptedDataFromCrypto = decryptedData.toString(CryptoJS.enc.Utf8);
      // console.log('get paymentUID:', decryptedDataFromCrypto);

      try {
        const consDetails = await prisma.cons.findFirst({
          where: { uid: decryptedDataFromCrypto },
        });
        // console.log('get cons details:', consDetails);
        const jsonFromCons = consDetails?.order;
        // console.log('get json from cons:', jsonFromCons);

        let productsFromJson = jsonFromCons?.products;
        // console.log('get products from json:', productsFromJson);

        productsFromJson.forEach(async (product) => {
          // Erase all spaces
          const cleanedProductFromJson = product.name.replace(/\s+/g, '');
          const productFromJson = cleanedProductFromJson.toLowerCase();

          // console.log('uid:', productFromJson);
          // console.log('company:', decodedCompanyNameValue.toLowerCase());
          // console.log('city:', decodedCityValue);

          const productFromDbRecipes = await prisma.compRecipes.findFirst({
            where: {
              uid: productFromJson,
              company: decodedCompanyNameValue.toLowerCase(),
              city: decodedCityValue,
            },
          });
          // console.log('get product json from recipes:', productFromDbRecipes);
          const ingredientsFromDbRecipes = await prisma.compRecipes.findMany({
            where: {
              type: 'Ingredient',
              company: decodedCompanyNameValue.toLowerCase(),
              city: decodedCityValue,
            },
          });
          // console.log(
          // 'get ingredients from recipes:',
          // ingredientsFromDbRecipes,
          // );
          const productFromDbProducts = await prisma.compProducts.findFirst({
            where: {
              uid: productFromJson,
              company: decodedCompanyNameValue.toLowerCase(),
              city: decodedCityValue,
            },
          });
          // console.log('get product json from products:', productFromDbProducts);

          // Loop through each ingredient in the recipe
          productFromDbRecipes?.recipeandsupply?.recipe.ingredients.forEach(
            (recipeIngredient) => {
              // Find the corresponding supply ingredient
              // Erase all spaces
              const cleanedSupplyIngredient = recipeIngredient.name.replace(
                /\s+/g,
                '',
              );
              const cleanIngredientName = cleanedSupplyIngredient.toLowerCase();

              const ingredientArray = findIngredientByName(
                ingredientsFromDbRecipes,
                cleanIngredientName,
              );
              // console.log(
              //   'supply ingredient name and quantity:',
              //   ingredientArray.recipeandsupply.supply.name +
              //     ' -> ' +
              //     ingredientArray.recipeandsupply.supply.quantity,
              // );

              if (
                ingredientArray.recipeandsupply.supply.quantity >
                recipeIngredient.quantity
              ) {
                // console.log('supply is OK');
                // console.log(
                //   'Supply:',
                //   ingredientArray.recipeandsupply.supply.quantity,
                // );
                // console.log('Recipe:', recipeIngredient.quantity);

                currAmountOfAvailableProducts =
                  Math.floor(ingredientArray.recipeandsupply.supply.quantity) /
                  Math.floor(recipeIngredient.quantity);

                // console.log(
                // 'currently available products quantity:',
                // Math.floor(currAmountOfAvailableProducts),
                // );

                if (
                  maxAmountOfAvailableProducts == 0 ||
                  currAmountOfAvailableProducts < maxAmountOfAvailableProducts
                ) {
                  maxAmountOfAvailableProducts =
                    currAmountOfAvailableProducts - 1;
                }

                // console.log(
                //   'Max amount of available produts:',
                //   maxAmountOfAvailableProducts,
                // );

                if (maxAmountOfAvailableProducts < 10) {
                  supplyState = 'Presqué épuisé';
                } else {
                  supplyState = 'Disponible';
                }
              } else {
                // console.log('supply is NOK');
                supplyState = 'Epuisé';
              }
            },
          );

          // const newProductQuantity = product.quantity - 1;
          await prisma.compProducts.update({
            where: {
              uid: productFromJson,
              company: decodedCompanyNameValue.toLowerCase(),
              city: decodedCityValue,
            },
            data: {
              quantity: maxAmountOfAvailableProducts,
              inventorystatus: supplyState,
            },
          });
          // console.log('update products quantity', maxAmountOfAvailableProducts);

          if (decodedCompanyNameValue.toLowerCase() === "thebrother's") {
            let productJson;
            const productTypeFromDb = JSON.stringify(
              productFromDbProducts?.category,
            );
            const productCityFromDb = JSON.stringify(
              productFromDbProducts?.city,
            );

            if (
              productFromDbProducts?.company ===
              decodedCompanyNameValue.toLowerCase()
            ) {
              // If product recipe does not exist
              // if (productFromDbRecipes == null) {
              //   // Use a switch statement to handle different product names
              //   switch (productFromDbProducts?.product) {
              //     case 'Burger':
              //       productJson = {
              //         recipe: {
              //           name: 'Burger',
              //           ingredients: [
              //             {
              //               name: 'Steak boeuf',
              //               quantity: 100,
              //               unit: 'g',
              //             },
              //             { name: 'Pain', quantity: 50, unit: 'g' },
              //             { name: 'Salade', quantity: 30, unit: 'g' },
              //             { name: 'Tomate', quantity: 40, unit: 'g' },
              //             { name: 'Fromage', quantity: 40, unit: 'g' },
              //             { name: 'Oignon', quantity: 30, unit: 'g' },
              //           ],
              //         },
              //       };
              //       break;
              //     case 'All in':
              //       productJson = {
              //         recipe: {
              //           name: 'All in',
              //           ingredients: [
              //             { name: 'Patate', quantity: 100, unit: 'g' },
              //             { name: 'Coca', quantity: 50, unit: 'cl' },
              //             {
              //               name: 'Steak boeuf',
              //               quantity: 100,
              //               unit: 'g',
              //             },
              //             { name: 'Pain', quantity: 50, unit: 'g' },
              //             { name: 'Salade', quantity: 30, unit: 'g' },
              //             { name: 'Tomate', quantity: 40, unit: 'g' },
              //             { name: 'Fromage', quantity: 40, unit: 'g' },
              //             { name: 'Oignon', quantity: 30, unit: 'g' },
              //           ],
              //         },
              //       };
              //       break;
              //     default:
              //       console.error(`Product not found for update`);
              //   }

              //   // Product recipe
              //   await prisma.compRecipes.create({
              //     data: {
              //       uid: productFromJson,
              //       company: user?.company.toLowerCase(),
              //       recipeandsupply: productJson,
              //       type: productTypeFromDb.replace(/"/g, ''), // avoid generated "" from JSON.stringify
              //       city: productCityFromDb.replace(/"/g, ''), // avoid generated "" from JSON.stringify
              //     },
              //   });
              // } else {
              productJson = productFromDbRecipes?.recipeandsupply;
              // }

              // Ingredient supply
              let ingredientSupplyJson = {
                supply: {
                  name: 'Patate',
                  quantity: 0,
                  unit: 'g',
                },
              };

              // Update each ingredients supply based on products recipes
              productJson?.recipe.ingredients.forEach(async (ingredient) => {
                const ingredientNameWithoutSpace = ingredient.name.replace(
                  /\s+/g,
                  '',
                );
                const cleanIngredientName =
                  ingredientNameWithoutSpace.toLowerCase();

                const ingredientFromDb = await prisma.compRecipes.findFirst({
                  where: {
                    uid: cleanIngredientName,
                    company: decodedCompanyNameValue.toLowerCase(),
                    city: productCityFromDb.replace(/"/g, ''), // avoid generated "" from JSON.stringify
                  },
                });
                // console.log('get ingredient from recipes:', ingredientFromDb);

                const currentIngredientRecipeAndSupply =
                  ingredientFromDb?.recipeandsupply;

                // If ingredient line does not exist
                // if (ingredientFromDb == null) {
                //   switch (ingredient.name) {
                //     case 'Patate':
                //       ingredientSupplyJson.supply.name = 'Patate';
                //       break;
                //     case 'Coca':
                //       ingredientSupplyJson.supply.name = 'Coca';
                //       ingredientSupplyJson.supply.unit = 'cl';
                //       break;
                //     case 'Steak boeuf':
                //       ingredientSupplyJson.supply.name = 'Steak boeuf';
                //       break;
                //     case 'Pain':
                //       ingredientSupplyJson.supply.name = 'Pain';
                //       break;
                //     case 'Salade':
                //       ingredientSupplyJson.supply.name = 'Salade';
                //       break;
                //     case 'Fromage':
                //       ingredientSupplyJson.supply.name = 'Fromage';
                //       break;
                //     case 'Tomate':
                //       ingredientSupplyJson.supply.name = 'Tomate';
                //       break;
                //     case 'Oignon':
                //       ingredientSupplyJson.supply.name = 'Oignon';
                //       break;
                //     default:
                //       console.error(`Ingredient not found for update`);
                //   }

                //   await prisma.compRecipes.create({
                //     data: {
                //       uid: ingredient.name.toLowerCase(),
                //       company: user?.company?.toLowerCase(),
                //       recipeandsupply: ingredientSupplyJson,
                //       type: 'Ingredient', // avoid generated "" from JSON.stringify
                //       city: productCityFromDb.replace(/"/g, ''), // avoid generated "" from JSON.stringify
                //     },
                //   });
                // } else {
                // }

                if (ingredientSupplyJson.supply.name == undefined) {
                  // Name
                  ingredientSupplyJson.supply.name = ingredient.name;
                  // Quantity
                  ingredientSupplyJson.supply.quantity = ingredient.quantity;
                  // Unit
                  ingredientSupplyJson.supply.unit = ingredient.unit;
                } else {
                  // Name
                  ingredientSupplyJson.supply.name =
                    currentIngredientRecipeAndSupply?.supply.name;
                  // Quantity
                  ingredientSupplyJson.supply.quantity =
                    currentIngredientRecipeAndSupply?.supply.quantity;
                  // Unit
                  ingredientSupplyJson.supply.unit =
                    currentIngredientRecipeAndSupply?.supply.unit;
                }

                // Calculate the new supply quantity after subtracting the ingredient quantity from the recipe
                ingredientSupplyJson.supply.quantity -= ingredient.quantity;

                // Ensure the supply quantity does not go negative
                if (ingredientSupplyJson.supply.quantity < 0) {
                  ingredientSupplyJson.supply.quantity = 0;
                }

                await prisma.compRecipes.update({
                  where: {
                    uid: cleanIngredientName,
                    company: decodedCompanyNameValue.toLowerCase(),
                    city: decodedCityValue,
                  },
                  data: { recipeandsupply: ingredientSupplyJson },
                });
                // console.log('updated recipeandsupply');
              });
            }
          }
        });

        if (payMethodValue?.replace(/^"|"$/g, '') == 'cash') {
          await prisma.cons.update({
            where: { uid: decryptedDataFromCrypto },
            data: { state: 'unpaid' },
          });
          // console.log('updated cons state to unpaidv');
        } else {
          await prisma.cons.update({
            where: { uid: decryptedDataFromCrypto },
            data: { state: 'paid' },
          });
          // console.log('updated cons state to paid');
        }
      } catch (error) {
        console.error(`Failed to update payment state from consumer: ${error}`);
      }

      // const emailSrc = process.env.EMAIL;
      // const pwdSrc = process.env.EMAIL_PASS;
      // const emailDst: string = userEmail;

      // const transporter = nodemailer.createTransport({
      //   // port: 465,
      //   // host: 'smtp.gmail.com',
      //   // auth: {
      //   //   user: 'demo email',
      //   //   pass: process.env.password,
      //   // },
      //   // secure: true,
      //   service: 'gmail',
      //   auth: {
      //     user: emailSrc,
      //     pass: pwdSrc,
      //   },
      // });
      // const mailOptions = {
      //   from: emailSrc,
      //   to: emailDst,
      //   subject: `Email de Unigate pour l'activation de votre compte`,
      //   html: `<h1>Facture,</h1><br/><p>Veuillez trouver le code PIN ci-après à remplir pour activer votre compte ${userPinCode}</p><br/><p>De la même manière, si vous êtes voué(e) à avoir le rôle d'administat(eur/trice), veuillez noter que celui-ci devra être coservé car sera nécessaire pour accéder à certaines ressources de Unigate.</p>`,
      // };
      // await transporter.sendMail({
      //   ...mailOptions,
      //   subject: `Email de Unigate pour l'activation de votre compte`,
      //   // test: 'text test',
      //   html: `<h1>Cher(e) ${reqData.userName},</h1><br/><p>Veuillez trouver le code PIN ci-après à remplir pour activer votre compte ${userPinCode}</p><br/><p>De la même manière, si vous êtes voué(e) à avoir le rôle d'administat(eur/trice), veuillez noter que celui-ci devra être conservé car sera nécessaire pour accéder à certaines ressources de Unigate.</p>`,
      // });

      const currentDomain = process.env.NEXT_PUBLIC_APP_URL;

      // Delete the 'user-token' cookie
      const deletedCookie = cookie.serialize('unicash-cart-uid', '', {
        maxAge: -1, // Set maxAge to a negative value to delete the cookie
        httpOnly: true,
        path: '/', // Specify the path of the cookie
      });
      res.setHeader('Set-Cookie', [deletedCookie]);
      res.setHeader('Access-Control-Allow-Origin', currentDomain);

      return res.status(200).json({
        message: 'Successfully paid and updated DB + cookies accorindgly',
        comp: companyNameValue,
      });
    } catch (error) {
      return res.status(500).json('Error from API:' + error);
    }
  } else {
    res.status(405).send({ message: 'Only POST requests allowed' });
    return;
  }
}
