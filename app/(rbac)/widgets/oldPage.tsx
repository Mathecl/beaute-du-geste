'use client';
import React from 'react';
import { useState, useEffect, useRef } from 'react';

import { AppContext, appContext } from '@/types/appContext';

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';

interface FormType {
  name: string;
}

export default function Widgets() {
  const [userEmail, setUserEmail] = useState('');
  const [userCompany, setUserCompany] = useState('');
  const [billingPortal, setBillingPortal] = useState('');

  // App context
  const getJWTdataUrl: string = appContext.appUrl + '/api/auth/getJWTdata';
  const billingPortalUrl: string =
    appContext.appUrl + '/api/stripe/postBillingPortal';
  const manageACUrl: string = appContext.appUrl + '/api/manageAC';

  // Notification
  const toast = useRef<Toast>(null);

  // Get JWT data from user token
  const [userBearer, setUserBearer] = useState('');
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
        setUserBearer(data.jwt);
        setUserEmail(data.userPrismaEmail);
        setUserCompany(data.userPrismaCompany);
      } catch (error) {
        console.error('Error fetching jwt data:', error);
      }
    };
    fetchJWTData();
  }, []);

  // Subscriptions
  async function handleBillingPortalUrl(e) {
    try {
      e.preventDefault();

      const response = await fetch(billingPortalUrl, {
        body: userEmail,
        headers: {
          // 'Content-Type': 'application/json',
          authorization: `Bearer ${userBearer}`,
        },
        method: 'POST',
      });

      if (response.ok) {
        const sessionUrl = await response.text();
        setBillingPortal(sessionUrl);
        // Open the URL in a new window
        if (sessionUrl) {
          window.open(sessionUrl, '_blank');
        }
      } else {
        // Handle error
        console.error('Error:', response.status, response.statusText);
      }

      // window.location.assign(sessionUrl);
    } catch (error) {
      return error;
    }
  }

  // Licenses
  async function handleFormSubmit(e) {
    e.preventDefault(); // Prevent default form submission behavior
    handleAC(); // Call your function to handle the form submission
  }

  const [ac, setAC] = useState<string>('');
  const [w, setW] = useState<string>('');
  const widgets: FormType[] = [
    { name: 'Unismart' },
    { name: 'Unidmin' },
    { name: 'Unimeet' },
    // { name: 'Unicollab' },
  ];
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);
  async function handleAC() {
    // Does userCompany == AC company name ?
    // If yes, then set approved to true and user wished widget to true

    try {
      setIsButtonLoading(true);
      const dataToSend: string = `${ac},${userCompany},${userEmail},${w.name}`;

      fetch(manageACUrl, {
        body: JSON.stringify(dataToSend),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          // authorization: `bearer ${session?.user?.accessToken}`,
        },
        method: 'POST',
      }).then((res) => {
        setAC('');
        setW('');
        setIsButtonLoading(false);

        console.log(res);

        if (res.status == 200) {
          toast.current?.show({
            severity: 'success',
            summary: 'Succès',
            detail: `La licence a été activée avec succès`,
            life: 5000,
          });

          // update jwt with activated widget ?
          // redirect to activated widget ?
        } else {
          toast.current?.show({
            severity: 'error',
            summary: 'Erreur',
            detail:
              "Veuillez vérifier que le code d'activation est correcte ou que celui-ci n'a pas dépassé son quota d'activations",
            life: 5000,
          });
        }
      });
    } catch (error) {
      return error;
    }
  }

  return (
    <div style={{ padding: '1.75rem' }}>
      <Toast ref={toast} />

      <h1 className="text-xl font-bold">Mes widgets</h1>
      <br />
      <div className="flex justify-between">
        <div className="justify-top flex w-1/2 flex-initial flex-col items-center text-center">
          <b className="mb-4">Abonnements mensuels</b>
          <br />
          <button
            onClick={handleBillingPortalUrl}
            className="font-small mr-1 leading-6 text-indigo-600 hover:text-indigo-500"
          >
            Consultez et gérez ici vos abonnements mensuels ainsi que vos
            données de facturation
          </button>
        </div>
        <div className="flex w-1/2 flex-initial flex-col items-center justify-center text-center">
          {' '}
          <b className="mb-4">Licences</b>
          <form>
            <div className="mt-2 grid w-full items-center justify-center text-center">
              <span className="p-float-label mb-2 block w-full">
                <Dropdown
                  value={w}
                  onChange={(e: DropdownChangeEvent) => setW(e.value)}
                  required
                  options={widgets}
                  optionLabel="name"
                  tooltip="Choisissez le widget souhaité"
                  tooltipOptions={{ event: 'both', position: 'top' }}
                  className="w-full"
                />
                <label>Widget souhaité</label>
              </span>
              <span className="p-float-label mb-5 block w-full">
                <InputText
                  value={ac}
                  keyfilter="alphanum" // to avoid spaces
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setAC(e.target.value)
                  }
                  tooltip="Entrez le code d'activation nécessaire pour activer la licence vous permettant de gagner l'accès au widget"
                  tooltipOptions={{ event: 'both', position: 'top' }}
                  required
                />
                <label>Code d'activation de la licence</label>
              </span>
            </div>
            <div className="w-full justify-center text-center">
              <Button
                label="Accéder au widget"
                size="small"
                outlined
                iconPos="right"
                icon="pi pi-arrow-right"
                onClick={handleFormSubmit}
                loading={isButtonLoading}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
