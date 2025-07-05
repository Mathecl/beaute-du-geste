'use client';

import React from 'react';
// import { Metadata } from 'next';
import Link from 'next/link';

// Metadata is usable only in server components
// export const metadata: Metadata = {
//   title: 'Access',
//   description: 'Sign in to your account to gain access',
// };

const Access = () => {
  return (
    <div style={{ padding: '1.75rem' }}>
      <h1 className="text-xl font-bold">Non autorisé(e)</h1>
      <br />
      <p className="font-small text-black-500 text-x2">
        Vous n'êtes pas autorisé(e) à accéder à la ressource demandée. <br />
        <Link
          href="/sign"
          className="font-small leading-6 text-indigo-600 hover:text-indigo-500"
        >
          Veuillez s'il vous plaît vous connecter à votre compte
        </Link>
        , ou réessayer demain si vous avez dépassé votre quota d'utilisation
      </p>
    </div>
  );
};

export default Access;
