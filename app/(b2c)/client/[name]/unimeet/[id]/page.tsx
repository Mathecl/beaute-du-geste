'use client';
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import {
  selectPeers,
  selectIsConnectedToRoom,
  useHMSStore,
  useHMSActions,
  useAVToggle,
} from '@100mslive/react-sdk';
import Peer from '@/ui/unimeet/Peer';

import { AppContext, appContext } from '@/types/appContext';
import { SkeletonCard } from '@/ui/SkeletonCard';

export default function MeetId() {
  // APP CONTEXT
  // ===========
  // App urls
  const getJWTdataUrl: string = appContext.appUrl + '/api/auth/getJWTdata';
  const verifyMeetConfigUrl: string =
    appContext.appUrl + '/api/meet/verifyMeetId';
  // Router
  const params = useParams();
  // const searchParams = useSearchParams();
  // <p>param: {params?.name}</p>
  // <p>search params with id only: {searchParams?.get('id')}</p>;

  // Get JWT data from user token
  const [userSubscription, setUserSubscription] = useState('');
  const [userCompany, setUserCompany] = useState('');
  const [hasUserStripeMeet, setHasUserStripeMeet] = useState(false);
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

        setUserCompany(data.userPrismaCompany.toLowerCase());
        setUserSubscription(data.userPrismaSubscription);
        setHasUserStripeMeet(data.userPrismaStripeMeet);

        // Todo: insert the function from meet configuration here
        await verifyMeetConfig(params?.id, data.jwt);

        // set dataFetched to true after successful fetch (to avoid displaying temporary information that are not totally valid)
        // ie: user has paid subscription + corresponding feature but has the "Not authorized: ..." message due to fetchJWTData() not terminated
        setDataFetched(true);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchJWTData();
  }, []);

  // MEET CONFIGURATION
  // ==================
  const [isMeetConfOk, setIsMeetConfOk] = useState<boolean>(false);
  const [isMeetPrivate, setIsMeetPrivate] = useState<boolean>(false);
  const [meetLanguage, setMeetLanguage] = useState<string>('');

  async function verifyMeetConfig(mid: any, jwt: any) {
    const dataToVerify: string = `${mid},${jwt}`;
    const midRes = await fetch(verifyMeetConfigUrl, {
      body: JSON.stringify(dataToVerify),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        authorization: `Bearer ${jwt}`,
      },
      method: 'POST',
    });

    const midData = await midRes.json();

    if (midRes.status == 200) {
      setIsMeetConfOk(true);
      setIsMeetPrivate(midData.Private);
      setMeetLanguage(midData.Language);
    } else {
      setIsMeetConfOk(false);
    }
  }

  // MEET PEERS
  // ==========
  const peers = useHMSStore(selectPeers);
  const userCount = peers.length;
  const hmsActions = useHMSActions();
  const { isLocalAudioEnabled, toggleAudio, isLocalVideoEnabled, toggleVideo } =
    useAVToggle();
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
      {dataFetched ? (
        userSubscription === 'paid' ? (
          hasUserStripeMeet ? (
            <div>
              {isMeetConfOk ? (
                <div>
                  {isMeetPrivate &&
                  params?.name === userCompany.toLowerCase() ? (
                    <p>
                      Meet privée {params.id} de l'entreprise {userCompany}
                    </p>
                  ) : (
                    <p>Meet publique {params.id}</p>
                  )}
                  <br />
                  <span className="button_name">{userCount} participants</span>

                  <br />
                  {peers.map((peer) => (
                    <Peer key={peer.id} peer={peer}></Peer>
                  ))}
                  <br />

                  <div className="control-bar">
                    <button className="btn-control" onClick={toggleAudio}>
                      {isLocalAudioEnabled ? 'Mute' : 'Unmute'}
                    </button>
                    <button className="btn-control" onClick={toggleVideo}>
                      {isLocalVideoEnabled ? 'Hide' : 'Unhide'}
                    </button>
                    <button onClick={() => hmsActions.leave()}>Leave</button>
                  </div>
                </div>
              ) : (
                <p>
                  Ce meet semble soit ne pas avoir été créé, soit pas encore
                  commencé, soit terminé.
                </p>
              )}
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
