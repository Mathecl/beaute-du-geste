import { NextApiRequest, NextApiResponse } from 'next';

import cookie from 'cookie';

import { redisSet, redisGet } from '@/utils/redisUtils/redisUtils';

function generateRandomCharacters(amount) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < amount; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method == 'POST') {
    if (!req.body) {
      return res
        .status(400)
        .send({ message: 'Bad request: request body is empty' });
    }
    let productToDelete;
    if (typeof req.body === 'string') {
      try {
        productToDelete = JSON.parse(req.body);
      } catch (error) {
        return res
          .status(400)
          .json({ message: 'Invalid JSON format in request body' });
      }
    } else {
      productToDelete = req.body;
    }

    const userBearerAuth = req.headers.authorization;
    const userJWT = userBearerAuth?.slice(7);

    try {
      const entityName = 'unicash-cart-uid';

      let finalCartUID;
      // Use req.headers to get the headers from the request
      const userCartUID = req.headers.cookie
        ?.split('; ')
        .find((row) => row.startsWith(entityName))
        ?.split('=')[1];
      const userCartUIDValue = userCartUID?.valueOf();

      if (userCartUIDValue === undefined) {
        const cartUID = generateRandomCharacters(8);

        finalCartUID = cartUID;
        res.setHeader(
          'Set-Cookie',
          cookie.serialize(entityName, cartUID, {
            httpOnly: true,
            path: '/',
            // secure: process.env.NODE_ENV === 'production',
          }),
        );
      } else {
        finalCartUID = userCartUIDValue;
      }

      try {
        const keyCartUID = 'get' + finalCartUID + 'Cart';

        const cachedValue = await redisGet(keyCartUID);

        let cartData = [];
        if (cachedValue) {
          cartData = JSON.parse(cachedValue);

          // Filter the list of products to remove the specified object
          const filteredProducts = cartData.filter((product) => {
            return !(
              product.category === productToDelete.category &&
              product.description === productToDelete.description &&
              product.expirationTime === productToDelete.expirationTime &&
              product.inventoryStatus === productToDelete.inventoryStatus &&
              product.name === productToDelete.name &&
              product.price === productToDelete.price &&
              product.quantity === productToDelete.quantity &&
              product.rating === productToDelete.rating &&
              product.uid === productToDelete.uid
            );
          });

          const updatedJsonString = JSON.stringify(filteredProducts);

          await redisSet(keyCartUID, filteredProducts, 'unicashCartMngmt');
          return res.status(200).json(updatedJsonString);
        } else {
          await redisSet(keyCartUID, productToDelete, 'unicashCartMngmt');
          return res.status(200).json(productToDelete);
        }
      } catch (error) {
        console.log('error from redis:', error);
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    res.status(405).send({ message: 'Only POST requests allowed' });
    return;
  }
}
