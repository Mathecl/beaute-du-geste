'use client';

import React from 'react';
import { useState, useEffect } from 'react';

import { AppContext, appContext } from '@/types/appContext';
import { Skeleton } from 'primereact/skeleton';

import Post from '@/ui/uniblog/Post';

export default function Uniblog() {
  return (
    <div style={{ padding: '1.75rem' }}>
      <section>
        <div className="mx-auto max-w-screen-xl px-2 py-2 lg:px-4 lg:py-4">
          <div className="mx-auto mb-8 max-w-screen-sm text-center lg:mb-16">
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white lg:text-4xl">
              Unicash
            </h2>
          </div>
        </div>
      </section>
    </div>
  );
}
