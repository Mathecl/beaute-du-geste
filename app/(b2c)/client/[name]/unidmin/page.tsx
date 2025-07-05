'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { DataTable } from 'primereact/datatable';
import { Column, ColumnEvent, ColumnEditorOptions } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

import { AppContext, appContext } from '@/types/appContext';
import { SkeletonCard } from '@/ui/SkeletonCard';

interface Product {
  // id: string;
  name: string;
  email: string;
  password: string;
  pinCode: string;
  company: string;
  role: string;
  subscription: string;
  voice: string;
  language: string;
  stripeCustomerid: string;
  stripeassistant: boolean;
  // stripecollab: boolean;
  stripemeet: boolean;
  stripebiznetwork: boolean;
  approved: boolean;
}

interface ColumnMeta {
  field: string;
  header: string;
}

export default function Unidmin() {
  // Notification & modal
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

  // Button state
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);

  // Users infos
  const [usersInfos, setUsersInfos] = useState<Product | null>(null);
  // User JWT Token
  const [userRole, setUserRole] = useState('');
  const [userCompany, setUserCompany] = useState('');
  const [userJwt, setUserJwt] = useState('');
  const [dataFetched, setDataFetched] = useState(false);
  function handleCreateUserUrl() {
    window.open(
      appContext.appUrl + '/client/' + userCompany + '/unidmin/tools',
      '_blank',
    );
  }

  // App Context
  const getJWTdataUrl: string = appContext.appUrl + '/api/auth/getJWTdata';
  const listUsersUrl: string = appContext.appUrl + '/api/listUsers';
  const deleteRedisKeyUrl: string =
    appContext.appUrl + '/api/redisUtils/delKey';
  const ormUtilsUrl: string = appContext.appUrl + '/api/orm/ormUtils';
  const paymentUrl: string = appContext.appUrl + '/api/stripe/postAdminPayment';
  const updateCustomerSubscriptionUrl: string =
    appContext.appUrl + '/api/stripe/updateAdminCustomerSubscription';
  const updateTokenUsageUrl: string =
    appContext.appUrl + '/api/auth/updateTokenUsage';

  // App router & navigation
  const router = useRouter();
  const params = useParams();
  // const searchParams = useSearchParams();

  // App payment
  const [mounted, setMounted] = useState(true);
  useEffect(() => {
    try {
      // Fetch JWT Data + Admin DataTable
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
          setUserRole(data.userPrismaRole);
          setUserCompany(data.userPrismaCompany.toLowerCase());
          setUserJwt(data.jwt);

          if (data.userPrismaRole == 'admin') {
            const res = await fetch(listUsersUrl, {
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                authorization: `Bearer ${data.jwt}`,
              },
              method: 'GET',
            });
            const usersData = await res.json();
            setUsersInfos(usersData);
            setDataFetched(true);
          } else {
            setDataFetched(true);
          }
        } catch (error) {
          console.log('Error fetching jwt data:', error);
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

  // CRUD DATA TABLE
  // Cell edit: https://primereact.org/datatable/#cell_edit
  const columns: ColumnMeta[] = [
    { field: 'stripecustomerid', header: 'Identifiant' },
    // { field: 'stripecustomerid', header: 'Identifiant' },
    { field: 'name', header: 'Nom' },
    { field: 'email', header: 'Email' },
    { field: 'company', header: 'Entreprise' },
    { field: 'role', header: 'Rôle' },
    { field: 'voice', header: 'Sexe' },
    { field: 'language', header: 'Langue' },
    { field: 'verified', header: 'Compte vérifié' },
    { field: 'approved', header: 'Accès à la bêta privée' },
    { field: 'password', header: 'Mot de passe' },
    { field: 'pinCode', header: 'Code PIN' },
    { field: 'subscription', header: 'Abonnement' },
    { field: 'stripeassistant', header: 'Unismart' },
    { field: 'stripemeet', header: 'Unimeet' },
    // { field: 'stripecollab', header: 'Unicollab' },
    // { field: 'stripebiznetwork', header: "Accès au réseau d'affaires" },
  ];
  const onCellEditComplete = async (e: ColumnEvent) => {
    let { rowData, newValue, field, originalEvent: event } = e;

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

    switch (field) {
      case 'company':
      case 'name':
        if (newValue && newValue !== rowData[field]) {
          rowData[field] = newValue;
          showInfo('Information', `Requêtes en cours`, 3000);
          try {
            const res = await fetch(ormUtilsUrl, {
              body: JSON.stringify({
                column: field,
                whereEmailData: rowData.email,
                columnData: newValue,
              }),
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                authorization: `Bearer ${userJwt}`,
              },
              method: 'POST',
            });

            if (res.status == 200) {
              showSuccess(
                'Succès',
                `Modifications apportées avec succès`,
                3000,
              );
            }
          } catch (e) {
            showError('Erreur', e, 10000);
          }
        } else {
          // console.log(
          //   `La nouvelle valeur ${newValue} n'est pas différente de celle originale: ${rowData[field]}`,
          // );
          event.preventDefault();
        }
        break;
      case 'stripeassistant':
        if (newValue === 'true' && newValue && newValue !== rowData[field]) {
          rowData[field] = newValue;
          event.preventDefault();
          const pid = 'price_1OpQwIJNpqoZVop2eokYOfbv';
          const data = `${pid},${rowData.email},${rowData.company}`;
          const response = await fetch(paymentUrl, {
            body: data,
            headers: {
              // 'Content-Type': 'application/json',
              // authorization: `bearer ${session?.user?.accessToken}`,
              authorization: `Bearer ${userJwt}`,
            },
            method: 'POST',
          });

          if (response.ok) {
            const sessionUrl = await response.text();

            // Open the URL in a new window
            if (sessionUrl) {
              window.open(sessionUrl, '_blank');
              const bodyData = `${pid},${rowData.email}`;
              await fetch(updateCustomerSubscriptionUrl, {
                body: bodyData,
                headers: {
                  // 'Content-Type': 'application/json',
                  // authorization: `bearer ${session?.user?.accessToken}`,
                  authorization: `Bearer ${userJwt}`,
                },
                method: 'POST',
              });
            }
          } else {
            // Handle error
            console.error('Error:', response.status, response.statusText);
          }
        } else {
          showInfo(
            'Information',
            'Unidmin ne permet pas de faire cette opération',
            10000,
          );
          event.preventDefault();
        }
        break;
      case 'stripemeet':
        if (newValue === 'true' && newValue && newValue !== rowData[field]) {
          rowData[field] = newValue;
          event.preventDefault();
          const pid = 'price_1OpQwbJNpqoZVop2rBLHdg84';
          const data = `${pid},${rowData.email},${rowData.company}`;
          const response = await fetch(paymentUrl, {
            body: data,
            headers: {
              // 'Content-Type': 'application/json',
              // authorization: `bearer ${session?.user?.accessToken}`,
              authorization: `Bearer ${userJwt}`,
            },
            method: 'POST',
          });

          if (response.ok) {
            const sessionUrl = await response.text();

            // Open the URL in a new window
            if (sessionUrl) {
              window.open(sessionUrl, '_blank');
              const bodyData = `${pid},${rowData.email}`;
              await fetch(updateCustomerSubscriptionUrl, {
                body: bodyData,
                headers: {
                  // 'Content-Type': 'application/json',
                  // authorization: `bearer ${session?.user?.accessToken}`,
                  authorization: `Bearer ${userJwt}`,
                },
                method: 'POST',
              });
            }
          } else {
            // Handle error
            console.error('Error:', response.status, response.statusText);
          }
        } else {
          showInfo(
            'Information',
            'Unidmin ne permet pas de faire cette opération',
            10000,
          );
          event.preventDefault();
        }
        break;
      // case 'stripecollab':
      //   if (newValue === 'true' && newValue && newValue !== rowData[field]) {
      //     rowData[field] = newValue;
      //     event.preventDefault();
      //     const pid = 'price_1OytbzJNpqoZVop2vq0YMGXg';
      //     const data = `${pid},${rowData.email},${rowData.company}`;
      //     const response = await fetch(paymentUrl, {
      //       body: data,
      //       headers: {
      //         // 'Content-Type': 'application/json',
      //         // authorization: `bearer ${session?.user?.accessToken}`,
      //         authorization: `Bearer ${userJwt}`,
      //       },
      //       method: 'POST',
      //     });

      //     if (response.ok) {
      //       const sessionUrl = await response.text();

      //       // Open the URL in a new window
      //       if (sessionUrl) {
      //         window.open(sessionUrl, '_blank');
      //         const bodyData = `${pid},${rowData.email}`;
      //         await fetch(updateCustomerSubscriptionUrl, {
      //           body: bodyData,
      //           headers: {
      //             // 'Content-Type': 'application/json',
      //             // authorization: `bearer ${session?.user?.accessToken}`,
      //             authorization: `Bearer ${userJwt}`,
      //           },
      //           method: 'POST',
      //         });
      //       }
      //     } else {
      //       // Handle error
      //       console.error('Error:', response.status, response.statusText);
      //     }
      //   } else {
      //     showInfo(
      //       'Information',
      //       'Unidmin ne permet pas de faire cette opération',
      //       10000,
      //     );
      //     event.preventDefault();
      //   }
      //   break;
      case 'verified':
      // case 'stripebiznetwork':
      case 'approved':
        if (
          (newValue === 'true' || newValue === 'false') &&
          newValue &&
          newValue !== rowData[field]
        ) {
          rowData[field] = newValue;
          showInfo('Information', `Requêtes en cours`, 3000);
          try {
            const res = await fetch(ormUtilsUrl, {
              body: JSON.stringify({
                column: field,
                whereEmailData: rowData.email,
                columnData: newValue,
              }),
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                authorization: `Bearer ${userJwt}`,
              },
              method: 'POST',
            });

            if (res.status == 200) {
              showSuccess(
                'Succès',
                `Modifications apportées avec succès`,
                3000,
              );
            }
          } catch (e) {
            showError('Erreur', e, 10000);
          }
        } else {
          event.preventDefault();
        }
        break;
      case 'pinCode':
        if (newValue && newValue !== rowData[field]) {
          rowData[field] = '●●●●●●●●';
          showInfo('Information', `Requêtes en cours`, 3000);
          try {
            const res = await fetch(ormUtilsUrl, {
              body: JSON.stringify({
                column: field,
                whereEmailData: rowData.email,
                columnData: newValue,
              }),
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                authorization: `Bearer ${userJwt}`,
              },
              method: 'POST',
            });

            if (res.status == 200) {
              showSuccess(
                'Succès',
                `Modifications apportées avec succès`,
                3000,
              );
            }
          } catch (e) {
            showError('Erreur', e, 10000);
          }
        } else {
          // console.log(
          //   `La nouvelle valeur ${newValue} n'est pas différente de celle originale: ${rowData[field]}`,
          // );
          event.preventDefault();
        }
        break;
      case 'password':
        if (
          /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})./.test(
            newValue,
          ) &&
          newValue &&
          newValue !== rowData[field]
        ) {
          rowData[field] = '●●●●●●●●';
          showInfo('Information', `Requêtes en cours`, 3000);
          try {
            const res = await fetch(ormUtilsUrl, {
              body: JSON.stringify({
                column: field,
                whereEmailData: rowData.email,
                columnData: newValue,
              }),
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                authorization: `Bearer ${userJwt}`,
              },
              method: 'POST',
            });

            if (res.status == 200) {
              showSuccess(
                'Succès',
                `Modifications apportées avec succès`,
                3000,
              );
            }
          } catch (e) {
            showError('Erreur', e, 10000);
          }
        } else {
          event.preventDefault();
        }
        break;
      default:
        if (field === 'email' || field === 'stripecustomerid') {
          showInfo(
            'Information',
            'Unidmin ne permet pas de faire cette opération',
            10000,
          );
          break;
        } else if (field === 'subscription') {
          if (
            (newValue === 'paid' || newValue === 'free') &&
            newValue &&
            newValue !== rowData[field]
          ) {
            rowData[field] = newValue;
            showInfo('Information', `Requêtes en cours`, 3000);
            try {
              const res = await fetch(ormUtilsUrl, {
                body: JSON.stringify({
                  column: field,
                  whereEmailData: rowData.email,
                  columnData: newValue,
                }),
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                  authorization: `Bearer ${userJwt}`,
                },
                method: 'POST',
              });

              if (res.status == 200) {
                showSuccess(
                  'Succès',
                  `Modifications apportées avec succès`,
                  3000,
                );
              }
            } catch (e) {
              showError('Erreur', e, 10000);
            }
          } else {
            event.preventDefault();
          }
          break;
        } else if (field === 'role') {
          if (
            (newValue === 'employee' || newValue === 'admin') &&
            newValue &&
            newValue !== rowData[field]
          ) {
            rowData[field] = newValue;
            showInfo('Information', `Requêtes en cours`, 3000);
            try {
              const res = await fetch(ormUtilsUrl, {
                body: JSON.stringify({
                  column: field,
                  whereEmailData: rowData.email,
                  columnData: newValue,
                }),
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                  authorization: `Bearer ${userJwt}`,
                },
                method: 'POST',
              });

              if (res.status == 200) {
                showSuccess(
                  'Succès',
                  `Modifications apportées avec succès`,
                  3000,
                );
              }
            } catch (e) {
              showError('Erreur', e, 10000);
            }
          } else {
            event.preventDefault();
          }
          break;
        }
        {
          if (newValue.length > 0) rowData[field] = newValue;
          else event.preventDefault();
          break;
        }
    }
  };
  const cellEditor = (options: ColumnEditorOptions) => {
    return textEditor(options);
  };
  const textEditor = (options: ColumnEditorOptions) => {
    return (
      <InputText
        type="text"
        value={options.value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          options.editorCallback(e.target.value)
        }
      />
    );
  };

  // Checkbox row selection + CRUD ops: https://primereact.org/datatable/#checkbox_row_selection + https://primereact.org/datatable/#dtproducts
  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          icon="pi pi-wrench"
          size="small"
          onClick={handleCreateUserUrl}
        />
      </div>
    );
  };
  const rightToolbarTemplate = () => {
    return (
      <div className="card align-items-center justify-content-center flex flex-wrap gap-3">
        <Button
          icon="pi pi-refresh"
          size="small"
          onClick={refreshDataTable}
          loading={isButtonLoading}
        />
      </div>
    );
  };

  const [dataTableLoading, setDataTableLoading] = useState<boolean>(false);
  async function refreshDataTable() {
    try {
      setIsButtonLoading(true);

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

      const purgeCache = async () => {
        try {
          if (userRole === 'admin') {
            await fetch(deleteRedisKeyUrl, {
              body: JSON.stringify(`list${userCompany.toLowerCase()}Users`),
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                authorization: `Bearer ${userJwt}`,
              },
              method: 'POST',
            });
          }
        } catch (error) {
          showError('Erreur', error, 10000);
        }
      };
      const fetchData = async () => {
        try {
          setDataTableLoading(true);
          if (userRole === 'admin') {
            const res = await fetch(listUsersUrl, {
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                authorization: `Bearer ${userJwt}`,
              },
              method: 'GET',
            });
            const usersData = await res.json();
            setUsersInfos(usersData);
            setDataTableLoading(false);
          } else {
            setDataTableLoading(false);
          }
        } catch (error) {
          console.log('Error fetching jwt data:', error);
        }
      };
      await purgeCache();
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
    setIsButtonLoading(false);
  }

  // Lazy load: https://primereact.org/datatable/#lazy_load
  // Export: https://primereact.org/datatable/#export

  return (
    <div style={{ padding: '1.75rem' }}>
      <Toast ref={toast} />

      <h1 className="text-xl font-bold">Unidmin</h1>
      <br />
      {userCompany == params?.name && userRole == 'admin' ? (
        dataFetched ? (
          <div>
            <div>
              <b>
                Tableau de bord d'administration de tous les employés de votre
                entreprise {userCompany}.
              </b>
              <br />
              <br />
              Foire Aux Questions:
              <br />
              <i>
                <ul>
                  <li>
                    - Toutes modifications faîtes par l'administrateur sur des
                    changements de mots de passe ou codes PIN ne respectant pas
                    les politiques de sécurité habituelles ne seront pas prises
                    en compte
                  </li>
                  <li>
                    - Le rôle d'un(e) employé(e) est soit admin, soit employee
                  </li>
                  <li>
                    - Uniquement l'employé(e) peut peut modifier son adresse
                    email et annuler un abonnement, mais pas l'administrateur
                  </li>
                  <li>
                    - Uniquement l'employé(e) peut annuler ses abonnements aux
                    widgets, pas l'administrateur
                  </li>
                  <li>
                    - L'identifiant utilisateur n'est pas créé tant que le
                    compte n'est pas vérifié
                  </li>
                </ul>
              </i>
              <div className="card p-fluid">
                <Toolbar
                  className="mt-4"
                  start={leftToolbarTemplate}
                  end={rightToolbarTemplate}
                ></Toolbar>

                <DataTable
                  value={usersInfos}
                  loading={dataTableLoading}
                  editMode="cell"
                  tableStyle={{ minWidth: '50rem' }}
                  className="mt-4"
                  resizableColumns
                  showGridlines
                  rows={10}
                  paginator
                  paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                  rowsPerPageOptions={[10, 25, 50]}
                >
                  {columns.map(({ field, header }) => {
                    return (
                      <Column
                        key={field}
                        field={field}
                        header={header}
                        // body={field === 'price'}
                        editor={(options) => cellEditor(options)}
                        onCellEditComplete={onCellEditComplete}
                        style={{ width: '25%' }}
                        sortable
                        filter
                      />
                    );
                  })}
                </DataTable>
              </div>
            </div>
          </div>
        ) : (
          <SkeletonCard />
        )
      ) : (
        <div className="font-small leading-6">
          Veuillez attendre quelques instants...
          <br />
          <br />
          Vérifiez que vous remplissiez bien les deux conditions d'accès
          ci-dessous:
          <ul>
            <li>Faire parti de l'entreprise {params?.name}</li>
            <li>Avoir le rôle d'administrateur</li>
          </ul>
        </div>
      )}
    </div>
  );
}
