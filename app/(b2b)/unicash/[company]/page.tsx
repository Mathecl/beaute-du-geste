'use client';
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { DeferredContent } from 'primereact/deferredcontent';
import { Checkbox } from 'primereact/checkbox';
import { Dialog } from 'primereact/dialog';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { SelectButton, SelectButtonChangeEvent } from 'primereact/selectbutton';
import { Divider } from 'primereact/divider';

import { AppContext, appContext } from '@/types/appContext';

import { SkeletonCard } from '@/ui/SkeletonCard';
import { Skeleton } from 'primereact/skeleton';
import ProductCard from '@/ui/unicash/ProductCard';
import CartCRUD from '@/ui/unicash/cartCRUD';

let productsAmount = '0';

interface PayMethods {
  name: string;
  value: string;
  disabled?: boolean;
}
interface ConsTypes {
  name: string;
  value: string;
  disabled?: boolean;
}
interface City {
  value: string;
  label: string;
}

let borneMode = '';

export default function Company() {
  // App context
  const getJWTdataUrl: string = appContext.appUrl + '/api/auth/getJWTdata';

  const getSignUpUrl: string =
    appContext.appUrl + '/sign?company=The%20Brother%27s';

  const getProductsUrl: string = appContext.appUrl + '/api/unicash/getProducts';
  const getUIDdataUrl: string = appContext.appUrl + '/api/unicash/getCartUID';
  const getUIDCartdataUrl: string =
    appContext.appUrl + '/api/unicash/getDataFromCartUID';

  const getPaymentUrl: string =
    appContext.appUrl + '/api/unicash/postPaymentUnicash';
  const getPaymentGuestUrl: string =
    appContext.appUrl + '/api/unicash/postPaymentGuestUnicash';

  const getPrePaymentUrl: string =
    appContext.appUrl + '/api/unicash/prePaymentUnicash';

  // App router
  const params = useParams();
  const router = useRouter();

  // App notification
  const toast = useRef(null);
  const showSuccess = (message) => {
    toast.current.show({
      severity: 'success',
      summary: 'Succès',
      detail: message,
    });
  };
  const showError = (message) => {
    toast.current.show({
      severity: 'error',
      summary: 'Erreur',
      detail: message,
    });
  };

  // Fetch Jwt
  const [jwtData, setJwtData] = useState('');
  // Check company name
  const [isCompanyCorrect, setIsCompanyCorrect] = useState(false);
  const [isCheckEnded, setIsCheckEnded] = useState(false);
  // Check cart
  const [isCartLoading, setIsCartLoading] = useState(true);
  // Fetch cart data
  const [cartData, setCartData] = useState('');
  // Fetch products
  const [productsData, setProductsData] = useState('');
  const [filteredProductsData, setFilteredProductsData] = useState('');
  const [loading, setLoading] = useState(true); // Add a loading state to indicate when data is being fetched
  // Payment
  const [isPaymentLoading, setIsPaymentLoading] = useState(false); // Add a loading state to indicate when data is being fetched
  useEffect(() => {
    const fetchJwt = async () => {
      try {
        const jwtRes = await fetch(getJWTdataUrl, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          method: 'GET',
        });
        const jwtData = await jwtRes.json();
        const userCompanyFromJwt = JSON.stringify(jwtData.userPrismaCompany);
        setJwtData(jwtData);

        if (userCompanyFromJwt) {
          borneMode = 'normal';
        } else {
          borneMode = 'guest';
        }

        if (
          (params?.company !== '' && borneMode == 'guest') ||
          params?.company ===
            userCompanyFromJwt.replace(/"/g, '').toLocaleLowerCase()
        ) {
          setIsCompanyCorrect(true);
        } else {
          setIsCompanyCorrect(false);
        }

        setIsCheckEnded(true);

        const uidRes = await fetch(getUIDdataUrl, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            // authorization: `Bearer ${jwtData.jwt}`,
          },
          method: 'GET',
        });

        if (uidRes.status === 200) {
          const uidDataRes = await fetch(getUIDCartdataUrl, {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              // authorization: `Bearer ${jwtData.jwt}`,
            },
            method: 'GET',
          });
          const uidDataFromRes = await uidDataRes.json();

          setCartData(uidDataFromRes);
          productsAmount = JSON.stringify(uidDataFromRes.length);
          setIsCartLoading(false);
        }
      } catch (error) {
        showError(`Une erreur est survenue: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    fetchJwt();
  }, []);

  // Overlay panel for shopping cart items
  const op = useRef(null);
  async function opManage(e) {
    op.current.toggle(e);
    refreshCartData();
    op.current.hide(e);

    await new Promise((resolve) => setTimeout(resolve, 500));

    refreshCartData();
    op.current.toggle(e);
  }
  async function refreshCartData() {
    const uidDataRes = await fetch(getUIDCartdataUrl, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // authorization: `Bearer ${jwtData.jwt}`,
      },
      method: 'GET',
    });
    const uidDataFromRes = await uidDataRes.json();

    productsAmount = JSON.stringify(uidDataFromRes.length);
    setCartData(uidDataFromRes);
  }

  // Payment
  async function performPayment() {
    try {
      setIsPaymentLoading(true);

      if (borneMode == 'guest') {
        const stringifiedCartData = JSON.stringify(cartData);
        const dataToSend: string = `${stringifiedCartData}|${params?.company}|${payMethod}|${consType}`;

        const response = await fetch(getPaymentGuestUrl, {
          body: dataToSend,
          headers: {
            // 'Content-Type': 'application/json',
            // authorization: `bearer ${session?.user?.accessToken}`,
            // authorization: `Bearer ${jwtData.jwt}`,
          },
          method: 'POST',
        });

        if (response.ok) {
          const sessionUrl = await response.text();
          // Open the URL in a new window
          if (sessionUrl) {
            window.open(sessionUrl, '_blank');
          }
        } else {
          // Handle error
          console.error('Error:', response.status, response.statusText);
        }
      } else if (borneMode == 'normal') {
        const stringifiedCartData = JSON.stringify(cartData);
        const dataToSend: string = `${stringifiedCartData}| ${jwtData.userPrismaEmail}|${payMethod}|${consType}`;

        const response = await fetch(getPaymentUrl, {
          body: dataToSend,
          headers: {
            // 'Content-Type': 'application/json',
            // authorization: `bearer ${session?.user?.accessToken}`,
            authorization: `Bearer ${jwtData.jwt}`,
          },
          method: 'POST',
        });

        if (response.ok) {
          const sessionUrl = await response.text();
          // Open the URL in a new window
          if (sessionUrl) {
            window.open(sessionUrl, '_blank');
          }
        } else {
          // Handle error
          console.error('Error:', response.status, response.statusText);
        }
      }

      setIsPaymentLoading(false);
    } catch (error) {
      return error;
    }
  }

  // Filter through products
  const [products, setProducts] = useState<string[]>([]);
  const onProductChange = (e: CheckboxChangeEvent) => {
    let _products = [...products];

    if (e.checked) _products.push(e.value);
    else _products.splice(_products.indexOf(e.value), 1);

    setProducts(_products);
  };

  // On data changes
  useEffect(() => {
    // Convert the categoryOptions object to an array
    const categoriesToFilter = Object.values(products);

    // Function to filter data based on categories
    const filterData = (data, categories) => {
      // Initialize an empty array to hold filtered items
      const filteredData = [];

      // Iterate through each key in the data object
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          // Get the current item
          const item = data[key];
          // Check if the category is in the list of categories to filter
          if (categories.includes(item.category)) {
            // Add the item to the filtered data array
            filteredData.push(item);
          }
        }
      }

      // Return the filtered data
      return filteredData;
    };

    // Call the function to filter the data
    const filteredData = filterData(productsData, categoriesToFilter);
    setFilteredProductsData(filteredData);
  }, [products]);

  // MANDATORY POPUP FOR PAYMENT METHOD + CONS TYPE + GEOLOCATION
  // ============================================================

  // Payment method + cons type
  const [payMethod, setPayMethod] = useState<PayMethods>(null);
  const payMethodsItems: PayMethods[] = [
    { name: 'Liquide', value: 'cash' },
    { name: 'Carte bleue', value: 'credit card' },
  ];
  const [consType, setConsType] = useState<ConsTypes>(null);
  const consTypesItems: PayMethods[] = [
    { name: 'Sur place', value: 'on prem' },
    { name: 'Click and collect', value: 'click and collect' },
    { name: 'Livraison', value: 'delivery', disabled: true },
  ];

  const [selectedCity, setSelectedCity] = useState('');
  const cities: City[] = [
    { value: 'Paris', label: 'Paris' },
    { value: 'Marseille', label: 'Marseille' },
    { value: 'Lyon', label: 'Lyon' },
    { value: 'Toulouse', label: 'Toulouse' },
    { value: 'Nice', label: 'Nice' },
    { value: 'Nantes', label: 'Nantes' },
    { value: 'Montpellier', label: 'Montpellier' },
    { value: 'Strasbourg', label: 'Strasbourg' },
    { value: 'Bordeaux', label: 'Bordeaux' },
    { value: 'Lille', label: 'Lille' },
    { value: 'Rennes', label: 'Rennes' },
    { value: 'Reims', label: 'Reims' },
    { value: 'Toulon', label: 'Toulon' },
    { value: 'Saint-Etienne', label: 'Saint-Etienne' },
    { value: 'Le Havre', label: 'Le Havre' },
    { value: 'Dijon', label: 'Dijon' },
    { value: 'Grenoble', label: 'Grenoble' },
    { value: 'Villeurbanne', label: 'Villeurbanne' },
    { value: 'Saint-Denis (La Réunion)', label: 'Saint-Denis (La Réunion)' },
  ];

  const handleCity = (option: City, props) => {
    if (option) {
      return (
        <div className="align-items-center flex">
          {/* <img
            alt={option.label}
            src="https://primefaces.org/cdn/primereact/images/flag/flag_placeholder.png"
            className={`flag mr-2 flag-${option.label.toLowerCase()}`}
            style={{ width: '18px' }}
          /> */}
          <div>{option.label}</div>
        </div>
      );
    }
    return <span>{props.placeholder}</span>;
  };
  const cityOption = (option: City) => {
    return (
      <div className="align-items-center flex">
        {/* <img
          alt={option.label}
          src="https://primefaces.org/cdn/primereact/images/flag/flag_placeholder.png"
          className={`flag mr-2 flag-${option.label.toLowerCase()}`}
          style={{ width: '18px' }}
        /> */}
        <div>{option.label}</div>
      </div>
    );
  };

  // Confirmation modal + verify pin code
  const [confirmationModal, setConfirmationModal] = useState<boolean>(false);
  // Modal on jwt data changes
  useEffect(() => {
    async function handleModal() {
      setConfirmationModal(true);
      if (jwtData.name == 'JsonWebTokenError') {
        borneMode = 'guest';
        // setConfirmationModal(false);
      } else {
        borneMode = 'normal';
        // setConfirmationModal(true);
      }
    }
    handleModal();
  }, [jwtData]);
  // Modal on payment method or cons type changes
  useEffect(() => {
    async function handleModal() {
      if (payMethod !== null && consType !== null && selectedCity !== '') {
        const dataToSend: string = `${payMethod}| ${consType}| ${selectedCity} | ${params?.company}`;

        await fetch(getPrePaymentUrl, {
          body: dataToSend,
          headers: {
            // 'Content-Type': 'application/json',
            // authorization: `bearer ${session?.user?.accessToken}`,
            // authorization: `Bearer ${jwtData.jwt}`,
          },
          method: 'POST',
        });

        const productsRes = await fetch(getProductsUrl, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            // authorization: `Bearer ${jwtData.jwt}`,
          },
          method: 'GET',
        });
        const products = await productsRes.json();
        setProductsData(products);
        setFilteredProductsData(products);

        setConfirmationModal(false);
      }
    }
    handleModal();
  }, [payMethod, consType, selectedCity]);

  return (
    <div style={{ padding: '1.75rem' }}>
      <Toast ref={toast} />
      <Dialog
        // header="Vérification d'identité"
        visible={confirmationModal}
        closable={false}
        onHide={() => setConfirmationModal(false)}
        style={{ width: '50vw' }}
        breakpoints={{ '960px': '75vw', '641px': '100vw' }}
      >
        <div className="text-center">
          {jwtData.name === 'JsonWebTokenError' && (
            <div className="w-full">
              <Divider align="center">
                <Button
                  icon="pi pi-sign-in"
                  label="Se connecter"
                  onClick={() => router.push(getSignUpUrl)}
                  rounded
                />
                <br />
                <br />
                <strong className="text-lg">OU</strong>
              </Divider>
            </div>
          )}

          <b>Moyen de payement</b>
          <SelectButton
            value={payMethod}
            onChange={(e: SelectButtonChangeEvent) => setPayMethod(e.value)}
            optionLabel="name"
            options={payMethodsItems}
            optionDisabled="disabled"
            className="mb-4 mt-2"
          />
          <b>Moyen de consommation</b>
          <SelectButton
            value={consType}
            onChange={(e: SelectButtonChangeEvent) => setConsType(e.value)}
            optionLabel="name"
            options={consTypesItems}
            optionDisabled="disabled"
            className="mb-4 mt-2"
          />
          <b>Localisation</b>
          <br />
          <Dropdown
            value={selectedCity}
            onChange={(e: DropdownChangeEvent) =>
              setSelectedCity(e.target.value)
            }
            options={cities}
            optionLabel="label"
            placeholder="Ville"
            filter
            valueTemplate={handleCity}
            itemTemplate={cityOption}
            className="mb-3 w-1/3"
            required
          />
        </div>
      </Dialog>

      {isCheckEnded ? (
        <main>
          {isCompanyCorrect ? (
            <div>
              <div className="container mx-auto w-full">
                <div className="card justify-content-left mb-6 flex text-center">
                  <Button
                    type="button"
                    label="Panier"
                    icon="pi pi-shopping-cart"
                    outlined
                    badge={productsAmount}
                    badgeClassName="p-badge-danger"
                    onClick={(e) => opManage(e)}
                    loading={isCartLoading}
                  />
                  <OverlayPanel
                    ref={op}
                    showCloseIcon
                    closeOnEscape
                    // dismissable={false}
                  >
                    <div>
                      <CartCRUD data={cartData} />
                      <br />
                      <Button
                        label="Payer"
                        icon="pi pi-chevron-right"
                        iconPos="right"
                        // loading={isAddToCardLoading}
                        onClick={performPayment}
                        loading={isPaymentLoading}
                        autoFocus
                      />
                    </div>
                  </OverlayPanel>
                </div>

                <div className="justify-content-center mb-7 flex flex-wrap gap-3">
                  <div className="align-items-center flex">
                    <Checkbox
                      inputId="product1"
                      name="menu"
                      value="Menu"
                      onChange={onProductChange}
                      checked={products.includes('Menu')}
                    />
                    <label htmlFor="ingredient4" className="mr-3 flex">
                      <div className="mr-1">
                        <svg
                          fill="#000000"
                          height="25px"
                          width="25px"
                          version="1.1"
                          id="Layer_1"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512 512"
                        >
                          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                          <g
                            id="SVGRepo_tracerCarrier"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></g>
                          <g id="SVGRepo_iconCarrier">
                            {' '}
                            <g>
                              {' '}
                              <g>
                                {' '}
                                <path d="M476.075,345.745c-16.567-23.6-42.607-37.135-71.442-37.135h-6.897c3.82-9.363,13.012-15.986,23.733-15.986 c5.329,0,9.647-4.319,9.647-9.647c0-5.328-4.318-9.647-9.647-9.647c-11.543,0-22.08,4.378-30.046,11.558 c-5.818-13.068-16.943-23.263-30.627-27.841l5.895-81.511h11.512c2.871,0,5.594-1.28,7.427-3.49 c1.833-2.211,2.585-5.123,2.053-7.945l-11.84-62.769c-0.861-4.557-4.841-7.859-9.48-7.859h-43.108l11.722-66.841 c0.486-2.777,2.21-5.096,4.727-6.364c2.516-1.267,5.405-1.273,7.926-0.013l52.54,26.269c4.768,2.383,10.561,0.451,12.944-4.314 c2.383-4.766,0.451-10.56-4.314-12.942L356.258,3c-8.026-4.013-17.224-3.999-25.238,0.039s-13.499,11.423-15.049,20.262 l-12.306,70.174H112.158c-4.638,0-8.62,3.301-9.48,7.859l-11.84,62.769c-0.532,2.822,0.22,5.734,2.053,7.945 c1.833,2.211,4.556,3.49,7.427,3.49h11.512l9.303,128.84H81.025c-33.669,0-61.06,27.391-61.06,61.06v13.866 c0,3.909,2.328,7.266,5.67,8.783c-3.594,5.854-5.67,12.734-5.67,20.091s2.076,14.238,5.67,20.091 c-3.342,1.516-5.67,4.874-5.67,8.783v30.408c0,24.547,19.97,44.519,44.518,44.519h116.003c0.05,0,0.099-0.004,0.148-0.004h180.141 l-0.22-0.158c0.369-0.027,0.74-0.032,1.109-0.067c4.441-0.412,8.851-1.381,13.107-2.884c3.679-1.299,7.519-1.958,11.416-1.958 c1.839,0,3.676,0.147,5.451,0.435c2.048,0.334,4.053,0.846,5.955,1.519c5.919,2.095,12.015,3.138,18.055,3.138 c7.409,0,14.734-1.57,21.544-4.692c5.07-2.332,9.794-5.31,14.042-8.857c0.076-0.059,0.149-0.121,0.224-0.183 c4.834-4.063,9.01-8.808,12.412-14.102c2.54-3.953,4.637-8.201,6.236-12.626l16.617-45.987 C496.524,398.433,492.641,369.346,476.075,345.745z M376.542,305.661v2.949h-2.951c-17.623,0-31.961-14.337-31.961-31.96V273.7 h2.951C362.205,273.7,376.542,288.036,376.542,305.661z M120.806,156.24c-0.024,0-0.049,0.004-0.073,0.004h-8.777l8.2-43.475 h238.208l8.201,43.475h-8.776c-0.024,0-0.048-0.004-0.073-0.004H120.806z M39.259,365.438c0-23.03,18.736-41.766,41.766-41.766 h82.92c23.03,0,41.766,18.736,41.766,41.766v4.219h-19.227H58.486H39.259V365.438z M205.712,467.46 c0,13.908-11.315,25.225-25.225,25.225H64.484c-13.908-0.001-25.225-11.316-25.225-25.225v-20.761h19.227h127.999h19.227V467.46z M186.485,427.405H58.486c-10.601,0-19.227-8.626-19.227-19.227c0-10.601,8.626-19.227,19.227-19.227h127.999 c10.601,0,19.227,8.626,19.227,19.227S197.086,427.405,186.485,427.405z M217.146,492.679c4.952-7.175,7.86-15.863,7.86-25.221 V437.05c0-3.909-2.328-7.266-5.67-8.783c3.594-5.854,5.67-12.734,5.67-20.091c0-7.357-2.076-14.238-5.67-20.091 c3.342-1.516,5.67-4.874,5.67-8.783v-13.866c0-33.669-27.391-61.06-61.06-61.06h-23.468l-9.303-128.839h216.172l-5.703,78.868 h-9.659c-5.329,0-9.647,4.319-9.647,9.647v12.598c0,14.536,6.093,27.667,15.847,37.004c-16.688,5.933-31.241,16.931-41.88,32.089 c-16.567,23.6-20.449,52.689-10.651,79.807l16.62,45.987c2.84,7.86,7.253,15.045,12.854,21.141H217.146z M468.58,418.995 l-16.618,45.99c-1.107,3.069-2.561,6.012-4.319,8.749c-2.31,3.594-5.137,6.825-8.407,9.606c-0.071,0.055-0.138,0.112-0.207,0.169 c-2.978,2.512-6.305,4.62-9.885,6.265c-7.766,3.563-16.684,3.884-25.109,0.899c-2.982-1.055-6.105-1.852-9.291-2.374 c-2.805-0.455-5.683-0.686-8.554-0.686c-6.089,0-12.091,1.029-17.838,3.057c-2.758,0.974-5.604,1.601-8.47,1.866 c-5.777,0.542-11.533-0.417-16.648-2.763c-10.711-4.912-18.814-13.717-22.816-24.791l-16.62-45.986 c-7.633-21.124-4.607-43.783,8.296-62.166c12.905-18.383,33.187-28.927,55.646-28.927h36.894 c22.462,0,42.745,10.543,55.651,28.927C473.187,375.213,476.213,397.872,468.58,418.995z"></path>{' '}
                              </g>{' '}
                            </g>{' '}
                            <g>
                              {' '}
                              <g>
                                {' '}
                                <path d="M449.757,364.221c-3.11-4.43-6.798-8.353-10.961-11.661c-4.171-3.313-10.24-2.618-13.555,1.554 c-3.313,4.173-2.617,10.24,1.554,13.555c2.713,2.154,5.124,4.723,7.17,7.638c6.8,9.688,8.394,21.63,4.372,32.763l-16.616,45.985 c-1.81,5.011,0.783,10.541,5.795,12.352c1.083,0.391,2.189,0.576,3.279,0.576c3.948,0,7.653-2.443,9.073-6.371l16.616-45.986 C462.671,397.498,460.218,379.125,449.757,364.221z"></path>{' '}
                              </g>{' '}
                            </g>{' '}
                            <g>
                              {' '}
                              <g>
                                {' '}
                                <circle
                                  cx="404.63"
                                  cy="350.402"
                                  r="9.647"
                                ></circle>{' '}
                              </g>{' '}
                            </g>{' '}
                          </g>
                        </svg>
                      </div>
                      Menu
                    </label>
                  </div>
                  <div className="align-items-center flex">
                    <Checkbox
                      inputId="product2"
                      name="entree"
                      value="Entrée"
                      onChange={onProductChange}
                      checked={products.includes('Entrée')}
                    />
                    <label htmlFor="ingredient1" className="mr-3 flex">
                      <div className="mr-1">
                        <svg
                          fill="#000000"
                          viewBox="0 0 100 100"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          height="35"
                          width="35"
                        >
                          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                          <g
                            id="SVGRepo_tracerCarrier"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></g>
                          <g id="SVGRepo_iconCarrier">
                            {' '}
                            <g id="_x31_"></g>{' '}
                            <g id="_x32_">
                              {' '}
                              <path d="M73.8,86.5C73.8,86.5,73.8,86.5,73.8,86.5c-0.8,0-47.2,0-47.6,0c-0.8,0-1.4-0.6-1.5-1.4l-5-53.1c0-0.4,0.1-0.8,0.4-1.2 c0.3-0.3,0.7-0.5,1.1-0.5h10.2c0.8,0,1.5,0.7,1.5,1.5c0,4.6,1.8,8.8,5,12.1c0.1,0.1,0.3,0.3,0.4,0.4c2.1,1.9,4.6,3.3,7.3,4 c0,0,0,0,0.1,0c0,0,0,0,0,0c2.3,0.6,4.9,0.7,7.2,0.3c0.2,0,0.4-0.1,0.6-0.1c2.7-0.6,5.2-1.8,7.3-3.5c0.1-0.1,0.3-0.2,0.4-0.4 c3.7-3.3,5.8-8,5.8-12.9c0-0.8,0.7-1.5,1.5-1.5h10.2c0.4,0,0.8,0.2,1.1,0.5c0.3,0.3,0.4,0.7,0.4,1.2l-5,53.1 C75.2,85.9,74.6,86.5,73.8,86.5z M22.8,33.4l4.7,50.1c7,0,38,0,44.9,0l4.7-50.1H70c-0.4,5.2-2.8,10.1-6.8,13.6 c-0.1,0.1-0.3,0.3-0.5,0.4c-2.5,2-5.4,3.5-8.5,4.1c-0.2,0.1-0.5,0.1-0.8,0.2c-2.7,0.5-5.7,0.4-8.4-0.3c-0.1,0-0.2,0-0.3-0.1 c-3.1-0.9-6-2.5-8.4-4.7c-0.2-0.2-0.3-0.3-0.5-0.5c-3.4-3.4-5.4-7.9-5.8-12.7H22.8z M36.8,46.5c-0.4,0-0.8-0.2-1.1-0.4 c-3.4-3.4-5.4-7.9-5.8-12.7h-1c-0.8,0-1.5-0.7-1.5-1.5V15c0-0.8,0.7-1.5,1.5-1.5h7.9c0.8,0,1.5,0.7,1.5,1.5v30 c0,0.6-0.4,1.2-0.9,1.4C37.2,46.5,37,46.5,36.8,46.5z M30.4,30.4h1c0.8,0,1.5,0.7,1.5,1.5c0,3.1,0.8,6.1,2.4,8.8V16.5h-4.9V30.4z M45.2,51.3c-0.1,0-0.3,0-0.4-0.1c-3.2-0.8-6.1-2.5-8.5-4.7c-0.3-0.3-0.5-0.7-0.5-1.1V24.4c0-0.8,0.7-1.5,1.5-1.5h7.9 c0.8,0,1.5,0.7,1.5,1.5v25.5c0,0.5-0.2,0.9-0.6,1.2C45.8,51.2,45.5,51.3,45.2,51.3z M38.8,44.8c1.5,1.3,3.1,2.3,4.9,3V25.9h-4.9 V44.8z M62.3,47.3c-0.2,0-0.4,0-0.6-0.1c-0.5-0.2-0.9-0.8-0.9-1.4V15c0-0.8,0.7-1.5,1.5-1.5h7.9c0.8,0,1.5,0.7,1.5,1.5v16.9 c0,0.8-0.7,1.5-1.5,1.5H70c-0.4,5.2-2.8,10.1-6.8,13.6C63,47.2,62.6,47.3,62.3,47.3z M63.8,16.5V42c2.1-2.9,3.3-6.5,3.3-10.1 c0-0.8,0.7-1.5,1.5-1.5h0.1V16.5H63.8z M53.9,51.6c-0.3,0-0.7-0.1-0.9-0.3c-0.4-0.3-0.6-0.7-0.6-1.2V24.4c0-0.8,0.7-1.5,1.5-1.5 h7.9c0.8,0,1.5,0.7,1.5,1.5v21.9c0,0.4-0.2,0.9-0.5,1.2c-2.5,2-5.4,3.5-8.5,4.1C54.1,51.6,54,51.6,53.9,51.6z M55.4,25.9v22.3 c1.8-0.6,3.4-1.5,4.9-2.6V25.9H55.4z M50,52c-1.7,0-3.5-0.2-5.1-0.7c-0.7-0.2-1.1-0.8-1.1-1.5V19.4c0-0.8,0.7-1.5,1.5-1.5h7.9 c0.8,0,1.5,0.7,1.5,1.5v30.9c0,0.7-0.5,1.4-1.2,1.5C52.3,51.9,51.2,52,50,52z M46.8,48.7c1.6,0.3,3.3,0.4,4.9,0.2V20.9h-4.9V48.7z M49.8,79.1c-5.6,0-10.1-4.5-10.1-10.1s4.5-10.1,10.1-10.1S59.9,63.4,59.9,69S55.4,79.1,49.8,79.1z M49.8,61.9 c-3.9,0-7.1,3.2-7.1,7.1s3.2,7.1,7.1,7.1s7.1-3.2,7.1-7.1S53.7,61.9,49.8,61.9z"></path>{' '}
                            </g>{' '}
                            <g id="_x33_"></g> <g id="_x34_"></g>{' '}
                            <g id="_x35_"></g> <g id="_x36_"></g>{' '}
                            <g id="_x37_"></g> <g id="_x38_"></g>{' '}
                            <g id="_x39_"></g> <g id="_x31_0"></g>{' '}
                            <g id="_x31_1"></g> <g id="_x31_2"></g>{' '}
                            <g id="_x31_3"></g> <g id="_x31_4"></g>{' '}
                            <g id="_x31_5"></g> <g id="_x31_6"></g>{' '}
                            <g id="_x31_7"></g> <g id="_x31_8"></g>{' '}
                            <g id="_x31_9"></g> <g id="_x32_0"></g>{' '}
                            <g id="_x32_1"></g> <g id="_x32_2"></g>{' '}
                            <g id="_x32_3"></g> <g id="_x32_4"></g>{' '}
                          </g>
                        </svg>
                      </div>
                      <p className="mt-1">Entrée</p>
                    </label>
                  </div>
                  <div className="align-items-center flex">
                    <Checkbox
                      inputId="product3"
                      name="plat"
                      value="Plat"
                      onChange={onProductChange}
                      checked={products.includes('Plat')}
                    />
                    <label htmlFor="ingredient2" className="mr-3 flex">
                      <div className="mr-1">
                        <svg
                          viewBox="0 -10 166 166"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          height="28"
                          width="28"
                        >
                          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                          <g
                            id="SVGRepo_tracerCarrier"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></g>
                          <g id="SVGRepo_iconCarrier">
                            {' '}
                            <g clip-path="url(#clip0)">
                              {' '}
                              <path
                                d="M9.40077 124.121C9.16337 124.004 8.91292 123.916 8.6553 123.858C2.48574 123.464 -0.326766 120.152 0.920275 114.075C1.65236 110.572 2.81123 107.172 4.37118 103.951C5.34781 101.928 7.35949 100.407 8.85463 98.7163C8.35975 96.5504 7.39067 94.2224 7.42086 91.9055C7.44974 89.6634 8.50664 87.4345 9.16101 85.0199C4.29232 80.4741 4.15697 79.5014 7.60798 71.6174C5.69805 69.6412 5.48777 67.2489 5.7864 64.5289C6.61076 57.0329 7.59466 49.5781 10.4602 42.5448C17.7456 24.6668 30.663 12.3986 48.7182 6.00781C70.6433 -1.75207 92.7776 -1.8683 114.603 6.65949C124.687 10.5975 133.589 16.4698 139.945 25.4787C142.462 28.913 144.574 32.6258 146.24 36.5439C148.448 42.0381 150.021 47.7974 151.676 53.499C152.828 57.4653 153.186 61.4808 150.298 65.2069C152.995 67.3867 155.341 69.5592 156.473 72.745C157.645 76.0412 156.76 78.91 154.874 81.7703C158.324 85.2935 158.819 89.4219 157.274 94.0911C160.195 96.3286 162.867 98.8975 164.072 102.533C164.769 104.417 165.218 106.384 165.409 108.384C165.775 114.828 163.249 117.688 156.992 118.422C156.841 121.313 156.813 124.194 156.518 127.046C155.918 132.854 152.551 136.623 147.051 137.994C141.817 139.242 136.509 140.162 131.16 140.751C121.131 141.957 111.086 143.081 101.019 143.88C84.4355 145.192 67.8171 145.787 51.2071 144.354C41.9304 143.554 32.6706 142.535 23.4261 141.422C20.7643 141.028 18.1531 140.346 15.6391 139.387C14.1285 138.891 12.7979 137.961 11.8152 136.711C10.8326 135.461 10.2417 133.949 10.1167 132.364C9.77016 129.609 9.62721 126.825 9.40077 124.121ZM145.649 61.9468C144.221 55.9512 143.06 50.2569 141.481 44.6813C139.948 38.9205 137.317 33.51 133.731 28.7473C127.468 20.633 119.118 15.5805 109.743 12.0586C95.5342 6.72191 80.8375 5.75775 65.9747 8.21573C45.2744 11.6353 28.7342 21.3366 18.6299 40.4852C14.5901 48.1401 12.7056 56.3462 11.2262 64.9784C12.3095 65.4288 13.4298 65.7859 14.5739 66.0458C18.3426 66.5472 22.1341 67.3368 25.9054 67.2751C40.715 67.031 55.5191 66.4658 70.3276 66.0937C82.3346 65.7918 94.3436 65.6026 106.352 65.3472C117.347 65.1142 128.347 64.9076 139.242 63.1761C141.314 62.846 143.366 62.3885 145.649 61.9468ZM135.464 114.167C133.633 115.582 131.903 116.792 130.316 118.173C127.432 120.677 124.363 121.105 121.005 119.283C119.698 118.639 118.435 117.909 117.225 117.098C114.148 114.856 111.162 114.646 107.919 116.844C105.752 118.242 103.498 119.503 101.172 120.616C99.2839 121.632 97.1764 122.171 95.0321 122.184C92.8885 122.197 90.7738 121.685 88.8737 120.692C87.1672 119.85 85.4837 118.947 83.8612 117.954C82.9306 117.314 81.8417 116.945 80.7141 116.888C79.5865 116.829 78.4648 117.085 77.4731 117.626C75.4883 118.658 73.5042 119.711 71.6179 120.908C70.2252 121.872 68.6027 122.452 66.9139 122.591C65.2256 122.729 63.5301 122.42 61.9988 121.695C60.0438 120.854 58.1868 119.801 56.4603 118.557C53.5869 116.414 50.684 116.281 47.6491 117.914C45.877 118.868 44.1957 119.997 42.4952 121.081C38.1194 123.872 33.817 123.651 29.5902 120.776C28.5709 120.083 27.6086 119.304 26.6405 118.538C24.1149 116.54 21.4895 116.517 18.8503 118.226C17.6637 118.995 16.5979 119.949 15.6469 120.687C16.0407 123.197 16.3224 125.309 16.7031 127.402C17.5373 131.991 17.8252 132.266 22.3205 133.215C22.6486 133.285 22.9889 133.302 23.3204 133.36C37.2672 135.715 51.3705 137.027 65.5125 137.283C88.2475 137.842 110.771 135.153 133.274 132.364C136.714 131.938 140.13 131.252 143.524 130.531C145.99 130.006 147.338 128.312 147.58 125.793C147.777 123.722 147.943 121.648 148.139 119.374C143.006 119.939 139.155 117.899 135.464 114.167ZM7.35162 117.514C8.8822 116.738 10.079 116.209 11.1954 115.545C12.3492 114.856 13.3933 113.985 14.5393 113.281C20.0762 109.88 25.0314 110.189 30.0767 114.215C30.7768 114.775 31.4725 115.342 32.1643 115.916C34.4313 117.793 36.7783 117.95 39.2783 116.35C41.0425 115.158 42.8701 114.062 44.7532 113.068C49.7781 110.574 54.6643 110.601 59.2908 114.151C60.4655 115.011 61.706 115.778 63.0006 116.444C63.9186 116.998 64.9814 117.264 66.0522 117.207C67.1227 117.151 68.1518 116.774 69.0063 116.126C70.8513 114.854 72.8013 113.741 74.8353 112.799C78.8613 110.978 82.8636 110.961 86.6815 113.516C87.7041 114.201 88.8107 114.759 89.8654 115.397C91.2739 116.34 92.9246 116.856 94.6193 116.882C96.3139 116.909 97.9804 116.446 99.4178 115.548C101.555 114.317 103.725 113.137 105.811 111.824C110.274 109.018 114.621 109.16 119.103 111.861C124.607 115.179 124.652 115.105 129.744 111.298C134.01 108.107 137.217 108.002 141.797 110.937C143.076 111.756 144.314 112.643 145.67 113.566C147.442 111.357 147.938 107.741 151.138 107.964C153.632 108.138 156.038 109.631 158.554 110.564C161.072 106.775 158.865 100.366 154.277 97.9261C150.545 99.0419 147.181 100.348 143.696 101.042C130.679 103.638 117.423 104.085 104.239 105.191C97.7966 105.732 91.3363 104.94 84.9002 105.721C83.6801 105.868 82.3543 105.099 81.0712 104.776C79.8162 104.459 78.5534 103.907 77.2952 103.909C63.9407 103.934 50.5822 104.233 37.2323 104.058C30.8658 103.975 24.508 102.999 18.1395 102.521C16.9271 102.421 15.7074 102.58 14.5604 102.985C9.86697 104.754 6.8994 110.526 7.35162 117.516V117.514ZM52.4287 72.9091C52.4663 73.1349 52.5035 73.3607 52.5402 73.5865C61.5629 80.5863 70.5389 87.6472 79.6266 94.5604C84.32 98.1309 83.6538 99.3989 88.77 93.9277C94.7427 87.5441 100.434 80.9007 106.234 74.3577C106.726 73.8024 107.113 73.1533 108.002 71.9194L52.4287 72.9091ZM71.3022 97.2021C67.8479 94.2998 64.9876 91.9744 62.2244 89.5387C60.9518 88.4164 59.6588 88.1762 57.9582 88.2038C45.5141 88.4007 33.0656 89.6589 20.6175 88.1348C19.0993 87.9491 17.5073 88.316 15.9571 88.4702C14.4521 88.6192 13.8956 89.6438 13.7676 91.003C13.5937 92.85 14.3554 94.1574 16.459 94.7008C19.0418 95.4569 21.6989 95.9321 24.3837 96.1185C38.8514 96.6351 53.3279 96.9816 67.7974 97.3721C68.6644 97.3984 69.538 97.2953 71.3022 97.2048V97.2021ZM150.94 84.8092C146.771 85.877 142.922 87.2409 138.961 87.8054C127.538 89.4836 116.005 90.3027 104.459 90.2555C103.715 90.1852 102.97 90.3795 102.355 90.8035C100.201 93.0173 98.1845 95.3637 95.8512 97.9622C99.2222 97.9622 102.004 98.1374 104.758 97.9307C114.817 97.1779 124.884 96.4703 134.911 95.3893C139.696 94.8656 144.422 93.9021 149.03 92.5113C153.188 91.2629 153.726 88.2083 150.94 84.8118V84.8092ZM109.101 82.705C110.625 82.705 111.52 82.7542 112.407 82.6971C119.789 82.2252 127.202 82.0106 134.538 81.1468C139.185 80.4898 143.763 79.4075 148.213 77.9137C151.065 77.0257 151.625 75.3835 150.828 73.0102C149.899 70.247 147.898 68.8188 145.446 69.2802C137.513 70.7773 129.464 71.5708 121.391 71.6522C119.84 71.6673 118.291 71.8012 117.287 71.8491L109.101 82.705ZM13.9919 71.7297C13.1943 73.1572 12.4773 74.6281 11.8447 76.1363C11.0939 78.2497 11.37 78.9468 13.5734 79.6891C15.7994 80.4426 18.0934 80.9794 20.4226 81.2925C29.9224 82.5396 39.4625 81.9935 48.9925 81.7172C49.8539 81.6128 50.7076 81.45 51.5467 81.2295C50.0096 80.0639 48.9756 79.231 47.8914 78.4696C46.24 77.3099 44.2389 76.4704 42.9688 74.991C41.6562 73.4637 40.2908 73.3055 38.5712 73.3036C30.5049 73.2964 22.4088 73.826 13.9919 71.7297Z"
                                fill="#000000"
                              ></path>{' '}
                              <path
                                d="M69.0435 23.3343C69.1938 22.0302 68.966 20.665 70.5215 20.1688C72.0436 19.6831 73.1954 20.4352 73.8236 21.7696C74.5048 23.1699 75.0398 24.6374 75.4178 26.1481C75.7381 27.512 75.4683 28.8824 73.9338 29.5059C72.5791 30.0559 71.1116 29.4257 70.3968 27.7856C69.8553 26.3309 69.4038 24.8443 69.0435 23.3343Z"
                                fill="#000000"
                              ></path>{' '}
                              <path
                                d="M44.626 41.4375C45.1242 41.7853 46.3398 42.1909 46.5348 42.8814C46.653 43.3887 46.6592 43.9158 46.5533 44.4257C46.4475 44.9358 46.2317 45.4165 45.9214 45.8349C44.2536 47.6287 41.8824 48.1978 39.515 48.2864C37.8033 48.352 37.042 46.3903 38.2024 44.7915C39.6404 42.8146 41.7053 41.7453 44.626 41.4375Z"
                                fill="#000000"
                              ></path>{' '}
                              <path
                                d="M125.62 56.5963C124.534 55.7883 123.327 55.3276 123.021 54.5242C122.777 53.8837 123.396 52.5048 124.052 52.0197C125.379 51.0059 126.884 50.2527 128.491 49.7999C129.333 49.584 130.916 50.1281 131.29 50.8113C131.44 51.309 131.461 51.8368 131.35 52.3448C131.24 52.8529 131.002 53.3245 130.659 53.715C129.254 54.8761 127.472 55.5816 125.62 56.5963Z"
                                fill="#000000"
                              ></path>{' '}
                              <path
                                d="M89.1322 46.1309C89.039 43.9466 90.6785 42.8539 92.4743 43.6756C94.1118 44.4245 95.9949 48.0915 95.6825 49.9214C95.4022 51.5622 93.7961 52.4199 92.4533 51.4774C90.7015 50.1872 89.5122 48.2731 89.1322 46.1309Z"
                                fill="#000000"
                              ></path>{' '}
                              <path
                                d="M120.778 31.3896C120.765 33.3455 118.087 36.0358 116.152 36.0306C114.932 36.0273 113.78 34.6739 114.385 33.4407C115.123 31.862 116.221 30.4786 117.592 29.4015C119.052 28.3396 120.791 29.5952 120.778 31.3896Z"
                                fill="#000000"
                              ></path>{' '}
                              <path
                                d="M61.8242 60.6067C59.76 60.4892 57.3442 58.0436 57.3843 56.3503C57.405 56.0152 57.4936 55.6877 57.6439 55.3874C57.7942 55.0872 58.0033 54.8206 58.2592 54.6032C58.5151 54.3859 58.8129 54.2224 59.1335 54.1227C59.4541 54.023 59.7916 53.9891 60.1257 54.023C61.7521 54.2317 63.6144 56.6548 63.5619 58.505C63.5251 59.7888 63.0857 60.7032 61.8242 60.6067Z"
                                fill="#000000"
                              ></path>{' '}
                            </g>{' '}
                            <defs>
                              {' '}
                              <clipPath id="clip0">
                                {' '}
                                <rect
                                  width="165.397"
                                  height="145.707"
                                  fill="white"
                                  transform="translate(0.602539 0.0263672)"
                                ></rect>{' '}
                              </clipPath>{' '}
                            </defs>{' '}
                          </g>
                        </svg>
                      </div>
                      Plat
                    </label>
                  </div>
                  <div className="align-items-center flex">
                    <Checkbox
                      inputId="product4"
                      name="dessert"
                      value="Dessert"
                      onChange={onProductChange}
                      checked={products.includes('Dessert')}
                    />
                    <label htmlFor="ingredient3" className="mr-3 flex">
                      <div className="flex">
                        <svg
                          fill="#000000"
                          viewBox="0 0 100 100"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          height="37"
                          width="37"
                        >
                          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                          <g
                            id="SVGRepo_tracerCarrier"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></g>
                          <g id="SVGRepo_iconCarrier">
                            {' '}
                            <g id="_x31_"></g> <g id="_x32_"></g>{' '}
                            <g id="_x33_"></g> <g id="_x34_"></g>{' '}
                            <g id="_x35_"></g> <g id="_x36_"></g>{' '}
                            <g id="_x37_"></g> <g id="_x38_"></g>{' '}
                            <g id="_x39_"></g> <g id="_x31_0"></g>{' '}
                            <g id="_x31_1"></g> <g id="_x31_2"></g>{' '}
                            <g id="_x31_3"></g>{' '}
                            <g id="_x31_4">
                              {' '}
                              <path d="M57.4,88.5H42.6c-0.8,0-1.4-0.6-1.5-1.3l-3-23.3c-0.1-0.4,0.1-0.9,0.4-1.2c0.3-0.3,0.7-0.5,1.1-0.5h20.8 c0.4,0,0.8,0.2,1.1,0.5c0.3,0.3,0.4,0.8,0.4,1.2l-3,23.3C58.8,88,58.1,88.5,57.4,88.5z M43.9,85.5h12.1l2.6-20.3H41.3L43.9,85.5z M61.7,65.3H38.3c-5.1,0-9.3-4.2-9.3-9.3V44.3c0-0.8,0.7-1.5,1.5-1.5h23.3c0.8,0,1.5,0.7,1.5,1.5v3.5c0,1.6,1.3,2.9,2.9,2.9 c1.6,0,2.9-1.3,2.9-2.9v-3.5c0-0.8,0.7-1.5,1.5-1.5h7c0.8,0,1.5,0.7,1.5,1.5V56C71,61.1,66.8,65.3,61.7,65.3z M32,45.8V56 c0,3.5,2.8,6.3,6.3,6.3h23.4c3.5,0,6.3-2.8,6.3-6.3V45.8h-4v2c0,3.2-2.6,5.9-5.9,5.9c-3.2,0-5.9-2.6-5.9-5.9v-2H32z M58.1,53.6 c-3.2,0-5.9-2.6-5.9-5.9v-2H31.9c-3.5,0-6.4-3.1-6.4-6.9c0-2.9,1.7-5.4,4-6.4c0-0.2,0-0.4,0-0.6c0-3.8,2.9-6.9,6.4-6.9h1.2 C37,24.5,37,24.1,37,23.6c0-3.8,2.9-6.9,6.4-6.9h8.9c3.4-3.3,5.4-6.4,5.4-8.2c0-0.8,0.6-1.5,1.4-1.5c0.8-0.1,1.5,0.5,1.6,1.3 l1.1,8.5c3,0.5,5.3,3.4,5.3,6.8c0,0.6-0.1,1.3-0.2,1.9c2.3,1,4,3.5,4,6.4c0,0.2,0,0.5,0,0.8c2.2,1.1,3.6,3.5,3.6,6.2 c0,3.8-2.9,6.9-6.4,6.9H64v2C64,51,61.4,53.6,58.1,53.6z M36,28c-1.9,0-3.4,1.7-3.4,3.9c0,0.4,0.1,0.8,0.2,1.2 c0.1,0.4,0.1,0.9-0.2,1.2S32,34.9,31.5,35c-1.7,0.2-3,1.9-3,3.8c0,2.2,1.5,3.9,3.4,3.9h21.8c0.8,0,1.5,0.7,1.5,1.5v3.5 c0,1.6,1.3,2.9,2.9,2.9c1.6,0,2.9-1.3,2.9-2.9v-3.5c0-0.8,0.7-1.5,1.5-1.5h5.6c1.9,0,3.4-1.7,3.4-3.9c0-1.8-1.1-3.4-2.7-3.8 c-0.4-0.1-0.7-0.4-0.9-0.7c-0.2-0.4-0.3-0.8-0.1-1.2c0.1-0.5,0.2-0.9,0.2-1.3c0-2-1.4-3.7-3.1-3.9c-0.5,0-1-0.3-1.2-0.8 c-0.2-0.5-0.2-1,0-1.4c0.4-0.7,0.6-1.4,0.6-2.2c0-2.2-1.5-3.9-3.4-3.9h-0.3c-0.8,0-1.4-0.6-1.5-1.3l-0.6-4.2 c-1.1,1.6-2.6,3.3-4.5,5.1c-0.3,0.3-0.6,0.4-1,0.4h-9.5c-1.9,0-3.4,1.8-3.4,3.9c0,0.7,0.2,1.5,0.6,2.1c0.3,0.5,0.3,1,0,1.5 c-0.3,0.5-0.8,0.7-1.3,0.7H36z M59.1,27c0-0.8-0.7-1.5-1.5-1.5H50c-0.8,0-1.5,0.7-1.5,1.5s0.7,1.5,1.5,1.5h7.6 C58.5,28.5,59.1,27.8,59.1,27z M49.1,36c0-0.8-0.7-1.5-1.5-1.5H40c-0.8,0-1.5,0.7-1.5,1.5s0.7,1.5,1.5,1.5h7.6 C48.5,37.5,49.1,36.8,49.1,36z M41.9,60.6c-3.3,0-6-2.7-6-6s2.7-6,6-6s6,2.7,6,6S45.2,60.6,41.9,60.6z M41.9,51.6c-1.7,0-3,1.3-3,3 s1.3,3,3,3s3-1.3,3-3S43.5,51.6,41.9,51.6z"></path>{' '}
                            </g>{' '}
                            <g id="_x31_5"></g> <g id="_x31_6"></g>{' '}
                            <g id="_x31_7"></g> <g id="_x31_8"></g>{' '}
                            <g id="_x31_9"></g> <g id="_x32_0"></g>{' '}
                            <g id="_x32_1"></g> <g id="_x32_2"></g>{' '}
                            <g id="_x32_3"></g> <g id="_x32_4"></g>{' '}
                          </g>
                        </svg>
                      </div>
                      <p className="mt-1">Dessert</p>
                    </label>
                  </div>
                  <div className="align-items-center flex">
                    <Checkbox
                      inputId="product5"
                      name="boisson"
                      value="Boisson"
                      onChange={onProductChange}
                      checked={products.includes('Boisson')}
                    />
                    <label htmlFor="ingredient3" className="flex">
                      <div className="mr-1">
                        <svg
                          viewBox="-137.45 0 613.25 613.25"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="#000000"
                          height="32"
                          width="32"
                        >
                          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                          <g
                            id="SVGRepo_tracerCarrier"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></g>
                          <g id="SVGRepo_iconCarrier">
                            {' '}
                            <defs> </defs> <title></title>{' '}
                            <g data-name="Capa 2" id="Capa_2">
                              {' '}
                              <g id="Outline">
                                {' '}
                                <path
                                  d="M329.85,151.34H317.69V130.08a8.5,8.5,0,0,0-8.5-8.5H206.08V57.52l38.48-37.1a3.5,3.5,0,0,0,.09-5L230.77,1.07A3.52,3.52,0,0,0,228.31,0a3.47,3.47,0,0,0-2.49,1L186.26,39.12a3.63,3.63,0,0,0-.79,1.15l-6.12,14.39a3.61,3.61,0,0,0-.28,1.37v65.55H29.16a8.5,8.5,0,0,0-8.5,8.5v21.26H8.5a8.51,8.51,0,0,0-8.5,8.5v55a8.5,8.5,0,0,0,8.5,8.5H20.27L55.83,605.54a8.5,8.5,0,0,0,8.46,7.71H274.06a8.5,8.5,0,0,0,8.46-7.71L318.08,223.3h11.77a8.5,8.5,0,0,0,8.5-8.5v-55A8.51,8.51,0,0,0,329.85,151.34ZM186.07,56.75l5.56-13.08L228.16,8.45l9,9.36-37,35.7A3.48,3.48,0,0,0,199.08,56v65.55h-13ZM37.66,138.58h263v12.76h-263ZM284.38,402c-58.51,3.19-84.9,40.47-110.45,76.59-25.81,36.48-50.29,71-105.95,74.1L57.05,435.13c59.23-3.38,91.34-40.68,122.43-76.8s60.72-70.49,115.83-73.82ZM266.31,596.25H72l-3.4-36.58c58.89-3.39,85.37-40.81,111-77,25.52-36.07,49.72-70.21,104.08-73.56ZM296,277.44c-58.82,3.18-90.81,40.34-121.79,76.33-31.54,36.63-61.42,71.29-117.78,74.36L37.34,223.3H301Zm25.38-71.14H17v-38H321.35Z"
                                  id="Soda"
                                ></path>{' '}
                              </g>{' '}
                            </g>{' '}
                          </g>
                        </svg>
                      </div>
                      Boisson
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredProductsData.length != 0 ? (
                    <>
                      {filteredProductsData.map((product, index) => (
                        <DeferredContent>
                          <ProductCard
                            name={product.product}
                            price={product.price}
                            description={product.description}
                            category={product.category}
                            quantity={product.quantity}
                            inventoryStatus={product.inventorystatus}
                            rating={product.rate}
                            jwt={jwtData}
                            key={product.uid}
                          />
                        </DeferredContent>
                      ))}
                    </>
                  ) : (
                    <>
                      <Skeleton
                        width="21rem"
                        height="40rem"
                        className="ml-4"
                      ></Skeleton>
                      <Skeleton width="21rem" height="40rem"></Skeleton>
                      <Skeleton width="21rem" height="40rem"></Skeleton>
                      <Skeleton width="21rem" height="40rem"></Skeleton>
                      <Skeleton
                        width="21rem"
                        height="40rem"
                        className="ml-4"
                      ></Skeleton>
                      <Skeleton width="21rem" height="40rem"></Skeleton>
                      <Skeleton width="21rem" height="40rem"></Skeleton>
                      <Skeleton width="21rem" height="40rem"></Skeleton>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <Link href={getSignUpUrl} className="hover:underline">
                Veuillez vous connecter
              </Link>
            </div>
          )}
        </main>
      ) : (
        <div>Chargement en cours...</div>
      )}
    </div>
  );
}
