'use client';

import React from 'react';

const PDFViewer = () => {
  return (
    <div>
      <iframe src="/CGU.pdf" width="100%" height="800px" />
    </div>
  );
};

const Cgu = () => {
  return (
    <div style={{ padding: '1.75rem' }}>
      <h1 className="text-xl font-bold">
        Conditions générales d'utilisations et politique de confidentialité
      </h1>
      <br />
      <br />
      <PDFViewer />
    </div>
  );
};

export default Cgu;
