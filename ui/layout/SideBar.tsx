'use client';
import React, { useState, useEffect } from 'react';

import 'primeicons/primeicons.css';
import { useRouter } from 'next/navigation';
import { Menu } from 'primereact/menu';
import { MenuItem } from 'primereact/menuitem';

import { AppContext, appContext } from '@/types/appContext';

let items: MenuItem[];

const SideBar = () => {
  const router = useRouter();
  // Function to click on close button
  const clickCloseButton = () => {
    const closeButton = document.querySelector(
      'button[data-pc-section="closebutton"]',
    ) as HTMLButtonElement | null; // Cast to HTMLButtonElement or HTMLElement
    if (closeButton) {
      closeButton.click();
    }
  };

  const getJWTdataUrl: string = appContext.appUrl + '/api/auth/getJWTdata';
  const [userCompany, setUserCompany] = useState('');
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

        if (response.ok) {
          setUserCompany(data.userPrismaCompany.toLowerCase());
        } else {
          setUserCompany('undefined');
        }

        setDataFetched(true);
      } catch (error) {
        console.log('Error fetching jwt data:', error);
      }
    };
    fetchJWTData();
  }, []);

  if (userCompany === "thebrother's") {
    items = [
      {
        label: 'Unicash',
        items: [
          {
            label: 'Borne de commande',
            icon: 'pi pi-cart-arrow-down',
            command: () => {
              clickCloseButton();
              router.push('/unicash/' + userCompany);
            },
          },
          {
            label: 'Pointage employés',
            icon: 'pi pi-stopwatch',
            command: () => {
              clickCloseButton();
              router.push('/client/' + userCompany + '/unicash');
            },
          },
          {
            label: "Gestion chiffre d'affaires",
            icon: 'pi pi-euro',
            command: () => {
              clickCloseButton();
              router.push('/client/' + userCompany + '/unicash/sales');
            },
          },
          {
            label: 'Gestion recettes, stock et approvisionnement',
            icon: 'pi pi-gauge',
            command: () => {
              clickCloseButton();
              router.push('/client/' + userCompany + '/unicash/supply');
            },
          },
          {
            label: 'Caisse',
            icon: 'pi pi-wallet',
            command: () => {
              clickCloseButton();
              router.push('/client/' + userCompany + '/unicash/cashdesk');
            },
          },
        ],
      },
    ];
  } else {
    items = [
      {
        label: 'Mon compte',
        items: [
          {
            label: 'Profile',
            icon: 'pi pi-user',
            command: () => {
              clickCloseButton();
              router.push('/profile');
            },
          },
          {
            label: 'Réinitialiser son mot de passe',
            icon: 'pi pi-key',
            command: () => {
              clickCloseButton();
              router.push('/resetpassword');
            },
          },
          {
            label: 'Activer son compte',
            icon: 'pi pi-check',
            command: () => {
              clickCloseButton();
              router.push('/activateaccount');
            },
          },
        ],
      },
      { separator: true },
      {
        label: 'Unigate',
        items: [
          {
            label: 'Blog',
            icon: 'pi pi-pencil',
            command: () => {
              clickCloseButton();
              router.push('/uniblog');
            },
          },
          {
            label: 'Tarification',
            icon: 'pi pi-lock-open',
            command: () => {
              clickCloseButton();
              router.push('/pricing');
            },
          },
          {
            label: 'Nous contacter',
            icon: 'pi pi-send',
            command: () => {
              clickCloseButton();
              router.push('/contact');
            },
          },
        ],
      },
      { separator: true },
      // {
      //   label: 'Unibiz',
      //   items: [
      //     {
      //       disabled: true,
      //       label: "Réseau d'affaires",
      //       icon: 'pi pi-globe',
      //       command: () => {
      //         // toast.current.show({
      //         //   severity: 'success',
      //         //   summary: 'Updated',
      //         //   detail: 'Data Updated',
      //         //   life: 3000,
      //         // });
      //         clickCloseButton();
      //         router.push('/unibiz');
      //       },
      //     },
      //     {
      //       disabled: true,
      //       label: 'Présentation et carte de visite digitale',
      //       icon: 'pi pi-sitemap',
      //       command: () => {
      //         // toast.current.show({
      //         //   severity: 'success',
      //         //   summary: 'Updated',
      //         //   detail: 'Data Updated',
      //         //   life: 3000,
      //         // });
      //         clickCloseButton();
      //         router.push('/unibiz/' + userCompany);
      //       },
      //     },
      //   ],
      // },
      // { separator: true },
      {
        label: 'Uniwork',
        items: [
          {
            label: 'Espace entreprise',
            icon: 'pi pi-users',
            command: () => {
              clickCloseButton();
              router.push('/client/' + userCompany);
            },
          },
        ],
      },
      { separator: true },
      {
        label: 'Unismart',
        items: [
          // {
          //   label: 'Widgets intelligents',
          //   icon: 'pi pi-code',
          //   command: () => {
          //     // toast.current.show({
          //     //   severity: 'success',
          //     //   summary: 'Updated',
          //     //   detail: 'Data Updated',
          //     //   life: 3000,
          //     // });
          //     clickCloseButton();
          //     router.push('/client/' + userCompany + '/unismart');
          //   },
          // },
          {
            label: 'Traducteur vocal instantané',
            icon: 'pi pi-microphone',
            command: () => {
              clickCloseButton();
              router.push('/client/' + userCompany + '/unismart/realtime');
            },
          },
          {
            label: 'Traducteur de fichier et de texte',
            icon: 'pi pi-volume-up',
            command: () => {
              clickCloseButton();
              router.push('/client/' + userCompany + '/unismart/ondemand');
            },
          },
        ],
      },
      { separator: true },
      {
        label: 'Unicash',
        items: [
          {
            label: 'Borne de commande',
            icon: 'pi pi-cart-arrow-down',
            command: () => {
              clickCloseButton();
              router.push('/unicash/' + userCompany);
            },
          },
          {
            label: 'Pointage employés',
            icon: 'pi pi-stopwatch',
            command: () => {
              clickCloseButton();
              router.push('/client/' + userCompany + '/unicash');
            },
          },
          {
            label: "Gestion chiffre d'affaires",
            icon: 'pi pi-euro',
            command: () => {
              clickCloseButton();
              router.push('/client/' + userCompany + '/unicash/sales');
            },
          },
          {
            label: 'Gestion recettes, stock et approvisionnement',
            icon: 'pi pi-gauge',
            command: () => {
              clickCloseButton();
              router.push('/client/' + userCompany + '/unicash/supply');
            },
          },
          {
            label: 'Caisse',
            icon: 'pi pi-wallet',
            command: () => {
              clickCloseButton();
              router.push('/client/' + userCompany + '/unicash/cashdesk');
            },
          },
        ],
      },
      { separator: true },
      {
        label: 'Unimeet',
        items: [
          // {
          //   label: 'Widgets intelligents',
          //   icon: 'pi pi-code',
          //   command: () => {
          //     // toast.current.show({
          //     //   severity: 'success',
          //     //   summary: 'Updated',
          //     //   detail: 'Data Updated',
          //     //   life: 3000,
          //     // });
          //     clickCloseButton();
          //     router.push('/client/' + userCompany + '/unismart');
          //   },
          // },
          {
            label: 'Réunion',
            icon: 'pi pi-video',
            command: () => {
              clickCloseButton();
              router.push('/client/' + userCompany + '/unimeet');
            },
          },
        ],
      },
      { separator: true },
      {
        label: 'Unidmin',
        items: [
          {
            label: 'Administration informatique',
            icon: 'pi pi-wrench',
            command: () => {
              clickCloseButton();
              router.push('/client/' + userCompany + '/unidmin');
            },
          },
        ],
      },
    ];
  }

  const undefinedItems: MenuItem[] = [
    {
      label: 'Mon compte',
      items: [
        // {
        //   label: 'Profile',
        //   icon: 'pi pi-user',
        //   command: () => {
        //     clickCloseButton();
        //     router.push('/profile');
        //   },
        // },
        {
          label: 'Réinitialiser son mot de passe',
          icon: 'pi pi-key',
          command: () => {
            clickCloseButton();
            router.push('/resetpassword');
          },
        },
        {
          label: 'Activer son compte',
          icon: 'pi pi-check',
          command: () => {
            clickCloseButton();
            router.push('/activateaccount');
          },
        },
      ],
    },
    { separator: true },
    {
      label: 'Unicash',
      items: [
        {
          label: 'Borne de commande',
          icon: 'pi pi-cart-arrow-down',
          command: () => {
            clickCloseButton();
            router.push("/unicash/thebrother's");
          },
        },
      ],
    },
    { separator: true },
    {
      label: 'Unigate',
      items: [
        {
          label: 'Blog',
          icon: 'pi pi-pencil',
          command: () => {
            clickCloseButton();
            router.push('/uniblog');
          },
        },
        // {
        //   label: 'Tarification',
        //   icon: 'pi pi-lock-open',
        //   command: () => {
        //     clickCloseButton();
        //     router.push('/pricing');
        //   },
        // },
        {
          label: 'Nous contacter',
          icon: 'pi pi-send',
          command: () => {
            clickCloseButton();
            router.push('/contact');
          },
        },
      ],
    },
  ];

  return (
    <section>
      <div>
        {userCompany == 'undefined' ? (
          <Menu model={undefinedItems} />
        ) : (
          <Menu model={items} />
        )}
      </div>
    </section>
  );
};

SideBar.displayName = 'SideBar';
export default SideBar;
