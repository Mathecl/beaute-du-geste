'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Suspense } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

// import { Button } from 'primereact/button';

import Masquot from '../public/masquotHello.png';

export default function Home() {
  // ========
  // FRONTEND
  // ========
  // Text color based on device
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    // Check if the window object is available (i.e., we are in a browser environment)
    if (typeof window !== 'undefined') {
      // Access the user-agent string from the window.navigator object
      const userAgent = window.navigator.userAgent;
      // console.log('user agent:', JSON.stringify(userAgent));

      // Define regular expressions to match common mobile device types
      const mobileRegex =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

      // Use the test method to check if the user-agent string matches any of the mobile device patterns
      if (typeof window != undefined) {
        if (mobileRegex.test(userAgent)) {
          setIsMobile(true);
        } else {
          setIsMobile(false);
        }
      }
    }

    // const innerWidth = window.innerWidth;
    // if (typeof window != undefined) {
    //   if (innerWidth <= 640) {
    //     setIsMobile(true);
    //   } else {
    //     setIsMobile(false);
    //   }
    // }
  }, []);

  // Buttons
  const solutionsRef = useRef(null);
  const scrollToSolutions = () => {
    solutionsRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  // Router
  const router = useRouter();
  function openSignUp() {
    router.push('/sign');
  }

  // ======
  // PWA SW
  // ======
  let sw: ServiceWorkerContainer | undefined;

  if (typeof window !== 'undefined') {
    sw = window?.navigator?.serviceWorker;
  }

  useEffect(() => {
    if (sw) {
      sw.register('/service-worker.js', { scope: '/' })
        .then((registration) => {
          console.log(
            'Service Worker registration successful with scope: ',
            registration.scope,
          );
        })
        .catch((err) => {
          console.log('Service Worker registration failed: ', err);
        });
    }
  }, [sw]);

  return (
    <div>
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
        <main className="flex-1">
          <section className="relative w-full py-4 md:py-8 lg:py-12 xl:py-24 2xl:py-32">
            <div className="container px-2 md:px-4 lg:px-6 xl:px-8 2xl:px-10">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-1 md:gap-4 lg:grid-cols-2 lg:gap-6 xl:grid-cols-2 xl:gap-8 2xl:grid-cols-2 2xl:gap-12">
                <div className="flex flex-col justify-center space-y-2 md:space-y-3 lg:space-y-4 xl:space-y-5 2xl:space-y-6">
                  <div className="h-full w-full space-y-1 rounded rounded-md border border-gray-800 bg-[#79018c] bg-opacity-20 bg-clip-padding p-5 shadow-md backdrop-blur-sm backdrop-filter md:space-y-2 lg:space-y-3 xl:space-y-4 2xl:space-y-5">
                    <h1
                      className={`${
                        isMobile ? 'text-dark' : 'text-white'
                      } text-xl font-bold tracking-tighter md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl`}
                    >
                      <span style={{ color: '#00fc71' }}>Unigate</span>, c'est
                      l'avenir de la gestion
                      <br />
                      d'entreprise à portée de clic.
                    </h1>
                    <br />
                    <button onClick={openSignUp}>S'inscrire</button>
                    <button onClick={scrollToSolutions}>En savoir plus</button>
                  </div>
                </div>
                <div className="flex flex-col justify-between">
                  <div className="relative aspect-[16/9]">
                    <Suspense fallback={<p>Chargement de la video...</p>}>
                      <video
                        src="/video/accueilAnimation.mp4"
                        className="absolute inset-0 h-full w-full object-cover"
                        loop
                        autoPlay
                        muted
                      />
                    </Suspense>
                  </div>
                  <br />
                  {/* <div className="space-y-1 md:space-y-2 lg:space-y-3 xl:space-y-4 2xl:space-y-5">
                    <h2
                      className={`${
                        isMobile ? 'text-dark' : 'text-white'
                      } text-lg font-bold tracking-tighter md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl`}
                    >
                      Notre engagement repose sur la{' '}
                      <span style={{ color: '#00fc71' }}>transparence</span>, la{' '}
                      <br />
                      <span style={{ color: '#00fc71' }}>
                        responsabilité
                      </span>{' '}
                      et la <span style={{ color: '#00fc71' }}>générosité</span>
                      .
                    </h2>
                    <p
                      className={`${
                        isMobile ? 'text-dark' : 'text-white'
                      } max-w-[600px] md:text-lg lg:text-xl 2xl:text-3xl/relaxed`}
                    >
                      Unigate s'engage à être un modèle de changement social
                      positif, en utilisant la technologie pour améliorer les
                      entreprises et la société dans son ensemble. Nous croyons
                      en un avenir où le succès économique va de pair avec la
                      responsabilité sociale, et nous sommes déterminés à
                      incarner cette vision.
                    </p>
                  </div> */}
                </div>
              </div>
            </div>
          </section>

          {/* ---- */}

          <section className="bg-white dark:bg-gray-900">
            <div className="mx-auto max-w-screen-xl px-4 py-8 sm:py-16 lg:px-6">
              <div className="mx-auto max-w-screen-sm text-center">
                <h2 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-gray-900">
                  Commençons à collaborer ensemble
                </h2>
                <p className="mb-6 font-light text-gray-500 dark:text-gray-400 md:text-lg">
                  Essayez gratuitement Unigate
                </p>
                <button onClick={openSignUp}>Commencer</button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
