'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Suspense } from 'react';

// import TopBar from './TopBar';
// import SideBar from './SideBar';

import { usePathname } from 'next/navigation';

import '@/styles/layout.css';
import '@/styles/accueil.css';

export default function Layout({ children }) {
  const [showNav, setShowNav] = useState(true);
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
          setShowNav(false);
          setIsMobile(true);
        } else {
          setShowNav(true);
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

  const pathname = usePathname();

  return (
    <>
      <section id="content">
        {/* <TopBar /> */}

        <main id="children">
          {pathname === '/' && isMobile != true && (
            <div className="video-container">
              <Suspense fallback={<p>Chargement de la video...</p>}>
                <video autoPlay muted loop playsInline>
                  <source src="/video/accueil.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </Suspense>
            </div>
          )}

          <div>{children}</div>
        </main>
      </section>
    </>
  );
}
