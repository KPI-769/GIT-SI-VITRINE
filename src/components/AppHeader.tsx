'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ROLE_LABELS } from './AdminView';
import MustChangePasswordModal from './MustChangePasswordModal';
import ThemeToggle from './ThemeToggle';
import { LogOut, Home, ShieldCheck, Sparkles, User as UserIcon, Menu, X } from 'lucide-react';

export default function AppHeader() {
  const { currentUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!currentUser) return null;

  return (
    <>
      <MustChangePasswordModal />
      <div className="accent-bar w-full" />
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-xl shadow-xs transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo officiel GIT */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white dark:bg-slate-900 p-0.5 border border-slate-200 dark:border-slate-800 shadow-xs group-hover:scale-105 transition">
              <Image
                src="/logo.jpg"
                alt="Logo GIT"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-blue-700 dark:text-blue-400 text-base tracking-tight font-display">
                  GIT PLATFORM
                </span>
                <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded-full border border-blue-200 dark:border-blue-500/30">
                  PWA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Division Génie Infotronique · Système de Gestion
              </p>
            </div>
          </Link>

          {/* Liens rapides selon le rôle RBAC */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-bold">
            <Link
              href="/espace-membre"
              className="px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Espace Membre
            </Link>

            <Link
              href="/organigramme"
              className="px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Organigramme
            </Link>

            <Link
              href="/mediatheque"
              className="px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Médiathèque
            </Link>

            {(currentUser.role === 'COMMUNICATION' || currentUser.role === 'ADMIN') && (
              <Link
                href="/evenements-admin"
                className="px-3 py-1.5 rounded-xl text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
              >
                Événements &amp; Com
              </Link>
            )}

            {(currentUser.role === 'FORMATION' || currentUser.role === 'ADMIN') && (
              <Link
                href="/formations-admin"
                className="px-3 py-1.5 rounded-xl text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
              >
                Formations &amp; Projets
              </Link>
            )}

            {(currentUser.role === 'TREASURER' || currentUser.role === 'ADMIN') && (
              <Link
                href="/tresorier"
                className="px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Trésorerie
              </Link>
            )}

            {(currentUser.role === 'CENSEUR' || currentUser.role === 'ADMIN') && (
              <Link
                href="/censeur"
                className="px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Censeur
              </Link>
            )}

            {(currentUser.role === 'LAB_MANAGER' || currentUser.role === 'ADMIN') && (
              <Link
                href="/labo"
                className="px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Labo &amp; Mikrotik
              </Link>
            )}

            {(currentUser.role === 'COMMUNITY_MANAGER' || currentUser.role === 'ADMIN') && (
              <Link
                href="/community-manager"
                className="px-3 py-1.5 rounded-xl text-pink-700 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/40 transition"
              >
                Galerie &amp; Médias
              </Link>
            )}

            {currentUser.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="px-3 py-1.5 rounded-xl text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition"
              >
                Bureau Admin
              </Link>
            )}
          </nav>

          {/* Profil, Theme Toggle & Déconnexion */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                {currentUser.prenom[0]}
                {currentUser.nom[0]}
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                  {currentUser.prenom} {currentUser.nom}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border inline-block mt-0.5 ${ROLE_LABELS[currentUser.role]?.badgeClass || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
                  {ROLE_LABELS[currentUser.role]?.label || currentUser.role} ({currentUser.niveau})
                </span>
              </div>
            </div>

            <Link
              href="/"
              className="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition"
              title="Aller sur le Site Vitrine"
            >
              <Home className="w-4 h-4" />
            </Link>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold border border-red-200 dark:border-red-800 transition shadow-xs cursor-pointer"
              title="Se déconnecter"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>

            {/* Bouton Hamburger Mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition active:scale-95"
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu de navigation'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-red-500" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Menu Déroulant Mobile avec Navigation RBAC */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/98 dark:bg-[#0B0F19]/98 backdrop-blur-2xl px-4 py-4 space-y-3 animate-fadeIn">
            {/* Profil utilisateur en mode compact */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {currentUser.prenom[0]}{currentUser.nom[0]}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {currentUser.prenom} {currentUser.nom}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${ROLE_LABELS[currentUser.role]?.badgeClass || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                    {ROLE_LABELS[currentUser.role]?.label || currentUser.role}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {currentUser.matricule}
                  </span>
                </div>
              </div>
            </div>

            {/* Liens de navigation selon le Rôle */}
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <Link
                href="/espace-membre"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 active:scale-98 transition flex items-center gap-2"
              >
                <span>🎓 Espace Membre</span>
              </Link>

              <Link
                href="/organigramme"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 active:scale-98 transition flex items-center gap-2"
              >
                <span>🏛️ Organigramme</span>
              </Link>

              <Link
                href="/mediatheque"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 active:scale-98 transition flex items-center gap-2"
              >
                <span>📚 Médiathèque</span>
              </Link>

              {(currentUser.role === 'CENSEUR' || currentUser.role === 'ADMIN') && (
                <Link
                  href="/censeur"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 active:scale-98 transition flex items-center gap-2"
                >
                  <span>⚖️ Scanner Censeur</span>
                </Link>
              )}

              {(currentUser.role === 'TREASURER' || currentUser.role === 'ADMIN') && (
                <Link
                  href="/tresorier"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 active:scale-98 transition flex items-center gap-2"
                >
                  <span>💰 Trésorerie & Caisse</span>
                </Link>
              )}

              {(currentUser.role === 'LAB_MANAGER' || currentUser.role === 'ADMIN') && (
                <Link
                  href="/labo"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-cyan-50/80 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400 active:scale-98 transition flex items-center gap-2"
                >
                  <span>🔬 Laboratoire GIT</span>
                </Link>
              )}

              {(currentUser.role === 'COMMUNITY_MANAGER' || currentUser.role === 'ADMIN') && (
                <Link
                  href="/community-manager"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-pink-50/80 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-400 active:scale-98 transition flex items-center gap-2"
                >
                  <span>📸 Galerie Médias</span>
                </Link>
              )}

              {currentUser.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 active:scale-98 transition flex items-center gap-2 col-span-2"
                >
                  <span>👑 Administration Centrale</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
