'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';

const Post = ({
  title,
  description,
  author,
  date,
  type,
  likeAmnt,
}: {
  title?: string;
  description?: string;
  author?: string;
  date?: string;
  type?: string;
  likeAmnt?: number;
}) => {
  const readUrl = '/uniblog/' + title;
  const router = useRouter();

  return (
    <article className="mb-4 rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
      {type == 'Article' ? (
        <div className="mb-5 flex items-center justify-between text-gray-500">
          <Tag severity="success" value={type}></Tag>
          <span className="text-sm">
            {date}- {likeAmnt} personnes ont aimé
          </span>
        </div>
      ) : (
        <div className="mb-5 flex items-center justify-between text-gray-500">
          <Tag severity="info" value={type}></Tag>
          <span className="text-sm">
            {date}- {likeAmnt} personnes ont aimé
          </span>
        </div>
      )}

      <h2 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        <Link
          href={readUrl}
          className="self-center whitespace-nowrap text-2xl font-semibold"
        >
          {title}
        </Link>
      </h2>
      <p
        className="mb-5 font-light text-gray-500 dark:text-gray-400"
        dangerouslySetInnerHTML={{ __html: description }}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* <img
            className="h-7 w-7 rounded-full"
            src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/bonnie-green.png"
            alt="Bonnie Green avatar"
          /> */}
          <span>{author}</span>
        </div>
        <Button
          icon="pi pi-arrow-right"
          iconPos="right"
          onClick={() => router.push(readUrl)}
          rounded
          text
          label="Lire"
        />
      </div>
    </article>
  );
};

export default Post;
