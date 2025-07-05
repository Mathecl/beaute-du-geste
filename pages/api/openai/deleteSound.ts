import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAuth } from '@/utils/auth/auth';

import fs from 'fs';
import path from 'path';

type Data = {
  success?: boolean;
  data?: string;
  error?: unknown;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const userBearerAuth = req.headers.authorization;
  const userJWT = userBearerAuth?.slice(7);

  const usageTokenDate: string =
    typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

  // verifyAuth()
  const verifiedToken =
    userJWT &&
    (await verifyAuth(userJWT).catch((err) => {
      console.log(err);
    }));

  const userCompanyFromJWT: string =
    verifiedToken?.userPrismaCompany.toLowerCase();
  // console.log('user company from req:' + userCompanyFromJWT);

  if (
    !userBearerAuth ||
    !userBearerAuth.startsWith('Bearer ') ||
    !verifiedToken
  ) {
    return res.status(401).json({ error: 'Unauthorized' });
  } else {
    try {
      const _outputPath = `/tmp/${userCompanyFromJWT}output${usageTokenDate}.mp3`;
      const filePath = path.resolve(_outputPath);
      const stat = await fs.promises.stat(filePath);

      res.setHeader('Content-Length', stat.size);
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable'); // caching settings

      const stream = fs.createReadStream(filePath);
      stream.pipe(res);

      // console.log('deleting mp3 file');
      // Add an event listener for the 'close' event
      stream.on('close', () => {
        // Delete the file after the stream has ended
        fs.promises
          .unlink(filePath)
          // .then(() => console.log('File deleted successfully'))
          .catch((deleteError) =>
            console.log('Error deleting file:', deleteError),
          );
      });
      // console.log('OK');
    } catch (error) {
      if (error) {
        console.log('Delete error:' + error);
      }
      res.status(400).json({
        success: false,
        error: error,
      });
    }
  }
}
