'use client';
import React, { useState, useRef } from 'react';
import { Suspense } from 'react';

import { AppContext, appContext } from '@/types/appContext';
import { signIn } from '@/utils/auth/signIn';
import Logo from '../../../public/icon-512x512.png';

import Link from 'next/link';
import Image from 'next/image';

import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';

interface Users {
  users: {
    userEmail: string;
    userPassword: string;
    id: string;
  }[];
}
interface FormData {
  userEmail: string;
  userPassword: string;
  id: string;
}

const SignIn = ({ users }: Users) => {
  // Notification
  const toast = useRef(null);

  const showError = () => {
    toast.current.show({
      severity: 'error',
      summary: 'Les informations entrées sont invalides',
      detail:
        "Veuillez s'il vous plaît vérifier votre email et/ou mot de passe",
      life: 3000,
    });
  };

  const showSuccess = () => {
    toast.current.show({
      severity: 'success',
      summary: 'Connecté(e) avec succès',
      detail: 'Vous vous êtes connecté(e) avec succès',
      life: 3000,
    });
  };

  // Button state
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);

  // Typesafe form
  const [form, setForm] = useState<FormData>({
    userEmail: '',
    userPassword: '',
    id: '',
  });

  async function create(data: FormData) {
    if (
      data.userEmail.length > 6 &&
      data.userPassword.length >= 6 &&
      data.userEmail.includes('@') &&
      data.userEmail.includes('.')
    ) {
      // Sign in user
      try {
        const result = await signIn({
          email: data.userEmail,
          password: data.userPassword,
        }).then(() =>
          // clear the form
          setForm({
            userEmail: '',
            userPassword: '',
            id: '',
          }),
        );
        await result;
        showSuccess();
        window.location.replace('/client');
      } catch (error) {
        showError();
        return error;
      }
    } else {
      showError();
    }
  }

  const handleSubmit = async (data: FormData) => {
    try {
      setIsButtonLoading(true);
      create(data); // call create function with data parameter
      setIsButtonLoading(false);
    } catch (error) {
      return error;
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <Toast ref={toast} />
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Suspense fallback={<p>Chargement de l'image...</p>}>
          <Image
            src={Logo}
            width={512}
            height={512}
            alt="Profile picture"
            className="mx-auto h-10 w-auto"
          />
        </Suspense>
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Connexion
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault(); // don't wanna call the default form actions, otherwise refresh the page
            handleSubmit(form); // call arrow function to submit
          }}
          className="space-y-6"
          method="POST"
        >
          <div className="mt-2 w-full">
            {/* <input
              type="email"
              // placeholder="Email"
              value={form.userEmail}
              onChange={(e) => setForm({ ...form, userEmail: e.target.value })}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              required
            /> */}
            <span className="p-float-label block py-1.5">
              <InputText
                id="email"
                value={form.userEmail}
                onChange={(e) =>
                  setForm({ ...form, userEmail: e.target.value })
                }
                keyfilter="email"
              />
              <label htmlFor="email">Email</label>
            </span>
          </div>

          <div className="mt-4 w-full">
            {/* <input
              type="password"
              // placeholder="Password"
              value={form.userPassword}
              onChange={(e) =>
                setForm({ ...form, userPassword: e.target.value })
              }
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              required
            /> */}
            <span className="p-float-label block py-1.5">
              <Password
                value={form.userPassword}
                onChange={(e) =>
                  setForm({ ...form, userPassword: e.target.value })
                }
                toggleMask
              />
              <label htmlFor="password">Mot de passe</label>
            </span>
          </div>
          <div className="text-sm">
            <p className="mt-10 text-center text-sm text-gray-500">
              Mot de passé oublié ?&nbsp;
              <Link
                href="/resetpassword"
                className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
              >
                Réinitialisez le ici
              </Link>
            </p>
          </div>
          <div>
            <Button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              loading={isButtonLoading}
            >
              Se connecter
            </Button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Pas encore enregistré(e) à Unigate ?&nbsp;
          <Link
            href="/signup"
            className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
          >
            Créez un compte puis choisissez les fonctionnalités adaptés à vos
            besoins
          </Link>
        </p>
      </div>
    </div>
  );
};
export default SignIn;
