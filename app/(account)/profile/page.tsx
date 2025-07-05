'use client';
import React, { useState, useEffect, useRef } from 'react';

import { SkeletonCard } from '@/ui/SkeletonCard';
import { AppContext, appContext } from '@/types/appContext';

import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Chip } from 'primereact/chip';
import { Accordion, AccordionTab } from 'primereact/accordion';

interface UserData {
  exp: number;
  expirationTime: string;
  iat: number;
  jti: string;
  jwt: string;
  userCurrentTokensUsed: number;
  userLastTokenUpdateDate: string;
  userPrismaApproved: boolean;
  userPrismaBizNetwork: boolean;
  userPrismaLanguage: string;
  userPrismaVoice: string;
  userPrismaCompany: string;
  userPrismaCity: string;
  userPrismaEmail: string;
  userPrismaName: string;
  userPrismaRole: string;
  userPrismaStripeAssistant: boolean;
  userPrismaStripeCash: boolean;
  // userPrismaStripeCollab: boolean;
  userPrismaStripeCustomerId: string;
  userPrismaSubscription: string;
  userPrismaVerified: boolean;
}
interface FormType {
  name: string;
}
interface Language {
  value: string;
  label: string;
  code: string;
}
interface Voice {
  value: string;
  label: string;
}

export default function Profile() {
  // App Context
  const [mounted, setMounted] = useState(true);

  const getUserInfosUrl: string = appContext.appUrl + '/api/getUserInfos';
  const getJWTdataUrl: string = appContext.appUrl + '/api/auth/getJWTdata';
  const updateProfileUrl: string =
    appContext.appUrl + '/api/auth/updateProfile';
  const billingPortalUrl: string =
    appContext.appUrl + '/api/stripe/postBillingPortal';
  const manageACUrl: string = appContext.appUrl + '/api/manageAC';

  // Notification
  const toast = useRef(null);

  // Get JWT data from user token
  const [dataFetched, setDataFetched] = useState(false);
  const [userInfos, setUserInfos] = useState<UserData | null>(null);
  const [userJwt, setUserJwt] = useState('');
  const [userCompany, setUserCompany] = useState('');
  const [userCity, setUserCity] = useState('');
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

        if (data.name !== 'JsonWebTokenError') {
          const res = await fetch(getUserInfosUrl, {
            body: JSON.stringify(data.userEmail),
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              authorization: `Bearer ${data.jwt}`,
            },
            method: 'POST',
          });
          const userData: UserData = await res.json();

          setUserJwt(data.jwt);

          setUserInfos(userData[0]);
          setName(userData[0].userPrismaName);
          setUserEmail(userData[0].userPrismaEmail);
          setUserCompany(userData[0].userPrismaCompany);
          setUserCity(userData[0].userPrismaCity);
          setLanguageValue(userData[0].userPrismaLanguage);
          setVoiceValue(userData[0].userPrismaVoice);
          // set dataFetched to true after successful fetch (to avoid displaying temporary information that are not totally valid)
          // ie: user has paid subscription + corresponding feature but has the "Not authorized: ..." message due to fetchJWTData() not terminated
          setDataFetched(true);
        } else {
          setDataFetched(true);
        }
      } catch (error) {
        console.log('Error fetching jwt data:', error);
      }
    };
    fetchJWTData();

    return () => {
      setMounted(false);
    };
  }, []);

  // Profile edit
  const [name, setName] = useState<string>('');
  const handleName = (option: string, props) => {
    if (option) {
      setName(option);
    }
  };
  const [nameEditMode, setNameEditMode] = useState<boolean>(false);
  const toggleNameEditMode = () => {
    setNameEditMode((prevEditMode) => !prevEditMode);
  };

  const [userEmail, setUserEmail] = useState<string>('');
  const handleEmail = (option: string, props) => {
    if (
      option &&
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(option)
    ) {
      setUserEmail(option);
    }
  };
  const [emailEditMode, setEmailEditMode] = useState<boolean>(false);
  const toggleEmailEditMode = () => {
    setEmailEditMode((prevEditMode) => !prevEditMode);
  };

  const [languageValue, setLanguageValue] = useState<string>('');
  const [languageLabel, setLanguageLabel] = useState<string>('');
  const languages: Language[] = [
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
  useEffect(() => {
    // Find the label corresponding to the current voiceValue
    const selectedLanguage = languages.find(
      (language) => language.value === languageValue,
    );
    if (selectedLanguage) {
      setLanguageLabel(selectedLanguage.label);
    }
  }, [languageValue]);
  const handleLanguage = (option: Language, props) => {
    if (option) {
      setLanguageValue(option.value);
      setLanguageLabel(option.label);

      return (
        <div className="align-items-center flex">
          {/* <img
            alt={option.label}
            src="https://primefaces.org/cdn/primereact/images/flag/flag_placeholder.png"
            className={`flag mr-2 flag-${option.label.toLowerCase()}`}
            style={{ width: '18px' }}
          /> */}
          <div>{option.label}</div>
        </div>
      );
    }
    return <span>{props.placeholder}</span>;
  };
  const languageOption = (option: Language) => {
    return (
      <div className="align-items-center flex">
        {/* <img
          alt={option.label}
          src="https://primefaces.org/cdn/primereact/images/flag/flag_placeholder.png"
          className={`flag mr-2 flag-${option.label.toLowerCase()}`}
          style={{ width: '18px' }}
        /> */}
        <div>{option.label}</div>
      </div>
    );
  };
  const [languageEditMode, setLanguageEditMode] = useState<boolean>(false);
  const toggleLanguageEditMode = () => {
    setLanguageEditMode((prevEditMode) => !prevEditMode);

    if (languageEditMode == true) {
      const dataToSend: string = `${userEmail},language,${languageValue}`;
      fetch(updateProfileUrl, {
        body: JSON.stringify(dataToSend),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          authorization: `Bearer ${userJwt}`,
        },
        method: 'POST',
      });
    }
  };

  const [voiceValue, setVoiceValue] = useState<string>('');
  const [voiceLabel, setVoiceLabel] = useState<string>('');
  const voices: Voice[] = [
    { value: 'men', label: 'Homme' },
    { value: 'women', label: 'Femme' },
  ];
  useEffect(() => {
    // Find the label corresponding to the current voiceValue
    const selectedVoice = voices.find((voice) => voice.value === voiceValue);
    if (selectedVoice) {
      setVoiceLabel(selectedVoice.label);
    }
  }, [voiceValue]);
  const handleVoice = (option: Voice, props) => {
    if (option) {
      setVoiceValue(option.value);
      setVoiceLabel(option.label);

      return (
        <div className="align-items-center flex">
          {/* <img
            alt={option.label}
            src="https://primefaces.org/cdn/primereact/images/flag/flag_placeholder.png"
            className={`flag mr-2 flag-${option.label.toLowerCase()}`}
            style={{ width: '18px' }}
          /> */}
          <div>{option.label}</div>
        </div>
      );
    }
    return <span>{props.placeholder}</span>;
  };
  const voiceOption = (option: Language) => {
    return (
      <div className="align-items-center flex">
        {/* <img
          alt={option.label}
          src="https://primefaces.org/cdn/primereact/images/flag/flag_placeholder.png"
          className={`flag mr-2 flag-${option.label.toLowerCase()}`}
          style={{ width: '18px' }}
        /> */}
        <div>{option.label}</div>
      </div>
    );
  };
  const [voiceEditMode, setVoiceEditMode] = useState<boolean>(false);
  const toggleVoiceEditMode = () => {
    setVoiceEditMode((prevEditMode) => !prevEditMode);

    if (voiceEditMode == true) {
      const dataToSend: string = `${userEmail},voice,${voiceValue}`;
      fetch(updateProfileUrl, {
        body: JSON.stringify(dataToSend),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          authorization: `Bearer ${userJwt}`,
        },
        method: 'POST',
      });
    }
  };

  // Subscriptions
  const [billingPortal, setBillingPortal] = useState('');
  async function handleBillingPortalUrl(e) {
    try {
      e.preventDefault();

      const response = await fetch(billingPortalUrl, {
        body: userEmail,
        headers: {
          // 'Content-Type': 'application/json',
          authorization: `Bearer ${userJwt}`,
        },
        method: 'POST',
      });

      if (response.ok) {
        const sessionUrl = await response.text();
        setBillingPortal(sessionUrl);
        // Open the URL in a new window
        if (sessionUrl) {
          window.open(sessionUrl, '_blank');
        }
      } else {
        // Handle error
        console.error('Error:', response.status, response.statusText);
      }

      // window.location.assign(sessionUrl);
    } catch (error) {
      return error;
    }
  }

  // Licenses
  async function handleFormSubmit(e) {
    e.preventDefault(); // Prevent default form submission behavior
    handleAC(); // Call your function to handle the form submission
  }

  const [ac, setAC] = useState<string>('');
  const [w, setW] = useState<string>('');
  const widgets: FormType[] = [
    { name: 'Unismart' },
    { name: 'Unidmin' },
    { name: 'Unimeet' },
    // { name: 'Unicollab' },
    // { name: 'Unicash' },
  ];
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);
  async function handleAC() {
    // Does userCompany == AC company name ?
    // If yes, then set approved to true and user wished widget to true

    try {
      setIsButtonLoading(true);
      const dataToSend: string = `${ac},${userCompany},${userEmail},${w.name}`;

      fetch(manageACUrl, {
        body: JSON.stringify(dataToSend),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          // authorization: `bearer ${session?.user?.accessToken}`,
        },
        method: 'POST',
      }).then((res) => {
        setAC('');
        setW('');
        setIsButtonLoading(false);

        console.log(res);

        if (res.status == 200) {
          toast.current?.show({
            severity: 'success',
            summary: 'Succès',
            detail: `La licence a été activée avec succès`,
            life: 5000,
          });

          // update jwt with activated widget ?
          // redirect to activated widget ?
        } else {
          toast.current?.show({
            severity: 'error',
            summary: 'Erreur',
            detail:
              "Veuillez vérifier que le code d'activation est correcte ou que celui-ci n'a pas dépassé son quota d'activations",
            life: 5000,
          });
        }
      });
    } catch (error) {
      return error;
    }
  }

  return (
    <div style={{ padding: '3rem' }}>
      <Toast ref={toast} />
      <br />
      {dataFetched ? (
        <div className="font-small text-black-500 text-x2">
          <div className="surface-0">
            <div className="text-900 mb-5 text-3xl font-medium">Mon profil</div>

            <Accordion activeIndex={0}>
              <AccordionTab header="Données personnelles">
                <p className="m-0">
                  <ul className="m-0 w-full list-none p-0">
                    <li className="align-items-center border-top-1 border-300 flex flex-wrap px-2 py-3">
                      <div className="text-500 w-6 font-medium md:w-2">
                        Nom complet
                      </div>
                      <div className="text-900 md:flex-order-0 flex-order-1 w-full md:w-8">
                        {nameEditMode ? (
                          <div>
                            <InputText
                              value={name}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                              ) => setName(e.target.value)}
                              placeholder="Nom complet"
                              tooltip="Entrez votre nom complet"
                              tooltipOptions={{
                                event: 'both',
                                position: 'top',
                              }}
                              className="md:w-13rem w-full"
                            />
                          </div>
                        ) : (
                          <div>{name}</div>
                        )}
                      </div>
                      {/* <div className="justify-content-end flex w-6 md:w-2">
                  <Button
                    label={nameEditMode ? 'Enregistrer' : 'Modifier'}
                    icon="pi pi-pencil"
                    className="p-button-text"
                    onClick={toggleNameEditMode}
                    disabled
                  />
                </div> */}
                    </li>
                    <li className="align-items-center border-top-1 border-300 flex flex-wrap px-2 py-3">
                      <div className="text-500 w-6 font-medium md:w-2">
                        Email
                      </div>
                      <div className="text-900 md:flex-order-0 flex-order-1 w-full md:w-8">
                        {emailEditMode ? (
                          <div>
                            <InputText
                              value={userEmail}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                              ) => setUserEmail(e.target.value)}
                              keyfilter="email"
                              tooltip="Entrez votre adresse email"
                              tooltipOptions={{
                                event: 'both',
                                position: 'top',
                              }}
                            />
                          </div>
                        ) : (
                          <div>{userEmail}</div>
                        )}
                      </div>
                      {/* <div className="justify-content-end flex w-6 md:w-2">
                  <Button
                    label={emailEditMode ? 'Enregistrer' : 'Modifier'}
                    icon="pi pi-pencil"
                    className="p-button-text"
                    onClick={toggleEmailEditMode}
                    disabled
                  />
                </div> */}
                    </li>
                    <li className="align-items-center border-top-1 border-300 flex flex-wrap px-2 py-3">
                      <div className="text-500 w-6 font-medium md:w-2">
                        Langue préférée
                      </div>
                      <div className="text-900 md:flex-order-0 flex-order-1 w-full md:w-8">
                        {languageEditMode ? (
                          <div>
                            <Dropdown
                              value={languageValue}
                              onChange={(e: DropdownChangeEvent) =>
                                setLanguageValue(e.value)
                              }
                              options={languages}
                              optionLabel="label"
                              placeholder="Langue"
                              filter
                              valueTemplate={handleLanguage}
                              itemTemplate={languageOption}
                              className="md:w-13rem w-full"
                            />
                          </div>
                        ) : (
                          <div>{languageLabel}</div>
                        )}
                      </div>
                      <div className="justify-content-end flex w-6 md:w-2">
                        <Button
                          label={languageEditMode ? 'Enregistrer' : 'Modifier'}
                          icon="pi pi-pencil"
                          className="p-button-text"
                          onClick={toggleLanguageEditMode}
                        />
                      </div>
                    </li>
                    <li className="align-items-center border-top-1 border-300 flex flex-wrap px-2 py-3">
                      <div className="text-500 w-6 font-medium md:w-2">
                        Voix
                      </div>
                      <div className="text-900 md:flex-order-0 flex-order-1 w-full md:w-8">
                        {voiceEditMode ? (
                          <div>
                            <Dropdown
                              value={voiceValue}
                              onChange={(e: DropdownChangeEvent) =>
                                setVoiceValue(e.value)
                              }
                              options={voices}
                              optionLabel="label"
                              placeholder="Voix"
                              filter
                              valueTemplate={handleVoice}
                              itemTemplate={voiceOption}
                              className="md:w-13rem w-full"
                            />
                          </div>
                        ) : (
                          <div>{voiceLabel}</div>
                        )}
                      </div>
                      <div className="justify-content-end flex w-6 md:w-2">
                        <Button
                          label={voiceEditMode ? 'Enregistrer' : 'Modifier'}
                          icon="pi pi-pencil"
                          className="p-button-text"
                          onClick={toggleVoiceEditMode}
                        />
                      </div>
                    </li>
                    <li className="align-items-center border-top-1 border-300 flex flex-wrap px-2 py-3">
                      <div className="text-500 w-6 font-medium md:w-2">
                        Entreprise
                      </div>
                      <div className="text-900 md:flex-order-0 flex-order-1 w-full md:w-8">
                        {userInfos?.userPrismaCompany}
                      </div>
                      {/* <div className="justify-content-end flex w-6 md:w-2">
                  <Button
                    label="Modifier"
                    icon="pi pi-pencil"
                    className="p-button-text"
                    disabled
                  />
                </div> */}
                    </li>
                    <li className="align-items-center border-top-1 border-300 flex flex-wrap px-2 py-3">
                      <div className="text-500 w-6 font-medium md:w-2">
                        Rôle
                      </div>
                      <div className="text-900 md:flex-order-0 flex-order-1 w-full md:w-8">
                        {userInfos?.userPrismaRole === 'admin' ? (
                          <span>Administrateur</span>
                        ) : userInfos?.userPrismaRole === 'consumer' ? (
                          <span>Consommateur</span>
                        ) : (
                          <span>Employé</span>
                        )}
                      </div>
                      {/* <div className="justify-content-end flex w-6 md:w-2">
                  <Button
                    label="Modifier"
                    icon="pi pi-pencil"
                    className="p-button-text"
                    disabled
                  />
                </div> */}
                    </li>
                    <li className="align-items-center border-top-1 border-300 flex flex-wrap px-2 py-3">
                      <div className="text-500 w-6 font-medium md:w-2">
                        Ville
                      </div>
                      <div className="text-900 md:flex-order-0 flex-order-1 w-full md:w-8">
                        {userInfos?.userPrismaCity ? (
                          <span>{userInfos?.userPrismaCity}</span>
                        ) : (
                          <span>Ville non renseignée</span>
                        )}
                      </div>
                      {/* <div className="justify-content-end flex w-6 md:w-2">
                        <Button
                          label="Modifier"
                          icon="pi pi-pencil"
                          className="p-button-text"
                          disabled
                        />
                      </div> */}
                    </li>
                    <li className="align-items-center border-top-1 border-300 flex flex-wrap px-2 py-3">
                      <div className="text-500 w-6 font-medium md:w-2">
                        Compte vérifié ?
                      </div>
                      <div className="text-900 md:flex-order-0 flex-order-1 w-full md:w-8">
                        {userInfos?.userPrismaVerified ? (
                          <Chip
                            label="Oui"
                            pt={{
                              root: {
                                style: {
                                  background: 'green',
                                },
                              },
                              label: { className: 'text-white' },
                            }}
                          />
                        ) : (
                          <Chip
                            label="Non"
                            pt={{
                              root: {
                                style: {
                                  background: 'red',
                                },
                              },
                              label: { className: 'text-white' },
                            }}
                          />
                        )}
                      </div>
                      {/* <div className="justify-content-end flex w-6 md:w-2">
                  <Button
                    label="Modifier"
                    icon="pi pi-pencil"
                    className="p-button-text"
                    disabled
                  />
                </div> */}
                    </li>
                    <li className="align-items-center border-top-1 border-300 flex flex-wrap px-2 py-3">
                      <div className="text-500 w-6 font-medium md:w-2">
                        Compte ayant accès à la beta ?
                      </div>
                      <div className="text-900 md:flex-order-0 flex-order-1 line-height-3 w-full md:w-8">
                        {userInfos?.userPrismaApproved ? (
                          <Chip
                            label="Oui"
                            pt={{
                              root: {
                                style: {
                                  background: 'green',
                                },
                              },
                              label: { className: 'text-white' },
                            }}
                          />
                        ) : (
                          <Chip
                            label="Non"
                            pt={{
                              root: {
                                style: {
                                  background: 'red',
                                },
                              },
                              label: { className: 'text-white' },
                            }}
                          />
                        )}
                      </div>
                      {/* <div className="justify-content-end flex w-6 md:w-2">
                  <Button
                    label="Modifier"
                    icon="pi pi-pencil"
                    className="p-button-text"
                    disabled
                  />
                </div> */}
                    </li>
                    <li className="align-items-center border-top-1 border-bottom-1 border-300 flex flex-wrap px-2 py-3">
                      <div className="text-500 w-6 font-medium md:w-2">
                        Compte payant ?
                      </div>
                      <div className="text-900 md:flex-order-0 flex-order-1 line-height-3 w-full md:w-8">
                        {userInfos?.userPrismaSubscription ? (
                          <Chip
                            label="Oui"
                            pt={{
                              root: {
                                style: {
                                  background: 'green',
                                },
                              },
                              label: { className: 'text-white' },
                            }}
                          />
                        ) : (
                          <Chip
                            label="Non"
                            pt={{
                              root: {
                                style: {
                                  background: 'red',
                                },
                              },
                              label: { className: 'text-white' },
                            }}
                          />
                        )}
                      </div>
                      {/* <div className="justify-content-end flex w-6 md:w-2">
                  <Button
                    label="Modifier"
                    icon="pi pi-pencil"
                    className="p-button-text"
                    disabled
                  />
                </div> */}
                    </li>
                  </ul>
                </p>
              </AccordionTab>
              <AccordionTab header="Données de facturation et widgets">
                <div className="flex justify-between">
                  <div className="justify-top flex w-1/2 flex-initial flex-col items-center text-center">
                    <b className="mb-4">Abonnements mensuels</b>
                    <br />
                    <button
                      onClick={handleBillingPortalUrl}
                      className="font-small mr-1 leading-6 text-indigo-600 hover:text-indigo-500"
                    >
                      Consultez et gérez ici vos abonnements mensuels ainsi que
                      vos données de facturation
                    </button>
                  </div>
                  <div className="flex w-1/2 flex-initial flex-col items-center justify-center text-center">
                    {' '}
                    <b className="mb-4">Licences</b>
                    <form>
                      <div className="mt-2 grid w-full items-center justify-center text-center">
                        <span className="p-float-label mb-2 block w-full">
                          <Dropdown
                            value={w}
                            onChange={(e: DropdownChangeEvent) => setW(e.value)}
                            required
                            options={widgets}
                            optionLabel="name"
                            tooltip="Choisissez le widget souhaité"
                            tooltipOptions={{ event: 'both', position: 'top' }}
                            className="w-full"
                          />
                          <label>Widget souhaité</label>
                        </span>
                        <span className="p-float-label mb-5 block w-full">
                          <InputText
                            value={ac}
                            keyfilter="alphanum" // to avoid spaces
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) => setAC(e.target.value)}
                            tooltip="Entrez le code d'activation nécessaire pour activer la licence vous permettant de gagner l'accès au widget"
                            tooltipOptions={{ event: 'both', position: 'top' }}
                            required
                          />
                          <label>Code d'activation de la licence</label>
                        </span>
                      </div>
                      <div className="w-full justify-center text-center">
                        <Button
                          label="Accéder au widget"
                          size="small"
                          outlined
                          iconPos="right"
                          icon="pi pi-arrow-right"
                          onClick={handleFormSubmit}
                          loading={isButtonLoading}
                        />
                      </div>
                    </form>
                  </div>
                </div>
              </AccordionTab>
            </Accordion>
          </div>
        </div>
      ) : (
        <div>
          <SkeletonCard />
        </div>
      )}
    </div>
  );
}
