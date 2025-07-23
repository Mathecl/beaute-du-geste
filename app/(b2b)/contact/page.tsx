'use client';
import React, { useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { appContext } from '@/types/appContext';

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const Contact = () => {
  const toast = useRef<Toast>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!form.firstName || !form.lastName || !form.email || !form.phone) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Champs manquants',
        detail: 'Tous les champs sont requis.',
        life: 4000,
      });
      setIsLoading(false);
      return;
    }

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!isEmailValid) {
      toast.current?.show({
        severity: 'error',
        summary: 'Email invalide',
        detail: 'Veuillez entrer une adresse email valide.',
        life: 4000,
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${appContext.appUrl}/api/sendContactEmail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        toast.current?.show({
          severity: 'success',
          summary: 'Message envoyé',
          detail: 'Votre message a été envoyé avec succès.',
          life: 4000,
        });
        setForm({ firstName: '', lastName: '', email: '', phone: '' });
      } else {
        throw new Error('Échec de l’envoi');
      }
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Une erreur est survenue. Veuillez réessayer.',
        life: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <Toast ref={toast} />
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Formulaire de contact
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6 sm:mx-auto sm:w-full sm:max-w-sm">
        <span className="p-float-label">
          <InputText
            id="firstName"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            required
          />
          <label htmlFor="firstName">Prénom</label>
        </span>

        <span className="p-float-label">
          <InputText
            id="lastName"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            required
          />
          <label htmlFor="lastName">Nom</label>
        </span>

        <span className="p-float-label">
          <InputText
            id="email"
            keyfilter="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <label htmlFor="email">Email</label>
        </span>

        <span className="p-float-label">
          <InputText
            id="phone"
            keyfilter="int"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
          <label htmlFor="phone">Téléphone</label>
        </span>

        <div className="w-full text-center">
          <Button
            type="submit"
            label="Envoyer"
            icon="pi pi-send"
            loading={isLoading}
            outlined
          />
        </div>
      </form>
    </div>
  );
};

export default Contact;
