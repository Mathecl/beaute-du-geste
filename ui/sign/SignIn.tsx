'use client';
import React, { useState, useRef } from 'react';

import { AppContext, appContext } from '@/types/appContext';
import { signIn } from '@/utils/auth/signIn';

import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';

import '@/styles/sign.css';

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
  // Router
  const searchParams = useSearchParams();
  const companyNameFromSearchParam = searchParams
    ?.get('company')
    ?.replace(/\s/g, '');
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

        // Automatically route based on company name from searchParams
        if (
          companyNameFromSearchParam &&
          companyNameFromSearchParam !== null &&
          companyNameFromSearchParam !== undefined
        ) {
          window.location.replace(
            '/unicash/' + companyNameFromSearchParam.toLowerCase(),
          );
        } else {
          window.location.replace('/');
        }
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
    <div className="flex min-h-full flex-col justify-center">
      <Toast ref={toast} />

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
            <p className="mt-10 text-center text-sm text-white">
              Mot de passé oublié ?&nbsp;
              <Link
                href="/resetpassword"
                className="formLinks font-semibold leading-6 text-green-600 hover:text-green-500"
              >
                Réinitialisez le ici
              </Link>
            </p>
          </div>
          <div>
            <Button
              type="submit"
              className="flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 "
              loading={isButtonLoading}
              pt={{
                root: { className: 'bg-green-500 border-green-500' },
              }}
            >
              Se connecter
            </Button>
          </div>
        </form>

        {/* <p className="mt-10 text-center text-sm text-white">
          Pas encore enregistré(e) à Unigate ?&nbsp;
          <span className="formLinks font-semibold leading-6 text-white ">
            Inscrivez-vous depuis le bouton en haut du formulaire
          </span>
        </p> */}
      </div>
    </div>
  );
};
export default SignIn;
