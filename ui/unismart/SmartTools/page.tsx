'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { AppContext, appContext } from '@/types/appContext';

import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { ScrollPanel } from 'primereact/scrollpanel';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';

import { postTranscriptionData } from '@/utils/openai/postTranscriptionData';
import { postTranslationData } from '@/utils/openai/postTranslationData';

import languages from '@/utils/openai/languages';
import languagesiso from '@/utils/openai/languagesiso';

interface Country {
  value: string;
  label: string;
}

const SmartTools = () => {
  // App Context
  const getJWTdataUrl: string = appContext.appUrl + '/api/auth/getJWTdata';
  const ttsOpenAIurl: string = appContext.appUrl + '/api/openai/textToSpeech';
  const playSoundsUrl: string = appContext.appUrl + '/api/openai/playSounds';
  const deleteSoundsUrl: string = appContext.appUrl + '/api/openai/deleteSound';
  const updateTokenUsageUrl: string =
    appContext.appUrl + '/api/auth/updateTokenUsage';

  // App router & navigation
  const router = useRouter();

  const [userBearer, setUserBearer] = useState('');
  const [dataFetched, setDataFetched] = useState(false);
  const [tokenUsageDate, setUsageTokenDate] = useState(0);
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
        setUserBearer(data.jwt);
        setDataFetched(true);
      } catch (error) {
        console.error('Error fetching jwt data:', error);
      }
    };
    fetchJWTData();
  }, []);

  // Notification
  const toast = useRef(null);
  const showInfo = (message) => {
    toast.current.show({
      severity: 'info',
      summary: 'Info',
      detail: message,
    });
  };
  const showError = (message) => {
    toast.current.show({
      severity: 'error',
      summary: 'Erreur',
      detail: message,
    });
  };

  // Text to speech
  const [ttsTransriptionBtnLoading, setTtsTransriptionBtnLoading] =
    useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    setDownloaded(true);
    const downloadLink = document.createElement('a');
    downloadLink.href = audioUrl;
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    setDownloaded(false);
  };

  async function handleTranscriptionListen() {
    try {
      setTtsTransriptionBtnLoading(true);
      setUsageTokenDate(Date.now());

      const dataToSend: string = `men/${generatedTranscription}/${tokenUsageDate}`;
      await fetch(ttsOpenAIurl, {
        body: JSON.stringify(dataToSend),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          authorization: `Bearer ${userBearer}`,
        },
        method: 'POST',
      });
      const response = await fetch(playSoundsUrl, {
        body: JSON.stringify(tokenUsageDate),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          authorization: `Bearer ${userBearer}`,
        },
        method: 'POST',
      });
      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        const audio = new Audio(audioUrl);
        audio.play();

        // Button to download the audio
        setAudioUrl(audioUrl);
        setFileName('transcription_audio.mp3');
      } else {
        console.error('Failed to fetch audio:', response.statusText);
      }
      setTtsTransriptionBtnLoading(false);
    } catch (e) {
      showError('Failed text to speech:' + JSON.stringify(e));
    }
  }
  const [ttsTranslationBtnLoading, setTtsTranslationBtnLoading] =
    useState<boolean>(false);
  async function handleTranslationListen() {
    try {
      setTtsTranslationBtnLoading(true);
      const dataToSend: string = `men/${generatedTranslation}`;
      await fetch(ttsOpenAIurl, {
        body: JSON.stringify(dataToSend),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          authorization: `Bearer ${userBearer}`,
        },
        method: 'POST',
      });
      const response = await fetch(playSoundsUrl, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          authorization: `Bearer ${userBearer}`,
        },
        method: 'GET',
      });
      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        const audio = new Audio(audioUrl);

        audio.addEventListener('ended', () => {
          fetch(deleteSoundsUrl, {
            body: JSON.stringify(tokenUsageDate),
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              authorization: `Bearer ${userBearer}`,
            },
            method: 'POST',
          });
        });

        audio.play();
      } else {
        console.error('Failed to fetch audio:', response.statusText);
      }
      setTtsTranslationBtnLoading(false);
    } catch (e) {
      showError('Failed text to speech:' + JSON.stringify(e));
    }
  }

  const countries: Country[] = [
    { value: 'en', label: 'Anglais' },
    { value: 'af', label: 'Africain' },
    { value: 'ar', label: 'Arabe' },
    { value: 'hy', label: 'Arménien' },
    { value: 'az', label: 'Azéri' },
    { value: 'be', label: 'Biélorusse' },
    { value: 'bs', label: 'Bosniaque' },
    { value: 'bg', label: 'Bulgare' },
    { value: 'ca', label: 'Catalan' },
    { value: 'zh', label: 'Chinois' },
    { value: 'hr', label: 'Croate' },
    { value: 'cs', label: 'Tchèque' },
    { value: 'da', label: 'Danois' },
    { value: 'nl', label: 'Néerlandais' },
    { value: 'et', label: 'Estonien' },
    { value: 'fi', label: 'Finnois' },
    { value: 'fr', label: 'Français' },
    { value: 'gl', label: 'Galicien' },
    { value: 'de', label: 'Allemand' },
    { value: 'el', label: 'Grec' },
    { value: 'he', label: 'Hébreu' },
    { value: 'hi', label: 'Hindi' },
    { value: 'hu', label: 'Hongrois' },
    { value: 'is', label: 'Islandais' },
    { value: 'id', label: 'Indonésien' },
    { value: 'it', label: 'Italien' },
    { value: 'ja', label: 'Japonais' },
    { value: 'kn', label: 'Kannada' },
    { value: 'kk', label: 'Kazakh' },
    { value: 'ko', label: 'Coréen' },
    { value: 'lv', label: 'Letton' },
    { value: 'lt', label: 'Lituanien' },
    { value: 'mk', label: 'Macédonien' },
    { value: 'ms', label: 'Malais' },
    { value: 'mr', label: 'Marathi' },
    { value: 'mi', label: 'Maori' },
    { value: 'ne', label: 'Népalais' },
    { value: 'no', label: 'Norvégien' },
    { value: 'fa', label: 'Persan' },
    { value: 'pl', label: 'Polonais' },
    { value: 'pt', label: 'Portugais' },
    { value: 'ro', label: 'Roumain' },
    { value: 'ru', label: 'Russe' },
    { value: 'sr', label: 'Serbe' },
    { value: 'sk', label: 'Slovaque' },
    { value: 'sl', label: 'Slovène' },
    { value: 'es', label: 'Espagnol' },
    { value: 'sw', label: 'Swahili' },
    { value: 'sv', label: 'Suédois' },
    { value: 'tl', label: 'Tagalog' },
    { value: 'ta', label: 'Tamoul' },
    { value: 'th', label: 'Thaï' },
    { value: 'uk', label: 'Ukrainien' },
    { value: 'ur', label: 'Ourdou' },
    { value: 'vi', label: 'Vietnamien' },
    { value: 'cy', label: 'Gallois' },
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

  // Transcript audio file to text
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [languageSrc, setLanguageSrc] = useState<string>(languagesiso[0].value);
  const [languageDst, setLanguageDst] = useState<string>(languagesiso[0].value);
  const [generatedTranscription, setGeneratedTranscription] =
    useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);

  const url = 'https://api.openai.com/v1/audio/transcriptions'; // https://platform.openai.com/docs/api-reference/audio/create
  const transcribe = async () => {
    const formData = new FormData();
    if (selectedFile) {
      formData.append('file', selectedFile);
    }
    formData.append('model', 'whisper-1'); // https://platform.openai.com/docs/api-reference/audio/create
    formData.append('response_format', 'verbose_json');

    const selectedCountry = countries.find(
      (country) => country.value === languageSrc,
    );

    if (languageSrc) {
      formData.append('language', selectedCountry.value);
    }
    const headers = new Headers();
    headers.append(
      'Authorization',
      'Bearer ' + process.env.NEXT_PUBLIC_OPENAI_SECRET,
    );

    // await postTranscriptionData(url, formData, headers);
    const response = await postTranscriptionData(url, formData, headers);
    return response;
  };

  const transcriptAudio = async () => {
    setGeneratedTranscription('');
    setLoading(true);
    setIsReady(false);

    const res = await fetch(updateTokenUsageUrl, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      method: 'GET',
    });
    if (res.status == 206) {
      router.push('/access');
    }

    const transcribedText = await transcribe();
    const translatedText = await translateText(
      false,
      languageSrc,
      languageDst,
      transcribedText.text,
    );

    setGeneratedTranscription(translatedText);
    setLoading(false);
    setIsReady(true);

    // handleTranscriptionListen();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      // Check file size
      const fileSizeInBytes = file.size;
      const maxSizeInBytes = 64 * 1024 * 1024; // 64 MB
      if (fileSizeInBytes > maxSizeInBytes) {
        showError('La taille du fichier dépassse le maximum autorisé de 64 Mo');
        return;
      }
      setSelectedFile(file);
    }
  };

  // Translate
  const [translateLoading, setTranslateLoading] = useState(false);
  const [srcLanguage, setSrcLanguage] = useState<string>(languages[0].label);
  const [dstLanguage, setDstLanguage] = useState<string>(languages[0].label);
  const [generatedTranslation, setGeneratedTranslation] = useState<string>('');
  const [text, setText] = useState<string>('');
  // const currentModel = 'gpt-3.5-turbo-instruct';

  const translateText = async (
    translation: boolean,
    langueSource: string,
    langueDestination: string,
    donnees: string,
  ) => {
    if (text.length > 500) {
      showError(
        'La longueur du texte dépasse celle maximale autorisée de 500 caractères',
      );
      return;
    }

    const prompt = `Translate the following text from ${langueSource} to ${langueDestination}: "${donnees}"\n\n${langueSource}: ${donnees}\n${langueDestination}:`;

    if (translation && text !== '') {
      setGeneratedTranslation('');
      setTranslateLoading(true);

      const res = await fetch(updateTokenUsageUrl, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        method: 'GET',
      });
      if (res.status == 206) {
        router.push('/access');
      }

      const response = await postTranslationData(
        '/api/openai/translate',
        prompt,
        userBearer,
      );

      if (response && response !== undefined) {
        const data = response.data;
        setGeneratedTranslation(data);
        setTranslateLoading(false);
        return data;
      }
    } else {
      const res = await fetch(updateTokenUsageUrl, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        method: 'GET',
      });
      if (res.status == 206) {
        router.push('/access');
      }

      const response = await postTranslationData(
        '/api/openai/translate',
        prompt,
        userBearer,
      );

      if (response && response !== undefined) {
        const data = response.data;
        return data;
      }
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 items-center justify-center gap-10 lg:grid-cols-2 xl:min-h-[200px]">
        <Toast ref={toast} />

        <div className="mr-4 flex h-screen w-full flex-col items-center justify-center gap-4 md:flex-row">
          {/* Left or Top div */}
          <div
            style={{ height: '70vh' }}
            className="unismartMobileWidth ml-4 rounded-[24px] bg-gray-200 p-4"
          >
            <h2 className="mb-6 text-center text-xl font-bold">Réglages</h2>
            <div className="profiles-container">
              <div className="mb-4 text-center">
                <div className="space-y-2">
                  <input
                    className="mb-2 block w-full rounded-lg border border-gray-300 text-sm text-gray-900"
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                  />

                  <p className="text-sm text-gray-500 dark:text-gray-300">
                    {/* https://platform.openai.com/docs/api-reference/audio/create */}
                    Extensions de fichiers autorisés: m4a, mp3, webm, mp4, mpga,
                    wav, mpeg
                  </p>
                  <p className="mb-4 text-sm text-gray-500 dark:text-gray-300">
                    {/* https://platform.openai.com/docs/api-reference/audio/create */}
                    Taille maximale autorisée: 64 Mo
                  </p>

                  <div className="mb-5 mt-7 flex justify-center">
                    <div className="card justify-content-center flex">
                      <span className="p-float-label">
                        <Dropdown
                          value={languageSrc}
                          onChange={(e: DropdownChangeEvent) =>
                            setLanguageSrc(e.value)
                          }
                          options={countries}
                          optionLabel="label"
                          placeholder="Langue initiale"
                          filter
                          valueTemplate={countryTemplate}
                          itemTemplate={countryOptionTemplate}
                          tooltip="Choisissez la langue initiale"
                          tooltipOptions={{
                            event: 'both',
                            position: 'top',
                          }}
                          className="md:w-13rem mt-2 w-full"
                        />
                        <label>Langue initiale</label>
                      </span>
                    </div>
                    <div className="card justify-content-center flex">
                      <span className="p-float-label">
                        <Dropdown
                          value={languageDst}
                          onChange={(e: DropdownChangeEvent) =>
                            setLanguageDst(e.value)
                          }
                          options={countries}
                          optionLabel="label"
                          placeholder="Langue souhaitée"
                          filter
                          valueTemplate={countryTemplate}
                          itemTemplate={countryOptionTemplate}
                          tooltip="Choisissez la langue souhaitée"
                          tooltipOptions={{
                            event: 'both',
                            position: 'top',
                          }}
                          className="md:w-13rem ml-2 mt-2 w-full"
                        />
                        <label>Langue souhaitée</label>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="align-center flex w-full items-center justify-center">
                {!loading && (
                  <Button
                    label="Traduire"
                    outlined
                    rounded
                    onClick={transcriptAudio}
                  />
                )}
                {loading && (
                  <Button label="Traduire" outlined rounded loading={true} />
                )}
              </div>
            </div>
          </div>
          {/* Right or Bottom div */}
          <div
            style={{ height: '75vh' }}
            className="ml-4 w-full justify-between rounded-[24px] bg-gray-200 p-4 md:flex md:w-1/2 md:flex-col"
          >
            <div className="mb-4">
              <h2 className="text-center text-xl font-bold md:text-left">
                Traduction
              </h2>
              <div className="align-center mb-3 flex w-full justify-center text-center">
                <div className="mt-4 w-full">
                  <div className="h-auto overflow-hidden">
                    <div className="h-auto w-full border-none py-2 pl-3 pr-7 text-lg leading-6">
                      <ScrollPanel style={{ width: '100%', height: '200px' }}>
                        {isReady && (
                          <>
                            <p className="p-4">{generatedTranscription}</p>

                            {loading ? (
                              <div className="mt-4">
                                <Button
                                  label="Copier"
                                  outlined
                                  disabled
                                  rounded
                                  className="mr-3"
                                />
                                <Button
                                  label="Ecouter"
                                  outlined
                                  disabled
                                  rounded
                                />
                              </div>
                            ) : (
                              <div className="mt-4">
                                <Button
                                  label="Copier"
                                  outlined
                                  rounded
                                  className="mr-4 mt-3"
                                  onClick={() => {
                                    try {
                                      navigator.clipboard.writeText(
                                        generatedTranscription,
                                      );
                                      showInfo('Traduction copiée');
                                    } catch (error) {
                                      showInfo(
                                        'La copie de la traduction a échouée:' +
                                          error,
                                      );
                                    }
                                  }}
                                />
                                <Button
                                  label="Ecouter"
                                  outlined
                                  rounded
                                  onClick={handleTranscriptionListen}
                                  loading={ttsTransriptionBtnLoading}
                                />
                              </div>
                            )}
                          </>
                        )}
                      </ScrollPanel>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-[24px] bg-gray-300 p-4">
              <h3 className="text-md text-center font-semibold md:text-left">
                Outils
              </h3>
              {isReady && (
                <Button
                  label="Télécharger l'audio"
                  onClick={handleDownload}
                  outlined
                  rounded
                  className="mt-2"
                  loading={downloaded}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SmartTools;
