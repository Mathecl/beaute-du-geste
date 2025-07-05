'use client';
import React, { useRef, useState, ChangeEvent } from 'react';
import { Suspense } from 'react';

import { AppContext, appContext } from '@/types/appContext';

import Logo from '../../../public/icon-512x512.png';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Divider } from 'primereact/divider';

interface Users {
  users: {
    userEmail: string;
    userNewPassword: string;
  }[];
}
interface FormData {
  userEmail: string;
  userNewPassword: string;
}

const ResetPassword = ({ users }: Users) => {
  // Router
  const router = useRouter();
  // Notification
  const toast = useRef<Toast>(null);

  // Button state
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);

  // Form data
  const [checkUserEmail, setCheckUserEmail] = useState('');
  const [checkNewUserPwd, setCheckNewUserPwd] = useState('');

  const pwdHeader = (
    <div className="mb-3 font-bold">
      Politique relative aux mots de passe: exigences en matière de sécurité
    </div>
  );
  const pwdFooter = (
    <>
      <Divider />
      <p className="mt-2">
        Votre mot de passe doit remplir toutes les conditions ci-dessous:
      </p>
      <ul className="line-height-3 ml-2 mt-0 pl-2">
        <li>Au moins une minuscule</li>
        <li>Au moins une majuscule</li>
        <li>Au moins un chiffre</li>
        <li>Minimum 8 caractères</li>
      </ul>
    </>
  );

  // App Context
  const resetPasswordUrl: string = appContext.appUrl + '/api/resetPassword';
  const sendPinCodeEmail: string = appContext.appUrl + '/api/sendPinCodeEmail';

  async function sendEmail(data: FormData) {
    fetch(sendPinCodeEmail, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // authorization: `bearer ${session?.user?.accessToken}`,
      },
    }).then((res) => {
      // clear the form
      setForm({
        userEmail: '',
        userNewPassword: '',
      });
      if (!res.ok) throw new Error('Failed to send verification email');
      return res.json();
    });
  }

  // Typesafe register form
  const [form, setForm] = useState<FormData>({
    userEmail: '',
    userNewPassword: '',
  });
  async function checkForm(data: FormData) {
    setForm(data);
    setCheckUserEmail(data.userEmail);
    setCheckNewUserPwd(data.userNewPassword);
  }

  const handleSubmit = async (data: FormData) => {
    try {
      setIsButtonLoading(true);
      await checkForm(data);
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
      await sleep(1000);
      if (
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data.userEmail) &&
        /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})./.test(
          data.userNewPassword,
        )
      ) {
        await sendEmail(data);
        setModalVis(true);
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail:
            'Veuillez vérifier que les champs correspondants soient adaptés aux exigences de sécurité',
          life: 5000,
        });
      }
      setIsButtonLoading(false);
    } catch (error) {
      return error;
    }
  };

  // Typesafe verifier form
  const [modalVis, setModalVis] = useState(false);
  const [state, setState] = useState({ value: '' });
  const handleChange = (event: ChangeEvent<{ value: string }>) => {
    setState({ value: event?.currentTarget?.value });
  };

  const resetPassword = async () => {
    const filledPinCode: string = state.value;
    const dataToVerify: string = `${filledPinCode},${checkUserEmail},${checkNewUserPwd}`;

    fetch(resetPasswordUrl, {
      body: JSON.stringify(dataToVerify),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // authorization: `bearer ${session?.user?.accessToken}`,
      },
      method: 'POST',
    }).then((res) => {
      var stringifiedRes = JSON.stringify(res.ok);
      if (stringifiedRes == 'true') {
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Le code PIN entré est correcte',
          life: 5000,
        });
        setModalVis(false);
        router.replace(appContext.appUrl + '/sign');
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Le code PIN entré est incorrecte',
          life: 5000,
        });
      }
    });
    // await manageVerification(dataToVerify).then((data) => {
    //   setPinCodeComparison(data.message);
    // });
  };

  const [isModalButtonLoading, setIsModalButtonLoading] =
    useState<boolean>(false);
  const handleModal = async () => {
    try {
      setIsModalButtonLoading(true);
      await resetPassword();
      setIsModalButtonLoading(false);
    } catch (error) {
      return error;
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <Toast ref={toast} />
      <Dialog
        header="Enregistrement"
        visible={modalVis}
        onHide={() => setModalVis(false)}
        style={{ width: '75vw' }} // centered modal
        breakpoints={{ '960px': '75vw', '641px': '100vw' }} // responsive
        maximizable
        closeOnEscape={false}
        closable={false}
      >
        <div className="m-0">
          <div className="mx-auto mt-1 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-1 lg:mx-0 lg:flex lg:max-w-none">
            <div className="p-8 sm:p-10 lg:flex-auto">
              <h3 className="text-2xl font-bold tracking-tight text-gray-900">
                Vérifier les détails:
              </h3>
              <p className="mt-6 text-base leading-7 text-gray-600">
                <div>
                  <div className="grid">
                    <span className="p-float-label">
                      <InputText
                        onChange={handleChange}
                        tooltip="Entrez le code pin reçu par email"
                        tooltipOptions={{
                          event: 'both',
                          position: 'top',
                        }}
                        required
                      />
                      <label>Code PIN</label>
                      <small id="username-help">
                        A conserver si vous êtes voué(e) à avoir le rôle
                        d'administrat(eur/trice) pour accéder à certaines
                        ressources de Beauté du geste
                      </small>
                    </span>
                  </div>
                </div>
              </p>
              <div className="mt-10 flex items-center gap-x-4">
                <h4 className="flex-none text-sm font-semibold leading-6 text-indigo-600">
                  Résumé
                </h4>
                <div className="h-px flex-auto bg-gray-100"></div>
              </div>
              <ul
                role="list"
                className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600 sm:grid-cols-2 sm:gap-6"
              >
                <li className="flex gap-x-3">{checkUserEmail}</li>
              </ul>
            </div>
            <div className="mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
              <div className="rounded-2xl bg-gray-50 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
                <div className="mx-auto max-w-xs px-6">
                  <Button
                    label="Accéder à Beauté du geste"
                    onClick={handleModal}
                    // size="small"
                    outlined
                    // raised
                    // rounded
                    iconPos="right"
                    icon="pi pi-file-edit"
                    className="mt-10"
                    loading={isModalButtonLoading}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Dialog>

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
          Réinitialisation de votre mot de passe
        </h2>
      </div>

      <div className="mt-14 sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="leading-7-gray-900 text-base font-semibold">
          Entrez votre email ainsi que votre nouveau mot de passe
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">
          Un email vous sera envoyé pour valider ce changement
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
          <div className="mt-4">
            <span className="p-float-label">
              <Password
                inputId="password"
                value={form.userNewPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, userNewPassword: e.target.value })
                }
                required
                feedback={true}
                header={pwdHeader}
                footer={pwdFooter}
                toggleMask
                tooltip="Entrez votre nouveau mot de passe"
                tooltipOptions={{
                  event: 'both',
                  position: 'top',
                }}
              />
              <label>Nouveau mot de passe</label>
            </span>
          </div>

          <div className="mt-6 w-full justify-center text-center">
            <Button
              type="submit"
              label="Réinitialiser"
              // size="small"
              outlined
              // raised
              // rounded
              iconPos="right"
              // icon="pi pi-file-edit"
              loading={isButtonLoading}
            />
          </div>
        </form>
      </div>
    </div>
  );
};
export default ResetPassword;
