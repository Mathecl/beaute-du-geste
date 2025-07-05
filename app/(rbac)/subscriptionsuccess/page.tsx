'use client';
import React from 'react';
import { Suspense } from 'react';

import Image from 'next/image';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { AppContext, appContext } from '@/types/appContext';

export default function SubscriptionSuccess() {
  // Notification
  const toast = useRef(null);

  const showInfo = () => {
    if (mounted) {
      toast.current.show({
        severity: 'info',
        summary: 'Information',
        detail:
          "Veuillez noter qu'il peut être nécessaire de se reconnecter pour définitivement apporter les modifications à votre compte",
        life: 10000,
      });
    }
  };

  // App Context
  const [mounted, setMounted] = useState(true);

  const updateCustomerSubscriptionUrl: string =
    appContext.appUrl + '/api/stripe/updateCustomerSubscription';
  const getJWTdataUrl: string = appContext.appUrl + '/api/auth/getJWTdata';

  // Router
  const router = useRouter();
  const params = useSearchParams();

  function wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  useEffect(() => {
    const fetchJWTData = async () => {
      try {
        const response = await fetch(getJWTdataUrl, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          method: 'GET',
        });
        const pid = params?.get('pid');
        const responseData = await response.json();
        const data = `${encodeURIComponent(pid)
          .replace(/\%2F/g, '/')
          .replace(/\%3D/g, '=')
          .replace(/\%20/g, '+')},${responseData.userPrismaEmail}`;
        await fetch(updateCustomerSubscriptionUrl, {
          body: data,
          headers: {
            // 'Content-Type': 'application/json',
            // authorization: `bearer ${session?.user?.accessToken}`,
            authorization: `Bearer ${responseData.jwt}`,
          },
          method: 'POST',
        });
        showInfo();
        wait(5000).then(() => {
          router.replace(appContext.appUrl + '/client');
        });
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
      </div>
    </div>
  );
}
