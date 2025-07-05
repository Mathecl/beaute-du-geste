'use client';
import React from 'react';
import { Suspense } from 'react';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import Masquot from '../public/masquotSad.png';

export default function NotFound() {
  const router = useRouter();

  return (
    <div style={{ padding: '1.75rem' }}>
      <div className="mx-auto flex max-w-screen-xl flex-col items-center justify-center px-4 py-8 lg:flex-row lg:px-6 lg:py-16">
        <div className="mb-8 lg:mb-0 lg:mr-8 lg:w-1/2">
          <div className="mx-auto max-w-screen-sm text-center">
            <h1 className="mb-4 text-7xl font-extrabold tracking-tight lg:text-9xl">
              404
            </h1>
            <p className="mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
              Page introuvable
            </p>
            <p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">
              La page que vous essayez de chercher est introuvable.
            </p>
            <br />
            <Link
              href="/"
              className="font-small leading-6 text-indigo-600 hover:text-indigo-500"
            >
              Retourner à la page d'accueil
            </Link>{' '}
            ou alors
            <button
              onClick={() => router.back()}
              className="font-small leading-6 text-indigo-600 hover:text-indigo-500"
            >
              &nbsp;ici pour revenir en arrière.
            </button>
          </div>
        </div>
        <div className="lg:w-1/2">
          <Suspense fallback={<p>Chargement de l'image...</p>}>
            <div className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last">
              <Image src={Masquot} alt="Masquot" />
            </div>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
