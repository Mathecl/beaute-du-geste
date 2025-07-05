'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

import { AppContext, appContext } from '@/types/appContext';
import { SkeletonCard } from '@/ui/SkeletonCard';

import * as Ably from 'ably';
import {
  AblyProvider,
  useChannel,
  useConnectionStateListener,
} from 'ably/react';

import { ListBox, ListBoxChangeEvent } from 'primereact/listbox';
import { Toast } from 'primereact/toast';
import { Avatar } from 'primereact/avatar';
// import { AvatarGroup } from 'primereact/avatargroup'; //Optional for grouping
import { InputTextarea } from 'primereact/inputtextarea';
import { ScrollPanel } from 'primereact/scrollpanel';
import { Button } from 'primereact/button';

function generateHashFromStrings(str1, str2) {
  if (str1 && str2) {
    // Ensure str1 and str2 are sorted alphabetically to ensure consistency
    const sortedStrings = [str1, str2].sort();

    // Combine the sorted strings
    const combinedStr = sortedStrings.join('');

    let hash = 0;

    // Simple hashing algorithm (djb2)
    for (let i = 0; i < combinedStr.length; i++) {
      const char = combinedStr.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash &= hash; // Convert to 32bit integer
    }

    return hash.toString();
  }
}
function generateRandomCharacters(amount) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < amount; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
function replaceCharactersAfterHyphen(inputString) {
  // Split the string by the first occurrence of "-"
  const parts = inputString.split('-');

  // If there's at least one hyphen
  if (parts.length > 1) {
    // Generate three random characters
    const newCharacters = generateRandomCharacters(3);

    // Replace characters after the hyphen with the new ones
    parts[1] = newCharacters;

    // Join the parts back together with "-"
    return parts.join('-');
  } else {
    // If there's no hyphen, return the original string
    return inputString;
  }
}
function removeRandomCharacters(string) {
  const stringToReturn = string.split('-')[0];
  return stringToReturn;
}
function getFirstLetterInUppercase(string) {
  const stringToReturn = string.charAt(0).toUpperCase();
  return stringToReturn;
}
function formatDate(timestamp) {
  const date = new Date(timestamp);

  const formattedDate = date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const formattedDateTime = `${formattedDate}, ${formattedTime}`;

  return formattedDateTime;
}

const Chat = async (props) => {
  const { user, company } = props;

  // ====
  // ABLY
  // ====
  // Credentials
  const ablyApiKey = process.env.NEXT_PUBLIC_ABLY_API_KEY;
  const ablyClientId = process.env.NEXT_PUBLIC_ABLY_CLIENT_ID;
  // Connect to Ably using the AblyProvider component and API key
  const client = new Ably.Realtime({
    key: ablyApiKey,
  });

  return (
    <AblyProvider client={client}>
      <AblyPubSub user={user} company={company} />
    </AblyProvider>
  );
};

