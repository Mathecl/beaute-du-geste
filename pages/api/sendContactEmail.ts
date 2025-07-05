import nodemailer from 'nodemailer';
import prisma from '@/utils/prisma';
import * as CryptoJS from 'crypto-js';

// Generate key
async function generateKey(keyLength: number) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < keyLength) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}
// Randomize letters of a string
function shuffleString(str) {
  // Convert the string to an array of characters
  const chars = str.split('');

  // Shuffle the array using Fisher-Yates algorithm
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  // Join the characters back into a string
  return chars.join('');
}

const handler = async (req, res) => {
  if (req.method === 'POST') {
    const reqData = req.body;
    if (!reqData) {
      return res
        .status(400)
        .send({ message: 'Bad request: request body is empty' });
    }

    try {
      const emailSrc = process.env.EMAIL;
      const pwdSrc = process.env.EMAIL_PASS;
      const emailDst = [process.env.EMAIL_ADMINS];
      // let nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        // port: 465,
        // host: 'smtp.gmail.com',
        // auth: {
        //   user: 'demo email',
        //   pass: process.env.password,
        // },
        // secure: true,
        service: 'gmail',
        auth: {
          user: emailSrc,
          pass: pwdSrc,
        },
      });

      try {
        let mailOptions;
        if (reqData.emailType.name == 'Licence') {
          const company = await prisma.company.findFirst({
            where: {
              name: reqData.company,
            },
          });

          // Creating new activation code and add it to a license
          const generatedKey = await generateKey(16);
          const acUnencrypted = `${reqData?.company}${reqData.licensesAmount}${generatedKey}`;
          const acRandomized = shuffleString(acUnencrypted);
          // Encrypt acRandomized: <iv>:<encrypted sid>
          const secretKey = process.env.CRYPTO_SECRET_KEY;
          const key = CryptoJS.enc.Utf8.parse(secretKey);
          let acValue = CryptoJS.AES.encrypt(acRandomized, key, {
            iv: key,
          }).toString();

          let companyLicenses = company?.licenses;
          if (company?.name.toLowerCase() !== reqData.company.toLowerCase()) {
            const initLicenses = {
              // license 1
              l1: {
                ac: acValue, // activation code
                ca: '0', // current activations
                ma: reqData.licensesAmount, // maximum activations
                w: reqData.widget.name, // widget
                a: 'false', // approval so license can be used
              },
            };

            await prisma.company.create({
              data: { name: reqData.company, licenses: initLicenses },
            });
          } else {
            // Find the last license key and increment it
            const lastLicenseKey = Object.keys(companyLicenses).pop();
            const nextLicenseKey =
              'l' + (parseInt(lastLicenseKey.substring(1)) + 1);

            // Adding new license to already existing ones
            companyLicenses[nextLicenseKey] = {
              ac: acValue, // activation code
              ca: '0', // current activations
              ma: reqData.licensesAmount, // maximum activations
              w: reqData.widget.name, // widget
              a: 'false', // approval so license can be used
            };

            await prisma.company.update({
              where: { name: reqData.company },
              data: { licenses: companyLicenses },
            });
          }

          mailOptions = {
            from: emailSrc,
            to: emailDst,
            subject: `Formulaire de contact Unigate: ${reqData.emailSubject}`,
            html: `<h2>Formulaire de contact Unigate</h2><br/><b><u>Informations sur la demande</u></b><ul><li>Prénom, nom: ${reqData.firstName} ${reqData.lastName}</li><li>Email: ${reqData.email}</li><li>Entreprise: ${reqData.company}</li><li>Type de demande: ${reqData.emailType.name}</li><li>${reqData.licensesAmount} licences demandées pour le widget ${reqData.widget.name}</li></ul><br/><b><u>Informations à transmettre au demandeur:</u></b><ul><li>Code d'activation généré: ${acRandomized}</li><li>Valable pour: ${reqData.licensesAmount} activations</li><li>Donne accès au widget: ${reqData.widget.name}</li></ul><br/><b><u>Contenu de la demande</u></b><p>${reqData.emailBody}</p>`,
          };
        } else if (reqData.emailType.name == 'Role') {
          mailOptions = {
            from: emailSrc,
            to: emailDst,
            subject: `Formulaire de contact Unigate: ${reqData.emailSubject}`,
            html: `<h2>Formulaire de contact Unigate</h2><br/><b><u>Informations sur la demande</u></b><ul><li>Prénom, nom: ${reqData.firstName} ${reqData.lastName}</li><li>Email: ${reqData.email}</li><li>Entreprise: ${reqData.company}</li><li>Type de demande: ${reqData.emailType.name}</li><li>Rôle demandé: ${reqData.role.name}</li></ul><br/><b><u>Contenu de la demande</u></b><p>${reqData.emailBody}</p>`,
          };
        } else {
          mailOptions = {
            from: emailSrc,
            to: emailDst,
            subject: `Formulaire de contact Unigate: ${reqData.emailSubject}`,
            html: `<h2>Formulaire de contact Unigate</h2><br/><b><u>Informations</u></b><ul><li>Prénom, nom: ${reqData.firstName} ${reqData.lastName}</li><li>Email: ${reqData.email}</li><li>Entreprise: ${reqData.company}</li><li>Type de demande: ${reqData.emailType.name}</li></ul><br/><b><u>Contenu de la demande</u></b><p>${reqData.emailBody}</p>`,
          };
        }
        await transporter.sendMail({
          ...mailOptions,
          // subject: `Formulaire de contact: ${reqData.emailBody}`,
          // html: `<h2>Formulaire de contact Unigate</h2><br/><ul><li>Prénom, nom: ${reqData.firstName} ${reqData.lastName}</li><li>Email: ${reqData.email}</li><li>Entreprise: ${reqData.company}</li><li>Type de demande: ${reqData.emailType.name}</li></ul><br/><p>${reqData.emailBody}</p>`,
        });
        // transporter.sendMail(mailData, function (err, info) {
        //   if (err) console.log('error:' + err);
        //   else console.log('info:' + info);
        // });
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
