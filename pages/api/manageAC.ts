import prisma from '@/utils/prisma';
import * as CryptoJS from 'crypto-js';

// Define the type for a license
interface License {
  a: string;
  w: string;
  ac: string;
  ca: string;
  ma: number;
}
// The function to search through all licenses for a specific value of w, the smallest ca among others and ca <= ma
function findLicenseWithW(
  licenses: JsonValue,
  targetW: string,
): License | undefined {
  let smallestLicense: License | undefined;
  let smallestCa: number | undefined;

  for (const key in licenses) {
    if (licenses.hasOwnProperty(key)) {
      if (licenses[key].w === targetW) {
        const license = licenses[key];
        if (parseInt(license.ca) <= license.ma) {
          const ca = parseInt(license.ca);
          if (smallestCa === undefined || ca < smallestCa) {
            smallestCa = ca;
            smallestLicense = license;
          }
        }
      }
    }
  }
  return smallestLicense;
}
const handler = async (req, res) => {
  if (req.method === 'POST') {
    const reqData = req.body;
    if (!reqData) {
      return res
        .status(400)
        .send({ message: 'Bad request: request body is empty' });
    }

    const ac = reqData.substring(0, reqData.indexOf(','));
    const userCompanyBrut = reqData.split(',')[1]?.trim() || '';
    const userCompany = userCompanyBrut.toLowerCase();
    const userEmail = reqData.split(',')[2]?.trim() || '';
    const userWidget = reqData.split(',')[3]?.trim() || '';

    try {
      try {
        // Does userCompany == AC company name ?
        if (ac && userCompany && userEmail) {
          const user = await prisma.user.findFirst({
            where: {
              email: userEmail,
            },
          });

          const company = await prisma.company.findFirst({
            where: {
              name: userCompanyBrut,
            },
          });

          let companyLicenses = company?.licenses;
          // check if ac == companyLicenses ac ?
          if (company?.name.toLowerCase() == userCompany) {
            // search for a license
            // console.log('Company licenses:', companyLicenses);
            // console.log('User widget:', userWidget);
            const foundLicense = findLicenseWithW(companyLicenses, userWidget);

            if (foundLicense) {
              // License found, proceed with further actions
              //   console.log(`License found:`, foundLicense);

              // Update the license
              // set approved to true, increment ca and check if ca <= ma
              // increment ca and check if it's higher than ma
              const newCa = parseInt(foundLicense.ca) + 1;
              if (newCa > foundLicense.ma) {
                return res
                  .status(206)
                  .json('Activation limit for this license exceeded');
              } else {
                // Update ca in the license
                foundLicense.ca = String(newCa);
                // Set approved to true if not already
                if (foundLicense.a !== 'true') {
                  foundLicense.a = 'true';
                }
                // console.log('License updated:', foundLicense);

                // Update the license in the companyLicenses object
                for (const key in companyLicenses) {
                  if (
                    companyLicenses.hasOwnProperty(key) &&
                    companyLicenses[key] === foundLicense
                  ) {
                    companyLicenses[key] = foundLicense;
                    break;
                  }
                }
                // console.log('Licenses:', companyLicenses);
                await prisma.company.update({
                  where: { name: userCompanyBrut },
                  data: { licenses: companyLicenses },
                });

                // Update user wished widget to true
                switch (foundLicense.w) {
                  case 'Unismart':
                    await prisma.user.update({
                      where: { email: userEmail },
                      data: { stripeassistant: true },
                    });
                    break;
                  case 'Unimeet':
                    await prisma.user.update({
                      where: { email: userEmail },
                      data: { stripemeet: true },
                    });
                    break;
                  // case 'Unicollab':
                  //   await prisma.user.update({
                  //     where: { email: userEmail },
                  //     data: { stripecollab: true },
                  //   });
                  //   break;
                  case 'Unidmin':
                    await prisma.user.update({
                      where: { email: userEmail },
                      data: { role: 'admin' },
                    });
                    break;
                  default:
                    console.log('Invalid');
                    break;
                }

                res.status(200).json({
                  message:
                    'Licence to wished widget successfully actived with provided activation code',
                });
              }
            } else {
              // License not found, handle the case
              console.log('No license found');
            }
          } else {
            return res
              .status(206)
              .json('Used activation code is not dedicated to your company');
          }
        } else {
          return res
            .status(206)
            .json(
              'There is an issue with data relevance, please verify the activation code and/or reconnect to your account',
            );
        }
      } catch (err) {
        return res.status(500).json({ message: err });
      }

      return res.status(200).json();
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: err });
    }
  } else {
    res.status(405).json({ message: 'Only POST requests are allowed' });
    return;
  }
};
export default handler;
