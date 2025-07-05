'use client';
import React from 'react';
import { useState, useEffect } from 'react';

import { AppContext, appContext } from '@/types/appContext';

export default function Test() {
  // App context
  const getJWTdataUrl: string = appContext.appUrl + '/api/auth/getJWTdata';

  const getInvoicesUrl: string = appContext.appUrl + '/api/stripe/getInvoices';

  // Fetch invoice(s)
  const [lastInvoice, setLastInvoice] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [mappedInvoices, setMappedInvoices] = useState([]);
  // console.log('mapped invoice(s)', mappedInvoices);

  // useEffect(() => {
  //   console.log(invoices);
  //   if (invoices && invoices.length > 0) {
  //     const mappedInvoices = invoices.map((invoice) => ({
  //       id: invoice.id,
  //       accountName: invoice.account_name,
  //       amountDue: invoice.amount_due,
  //       currency: invoice.currency,
  //       customerEmail: invoice.customer_email,
  //       invoicePdf: invoice.invoice_pdf,
  //       hostedInvoiceUrl: invoice.hosted_invoice_url,
  //       status: invoice.status,
  //     }));
  //     setMappedInvoices(mappedInvoices);
  //   } else {
  //     console.error('invoices list is invalid');
  //   }
  // }, [invoices]);

  useEffect(() => {
    // console.log('last invoices:', lastInvoice);
    if (lastInvoice && lastInvoice.length > 0) {
      const mappedInvoices = lastInvoice.map((invoice) => ({
        id: invoice.id,
        accountName: invoice.account_name,
        amountDue: invoice.amount_due,
        currency: invoice.currency,
        customerEmail: invoice.customer_email,
        invoicePdf: invoice.invoice_pdf,
        hostedInvoiceUrl: invoice.hosted_invoice_url,
        status: invoice.status,
      }));
      setMappedInvoices(mappedInvoices);
    } else {
      console.error('searched invoice is invalid');
    }
  }, [lastInvoice]);

  useEffect(() => {
    const fetchJwt = async () => {
      try {
        const jwtRes = await fetch(getJWTdataUrl, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          method: 'GET',
        });
        const jwtData = await jwtRes.json();

        const invoicesRes = await fetch(getInvoicesUrl, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            authorization: `Bearer ${jwtData.jwt}`,
          },
          method: 'GET',
        });
        const invoicesData = await invoicesRes.json();
        setLastInvoice(invoicesData);
      } catch (error) {
        console.error(error);
      } finally {
        // console.log('ok');
      }
    };

    fetchJwt();
  }, []);

  return (
    <div style={{ padding: '1.75rem' }}>
      <main>
        <div>
          {/* {mappedInvoices.length > 0 ? (
            <ul>
              {mappedInvoices.map((invoice) => (
                <li key={invoice.id}>
                  <p>Account Name: {invoice.accountName}</p>
                  <p>
                    Amount Due: {invoice.amountDue} {invoice.currency}
                  </p>
                  <p>Customer Email: {invoice.customerEmail}</p>
                  <p>Status: {invoice.status}</p>
                  <a
                    href={invoice.invoicePdf}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Invoice PDF
                  </a>
                  <br />
                  <a
                    href={invoice.hostedInvoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Hosted Invoice
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>Loading...</p>
          )} */}

          <ul>
            <li>Invoice ID: {lastInvoice.id}</li>
            <li>Invoice status: {lastInvoice.status}</li>
            <li>
              {' '}
              <a
                href={lastInvoice.invoice_pdf}
                target="_blank"
                rel="noopener noreferrer"
              >
                Invoice PDF
              </a>
            </li>
            <li>
              <a
                href={lastInvoice.hosted_invoice_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Hosted Invoice URL
              </a>
            </li>

            <li>Customer ID: {lastInvoice.customer}</li>
            <li>Customer name: {lastInvoice.customer_name}</li>
            <li>Customer email: {lastInvoice.customer_email}</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
