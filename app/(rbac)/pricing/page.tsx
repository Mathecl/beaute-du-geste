'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { AppContext, appContext } from '@/types/appContext';
import PricingCard from '@/ui/stripe/PricingCard';

import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { Skeleton } from 'primereact/skeleton';
import { Button } from 'primereact/button';

// import { Metadata } from 'next';
// Metadata is usable only in server components
// export const metadata: Metadata = {
//   title: 'Access',
//   description: 'Sign in to your account to gain access',
// };

let isPricesReady: boolean = false;

const Pricing = () => {
  const [prices, setPrices] = useState([]);

  // App Context
  const getPricesUrl: string = appContext.appUrl + '/api/stripe/getPrices';
  const getJWTdataUrl: string = appContext.appUrl + '/api/auth/getJWTdata';

  // App router
  const router = useRouter();

  // App confirm dialogue
  const [visible, setVisible] = useState<boolean>(false);
  const toast = useRef<Toast>(null);

  const dialogMessage = (
    <p>
      Accusez-vous réception de la <a href="/cgu">lecture des CGU</a>, notamment
      vis à vis de la gestion et du traitement de vos données ?
    </p>
  );
  const accept = () => {
    router.push('/contact');
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

  useEffect(() => {
    // GET request
    const fetchData = async () => {
      try {
        const res = await fetch(getJWTdataUrl, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          method: 'GET',
        });
        const jwtData = await res.json();

        if (jwtData.name !== 'JsonWebTokenError') {
          const response = await fetch(getPricesUrl, {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              authorization: `Bearer ${jwtData.jwt}`,
            },
            method: 'GET',
          });
          const data = await response.json();

          setPrices(data);
          isPricesReady = true;
        }
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <section className="align-center ml-auto mr-auto w-3/4 justify-center text-center">
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

      <div className="text-900 mb-4 pt-6 text-center text-6xl font-bold">
        Plan de tarification
      </div>
      <div className="text-700 line-height-3 mb-6 text-center text-xl">
        Plan de tarification sous forme d'abonnements mensuels ou de licences
        annuels pour tous les différents widgets. Veuillez{' '}
        <Link href="/contact">nous contacter</Link> pour demander toute création
        de widget dédié
      </div>

      {/* Update here "grid-cols-x" with x equals to the number of widgets */}
      <div className="grid grid-cols-1 justify-center gap-3 lg:grid-cols-3">
        {' '}
        {isPricesReady ? (
          // If prices array is available
          prices.map((price) => <PricingCard price={price} key={price[0]} />)
        ) : (
          // If prices array is not available yet, show skeleton loading animation
          <>
            <Skeleton
              width="30%"
              height="500px"
              className="mr-6 w-full"
            ></Skeleton>
            <Skeleton width="30%" height="500px" className="w-full"></Skeleton>
          </>
        )}
        <div className="col-12 lg:col-4 w-full">
          <div className="h-full p-3">
            <div
              className="shadow-2 flex-column flex p-3"
              style={{ borderRadius: '6px' }}
            >
              <div className="text-900 mb-2 text-xl font-medium">
                Entreprise
              </div>
              <div className="text-600">
                Tarification annuelle avec licences
              </div>
              <hr className="border-top-1 border-bottom-none border-300 mx-0 my-3" />
              <div className="align-items-center flex">
                <span className="text-900 text-2xl font-bold">Prix</span>
                <span className="text-600 ml-2 font-medium">adapté à vous</span>
              </div>
              <hr className="border-top-1 border-bottom-none border-300 mx-0 my-3" />
              <ul className="flex-grow-1 m-0 list-none p-0 text-left">
                <li className="align-items-center mb-3 flex">
                  <i className="pi pi-check-circle mr-2 text-green-500"></i>
                  <span>
                    Donner accès aux employés de votre entreprise les widgets
                    souhaités
                  </span>
                </li>
                <li className="align-items-center mb-3 flex">
                  <i className="pi pi-check-circle mr-2 text-green-500"></i>
                  <span>
                    Spécifier la quantité de licences à générer pour chaque
                    widger en fonction du nombre d'employés
                  </span>
                </li>
              </ul>
              <hr className="border-top-1 border-bottom-none border-300 mx-0 mb-3" />
              <Button
                label="Créer un devis"
                onClick={() => setVisible(true)}
                className="p-button-outlined w-full p-3"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
