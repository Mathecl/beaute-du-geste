import { Html, Head, Main, NextScript } from 'next/document';
import React from 'react';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link
          href="/icon-192x192.png"
          rel="icon192"
          sizes="192x192"
          type="image/png"
        />
        <link
          href="/icon-256x256.png"
          rel="icon256"
          sizes="256"
          type="image/png"
        />
        <link
          href="/icon-384x384.png"
          rel="logo384"
          sizes="384x384"
          type="image/png"
        />
        <link
          href="/icon-512x512.png"
          rel="logo512"
          sizes="512x512"
          type="image/png"
        />
        <link href="/manifest.json" rel="manifest" />
        <link href="/icon-512x512.png" rel="shortcut icon" />
        <link
          id="theme-css"
          href={`/themes/light-blue/theme.css`}
          rel="stylesheet"
        ></link>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
