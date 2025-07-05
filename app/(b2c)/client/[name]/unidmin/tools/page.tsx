'use client';
import React, { useRef, useState, useEffect, ChangeEvent } from 'react';
import { AppContext, appContext } from '@/types/appContext';

import { sendVerificationEmail } from '@/utils/sendVerificationEmail';

import Image from 'next/image';

import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Divider } from 'primereact/divider';

import { useParams, useSearchParams, useRouter } from 'next/navigation';

interface Users {
  users: {
    id: string;
    userName: string;
    userEmail: string;
    userPassword: string;
    companyName: string;
  }[];
}
interface FormData {
  id: string;
  userName: string;
  userEmail: string;
  userPassword: string;
  companyName: string;
}
interface FormIdData {
  customerid: string;
}

const SignUp = ({ users }: Users) => {
  // App router & navigation
  const router = useRouter();
  const params = useParams();
  // Notification
  const toast = useRef<Toast>(null);
  const showInfo = (summary: string, detail: string, duration: number) => {
    toast.current.show({
      severity: 'info',
      summary: summary,
      detail: detail,
      life: duration,
    });
  };
  const showSuccess = (summary: string, detail: string, duration: number) => {
    toast.current.show({
      severity: 'success',
      summary: summary,
      detail: detail,
      life: duration,
    });
  };
  const showError = (summary: string, detail: string, duration: number) => {
    toast.current.show({
      severity: 'error',
      summary: summary,
      detail: detail,
      life: duration,
    });
  };

  // App Context
  const getJWTdataUrl: string = appContext.appUrl + '/api/auth/getJWTdata';
  const getCreateUserUrl: string = appContext.appUrl + '/api/orm/ormCreate';
  const getDeleteUserUrl: string = appContext.appUrl + '/api/orm/ormDelete';
  const getGenerateSidUrl: string =
    appContext.appUrl + '/api/auth/createShareId';
  const updateTokenUsageUrl: string =
    appContext.appUrl + '/api/auth/updateTokenUsage';

  // User JWT Token
  const [userRole, setUserRole] = useState('');
  const [userCompany, setUserCompany] = useState('');
  const [userJwt, setUserJwt] = useState('');
  useEffect(() => {
    try {
      // Fetch JWT Data + Admin DataTable
      const fetchJWTData = async () => {
        try {
          const response = await fetch(getJWTdataUrl, {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            method: 'GET',
          });

          if (response.status == 206) {
            router.push('/access');
          }

          const data = await response.json();
          setUserRole(data.userPrismaRole);
          setUserCompany(data.userPrismaCompany.toLowerCase());
          setUserJwt(data.jwt);
        } catch (error) {
          console.log('Error fetching jwt data:', error);
        }
      };
      fetchJWTData();
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);

  // CREATE AND DELETE USERS
  // Form data
  const [checkUserName, setCheckUserName] = useState('');
  const [checkUserEmail, setCheckUserEmail] = useState('');
  const [checkUserPwd, setCheckUserPwd] = useState('');
  const [checkCompanyName, setCheckCompanyName] = useState('');

  const [checkId, setCheckId] = useState('');

  const pwdHeader = (
    <div className="mb-3 font-bold">
      Politique relative aux mots de passe : exigences en matière de sécurité
    </div>
  );
  const pwdFooter = (
    <>
      <Divider />
      <p className="mt-2">
        Votre mot de passe doit remplir toutes les conditions ci-dessous :
      </p>
      <ul className="line-height-3 ml-2 mt-0 pl-2">
        <li>Au moins une minuscule</li>
        <li>Au moins une majuscule</li>
        <li>Au moins un chiffre</li>
        <li>Minimum 8 caractères</li>
      </ul>
    </>
  );

  // Typesafe pay form + modal
  const [storedEmail, setStoredEmail] = useState('');

  async function create(data: FormData) {
    try {
      const ress = await fetch(updateTokenUsageUrl, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        method: 'GET',
      });
      if (ress.status == 206) {
        router.push('/access');
      }

      const res = await fetch(getCreateUserUrl, {
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          authorization: `Bearer ${userJwt}`,
        },
        method: 'POST',
      });

      if (res.status == 200) {
        setForm({
          id: '',
          userName: '',
          userEmail: '',
          userPassword: '',
          companyName: '',
        }),
          showSuccess('Succès', 'Employé créé avec succès', 3000);
      } else {
        showError(
          'Erreur',
          `Une erreur est survenue en essayant de créer l'employé spécifié`,
          10000,
        );
      }
    } catch (error) {
      return error;
    }
  }

  // Typesafe register form
  const [form, setForm] = useState<FormData>({
    id: '',
    userName: '',
    userEmail: '',
    userPassword: '',
    companyName: '',
  });
  const [formId, setFormId] = useState<FormIdData>({
    customerid: '',
  });
  function checkForm(data: FormData) {
    // console.log('data:' + JSON.stringify(data));
    // console.log('country:' + data.companyCountry.name);
    // console.log('departments::' + data.companyDepartments);
    // console.log('main act:' + data.companyMainActivity);
    // console.log('name:' + data.companyName);
    // console.log('workflows:' + data.companyProjectWorkflows);
    // console.log('projects amount:' + data.companyProjectsAmount);
    // console.log('projects methodo:' + data.companyProjectsMethodologies);
    // console.log('sector of act:' + data.companySectorOfActivity.name);
    // console.log('size:' + data.companySize);
    // console.log('widgets:' + data.companyWidgets);
    // console.log('biz network:' + data.companyBusinessNetwork);
    // console.log('id:' + data.id);
    // console.log('email:' + data.userEmail);
    // console.log('name:' + data.userName);
    // console.log('pwd:' + data.userPassword);

    setCheckUserName(data.userName); // replace spaces by - to have first name or last name of full name in one colomn
    setCheckUserEmail(data.userEmail);
    setCheckUserPwd(data.userPassword);
    setCheckCompanyName(params?.name);
    const stringWithFirstLetterUpperCase =
      params?.name.charAt(0).toUpperCase() + params?.name.slice(1);
    data.companyName = stringWithFirstLetterUpperCase;
  }
  const handleSubmit = async (data: FormData) => {
    try {
      checkForm(data);
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
      await sleep(1000);
      if (
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data.userEmail) &&
        /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})./.test(
          data.userPassword,
        )
      ) {
        await sleep(1000);
        setStoredEmail(data.userEmail); // will be used for comparePinCode() onClick of pin code verification through pay modal
        await create(data); // used to create() user with parameter of data from form: email, password, etc.
        await sleep(2000);
        await sendVerificationEmail(data);
        showInfo(
          'Information',
          "Veuillez demander à l'employé de bien vouloir vérifier son compte avec le code PIN reçu par email",
          3000,
        );
      } else {
        showError(
          'Erreur',
          "Veuillez vérifier que l'email ainsi que le mot de passe correspondent aux exigences",
          10000,
        );
      }
    } catch (error) {
      return error;
    }
  };

  const handleDelete = async () => {
    try {
      // console.log('OK');
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
      await sleep(1000);
      if (formId.customerid.startsWith('cus_')) {
        const ress = await fetch(updateTokenUsageUrl, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          method: 'GET',
        });
        if (ress.status == 206) {
          router.push('/access');
        }

        const res = await fetch(getDeleteUserUrl, {
          body: JSON.stringify(formId.customerid),
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            authorization: `Bearer ${userJwt}`,
          },
          method: 'POST',
        });

        if (res.status == 200) {
          setFormId({
            customerid: '',
          }),
            showSuccess('Succès', 'Employé supprimé avec succès', 3000);
        } else {
          showError(
            'Erreur',
            `Une erreur est survenue en essayant de supprimer l'employé spécifié`,
            10000,
          );
        }
      } else {
        showError(
          'Erreur',
          "Vérifiez que l'identifiant de l'employé commence bien par cus_",
          10000,
        );
      }
    } catch (error) {
      return error;
    }
  };

  // GENERATE SHAREABLE LINK
  const [isSidGenerated, setIsSidGenerated] = useState(false);
  const [generatedSid, setGeneratedSid] = useState('');
  async function generateLink() {
    try {
      const response = await fetch(getGenerateSidUrl, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          authorization: `Bearer ${userJwt}`,
        },
        method: 'GET',
      });

      if (response.status == 200) {
        setIsSidGenerated(true);
        const sid = await response.json();
        setGeneratedSid(JSON.stringify(sid));
        showSuccess(
          'Succès',
          `Lien temporairement partageable créé avec succès`,
          3000,
        );
      }
    } catch (e) {
      showError('Erreur', e, 10000);
    }
  }
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        showSuccess('Succès', 'Lien partageable copié avec succès', 3000);
      },
      (err) => {
        showSuccess(
          'Erreur',
          `Le lien partagé n'a pas pu être copié: ${err}`,
          10000,
        );
      },
    );
  };
  function getGeneratedLink() {
    const generatedLink =
      appContext.appUrl +
      '/client/' +
      userCompany +
      '?sid=' +
      generatedSid.replace(/"/g, '');
    copyToClipboard(generatedLink);
  }

  return (
    <div
      className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8"
      style={{ padding: '1.75rem' }}
    >
      <Toast ref={toast} />

      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Outils Unidmin
        </h2>
      </div>

      {userCompany == params?.name && userRole == 'admin' ? (
        <div className="mt-14 sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="flex">
            <div className="w-1/2">
              <h2 className="leading-7-gray-900 text-base font-semibold">
                Créer un utilisateur
              </h2>
              <br />
              <form
                onSubmit={(e) => {
                  e.preventDefault(); // don't wanna call the default form actions, otherwise refresh the page
                  handleSubmit(form); // call arrow function to submit
                }}
                className="space-y-6"
                method="POST"
              >
                <div className="mt-2 grid">
                  <span className="p-float-label block">
                    <InputText
                      value={form.userName}
                      // keyfilter="alpha" // to avoid spaces
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setForm({ ...form, userName: e.target.value })
                      }
                      tooltip="Entrez le prénom et nom de l'employé"
                      tooltipOptions={{ event: 'both', position: 'top' }}
                      required
                    />
                    <label>Prénom et nom</label>
                  </span>
                </div>
                <div className="mt-5 grid">
                  <span className="p-float-label block">
                    <InputText
                      value={form.userEmail}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setForm({ ...form, userEmail: e.target.value })
                      }
                      // keyfilter={/^\S+@\S+$/}
                      tooltip="Entrez l'adresse email de l'employé"
                      tooltipOptions={{ event: 'both', position: 'top' }}
                      required
                    />
                    <label>Email</label>
                  </span>
                </div>
                <div className="mt-5 grid">
                  <span className="p-float-label">
                    <Password
                      inputId="password"
                      value={form.userPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setForm({ ...form, userPassword: e.target.value })
                      }
                      required
                      feedback={true}
                      header={pwdHeader}
                      footer={pwdFooter}
                      toggleMask
                      tooltip="Entrez le futur mot de passe de l'employé qui correspond aux exigences de sécurité"
                      tooltipOptions={{
                        event: 'both',
                        position: 'top',
                      }}
                    />
                    <label>Mot de passe</label>
                  </span>
                </div>

                <div className="mt-6 w-full justify-center text-center">
                  <Button
                    type="submit"
                    label="Créer"
                    // size="small"
                    outlined
                    // raised
                    // rounded
                    iconPos="right"
                    icon="pi pi-plus"
                    tooltip="L'utilisateur devra vérifier son compte grace au code PIN qui lui aura été envoyé par email"
                    tooltipOptions={{ event: 'both', position: 'top' }}
                  />
                </div>
              </form>
            </div>
            <div className="ml-8 w-1/2">
              <h2 className="leading-7-gray-900 text-base font-semibold">
                Supprimer un utilisateur
              </h2>
              <br />
              <div className="mt-2 grid">
                <span className="p-float-label block">
                  <InputText
                    value={formId.customerid}
                    keyfilter="alphanum" // to avoid spaces
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormId({ ...formId, customerid: e.target.value })
                    }
                    tooltip="Entrez l'identifiant de l'employé dont vous pouvez copier depuis Unidmin"
                    tooltipOptions={{ event: 'both', position: 'top' }}
                    required
                  />
                  <label>Identifiant</label>
                </span>
              </div>

              <div className="mt-6 w-full justify-center text-center">
                <Button
                  type="submit"
                  label="Supprimer"
                  // size="small"
                  outlined
                  // raised
                  // rounded
                  iconPos="right"
                  icon="pi pi-delete-left"
                  onClick={handleDelete}
                />
              </div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <h2 className="leading-7-gray-900 text-base font-semibold">
              Générer un accès temporaire pendant une durée de 4h aux pages de
              votre entreprise sur Unigate
            </h2>
            <div className="mt-4">
              {isSidGenerated ? (
                <div>
                  <Button
                    type="submit"
                    label="Générer"
                    outlined
                    iconPos="right"
                    icon="pi pi-file-edit"
                    className="mr-3"
                    onClick={generateLink}
                    disabled
                  />
                  <Button
                    type="submit"
                    label="Copier"
                    outlined
                    iconPos="right"
                    icon="pi pi-copy"
                    onClick={getGeneratedLink}
                  />
                </div>
              ) : (
                <div>
                  {' '}
                  <Button
                    type="submit"
                    label="Générer"
                    outlined
                    iconPos="right"
                    icon="pi pi-file-edit"
                    className="mr-3"
                    onClick={generateLink}
                  />
                  <Button
                    type="submit"
                    label="Copier"
                    outlined
                    iconPos="right"
                    icon="pi pi-copy"
                    disabled
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="font-small mt-14 leading-6 sm:mx-auto sm:w-full sm:max-w-sm">
          Veuillez attendre quelques instants...
          <br />
          <br />
          Vérifiez que vous remplissiez bien les deux conditions d'accès
          ci-dessous:
          <ul>
            <li>Faire parti de l'entreprise {params?.name}</li>
            <li>Avoir le rôle d'administrateur</li>
          </ul>
        </div>
      )}
    </div>
  );
};
export default SignUp;
