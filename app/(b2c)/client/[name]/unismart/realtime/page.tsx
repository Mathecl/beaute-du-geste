'use client';
import React, { useEffect, useState, useRef } from 'react'; // Add this line
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import InterpreterPhone from '@/ui/unismart/InterpreterPhone/page.tsx';
import InterpreterPC from '@/ui/unismart/InterpreterPC/page.tsx';

import { AppContext, appContext } from '@/types/appContext';
import { SkeletonCard } from '@/ui/SkeletonCard';
import { Toast } from 'primereact/toast';

export default function Unismart() {
  // =======================
  // BASICS
  // =======================
  // App Context
  const getJWTdataUrl: string = appContext.appUrl + '/api/auth/getJWTdata';
  const getVerifyShareId: string =
    appContext.appUrl + '/api/auth/verifyShareId';

  // App router & navigation
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // App device
  const [isMobile, setIsMobile] = useState(false);

  // App notifications
  const toast = useRef(null);
  const showInfo = (message: string) => {
    toast.current.show({
      severity: 'info',
      summary: 'Info',
      detail: message,
    });
  };
  const showError = (message: string) => {
    toast.current.show({
      severity: 'error',
      summary: 'Erreur',
      detail: message,
    });
  };

  const showSuccess = (message: string) => {
    toast.current.show({
      severity: 'success',
      summary: 'Succès',
      detail: message,
    });
  };

  // ===================
  // USER INFOS FROM JWT
  // ===================
  const [userSubscription, setUserSubscription] = useState('');
  const [userCompany, setUserCompany] = useState('');
  const [hasUserStripeAssistant, setHasUserStripeAssistant] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);

  const [companyFromSid, setCompanyFromSid] = useState('');
  const [isSidCorrect, setIsSidCorrect] = useState(false);

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
        if (response.status == 206) {
          router.push('/access');
        }

        const data = await response.json();
        // console.log(data);
        setUserSubscription(data.userPrismaSubscription);
        setHasUserStripeAssistant(data.userPrismaStripeAssistant);
        setUserCompany(data.userPrismaCompany.toLowerCase());

        if (searchParams?.get('sid') !== '' || null || undefined) {
          const sid = JSON.stringify(searchParams?.get('sid')).replace(
            /"/g,
            '',
          );
          const dataToVerify: string = `${sid},${data.userPrismaCompany.toLowerCase()}`;
          const sidRes = await fetch(getVerifyShareId, {
            body: JSON.stringify(dataToVerify),
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              authorization: `Bearer ${data.jwt}`,
            },
            method: 'POST',
          });

          const sidData: string = await sidRes.json();

          if (sidRes.status == 200) {
            setCompanyFromSid(sidData.replace(/"/g, ''));
            setIsSidCorrect(true);
          }
        }

        // set dataFetched to true after successful fetch (to avoid displaying temporary information that are not totally valid)
        // ie: user has paid subscription + corresponding feature but has the "Not authorized: ..." message due to fetchJWTData() not terminated
        setDataFetched(true);
      } catch (error) {
        console.error('Error fetching jwt data:', error);
      }
    };

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
          console.log('mobile');
        } else {
          setIsMobile(false);
          console.log('pc');
        }
      }
    }

    fetchJWTData();
    getMicrophonePermission();
  }, []);

  // =================
  // AUDIO PERMISSIONS
  // =================
  const [permission, setPermission] = useState(false); // boolean value to indicate whether user permission has been given
  const [stream, setStream] = useState(null); // contains the MediaStream received from the getUserMedia method

  const getMicrophonePermission = async () => {
    if ('MediaRecorder' in window) {
      try {
        const streamData = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        setPermission(true);
        showInfo('Microphe autorisé à être utilisé');
        setStream(streamData);
      } catch (err) {
        showError(
          err.message +
            ": ne pas donner votre autorisation pour utiliser le microphone empêchera l'utilisation de l'assistant ingelligent",
        );
      }
    } else {
      showError('The MediaRecorder API is not supported in your browser.');
    }
  };

  // ==========
  // FORM STEPS
  // ==========

  return (
    <div style={{ padding: '1.75rem' }}>
      <Toast ref={toast} />
      {dataFetched ? (
        userSubscription === 'paid' && hasUserStripeAssistant ? (
          userCompany === params?.name ||
          (isSidCorrect == true && params?.name == companyFromSid) ? (
            <div className="w-full">
              {/* <h1 className="text-center text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Unismart
              </h1> */}
              {!isMobile ? <InterpreterPC /> : <InterpreterPhone />}
            </div>
          ) : (
            <div>
              <p className="font-small text-black-500 text-x2">
                Non autorisé(e)
              </p>{' '}
              <p className="font-small text-black-500 text-x2">
                Vérifiez que vous faîtes bien parti de l'entreprise{' '}
                {params?.name}. Veuillez contacter un administrateur si cette
                situation est anormale.
              </p>
            </div>
          )
        ) : (
          <div>
            <p className="font-small text-black-500 text-x2">Non autorisé(e)</p>{' '}
            <p className="font-small text-black-500 text-x2">
              Vous n'êtes pas reconnu comme client(e) ayant minimum un
              abonnement mensuel et/ou vous n'avez pas l'abonnement requis pour
              accéder à ce widget. Veuillez contacter un administrateur si cette
              situation est anormale, ou{' '}
              <Link
                href="/pricing"
                className="font-small leading-6 text-indigo-600 hover:text-indigo-500"
              >
                achetez l'abonnement souhaité ici.
              </Link>
            </p>
          </div>
        )
      ) : (
        <SkeletonCard />
      )}
    </div>
  );
}
