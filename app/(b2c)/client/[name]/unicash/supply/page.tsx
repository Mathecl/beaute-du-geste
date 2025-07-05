'use client';
import React, { useState, useEffect, useRef } from 'react';

import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';

import { AppContext, appContext } from '@/types/appContext';
import { SkeletonCard } from '@/ui/SkeletonCard';

import { Toast } from 'primereact/toast';
import { TreeTable, TreeTableSelectionEvent } from 'primereact/treetable';
import { Column, ColumnEditorOptions, ColumnEvent } from 'primereact/column';
import { TreeNode } from 'primereact/treenode';
import { IconField } from 'primereact/iconfield';
import { InputText } from 'primereact/inputtext';
import { InputIcon } from 'primereact/inputicon';
import { SelectButton, SelectButtonChangeEvent } from 'primereact/selectbutton';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Button } from 'primereact/button';

interface FormField {
  id: number;
  name: string;
  quantity: string;
  unit: string;
}

let isDataReady: boolean = false;
let newValueFromTT = '';
interface Data {
  name: string;
  size?: string;
  unit?: string;
  type: string;
}

interface Item {
  key: string;
  data: Data;
  children?: Item[];
}
// Function to get the upper key
function getUpperKey(key: string): string {
  // console.log('key:', key);

  const match = key.match(/^\d+/);
  if (match) {
    // console.log('regex key:', match[0]);
    return match[0];
  } else {
    return '';
  }
}
// Recursive function to traverse the JSON object
function findUpperKey(obj: Item, targetKey: string): string | null {
  // console.log('obj:', obj);
  // console.log('target key:', targetKey);

  const upperKey = getUpperKey(targetKey);
  // console.log('upperKey:', upperKey);

  return obj[upperKey];
}
function doesStringHaveLetters(str) {
  return /[a-zA-Z]/.test(str);
}

