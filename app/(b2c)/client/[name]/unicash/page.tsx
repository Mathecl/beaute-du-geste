'use client';
import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';

import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Chart } from 'primereact/chart';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';

import { AppContext, appContext } from '@/types/appContext';
import { SkeletonCard } from '@/ui/SkeletonCard';

interface Employee {
  name: string;
  email: string;
}

let isPinCodeCorrect = false;
// Convert date to ISO date
function convertDate(inputDate) {
  // Split the input date string by space to separate date and time
  const [dateStr, timeStr] = inputDate.split(' ');

  // Split the date string into day, month, and year
  const [day, month, year] = dateStr.split('/');

  // Create a date string in the format "YYYY-MM-DDTHH:MM:SS"
  const formattedDateStr = `${year}-${month}-${day}T${timeStr}`;

  // Create a Date object using the formatted date string
  const date = new Date(formattedDateStr);

  // Return the date in ISO format
  return date.toISOString();
}
// Function to calculate the difference in minutes between two date-time strings
function calculateDifferenceInMinutes(date1, date2) {
  // Parse the ISO date strings into Date objects
  const dateObj1 = new Date(date1);
  const dateObj2 = new Date(date2);

  // Calculate the difference in milliseconds
  const differenceInMilliseconds = dateObj2 - dateObj1;

  // Convert the difference from milliseconds to minutes
  const differenceInMinutes = differenceInMilliseconds / (1000 * 60);

  // Return the difference rounded to 2 decimal places as a number
  return parseFloat(differenceInMinutes.toFixed(2));
}

