import React, { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { SpeedInsights } from '@vercel/speed-insights/next';

import '@/styles/globals.css';
import { Tenor_Sans } from 'next/font/google';
const tenorSans = Tenor_Sans({
  weight: '400',
  subsets: ['latin'],
});

import Provider from './Provider';
import Layout from '@/ui/layout/Layout';
import FooterServices from '@/ui/layout/FooterServices';
import UnigateLogo from '../public/masquotHello.png';

interface IProps {
  children: ReactNode;
}

export const metadata: Metadata = {
  title: process.env.NEXT_APP_NAME,
  description:
    'Beauté du Geste vous invite à découvrir lart du Kobido, un soin du visage dexception qui allie tradition japonaise et gestes intuitifs pour sublimer votre peau et apaiser votre esprit',
  themeColor: '#ffffff',
  manifest: '/manifest.json',
  category: 'technology',
  viewport: {
    width: 'device-width',
    // initialScale: 1,
    // maximumScale: 1,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: process.env.NEXT_APP_NAME,
  },
  verification: {
    google: 'google',
    yandex: 'yandex',
    yahoo: 'yahoo',
    other: {
      me: ['my-email', 'my-link'],
    },
  },
  robots: {
    index: false,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icon-512x512.png',
    shortcut: '/icon-512x512.png',
    apple: '/icon-512x512.png',
    other: {
      rel: process.env.NEXT_APP_NAME,
      url: '/icon-512x512.png',
    },
  },
};

export default function RootLayout({ children }: IProps) {
  return (
    <html lang="en">
      <head>
        <title>{process.env.NEXT_APP_NAME}</title>
      </head>
      <body className={tenorSans.className}>
        <Provider>
          <div className="overflow-y-scroll">
            <Layout>
              <div>
                {/* Children = page.tsx, etc. */}
                {children}
              </div>
              <SpeedInsights />
            </Layout>
          </div>
        </Provider>
      </body>
      <FooterServices />
      {/* <ScrollTop /> */}
    </html>
  );
}