export default function UnicashSupply() {
  // APP CONTEXT
  // ===========
  // App notification
  const toast = useRef(null);
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
  const showError = (
    summary: string,
    detail: string | unknown,
    duration: number,
  ) => {
    toast.current.show({
      severity: 'error',
      summary: summary,
      detail: detail,
      life: duration,
    });
  };

  // App user JWT infos
  const [userJwt, setUserJwt] = useState('');

  const [userCompany, setUserCompany] = useState('');
  const [userCompanyNormalCase, setUserCompanyNormalCase] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userCity, setUserCity] = useState('');
  const [userSubscription, setUserSubscription] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [hasUserStripeCash, setHasUserStripeCash] = useState(false);

  const [companyFromSid, setCompanyFromSid] = useState('');
  const [isSidCorrect, setIsSidCorrect] = useState(false);

  const [dataFetched, setDataFetched] = useState(false);

  // App backend urls
  const getJWTdataUrl: string = appContext.appUrl + '/api/auth/getJWTdata';
  const getVerifyShareId: string =
    appContext.appUrl + '/api/auth/verifyShareId';

  const addToRecipeAndSupplyUrl: string =
    appContext.appUrl + '/api/unicash/supply/postToRecipeAndSupply';
  const getToRecipeAndSupplyUrl: string =
    appContext.appUrl + '/api/unicash/supply/getToRecipeAndSupply';
  const updateToRecipeAndSupplyUrl: string =
    appContext.appUrl + '/api/unicash/supply/updateToRecipeAndSupply';

  // App router & navigation
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // App jwt + employees work hours for managers
  const [mounted, setMounted] = useState(true);
  useEffect(() => {
    try {
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
          setUserSubscription(data.userPrismaSubscription);
          setUserEmail(data.userPrismaEmail);
          setUserCompany(data.userPrismaCompany.toLowerCase());
          setUserCompanyNormalCase(data.userPrismaCompany);
          setUserRole(data.userPrismaRole);
          setUserCity(data.userPrismaCity);
          setHasUserStripeCash(data.userPrismaStripeCash);
          setUserJwt(data.jwt);

          if (searchParams?.get('sid') !== '' || null || undefined) {
            const sid = JSON.stringify(searchParams?.get('sid')).replace(
              /"/g,
              '',
            );
            const dataToVerify: string = `${sid},${data.userPrismaCompany.toLowerCase()}`;
            const sidRes = await fetch(getVerifyShareId, {
              body: JSON.stringify(dataToVerify),
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                authorization: `Bearer ${data.jwt}`,
              },
              method: 'POST',
            });

            const sidData: string = await sidRes.json();

            if (sidRes.status == 200) {
              setCompanyFromSid(sidData.replace(/"/g, ''));
              setIsSidCorrect(true);
            }
          }

          const res = await fetch(getToRecipeAndSupplyUrl, {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              authorization: `Bearer ${data.jwt}`,
            },
            method: 'GET',
          });
          const resData = await res.json();
          setNodes(resData);

          setDataFetched(true);
        } catch (error) {
          console.log(
            'Error fetching jwt data and/or displaying management-related content:',
            error,
          );
        }
      };
      fetchJWTData();
    } catch (error) {
      console.error('Error:', error);
    }
    return () => {
      setMounted(false);
    };
  }, []);

  // SUPPLY
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [selectedNodeKey, setSelectedNodeKey] = useState<string | null>(null);

  const [selectedOperationType, setSelectedOperationType] = useState(null);
  const recipeOrSupply = [{ name: 'Recette' }, { name: 'Stock' }];
  const [selectedRecipeType, setSelectedRecipeType] = useState(null);
  const recipeTypes = [
    { name: 'Entrée' },
    { name: 'Plat' },
    { name: 'Dessert' },
    { name: 'Boisson' },
  ];

  const onEditorValueChange = (options: ColumnEditorOptions, value: string) => {
    isDataReady = false;

    let newNodes = JSON.parse(JSON.stringify(nodes));
    let editedNode = findNodeByKey(newNodes, options.node.key);

    setDataToModify(options.node);

    editedNode.data[options.field] = value;
    setNodes(newNodes);
  };

  const findNodeByKey = (nodes: TreeNode[], key: string) => {
    let path = key.split('-');
    let node;

    while (path.length) {
      let list = node ? node.children : nodes;

      node = list[parseInt(path[0], 10)];
      path.shift();
    }

    return node;
  };

  const inputTextEditor = (options: ColumnEditorOptions) => {
    if (!isDataReady) {
      newValueFromTT = options.rowData[options.field];
    }
    // console.log('new value:', newValueFromTT);
    return (
      <InputText
        type="text"
        value={options.rowData[options.field]}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onEditorValueChange(options, e.target.value)
        }
        onKeyDown={(e) => e.stopPropagation()}
      />
    );
  };

  const sizeEditor = (options: ColumnEditorOptions) => {
    return inputTextEditor(options);
  };

  const typeEditor = (options: ColumnEditorOptions) => {
    return inputTextEditor(options);
  };

  const requiredValidator = (e: ColumnEvent) => {
    let props = e.columnProps;
    let value = props.node.data[props.field];

    // console.log('e:', e);
    // console.log('e:', e.columnProps.node.data);

    isDataReady = true;

    return value && value.length > 0;
  };

  const onSelect = (event) => {
    // console.log('event:', event);

    toast.current.show({
      severity: 'info',
      summary: 'Node Selected',
      detail: event.node.data.name,
    });
  };

  const onUnselect = (event) => {
    // console.log('event:', event);

    toast.current.show({
      severity: 'warn',
      summary: 'Node Unselected',
      detail: event.node.data.name,
    });
  };

  const getHeader = () => {
    return (
      <div className="justify-content-end flex">
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          <InputText
            type="search"
            onInput={(e) => setGlobalFilter(e.target.value)}
            placeholder="Global Search"
          />
        </IconField>
      </div>
    );
  };

  let header = getHeader();

  // ADD OR REMOVE RECIPE / SUPPLY
  const [formData, setFormData] = useState<FormField[]>([
    { id: 1, name: '', quantity: '', unit: '' },
  ]);
  const [isSubmitButtonLoading, setIsSubmitButtonLoading] = useState(false);
  const [recipeName, setRecipeName] = useState<string>('');
  const addOrDeleteOptions: string[] = ['Supprimer', 'Ajouter'];
  const [isAddOperation, setIsAddOperation] = useState<string>(
    addOrDeleteOptions[0],
  ); // State variable for add/remove choice

  // console.log('form data:', formData);
  // console.log('add or delete:', isAddOperation);

  // Handle adding a new form field
  const addField = () => {
    setFormData((prevFormData) => [
      ...prevFormData,
      {
        id: prevFormData.length + 1,
        name: '',
        quantity: '',
        unit: '',
      },
    ]);
  };

  // Handle removing a form field
  const removeField = (id: number) => {
    setFormData((prevFormData) =>
      prevFormData.filter((field) => field.id !== id),
    );
  };

  // Handle form input change
  const handleInputChange = (
    id: number,
    key: keyof FormField,
    value: string,
  ) => {
    setFormData((prevFormData) =>
      prevFormData.map((field) =>
        field.id === id ? { ...field, [key]: value } : field,
      ),
    );
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setIsSubmitButtonLoading(true);

    try {
      // Create the payload to send, including the operation type (add/remove)
      const stringifiedFormData = JSON.stringify(formData);

      const payload = {
        formData: stringifiedFormData,
        recipeName: recipeName,
        operationType: isAddOperation,
        selectedOperationType: selectedOperationType?.name,
        recipeType: selectedRecipeType,
        company: userCompany,
        city: userCity,
      };

      const res = await fetch(addToRecipeAndSupplyUrl, {
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          authorization: `Bearer ${userJwt}`,
        },
        method: 'POST',
      });

      // Check the response status code
      if (res.ok) {
        // Parse the JSON response from the server
        // const responseData = await res.json();

        showSuccess('Succès', "La requête s'est exécutée avec succès", 5000);

        // Clear the form data and reset the form
        setFormData([{ id: 1, name: '', quantity: '', unit: '' }]);
        setRecipeName('');
        setSelectedOperationType(null);
        setSelectedRecipeType(null);
        setIsAddOperation('Supprimer');
      } else {
        // Handle non-successful status codes here
        console.error('Fetch failed with status:', res.status);
      }

      // Ensure you set the loading state to false at the end
      setIsSubmitButtonLoading(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      showError('Erreur', `Un problème inattendu s'est passé: ${error}`, 10000);
    }
  };

  // MODIFY
  const [dataToModify, setDataToModify] = useState<string>('');
  // console.log('is data ready?', isDataReady);
  useEffect(() => {
    try {
      const modifyData = async () => {
        try {
          if (isDataReady == true) {
            // console.log('key from data to modify:', dataToModify.key);
            // console.log('tree table:', nodes);

            const upperKey = findUpperKey(nodes, dataToModify.key);
            if (upperKey !== null) {
              // console.log('upper key:', upperKey);
              // console.log('DB line to update:', upperKey.data.name);
              // console.log(
              //   'Ingredient name from DB line to update:',
              //   dataToModify.data.name,
              // );
              // console.log('New value to update:', newValueFromTT);

              let quantityOrUnit = '';
              if (doesStringHaveLetters(newValueFromTT)) {
                quantityOrUnit = 'Unit';
              } else {
                quantityOrUnit = 'Quantity';
              }

              const dataToSend: string = `${JSON.stringify(upperKey)}| ${
                dataToModify.key
              }| ${
                dataToModify.data.name
              }| ${newValueFromTT}| ${quantityOrUnit}`;

              try {
                const res = await fetch(updateToRecipeAndSupplyUrl, {
                  body: JSON.stringify(dataToSend),
                  headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    authorization: `Bearer ${userJwt}`,
                  },
                  method: 'POST',
                });

                if (res.ok) {
                  showSuccess(
                    'Succès',
                    'Modification effectuée avec succès',
                    5000,
                  );
                } else {
                  showError(
                    'Erreur',
                    'Une erreur est survenue lors de la modification',
                    10000,
                  );
                }
              } catch (error) {
                return error;
              }
            } else {
              console.log('DB line (upper key from json) to update not found.');
            }
          }
        } catch (error) {
          console.log('Error modifying data:', error);
        }
      };
      modifyData();
    } catch (error) {
      console.error('Error:', error);
    }
  }, [isDataReady]);

  return (
    <div style={{ padding: '1.75rem' }}>
      <Toast ref={toast} />

      {dataFetched ? (
        userSubscription === 'paid' && hasUserStripeCash ? (
          (userRole == 'admin' && userCompany === params?.name) ||
          (isSidCorrect == true && params?.name == companyFromSid) ? (
            <div>
              <section>
                <div>
                  {/* Dropdown */}
                  <span className="p-float-label">
                    <Dropdown
                      value={selectedOperationType}
                      onChange={(e: DropdownChangeEvent) =>
                        setSelectedOperationType(e.target.value)
                      }
                      options={recipeOrSupply}
                      optionLabel="name"
                      className="w-full"
                      tooltip="Souhaitez-vous ajouter ou supprimer une recette ou un ingrédient lié au stock ?"
                      tooltipOptions={{ event: 'both', position: 'top' }}
                      required
                    />
                    <label>Recette ou stock ?</label>
                  </span>

                  {selectedOperationType?.name == 'Recette' ? (
                    <div>
                      <span className="p-float-label block">
                        <InputText
                          value={recipeName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setRecipeName(e.target.value)
                          }
                          tooltip="Entrez le nom de le la recette"
                          tooltipOptions={{ event: 'both', position: 'top' }}
                          required
                        />
                        <label>Nom de recette</label>
                      </span>
                      <span className="p-float-label">
                        <Dropdown
                          value={selectedRecipeType}
                          onChange={(e: DropdownChangeEvent) =>
                            setSelectedRecipeType(e.target.value)
                          }
                          options={recipeTypes}
                          optionLabel="name"
                          className="w-full"
                          tooltip="Choisir le type de recette"
                          tooltipOptions={{ event: 'both', position: 'top' }}
                          required
                        />
                        <label>Type de recette</label>
                      </span>
                    </div>
                  ) : (
                    <></>
                  )}

                  {selectedOperationType?.name == 'Recette' ||
                  selectedOperationType?.name == 'Stock' ? (
                    <form onSubmit={handleSubmit} className="mt-4">
                      {selectedOperationType?.name == 'Recette' ? (
                        <span>Ingrédient(s) de la recette</span>
                      ) : (
                        <span>Ingrédient(s) en stock</span>
                      )}
                      {formData.map((field) => (
                        <div key={field.id}>
                          {/* Name input */}
                          <span className="p-float-label block">
                            <InputText
                              value={field.name}
                              onChange={(e) =>
                                handleInputChange(
                                  field.id,
                                  'name',
                                  e.target.value,
                                )
                              }
                              tooltip="Entrez le nom de l'ingrédient"
                              tooltipOptions={{
                                event: 'both',
                                position: 'top',
                              }}
                              required
                            />
                            <label>Nom</label>
                          </span>

                          {/* Quantity input */}
                          <span className="p-float-label block">
                            <InputText
                              value={field.quantity}
                              onChange={(e) =>
                                handleInputChange(
                                  field.id,
                                  'quantity',
                                  e.target.value,
                                )
                              }
                              keyfilter="int"
                              tooltip="Entrez la quantité d'ingrédient(s)"
                              tooltipOptions={{
                                event: 'both',
                                position: 'top',
                              }}
                              required
                            />
                            <label>Quantité</label>
                          </span>

                          {/* Unit input */}
                          <span className="p-float-label block">
                            <InputText
                              value={field.unit}
                              onChange={(e) =>
                                handleInputChange(
                                  field.id,
                                  'unit',
                                  e.target.value,
                                )
                              }
                              tooltip="Entrez l'unité liée à la quantité de l'ingrédient"
                              tooltipOptions={{
                                event: 'both',
                                position: 'top',
                              }}
                              required
                            />
                            <label>Unité</label>
                          </span>

                          {/* Button to remove this form field */}
                          <Button
                            icon="pi pi-minus"
                            onClick={() => removeField(field.id)}
                          />
                        </div>
                      ))}{' '}
                      {/* Button to add a new form field */}
                      <Button icon="pi pi-plus" onClick={addField} />
                      {/* Checkbox to choose add or remove operation */}
                      <div className="card justify-content-center flex">
                        <SelectButton
                          value={isAddOperation}
                          onChange={(e: SelectButtonChangeEvent) =>
                            setIsAddOperation(e.value)
                          }
                          options={addOrDeleteOptions}
                        />
                      </div>
                      {/* Submit button */}
                      <div className="card justify-content-center flex">
                        <Button
                          type="submit"
                          label="Envoyer"
                          outlined
                          loading={isSubmitButtonLoading}
                        />
                      </div>
                    </form>
                  ) : (
                    <></>
                  )}
                </div>
              </section>
              <section>
                <div>
                  <TreeTable
                    value={nodes}
                    globalFilter={globalFilter}
                    header={header}
                    selectionMode="single"
                    selectionKeys={selectedNodeKey}
                    onSelectionChange={(e: TreeTableSelectionEvent) =>
                      setSelectedNodeKey(e.value)
                    }
                    metaKeySelection={false}
                    onSelect={onSelect}
                    onUnselect={onUnselect}
                    tableStyle={{ minWidth: '93rem' }}
                  >
                    <Column
                      field="name"
                      header="Name"
                      expander
                      sortable
                      style={{ height: '3.5rem' }}
                    ></Column>
                    <Column
                      field="size"
                      header="Quantité"
                      editor={sizeEditor}
                      cellEditValidator={requiredValidator}
                      sortable
                      style={{ height: '3.5rem' }}
                    ></Column>
                    <Column
                      field="unit"
                      header="Unité"
                      editor={typeEditor}
                      cellEditValidator={requiredValidator}
                      sortable
                      style={{ height: '3.5rem' }}
                    ></Column>
                    <Column
                      field="type"
                      header="Type"
                      sortable
                      style={{ height: '3.5rem' }}
                    ></Column>
                  </TreeTable>
                </div>
              </section>
            </div>
          ) : (
            <div>
              <p className="font-small text-black-500 text-x2">
                Non autorisé(e)
              </p>{' '}
              <p className="font-small text-black-500 text-x2">
                Vous ne faîtes pas parti de l'entreprise
                {params?.name} et/ou n'avez pas le rôle d'administrateur
                (gérant)
              </p>
            </div>
          )
        ) : (
          <div>
            <p className="font-small text-black-500 text-x2">Non autorisé(e)</p>{' '}
            <p className="font-small text-black-500 text-x2">
              Vous n'êtes pas reconnu comme client(e) ayant minimum un
              abonnement mensuel. Veuillez contacter un administrateur
              informatique si cette situation est anormale, ou{' '}
              <Link
                href="/pricing"
                className="font-small leading-6 text-indigo-600 hover:text-indigo-500"
              >
                acheter l'abonnement souhaité ici.
              </Link>
            </p>
          </div>
        )
      ) : (
        <SkeletonCard />
      )}
    </div>
  );
}
