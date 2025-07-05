'use client';
import React, { useState } from 'react';
import { Suspense } from 'react';

import Image from 'next/image';

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';

import { AppContext, appContext } from '@/types/appContext';

function generateRandomCharacters(amount) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < amount; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const ProductCard = ({
  name,
  price,
  description,
  category,
  quantity,
  inventoryStatus,
  rating,
  jwt,
}) => {
  // App context
  const getNewProductToCartUrl: string =
    appContext.appUrl + '/api/unicash/addToCartUID';

  // Images
  const cleanName = name.replace(/\s/g, '');
  const imagePath = `/data/${cleanName.toLowerCase()}.jpg`; // Correctly targets public/data/${cleanName.toLowerCase()}.jpg

  // New product to add
  const newProduct = {
    uid: generateRandomCharacters(4),
    name: { name },
    price: { price },
    description: { description },
    category: { category },
    quantity: { quantity },
    inventoryStatus: { inventoryStatus },
    rating: { rating },
  };

  // Button add to cart
  const [isAddToCardLoading, setAddToCardLoading] = useState<boolean>(false);
  async function addToCart() {
    setAddToCardLoading(true);

    newProduct.name = name;
    newProduct.price = price;
    newProduct.description = description;
    newProduct.category = category;
    newProduct.quantity = quantity;
    newProduct.inventoryStatus = inventoryStatus;
    newProduct.rating = rating;

    await fetch(getNewProductToCartUrl, {
      body: JSON.stringify(newProduct),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        authorization: `Bearer ${jwt.jwt}`,
      },
      method: 'POST',
    });

    setAddToCardLoading(false);
  }

  // Modal on click for more information
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  function handleCardClick() {
    setIsModalVisible(true);
  }
  const modalFooterContent = (
    <div className="justify-content-center flex w-full flex-wrap">
      <Button
        label="Ajouter au panier"
        loading={isAddToCardLoading}
        onClick={() => setIsModalVisible(false)}
        autoFocus
        className="w-full"
      />
    </div>
  );

  return (
    <div className="ml-4 w-auto max-w-xs rounded-lg border border-gray-300 bg-white shadow">
      <div className="card justify-content-center flex">
        <Dialog
          header="Détails"
          visible={isModalVisible}
          onHide={() => setIsModalVisible(false)}
          style={{ width: '30vw' }}
          breakpoints={{ '960px': '75vw', '641px': '100vw' }}
          footer={modalFooterContent}
        >
          <div className="flex flex-col items-center text-center">
            <Suspense fallback={<p>Chargement de l'image...</p>}>
              <Image
                src={imagePath}
                alt={name}
                className="cursor-pointer p-4"
                width={252}
                height={252}
              />
            </Suspense>
            <div className="flex w-full justify-between px-4">
              <span className="text-left text-xl">{name}</span>
              <span className="text-right text-3xl text-blue-500">
                {price}€
              </span>{' '}
            </div>
            <br />
            <div className="justify-left mb-2 flex w-full text-sm">
              <p className="m-0 px-4">Temps de préparation</p>
            </div>
            <div className="justify-left flex w-full px-4">
              <i className="pi pi-clock mr-2" style={{ fontSize: '1rem' }}></i>
              <span>{'<nombre>'} minutes</span>{' '}
            </div>
            <br />
            <p className="m-0 px-4">{description}</p>
          </div>
        </Dialog>
      </div>

      <Suspense fallback={<p>Chargement de l'image...</p>}>
        <div className="mx-auto overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last">
          <Image
            src={imagePath}
            alt={name}
            className="cursor-pointer p-4"
            width={512}
            height={512}
            onClick={handleCardClick}
          />
        </div>
      </Suspense>
      <div className="px-5 pb-5">
        <h5
          className="cursor-pointer text-xl font-semibold tracking-tight text-gray-900 hover:underline dark:text-white"
          onClick={handleCardClick}
        >
          {name}
        </h5>
        <br />
        {inventoryStatus === 'Disponible' && (
          <Tag severity="success" value={inventoryStatus}></Tag>
        )}
        {inventoryStatus === 'Presque épuisé' && (
          <Tag severity="warning" value={inventoryStatus}></Tag>
        )}
        {inventoryStatus === 'Epuisé' && (
          <Tag severity="danger" value={inventoryStatus}></Tag>
        )}
        <br />
        <br />
        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            {price}€
          </span>
          <Button
            // label="Ajouter"
            icon="pi pi-shopping-cart"
            iconPos="right"
            loading={isAddToCardLoading}
            onClick={addToCart}
          />
        </div>
      </div>
    </div>
  );
};
export default ProductCard;
