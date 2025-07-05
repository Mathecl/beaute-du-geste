import Link from 'next/link';
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { AppContext, appContext } from '@/types/appContext';

import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';

// import { Metadata } from 'next';
// Metadata is usable only in server components
// export const metadata: Metadata = {
//   title: 'Access',
//   description: 'Sign in to your account to gain accsess',
// };

const PricingCard = ({ price }) => {
  const [userEmail, setUserEmail] = useState([]);

  // App Context
  const postPayment: string = appContext.appUrl + '/api/stripe/postPayment';
  const getJWTdataUrl: string = appContext.appUrl + '/api/auth/getJWTdata';
  const [userBearer, setUserBearer] = useState('');
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
        setUserBearer(data.jwt);
        setUserEmail(data.userPrismaEmail);
        setDataFetched(true);
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    };
    fetchJWTData();
  }, []);

  const dynamicSubTitle = (price) => {
    // console.log(price);
    // Product:
    if (price.product.id === 'prod_PekRAlmgJOLnAB') {
      return <p className="mt-1 text-[#f1592a]">Unismart</p>;
      // Product:
    } else if (price.product.id === 'prod_PekRZbK0LeH6SM') {
      return <p className="mt-1 text-[#f1592a]">Unimeet</p>;
    } else {
      return <p className="mt-1 text-[#f1592a]">Unicollab</p>;
    }
  };

  const dynamicDescription = (price) => {
    if (price.product.id === 'prod_PekRAlmgJOLnAB') {
      // Unismart
      return (
        <div>
          {/* <span className="text-600">Unismart</span> */}
          <ul className="flex-grow-1 m-0 list-none p-0 text-left">
            <li className="align-items-center mb-3 flex">
              <i className="pi pi-check-circle mr-2 text-green-500"></i>
              <span>
                Enregistrement et retranscription de la voix en temps réel
                depuis votre microphone et haut-parleurs
              </span>
            </li>
            <li className="align-items-center mb-3 flex">
              <i className="pi pi-check-circle mr-2 text-green-500"></i>
              <span>
                Interprète intelligent et traduction multilinguistique
              </span>
            </li>
            <li className="align-items-center mb-3 flex">
              <i className="pi pi-check-circle mr-2 text-green-500"></i>
              <span>
                Taxis, VTC, cabinets médicaux, salles scolaires, de réunions, de
                conférences, de formations, etc...
              </span>
            </li>
          </ul>
        </div>
      );
    } else if (price.product.id === 'prod_PekRZbK0LeH6SM') {
      // Unimeet
      return (
        <div>
          {/* <span className="text-600">Unimeet</span> */}
          <ul className="flex-grow-1 m-0 list-none p-0 text-left">
            <li className="align-items-center mb-3 flex">
              <i className="pi pi-check-circle mr-2 text-green-500"></i>
              <span>Création de réunions publiques</span>
            </li>
            {/* <li className="align-items-center mb-3 flex">
              <i className="pi pi-check-circle mr-2 text-green-500"></i>
              <span>
                Enregistrement et retranscription de la réunion en temps réel
              </span>
            </li> */}
            <li className="align-items-center mb-3 flex">
              <i className="pi pi-check-circle mr-2 text-green-500"></i>
              <span>Partage de flux vidéo et audio</span>
            </li>
            <li className="align-items-center mb-3 flex">
              <i className="pi pi-check-circle mr-2 text-green-500"></i>
              <span>
                Collaboration en temps réelle: partage d'écrean, sondage, chat
              </span>
            </li>
          </ul>
        </div>
      );
    } else if (price.product.id === 'prod_PoWfDUyjbzDqMe') {
      // Unimeet
      return (
        <div>
          {/* <span className="text-600">Unimeet</span> */}
          <ul className="flex-grow-1 m-0 list-none p-0 text-left">
            <li className="align-items-center mb-3 flex">
              <i className="pi pi-check-circle mr-2 text-green-500"></i>
              <span>Collaboration en temps réel</span>
            </li>
            <li className="align-items-center mb-3 flex">
              <i className="pi pi-check-circle mr-2 text-green-500"></i>
              <span>Chat d'entreprise</span>
            </li>
          </ul>
        </div>
      );
    }
  };

  // POST request
  const [checkoutUrl, setCheckoutUrl] = useState('');

  async function handleSubscription() {
    try {
      // e.preventDefault();

      const data = `${price.id},${userEmail}`;
      const response = await fetch(postPayment, {
        body: data,
        headers: {
          // 'Content-Type': 'application/json',
          // authorization: `bearer ${session?.user?.accessToken}`,
          authorization: `Bearer ${userBearer}`,
        },
        method: 'POST',
      });

      if (response.ok) {
        const sessionUrl = await response.text();
        setCheckoutUrl(sessionUrl);

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

  // Confirm dialog
  const [visible, setVisible] = useState<boolean>(false);
  const toast = useRef<Toast>(null);

  const dialogMessage = (
    <p>
      Accusez-vous réception de la <a href="/cgu">lecture des CGU</a>, notamment
      vis à vis de la gestion et du traitement de vos données ?
    </p>
  );
  const accept = () => {
    handleSubscription();
    toast.current?.show({
      severity: 'success',
      summary: 'Succès',
      detail: 'Vous avez accepté les CGU avec succès',
      life: 3000,
    });
  };
  const reject = () => {
    toast.current?.show({
      severity: 'warn',
      summary: 'Avertissement',
      detail: 'Veuillez accepter les CGU pour continuer',
      life: 3000,
    });
  };

  return (
    <div className="col-12 lg:col-4 w-full">
      <Toast ref={toast} />
      <ConfirmDialog
        group="declarative"
        visible={visible}
        onHide={() => setVisible(false)}
        message={dialogMessage}
        header="Confirmation"
        icon="pi pi-exclamation-triangle"
        accept={accept}
        acceptLabel="Oui"
        reject={reject}
        rejectLabel="Non"
        style={{ width: '50vw' }}
        breakpoints={{ '1100px': '75vw', '960px': '100vw' }}
      />
      {/* <div className="card justify-content-center flex">
        <Button
          onClick={() => setVisible(true)}
          icon="pi pi-check"
          label="Confirmer"
        />
      </div> */}

      <div className="h-full p-3">
        <div
          className="shadow-2 flex-column flex h-full p-3"
          style={{ borderRadius: '6px' }}
        >
          <div className="text-900 mb-2 text-xl font-medium">
            {dynamicSubTitle(price)}
          </div>
          <hr className="border-top-1 border-bottom-none border-300 mx-0 my-3" />
          <div className="align-items-center flex">
            <span className="text-900 text-2xl font-bold">
              {' '}
              {(price.unit_amount / 100).toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              })}
            </span>
            <span className="text-600 ml-2 font-medium">par mois</span>
          </div>
          <hr className="border-top-1 border-bottom-none border-300 mx-0 my-3" />
          {dynamicDescription(price)}
          <hr className="border-top-1 border-bottom-none border-300 mx-0 mb-3 mt-auto" />
          <Button
            label="Acheter"
            onClick={() => setVisible(true)}
            className="mt-auto w-full p-3"
          />
        </div>
      </div>
    </div>
  );
};

export default PricingCard;
