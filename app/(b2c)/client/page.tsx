'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import { AppContext, appContext } from '@/types/appContext';
import { SkeletonCard } from '@/ui/SkeletonCard';

export default function Client() {
  // App Context
  const [companyBasedClientUrl, setCompanyBasedClientUrl] = useState('');
  const getJWTdataUrl: string = appContext.appUrl + '/api/auth/getJWTdata';

  // Router
  // const params = useParams();
  // const searchParams = useSearchParams();
  // <p>param: {params?.name}</p>
  // <p>search params with id only: {searchParams?.get('id')}</p>;

  // Get JWT data from user token
  const [userCompany, setUserCompany] = useState('');
  // const [userRole, setUserRole] = useState('');
  const [userSubscription, setUserSubscription] = useState('');
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
        setCompanyBasedClientUrl(
          '/client/' + data.userPrismaCompany.toLowerCase(),
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
      <h1 className="text-xl font-bold">Uniwork</h1>
      <br />
      {dataFetched ? (
        userSubscription === 'paid' ? (
          <div>
            <p className="font-small text-black-500 text-x2">
              Bienvenue sur l'espace client
            </p>
            <Link
              href={companyBasedClientUrl}
              className="font-small leading-6 text-indigo-600 hover:text-indigo-500"
            >
              Cliquez ici pour accéder à l'espace de travail de votre entreprise{' '}
              {userCompany}
            </Link>
          </div>
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
