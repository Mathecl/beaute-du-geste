import { NextApiRequest, NextApiResponse } from 'next';

import cookie from 'cookie';

import prisma from '@/utils/prisma';
import { redisSet, redisGet } from '@/utils/redisUtils/redisUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method == 'GET') {
    const companyName = req.headers.cookie
      ?.split('; ')
      .find((row) => row.startsWith('unicash-comp'))
      ?.split('=')[1];
    const companyNameValue = companyName?.valueOf();
    const userCompany = companyNameValue?.toLowerCase();
    const decodedCompanyNameValue = decodeURI(JSON.stringify(userCompany));

    const cityName = req.headers.cookie
      ?.split('; ')
      .find((row) => row.startsWith('unicash-geolocation'))
      ?.split('=')[1];
    const cityValue = cityName?.valueOf();

    // .replace(/\s/g, "") to erase spaces
    const userCompanyWithoutSpaces =
      'get' + decodedCompanyNameValue.replace(/\s/g, '') + 'Products';
    const cachedValue = await redisGet(userCompanyWithoutSpaces);

    if (cachedValue) {
      const parsedCachedValue = JSON.parse(cachedValue);
      return res.status(200).json(parsedCachedValue);
    } else {
      const listProducts = await prisma.compProducts.findMany({
        where: {
          company: userCompany,
          city: cityValue,
        },
      });

      try {
        await redisSet(
          userCompanyWithoutSpaces,
          listProducts,
          'unicashProductMngmt',
        );
      } catch (error) {
        console.log('error from redis:', error);
      }

      return res.status(200).json(listProducts);
    }
  } else {
    res.status(405).send({ message: 'Only GET requests allowed' });
    return;
  }
}
