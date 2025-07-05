// async function saveUser(user) {
//   const response = await fetch('@/api/prismaquery', {
//     method: 'POST',
//     body: JSON.stringify(user),
//   });

//   if (!response.ok) {
//     throw new Error(response.statusText);
//   }

//   return await response.json();
// }

'use client';
import React, { useRef, useState, ChangeEvent } from 'react';
import { Suspense } from 'react';

import { AppContext, appContext } from '@/types/appContext';
import { sendVerificationEmail } from '@/utils/sendVerificationEmail';

import Logo from '../../../public/icon-512x512.png';
import Link from 'next/link';
import Image from 'next/image';

import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { MultiSelect } from 'primereact/multiselect';
import { InputMask } from 'primereact/inputmask';
import { InputSwitch } from 'primereact/inputswitch';
import { Tooltip } from 'primereact/tooltip';
import { Dialog } from 'primereact/dialog';
import { TabView, TabPanel } from 'primereact/tabview';
import { Password } from 'primereact/password';
import { Divider } from 'primereact/divider';

interface Users {
  users: {
    id: string;
    userName: string;
    userEmail: string;
    userPassword: string;
    // userRole: string;
    // userSubscription: string;
    companyName: string;
    companyCountry: string;
    companySize: any;
    companySectorOfActivity: string;
    companyMainActivity: string;
    companyDepartments: string;
    companyProjectsMethodologies: string;
    companyProjectsAmount: any;
    companyProjectWorkflows: string;
    companyWidgets: string;
    companyBusinessNetwork: string;
  }[];
}
interface FormData {
  id: string;
  userName: string;
  userEmail: string;
  userPassword: string;
  // userRole: string;
  // userSubscription: string;
  companyName: string;
  companyCountry: string;
  companySize: any;
  companySectorOfActivity: string;
  companyMainActivity: string;
  companyDepartments: string;
  companyProjectsMethodologies: string;
  companyProjectsAmount: any;
  companyProjectWorkflows: string;
  companyWidgets: string;
  companyBusinessNetwork: string;
}

