'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { AppContext, appContext } from '@/types/appContext';
import { SkeletonCard } from '@/ui/SkeletonCard';

import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { SplitButton } from 'primereact/splitbutton';
import { ScrollPanel } from 'primereact/scrollpanel';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';

import { postTranscriptionData } from '@/utils/openai/postTranscriptionData';
import { postTranslationData } from '@/utils/openai/postTranslationData';
import languages from '@/utils/openai/languages';
import languagesiso from '@/utils/openai/languagesiso';

// expoert
let id: number = 1;
let isFirstAction: boolean = true;
let srcLanguage: string = '';
let dstLanguage: string = '';

// Declare a global interface to add the webkitSpeechRecognition property to the Window object
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

interface Country {
  value: string;
  label: string;
  code: string;
}
interface VoiceGender {
  value: string;
  label: string;
}

let transcriptionToSend: string = '';

export default function SmartInterpreter() {
  // =======================
  // BASICS
  // =======================
  // App Context
  const getJWTdataUrl: string = appContext.appUrl + '/api/auth/getJWTdata';
  const ttsOpenAIurl: string = appContext.appUrl + '/api/openai/textToSpeech';
  const playSoundsUrl: string = appContext.appUrl + '/api/openai/playSounds';
  const deleteSoundsUrl: string = appContext.appUrl + '/api/openai/deleteSound';

  // Router
  const params = useParams();
  // const searchParams = useSearchParams();
  // <p>param: {params?.name}</p>
  // <p>search params with id only: {searchParams?.get('id')}</p>;

  // Get JWT data from user token
  // const [userCompany, setUserCompany] = useState('');
  // const [userRole, setUserRole] = useState('');
  const [userBearer, setUserBearer] = useState('');
  const [userSubscription, setUserSubscription] = useState('');
  const [hasUserStripeAssistant, setHasUserStripeAssistant] = useState(false);
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
        setUserBearer(data.jwt);
        setUserSubscription(data.userPrismaSubscription);
        setHasUserStripeAssistant(data.userPrismaStripeAssistant);
        setDataFetched(true);
      } catch (error) {
        console.error('Error fetching jwt data:', error);
      }
    };
    fetchJWTData();
  }, []);

  // =======================
  // NOTIFICATIONS
  // =======================
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

  // ======
  // SOUNDS
  // ======
  // Function to play sounds
  function playBusinessBell() {
    var audio = new Audio('/bellBusinessProfile.mp3');
    audio.play();
  }
  function playClientBell() {
    var audio = new Audio('/bellClientProfile.mp3');
    audio.play();
  }
  function playSuccessBell() {
    var audio = new Audio('/bellSuccess.mp3');
    audio.play();
  }
  // =======================
  // AUDIO PERMISSIONS
  // =======================
  const [permission, setPermission] = useState(false); // boolean value to indicate whether user permission has been given
  const [stream, setStream] = useState(null); // contains the MediaStream received from the getUserMedia method

  const getMicrophonePermission = async () => {
    if ('MediaRecorder' in window) {
      if (
        clientProfileName === null ||
        clientProfileName === undefined ||
        clientProfileName === '' ||
        selectedClientCountry === null ||
        selectedClientCountry === undefined ||
        selectedClientVoiceGender === null ||
        selectedClientVoiceGender === undefined ||
        bizProfileName === null ||
        bizProfileName === undefined ||
        bizProfileName === '' ||
        selectedBizCountry === null ||
        selectedBizCountry === undefined
      ) {
        showError('Veuillez vérifier que tous les champs soient bien remplis');
      } else {
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
      }
    } else {
      showError('The MediaRecorder API is not supported in your browser.');
    }
  };

  // =======================
  // AUDIO PROFILES
  // =======================
  const [bizProfileName, setBizProfileName] = useState<string>('');
  const [bizProfileLanguage, setBizProfileLanguage] = useState<string>(
    languagesiso[0].value,
  );
  const [clientProfileName, setClientProfileName] = useState<string>('');
  const [clientProfileLanguage, setClientProfileLanguage] = useState<string>(
    languagesiso[0].value,
  );

  const [selectedBizCountry, setSelectedBizCountry] = useState<Country | null>(
    null,
  );
  const [selectedClientCountry, setSelectedClientCountry] =
    useState<Country | null>(null);

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
  const handleBizCountry = (option: Country, props) => {
    if (option) {
      setBizProfileLanguage(option.value);
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
  const handleClientCountry = (option: Country, props) => {
    if (option) {
      setClientProfileLanguage(option.value);
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
  const countryOptionTemplate = (option: Country) => {
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

  const [selectedBizVoiceGender, setSelectedBizVoiceGender] =
    useState<VoiceGender | null>(null);
  const [selectedClientVoiceGender, setSelectedClientVoiceGender] =
    useState<VoiceGender | null>(null);

  const voiceGenders: VoiceGender[] = [
    { value: 'men', label: 'Masculine' },
    { value: 'women', label: 'Féminine' },
  ];
  const handleBizVoiceGender = (option: VoiceGender, props) => {
    if (option) {
      setSelectedBizVoiceGender(option.value);
      return (
        <div className="align-items-center flex">
          <div>{option.label}</div>
        </div>
      );
    }
    return <span>{props.placeholder}</span>;
  };
  const handleClientVoiceGender = (option: VoiceGender, props) => {
    if (option) {
      setSelectedClientVoiceGender(option.value);
      return (
        <div className="align-items-center flex">
          <div>{option.label}</div>
        </div>
      );
    }
    return <span>{props.placeholder}</span>;
  };
  const voiceGenderOptionTemplate = (option: VoiceGender) => {
    return (
      <div className="align-items-center flex">
        <div>{option.label}</div>
      </div>
    );
  };

  // =======================
  // AUDIO RECORDER
  // =======================

  // UI & UX
  const splitButtonModel = [
    {
      label: 'Arrêter',
      icon: 'pi pi-stop-circle',
      command: () => {
        handleStopClick();
      },
    },
  ];

  const [splitButtonLoading, setSplitButtonLoading] = useState(false);
  const [audioIsReady, setAudioIsReady] = useState(false);
  const [isRecordForDl, setIsRecordingForDl] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const chunksRef = useRef<Blob[]>([]);

  const handleRecordClick = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.addEventListener(
        'dataavailable',
        (e: BlobEvent) => {
          chunksRef.current.push(e.data);
        },
      );
      mediaRecorderRef.current.addEventListener(
        'error',
        (error: MediaRecorderEventMap['error']) => {
          console.log('mediaRecorderRef error:' + JSON.stringify(error));
        },
      );
      mediaRecorderRef.current.start();

      setIsRecordingForDl(true);
      await startTask();
      setSplitButtonLoading(true);
      setAudioIsReady(false);
    } catch (error) {
      showError('Error attempting to record your microphone:' + error);
    }
  };
  const handleStopClick = () => {
    if (mediaRecorderRef.current && isRecordForDl) {
      try {
        mediaRecorderRef.current.stop();
        showInfo("L'enregistrement du microphone s'arrête");
      } catch (error) {
        showError(
          'Error attempting to stop recording your microphone:' + error,
        );
      }
      setIsRecordingForDl(false);
      stopTask();
      setSplitButtonLoading(false);
      setAudioIsReady(true);
    }
  };

  // Audio downloader
  const handleDownloadClick = () => {
    if (chunksRef.current.length > 0) {
      // This blob represents the binary audio data in memory
      const blob = new Blob(chunksRef.current, { type: 'audio/mp3' });

      // Send it here to backend to store it server-side or on Redis

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'recording.mp3';
      link.click();
      URL.revokeObjectURL(url);
      chunksRef.current = []; // clear audio data
    }
  };

  // ========================
  // Audio real-time & pusher
  // ========================
  // State variables to manage recording status, completion, and transcript
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [uniqueTranscripts, setUniqueTranscripts] = useState(new Set<string>());
  // Cleanup effect when the component unmounts
  useEffect(() => {
    return () => {
      // Stop the speech recognition if it's active
      if (recognitionRef.current) {
        // console.log('OK');
        recognitionRef.current.stop();
        // resetUniqueTranscripts();
      }
    };
  }, []);

  // Reference to store the SpeechRecognition instance
  const recognitionRef = useRef<any>(null);
  // Function to reset the value to an empty set
  // const resetUniqueTranscripts = () => {
  //   setUniqueTranscripts(new Set<string>());
  // };

  const mediaTempRecorderRef = useRef<MediaRecorder | null>(null);
  const tempChunksRef = useRef<Blob[]>([]);

  let newTranscriptionToAdd: string = '';
  // let [generatedTranslation, setGeneratedTranslation] = useState<string>('');
  // const [generatedTranscription, setGeneratedTranscription] =
  //   useState<string>('');

  const audioTempRecord = async () => {
    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      mediaTempRecorderRef.current = new MediaRecorder(tempStream);
      mediaTempRecorderRef.current.addEventListener(
        'dataavailable',
        (e: BlobEvent) => {
          tempChunksRef.current.push(e.data);
        },
      );
      mediaTempRecorderRef.current.start();
      // showInfo('Microphone recording starts');
    } catch (error) {
      showError('Error attempting to record your microphone:' + error);
    }
  };
  const audioTempStop = () => {
    if (mediaTempRecorderRef.current) {
      try {
        mediaTempRecorderRef.current.stop();
        showInfo("L'enregistrement du microphone s'arrête");
      } catch (error) {
        showError(
          'Error attempting to stop recording your microphone:' + error,
        );
      }
    }
  };
  const [audioSegment, setAudioSegment] = useState(false);
  async function startTask() {
    // Will execute the audio segment every x seconds through useEffect below until user stops the audio record
    setAudioSegment(true);
  }
  const stopTask = () => {
    setAudioSegment(false);
  };
  function wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  // Audio segment checker (when clicking on permissions button)
  // useEffect(() => {
  // Open the IndexedDB when the component mounts
  //   openDB().then((db) => {
  //     console.log('IndexedDB is (created if necessary) open:', db);
  //   });
  // }, []);
  // Audio segment manager (when clicking on recording button)
  useEffect(() => {
    id = 1;

    const intervalId = setInterval(async () => {
      setIsRecording(true);
      setIsTtsReady(false);
      transcriptionToSend = '';

      // Create a new SpeechRecognition instance and configure it
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      if (audioSegment) {
        if (id % 2 == 1) {
          const selectedOption = countries.find(
            (option) => option.value === bizProfileLanguage.toString(),
          );

          // console.log('selected option!' + JSON.stringify(selectedOption?.code));

          recognitionRef.current.lang = selectedOption?.code;

          // Event handler for speech recognition results
          recognitionRef.current.onresult = (event: any) => {
            const resultList = event.results;

            // Log the recognition results
            // console.log(resultList);

            // Iterate through each SpeechRecognitionResult
            for (let i = 0; i < resultList.length; i++) {
              const result = resultList[i];

              // Access isFinal from SpeechRecognitionResult
              const isFinal = result.isFinal;

              // If this is a new set of results, reset unique transcripts set
              // if (i === 0) {
              //   resetUniqueTranscripts();
              // }

              // Iterate through each SpeechRecognitionAlternative
              for (let j = 0; j < result.length; j++) {
                const alternative = result[j];

                // Access the transcript from SpeechRecognitionAlternative
                const { transcript } = alternative;

                // Log the transcript
                // console.log('Transcript:', transcript);

                // Update the transcript state
                setTranscript(transcript);

                // Update the full transcript only when isFinal is true and the transcript is not already processed
                if (isFinal && !uniqueTranscripts.has(transcript)) {
                  // Add the transcript to the Set
                  setUniqueTranscripts((prevSet) =>
                    new Set(prevSet).add(transcript),
                  );

                  transcriptionToSend += transcript; // + '\n'
                }
              }
            }
          };
          // Start the speech recognition
          recognitionRef.current.start();

          showInfo(
            `En train d'écouter ${bizProfileName} en ${bizProfileLanguage}`,
          );
          playBusinessBell();
        } else {
          const selectedOption = countries.find(
            (option) => option.value === clientProfileLanguage.toString(),
          );

          // console.log('selected option!' + JSON.stringify(selectedOption?.code));

          recognitionRef.current.lang = selectedOption?.code;

          // Event handler for speech recognition results
          recognitionRef.current.onresult = (event: any) => {
            const resultList = event.results;

            // Log the recognition results
            // console.log(resultList);

            // Iterate through each SpeechRecognitionResult
            for (let i = 0; i < resultList.length; i++) {
              const result = resultList[i];

              // Access isFinal from SpeechRecognitionResult
              const isFinal = result.isFinal;

              // If this is a new set of results, reset unique transcripts set
              // if (i === 0) {
              //   resetUniqueTranscripts();
              // }

              // Iterate through each SpeechRecognitionAlternative
              for (let j = 0; j < result.length; j++) {
                const alternative = result[j];

                // Access the transcript from SpeechRecognitionAlternative
                const { transcript } = alternative;

                // Log the transcript
                // console.log('Transcript:', transcript);

                // Update the transcript state
                setTranscript(transcript);

                // Update the full transcript only when isFinal is true and the transcript is not already processed
                if (isFinal && !uniqueTranscripts.has(transcript)) {
                  // Add the transcript to the Set
                  setUniqueTranscripts((prevSet) =>
                    new Set(prevSet).add(transcript),
                  );
                  transcriptionToSend += transcript; // + '\n'
                }
              }
            }
          };
          // Start the speech recognition
          recognitionRef.current.start();

          showInfo(
            `En train d'écouter ${clientProfileName} en ${clientProfileLanguage}`,
          );
          playClientBell();
        }
        audioTempRecord();

        wait(10000).then(() => {
          // Record voice for 10 seconds, then stop recording
          try {
            if (recognitionRef.current) {
              // Stop the speech recognition and mark recording as complete
              recognitionRef.current.stop();
            }
          } catch (error) {
            showError(
              'Error attempting to stop recording your microphone:' + error,
            );
          }
          setIsRecording(false);

          audioTempStop();
          playSuccessBell();
        });

        id++;
      } else {
        clearInterval(intervalId);
      }
    }, 30000);

    const intervalIdd = setInterval(async () => {
      if (audioSegment) {
        if (tempChunksRef.current.length > 0) {
          // let mp3Blob = new Blob(tempChunksRef.current, {
          //   type: 'audio/mp3',
          // });
          // var mp3fromblob = new File([mp3Blob], 'output.mp3');

          // const url = 'https://api.openai.com/v1/audio/transcriptions'; // https://platform.openai.com/docs/api-reference/audio/create
          // const transcribe = async () => {
          //   const formData = new FormData();
          //   formData.append('file', mp3fromblob);
          //   formData.append('model', 'whisper-1'); // https://platform.openai.com/docs/api-reference/audio/create
          //   formData.append('response_format', 'verbose_json');
          //   formData.append('language', 'fr');
          //   const headers = new Headers();
          //   headers.append(
          //     'Authorization',
          //     'Bearer ' + process.env.NEXT_PUBLIC_OPENAI_SECRET,
          //   );

          //   // await postTranscriptionData(url, formData, headers);
          //   const response = await postTranscriptionData(
          //     url,
          //     formData,
          //     headers,
          //   );
          //   newTranscriptionToAdd = response.text;
          //   // Add recorded audio to already existing transcription
          //   try {
          //     updateText(newTranscriptionToAdd);
          //   } catch (e) {
          //     console.log('KO' + e);
          //   }

          //   return newTranscriptionToAdd;
          // };

          // // Transcribe speech to text
          // await transcribe();

          // Translate text based on user profile
          // `Translate the following text from ${srcLanguage} to ${dstLanguage}: "${text}"\n\n${srcLanguage}: ${text}\n${dstLanguage}:`;
          if (isFirstAction == true) {
            srcLanguage = bizProfileLanguage;
            dstLanguage = clientProfileLanguage;
            isFirstAction = false;
          } else {
            srcLanguage = clientProfileLanguage;
            dstLanguage = bizProfileLanguage;
            isFirstAction = true;
          }

          const prompt = `First, clean up the following person's speech to make everything logical and clear (for example: delete repetitive words): "${transcriptionToSend}"\nThen, translate the result from ${srcLanguage} to ${dstLanguage}:`;
          const response = await postTranslationData(
            '/api/openai/translate',
            prompt,
            userBearer,
          );
          const data = JSON.stringify(response.data);

          transcriptionToSend = '';

          // Listen to translated text
          try {
            if (id % 2 == 1) {
              const dataToSend: string = `${selectedClientVoiceGender}/${data}`;
              await fetch(ttsOpenAIurl, {
                body: JSON.stringify(dataToSend),
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                  authorization: `Bearer ${userBearer}`,
                },
                method: 'POST',
              });
            } else {
              const dataToSend: string = `${selectedBizVoiceGender}/${data}`;
              await fetch(ttsOpenAIurl, {
                body: JSON.stringify(dataToSend),
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                  authorization: `Bearer ${userBearer}`,
                },
                method: 'POST',
              });
            }
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
                  headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    authorization: `Bearer ${userBearer}`,
                  },
                  method: 'GET',
                });
              });

              setIsTtsReady(true);
              audio.play();
            } else {
              console.error('Failed to fetch audio:', response.statusText);
            }
          } catch (e) {
            showError('Failed text to speech:' + JSON.stringify(e));
          }

          tempChunksRef.current = []; // clear audio data
          // resetUniqueTranscripts();
        }
      } else {
        clearInterval(intervalIdd);
      }
    }, 10000);

    // When the component unmounts
    return () => clearInterval(intervalId);
  }, [audioSegment]);

  // TTS
  const [ttsTransriptionBtnLoading, setTtsTransriptionBtnLoading] =
    useState<boolean>(false);
  const [isTtsReady, setIsTtsReady] = useState<boolean>(false);
  async function handleTranscriptionListen() {
    try {
      setTtsTransriptionBtnLoading(true);
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
        audio.play();
      } else {
        console.error('Failed to fetch audio:', response.statusText);
      }
      setTtsTransriptionBtnLoading(false);
    } catch (e) {
      showError('Failed text to speech:' + JSON.stringify(e));
    }
  }

  return (
    <div className="form-container text-center">
      {dataFetched ? (
        userSubscription === 'paid' ? (
          hasUserStripeAssistant ? (
            <div>
              <div className="grid grid-cols-1 items-center justify-center gap-10 lg:grid-cols-2 xl:min-h-[800px]">
                {/* Business Profile */}
                <div className="order-1 flex items-center justify-center p-6 xl:order-2 xl:p-10">
                  <div className="mx-auto w-[350px] space-y-6">
                    <div className="space-y-2 text-center text-lg">
                      Profil professionnel
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="mt-4 flex flex-col items-center justify-center">
                          <span className="p-float-label block">
                            <InputText
                              id="username"
                              value={bizProfileName}
                              onChange={(e) =>
                                setBizProfileName(e.target.value)
                              }
                              placeholder="Nom"
                              keyfilter={/^[a-z ,.'-]+$/i}
                            />
                          </span>
                        </div>
                        <div className="card justify-content-center flex">
                          <Dropdown
                            value={selectedBizCountry}
                            onChange={(e: DropdownChangeEvent) =>
                              setSelectedBizCountry(e.value)
                            }
                            options={countries}
                            optionLabel="label"
                            placeholder="Langue"
                            filter
                            valueTemplate={handleBizCountry}
                            itemTemplate={countryOptionTemplate}
                            className="md:w-13rem mt-3 w-full"
                          />
                        </div>
                        <div className="card justify-content-center flex">
                          <Dropdown
                            value={selectedBizVoiceGender}
                            onChange={(e: DropdownChangeEvent) =>
                              setSelectedBizVoiceGender(e.value)
                            }
                            options={voiceGenders}
                            optionLabel="label"
                            placeholder="Voix"
                            filter
                            valueTemplate={handleBizVoiceGender}
                            itemTemplate={voiceGenderOptionTemplate}
                            className="md:w-13rem mt-3 w-full"
                          />
                        </div>
                        {/* <div>
                          <select
                            className="mr-2 rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-900"
                            onChange={handleBizProfile}
                            value={bizProfileLanguage}
                          >
                            {languages.map((bizProfileLanguage) => (
                              <option
                                key={bizProfileLanguage.value}
                                value={bizProfileLanguage.value}
                              >
                                {bizProfileLanguage.label}
                              </option>
                            ))}
                          </select>
                        </div> */}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client Profile */}
                <div className="order-2 flex items-center justify-center p-6 xl:order-1 xl:p-10">
                  <div className="mx-auto w-[350px] space-y-6">
                    <div className="space-y-2 text-center text-lg">
                      Profil client
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="mt-4 flex flex-col items-center justify-center">
                          <span className="p-float-label block">
                            <InputText
                              id="username"
                              value={clientProfileName}
                              onChange={(e) =>
                                setClientProfileName(e.target.value)
                              }
                              placeholder="Nom"
                              keyfilter={/^[a-z ,.'-]+$/i}
                            />
                          </span>
                        </div>
                        <div className="card justify-content-center flex">
                          <Dropdown
                            value={selectedClientCountry}
                            onChange={(e: DropdownChangeEvent) =>
                              setSelectedClientCountry(e.value)
                            }
                            options={countries}
                            optionLabel="label"
                            placeholder="Langue"
                            filter
                            valueTemplate={handleClientCountry}
                            itemTemplate={countryOptionTemplate}
                            className="md:w-13rem mt-3 w-full"
                          />
                        </div>
                        <div className="card justify-content-center flex">
                          <Dropdown
                            value={selectedClientVoiceGender}
                            onChange={(e: DropdownChangeEvent) =>
                              setSelectedClientVoiceGender(e.value)
                            }
                            options={voiceGenders}
                            optionLabel="label"
                            placeholder="Voix"
                            filter
                            valueTemplate={handleClientVoiceGender}
                            itemTemplate={voiceGenderOptionTemplate}
                            className="md:w-13rem mt-3 w-full"
                          />
                        </div>
                        {/* <div>
                          <select
                            className="mr-2 rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-900"
                            onChange={handleClientProfile}
                            value={clientProfileLanguage}
                          >
                            {languages.map((clientProfileLanguage) => (
                              <option
                                key={clientProfileLanguage.value}
                                value={clientProfileLanguage.value}
                              >
                                {clientProfileLanguage.label}
                              </option>
                            ))}
                          </select>
                        </div> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-step">
                {!permission ? (
                  <Button
                    onClick={getMicrophonePermission}
                    label="Modifier les permissions d'accès au microphone"
                    outlined
                    // raised
                    className="mb-5"
                  />
                ) : (
                  <div>
                    {/* <Toast ref={toast} /> */}

                    <SplitButton
                      label="Enregistrer"
                      icon="pi pi-microphone"
                      onClick={handleRecordClick}
                      model={splitButtonModel}
                      loading={splitButtonLoading}
                      outlined
                    />
                    <br />
                    {audioIsReady ? (
                      <Button
                        onClick={handleDownloadClick}
                        // disabled={chunksRef.current.length === 0}
                        label="Télécharger l'enregistrement vocal"
                        outlined
                        size="small"
                        className="mb-2 mt-2"
                        // raised
                      />
                    ) : (
                      <p className="my-2 text-sm text-gray-500 dark:text-gray-300">
                        {/* https://platform.openai.com/docs/api-reference/audio/create */}
                        Commencez l'enregistrement vocal, puis arrêtez le comme
                        souhaité
                      </p>
                    )}
                    <br />
                    <div className="space-y-2 text-center text-lg">
                      Retranscription
                    </div>

                    <br />
                    {isTtsReady ? (
                      <Button
                        icon="pi pi-microphone"
                        rounded
                        outlined
                        onClick={handleTranscriptionListen}
                        className="mb-2"
                        loading={ttsTransriptionBtnLoading}
                      />
                    ) : (
                      <Button
                        icon="pi pi-microphone"
                        rounded
                        outlined
                        className="mb-2"
                        disabled
                      />
                    )}
                    <p className="my-2 text-sm text-gray-500 dark:text-gray-300">
                      {/* https://platform.openai.com/docs/api-reference/audio/create */}
                      Ecouter vos paroles traduites dans la langue maternelle de
                      votre interlocut(eur/trice)
                    </p>

                    <br />

                    <Toast ref={toast} />
                    <h2 className="mb-3">
                      <div className="relative overflow-hidden rounded-lg border-2 border-gray-300 dark:border-gray-600">
                        <div className="h-64 w-full border-none py-2 pl-3 pr-7 text-lg leading-6">
                          <ScrollPanel
                            style={{ width: '100%', height: '100%' }}
                          >
                            {transcript && (
                              <div className="h-full pb-2">
                                <p>Temps réel: {transcript}</p>
                              </div>
                            )}
                            <p className="mb-2">
                              Complète: {uniqueTranscripts}
                            </p>
                          </ScrollPanel>
                        </div>
                      </div>
                    </h2>
                    <p className="my-2 text-sm text-gray-500 dark:text-gray-300">
                      {/* https://platform.openai.com/docs/api-reference/audio/create */}
                      Veuillez noter la possibilité de télécharger votre
                      enregistrement vocal dès lorsque celui-ci sera arrêté
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <p className="font-small text-black-500 text-x2">
                Non autorisé(e)
              </p>{' '}
              <p className="font-small text-black-500 text-x2">
                Vous n'avez pas l'abonnement requis pour accéder à ce widget.
                Veuillez contacter un administrateur si cette situation est
                anormale, ou{' '}
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
          <div>
            <p className="font-small text-black-500 text-x2">Non autorisé(e)</p>{' '}
            <p className="font-small text-black-500 text-x2">
              Vous n'êtes pas reconnu comme client(e) ayant minimum un
              abonnement mensuel. Veuillez contacter un administrateur si cette
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
