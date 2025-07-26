import React, { ReactNode } from 'react';
import type { Metadata } from 'next';
import { SpeedInsights } from '@vercel/speed-insights/next';

import { Advent_Pro } from "next/font/google"
import '@/styles/globals.css';
const adventPro = Advent_Pro({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-advent-pro",
  display: "swap",
})
import Provider from './Provider';
import Layout from '@/ui/layout/Layout';
// import FooterServices from '@/ui/layout/FooterServices';

interface IProps {
  children: ReactNode;
}

export const metadata: Metadata = {
  title: process.env.NEXT_APP_NAME,
  description:
    "Découvrez l'art du Kobido, un soin du visage d'exception",
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
    <html lang="fr" className={`${adventPro.variable}`}>
      <head>
        <title>{process.env.NEXT_APP_NAME}</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className="font-advent-pro">
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
      {/* <FooterServices /> */}
      {/* <ScrollTop /> */}
    </html>
  );
}
