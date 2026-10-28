'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppHeader from '@/components/AppHeader';
import AdminView from '@/components/AdminView';
import { ShieldAlert } from 'lucide-react';

export default function AdminPage() {
  const { 
    isInitialized,
    currentUser, 
    allUsers, 
    updateUserRole, 
    toggleUserActive, 
    registerUser,
    adminProcessPasswordReset,
    restoreOfficialUsers,
    adminProcessPenalty
  } = useAuth();
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

  // Vérification stricte du rôle ADMIN (Présidence + Secrétariat uniquement)
  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex flex-col font-sans" style={{ background: 'var(--surface-1)' }}>
        <AppHeader />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="card p-8 border-l-4 border-l-[#FC3D21] max-w-md text-center space-y-4 shadow-lg bg-white">
            <div className="w-16 h-16 rounded-2xl bg-[#FFF0EE] text-[#FC3D21] flex items-center justify-center mx-auto border border-[#FECACA]">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Accès Restreint · Bureau Admin</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              L&apos;Administration Centrale est réservée exclusivement à la <strong>Présidence</strong> et au <strong>Secrétariat Général</strong> de la Division GIT.
              <br /><br />
              Accès : <code className="font-bold text-[#0B3D91]">GIT-BUR-01</code> (KPWANDA Yvan) &bull;{' '}
              <code className="font-bold text-[#0B3D91]">GIT-BUR-02</code> (ABDALLAH Wahab) &bull;{' '}
              <code className="font-bold text-[#0B3D91]">GIT-BUR-03</code> (MAWADJOU Danielle) &bull;{' '}
              <code className="font-bold text-[#0B3D91]">GIT-BUR-16</code> (ARMEL Jennifer)
              <br /><br />
              Votre rôle actuel : <strong className="text-[#0B3D91]">{currentUser.role}</strong>
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
        <AdminView
          allUsers={allUsers}
          onUpdateRole={updateUserRole}
          onToggleUserActive={toggleUserActive}
          onRegisterUser={registerUser}
          onProcessPasswordReset={adminProcessPasswordReset}
          onRestoreOfficialUsers={restoreOfficialUsers}
          onProcessPenalty={adminProcessPenalty}
        />
      </main>
    </div>
  );
}

