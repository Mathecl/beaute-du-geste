'use client';
import React, { useEffect, useState, useRef } from 'react'; // Add this line
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import InterpreterPhone from '@/ui/unismart/InterpreterPhone/page.tsx';
import SpeechToText from '@/ui/unismart/SpeechToText/page.tsx';
import InterpreterPC from '@/ui/unismart/InterpreterPC/page.tsx';

import gsap from 'gsap';

import { AppContext, appContext } from '@/types/appContext';
import { SkeletonCard } from '@/ui/SkeletonCard';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { SelectButton, SelectButtonChangeEvent } from 'primereact/selectbutton';

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
    fetchJWTData();
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
  const [step, setStep] = useState(1);
  const speechInterpreterOptions: string[] = ['Non', 'Oui'];
  const [speechInterpreter, setSpeechInterpreterChoice] = useState<string>(
    speechInterpreterOptions[0],
  );
  const smartToolsChoices: string[] = ['Non', 'Oui'];
  const [smartToolChoice, setSmartToolChoice] = useState<string>(
    smartToolsChoices[0],
  );

  useEffect(() => {
    if (step >= 1 && step < 5) {
      gsap.fromTo(
        '.form-init',
        { autoAlpha: 0, y: 60 },
        { autoAlpha: 1, y: 0, duration: 0.85 },
      );

      if (step > 1) {
        gsap.fromTo(
          '.form-step',
          { autoAlpha: 0, x: 60 },
          { autoAlpha: 1, x: 0, duration: 0.85 },
        );
      }
    }
  }, [step]);

  const handleNext = () => {
    if (smartToolChoice == 'Non' && speechInterpreter == 'Non' && step <= 2) {
      setStep(step + 1);
    } else if (
      smartToolChoice == 'Oui' &&
      speechInterpreter == 'Oui' &&
      step <= 3
    ) {
      setStep(step + 1);
    } else if (
      (smartToolChoice == 'Oui' || speechInterpreter == 'Oui') &&
      step <= 3
    ) {
      setStep(step + 1);
    }
  };
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="form-init text-center">
            <h2 className="mb-5 mt-6 text-4xl font-medium tracking-tight text-gray-800">
              Utilisez-vous actuellement un téléphone ?
            </h2>
            <SelectButton
              value={speechInterpreter}
              onChange={(e: SelectButtonChangeEvent) =>
                setSpeechInterpreterChoice(e.value)
              }
              options={speechInterpreterOptions}
              className="mb-5"
            />
          </div>
        );
      case 2:
        return (
          <div className="form-step text-center">
            <h2 className="mb-5 mt-6 text-4xl font-medium tracking-tight text-gray-800">
              Outils intelligents audio et textuel ?
            </h2>
            <SelectButton
              value={smartToolChoice}
              onChange={(e: SelectButtonChangeEvent) =>
                setSmartToolChoice(e.value)
              }
              options={smartToolsChoices}
              className="mb-5"
            />
          </div>
        );
      case 3:
        if (speechInterpreter === 'Oui') {
          return (
            <div className="form-step text-center">
              <h2 className="mt-6 text-4xl font-medium tracking-tight text-gray-800">
                Conversation vocale avec interprète
              </h2>
              <br />
              <InterpreterPC />
            </div>
          );
        } else if (speechInterpreter === 'Non') {
          return (
            <div className="mb-5 mt-6 text-center text-4xl font-medium tracking-tight text-gray-800">
              <h2 className="mb-5 mt-2 text-4xl font-medium tracking-tight text-gray-800">
                Enregistreur et retranscription audio
              </h2>
              <div className="flex items-center justify-center text-center">
                {!permission ? (
                  <Button
                    onClick={getMicrophonePermission}
                    label="Modifier les permissions d'accès au microphone"
                    outlined
                    // raised
                  />
                ) : (
                  <InterpreterPhone />
                )}
              </div>
            </div>
          );
        }
      case 4:
        if (smartToolChoice === 'Oui') {
          return (
            <div className="form-step">
              {/* <h2 className="mb-5 text-4xl font-medium tracking-tight text-gray-800">
                Traduction audio ou textuelle
              </h2> */}
              <SpeechToText />
            </div>
          );
        } else {
          return (
            <div className="form-step">
              <h2 className="text-4xl font-medium tracking-tight text-gray-800">
                Pour utiliser l'assistant de travail intelligent, veuillez
                choisir à minima une fonctionnalité
              </h2>
            </div>
          );
        }
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '1.75rem' }}>
      <Toast ref={toast} />
      {dataFetched ? (
        userSubscription === 'paid' && hasUserStripeAssistant ? (
          userCompany === params?.name ||
          (isSidCorrect == true && params?.name == companyFromSid) ? (
            <div className="mt-60 flex min-h-screen flex-col items-center">
              <div className="space-y-6 rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800 md:w-3/6 lg:w-1/2">
                <h1 className="text-center text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  Unismart
                </h1>
                <main>
                  {renderStep()}
                  <div className="form-step justify-center text-center">
                    <Button
                      label="Next"
                      icon="pi pi-arrow-right"
                      iconPos="right"
                      outlined
                      onClick={handleNext}
                      className="mt-4"
                    />
                    {/* <p className="mt-3 font-medium">Step {step}</p> */}
                  </div>
                </main>
              </div>
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
