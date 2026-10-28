'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppHeader from '@/components/AppHeader';
import MemberView from '@/components/MemberView';
import { Sparkles, ShieldCheck, Smartphone, Wifi, QrCode } from 'lucide-react';

export default function EspaceMembrePage() {
  const { isInitialized, currentUser, updateUserMacs } = useAuth();
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

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: 'var(--surface-1)' }}>
      <AppHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 anim-fade-in">
        {/* En-tête contextuel de l'espace membre */}
        <section className="card p-6 sm:p-8 border-l-4 border-l-[#0B3D91] shadow-md bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0FC] border border-[#C7D7F8] text-[#0B3D91] text-xs font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-[#FC3D21]" />
                <span>Portail Individuel · Division Génie Infotronique</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
                Espace Membre & Badge Numérique
              </h1>
              <p className="text-sm text-slate-600 mt-2 max-w-2xl">
                Bienvenue, <strong className="text-slate-900">{currentUser.prenom} {currentUser.nom}</strong> ({currentUser.niveau}). Retrouvez votre badge d&apos;accès dynamique crypté, déclarez vos adresses MAC pour le Wi-Fi 6 du laboratoire et consultez l&apos;historique de vos cotisations.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
              <div className="px-3.5 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center gap-2 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                <span className="text-slate-600">Statut Compte : <strong className="text-[#16A34A] font-bold">Actif</strong></span>
              </div>
              <div className="px-3.5 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center gap-2 shadow-xs">
                <Smartphone className="w-4 h-4 text-[#0B3D91]" />
                <span className="text-slate-600">PWA Offline : <strong className="text-slate-900 font-semibold">Carte en cache</strong></span>
              </div>
            </div>
          </div>
        </section>

        {/* Composant principal membre */}
        <MemberView
          user={currentUser}
          onUpdateMacs={(newMacs) => updateUserMacs(currentUser.id, newMacs)}
        />
      </main>
    </div>
  );
}

