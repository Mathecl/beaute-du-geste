'use client';
import React, { useState, useEffect, useRef } from 'react';

import Image from 'next/image';

import { DataTable, DataTableRowEditCompleteEvent } from 'primereact/datatable';
import { Column, ColumnEditorOptions } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Rating } from 'primereact/rating';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';

import { AppContext, appContext } from '@/types/appContext';

interface Product {
  id: string | null;
  city: string;
  company: string;
  consumeremail: string;
  date: string;
  invoice: string | null;
  // order: JSON;
  order: {
    products: any[];
    paymentdata: {
      [key: string]: any;
    };
  };
  receipt: string | null;
  state: string | null;
  uid: string | null;
}

const ordersList = (data) => {
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
  // App URLs
  const getJWTdataUrl: string = appContext.appUrl + '/api/auth/getJWTdata';
  const getUpdateStateUrl: string =
    appContext.appUrl + '/api/unicash/postPaymentUnicashUpdate';

  // App user JWT infos
  const [userJwt, setUserJwt] = useState('');
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

          const data = await response.json();

          setUserJwt(data.jwt);
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
  }, []);

  let emptyProduct: Product = {
    id: null,
    city: '',
    company: '',
    consumeremail: '',
    date: '',
    invoice: null,
    order: {
      products: [],
      paymentdata: {},
    },
    receipt: null,
    state: 'paid',
    uid: null,
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [productDialog, setProductDialog] = useState<boolean>(false);
  const [deleteProductDialog, setDeleteProductDialog] =
    useState<boolean>(false);
  const [deleteProductsDialog, setDeleteProductsDialog] =
    useState<boolean>(false);
  const [product, setProduct] = useState<Product>(emptyProduct);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const dt = useRef<DataTable<Product[]>>(null);

  // SET DATA
  // ========

  // At page load
  useEffect(() => {
    setProducts(data.data);
  }, []);

  // FORMAT FIELDS
  // =============

  // Extract and format "order" field from JSON
  const orderBodyTemplate = (rowData: Product) => {
    const { products, paymentdata } = rowData.order;

    const productsList = products.map((product, index) => (
      <div key={index}>
        {product.name}: {product.price}€
      </div>
    ));

    const paymentInfo = Object.keys(paymentdata).map((key, index) => {
      let value = paymentdata[key];

      // Check for specific keys and values
      if (key === 'type') {
        key = 'Consommation';

        switch (value) {
          case 'on prem':
            value = 'sur place';
            break;
          case 'click and collect':
            value = 'click and collect';
            break;
          case 'delivery':
            value = 'livraison';
            break;
          default:
            break;
        }
      } else if (key === 'method') {
        key = 'Moyen de payement';

        switch (value) {
          case 'cash':
            value = 'liquide';
            break;
          case 'credit card':
            value = 'carte bleue';
            break;
          default:
            break;
        }
      }

      return (
        <div key={index}>
          <br />
          {key}: {value}
        </div>
      );
    });

    return (
      <div>
        <div>{productsList}</div>
        <div>{paymentInfo}</div>
      </div>
    );
  };

  // Date and hour
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}h${minutes}`;
  };
  const dateBodyTemplate = (rowData: Product) => {
    return formatDate(rowData.date);
  };

  // Price
  const formatCurrency = (value: number) => {
    return value.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    });
  };
  const priceBodyTemplate = (rowData: Product) => {
    return formatCurrency(rowData.price);
  };

  // Rating
  const ratingBodyTemplate = (rowData: Product) => {
    return <Rating value={rowData.rating} readOnly cancel={false} />;
  };

  // State
  const statusBodyTemplate = (rowData: Product) => {
    let productState = '';

    switch (rowData.state) {
      case 'delivered':
        productState = 'Livré';
        break;
      case 'cooked':
        productState = 'Cuisiné';
        break;
      case 'cooking':
        productState = 'A cuisiner';
        break;
      case 'paid':
        productState = 'Payé';
        break;
      case 'canceled':
        productState = 'Annulé';
        break;
      default:
        productState = '';
    }

    return (
      <Tag value={productState} severity={getSeverity(productState)}></Tag>
    );
  };
  const getSeverity = (product: string) => {
    switch (product) {
      case 'Livré':
        return 'success';
      case 'Cuisiné':
        return 'success';

      case 'A cuisiner':
        return 'warning';

      case 'Payé':
        return 'danger';
      case 'Annulé':
        return 'danger';

      default:
        return null;
    }
  };

  // EDIT FIELDS
  // ===========

  const onRowEditComplete = async (e: DataTableRowEditCompleteEvent) => {
    let _products = [...products];
    let { newData, index } = e;

    const uidFromNewData = newData.uid;
    const companyFromNewData = newData.company;
    const cityFromNewData = newData.city;

    let optionToSend = '';
    switch (newData.state) {
      case 'Livré':
        optionToSend = 'delivered';
        break;
      case 'Cuisiné':
        optionToSend = 'cooked';
        break;
      case 'A cuisiner':
        optionToSend = 'cooking';
        break;
      case 'Payé':
        optionToSend = 'paid';
        break;
      case 'Annulé':
        optionToSend = 'canceled';
        break;
      default:
        optionToSend = '';
        break;
    }

    newData.state = optionToSend;
    _products[index] = newData as Product;
    setProducts(_products);

    const dataToSend: string = `${uidFromNewData},${optionToSend},${companyFromNewData},${cityFromNewData}`;
    const updateConsStateRes = await fetch(getUpdateStateUrl, {
      body: JSON.stringify(dataToSend),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        authorization: `Bearer ${userJwt}`,
      },
      method: 'POST',
    });

    if (updateConsStateRes.status == 200) {
      showSuccess('Succès', `Commande mise à jour avec succès`, 5000);
    } else {
      showError(
        'Erreur',
        "Une erreur est survenue lors de la tentative de mise à jour d'une commande",
        10000,
      );
    }
  };
  const textEditor = (options: ColumnEditorOptions) => {
    return (
      <InputText
        type="text"
        value={options.value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          options.editorCallback!(e.target.value)
        }
      />
    );
  };
  const [statuses] = useState<string[]>([
    'Livré',
    'Cuisiné',
    'A cuisiner',
    'Payé',
    'Annulé',
  ]);
  const statusEditor = (options: ColumnEditorOptions) => {
    return (
      <Dropdown
        value={options.value}
        options={statuses}
        onChange={(e: DropdownChangeEvent) => options.editorCallback!(e.value)}
        placeholder="Sélectionner"
        itemTemplate={(option) => {
          return <Tag value={option} severity={getSeverity(option)}></Tag>;
        }}
      />
    );
  };
  const allowEdit = (rowData: Product) => {
    return rowData.uid !== '';
  };

  // FILTERS AND RESEARCH
  // ====================

  const header = (
    <div className="align-items-center justify-content-between flex flex-wrap gap-2">
      {/* <h4 className="m-0">Manage Products</h4> */}
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          type="search"
          placeholder="Rechercher..."
          onInput={(e) => {
            const target = e.target as HTMLInputElement;
            setGlobalFilter(target.value);
          }}
        />
      </span>
    </div>
  );

  return (
    <div>
      <Toast ref={toast} />
      <div className="card">
        <DataTable
          ref={dt}
          value={products}
          dataKey="id"
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Page {first} des {totalRecords} produits"
          globalFilter={globalFilter}
          header={header}
          editMode="row"
          onRowEditComplete={onRowEditComplete}
          className="pb-3"
        >
          <Column
            field="consumeremail"
            header="Client"
            sortable
            style={{ minWidth: '16rem' }}
          ></Column>
          <Column
            field="date"
            header="Date"
            body={dateBodyTemplate}
            sortable
            style={{ minWidth: '8rem' }}
          ></Column>
          <Column
            field="state"
            header="Etat"
            body={statusBodyTemplate}
            sortable
            editor={(options) => statusEditor(options)}
            style={{ minWidth: '10rem' }}
          ></Column>
          <Column
            field="order"
            header="Commande"
            body={orderBodyTemplate}
            sortable
            style={{ minWidth: '12rem' }}
          ></Column>
          <Column
            field="receipt"
            header="Reçu"
            sortable
            style={{ minWidth: '12rem' }}
          ></Column>
          <Column
            field="invoice"
            header="Facture"
            sortable
            style={{ minWidth: '12rem' }}
          ></Column>
          <Column
            rowEditor={allowEdit}
            headerStyle={{ width: '10%', minWidth: '8rem' }}
            bodyStyle={{ textAlign: 'center' }}
          ></Column>
        </DataTable>
      </div>
    </div>
  );
};
export default ordersList;
