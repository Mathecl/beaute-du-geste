'use client';
import React from 'react';
import Link from 'next/link';

const Verification = () => {
  return (
    <div style={{ padding: '1.75rem' }}>
      <h1 className="text-xl font-bold">Non autorisé(e)</h1>
      <br />
      <p className="font-small text-black-500 text-x2">
        Soit vous ne faites soit pas parti de la beta privée, soit votre e-mail
        n'est pas vérifiée. Veuillez s'il vous plaît contactez un administrateur
        pour avoir les permissions nécessaires et consulter cette page.
      </p>
    </div>
  );
};

export default Verification;
