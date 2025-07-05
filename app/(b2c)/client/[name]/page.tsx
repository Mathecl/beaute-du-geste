'use client';
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { AppContext, appContext } from '@/types/appContext';
import { SkeletonCard } from '@/ui/SkeletonCard';
import Chat from '@/ui/unicollab/chat/Chat';

export default function ClientName() {
  // App Context
  const [companyBasedUnitelligentUrl, setCompanyBasedUnitelligentUrl] =
    useState('');
  const [companyBasedUnidminUrl, setCompanyBasedUnidminUrl] = useState('');
  const [companyBasedUnimeetUrl, setCompanyBasedUnimeetUrl] = useState('');
  const [companyBasedUnicashUrl, setCompanyBasedUnicashUrl] = useState('');
  const [companyBasedUniworkUrl, setCompanyBasedUniworkUrl] = useState('');
  const getJWTdataUrl: string = appContext.appUrl + '/api/auth/getJWTdata';
  const getVerifyShareId: string =
    appContext.appUrl + '/api/auth/verifyShareId';

  // Router
  const params = useParams();
  const searchParams = useSearchParams();
  // <p>param: {params?.name}</p>
  // <p>search params with id only: {searchParams?.get('id')}</p>;

  // Get JWT data from user token
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
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
        setUserName(data.userPrismaName);
        setUserRole(data.userPrismaRole);
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

            setCompanyBasedUniworkUrl('/client/' + sidData.replace(/"/g, ''));
            setCompanyBasedUnitelligentUrl(
              '/client/' + sidData.replace(/"/g, '') + '/unismart',
            );
            setCompanyBasedUnidminUrl(
              '/client/' + sidData.replace(/"/g, '') + '/unidmin',
            );
            setCompanyBasedUnimeetUrl(
              '/client/' + sidData.replace(/"/g, '') + '/unimeet',
            );
            setCompanyBasedUnicashUrl(
              '/client/' + sidData.replace(/"/g, '') + '/unicash',
            );
          } else {
            setCompanyBasedUniworkUrl(
              '/client/' + data.userPrismaCompany.toLowerCase(),
            );
            setCompanyBasedUnitelligentUrl(
              '/client/' + data.userPrismaCompany.toLowerCase() + '/unismart',
            );
            setCompanyBasedUnidminUrl(
              '/client/' + data.userPrismaCompany.toLowerCase() + '/unidmin',
            );
            setCompanyBasedUnimeetUrl(
              '/client/' + data.userPrismaCompany.toLowerCase() + '/unimeet',
            );
            setCompanyBasedUnicashUrl(
              '/client/' + data.userPrismaCompany.toLowerCase() + '/unicash',
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
      <h1 className="text-xl font-bold">
        Votre espace entreprise {params?.name}
      </h1>
      <br />
      {dataFetched ? (
        userSubscription === 'paid' ? (
          userCompany === params?.name ||
          (isSidCorrect == true && params?.name == companyFromSid) ? (
            <div className="h-full w-full">
              <p className="font-small text-black-500 text-x2">
                Retrouvez ici le tableau de bord de votre entreprise{' '}
                {params?.name}.
                <br />
                <br />
                Widgets Unigate:
              </p>
              <ul>
                <li>
                  {' '}
                  <Link
                    href={companyBasedUnitelligentUrl}
                    className="font-small leading-6 text-indigo-600 hover:text-indigo-500"
                  >
                    Unismart: cliquez ici pour accéder aux widgets intelligents
                  </Link>
                </li>
                <li>
                  <Link
                    href={companyBasedUnidminUrl}
                    className="font-small leading-6 text-indigo-600 hover:text-indigo-500"
                  >
                    Unidmin: cliquez ici pour accéder au tableau de bord
                    d'administration informatique
                  </Link>
                </li>
                <li>
                  <Link
                    href={companyBasedUnimeetUrl}
                    className="font-small leading-6 text-indigo-600 hover:text-indigo-500"
                  >
                    Unimeet: cliquez ici pour accéder à l'outil de réunion
                  </Link>
                </li>
                {/* <li>
                  <Link
                    href="/unibiz"
                    className="font-small leading-6 text-indigo-600 hover:text-indigo-500"
                  >
                    Unibiz: réseau d'affaires, présentation et carte de visite
                    digitale de votre entreprise
                  </Link>
                </li> */}
              </ul>
              <br />
              {userRole === 'admin' && (
                <div>
                  Logiciel de gestion de restaurants Unicash:
                  <ul>
                    <li>
                      <Link
                        href={appContext.appUrl + '/unicash/' + userCompany}
                        className="font-small leading-6 text-indigo-600 hover:text-indigo-500"
                      >
                        Bornes de commande
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={companyBasedUnicashUrl}
                        className="font-small leading-6 text-indigo-600 hover:text-indigo-500"
                      >
                        Pointage des employés
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={companyBasedUnicashUrl + '/sales'}
                        className="font-small leading-6 text-indigo-600 hover:text-indigo-500"
                      >
                        Gestion du chiffre d'affaires
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={companyBasedUnicashUrl + '/supply'}
                        className="font-small leading-6 text-indigo-600 hover:text-indigo-500"
                      >
                        Gestion des stocks, recettes et approvisionnement
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={companyBasedUnicashUrl + '/cashdesk'}
                        className="font-small leading-6 text-indigo-600 hover:text-indigo-500"
                      >
                        Gestion des caisses
                      </Link>
                    </li>
                  </ul>
                </div>
              )}

              <br />
              <br />
              {/* <Chat user={userName} company={userCompany} /> */}
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
        <div className="text-xl font-medium text-zinc-500">
          <SkeletonCard />
        </div>
      )}
    </div>
  );
}
