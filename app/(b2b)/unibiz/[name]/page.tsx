'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { AppContext, appContext } from '@/types/appContext';
import { SkeletonCard } from '@/ui/SkeletonCard';

export default function CompanyName() {
  // App Context
  const [companyBasedBizUrl, setCompanyBasedBizUrl] = useState('');
  const getJWTdataUrl: string = appContext.appUrl + '/api/auth/getJWTdata';

  // Router
  const params = useParams();
  // const searchParams = useSearchParams();
  // <p>param: {params?.name}</p>
  // <p>search params with id only: {searchParams?.get('id')}</p>;

  // Get JWT data from user token
  const [userSubscription, setUserSubscription] = useState('');
  const [hasUserStripeBiz, setHasUserStripeBiz] = useState(false);
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
        setUserSubscription(data.userPrismaSubscription);
        setHasUserStripeBiz(data.userPrismaBizNetwork);
        setCompanyBasedBizUrl(
          '/unibiz/' + params?.name + '/digitalbusinesscard',
        );
        // set dataFetched to true after successful fetch (to avoid displaying temporary information that are not totally valid)
        // ie: user has paid subscription + corresponding feature but has the "Not authorized: ..." message due to fetchJWTData() not terminated
        setDataFetched(true);
      } catch (error) {
        console.error('Error fetching jwt data:', error);
      }
    };
    fetchJWTData();
  }, []);

  return (
    <div style={{ padding: '1.75rem' }}>
      <h1 className="text-xl font-bold">
        Présentation de l'entreprise {params?.name}
      </h1>
      <br />
      {dataFetched ? (
        userSubscription === 'paid' ? (
          hasUserStripeBiz ? (
            <div>
              <p className="font-small text-black-500 text-x2">
                Information: cette page est accessible que par les entreprises
                collaboratrices du réseau d'affaires.
              </p>
              <br />
              <p>Présentation de l'entreprise {params?.name}...</p>
              <Link
                href={companyBasedBizUrl}
                className="font-small leading-6 text-indigo-600 hover:text-indigo-500"
              >
                Cliquez ici pour accéder à la carte de visite digitale
              </Link>
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
