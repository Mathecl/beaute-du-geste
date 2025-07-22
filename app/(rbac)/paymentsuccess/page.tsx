'use client';
import React from 'react';
import { Suspense } from 'react';

import Image from 'next/image';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { AppContext, appContext } from '@/types/appContext';

// import Masquot from '../../../public/masquotteHappy.png';

export default function PaymentSuccess() {
  // App Context
  const [mounted, setMounted] = useState(true);

  const postPaymentUnicashSuccessUrl: string =
    appContext.appUrl + '/api/unicash/postPaymentUnicashSuccess';
  const postPaymentUnicashGuestSuccessUrl: string =
    appContext.appUrl + '/api/unicash/postPaymentUnicashGuestSuccess';
  const getJWTdataUrl: string = appContext.appUrl + '/api/auth/getJWTdata';
  const getSignOutUser: string = appContext.appUrl + '/api/signOutUser';

  // Router
  const router = useRouter();
  const params = useSearchParams();

  function wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  async function signOut() {
    try {
      await fetch(getSignOutUser);
    } catch (error) {
      console.error('Error signing out user:', error);
    }
  }

  useEffect(() => {
    const fetchJWTData = async () => {
      try {
        console.log('Starting fetchJWTData'); // Add this log to see if function starts

        const response = await fetch(getJWTdataUrl, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          method: 'GET',
        });

        const responseData = await response.json();
        const pid = params?.get('pid');
        console.log('pid:', pid);

        if (!response.ok) {
          // throw new Error('Network response was not ok');
          console.log('Handling JsonWebTokenError'); // Log specific condition

          const data = `${pid}`;
          console.log('data:', data);
          const response = await fetch(postPaymentUnicashGuestSuccessUrl, {
            body: data,
            headers: {
              // 'Content-Type': 'application/json',
              // authorization: `bearer ${session?.user?.accessToken}`,
              // authorization: `Bearer ${responseData.jwt}`,
            },
            method: 'POST',
          });
          const jsonResponse = await response.json();
          const companyName = jsonResponse.comp;

          wait(1500).then(() => {
            router.replace(appContext.appUrl + '/unicash/' + companyName);
          });
        } else {
          console.log('Handling authenticated user'); // Log specific condition

          const data = `${pid},${responseData.userPrismaEmail}`;
          await fetch(postPaymentUnicashSuccessUrl, {
            body: data,
            headers: {
              // 'Content-Type': 'application/json',
              // authorization: `bearer ${session?.user?.accessToken}`,
              authorization: `Bearer ${responseData.jwt}`,
            },
            method: 'POST',
          });

          await signOut();
          wait(1500).then(() => {
            router.replace(
              appContext.appUrl + '/unicash/' + responseData.userPrismaCompany,
            );
          });
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchJWTData();

    return () => {
      setMounted(false);
    };
  }, []);

  return (
    <div style={{ padding: '1.75rem' }}>
      <div className="mx-auto flex max-w-screen-xl flex-col items-center justify-center px-4 py-8 lg:flex-row lg:px-6 lg:py-16">
        <div className="mb-8 lg:mb-0 lg:mr-8 lg:w-1/2">
          <div className="mx-auto max-w-screen-sm text-center">
            <h1 className="mb-4 text-7xl font-extrabold tracking-tight lg:text-9xl">
              Merci pour votre confiance !
            </h1>
            <p className="mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
              Vous allez automatiquement être automatiquement déconnecté(e) et
              redirigé(e) à l'écran d'accueil dans quelques secondes...
            </p>
            <br />
          </div>
        </div>
        <div className="lg:w-1/2">
          <Suspense fallback={<p>Chargement de l'image...</p>}>
            <div className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last">
              {/* <Image src={Masquot} alt="Masquot" /> */}
            </div>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