export default function Unicash() {
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

  const getListEmployeesUrl: string =
    appContext.appUrl + '/api/unicash/listUsersUnicash';

  const getCheckClockUrl: string =
    appContext.appUrl + '/api/unicash/clock/checkClock';
  const getVerifyPinCodeBeforeClockUrl: string =
    appContext.appUrl + '/api/unicash/clock/verifyPinCodeBeforeClock';
  const getClockInUrl: string =
    appContext.appUrl + '/api/unicash/clock/clockIn';
  const getBreakStartUrl: string =
    appContext.appUrl + '/api/unicash/clock/breakStart';
  const getBreakEndUrl: string =
    appContext.appUrl + '/api/unicash/clock/breakEnd';
  const getClockOutUrl: string =
    appContext.appUrl + '/api/unicash/clock/clockOut';

  // App router & navigation
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // Employee selection dropdown for managers
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [employees, setEmployees] = useState<Employee | null>([]);

  const selectedEmployeeTemplate = (option: Employee, props) => {
    if (option) {
      return (
        <div className="align-items-center flex">
          <div>{option.name}</div>
        </div>
      );
    }

    return <span>{props.placeholder}</span>;
  };

  const employeeOptionTemplate = (option: Employee) => {
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

            if (data.userPrismaRole == 'admin') {
              const listEmployeesRes = await fetch(getListEmployeesUrl, {
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                  authorization: `Bearer ${data.jwt}`,
                },
                method: 'GET',
              });
              const listEmployeesData = await listEmployeesRes.json();

              setEmployees(
                listEmployeesData.map((user) => ({
                  name: user.name,
                  email: user.email,
                })),
              );
            }

            const clockResponse = await fetch(getCheckClockUrl, {
              body: JSON.stringify(selectedEmployee),
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                authorization: `Bearer ${data.jwt}`,
              },
              method: 'POST',
            });
            const clockData = await clockResponse.json();

            // Initialize arrays to hold formatted dates and working hours
            const formattedDates = [];
            const workingHours = [];
            const breaksHours = [];

            // Iterate through each entry in the data array
            if (
              clockData &&
              clockData.data &&
              clockData.data.historyTrackingData
            ) {
              const documentStyle = getComputedStyle(document.documentElement);
              const textColor = documentStyle.getPropertyValue('--text-color');
              const textColorSecondary = documentStyle.getPropertyValue(
                '--text-color-secondary',
              );
              const surfaceBorder =
                documentStyle.getPropertyValue('--surface-border');

              clockData.data.historyTrackingData.forEach((entry) => {
                // Extract and format the date
                const date = new Date(entry.date);
                const formattedDate = `${String(date.getMonth() + 1).padStart(
                  2,
                  '0',
                )}-${String(date.getDate()).padStart(2, '0')}`;
                formattedDates.push(formattedDate);
                // console.log(`Dates: ${formattedDates}`);

                // Calculate the difference in minutes between clock-in and clock-out
                const clockIn = entry.clock[0].clockInDate;
                const clockOut = entry.clock[0].clockOutDate;
                const clockInISODate = convertDate(clockIn);
                // console.log('Clock in ISO date:', clockInISODate);
                const clockOutISODate = convertDate(clockOut);
                // console.log('Clock out ISO date:', clockOutISODate);
                const totalWorkTime = calculateDifferenceInMinutes(
                  `${clockInISODate}`,
                  `${clockOutISODate}`,
                );
                // console.log(
                //   `Work total time (without breaks): ${totalWorkTime.toFixed(
                //     2,
                //   )}`,
                // );

                // Calculate the sum of breaks in minutes
                // {"end":"25/04/2024 14:59:37","start":"25/04/2024 14:57:19"},{"end":"25/04/2024 14:57:37","start":"25/04/2024 14:58:19"}
                let totalBreaksInMinutes = 0;
                let breakStartISODate = '';
                let breakEndISODate = '';
                entry.clock[0].breaks.forEach((breakEntry) => {
                  breakStartISODate = convertDate(breakEntry.start);
                  breakEndISODate = convertDate(breakEntry.end);

                  const diffInMinutes = calculateDifferenceInMinutes(
                    breakStartISODate,
                    breakEndISODate,
                  );
                  totalBreaksInMinutes += diffInMinutes;

                  // totalBreaksInMinutes += calculateDifferenceInMinutes(
                  //   breakStartISODate,
                  //   breakEndISODate,
                  // );

                  // console.log(`Break start time: ${breakEntry.start}`);
                  // console.log(`Break end time: ${breakEntry.end}`);
                });
                // console.log(
                //   `Break total time: ${totalBreaksInMinutes.toFixed(2)}`,
                // );
                breaksHours.push(totalBreaksInMinutes.toFixed(2));

                // Calculate the working hours (difference minus breaks)
                const workingHour = totalWorkTime - totalBreaksInMinutes;
                workingHours.push(workingHour.toFixed(2));
                // console.log(
                //   `Work total time (minus breaks): ${workingHour.toFixed(2)}`,
                // );

                const data = {
                  labels: formattedDates,
                  datasets: [
                    {
                      type: 'bar',
                      label: 'Travail réel (hors pauses)',
                      backgroundColor:
                        documentStyle.getPropertyValue('--blue-500'),
                      data: workingHours,
                    },
                    {
                      type: 'bar',
                      label: 'Pauses',
                      backgroundColor:
                        documentStyle.getPropertyValue('--green-500'),
                      data: breaksHours,
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

            // Output the results
            // console.log('Formatted Dates:', formattedDates);
            // console.log('Working Hours:', workingHours);
            // console.log('Break Hours:', breaksHours);
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
      const fetchClockData = async () => {
        const clockResponse = await fetch(getCheckClockUrl, {
          body: JSON.stringify(selectedEmployee),
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            authorization: `Bearer ${userJwt}`,
          },
          method: 'POST',
        });
        const clockData = await clockResponse.json();

        // Initialize arrays to hold formatted dates and working hours
        const formattedDates = [];
        const workingHours = [];
        const breaksHours = [];

        // Iterate through each entry in the data array
        const documentStyle = getComputedStyle(document.documentElement);

        clockData.data.historyTrackingData.forEach((entry) => {
          // Extract and format the date
          const date = new Date(entry.date);
          const formattedDate = `${String(date.getMonth() + 1).padStart(
            2,
            '0',
          )}-${String(date.getDate()).padStart(2, '0')}`;
          formattedDates.push(formattedDate);
          // console.log(`Dates: ${formattedDates}`);

          // Calculate the difference in minutes between clock-in and clock-out
          const clockIn = entry.clock[0].clockInDate;
          const clockOut = entry.clock[0].clockOutDate;
          const clockInISODate = convertDate(clockIn);
          // console.log('Clock in ISO date:', clockInISODate);
          const clockOutISODate = convertDate(clockOut);
          // console.log('Clock out ISO date:', clockOutISODate);
          const totalWorkTime = calculateDifferenceInMinutes(
            `${clockInISODate}`,
            `${clockOutISODate}`,
          );
          // console.log(
          //   `Work total time (without breaks): ${totalWorkTime.toFixed(
          //     2,
          //   )}`,
          // );

          // Calculate the sum of breaks in minutes
          // {"end":"25/04/2024 14:59:37","start":"25/04/2024 14:57:19"},{"end":"25/04/2024 14:57:37","start":"25/04/2024 14:58:19"}
          let totalBreaksInMinutes = 0;
          let breakStartISODate = '';
          let breakEndISODate = '';
          entry.clock[0].breaks.forEach((breakEntry) => {
            breakStartISODate = convertDate(breakEntry.start);
            breakEndISODate = convertDate(breakEntry.end);

            const diffInMinutes = calculateDifferenceInMinutes(
              breakStartISODate,
              breakEndISODate,
            );
            totalBreaksInMinutes += diffInMinutes;

            // totalBreaksInMinutes += calculateDifferenceInMinutes(
            //   breakStartISODate,
            //   breakEndISODate,
            // );

            // console.log(`Break start time: ${breakEntry.start}`);
            // console.log(`Break end time: ${breakEntry.end}`);
          });
          // console.log(
          //   `Break total time: ${totalBreaksInMinutes.toFixed(2)}`,
          // );
          breaksHours.push(totalBreaksInMinutes.toFixed(2));

          // Calculate the working hours (difference minus breaks)
          const workingHour = totalWorkTime - totalBreaksInMinutes;
          workingHours.push(workingHour.toFixed(2));
          // console.log(
          //   `Work total time (minus breaks): ${workingHour.toFixed(2)}`,
          // );

          const data = {
            labels: formattedDates,
            datasets: [
              {
                type: 'bar',
                label: 'Travail réel (hors pauses)',
                backgroundColor: documentStyle.getPropertyValue('--blue-500'),
                data: workingHours,
              },
              {
                type: 'bar',
                label: 'Pauses',
                backgroundColor: documentStyle.getPropertyValue('--green-500'),
                data: breaksHours,
              },
            ],
          };

          setChartData(data);
        });
      };
      fetchClockData();
    } catch (e) {
      console.error('Error:', error);
    }
  }, [selectedEmployee]);

  // Real-time hour
  const [dateTime, setDateTime] = useState(
    new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }),
  );
  useEffect(() => {
    // Function to update the date and time every second
    const intervalId = setInterval(() => {
      setDateTime(
        new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }),
      );
    }, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Clock in / out and break management
  const [clockState, setClockState] = useState('out');
  const [isPauseLoading, setIsPauseLoading] = useState(false);
  const [isClockLoading, setIsClockLoading] = useState(false);
  const [isClockDisabled, setIsClockDisabled] = useState(false);

  // Clock & break management
  async function clockMngmt() {
    setConfirmationModal(true);

    // Function to update the date and time every second
    const intervalId = setInterval(async () => {
      // Check the value of the variable and break the loop if it becomes false
      if (isPinCodeCorrect === true) {
        setConfirmationModal(false);

        if (clockState === 'in') {
          setIsClockLoading(true);
          const response = await fetch(getClockOutUrl, {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              authorization: `Bearer ${userJwt}`,
            },
            method: 'GET',
          });
          const data = await response.json();

          setClockState('out');
          setIsClockLoading(false);
        } else if (clockState === 'out') {
          setIsClockLoading(true);

          const response = await fetch(getClockInUrl, {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              authorization: `Bearer ${userJwt}`,
            },
            method: 'GET',
          });
          const data = await response.json();

          setClockState('in');
          setIsClockLoading(false);
        }

        isPinCodeCorrect = false;
        clearInterval(intervalId);
      }
    }, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }
  async function pauseMngmt() {
    setConfirmationModal(true);

    // Function to update the date and time every second
    const intervalId = setInterval(async () => {
      // Check the value of the variable and break the loop if it becomes false
      if (isPinCodeCorrect === true) {
        setConfirmationModal(false);

        if (clockState === 'in' || clockState === 'out') {
          setIsPauseLoading(true);

          const response = await fetch(getBreakStartUrl, {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              authorization: `Bearer ${userJwt}`,
            },
            method: 'GET',
          });
          const data = await response.json();

          setClockState('break');
          setIsPauseLoading(false);
          setIsClockDisabled(true);
        } else if (clockState === 'break') {
          setIsPauseLoading(true);

          const response = await fetch(getBreakEndUrl, {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              authorization: `Bearer ${userJwt}`,
            },
            method: 'GET',
          });
          const data = await response.json();

          setClockState('in');
          setIsPauseLoading(false);
          setIsClockDisabled(false);
        }

        isPinCodeCorrect = false;
        clearInterval(intervalId);
      }
    }, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }

  // Confirmation modal + verify pin code
  const [confirmationModal, setConfirmationModal] = useState<boolean>(false);

  const [state, setState] = useState({ value: '' });
  const handleChange = (event: ChangeEvent<{ value: string }>) => {
    setState({ value: event?.currentTarget?.value });
  };
  const [isVerifyLoading, setIsVerifyLoading] = useState<boolean>(false);
  async function verifyPinCode() {
    setIsVerifyLoading(true);

    const filledPinCode: string = state.value;
    const dataToVerify: string = `${filledPinCode},${userEmail}`;

    await fetch(getVerifyPinCodeBeforeClockUrl, {
      body: JSON.stringify(dataToVerify),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // authorization: `bearer ${session?.user?.accessToken}`,
      },
      method: 'POST',
    }).then((res) => {
      var stringifiedRes = JSON.stringify(res.ok);
      if (stringifiedRes == 'true') {
        isPinCodeCorrect = true;
        showSuccess('Succès', 'Le code PIN entré est correcte', 5000);
        setConfirmationModal(false);
      } else {
        isPinCodeCorrect = false;
        showError('Error', 'Le code PIN entré est incorrecte', 5000);
      }
    });

    setIsVerifyLoading(false);
  }

  // Purge list of employees to reset cache
  const [isPurgeButtonLoading, setIsPurgeButtonLoading] =
    useState<boolean>(false);
  const purgeCache = async () => {
    try {
      if (userRole === 'admin') {
        setIsPurgeButtonLoading(true);

        await fetch(deleteRedisKeyUrl, {
          body: JSON.stringify(`list${userCompanyNormalCase}UsersUnicash`),
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            authorization: `Bearer ${userJwt}`,
          },
          method: 'POST',
        });

        if (userRole == 'admin') {
          const listEmployeesRes = await fetch(getListEmployeesUrl, {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              authorization: `Bearer ${userJwt}`,
            },
            method: 'GET',
          });
          const listEmployeesData = await listEmployeesRes.json();

          setEmployees(
            listEmployeesData.map((user) => ({
              name: user.name,
              email: user.email,
            })),
          );
        }

        setIsPurgeButtonLoading(false);
      }
    } catch (error) {
      showError('Erreur', error, 10000);
    }
  };

  return (
    <div style={{ padding: '1.75rem' }}>
      <Toast ref={toast} />
      <Dialog
        header="Vérification d'identité"
        visible={confirmationModal}
        onHide={() => setConfirmationModal(false)}
        style={{ width: '50vw' }}
        breakpoints={{ '960px': '75vw', '641px': '100vw' }}
      >
        <div>
          <div className="grid">
            <span className="p-float-label">
              <br />
              <InputText
                onChange={handleChange}
                tooltip="Entrez votre code PIN"
                tooltipOptions={{
                  event: 'both',
                  position: 'top',
                }}
                required
              />
              <label>Code PIN</label>
            </span>
          </div>
          <br />
          <Button
            type="button"
            label="Vérifier"
            // icon="pi pi-play"
            outlined
            onClick={verifyPinCode}
            loading={isVerifyLoading}
          />
        </div>
      </Dialog>

      {dataFetched ? (
        userSubscription === 'paid' && hasUserStripeCash ? (
          userCompany === params?.name ||
          (isSidCorrect == true && params?.name == companyFromSid) ? (
            <div>
              <section>
                <div className="mx-auto max-w-screen-xl items-center gap-16 px-4 py-8 lg:grid lg:grid-cols-2 lg:px-6 lg:py-16">
                  <div className="font-light text-gray-500 dark:text-gray-400 sm:text-lg">
                    <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                      Pointage
                    </h2>
                    <br />
                    <div className="card">
                      {userRole == 'admin' ? (
                        <div className="card justify-content-center mb-4 flex">
                          <div className="card align-items-center justify-content-center flex flex-wrap gap-3">
                            <Button
                              icon="pi pi-refresh"
                              size="small"
                              onClick={purgeCache}
                              loading={isPurgeButtonLoading}
                              className="mr-3"
                            />
                          </div>
                          <Dropdown
                            value={selectedEmployee}
                            onChange={(e: DropdownChangeEvent) =>
                              setSelectedEmployee(e.value)
                            }
                            options={employees}
                            optionLabel="name"
                            placeholder="Sélectionner un employé"
                            filter
                            valueTemplate={selectedEmployeeTemplate}
                            itemTemplate={employeeOptionTemplate}
                            className="md:w-14rem w-full"
                          />
                        </div>
                      ) : (
                        <></>
                      )}
                      <Chart
                        type="bar"
                        data={chartData}
                        options={chartOptions}
                      />
                    </div>
                  </div>
                  <div className="mx-auto max-w-screen-xl items-center gap-16 px-4 py-8 lg:grid lg:grid-cols-2 lg:px-6 lg:py-16">
                    <p className="mb-4">{dateTime}</p>
                    <div className="flex flex-col justify-center space-y-2 md:space-y-3 lg:space-y-4 xl:space-y-5 2xl:space-y-6">
                      {clockState &&
                      (clockState === 'in' || clockState == 'break') ? (
                        isClockDisabled ? (
                          <Button
                            type="button"
                            label="Reprendre"
                            icon="pi pi-pause"
                            outlined
                            onClick={pauseMngmt}
                            loading={isPauseLoading}
                          />
                        ) : (
                          <Button
                            type="button"
                            label="Pause"
                            icon="pi pi-pause"
                            outlined
                            onClick={pauseMngmt}
                            loading={isPauseLoading}
                          />
                        )
                      ) : (
                        <Button
                          type="button"
                          label="Pause"
                          icon="pi pi-pause"
                          outlined
                          disabled
                        />
                      )}

                      {clockState && clockState === 'out' ? (
                        <Button
                          type="button"
                          label="Démarrer"
                          icon="pi pi-play"
                          outlined
                          onClick={clockMngmt}
                          loading={isClockLoading}
                        />
                      ) : isClockDisabled ? (
                        <Button
                          type="button"
                          label="Arrêter"
                          icon="pi pi-stop"
                          outlined
                          disabled
                        />
                      ) : (
                        <Button
                          type="button"
                          label="Arrêter"
                          icon="pi pi-stop"
                          outlined
                          onClick={clockMngmt}
                          loading={isClockLoading}
                        />
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
