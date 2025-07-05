'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';

import {
  selectIsConnectedToRoom,
  useHMSActions,
  useHMSStore,
} from '@100mslive/react-sdk';

import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';

import { AppContext, appContext } from '@/types/appContext';
import { SkeletonCard } from '@/ui/SkeletonCard';

interface FormData {
  languageMeet?: string;
  privateMeet: boolean;
  startMeet?: Date;
  endMeet?: Date;
}
interface Country {
  value: string;
  label: string;
  code: string;
}

export default function Meet() {
  // APP CONTEXT
  // ===========
  // App notification
  const toast = useRef(null);
  const showInfo = (summary: string, detail: string, duration: number) => {
    toast.current.show({
      severity: 'info',
      summary: summary,
      detail: detail,
      life: duration,
    });
  };
  const showSuccess = (summary: string, detail: string, duration: number) => {
    toast.current.show({
      severity: 'success',
      summary: summary,
      detail: detail,
      life: duration,
    });
  };
  const showError = (
    summary: string,
    detail: string | unknown,
    duration: number,
  ) => {
    toast.current.show({
      severity: 'error',
      summary: summary,
      detail: detail,
      life: duration,
    });
  };

  // App user JWT infos
  const [userJwt, setUserJwt] = useState('');

  const [userCompany, setUserCompany] = useState('');
  const [userSubscription, setUserSubscription] = useState('');
  const [hasUserStripeMeet, setHasUserStripeMeet] = useState(false);

  const [companyFromSid, setCompanyFromSid] = useState('');
  const [isSidCorrect, setIsSidCorrect] = useState(false);

  const [dataFetched, setDataFetched] = useState(false);

  // App backend urls
  const getJWTdataUrl: string = appContext.appUrl + '/api/auth/getJWTdata';
  const createMeetIdUrl: string = appContext.appUrl + '/api/meet/createMeetId';
  const getVerifyShareId: string =
    appContext.appUrl + '/api/auth/verifyShareId';

  // App router & navigation
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // App jwt
  const [mounted, setMounted] = useState(true);
  useEffect(() => {
    try {
      // Fetch JWT Data + Admin DataTable
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
          setUserSubscription(data.userPrismaSubscription);
          setUserCompany(data.userPrismaCompany.toLowerCase());
          setHasUserStripeMeet(data.userPrismaStripeMeet);
          setUserJwt(data.jwt);

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

          setDataFetched(true);
        } catch (error) {
          console.log('Error fetching jwt data:', error);
        }
      };
      fetchJWTData();
    } catch (error) {
      console.error('Error:', error);
    }
    return () => {
      setMounted(false);
    };
  }, []);

  // JOIN MEET
  // =========
  const hmsActions = useHMSActions();
  const [inputValues, setInputValues] = useState({
    name: '',
    token: '',
  });

  const [isButtonJoinLoading, setIsButtonJoinLoading] =
    useState<boolean>(false);

  const handleInputChange = (e) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [e.target.name]: e.target.value,
    }));
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    setIsButtonJoinLoading(true);

    const { userName = '', roomCode = '' } = inputValues;

    const authToken = await hmsActions.getAuthTokenByRoomCode({ roomCode });

    try {
      await hmsActions.join({ userName, authToken });
      // router.push('/client/' + userCompany + '/unimeet/' + roomCode);
      window.open(
        `https://unimeet.app.100ms.live/meeting/${roomCode}`,
        '_blank',
      );
      setIsButtonJoinLoading(false);
    } catch (e) {
      console.error(e);
    }
  };

  // CREATE MEET
  // ===========
  // Data
  // Country, language
  const countries: Country[] = [
    { value: 'english', label: 'Anglais', code: 'en-US' },
    { value: 'afrikaans', label: 'Africain', code: 'af-ZA' },
    { value: 'arabic', label: 'Arabe', code: 'ar-SA' },
    { value: 'armenian', label: 'Arménien', code: 'hy-AM' },
    { value: 'azerbaijani', label: 'Azéri', code: 'az-AZ' },
    { value: 'Belarusian', label: 'Biélorusse', code: 'be-BY' },
    { value: 'Bosnian', label: 'Bosniaque', code: 'bs-BA' },
    { value: 'Bulgarian', label: 'Bulgare', code: 'bg-BG' },
    { value: 'catalan', label: 'Catalan', code: 'ca-ES' },
    { value: 'Chinese', label: 'Chinois', code: 'zh-CN' },
    { value: 'Croatian', label: 'Croate', code: 'hr-HR' },
    { value: 'czech', label: 'Tchèque', code: 'cs-CZ' },
    { value: 'danish', label: 'Danois', code: 'da-DK' },
    { value: 'dutch', label: 'Néerlandais', code: 'nl-NL' },
    { value: 'estonian', label: 'Estonien', code: 'et-EE' },
    { value: 'finish', label: 'Finnois', code: 'fi-FI' },
    { value: 'french', label: 'Français', code: 'fr-FR' },
    { value: 'galician', label: 'Galicien', code: 'gl-ES' },
    { value: 'german', label: 'Allemand', code: 'de-DE' },
    { value: 'greek', label: 'Grec', code: 'el-GR' },
    { value: 'hebrew', label: 'Hébreu', code: 'he-IL' },
    { value: 'hindi', label: 'Hindi', code: 'hi-IN' },
    { value: 'hungarian', label: 'Hongrois', code: 'hu-HU' },
    { value: 'icelandic', label: 'Islandais', code: 'is-IS' },
    { value: 'indonesian', label: 'Indonésien', code: 'id-ID' },
    { value: 'italian', label: 'Italien', code: 'it-IT' },
    { value: 'japanase', label: 'Japonais', code: 'ja-JP' },
    { value: 'kannada', label: 'Kannada', code: 'kn-IN' },
    { value: 'kazakh', label: 'Kazakh', code: 'kk-KZ' },
    { value: 'korean', label: 'Coréen', code: 'ko-KR' },
    { value: 'latvian', label: 'Letton', code: 'lv-LV' },
    { value: 'lithuanian', label: 'Lituanien', code: 'lt-LT' },
    { value: 'macedonian', label: 'Macédonien', code: 'mk-MK' },
    { value: 'malay', label: 'Malais', code: 'ms-MY' },
    { value: 'marathi', label: 'Marathi', code: 'mr-IN' },
    { value: 'maori', label: 'Maori', code: 'mi-NZ' },
    { value: 'nepali', label: 'Népalais', code: 'ne-NP' },
    { value: 'norwegian', label: 'Norvégien', code: 'no-NO' },
    { value: 'persian', label: 'Persan', code: 'fa-IR' },
    { value: 'polish', label: 'Polonais', code: 'pl-PL' },
    { value: 'portuguese', label: 'Portugais', code: 'pt-PT' },
    { value: 'romanian', label: 'Roumain', code: 'ro-RO' },
    { value: 'russian', label: 'Russe', code: 'ru-RU' },
    { value: 'serbian', label: 'Serbe', code: 'sr-RS' },
    { value: 'slovak', label: 'Slovaque', code: 'sk-SK' },
    { value: 'slovenian', label: 'Slovène', code: 'sl-SI' },
    { value: 'spanish', label: 'Espagnol', code: 'es-ES' },
    { value: 'swahili', label: 'Swahili', code: 'sw-KE' },
    { value: 'swedish', label: 'Suédois', code: 'sv-SE' },
    { value: 'tagalog', label: 'Tagalog', code: 'tl-PH' },
    { value: 'tamil', label: 'Tamoul', code: 'ta-IN' },
    { value: 'thai', label: 'Thaï', code: 'th-TH' },
    { value: 'ukrainian', label: 'Ukrainien', code: 'uk-UA' },
    { value: 'urdu', label: 'Ourdou', code: 'ur-PK' },
    { value: 'vietnamese', label: 'Vietnamien', code: 'vi-VN' },
    { value: 'welsh', label: 'Gallois', code: 'cy-GB' },
  ];
  const countryTemplate = (option: Country, props) => {
    if (option) {
      return (
        <div className="align-items-center flex">
          <div>{option.label}</div>
        </div>
      );
    }
    return <span>{props.placeholder}</span>;
  };
  const countryOptionTemplate = (option: Country) => {
    return (
      <div className="align-items-center flex">
        <div>{option.label}</div>
      </div>
    );
  };

  // Typesafe form
  const [meetCreationForm, setMeetCreationForm] = useState<FormData>({
    privateMeet: false,
  });
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);

  const handleCreateSubmit = async (data: FormData) => {
    try {
      setIsButtonLoading(true);
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
      await sleep(1000);
      if (
        meetCreationForm.privateMeet == true ||
        meetCreationForm.privateMeet == false
      ) {
        await sleep(1000);
        await handleCreateMeetUrl(data);
        await sleep(2000);
        setIsButtonLoading(false);
      } else {
        showError(
          'Erreur',
          'Vérifiez que tous les champs soient bien remplis',
          10000,
        );
      }
    } catch (error) {
      return error;
    }
  };
  async function handleCreateMeetUrl(data: FormData) {
    // data:FormData
    // Create meet URL

    // console.log('frontend:', JSON.stringify(data));
    // console.log('frontend: startmeet: ', data.startMeet);
    // console.log('frontend: endmeet: ', data.endMeet);

    try {
      // console.log('is checked ?:', data.privateMeet);
      const response = await fetch(createMeetIdUrl, {
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          authorization: `Bearer ${userJwt}`,
        },
        method: 'POST',
      });

      if (response.status == 206) {
        showError('Erreur', response, 10000);
      } else {
        const responseData = await response.json();

        // console.log('response:', responseData);
        // console.log('stringified response:', JSON.stringify(responseData));

        // Open created meet URL
        //  appContext.appUrl +
        //   '/client/' +
        //   userCompany +
        //   '/unimeet/' +
        //   responseData,
        window.open(
          `https://unimeet.app.100ms.live/meeting/${responseData}`,
          '_blank',
        );
      }
    } catch (error) {
      console.log('Error fetching jwt data:', error);
    }
  }

  // MANAGE MEET
  // =========
  // Automatically leave the meet if user is connected and closing the browser tab
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  useEffect(() => {
    window.onunload = () => {
      if (isConnected) {
        hmsActions.leave();
      }
    };
  }, [hmsActions, isConnected]);

  return (
    <div style={{ padding: '1.75rem' }}>
      <Toast ref={toast} />

      {dataFetched ? (
        userSubscription === 'paid' && hasUserStripeMeet ? (
          userCompany === params?.name ||
          (isSidCorrect == true && params?.name == companyFromSid) ? (
            <div>
              <section>
                <div className="mx-auto max-w-screen-xl items-center gap-16 px-4 py-8 lg:grid lg:grid-cols-2 lg:px-6 lg:py-16">
                  <div className="font-light text-gray-500 dark:text-gray-400 sm:text-lg">
                    <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                      Réunion
                    </h2>
                    <p className="mb-4">
                      Outil de réunion proposant de multiples fonctionnalités
                      ayant pour but le partage de flux vidéo, audio, textuel,
                      écran et sondages
                    </p>
                    <p>
                      Créez votre première réunion ou rejoignez-en une en 1
                      minute dès maintenant en suivant les formulaires ci-après
                    </p>
                  </div>
                  <div className="mx-auto max-w-screen-xl items-center gap-16 px-4 py-8 lg:grid lg:grid-cols-2 lg:px-6 lg:py-16">
                    <div className="font-light text-gray-500 dark:text-gray-400 sm:text-lg">
                      <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                        Rejoindre
                      </h2>
                      <form onSubmit={handleJoinSubmit}>
                        <div className="input-container">
                          <input
                            required
                            id="name"
                            type="text"
                            name="name"
                            value={inputValues.name}
                            onChange={handleInputChange}
                            placeholder="Nom"
                            className="mb-2"
                          ></input>
                        </div>
                        <div className="input-container">
                          <input
                            required
                            id="room-code"
                            type="text"
                            name="roomCode"
                            onChange={handleInputChange}
                            placeholder="Code"
                            className="mb-4"
                          ></input>
                        </div>
                        <Button
                          label="Rejoindre le meet"
                          icon="pi pi-arrow-right"
                          iconPos="right"
                          className="p-button-text"
                          outlined
                          loading={isButtonJoinLoading}
                          pt={{
                            root: {
                              className: 'border-green-500 text-green-500',
                            },
                          }}
                        />
                      </form>
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault(); // don't wanna call the default form actions, otherwise refresh the page
                        handleCreateSubmit(meetCreationForm); // call arrow function to submit
                      }}
                      className="space-y-6"
                      method="POST"
                    >
                      <div className="align-center mt-8 justify-center text-center">
                        <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                          Créer
                        </h2>
                        <div className="card justify-content-center flex">
                          <span className="p-float-label">
                            <Dropdown
                              value={meetCreationForm.languageMeet}
                              onChange={(e: DropdownChangeEvent) =>
                                setMeetCreationForm({
                                  ...meetCreationForm,
                                  languageMeet: e.value,
                                })
                              }
                              options={countries}
                              optionLabel="label"
                              placeholder="Langue"
                              filter
                              valueTemplate={countryTemplate}
                              itemTemplate={countryOptionTemplate}
                              tooltip="Choisissez la langue du meet"
                              tooltipOptions={{
                                event: 'both',
                                position: 'top',
                              }}
                              className="md:w-13rem mt-3 w-3/4"
                            />
                            <label>Langue</label>
                          </span>
                        </div>
                        <div className="card justify-content-center mt-4 flex">
                          <span className="p-float-label">
                            <Calendar
                              value={meetCreationForm.startMeet}
                              showTime
                              hourFormat="24"
                              onChange={(e) =>
                                setMeetCreationForm({
                                  ...meetCreationForm,
                                  startMeet: e.value,
                                })
                              }
                              tooltip="Choisissez la date et l'heure de début du meet"
                              tooltipOptions={{
                                event: 'both',
                                position: 'top',
                              }}
                            />
                            <label>Début</label>
                          </span>
                        </div>
                        <div className="card justify-content-center mt-4 flex">
                          <span className="p-float-label">
                            <Calendar
                              value={meetCreationForm.endMeet}
                              showTime
                              hourFormat="24"
                              onChange={(e) =>
                                setMeetCreationForm({
                                  ...meetCreationForm,
                                  endMeet: e.value,
                                })
                              }
                              tooltip="Choisissez la date et l'heure de fin du meet"
                              tooltipOptions={{
                                event: 'both',
                                position: 'top',
                              }}
                            />
                            <label>Fin</label>
                          </span>
                        </div>
                        {/* <div className="card justify-content-center mt-4 flex">
                          <Checkbox
                            onChange={(e) =>
                              setMeetCreationForm({
                                ...meetCreationForm,
                                privateMeet: e.checked,
                              })
                            }
                            checked={meetCreationForm.privateMeet}
                            tooltip="Le meet sera-t-il accessible uniquement par votre entreprise ?"
                            tooltipOptions={{ event: 'both', position: 'top' }}
                            // required
                          ></Checkbox>
                          <label htmlFor="ingredient1" className="ml-2">
                            Meet privé ?
                          </label>
                        </div> */}
                        <br />
                        <Button
                          label="Créer un meet"
                          icon="pi pi-arrow-right"
                          iconPos="right"
                          className="p-button-text"
                          outlined
                          loading={isButtonLoading}
                          pt={{
                            root: {
                              className: 'border-green-500 text-green-500',
                            },
                          }}
                        />
                      </div>
                    </form>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <div>
              <p className="font-small text-black-500 text-x2">
                Non autorisé(e)
              </p>{' '}
              <p className="font-small text-black-500 text-x2">
                Vous ne faîtes pas parti de l'entreprise
                {params?.name}
              </p>
            </div>
          )
        ) : (
          <div>
            <p className="font-small text-black-500 text-x2">Non autorisé(e)</p>{' '}
            <p className="font-small text-black-500 text-x2">
              Vous n'êtes pas reconnu comme client(e) ayant minimum un
              abonnement mensuel. Veuillez contacter un administrateur
              informatique si cette situation est anormale, ou{' '}
              <Link
                href="/pricing"
                className="font-small leading-6 text-indigo-600 hover:text-indigo-500"
              >
                acheter l'abonnement souhaité ici.
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
