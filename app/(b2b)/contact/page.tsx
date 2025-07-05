'use client';
import React, { useRef, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';

import { AppContext, appContext } from '@/types/appContext';

import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  emailSubject: string;
  emailBody: string;
  emailType?: string;
  licensesAmount?: number;
  role?: string;
  widget?: string;
}

interface FormType {
  name: string;
}

const Contact = () => {
  // Router
  const router = useRouter();
  // Notification
  const toast = useRef<Toast>(null);
  // Button state
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);

  // Form data
  const [checkFirstName, setCheckFirstName] = useState('');
  const [checkLastName, setCheckLastName] = useState('');
  const [checkEmail, setCheckEmail] = useState('');
  const [checkCompany, setCheckCompany] = useState('');
  const [checkEmailSubject, setCheckEmailSubject] = useState('');
  const [checkEmailBody, setCheckEmailBody] = useState('');
  // const [checkLicensesAmount, setCheckLicensesAmount] = useState(1);
  // const [checkRole, setCheckRole] = useState('');

  // App Context
  const sendContactEmailUrl: string =
    appContext.appUrl + '/api/sendContactEmail';

  // Typesafe pay form + modal
  async function create(data: FormData) {
    try {
      const res = fetch(sendContactEmailUrl, {
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          // authorization: `bearer ${session?.user?.accessToken}`,
        },
        method: 'POST',
      })
        .then((res) => {
          if (res.status === 200) {
            toast.current?.show({
              severity: 'success',
              summary: 'Succès',
              detail: 'Votre email a été envoyé avec succès',
              life: 5000,
            });
            // Clear the form
            setForm({
              firstName: '',
              lastName: '',
              email: '',
              company: '',
              emailSubject: '',
              emailBody: '',
              emailType: '',
              licensesAmount: 1,
              role: '',
              widget: '',
            });
          } else {
            toast.current?.show({
              severity: 'error',
              summary: 'Erreur',
              detail: `Une erreur a été rencontrée, veuillez réessayer`,
              life: 5000,
            });
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          toast.current?.show({
            severity: 'error',
            summary: 'Erreur',
            detail: `Une erreur a été rencontrée, veuillez réessayer`,
            life: 5000,
          });
        });
    } catch (error) {
      return error;
    }
  }

  // Typesafe register form
  const [form, setForm] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    emailSubject: '',
    emailBody: '',
    emailType: '',
    licensesAmount: 1,
    role: '',
    widget: '',
  });

  function checkForm(data: FormData) {
    setCheckFirstName(data.firstName); // replace spaces by - to have first name or last name of full name in one colomn
    setCheckLastName(data.lastName);
    setCheckEmail(data.email);
    setCheckCompany(data.company);
    setCheckEmailSubject(data.emailSubject);
    setCheckEmailBody(data.emailBody);
    // setCheckLicensesAmount(data.licensesAmount);
    // setCheckRole(data.role);
  }

  const handleSubmit = async (data: FormData) => {
    try {
      setIsButtonLoading(true);
      checkForm(data);
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
      await sleep(1000);
      if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data.email)) {
        await sleep(1000);
        await create(data); // used to create() user with parameter of data from form: email, password, etc.
        await sleep(2000);
        setIsButtonLoading(false);
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail:
            'Veuillez vérifier que votre email ainsi que tous les champs mis en évidences sont bien remplis et correspondent aux exigences',
          life: 5000,
        });
      }
    } catch (error) {
      return error;
    }
  };

  // Form to determine the type of request
  const types: FormType[] = [
    { name: 'Role' },
    { name: 'Licence' },
    { name: 'Autre (demande, incident, suggestion)' },
  ];
  // Form to determine the type of role
  const roleTypes: FormType[] = [
    { name: 'Administrateur' },
    { name: 'Employé' },
  ];
  // Form to determine wished widgets
  const widgets: FormType[] = [
    { name: 'Assistant intelligent' },
    { name: 'Unidmin' },
  ];

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <Toast ref={toast} />

      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Formulaire de contact
        </h2>
      </div>

      <div className="mt-14 sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="leading-7-gray-900 text-base font-semibold">
          Vos données de contact
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
          <div className="mt-2 flex">
            <div className="mr-2 flex-1">
              <span className="p-float-label block">
                <InputText
                  value={form.firstName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                  tooltip="Entrez votre prénom"
                  tooltipOptions={{ event: 'both', position: 'top' }}
                  required
                />
                <label>Prénom</label>
              </span>
            </div>
            <div className="flex-1">
              <span className="p-float-label block">
                <InputText
                  value={form.lastName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                  tooltip="Entrez votre nom"
                  tooltipOptions={{ event: 'both', position: 'top' }}
                  required
                />
                <label>Nom</label>
              </span>
            </div>
          </div>
          <div className="mt-5">
            <span className="p-float-label">
              <InputText
                value={form.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, email: e.target.value })
                }
                required
                keyfilter="email"
                tooltip="Entrez votre email qui correspond aux exigences de sécurité"
                tooltipOptions={{
                  event: 'both',
                  position: 'top',
                }}
              />
              <label>Email</label>
            </span>
          </div>
          <div className="mt-5">
            <span className="p-float-label">
              <InputText
                value={form.company}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, company: e.target.value })
                }
                required
                keyfilter="alphanum" // to avoid spaces
                tooltip="Entrez le nom de votre entreprise"
                tooltipOptions={{
                  event: 'both',
                  position: 'top',
                }}
              />
              <label>Entreprise</label>
            </span>
          </div>

          <div className="border-b border-gray-900/10 pb-3" />
          <h2 className="pt-3 text-base font-semibold leading-7 text-gray-900">
            Votre demande
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Exemple de demandes: rôle d'administrateur informatique pour mon
            entreprise, création de widget, création de licences aux widgets
            souhaités, suggestion d'amélioration
          </p>
          <br />
          <div className="mt-2 flex">
            <div className="flex-1">
              <span className="p-float-label block">
                <Dropdown
                  value={form.emailType}
                  onChange={(e) =>
                    setForm({ ...form, emailType: e.target.value })
                  }
                  required
                  options={types}
                  optionLabel="name"
                  className="w-full"
                />
                <label>Type de demande</label>
              </span>
            </div>
            {form.emailType.name === 'Role' && (
              <div className="ml-2 flex-1">
                <span className="p-float-label block">
                  <Dropdown
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    required
                    options={roleTypes}
                    optionLabel="name"
                    className="w-full"
                  />
                  <label>Type de rôle souhaité</label>
                </span>
              </div>
            )}
          </div>
          <br />
          {form.emailType.name === 'Licence' && (
            <div className="mb-4 mt-2 flex">
              <div className="mr-2 flex-1">
                <span className="p-float-label block">
                  <InputNumber
                    value={form.licensesAmount}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        licensesAmount: e.value,
                      })
                    }
                    required
                  />
                  <label>Nombre de licences souhaitées</label>
                </span>
              </div>
              <div className="flex-1">
                <span className="p-float-label block">
                  <Dropdown
                    value={form.widget}
                    onChange={(e) =>
                      setForm({ ...form, widget: e.target.value })
                    }
                    required
                    options={widgets}
                    optionLabel="name"
                    className="w-full"
                  />
                  <label>Widget souhaité</label>
                </span>
              </div>
            </div>
          )}

          <div className="mt-2">
            <span className="p-float-label block">
              <InputText
                value={form.emailSubject}
                onChange={(e) =>
                  setForm({ ...form, emailSubject: e.target.value })
                }
                required
              />
              <label>Sujet de la demande</label>
            </span>
          </div>
          <br />
          <div className="mt-2">
            <span className="p-float-label">
              <InputTextarea
                rows={5}
                cols={43}
                autoResize
                value={form.emailBody}
                onChange={(e) =>
                  setForm({ ...form, emailBody: e.target.value })
                }
                required
              />
              <label>Contenu de la demande</label>
            </span>
          </div>

          <div className="mt-6 w-full justify-center text-center">
            <Button
              type="submit"
              label="Envoyer"
              // size="small"
              outlined
              // raised
              // rounded
              iconPos="right"
              icon="pi pi-send"
              loading={isButtonLoading}
            />
          </div>
        </form>
      </div>
    </div>
  );
};
export default Contact;
