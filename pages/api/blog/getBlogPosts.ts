import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface Post {
  title: string;
  description: string;
  author: string;
  date: string;
  type: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method == 'GET') {
    try {
      const postsDirectory = path.join(process.cwd(), '/data/uniblog');
      const fileNames = fs.readdirSync(postsDirectory);

      const postsData: Post[] = fileNames.map((fileName) => {
        const filePath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const postData: Post = JSON.parse(fileContents);
        return postData;
      });

      res.status(200).send(postsData);
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    res.status(405).send({ message: 'Only GET requests allowed' });
    return;
  }
}
