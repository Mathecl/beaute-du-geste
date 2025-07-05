'use client';
import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';

import { Stepper } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import {
  InputNumber,
  InputNumberValueChangeEvent,
} from 'primereact/inputnumber';
import { ScrollPanel } from 'primereact/scrollpanel';

import { AppContext, appContext } from '@/types/appContext';
import { SkeletonCard } from '@/ui/SkeletonCard';
import OrdersList from '@/ui/unicash/ordersList';

interface CashDesks {
  name: string;
}

export default function UnicashCashDesk() {
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
  const getListCashDesksUrl: string =
    appContext.appUrl + '/api/unicash/cashdesks/listCashDesks';
  const addCashDeskUrl: string =
    appContext.appUrl + '/api/unicash/cashdesks/addCashDesk';
  const updateCashDeskUrl: string =
    appContext.appUrl + '/api/unicash/cashdesks/updateCashDeskFloat';
  const getCashDeskFloatUrl: string =
    appContext.appUrl + '/api/unicash/cashdesks/listCashDeskFloat';
  const getCashDeskOrdersUrl: string =
    appContext.appUrl + '/api/unicash/cashdesks/getOrders';

  // App router & navigation
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // App jwt + list cash desks
  const [mounted, setMounted] = useState(true);
  const [cashDesks, setCashDesks] = useState<CashDesks | null>([]);
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

            const listCashsDesksRes = await fetch(getListCashDesksUrl, {
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                authorization: `Bearer ${data.jwt}`,
              },
              method: 'GET',
            });
            const listCashsDesksData = await listCashsDesksRes.json();

            setCashDesks(
              listCashsDesksData.map((cashdesk) => ({
                name: cashdesk.cashdesk,
              })),
            );
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

  // INTERFACE
  // =========
  const stepperRef = useRef(null);

  // LIST OF CASH DESKS AND MANAGEMENT
  // =================================
  // Cash desk selection
  const [selectedCashDesk, setSelectedCashDesk] = useState<CashDesks | null>(
    null,
  );

  const selectedCashDeskTemplate = (option: CashDesks, props) => {
    if (option) {
      return (
        <div className="align-items-center flex">
          <div>{option.name}</div>
        </div>
      );
    }

    return <span>{props.placeholder}</span>;
  };

  const cashDeskOptionTemplate = (option: CashDesks) => {
    return (
      <div className="align-items-center flex">
        <div>{option.name}</div>
      </div>
    );
  };
  // Purge list of cash desks to reset cache
  const [isPurgeButtonLoading, setIsPurgeButtonLoading] =
    useState<boolean>(false);
  const purgeCache = async () => {
    try {
      setIsAddButtonLoading(true);
      setIsPurgeButtonLoading(true);

      await fetch(deleteRedisKeyUrl, {
        body: JSON.stringify(`list${userCompanyNormalCase}CashDesksUnicash`),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          authorization: `Bearer ${userJwt}`,
        },
        method: 'POST',
      });

      const listCashsDesksRes = await fetch(getListCashDesksUrl, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          authorization: `Bearer ${userJwt}`,
        },
        method: 'GET',
      });
      const listCashsDesksData = await listCashsDesksRes.json();

      setCashDesks(
        listCashsDesksData.map((cashdesk) => ({
          name: cashdesk.cashdesk,
        })),
      );

      setIsAddButtonLoading(false);
      setIsPurgeButtonLoading(false);
    } catch (error) {
      showError('Erreur', error, 10000);
    }
  };
  // Add cash desk
  const [isAddButtonLoading, setIsAddButtonLoading] = useState<boolean>(false);
  const [isCashDeskNameLoading, setCashDeskNameLoading] =
    useState<boolean>(false);
  const [confirmationModal, setConfirmationModal] = useState<boolean>(false);
  const [state, setState] = useState({ value: '' });
  const handleChange = (event: ChangeEvent<{ value: string }>) => {
    setState({ value: event?.currentTarget?.value });
  };
  async function handleAddCashDesk() {
    setConfirmationModal(true);
  }
  async function addCashDesk() {
    setCashDeskNameLoading(true);
    setIsAddButtonLoading(true);
    setIsPurgeButtonLoading(true);

    const addCashDeskRes = await fetch(addCashDeskUrl, {
      body: JSON.stringify(state.value),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        authorization: `Bearer ${userJwt}`,
      },
      method: 'POST',
    });

    if (addCashDeskRes.status == 200) {
      await fetch(deleteRedisKeyUrl, {
        body: JSON.stringify(`list${userCompanyNormalCase}CashDesksUnicash`),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          authorization: `Bearer ${userJwt}`,
        },
        method: 'POST',
      });

      const listCashsDesksRes = await fetch(getListCashDesksUrl, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          authorization: `Bearer ${userJwt}`,
        },
        method: 'GET',
      });
      const listCashsDesksData = await listCashsDesksRes.json();

      setCashDesks(
        listCashsDesksData.map((cashdesk) => ({
          name: cashdesk.cashdesk,
        })),
      );

      showSuccess('Succès', `Caisse ${state.value} ajoutée avec succès`, 5000);
    } else {
      showError(
        'Erreur',
        "Une erreur est survenue lors de la tentative d'ajout de la caisse",
        10000,
      );
    }

    setCashDeskNameLoading(false);
    setIsAddButtonLoading(false);
    setIsPurgeButtonLoading(false);

    setConfirmationModal(false);
  }

  // GESTION FONDS DE CAISSE
  // =======================
  const [cashDenominations, setCashDenominations] = useState({
    coins: [
      { label: '0,01€', value: 0.01, amount: 0 },
      { label: '0,02€', value: 0.02, amount: 0 },
      { label: '0,05€', value: 0.05, amount: 0 },
      { label: '0,10€', value: 0.1, amount: 0 },
      { label: '0,20€', value: 0.2, amount: 0 },
      { label: '0,50€', value: 0.5, amount: 0 },
      { label: '1,00€', value: 1, amount: 38 },
      { label: '2,00€', value: 2, amount: 0 },
    ],
    notes: [
      { label: '5€', value: 5, amount: 0 },
      { label: '10€', value: 10, amount: 5 },
      { label: '20€', value: 20, amount: 15 },
      { label: '50€', value: 50, amount: 0 },
      { label: '100€', value: 100, amount: 0 },
      { label: '200€', value: 200, amount: 0 },
      { label: '500€', value: 500, amount: 0 },
    ],
    coinsTotal: 0,
    notesTotal: 0,
  });
  const [amounts, setAmounts] = useState({
    coins: Array(cashDenominations.coins.length).fill(0),
    notes: Array(cashDenominations.notes.length).fill(0),
  });

  async function getCashDeskFloat() {
    if (selectedCashDesk?.name && selectedCashDesk?.name !== null) {
      stepperRef.current.nextCallback();

      const cashDeskFloatRes = await fetch(getCashDeskFloatUrl, {
        body: JSON.stringify(selectedCashDesk?.name),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          authorization: `Bearer ${userJwt}`,
        },
        method: 'POST',
      });

      const cashDeskFloatData = await cashDeskFloatRes.json();
      setCashDenominations(cashDeskFloatData);
    } else {
      showError('Erreur', 'Veuillez choisir une caisse', 10000);
    }
  }

  useEffect(() => {
    // Initialize amounts state based on cashDenominations
    const initialCoinAmounts = cashDenominations.coins.map(
      (coin) => coin.amount,
    );
    const initialNoteAmounts = cashDenominations.notes.map(
      (note) => note.amount,
    );
    setAmounts({ coins: initialCoinAmounts, notes: initialNoteAmounts });
  }, [cashDenominations]);

  const handleCashFloatChange = (e, type, index) => {
    const value = parseInt(e.target.value, 10) || 0;
    setAmounts((prevAmounts) => {
      const newAmounts = { ...prevAmounts };
      newAmounts[type][index] = value;
      return newAmounts;
    });
  };
  const calculateTotal = () => {
    const coinsTotal = amounts.coins.reduce(
      (acc, amount, index) =>
        acc + amount * cashDenominations.coins[index].value,
      0,
    );
    const notesTotal = amounts.notes.reduce(
      (acc, amount, index) =>
        acc + amount * cashDenominations.notes[index].value,
      0,
    );

    return { coinsTotal, notesTotal };
  };
  const { coinsTotal, notesTotal } = calculateTotal();
  const constructJSON = () => {
    const coins = cashDenominations.coins.map((coin, index) => ({
      label: coin.label,
      value: coin.value,
      amount: amounts.coins[index],
    }));

    const notes = cashDenominations.notes.map((note, index) => ({
      label: note.label,
      value: note.value,
      amount: amounts.notes[index],
    }));

    const result = {
      coinsTotal,
      notesTotal,
      coins,
      notes,
    };

    return result;
  };
  const [isSendCashFloatLoading, setIsSendCashFloatLoading] =
    useState<boolean>(false);
  const getTotalsJSON = async () => {
    setIsSendCashFloatLoading(true);

    const jsonResult = constructJSON();

    const dataToSend: string = `${selectedCashDesk?.name}|${JSON.stringify(
      jsonResult,
    )}`;
    const cashDeskFloatRes = await fetch(updateCashDeskUrl, {
      body: JSON.stringify(dataToSend),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        authorization: `Bearer ${userJwt}`,
      },
      method: 'POST',
    });

    // const cashDeskFloatData: string = await cashDeskFloatRes.json();

    if (cashDeskFloatRes.status == 200) {
      showSuccess(
        'Succès',
        `Fonds de caisse ${selectedCashDesk?.name} mis à jour avec succès`,
        5000,
      );
    } else {
      showError(
        'Erreur',
        `Une erreur est survenue lors de la tentative de mise à jour du fonds de caisse ${selectedCashDesk}`,
        10000,
      );
    }

    setIsSendCashFloatLoading(false);
    return jsonResult;
  };

  // GESTION DES COMMANDES
  // =====================

  const [ordersListData, setOrdersListData] = useState('');
  async function getOrdersListData() {
    try {
      const response = await fetch(getCashDeskOrdersUrl, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          authorization: `Bearer ${userJwt}`,
        },
        method: 'GET',
      });

      if (response.status == 200) {
        const data = await response.json();
        setOrdersListData(data);
      } else {
        showError(
          'Erreur',
          "Une erreur est survenue lors de l'affichage du tableau de données",
          10000,
        );
      }
    } catch (error) {
      console.log(
        'Error fetching jwt data and/or displaying management-related content:',
        error,
      );
    }
  }

  return (
    <div style={{ padding: '1.75rem' }} className="h-fit">
      <Toast ref={toast} />
      <Dialog
        header="Ajout d'une caisse"
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
                tooltip="Entrez un nom de caisse"
                tooltipOptions={{
                  event: 'both',
                  position: 'top',
                }}
                required
              />
              <label>Nom de caisse</label>
            </span>
          </div>
          <br />
          <Button
            type="button"
            label="Ajouter"
            // icon="pi pi-play"
            outlined
            onClick={addCashDesk}
            loading={isCashDeskNameLoading}
          />
        </div>
      </Dialog>

      {dataFetched ? (
        userSubscription === 'paid' && hasUserStripeCash ? (
          userCompany === params?.name ||
          (isSidCorrect == true && params?.name == companyFromSid) ? (
            <div className="h-auto">
              <section>
                <div className="mx-auto max-w-screen-xl items-center">
                  <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    Gestion des caisses
                  </h2>
                  <br />
                  <Stepper
                    ref={stepperRef}
                    linear
                    style={{ flexBasis: '50rem' }}
                  >
                    <StepperPanel header="- Choix de caisse">
                      <div className="flex-column h-12rem flex">
                        <div className="surface-border border-round surface-ground justify-content-center align-items-center flex flex-auto border-2 border-dashed font-medium">
                          <div className="card justify-content-center mb-4 flex">
                            <div className="card align-items-center justify-content-center flex flex-wrap gap-3">
                              <Button
                                icon="pi pi-refresh"
                                size="small"
                                onClick={purgeCache}
                                loading={isPurgeButtonLoading}
                              />
                              <Button
                                icon="pi pi-plus"
                                size="small"
                                onClick={handleAddCashDesk}
                                loading={isAddButtonLoading}
                                className="mr-3"
                              />
                            </div>
                            <Dropdown
                              value={selectedCashDesk}
                              onChange={(e: DropdownChangeEvent) =>
                                setSelectedCashDesk(e.value)
                              }
                              options={cashDesks}
                              optionLabel="name"
                              placeholder="Sélectionner caisse"
                              filter
                              valueTemplate={selectedCashDeskTemplate}
                              itemTemplate={cashDeskOptionTemplate}
                              className="md:w-14rem w-full"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="justify-content-end flex pt-4">
                        <Button
                          label="Continuer"
                          icon="pi pi-arrow-right"
                          iconPos="right"
                          onClick={() => {
                            getCashDeskFloat();
                          }}
                        />
                      </div>
                    </StepperPanel>
                    <StepperPanel header="- Fonds de caisse">
                      <div className="flex-column h-12rem flex text-center">
                        <div className="surface-border border-round surface-ground justify-content-center align-items-center flex flex-auto border-2 border-dashed pl-4 pt-3 font-medium">
                          <div className="container mx-auto p-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div>
                                <h2 className="mb-2 text-lg font-bold">
                                  Pièces: {coinsTotal.toFixed(2)}€
                                </h2>
                                {cashDenominations.coins.map((coin, index) => (
                                  <div key={coin.label} className="mb-2">
                                    <label className="flex items-center">
                                      <span className="w-16">{coin.label}</span>
                                      <InputNumber
                                        value={amounts.coins[index]}
                                        onValueChange={(
                                          e: InputNumberValueChangeEvent,
                                        ) =>
                                          handleCashFloatChange(
                                            e,
                                            'coins',
                                            index,
                                          )
                                        }
                                        min={0}
                                      />
                                      {/* <input
                                        type="number"
                                        className="ml-2 rounded border border-gray-300 p-2"
                                        value={amounts.coins[index]}
                                        onChange={(e) =>
                                          handleCashFloatChange(
                                            e,
                                            'coins',
                                            index,
                                          )
                                        }
                                        min="0"
                                      /> */}
                                    </label>
                                  </div>
                                ))}
                              </div>
                              <div>
                                <h2 className="mb-2 text-lg font-bold">
                                  Billets: {notesTotal.toFixed(2)}€
                                </h2>
                                {cashDenominations.notes.map((note, index) => (
                                  <div key={note.label} className="mb-2">
                                    <label className="flex items-center">
                                      <span className="w-16">{note.label}</span>
                                      <InputNumber
                                        value={amounts.notes[index]}
                                        onValueChange={(
                                          e: InputNumberValueChangeEvent,
                                        ) =>
                                          handleCashFloatChange(
                                            e,
                                            'notes',
                                            index,
                                          )
                                        }
                                        min={0}
                                      />
                                      {/* <input
                                        type="number"
                                        className="ml-2 rounded border border-gray-300 p-2"
                                        value={amounts.notes[index]}
                                        onChange={(e) =>
                                          handleCashFloatChange(
                                            e,
                                            'notes',
                                            index,
                                          )
                                        }
                                        min="0"
                                      /> */}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="mt-4 text-center">
                              <Button
                                label="Envoyer"
                                onClick={getTotalsJSON}
                                loading={isSendCashFloatLoading}
                              />
                              {/* <button
                                onClick={getTotalsJSON}
                                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
                              >
                                Envoyer
                              </button> */}
                            </div>
                          </div>
                        </div>
                      </div>
                      <br />
                      <br />
                      <br />
                      <div className="justify-content-between flex pt-96">
                        <Button
                          label="Revenir en arrière"
                          severity="secondary"
                          icon="pi pi-arrow-left"
                          onClick={() => stepperRef.current.prevCallback()}
                        />
                        <Button
                          label="Continuer"
                          icon="pi pi-arrow-right"
                          iconPos="right"
                          onClick={() => {
                            stepperRef.current.nextCallback();
                            getOrdersListData();
                          }}
                        />
                      </div>
                    </StepperPanel>
                    <StepperPanel header="- Commandes en cours">
                      <div className="flex-column h-12rem flex">
                        <div className="surface-border border-round surface-ground justify-content-center align-items-center flex flex-auto border-2 border-dashed font-medium">
                          {ordersListData && ordersListData.length > 0 ? (
                            <ScrollPanel
                              style={{ width: '100%', height: '62vh' }}
                            >
                              <OrdersList data={ordersListData} />
                            </ScrollPanel>
                          ) : (
                            <SkeletonCard />
                          )}
                        </div>
                      </div>
                      {/* <div className="justify-content-start mt-2 flex pt-4">
                        <Button
                          label="Revenir en arrière"
                          severity="secondary"
                          icon="pi pi-arrow-left"
                          onClick={() => stepperRef.current.prevCallback()}
                        />
                      </div> */}
                    </StepperPanel>
                  </Stepper>
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
