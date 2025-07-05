'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// import {
//   openDB,
//   isDBEmpty,
//   storeMP3Blob,
//   getMP3Blob,
//   clearDB,
//   useIndexedDBEffect,
// } from '@/utils/indexeddbManager';

import { postTranslationData } from '@/utils/openai/postTranslationData';
import { AppContext, appContext } from '@/types/appContext';
import languagesiso from '@/utils/openai/languagesiso';

import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { ScrollPanel } from 'primereact/scrollpanel';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';

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
let transcriptionToCopy: string = '';
let hasInterpreterStoppedTalking: boolean = false;
let hasUserStoppedRecording: boolean = false;
let audioToDownload = '';
let id: number = 1;

export default function InterpreterPC() {
  // =======
  // CONTEXT
  // =======
  // App wait system
  const wait = (milliseconds: number) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  };

  // App Context
  const getJWTdataUrl: string = appContext.appUrl + '/api/auth/getJWTdata';
  const ttsOpenAIurl: string = appContext.appUrl + '/api/openai/textToSpeech';
  const playSoundsUrl: string = appContext.appUrl + '/api/openai/playSounds';
  const deleteSoundsUrl: string = appContext.appUrl + '/api/openai/deleteSound';
  const updateTokenUsageUrl: string =
    appContext.appUrl + '/api/auth/updateTokenUsage';
  const createDocxUrl: string = appContext.appUrl + '/api/smart/generateDocx';

  // App router & navigation
  const router = useRouter();

  // App confirm dialogue
  const [visible, setVisible] = useState<boolean>(false);
  const dialogMessage = <p>Souhaitez-vous télécharger l'audio ?</p>;
  const accept = () => {
    audioToDownload = 'true';
  };
  const reject = () => {
    audioToDownload = 'false';
  };

  // Get JWT data from user token
  // const [userCompany, setUserCompany] = useState('');
  // const [userRole, setUserRole] = useState('');
  const [tokenUsageDate, setUsageTokenDate] = useState(0);
  const [userBearer, setUserBearer] = useState('');
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
        setBizProfileName(data.userPrismaName);
        setBizProfileLanguage(data.userPrismaLanguage);
        setSelectedBizCountry(data.userPrismaLanguage);
        setSelectedBizVoiceGender(data.userPrismaVoice);
      } catch (error) {
        console.error('Error fetching jwt data:', error);
      }
    };
    fetchJWTData();
  }, []);

  // Is mobile ?
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
  const showSuccess = (message) => {
    toast.current.show({
      severity: 'success',
      summary: 'Succès',
      detail: message,
    });
  };

  // UI & UX
  const [recordingButtonLoading, setRecordingButtonLoading] = useState(false);
  const [audioIsReady, setAudioIsReady] = useState(false);

  // ======
  // SOUNDS
  // ======
  // Function to play sounds
  function playBusinessBell() {
    var audio = new Audio('/bellBusinessProfile.mp3');

    if (isMobile) {
      // mitigate iOS-specific compatibility issues
      document.addEventListener('touchstart', function () {
        audio.play();
      });
    } else {
      audio.play();
    }
  }
  function playClientBell() {
    var audio = new Audio('/bellClientProfile.mp3');
    audio.play();

    if (isMobile) {
      // mitigate iOS-specific compatibility issues
      document.addEventListener('touchstart', function () {
        audio.play();
      });
    } else {
      audio.play();
    }
  }
  function playSuccessBell() {
    var audio = new Audio('/bellSuccess.mp3');
    audio.play();

    if (isMobile) {
      // mitigate iOS-specific compatibility issues
      document.addEventListener('touchstart', function () {
        audio.play();
      });
    } else {
      audio.play();
    }
  }

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
  const switchInfos = () => {
    setBizProfileName(clientProfileName);
    setClientProfileName(bizProfileName);

    setSelectedBizCountry(selectedClientCountry);
    setSelectedClientCountry(selectedBizCountry);

    setSelectedBizVoiceGender(selectedClientVoiceGender);
    setSelectedClientVoiceGender(selectedBizVoiceGender);
  };

  // =========
  // REAL-TIME
  // =========
  // Audio Recorder
  const [isRecordForDl, setIsRecordingForDl] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const chunksRef = useRef<Blob[]>([]);

  const handleRecordClick = async () => {
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
      selectedBizCountry === undefined ||
      selectedBizVoiceGender === null ||
      selectedBizVoiceGender === undefined
    ) {
      showError('Veuillez vérifier que tous les champs soient bien remplis');
    } else {
      try {
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

        setIsRecording(!isRecording);
        hasUserStoppedRecording = false;
        hasInterpreterStoppedTalking = false;
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            facingMode: 'user', // prioritize the user-facing microphone on a phone device ('environment' can also be used for the rear-facing microphone)
          },
        });

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

        if (id % 2 == 1) {
          playBusinessBell();
          showInfo(
            `${bizProfileName}, veuillez parler en ${bizProfileLanguage}`,
          );
        } else {
          playClientBell();
          showInfo(
            `${clientProfileName}, veuillez parler en ${clientProfileLanguage}`,
          );
        }
        startRecording();
        setIsRecordingForDl(true);
        setRecordingButtonLoading(true);
        setAudioIsReady(false);
        // showInfo("L'enregistrement et la retranscription ont commencé");
      } catch (error) {
        showError('Error attempting to record your microphone:' + error);
      }
    }
  };
  const handleStopClick = () => {
    if (mediaRecorderRef.current && isRecordForDl) {
      try {
        mediaRecorderRef.current.stop();
        playSuccessBell();
        showSuccess("L'enregistrement et la retranscription sont terminés");
      } catch (error) {
        showError(
          'Error attempting to stop recording your microphone:' + error,
        );
      }
      stopRecording();
      setIsRecordingForDl(false);
      setIsRecording(false);
      setRecordingButtonLoading(false);
      setAudioIsReady(true);
    }
  };
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecordForDl) {
      try {
        mediaRecorderRef.current.stop();
        playSuccessBell();
        showSuccess("L'enregistrement et la retranscription sont terminés");
      } catch (error) {
        showError(
          'Error attempting to stop recording your microphone:' + error,
        );
      }
      stopRecording();
      hasUserStoppedRecording = true;
      setIsRecordingForDl(false);
      setIsRecording(false);
      setRecordingButtonLoading(false);
      setAudioIsReady(true);
    }
  };

  // ========
  // STT, TTS
  // ========
  // State variables to manage recording status, completion, and transcript
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastTranscriptUpdate, setLastTranscriptUpdate] = useState<number>(
    Date.now(),
  );
  // Reference to store the SpeechRecognition instance
  const recognitionRef = useRef<any>(null);
  const [uniqueTranscripts, setUniqueTranscripts] = useState(new Set<string>());
  // Simulated function to update transcript
  const updateTranscript = (newTranscript: string) => {
    setTranscript(newTranscript);
    setLastTranscriptUpdate(Date.now());
  };
  // Check every second if transcript has not been updated and act accordingly
  useEffect(() => {
    function update() {
      if (isRecording && Date.now() - lastTranscriptUpdate > 3000) {
        handleStopClick();
        setLastTranscriptUpdate(Date.now());
      }

      if (
        !hasUserStoppedRecording &&
        audioIsReady &&
        !isRecording &&
        hasInterpreterStoppedTalking
      ) {
        handleRecordClick();
      } else {
      }
    }

    const interval = setInterval(update, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [transcript, lastTranscriptUpdate]);
  // Function to reset the value to an empty set
  const resetUniqueTranscripts = () => {
    setUniqueTranscripts(new Set<string>());
  };

  // Function to start recording
  const startRecording = async () => {
    setIsRecording(true);

    let currentLang: string;

    if (id % 2 == 1) {
      currentLang = selectedBizCountry;
    } else {
      currentLang = selectedClientCountry;
    }

    transcriptionToSend = '';

    // Create a new SpeechRecognition instance and configure it
    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.playsInline = true; // https://stackoverflow.com/questions/72405566/cant-play-video-on-ios-in-safari-notallowederror-the-request-is-not-allowed-b

    const selectedOption = countries.find(
      (option) => option.value === currentLang.toString(),
    );

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
        if (i === 0) {
          resetUniqueTranscripts();
        }

        // Iterate through each SpeechRecognitionAlternative
        for (let j = 0; j < result.length; j++) {
          const alternative = result[j];

          // Access the transcript from SpeechRecognitionAlternative
          const { transcript } = alternative;

          // Update the transcript state
          updateTranscript(transcript);

          // Log the transcript
          // console.log('Transcript:', transcript);

          // Update the full transcript only when isFinal is true and the transcript is not already processed
          if (isFinal && !uniqueTranscripts.has(transcript)) {
            // Add the transcript to the Set
            setUniqueTranscripts((prevSet) =>
              new Set(prevSet).add(transcript + '\n'),
            );

            transcriptionToSend += transcript; // + '\n'
          }
        }
      }
    };

    id++;

    // Start the speech recognition
    recognitionRef.current.start();
  };
  // Cleanup effect when the component unmounts
  useEffect(() => {
    return () => {
      // Stop the speech recognition if it's active at page load
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        // resetUniqueTranscripts();
      }
    };
  }, []);
  // Function to stop recording
  const stopRecording = async () => {
    if (recognitionRef.current) {
      // Stop the speech recognition and mark recording as complete
      recognitionRef.current.stop();
      // resetUniqueTranscripts();

      let voiceGender;
      let voiceLang;

      if (id % 2 == 1) {
        voiceLang = bizProfileLanguage;
      } else {
        voiceLang = clientProfileLanguage;
      }

      if (
        transcriptionToSend !== null &&
        transcriptionToSend !== undefined &&
        transcriptionToSend !== ''
      ) {
        const prompt = `First, clean up the following person's speech to make everything logical and clear (for example: delete repetitive words): "${transcriptionToSend}"\nThen, translate the result in ${voiceLang} and only keep the translated text in ${voiceLang}, not the original one:`;
        const response = await postTranslationData(
          '/api/openai/translate',
          prompt,
          userBearer,
        );
        const data = JSON.stringify(response.data);

        transcriptionToCopy += data;
        transcriptionToSend = '';

        if (id % 2 == 1) {
          voiceGender = selectedClientVoiceGender;
        } else {
          voiceGender = selectedBizVoiceGender;
        }

        setUsageTokenDate(Date.now());

        const dataToSend: string = `${voiceGender}/${data}/${tokenUsageDate}`;
        await fetch(ttsOpenAIurl, {
          body: JSON.stringify(dataToSend),
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            authorization: `Bearer ${userBearer}`,
          },
          method: 'POST',
        });

        transcriptionToSend = '';

        const res = await fetch(playSoundsUrl, {
          body: JSON.stringify(tokenUsageDate),
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            authorization: `Bearer ${userBearer}`,
          },
          method: 'POST',
        });
        if (res.ok) {
          try {
            const audioBlob = await res.blob();

            // Display popup asking for user to automatically download audio or not
            setVisible(true);

            // Indefinitly loop as long as user does not respond
            while (audioToDownload == '') {
              await wait(1000);
              if (audioToDownload !== '') {
                break;
              }
            }

            // Create object URL from the blob
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);

            if (audioToDownload == 'true') {
              // Create anchor element
              const a = document.createElement('a');
              a.href = audioUrl;
              a.download = 'recording.mp3'; // Set the download attribute to specify the file name

              // Simulate click on the anchor element to trigger download
              showInfo("L'écoute et le téléchargement de l'audio commence");
              a.click();
              // Add event listener for the load event
              a.addEventListener('load', () => {
                showSuccess(`Le téléchargement de l'audio est terminé`);
              });
            }

            audio.addEventListener('ended', () => {
              hasInterpreterStoppedTalking = true;
              fetch(deleteSoundsUrl, {
                body: JSON.stringify(tokenUsageDate),
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                  authorization: `Bearer ${userBearer}`,
                },
                method: 'POST',
              });
              // Clean up by revoking the object URL
              URL.revokeObjectURL(audioUrl);
              showSuccess("Ecoute de l'audio terminée");
            });

            if (isMobile) {
              // mitigate iOS-specific compatibility issues
              document.addEventListener('touchstart', function () {
                audio.play();
              });
            } else {
              audio.play();
            }

            audioToDownload == '';
          } catch (e) {
            showError(
              `Une erreur est survenue en essayant d'écouter et/ou de télécharger l'audio: ${response.statusText}`,
            );
          }
        } else {
          console.error('Failed to fetch audio:', res.statusText);
        }
      }
    }
  };

  // Audio retranscription download
  const handleAudioRetranscription = async () => {
    const response = await fetch(createDocxUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${userBearer}`,
      },
      body: JSON.stringify({ textFromReq: transcriptionToCopy }),
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.docx';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Toast ref={toast} />
      <div className="mt-4 w-full">
        <Toast ref={toast} />
        <ConfirmDialog
          group="declarative"
          visible={visible}
          onHide={() => {
            reject; // Execute the reject function
            setVisible(false); // Set visible to false
          }}
          message={dialogMessage}
          header="Téléchargement"
          icon="pi pi-exclamation-triangle"
          accept={accept}
          acceptLabel="Oui"
          reject={reject}
          rejectLabel="Non"
          style={{ width: '50vw' }}
          breakpoints={{ '1100px': '75vw', '960px': '100vw' }}
        />

        <div className="flex  w-full flex-col justify-center gap-4 md:flex-row">
          {/* Left or Top div */}
          <div
            style={{ height: '75vh' }}
            className="unismartMobileWidth ml-4 rounded-[24px] bg-gray-200 p-4"
          >
            <h2 className="mb-6 text-center text-xl font-bold">Réglages</h2>
            <div className="profiles-container">
              <div className="mb-4 text-center">
                <h2 className="text-lg">Profil 1</h2>
                <div className="space-y-2">
                  <div className="mt-4 flex flex-col items-center justify-center">
                    <span className="p-float-label block">
                      <InputText
                        id="username"
                        value={bizProfileName}
                        onChange={(e) => setBizProfileName(e.target.value)}
                        placeholder="Nom"
                        keyfilter={/^[a-z ,.'-]+$/i}
                      />
                    </span>
                  </div>
                  <div className="card justify-content-center flex w-full">
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
                </div>
              </div>

              <div className="align-center flex w-full items-center justify-center">
                {isRecording ? (
                  <Button
                    icon="pi pi-arrow-right-arrow-left"
                    rounded
                    outlined
                    className="mb-5 mt-3"
                    disabled
                  />
                ) : (
                  <Button
                    icon="pi pi-arrow-right-arrow-left"
                    rounded
                    outlined
                    onClick={switchInfos}
                    className="mb-5 mt-3"
                  />
                )}
              </div>

              <div className="mb-4 text-center">
                <h2 className="text-lg">Profil 2</h2>
                <div className="space-y-2">
                  <div className="mt-4 flex flex-col items-center justify-center">
                    <span className="p-float-label block">
                      <InputText
                        id="username"
                        value={clientProfileName}
                        onChange={(e) => setClientProfileName(e.target.value)}
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
                </div>
                <div className="mt-4 w-full items-center justify-center text-center">
                  {isRecording ? (
                    <Button
                      icon="pi pi-stop"
                      rounded
                      outlined
                      onClick={handleStopRecording}
                    />
                  ) : (
                    <div>
                      <Button
                        icon="pi pi-microphone"
                        rounded
                        outlined
                        onClick={handleRecordClick}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Right or Bottom div */}
          <div
            style={{ height: '75vh' }}
            className="mr-4 w-full justify-between rounded-[24px] bg-gray-200 p-4 md:flex md:w-1/2 md:flex-col"
          >
            <div className="mb-4">
              <h2 className="text-center text-xl font-bold md:text-left">
                Traduction
              </h2>
              <div className="align-center mb-3 flex w-full justify-center text-center">
                <div className="mt-4 w-full">
                  <div className="h-auto overflow-hidden">
                    <div className="h-auto w-full border-none py-2 pl-3 pr-7 text-lg leading-6">
                      <ScrollPanel style={{ width: '100%', height: '100%' }}>
                        {(isRecording || transcript) && (
                          <div className="m-auto w-full ">
                            {transcript && (
                              <div className="mb-2">
                                <b>
                                  <p>Temps réelle:</p>
                                </b>
                                <p>{transcript}</p>
                                <br />
                                <br />
                                <b>
                                  <p>Complète:</p>
                                </b>
                                <p>{uniqueTranscripts}</p>
                              </div>
                            )}
                          </div>
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
              {audioIsReady && (
                <div>
                  {/* <Button
                      onClick={handleDownloadClick}
                      // disabled={chunksRef.current.length === 0}
                      label="Télécharger l'enregistrement audio"
                      outlined
                      size="small"
                      className="mr-3 mt-2"
                      // raised
                    /> */}
                  <Button
                    label="Copier le texte"
                    outlined
                    size="small"
                    className="mr-2 mt-4"
                    onClick={() => {
                      try {
                        navigator.clipboard.writeText(transcriptionToCopy);
                        showInfo('Traduction copiée');
                      } catch (error) {
                        showInfo(
                          'La copie de la traduction a échouée:' + error,
                        );
                      }
                    }}
                  />
                  <Button
                    label="Télécharger la retranscription audio"
                    outlined
                    size="small"
                    className="mt-4 "
                    onClick={handleAudioRetranscription}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
