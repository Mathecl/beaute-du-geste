'use client';
import React, { useRef, useState } from 'react';
import { Suspense } from 'react';

import { AppContext, appContext } from '@/types/appContext';

import Logo from '../../../public/icon-512x512.png';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Divider } from 'primereact/divider';

interface Users {
  users: {
    userEmail: string;
    userPinCode: string;
  }[];
}
interface FormData {
  userEmail: string;
  userPinCode: string;
}

const ActiveAccount = ({ users }: Users) => {
  // Router
  const router = useRouter();
  // Notification
  const toast = useRef<Toast>(null);
  // Button state
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);

  // Form data
  const [checkUserEmail, setCheckUserEmail] = useState('');
  const [checkUserPinCode, setCheckPinCode] = useState('');

  // App Context
  const activateAccountUrl: string =
    appContext.appUrl + '/api/manageVerification';

  async function create(data: FormData) {
    const filledPinCode: string = data.userPinCode;
    const dataToVerify: string = `${filledPinCode},${data.userEmail}`;

    try {
      fetch(activateAccountUrl, {
        body: JSON.stringify(dataToVerify),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          // authorization: `bearer ${session?.user?.accessToken}`,
        },
        method: 'POST',
      }).then(() =>
        // clear the form
        setForm({
          userEmail: '',
          userPinCode: '',
        }),
      );
      router.replace('/sign');
    } catch (error) {
      return error;
    }
  }

  const handleSubmit = async (data: FormData) => {
    try {
      setIsButtonLoading(true);
      await checkForm(data);
      await create(data);
      setIsButtonLoading(false);
    } catch (error) {
      return error;
    }
  };
  // Typesafe register form
  const [form, setForm] = useState<FormData>({
    userEmail: '',
    userPinCode: '',
  });
  async function checkForm(data: FormData) {
    setForm(data);
    setCheckUserEmail(data.userEmail);
    setCheckPinCode(data.userPinCode);
  }

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
          Validation de votre compte
        </h2>
      </div>

      <div className="mt-14 sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="leading-7-gray-900 text-base font-semibold">
          Formulaire
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">
          Entrez votre email et le code pin reçu par email
        </p>
        <br />
        <form
          onSubmit={(e) => {
            e.preventDefault(); // don't wanna call the default form actions, otherwise refresh the page
            handleSubmit(form); // call arrow function to submit
          }}
          className="space-y-6"
          method="POST"
        >
          <div className="mt-4">
            <span className="p-float-label block">
              <InputText
                value={form.userEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, userEmail: e.target.value })
                }
                keyfilter="email"
                tooltip="Entrez votre adresse email"
                tooltipOptions={{ event: 'both', position: 'top' }}
                required
              />
              <label>Email</label>
            </span>
          </div>
          <div className="mt-5">
            <span className="p-float-label">
              <Password
                inputId="password"
                value={form.userPinCode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, userPinCode: e.target.value })
                }
                required
                feedback={true}
                toggleMask
                tooltip="Entrez le code PIN"
                tooltipOptions={{
                  event: 'both',
                  position: 'top',
                }}
              />
              <label>Code PIN</label>
            </span>
          </div>
          <div className="mt-6 w-full justify-center text-center">
            <Button
              type="submit"
              label="Valider"
              outlined
              loading={isButtonLoading}
            />
          </div>
        </form>
      </div>
    </div>
  );
};
export default ActiveAccount;
