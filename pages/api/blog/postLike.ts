import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method == 'POST') {
    const reqData = req.body;
    if (!reqData) {
      return res
        .status(400)
        .send({ message: 'Bad request: request body is empty' });
    }
    const postFromReq = reqData.substring(0, reqData.indexOf(','));
    const participantFromReq = reqData.split(',')[1]?.trim() || '';

    try {
      const postsDirectory = path.join(process.cwd(), '/data/uniblog/');

      const fileName = decodeURI(postFromReq.replace(/\%20/g, ' ')) + '.json';
      const filePath = path.join(postsDirectory, fileName);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Post not found' });
      }

      // Read existing post data from file
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const postData = JSON.parse(fileContents);

      // Update post data with new like
      postData.Like.participants.push(participantFromReq);

      // Write updated post data back to file
      fs.writeFileSync(filePath, JSON.stringify(postData, null, 2), 'utf8');

      // Send updated post data in the response
      res.status(200).send(postData);
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    res.status(405).send({ message: 'Only POST requests allowed' });
    return;
  }
}
