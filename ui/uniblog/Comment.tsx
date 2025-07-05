'use client';
import React from 'react';

const Comment = ({ content, name }: { content?: string; name?: string }) => {
  return (
    <article className="mb-4 rounded-lg bg-white p-5 text-base dark:bg-gray-900">
      <footer className="mb-2 flex items-center justify-between">
        <div className="flex items-center">
          <p className="mr-3 inline-flex items-center text-sm font-semibold text-gray-900 dark:text-white">
            {name}
          </p>
        </div>
      </footer>
      <p className="text-gray-500 dark:text-gray-400">{content}</p>
    </article>
  );
};

export default Comment;
