import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface Post {
  title: string;
  description: string;
  author: string;
  date: string;
  content: string;
  type: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method == 'POST') {
    const postFromReq: string =
      typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    try {
      const postsDirectory = path.join(process.cwd(), '/data/uniblog/');

      const fileName = decodeURI(postFromReq) + '.json';
      const filePath = path.join(postsDirectory, fileName);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Post not found' });
      }

      const fileContents = fs.readFileSync(filePath, 'utf8');
      const postData: Post = JSON.parse(fileContents);

      res.status(200).send(postData);
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    res.status(405).send({ message: 'Only POST requests allowed' });
    return;
  }
}
