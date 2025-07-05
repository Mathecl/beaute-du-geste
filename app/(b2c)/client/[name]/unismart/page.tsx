'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { AppContext, appContext } from '@/types/appContext';
import { SkeletonCard } from '@/ui/SkeletonCard';

export default function Unismart() {
  // App Context
  const [companyBasedRealTimeUrl, setCompanyBasedRealTimeUrl] = useState('');
  const [companyBasedOnDemandUrl, setCompanyBasedOnDemandUrl] = useState('');
  const getJWTdataUrl: string = appContext.appUrl + '/api/auth/getJWTdata';
  const getVerifyShareId: string =
    appContext.appUrl + '/api/auth/verifyShareId';

  // Router
  const params = useParams();
  const searchParams = useSearchParams();
  // <p>param: {params?.name}</p>
  // <p>search params with id only: {searchParams?.get('id')}</p>;

  // Get JWT data from user token
  const [userCompany, setUserCompany] = useState('');
  const [userSubscription, setUserSubscription] = useState('');
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
        const data = await response.json();
        // console.log(data);
        setUserCompany(data.userPrismaCompany.toLowerCase());
        setUserSubscription(data.userPrismaSubscription);

        // set dataFetched to true after successful fetch (to avoid displaying temporary information that are not totally valid)
        // ie: user has paid subscription + corresponding feature but has the "Not authorized: ..." message due to fetchJWTData() not terminated
        setDataFetched(true);

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

            setCompanyBasedRealTimeUrl(
              '/client/' + sidData.replace(/"/g, '') + '/unismart/realtime',
            );
            setCompanyBasedOnDemandUrl(
              '/client/' + sidData.replace(/"/g, '') + '/unismart/ondemand',
            );
          } else {
            setCompanyBasedRealTimeUrl(
              '/client/' +
                data.userPrismaCompany.toLowerCase() +
                '/unismart/realtime',
            );
            setCompanyBasedOnDemandUrl(
              '/client/' +
                data.userPrismaCompany.toLowerCase() +
                '/unismart/ondemand',
            );
          }
        }
      } catch (error) {
        console.error('Error fetching jwt data:', error);
      }
    };
    fetchJWTData();
  }, []);

  return (
    <div style={{ padding: '1.75rem' }}>
      <h1 className="text-xl font-bold">Unismart</h1>
      <br />
      {dataFetched ? (
        userSubscription === 'paid' ? (
          userCompany === params?.name ||
          (isSidCorrect == true && params?.name == companyFromSid) ? (
            <div>
              <ul>
                <li>
                  <Link
                    href={companyBasedRealTimeUrl}
                    className="font-small leading-6 text-indigo-600 hover:text-indigo-500"
                  >
                    Traducteur vocal instantané
                  </Link>
                </li>
                <li>
                  <Link
                    href={companyBasedOnDemandUrl}
                    className="font-small leading-6 text-indigo-600 hover:text-indigo-500"
                  >
                    Traducteur de fichier et de texte
                  </Link>
                </li>
              </ul>
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