function AblyPubSub(props) {
  const { user, company } = props;

  // ===========
  // APP CONTEXT
  // ===========
  // Router
  const params = useParams();
  const searchParams = useSearchParams();
  // <p>param: {params?.name}</p>
  // <p>search params with id only: {searchParams?.get('id')}</p>;

  // Routes
  const getJWTdataUrl = appContext.appUrl + '/api/auth/getJWTdata';
  const listUserNamesUrl = appContext.appUrl + '/api/collab/listUserNames';
  // User data from JWT
  const [userName, setUserName] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userCompany, setUserCompany] = useState('');
  const [userSubscription, setUserSubscription] = useState('');
  const [hasUserUnicollab, setHasUserUnicollab] = useState(false);

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

        // Set user name and json data based on jwt result
        if (data.userPrismaName == undefined) {
          setUserName('Visiteur'); // -<3 random characters>
          setUserId('Visiteur'); // -<16 random characters>
        } else {
          setUserName(data.userPrismaName); // -<3 random characters>
          setUserCompany(data.userPrismaCompany);
          setUserSubscription(data.userPrismaSubscription);
          setHasUserUnicollab(data.userPrismaStripeCollab);
          setUserId(data.userPrismaStripeCustomerId); // -<16 random characters>

          // List all users of its company
          const res = await fetch(listUserNamesUrl, {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              authorization: `Bearer ${data.jwt}`,
            },
            method: 'GET',
          });
          const contactsData = await res.json();
          setContacts(contactsData);
        }

        setDataFetched(true);
      } catch (error) {
        console.log('Error fetching jwt data:', error);
      }
    };
    fetchJWTData();
  }, []);

  // App notification
  // Notification & modal
  const toast = useRef(null);

  const showInfo = (summary, detail, duration) => {
    toast.current.show({
      severity: 'info',
      summary: summary,
      detail: detail,
      life: duration,
    });
  };
  const showSuccess = (summary, detail, duration) => {
    toast.current.show({
      severity: 'success',
      summary: summary,
      detail: detail,
      life: duration,
    });
  };
  const showError = (summary, detail, duration) => {
    toast.current.show({
      severity: 'error',
      summary: summary,
      detail: detail,
      life: duration,
    });
  };

  // App UIUX
  const [isSendButtonLoading, setIsSendButtonLoading] = useState(false);
  const [isSendButtonDisabled, setIsSendButtonDisabled] = useState(true);

  // ====
  // ABLY
  // ====
  // PROCESS: CONTACT -> CHANNEL / CONVERSATIONUID -> CONNEXION -> HISTORY -> MESSAGE -> DECONNEXION

  // STORE MESSAGES, CONTACTS AND CONVERSATION UID
  const [userMessage, setUserMessage] = useState(''); // currently typed user message
  const [messages, setMessages] = useState([]); // current messages
  // console.log('messages:', messages);
  const [contacts, setContacts] = useState(null); // company-based contacts
  const [conversationUid, setConversationUid] = useState(null); // contact-based conversation
  const prevConversationuidRef = useRef();

  // HANDLE PROCESS FROM CONTACTS TO CONVERSATIONUID
  // - Make sure that selectedContact is not null
  // - Make sure that previous selectedContact is not equal to new one
  // - Generate UID from current user name and selected contact
  const [selectedContact, setSelectedContact] = useState(null);
  const prevSelectedContactRef = useRef();
  useEffect(() => {
    if (
      selectedContact !== null &&
      selectedContact !== prevSelectedContactRef.current
    ) {
      prevSelectedContactRef.current = selectedContact;

      try {
        // console.log('Selected contact:', selectedContact);
        // console.log(
        //   `Generating conversationuid for ${userId} and ${selectedContact.stripecustomerid}...`,
        // );
        const conversationUid = generateHashFromStrings(
          userId,
          selectedContact.stripecustomerid,
        );
        setConversationUid(conversationUid);
        // console.log(
        //   'Successfully generated conversation uid:' + conversationUid,
        // );
      } catch (e) {
        showError('Erreur', `Failed to generate conversationuid: ${e}`, 10000);
      }
    }
  }, [selectedContact]);

  // HANDLE PROCESS FROM CHANNEL AND CONNEXION TO DECONNEXION
  // Connect
  // useConnectionStateListener('connected', () => {
  //   console.log('Connected to Ably!');
  // });
  let isMessageSentByUser = false;

  useEffect(() => {
    dynamicallyCreateConversationUid();
  }, [conversationUid]);

  // const { initChannel } = useChannel(
  //   `${conversationUid}`,
  //   'message',
  //   async (message) => {
  //     console.log('convarsation uid (init channel):', conversationUid);
  //     console.log('message (init channel)', message);
  //     setMessages((previousMessages) => [...previousMessages, message]);

  //     if (message.id == userName) {
  //       isMessageSentByUser = true;
  //     } else {
  //       isMessageSentByUser = false;
  //     }
  //   },
  // );

  const ablyApiKey = process.env.NEXT_PUBLIC_ABLY_API_KEY;
  const realtime = new Ably.Realtime(ablyApiKey);
  let currentChannel;
  const [currentChannelAsState, setCurrentChannelAsState] = useState(null);

  async function dynamicallySendMessage() {
    try {
      setIsSendButtonLoading(true);

      // console.log(
      //   `Sending "${userMessage}" to ${currentChannelAsState.name} channel...`,
      // );

      setMessages((previousMessages) => [...previousMessages, userMessage]);
      await currentChannelAsState.publish({
        name: 'message',
        data: userMessage,
        id: userName + `-${generateRandomCharacters(3)}`,
      });
      setUserMessage('');
      // console.log(`Message successfully sent to channel`);

      setIsSendButtonLoading(false);
    } catch (e) {
      showError('Erreur', `Error while trying to send a message: ${e}`, 10000);
    }
  }
  async function dynamicallyCreateConversationUid() {
    if (
      conversationUid !== null &&
      conversationUid !== prevConversationuidRef.current
    ) {
      prevConversationuidRef.current = conversationUid;

      try {
        setIsSendButtonDisabled(true);

        // Create a channel called by the previously generated conversationUid and subscribe to all messages with the name 'message' using the useChannel hook
        // console.log('Channel not created yet:', currentChannel);
        currentChannel = realtime.channels.get(`${conversationUid}`);
        setCurrentChannelAsState(currentChannel);
        // console.log('Channel successfully created:', currentChannel);

        // console.log('Attaching and subscring to channel...');
        // Ensuring the channel is created in the Ably system and all messages published on the channel are received by any channel listeners registered using subscribe()
        await currentChannel.attach();
        // console.log('Successfully attached and subscribed to channel');

        const history = await currentChannel.history();
        const historyMessages = history.items;
        const historyLastMessage = historyMessages[0];
        // const lastMessageId = historyLastMessage.id;
        // const lastMessageData = historyLastMessage.data;

        setMessages((previousMessages) => [
          ...previousMessages,
          ...historyMessages, // Spread each message from historyMessages array
        ]);

        // Registers a listener for messages with a given event name on this channel
        await currentChannel.subscribe((message) => {
          // connectionId, data, id, name, timestamp;
          // console.log(`Message "${message.data}" successfully received`);
          setMessages((previousMessages) => {
            // Check if the message already exists in previousMessages
            if (
              message != '' &&
              !previousMessages.some((prevMessage) => prevMessage === message)
            ) {
              // If it doesn't exist, then add it to the messages array
              return [...previousMessages, message];
            }
            // If it already exists, return the previous messages array unchanged
            return previousMessages;
          });
        });
        // console.log(`Successfully subscribed to ${currentChannel} channel`);

        function handleUnload() {
          // console.log(`Unsubscring and detaching to channel...`);
          currentChannel.unsubscribe();
          currentChannel.detach();
          // console.log(`Channel successfully detached and unloaded`);
        }
        window.addEventListener('beforeunload', handleUnload);
        // console.log(
        //   'Added event listener to automatically unsubscribe and detech to channel at page unload',
        // );

        setIsSendButtonDisabled(false);
      } catch (error) {
        showError(
          'Erreur',
          `Error attaching/subscribing to channel and/or adding history to channel: ${error}`,
          10000,
        );
      }
    }
  }

  return (
    <div style={{ padding: '1.75rem' }}>
      <Toast ref={toast} />

      {dataFetched ? (
        userSubscription === 'paid' && hasUserUnicollab ? (
          userCompany.toLowerCase() === params?.name ? (
            <div className="flex h-full w-full flex-col md:flex-row">
              {/* Left Panel: Contacts */}
              <div className="bg-gray-200 p-4 md:w-1/4">
                <h2 className="mb-4 text-lg font-semibold">Contacts</h2>
                <div className="card justify-content-center flex">
                  <ListBox
                    filter
                    value={selectedContact}
                    onChange={(e) => {
                      setMessages([]);
                      setSelectedContact(e.value);
                    }}
                    options={contacts}
                    optionLabel="name"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Right Panel: Messages */}
              <div className="flex h-screen flex-col md:w-3/4">
                <div className="flex-1 overflow-y-auto bg-white p-4">
                  <div className="card">
                    <ScrollPanel style={{ width: '100%', height: '80%' }}>
                      {messages.map((message) => {
                        let userFromMessageId = message.id;
                        if (
                          userFromMessageId &&
                          userFromMessageId.includes('-')
                        ) {
                          userFromMessageId = userFromMessageId.split('-')[0];
                        } else {
                          return null;
                        }

                        const isCurrentUser = userFromMessageId === userName;
                        const alignClass = isCurrentUser ? 'justify-end' : '';
                        const messageClass = isCurrentUser
                          ? 'border-gray-200 bg-gray-100'
                          : 'border-purple-200 bg-purple-100';

                        return (
                          <div
                            key={message.id}
                            className={`mt-4 flex items-start gap-2.5 ${alignClass}`}
                          >
                            <Avatar
                              label={getFirstLetterInUppercase(message.id)}
                              style={{
                                backgroundColor: isCurrentUser
                                  ? '#f5f5f5'
                                  : '#9c27b0',
                                color: isCurrentUser ? '#000000' : '#ffffff',
                              }}
                            />
                            <div className="flex w-full max-w-[320px] flex-col gap-1">
                              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {removeRandomCharacters(message.id)}
                                </span>
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                  {formatDate(message.timestamp)}
                                </span>
                              </div>
                              <div
                                className={`leading-1.5 flex flex-col rounded-e-xl rounded-es-xl p-4 ${messageClass}`}
                              >
                                <p className="text-sm font-normal text-gray-900 dark:text-white">
                                  {message.data}
                                </p>
                              </div>
                              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                Envoyé
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </ScrollPanel>
                  </div>
                </div>

                {/* Bottom Right Panel: Input and Send Button */}
                <div className="flex border-t bg-gray-300 p-4">
                  <div className="card justify-content-center flex flex-grow">
                    {/* Render input field here */}
                    {isSendButtonDisabled ? (
                      <InputTextarea
                        autoResize
                        value={userMessage}
                        onChange={(e) => setUserMessage(e.target.value)}
                        rows={1}
                        cols={30}
                        placeholder="Ecrivez votre message ici"
                        disabled // This line is added when the button is disabled
                      />
                    ) : (
                      <InputTextarea
                        autoResize
                        value={userMessage}
                        onChange={(e) => setUserMessage(e.target.value)}
                        rows={1}
                        cols={30}
                        placeholder="Ecrivez votre message ici"
                      />
                    )}
                  </div>
                  {isSendButtonDisabled ? (
                    <Button
                      icon="pi pi-send"
                      rounded
                      aria-label="Envoyer"
                      onClick={dynamicallySendMessage}
                      className="ml-3"
                      disabled
                      loading={isSendButtonLoading}
                    />
                  ) : (
                    <Button
                      icon="pi pi-send"
                      rounded
                      aria-label="Envoyer"
                      onClick={dynamicallySendMessage}
                      className="ml-3"
                      loading={isSendButtonLoading}
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="font-small text-black-500 text-x2">
                Non autorisé(e)
              </p>{' '}
              <p className="font-small text-black-500 text-x2">
                Vous ne faîtes pas parti de l'entreprise {params?.name}. Si ce
                lien est partageable, veuillez vérifier que celui-ci est correct
                et/ou non expiré.
              </p>
            </div>
          )
        ) : (
          <div>
            <p className="font-small text-black-500 text-x2">Non autorisé(e)</p>{' '}
            <p className="font-small text-black-500 text-x2">
              Vous n'êtes pas reconnu comme client(e) ayant minimum un
              abonnement mensuel et/ou le widget Unicollab. Veuillez contacter
              un administrateur si cette situation est anormale, ou{' '}
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
        <div className="text-xl font-medium text-zinc-500">
          <SkeletonCard />
        </div>
      )}
    </div>
  );
}

export default Chat;