const SignUp = ({ users }: Users) => {
  // Notification
  const toast = useRef<Toast>(null);

  // Form data
  const [checkUserName, setCheckUserName] = useState('');
  const [checkUserEmail, setCheckUserEmail] = useState('');
  const [checkUserPwd, setCheckUserPwd] = useState('');
  const [checkCompanyName, setCheckCompanyName] = useState('');
  const [checkCompanyCountry, setCheckCompanyCountry] = useState('');
  const [checkCompanySize, setCheckCompanySize] = useState('');
  const [checkCompanySOA, setCheckCompanySOA] = useState('');
  const [checkCompanyActivity, setCheckCompanyActivity] = useState('');
  const [checkCompanyDepartments, setCheckCompanyDepartments] = useState('');
  const [checkCompanyProjectMethodo, setCheckCompanyProjectMethodo] =
    useState('');
  const [checkCompanyProjectAmount, setCompanyProjectAmount] = useState('');
  const [checkCompanyProjectWorkflow, setCheckCompanyProjectWorkflow] =
    useState('');
  const [checkCompanyWidgets, setCheckCompanyWidgets] = useState('');
  const [checkCompanyBizNetwork, setCheckCompanyBizNetwork] = useState('');

  const countries = [{ name: 'France' }, { name: 'Switzerland' }];
  const projectMethdologies = [
    { name: 'Agile' },
    { name: 'Scrum' },
    { name: 'Lean' },
    { name: 'Waterfall' },
    { name: 'PMI' },
    { name: 'CPM' },
  ];
  const projectWorkflows = [
    { name: 'Case' },
    { name: 'Process' },
    { name: 'Project' },
  ];

  const sectorActivities = [
    { name: 'Agroalimentaire' },
    { name: 'Banque / Assurance' },
    { name: 'BTP / Matériaux de construction' },
    { name: 'Chimie / Parachimie' },
    { name: 'Commerce / Négoce / Distribution' },
    { name: 'Édition / Communication / Multimédia' },
    { name: 'Électronique / Électricité' },
    { name: 'Études et conseils' },
    { name: 'Industrie pharmaceutique' },
    { name: 'Informatique' },
    { name: 'Machines et équipements / Automobile' },
    { name: 'Production industrielle / Imprimerie / Travail de matériaux' },
    { name: 'Services aux entreprises' },
    { name: 'Textile / Habillement / Chaussure' },
    { name: 'Transports / Logistique' },
  ];

  const departments = [
    { name: 'Human Resources' },
    { name: 'Accouting' },
    { name: 'Financing' },
    { name: 'Marketing' },
    { name: 'Sales Ops' },
    { name: 'Operation' },
    { name: 'Training' },
    { name: 'Complaints' },
    { name: 'Customer service' },
    { name: 'IT' },
    { name: 'Administration' },
    { name: 'Production' },
  ];
  const groupedWidgets = [
    {
      label: 'Administration',
      items: [
        // { label: 'Workflows', value: 'Workflows' },
        { label: 'Work time', value: 'Work time' },
        {
          label: 'Jobs and Skills Management (GPEC)',
          value: 'Jobs and Skills Management (GPEC)',
        },
      ],
    },
    {
      label: 'Activities management',
      items: [
        {
          label: 'Customer Relationship Management (CRM)',
          value: 'Customer Relationship Management (CRM)',
        },
        {
          label: 'Software Project Management (SPM)',
          value: 'Software Project Management (SPM)',
        },
      ],
    },
    {
      label: 'Financials and inventory',
      items: [
        { label: 'Inventory management', value: 'Inventory management' },
        {
          label: 'Accounting and invoice creation',
          value: 'Accounting and invoice creation',
        },
        {
          label: 'Quotations and cash flow',
          value: 'Quotations and cash flow',
        },
      ],
    },
  ];

  const pwdHeader = (
    <div className="mb-3 font-bold">Password policy: security requirements</div>
  );
  const pwdFooter = (
    <>
      <Divider />
      <p className="mt-2">Your password must fill all below requirements:</p>
      <ul className="line-height-3 ml-2 mt-0 pl-2">
        <li>At least one lowercase</li>
        <li>At least one uppercase</li>
        <li>At least one numeric</li>
        <li>Minimum 8 characters</li>
      </ul>
    </>
  );

  // App Context
  const appUrl: string = appContext.appUrl + '/api/manageVerification';

  // Typesafe pay form + modal
  const [modalVis, setModalVis] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiryDate, setCardExpiryDate] = useState('');
  const [cardSecurityCode, setCardSecurityCode] = useState('');
  const [storedEmail, setStoredEmail] = useState('');
  const [state, setState] = useState({ value: '' });
  const handleChange = (event: ChangeEvent<{ value: string }>) => {
    setState({ value: event?.currentTarget?.value });
  };
  const comparePinCode = async () => {
    // console.log('comparePinCode()');
    const filledPinCode: string = state.value;
    const dataToVerify: string = `${filledPinCode},${storedEmail}`;

    // console.log('appUrl:' + appUrl);

    fetch(appUrl, {
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
          detail:
            'Pin code is correct. Company and account both successfuly created and configured',
          life: 5000,
        });
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Pin code is incorrect',
          life: 5000,
        });
      }
    });
    // await manageVerification(dataToVerify).then((data) => {
    //   setPinCodeComparison(data.message);
    // });
  };

  const handleModal = async () => {
    try {
      // console.log('handleModal()');
      await comparePinCode();
    } catch (error) {
      return error;
    }
  };
  async function create(data: FormData) {
    try {
      fetch(appUrl, {
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          // authorization: `bearer ${session?.user?.accessToken}`,
        },
        method: 'POST',
      }).then(() =>
        // clear the form
        setForm({
          id: '',
          userName: '',
          userEmail: '',
          userPassword: '',
          // userRole: '',
          // userSubscription: '',
          companyName: '',
          companyCountry: '',
          companySize: '',
          companySectorOfActivity: '',
          companyMainActivity: '',
          companyDepartments: '',
          companyProjectsMethodologies: '',
          companyProjectsAmount: '',
          companyProjectWorkflows: '',
          companyWidgets: '',
          companyBusinessNetwork: '',
        }),
      );
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
    // userRole: '',
    // userSubscription: '',
    companyName: '',
    companyCountry: '',
    companySize: '',
    companySectorOfActivity: '',
    companyMainActivity: '',
    companyDepartments: '',
    companyProjectsMethodologies: '',
    companyProjectsAmount: '',
    companyProjectWorkflows: '',
    companyWidgets: '',
    companyBusinessNetwork: '',
  });
  function formatJsonData(jsonData) {
    const arrayLength = Object.keys(jsonData).length;
    let dataToDisplay: string = '';
    for (let i = 0; i < arrayLength; i++) {
      dataToDisplay += jsonData[i].name + ', ';
    }
    return dataToDisplay;
  }
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

    setCheckUserName(data.userName);
    setCheckUserEmail(data.userEmail);
    setCheckUserPwd(data.userPassword);
    setCheckCompanyName(data.companyName);
    setCheckCompanyCountry(data.companyCountry.name);
    setCheckCompanySize(data.companySize);
    setCheckCompanySOA(data.companySectorOfActivity.name);
    setCheckCompanyActivity(data.companyMainActivity);
    const checkDepartments = formatJsonData(data.companyDepartments);
    setCheckCompanyDepartments(checkDepartments);
    const checkMethodologies = formatJsonData(
      data.companyProjectsMethodologies,
    );
    setCheckCompanyProjectMethodo(checkMethodologies);
    setCompanyProjectAmount(data.companyProjectsAmount);
    const checkWorkflows = formatJsonData(data.companyProjectWorkflows);
    setCheckCompanyProjectWorkflow(checkWorkflows);
    setCheckCompanyWidgets(data.companyWidgets);
    setCheckCompanyBizNetwork(data.companyBusinessNetwork);
  }

  const handleSubmit = async (data: FormData) => {
    try {
      checkForm(data);
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
      await sleep(1000);
      if (
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(checkUserEmail) &&
        /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})./.test(
          checkUserPwd,
        )
      ) {
        toast.current?.show({
          severity: 'info',
          summary: 'Info',
          detail:
            'Please verify your e-mail address with the key that you received by e-mail',
          sticky: true,
        });
        await sleep(1000);
        setStoredEmail(data.userEmail); // will be used for comparePinCode() onClick of pin code verification through pay modal
        await create(data); // used to create() user with parameter of data from form: email, password, etc.
        setModalVis(true);
        await sleep(2000);
        await sendVerificationEmail(data);
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail:
            'Please verify that your e-mail address and password both matches requirements as well as all the following, required input that needs to be filled',
          life: 5000,
        });
        setModalVis(false);
      }
    } catch (error) {
      return error;
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <Toast ref={toast} />
      <Dialog
        header="Unigate offer"
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
                Check offer details
              </h3>
              <p className="mt-6 text-base leading-7 text-gray-600">
                <div>
                  <div className="grid">
                    <span className="p-float-label">
                      <InputText
                        onChange={handleChange}
                        tooltip="Enter the pin code that you received by e-mail"
                        tooltipOptions={{
                          event: 'both',
                          position: 'top',
                        }}
                        required
                      />
                      <label>Pin code</label>
                    </span>
                  </div>
                  <div className="mt-5 grid">
                    <span className="p-float-label">
                      <InputMask
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        mask="9999-9999-9999-9999"
                        placeholder="9999-9999-9999-9999"
                        tooltip="Enter your card number"
                        tooltipOptions={{
                          event: 'both',
                          position: 'top',
                        }}
                        required
                      />
                      <label>Card number</label>
                    </span>
                  </div>
                  <div className="mt-5 grid">
                    <span className="p-float-label">
                      <InputText
                        value={cardName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setCardName(e.target.value)
                        }
                        keyfilter="alpha"
                        tooltip="Enter your card name"
                        tooltipOptions={{
                          event: 'both',
                          position: 'top',
                        }}
                        required
                      />
                      <label>Card name</label>
                    </span>
                  </div>

                  <div className="justify-content-center mt-5 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <span className="p-float-label">
                        <InputMask
                          value={cardExpiryDate}
                          onChange={(e) => setCardExpiryDate(e.target.value)}
                          mask="99/9999"
                          placeholder="01/26"
                          slotChar="mm/yyyy"
                          tooltip="Enter your card expiry date"
                          tooltipOptions={{
                            event: 'both',
                            position: 'top',
                          }}
                          required
                        />
                        <label>Card expiry date</label>
                      </span>
                    </div>
                    <div>
                      <span className="p-float-label">
                        <Password
                          value={cardSecurityCode}
                          placeholder="***"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setCardSecurityCode(e.target.value)
                          }
                          toggleMask
                          tooltip="Enter your card security code"
                          tooltipOptions={{
                            event: 'both',
                            position: 'top',
                          }}
                          feedback={false}
                          required
                        />
                        <label>Card security code</label>
                      </span>
                    </div>
                  </div>
                </div>
              </p>
              <div className="mt-10 flex items-center gap-x-4">
                <h4 className="flex-none text-sm font-semibold leading-6 text-indigo-600">
                  Summary
                </h4>
                <div className="h-px flex-auto bg-gray-100"></div>
              </div>
              <ul
                role="list"
                className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600 sm:grid-cols-2 sm:gap-6"
              >
                <li className="flex gap-x-3">
                  {checkUserName}, {checkUserEmail}
                </li>
                <li className="flex gap-x-3">
                  {checkCompanyName} in {checkCompanyCountry} with{' '}
                  {checkCompanySize} employees working on {checkCompanySOA}{' '}
                  sector of activity. The most significant business activity
                  was: {checkCompanyActivity}
                </li>
                <li className="flex gap-x-3">
                  {checkCompanyDepartments} are working on{' '}
                  {checkCompanyProjectAmount} business activities. Those have
                  used {checkCompanyProjectMethodo} methodolog(y/ies), thanks to{' '}
                  {checkCompanyProjectWorkflow} workflow(s)
                </li>
                <li className="flex gap-x-3">
                  Thus, {checkUserName} wish to digitalize {checkCompanyName}{' '}
                  with following widgets {checkCompanyWidgets} and business
                  network access set to {checkCompanyBizNetwork}
                </li>
              </ul>
            </div>
            <div className="mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
              <div className="rounded-2xl bg-gray-50 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
                <div className="mx-auto max-w-xs px-6">
                  <p className="text-base font-semibold text-gray-600">
                    Check amount
                  </p>
                  <TabView className="mt-10">
                    <TabPanel header="Monthly">
                      <p className="mt-6 flex items-baseline justify-center gap-x-2">
                        <span className="text-5xl font-bold tracking-tight text-gray-900">
                          $349
                        </span>
                        <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">
                          USD
                        </span>
                      </p>
                    </TabPanel>
                    <TabPanel header="Annualy">
                      <p className="mt-6 flex items-baseline justify-center gap-x-2">
                        <span className="text-5xl font-bold tracking-tight text-gray-900">
                          $276
                        </span>
                        <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">
                          USD
                        </span>
                      </p>
                    </TabPanel>
                  </TabView>

                  <Button
                    label="Get access to Unigate"
                    onClick={handleModal}
                    // size="small"
                    outlined
                    // raised
                    // rounded
                    iconPos="right"
                    icon="pi pi-file-edit"
                    className="mt-10"
                  />
                  <p className="mt-6 text-xs leading-5 text-gray-600">
                    Invoices and receipts available for easy company
                    reimbursement
                  </p>
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
          Sign up for a new collaboration
        </h2>
      </div>

      <div className="mt-14 sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="leading-7-gray-900 text-base font-semibold">
          Your account
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">
          Create your secured account as a collaborator within your company that
          will be used on Unigate
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
          <div className="mt-2 grid">
            <span className="p-float-label block">
              <InputText
                value={form.userName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, userName: e.target.value })
                }
                tooltip="Enter your account name"
                tooltipOptions={{ event: 'both', position: 'top' }}
                required
              />
              <label>Name</label>
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
                tooltip="Enter your account email address"
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
                tooltip="Write your account password"
                tooltipOptions={{
                  event: 'both',
                  position: 'top',
                }}
              />
              <label>Password</label>
            </span>
          </div>

          <div className="border-b border-gray-900/10 pb-6" />
          <h2 className="pt-6 text-base font-semibold leading-7 text-gray-900">
            Company details
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Some context about your company to deliver the best overall
            experience possible
          </p>
          <br />
          <div className="mt-2 grid">
            <span className="p-float-label block">
              <InputText
                value={form.companyName}
                onChange={(e) =>
                  setForm({ ...form, companyName: e.target.value })
                }
                tooltip="Enter your company name"
                tooltipOptions={{ event: 'both', position: 'top' }}
                required
              />
              <label>Name</label>
            </span>
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="mt-1">
              <span className="p-float-label">
                <Dropdown
                  inputId="dd-city"
                  value={form.companyCountry}
                  onChange={(e) =>
                    setForm({ ...form, companyCountry: e.target.value })
                  }
                  options={countries}
                  optionLabel="name"
                  className="w-full"
                  tooltip="Select your company preferred country (for language, legals, ..)"
                  tooltipOptions={{ event: 'both', position: 'top' }}
                  required
                />
                <label>Country</label>
              </span>
            </div>
            <div className="mt-1">
              <span className="p-float-label">
                <InputNumber
                  value={form.companySize}
                  onValueChange={(e) =>
                    setForm({
                      ...form,
                      companySize: e.target.value,
                    })
                  }
                  className="w-full"
                  tooltip="Fill input with number of company employees"
                  tooltipOptions={{ event: 'both', position: 'top' }}
                  required
                />
                <label>Size (employees)</label>
              </span>
            </div>
          </div>

          <div className="mt-2.5 grid">
            <span className="p-float-label">
              <Dropdown
                inputId="dd-city"
                value={form.companySectorOfActivity}
                onChange={(e) =>
                  setForm({ ...form, companySectorOfActivity: e.target.value })
                }
                options={sectorActivities}
                optionLabel="name"
                className="w-full"
                filter
                tooltip="Select company sector of activity"
                tooltipOptions={{ event: 'both', position: 'top' }}
                required
              />
              <label>Sector of activity</label>
            </span>
          </div>
          <div className="card mt-2.5 grid">
            <span className="p-float-label">
              <InputTextarea
                value={form.companyMainActivity}
                onChange={(e) =>
                  setForm({ ...form, companyMainActivity: e.target.value })
                }
                rows={3}
                cols={30}
                autoResize
                tooltip="Detail the main activity of your company"
                tooltipOptions={{ event: 'both', position: 'top' }}
              />
              <label>Main activity</label>
            </span>
          </div>

          <div className="border-b border-gray-900/10 pb-3" />
          <h2 className="pt-3 text-base font-semibold leading-7 text-gray-900">
            Company needs
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Describre how your company is digitalized, who is involved and for
            what
          </p>
          <br />

          <div className="mt-2 grid">
            <span className="p-float-label">
              <MultiSelect
                value={form.companyDepartments}
                onChange={(e) =>
                  setForm({ ...form, companyDepartments: e.target.value })
                }
                options={departments}
                optionLabel="name"
                maxSelectedLabels={3}
                className="w-full"
                filter
                tooltip="Select all departments that your company have"
                tooltipOptions={{ event: 'both', position: 'top' }}
                required
              />
              <label>Departments</label>
            </span>
          </div>

          <div className="mb-5">
            <p className="text-sm leading-6 text-gray-600">
              Business activities
            </p>
          </div>

          <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="mt-1">
              <span className="p-float-label">
                <MultiSelect
                  value={form.companyProjectsMethodologies}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      companyProjectsMethodologies: e.target.value,
                    })
                  }
                  options={projectMethdologies}
                  optionLabel="name"
                  maxSelectedLabels={3}
                  className="w-full"
                  filter
                  tooltip="Select used methodologies for business activities that your company runned"
                  tooltipOptions={{ event: 'both', position: 'top' }}
                  required
                />
                <label>Used methodologies</label>
              </span>
            </div>
            <div className="mt-1">
              <span className="p-float-label">
                <InputNumber
                  value={form.companyProjectsAmount}
                  onValueChange={(e) =>
                    setForm({
                      ...form,
                      companyProjectsAmount: e.target.value,
                    })
                  }
                  className="w-full"
                  tooltip="Specify the amount of business activities your company have run"
                  tooltipOptions={{ event: 'both', position: 'top' }}
                  required
                />
                <label>Amount</label>
              </span>
            </div>
          </div>
          <div className="grid pt-2">
            <span className="p-float-label">
              <MultiSelect
                value={form.companyProjectWorkflows}
                onChange={(e) =>
                  setForm({
                    ...form,
                    companyProjectWorkflows: e.target.value,
                  })
                }
                options={projectWorkflows}
                optionLabel="name"
                maxSelectedLabels={3}
                className="w-full"
                filter
                tooltip="Select workflow(s) that your company used during business activities"
                tooltipOptions={{ event: 'both', position: 'top' }}
                required
              />
              <label>Used workflows</label>
            </span>
            <small className="text-xsm pl-2 leading-6 text-gray-600">
              Case: In case you might not know what steps you'll need to take to
              get from the start of a process to the end
              <br />
              Process: Optimized to avoid repetitive workflows by completing
              several of the same tasks simultaneously
              <br />
              Project: Workflow that combines case and process ones by moving
              with tasks steps while also allowing for variations based on the
              results of each task
            </small>
          </div>

          <div className="border-b border-gray-900/10 pb-3" />
          <h2 className="pt-3 text-base font-semibold leading-7 text-gray-900">
            Company digitalization
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Digitalize your company with wished widgets and features that fit as
            much as possible to you and your needs
          </p>
          <br />

          <div className="mt-2 grid">
            <MultiSelect
              options={groupedWidgets}
              value={form.companyWidgets}
              onChange={(e) =>
                setForm({
                  ...form,
                  companyWidgets: e.target.value,
                })
              }
              optionLabel="label"
              optionGroupLabel="label"
              optionGroupChildren="items"
              // optionGroupTemplate={groupedItemTemplate}
              placeholder="Widgets"
              display="chip"
              className="w-full"
              filter
              tooltip="Select all your wished, customizable widgets for your company that will be used for your business activities"
              tooltipOptions={{ event: 'both', position: 'top' }}
              required
            />
          </div>

          <p className="text-sm leading-6 text-gray-600">
            Gain access to the business network?
          </p>

          <div className="mt-2.5 w-full justify-center text-center">
            <InputSwitch
              checked={form.companyBusinessNetwork}
              onChange={(e) =>
                setForm({
                  ...form,
                  companyBusinessNetwork: e.target.value,
                })
              }
              tooltip="A powerful business network to enhance your business activities through all their life cycles"
              tooltipOptions={{ event: 'both', position: 'top' }}
            />
          </div>

          <div className="mt-6 w-full justify-center text-center">
            <Button
              type="submit"
              label="Check our offer"
              // size="small"
              outlined
              // raised
              // rounded
              iconPos="right"
              icon="pi pi-file-edit"
            />
          </div>
        </form>
      </div>
    </div>
  );
};
export default SignUp;
