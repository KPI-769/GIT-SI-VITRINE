'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppHeader from '@/components/AppHeader';
import LabManagerView from '@/components/LabManagerView';
import { ShieldAlert } from 'lucide-react';

export default function LaboPage() {
  const { isInitialized, currentUser, allUsers } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !currentUser) {
      router.push('/login');
    }
  }, [isInitialized, currentUser, router]);

  if (!isInitialized || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 font-medium" style={{ background: 'var(--surface-1)' }}>
        Vérification de la session en cours...
      </div>
    );
  }

  // Vérification des privilèges LAB_MANAGER ou ADMIN
  if (currentUser.role !== 'LAB_MANAGER' && currentUser.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex flex-col font-sans" style={{ background: 'var(--surface-1)' }}>
        <AppHeader />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="card p-8 border-l-4 border-l-[#FC3D21] max-w-md text-center space-y-4 shadow-lg bg-white">
            <div className="w-16 h-16 rounded-2xl bg-[#FFF0EE] text-[#FC3D21] flex items-center justify-center mx-auto border border-[#FECACA]">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Accès Réservé au Responsable Labo</h2>
            <p className="text-xs text-slate-600">
              Votre compte actuel (<strong className="text-slate-900">{currentUser.matricule}</strong>) possède le rôle <strong className="text-[#0B3D91]">{currentUser.role}</strong>. La gestion de l&apos;infrastructure réseau et du contrôleur Mikrotik est réservée au Responsable Laboratoire et Réseau ou aux administrateurs.
            </p>
            <button
              onClick={() => router.push('/espace-membre')}
              className="btn-nasa text-xs font-bold cursor-pointer"
            >
              Retourner à mon Espace Membre
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: 'var(--surface-1)' }}>
      <AppHeader />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 anim-fade-in">
        <LabManagerView allUsers={allUsers} />
      </main>
    </div>
  );
}
