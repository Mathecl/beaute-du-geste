'use client';
import React, { useState, useEffect } from 'react';
import { Suspense } from 'react';

// import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { AppContext, appContext } from '@/types/appContext';
import { SkeletonCard } from '@/ui/SkeletonCard';

import SideBar from './SideBar';
import Logo from '/public/icon-192x192.png';

import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
// import { InputText } from 'primereact/inputtext';

let firstSegment: string | null = null;
let userRole: string = '';

export default function TopBar() {
  // App Context
  const getJWTdataUrl: string = appContext.appUrl + '/api/auth/getJWTdata';
  const getSignOutUser: string = appContext.appUrl + '/api/signOutUser';
  const getSignOutRedirectionurl: string =
    appContext.appUrl + "/unicash/thebrother's";

  const [showNav, setShowNav] = useState(true);
  const [firstUrlSegment, setFirstUrlSegment] = useState('');

  useEffect(() => {
    const pathSegments = window.location.pathname.split('/');
    const segment = pathSegments.length > 1 ? pathSegments[1] : '';
    setFirstUrlSegment(segment);
    if (segment === 'unicash') {
      setShowNav(false);
    } else {
      setShowNav(true);
    }
  }, []);

  // Get JWT data from user token
  const [userName, setUserName] = useState('');
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
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
        const data = await response.json();

        if (data.message !== 'jwt must be provided') {
          setUserName('Cher(e) ' + data.userPrismaName + ',');
          userRole = data.userPrismaRole;
          setIsUserSignedIn(true);
        } else {
          setIsUserSignedIn(false);

          userRole = '';
        }

        // set dataFetched to true after successful fetch (to avoid displaying temporary information that are not totally valid)
        // ie: user has paid subscription + corresponding feature but has the "Not authorized: ..." message due to fetchJWTData() not terminated
        setDataFetched(true);
      } catch (error) {
        console.error('Error fetching jwt data:', error);
      }
    };

    const path = window.location.pathname; // Get the path part of the URL
    const segments = path.split('/').filter((segment) => segment); // Split by '/' and filter out empty segments
    firstSegment = segments.length > 0 ? segments[0] : null; // Set the first segment or null if no segments

    fetchJWTData();
  }, []);

  // Sign out function
  async function signOut() {
    try {
      await fetch(getSignOutUser);
      if (userRole == 'consumer') {
        router.push(getSignOutRedirectionurl);
      } else {
        router.push('/');
      }
      window.location.reload();
    } catch (error) {
      console.error('Error signing out user:', error);
    }
  }

  // Topbar
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    // Check window width on mount and update state
    const handleResize = () => {
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
    };

    // Initial check
    handleResize();

    // Listen for window resize events
    window.addEventListener('resize', handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // SideBar
  const [visible, setVisible] = useState<boolean>(false);
  // Routes navigation
  const router = useRouter();
  // Go back, refresh
  const refresh = (e: any) => {
    window.location.reload();
  };

  const pushToHome = (e: any) => {
    // window.location.replace('/');
    router.push('/');
  };

  // PWA button, notification and analytics
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault(); // prevent mini-infobar from appearing on mobile
      setSupportsPWA(true); // set pwa support to true
      setPromptInstall(e); // stash the event so it can be triggered later
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('transitionend', handler);
  }, []);

  const downloadPwa = (e: any) => {
    e.preventDefault(); // prevent mini-infobar from appearing on mobile
    if (supportsPWA == true && promptInstall) {
      promptInstall.prompt(); // deferredPrompt.prompt();
    } else {
      window.open(
        '/',
        '_blank',
        'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=no, copyhistory=yes, width=1920, height=1080',
      );
    }
    setPromptInstall(null); // deferredPrompt = null;
  };

  return (
    <div>
      {showNav ? (
        <nav className="py-2">
          <div className="mx-auto max-w-7xl px-2 sm:px-5 lg:px-5">
            {(userRole === 'consumer' ||
              userRole === '' ||
              userRole === null) &&
            firstSegment === 'unicash' ? (
              <div>
                {/* Content for consumers */}
                <div className="relative flex h-16 items-center justify-between">
                  {/* Left */}
                  <div className="flex flex-shrink-0 items-center text-white">
                    <div>
                      <div className="card justify-content-center flex">
                        {/* <Sidebar
                          visible={visible}
                          position="left"
                          onHide={() => setVisible(false)}
                          className="md:w-18rem lg:w-18rem w-full"
                        >
                          <SideBar />
                        </Sidebar> */}
                        {/* <Button
                          icon="pi pi-bars"
                          onClick={() => setVisible(true)}
                          rounded
                          text
                          aria-label="Fermer le menu lateral"
                          tooltip="Menu lateral"
                          tooltipOptions={{
                            position: 'bottom',
                            mouseTrack: true,
                            mouseTrackTop: 15,
                          }}
                        /> */}
                        <Button
                          icon="pi pi-refresh"
                          onClick={refresh}
                          rounded
                          text
                          aria-label="Rafraichir"
                          tooltip="Rafraichir"
                          tooltipOptions={{
                            position: 'bottom',
                            mouseTrack: true,
                            mouseTrackTop: 15,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex items-center">
                    <div>
                      {dataFetched ? (
                        isUserSignedIn === true ? (
                          <div>
                            <Button
                              icon="pi pi-sign-out"
                              onClick={() => signOut()}
                              rounded
                              text
                              label="Se déconnecter"
                              aria-label="Se déconnecter"
                            />
                          </div>
                        ) : (
                          <div>
                            {firstSegment === 'unicash' ? (
                              <div>
                                <Button
                                  icon="pi pi-sign-in"
                                  onClick={() =>
                                    router.push(
                                      '/sign?company=The%20Brother%27s',
                                    )
                                  }
                                  rounded
                                  text
                                  aria-label="Se connecter"
                                  label="Se connecter"
                                />
                              </div>
                            ) : (
                              <div>
                                <Button
                                  icon="pi pi-sign-in"
                                  onClick={() => router.push('/sign')}
                                  rounded
                                  text
                                  aria-label="Se connecter"
                                  label="Se connecter"
                                />
                              </div>
                            )}
                          </div>
                        )
                      ) : (
                        <SkeletonCard />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {/* Content for other users */}
                <div className="relative flex h-16 items-center justify-between">
                  {/* Left */}
                  <div className="flex flex-shrink-0 items-center text-white">
                    <div>
                      <div className="card justify-content-center flex">
                        <Sidebar
                          visible={visible}
                          position="left"
                          onHide={() => setVisible(false)}
                          className="md:w-18rem lg:w-18rem w-full"
                        >
                          <SideBar />
                        </Sidebar>
                        <Button
                          icon="pi pi-bars"
                          onClick={() => setVisible(true)}
                          rounded
                          text
                          aria-label="Fermer le menu lateral"
                          tooltip="Menu lateral"
                          tooltipOptions={{
                            position: 'bottom',
                            mouseTrack: true,
                            mouseTrackTop: 15,
                          }}
                        />
                        <Button
                          icon="pi pi-angle-left"
                          onClick={() => router.back()}
                          rounded
                          text
                          aria-label="Reculer"
                          tooltip="Reculer"
                          tooltipOptions={{
                            position: 'bottom',
                            mouseTrack: true,
                            mouseTrackTop: 15,
                          }}
                        />
                        <Button
                          icon="pi pi-angle-right"
                          onClick={() => router.forward()}
                          rounded
                          text
                          aria-label="Avancer"
                          tooltip="Avancer"
                          tooltipOptions={{
                            position: 'bottom',
                            mouseTrack: true,
                            mouseTrackTop: 15,
                          }}
                        />
                        <Button
                          icon="pi pi-refresh"
                          onClick={refresh}
                          rounded
                          text
                          aria-label="Rafraichir"
                          tooltip="Rafraichir"
                          tooltipOptions={{
                            position: 'bottom',
                            mouseTrack: true,
                            mouseTrackTop: 15,
                          }}
                        />
                        {!isMobile && (
                          <Button
                            icon="pi pi-home"
                            onClick={pushToHome}
                            rounded
                            text
                            aria-label="Page d'accueil"
                            tooltip="Page d'accueil"
                            tooltipOptions={{
                              position: 'bottom',
                              mouseTrack: true,
                              mouseTrackTop: 15,
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Center */}
                  <div className="flex flex-1 items-center justify-center">
                    <div className="w-70 flex flex-shrink flex-grow-0 items-center rounded-full">
                      <div className="flex items-center justify-center">
                        <Suspense fallback={<p>Chargement de l'image...</p>}>
                          <Image
                            src={Logo}
                            height={100}
                            alt="Unigate"
                            className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
                            onClick={pushToHome}
                          />
                        </Suspense>
                        {!isMobile && (
                          <Button
                            icon="pi pi-external-link"
                            iconPos="right"
                            onClick={downloadPwa}
                            rounded
                            text
                            aria-label="Ouvrir le logiciel Windows ou Mac"
                            tooltip="Ouvrir le logiciel Windows ou Mac"
                            tooltipOptions={{
                              position: 'bottom',
                              mouseTrack: true,
                              mouseTrackTop: 15,
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex items-center">
                    <div>
                      {dataFetched ? (
                        isUserSignedIn === true ? (
                          <div>
                            <Button
                              icon="pi pi-user"
                              onClick={() => router.push('/profile')}
                              rounded
                              text
                              aria-label="Votre compte"
                              tooltip="Votre compte"
                              tooltipOptions={{
                                position: 'bottom',
                                mouseTrack: true,
                                mouseTrackTop: 15,
                              }}
                            />
                            <Button
                              icon="pi pi-sign-out"
                              onClick={() => signOut()}
                              rounded
                              text
                              label="Se déconnecter"
                              aria-label="Se déconnecter"
                            />
                          </div>
                        ) : (
                          <div>
                            {firstSegment === 'unicash' ? (
                              <div>
                                <Button
                                  icon="pi pi-sign-in"
                                  onClick={() =>
                                    router.push(
                                      '/sign?company=The%20Brother%27s',
                                    )
                                  }
                                  rounded
                                  text
                                  aria-label="Se connecter"
                                  label="Se connecter"
                                />
                              </div>
                            ) : (
                              <div>
                                <Button
                                  icon="pi pi-sign-in"
                                  onClick={() => router.push('/sign')}
                                  rounded
                                  text
                                  aria-label="Se connecter"
                                  label="Se connecter"
                                />
                              </div>
                            )}
                          </div>
                        )
                      ) : (
                        <SkeletonCard />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>
      ) : (
        <nav className="w-full">
          <div className="flex justify-end">
            <div>
              {dataFetched ? (
                isUserSignedIn === true ? (
                  <div>
                    <Button
                      icon="pi pi-sign-out"
                      onClick={() => signOut()}
                      rounded
                      text
                      aria-label="Se déconnecter"
                      label="Se déconnecter"
                    />
                  </div>
                ) : (
                  <div>
                    {firstSegment === 'unicash' ? (
                      <div>
                        <Button
                          icon="pi pi-sign-in"
                          onClick={() =>
                            router.push('/sign?company=The%20Brother%27s')
                          }
                          rounded
                          text
                          aria-label="Se connecter"
                          label="Se connecter"
                        />
                      </div>
                    ) : (
                      <div>
                        <Button
                          icon="pi pi-sign-in"
                          onClick={() => router.push('/sign')}
                          rounded
                          text
                          aria-label="Se connecter"
                          label="Se connecter"
                        />
                      </div>
                    )}
                  </div>
                )
              ) : (
                <SkeletonCard />
              )}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
