'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import supabase from '@/utils/supabase/supabaseClient';
import { SkeletonCard } from '@/ui/SkeletonCard';

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [dataFetched, setDataFetched] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          console.error('Erreur lors de la récupération du compte:', error.message);
        } else if (data?.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.error('Erreur inattendue:', err);
      } finally {
        setDataFetched(true);
      }
    };

    fetchUser();
  }, []);

  if (!dataFetched) {
    return <SkeletonCard />;
  }

  if (!user) {
    return (
      <div style={{ padding: '3rem' }}>
        <p className="font-small text-black-500 text-x2">Non autorisé(e)</p>
        <p className="font-small text-black-500 text-x2">
          Vous n'êtes pas reconnu comme client(e).
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '3rem' }}>
      <h2>Bienvenue, {user.email}</h2>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}
