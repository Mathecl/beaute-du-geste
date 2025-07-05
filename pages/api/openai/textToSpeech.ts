import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAuth } from '@/utils/auth/auth';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_SECRET,
});

const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESSKEY!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

type Data = {
  success?: boolean;
  data?: string;
  error?: unknown;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (req.method == 'POST') {
    const dataFromReq: string =
      typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    if (!req.body) {
      return res
        .status(400)
        .send({ error: 'Bad request: request body is empty' });
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
      !verifiedToken ||
      !verifiedToken?.userPrismaSubscription ||
      !verifiedToken?.userPrismaStripeAssistant
    ) {
      return res.status(401).json({ error: 'Unauthorized' });
    } else {
      try {
        // const ttsTextFromReq = fs.readFileSync(path.resolve('./input.txt'), 'utf8');
        const userCompanyFromJWT: string =
          verifiedToken?.userPrismaCompany.toLowerCase();
        const ttsVoiceGenderFromReq: string = dataFromReq.substring(
          0,
          dataFromReq.indexOf('/'),
        );
        // console.log('voice gender from req:' + ttsVoiceGenderFromReq);

        const ttsTextFromReq: string = dataFromReq.split('/')[1]?.trim() || '';
        // console.log('text from req:' + ttsTextFromReq);

        const tokenUsageDate: string = dataFromReq.split('/')[2]?.trim() || '';

        const _outputPath = `/tmp/${userCompanyFromJWT}output${tokenUsageDate}.mp3`;

        // console.log('path:' + _outputPath);

        const _output = path.resolve(_outputPath);
        // Ensure the directory exists, if not, create it
        const outputDirectory = path.dirname(_output);
        if (!fs.existsSync(outputDirectory)) {
          try {
            fs.mkdirSync(outputDirectory, { recursive: true });
          } catch (e) {
            console.log('Failed creating directory to reach full path');
            console.error(e);
          }
        }

        // platform.openai.com/docs/guides/text-to-speech?lang=node
        // alloy, echo, fable, onyx, nova, and shimmer
        try {
          if (ttsVoiceGenderFromReq === 'men') {
            const mp3 = await openai.audio.speech.create({
              model: 'tts-1', // tts-1-hd
              voice: 'onyx',
              input: ttsTextFromReq,
            });

            if (fs.existsSync(_output)) {
              fs.unlinkSync(_output);
            }

            // console.log('write data to mp3');
            const buffer = Buffer.from(await mp3.arrayBuffer());
            await fs.promises.writeFile(_output, buffer);
            // console.log('OK');
          } else if (ttsVoiceGenderFromReq === 'women') {
            const mp3 = await openai.audio.speech.create({
              model: 'tts-1', // tts-1-hd
              voice: 'nova',
              input: ttsTextFromReq,
            });

            if (fs.existsSync(_output)) {
              fs.unlinkSync(_output);
            }

            // console.log('write data to mp3');
            const buffer = Buffer.from(await mp3.arrayBuffer());
            await fs.promises.writeFile(_output, buffer);
            // console.log('OK');
          }
        } catch (error) {
          console.log('OpenAI TTS failed.');
          console.error(error);
        }

        try {
          // create aws s3 signed url
          const putObjectCommand = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: `${userCompanyFromJWT}output.mp3`,
          });
          const url = await getSignedUrl(
            s3Client,
            putObjectCommand,
            { expiresIn: 60 }, // 60 seconds
          );
          // console.log(JSON.stringify(url));
          // read the previously created file
          const fileBuffer = fs.readFileSync(_output);
          // send file to aws s3 bucket
          const fetchUrl = await fetch(url, {
            method: 'PUT',
            headers: {
              'Content-Type': 'audio/mpeg',
            },
            body: fileBuffer,
          });
          if (!fetchUrl.ok) {
            console.log(JSON.stringify(fetchUrl.status));
            console.log('Failed to upload file to S3:', fetchUrl.statusText);
            throw new Error('S3 upload failed');
          } else {
            // console.log(JSON.stringify(fetchUrl));
          }
        } catch (e) {
          console.log('AWS S3 bucket failed');
          console.error(e);
        }

        res.status(200).json({
          success: true,
        });
      } catch (error) {
        if (error) {
          console.log('Translate error:' + error);
        }
        res.status(400).json({
          success: false,
          error: error,
        });
      }
    }
  } else {
    res.status(405).send({ error: 'Only POST requests are allowed' });
    return;
  }
}
