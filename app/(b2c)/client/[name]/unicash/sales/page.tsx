'use client';
import React, { useState, useEffect, useRef, ChangeEvent } from 'react';

import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';

import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Chart } from 'primereact/chart';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Skeleton } from 'primereact/skeleton';

import { AppContext, appContext } from '@/types/appContext';
import { SkeletonCard } from '@/ui/SkeletonCard';

interface Period {
  name: string;
}

// Initialize arrays to hold formatted dates prices
let formattedDates;
let timeBasedPriceData = [];
let sumOfPrices = 0;

// Function to sum up the price entries
function sumPrices(data) {
  let totalSum = 0;

  // Iterate through the array
  for (const entry of data) {
    // Convert the price from string to number and add it to the total sum
    totalSum += parseFloat(entry.price);
  }

  return totalSum;
}

export default function UnicashSales() {
  // APP CONTEXT
  // ===========
  // App notification
  const toast = useRef(null);
  const showInfo = (summary: string, detail: string, duration: number) => {
    toast.current.show({
      severity: 'info',
      summary: summary,
      detail: detail,
      life: duration,
    });
  };
  const showSuccess = (summary: string, detail: string, duration: number) => {
    toast.current.show({
      severity: 'success',
      summary: summary,
      detail: detail,
      life: duration,
    });
  };
  const showError = (
    summary: string,
    detail: string | unknown,
    duration: number,
  ) => {
    toast.current.show({
      severity: 'error',
      summary: summary,
      detail: detail,
      life: duration,
    });
  };

  // App user JWT infos
  const [userJwt, setUserJwt] = useState('');

  const [userCompany, setUserCompany] = useState('');
  const [userCompanyNormalCase, setUserCompanyNormalCase] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userSubscription, setUserSubscription] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [hasUserStripeCash, setHasUserStripeCash] = useState(false);

  const [companyFromSid, setCompanyFromSid] = useState('');
  const [isSidCorrect, setIsSidCorrect] = useState(false);

  const [dataFetched, setDataFetched] = useState(false);

  // App backend urls
  const getJWTdataUrl: string = appContext.appUrl + '/api/auth/getJWTdata';
  const getVerifyShareId: string =
    appContext.appUrl + '/api/auth/verifyShareId';

  const deleteRedisKeyUrl: string =
    appContext.appUrl + '/api/redisUtils/delKey';

  const getCheckSalesRevenuesUrl: string =
    appContext.appUrl + '/api/unicash/sales/checkSalesRevenues';

  // App router & navigation
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // Employee selection dropdown for managers
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);
  const employees: Period[] = [
    { name: 'Journalier' },
    { name: 'Hebdomadaire' },
    { name: 'Mensuel' },
  ];

  const selectedPeriodTemplate = (option: Period, props) => {
    if (option) {
      return (
        <div className="align-items-center flex">
          <div>{option.name}</div>
        </div>
      );
    }

    return <span>{props.placeholder}</span>;
  };

  const periodOptionTemplate = (option: Period) => {
    return (
      <div className="align-items-center flex">
        <div>{option.name}</div>
      </div>
    );
  };

  // App jwt + employees work hours for managers
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});
  const [mounted, setMounted] = useState(true);
  useEffect(() => {
    try {
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
          setUserSubscription(data.userPrismaSubscription);
          setUserEmail(data.userPrismaEmail);
          setUserCompany(data.userPrismaCompany.toLowerCase());
          setUserCompanyNormalCase(data.userPrismaCompany);
          setUserRole(data.userPrismaRole);
          setHasUserStripeCash(data.userPrismaStripeCash);
          setUserJwt(data.jwt);

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
            }

            const salesResponse = await fetch(getCheckSalesRevenuesUrl, {
              body: JSON.stringify(`${selectedPeriod}|${userEmail}`),
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                authorization: `Bearer ${data.jwt}`,
              },
              method: 'POST',
            });
            const salesRevenuesData = await salesResponse.json();

            // Initialize arrays to hold formatted dates and working hours
            const formattedDates = [];
            const salesRevenues = [];

            // Iterate through each entry in the data array
            if (
              salesRevenuesData &&
              salesRevenuesData.data &&
              salesRevenuesData.data.historyTrackingData
            ) {
              const documentStyle = getComputedStyle(document.documentElement);
              const textColor = documentStyle.getPropertyValue('--text-color');
              const textColorSecondary = documentStyle.getPropertyValue(
                '--text-color-secondary',
              );
              const surfaceBorder =
                documentStyle.getPropertyValue('--surface-border');

              salesRevenuesData.data.historyTrackingData.forEach((entry) => {
                const data = {
                  labels: formattedDates,
                  datasets: [
                    {
                      type: 'line',
                      label: "Chiffre d'affaires",
                      backgroundColor:
                        documentStyle.getPropertyValue('--blue-500'),
                      data: salesRevenues,
                    },
                  ],
                };

                const options = {
                  stacked: false,
                  maintainAspectRatio: false,
                  aspectRatio: 0.6,
                  plugins: {
                    legend: {
                      labels: {
                        color: textColor,
                      },
                    },
                  },
                  scales: {
                    x: {
                      ticks: {
                        color: textColorSecondary,
                      },
                      grid: {
                        color: surfaceBorder,
                      },
                    },
                    y: {
                      type: 'linear',
                      display: true,
                      position: 'left',
                      ticks: {
                        color: textColorSecondary,
                      },
                      grid: {
                        color: surfaceBorder,
                      },
                    },
                    // y1: {
                    //   type: 'linear',
                    //   display: true,
                    //   position: 'right',
                    //   ticks: {
                    //     color: textColorSecondary,
                    //   },
                    //   grid: {
                    //     drawOnChartArea: false,
                    //     color: surfaceBorder,
                    //   },
                    // },
                  },
                };

                setChartData(data);
                setChartOptions(options);
              });
            } else {
              console.log('No data available');
            }
          }

          setDataFetched(true);
        } catch (error) {
          console.log(
            'Error fetching jwt data and/or displaying management-related content:',
            error,
          );
        }
      };
      fetchJWTData();
    } catch (error) {
      console.error('Error:', error);
    }
    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    try {
      // Reset values
      sumOfPrices = 0;
      timeBasedPriceData.length = 0;

      const fetchSalesRevenuesData = async () => {
        const salesResponse = await fetch(getCheckSalesRevenuesUrl, {
          body: JSON.stringify(`${selectedPeriod?.name},${userEmail}`),
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            authorization: `Bearer ${userJwt}`,
          },
          method: 'POST',
        });
        const salesRevenuesData = await salesResponse.json();

        // Iterate through each entry in the data array
        const documentStyle = getComputedStyle(document.documentElement);

        salesRevenuesData.data.timeBasedHistoryTrackingData.forEach((entry) => {
          if (selectedPeriod?.name === 'Journalier') {
            formattedDates = Array.from({ length: 25 }, (_, index) => index);
          } else if (selectedPeriod?.name === 'Hebdomadaire') {
            formattedDates = Array.from({ length: 7 }, (_, index) => index);
          } else if (selectedPeriod?.name === 'Mensuel') {
            formattedDates = Array.from({ length: 32 }, (_, index) => index);
          }

          // Calculate the total sum of prices
          sumOfPrices += sumPrices(entry.order.products);

          // Push summed prices to array
          timeBasedPriceData.push(sumOfPrices);

          const data = {
            labels: formattedDates,
            datasets: [
              {
                type: 'line',
                label: "Chiffre d'affaires",
                backgroundColor: documentStyle.getPropertyValue('--blue-500'),
                data: timeBasedPriceData,
              },
            ],
          };

          setChartData(data);
        });
      };
      fetchSalesRevenuesData();
    } catch (e) {
      console.error('Error:', error);
    }
  }, [selectedPeriod]);

  return (
    <div style={{ padding: '1.75rem' }}>
      <Toast ref={toast} />

      {dataFetched ? (
        userSubscription === 'paid' && hasUserStripeCash ? (
          (userRole == 'admin' && userCompany === params?.name) ||
          (isSidCorrect == true && params?.name == companyFromSid) ? (
            <div>
              <section>
                <div className="mx-auto max-w-screen-xl items-center gap-16 px-4 py-8 lg:grid lg:grid-cols-2 lg:px-6 lg:py-16">
                  <div className="font-light text-gray-500 dark:text-gray-400 sm:text-lg">
                    <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                      Chiffre d'affaires
                    </h2>
                    <br />
                    <div className="card">
                      <div className="card justify-content-center mb-4 flex">
                        <Dropdown
                          value={selectedPeriod}
                          onChange={(e: DropdownChangeEvent) =>
                            setSelectedPeriod(e.value)
                          }
                          options={employees}
                          optionLabel="name"
                          placeholder="Sélectionner une période de temps"
                          filter
                          valueTemplate={selectedPeriodTemplate}
                          itemTemplate={periodOptionTemplate}
                          className="md:w-14rem w-full"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mx-auto max-w-screen-xl items-center">
                    <div className="">
                      {chartData ? (
                        <div>
                          <Chart
                            type="line"
                            data={chartData}
                            options={chartOptions}
                          />
                        </div>
                      ) : (
                        <Skeleton width="21rem" height="40rem"></Skeleton>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <div>
              <p className="font-small text-black-500 text-x2">
                Non autorisé(e)
              </p>{' '}
              <p className="font-small text-black-500 text-x2">
                Vous ne faîtes pas parti de l'entreprise
                {params?.name} et/ou n'avez pas le rôle d'administrateur
                (gérant)
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
