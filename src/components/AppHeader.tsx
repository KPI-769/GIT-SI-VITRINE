'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ROLE_LABELS } from './AdminView';
import MustChangePasswordModal from './MustChangePasswordModal';
import ThemeToggle from './ThemeToggle';
import {
  LogOut,
  Home,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  Calendar,
  GraduationCap,
  CreditCard,
  Scale,
  Cpu,
  Camera,
  ShieldAlert,
  FolderGit2,
  BookOpen,
  LayoutGrid
} from 'lucide-react';

export default function AppHeader() {
  const { currentUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modulesDropdownOpen, setModulesDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setModulesDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'ADMIN';
  const hasExecutiveRole = isAdmin || [
    'COMMUNICATION',
    'FORMATION',
    'TREASURER',
    'CENSEUR',
    'LAB_MANAGER',
    'COMMUNITY_MANAGER'
  ].includes(currentUser.role);

  return (
    <>
      <MustChangePasswordModal />
      <div className="accent-bar w-full" />
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-xl shadow-xs transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Logo officiel GIT */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-white dark:bg-slate-900 p-0.5 border border-slate-200 dark:border-slate-800 shadow-xs group-hover:scale-105 transition">
              <Image
                src="/logo.jpg"
                alt="Logo GIT"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-blue-700 dark:text-blue-400 text-sm sm:text-base tracking-tight font-display">
                  GIT PLATFORM
                </span>
                <span className="px-1.5 py-0.2 sm:px-2 sm:py-0.5 bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[9px] sm:text-[10px] font-bold rounded-full border border-blue-200 dark:border-blue-500/30">
                  PWA
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 hidden md:block">
                Division Génie Infotronique · Système de Gestion
              </p>
            </div>
          </Link>

          {/* Navigation Bureau & Tablettes (Optimisée pour ne jamais déborder) */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-bold">
            <Link
              href="/espace-membre"
              className="px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Espace Membre
            </Link>

            <Link
              href="/mediatheque"
              className="px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Albums photos et vidéos de la vie du club"
            >
              Médiathèque
            </Link>

            <Link
              href="/organigramme"
              className="px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Organigramme
            </Link>

            {/* Rôle spécifique direct si non-admin */}
            {!isAdmin && currentUser.role === 'FORMATION' && (
              <Link
                href="/formations-admin"
                className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 transition flex items-center gap-1.5"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Formations &amp; Projets</span>
              </Link>
            )}

            {!isAdmin && currentUser.role === 'COMMUNICATION' && (
              <Link
                href="/evenements-admin"
                className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 transition flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Événements &amp; Com</span>
              </Link>
            )}

            {!isAdmin && currentUser.role === 'TREASURER' && (
              <Link
                href="/tresorier"
                className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 transition flex items-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Trésorerie</span>
              </Link>
            )}

            {!isAdmin && currentUser.role === 'CENSEUR' && (
              <Link
                href="/censeur"
                className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 transition flex items-center gap-1.5"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Censeur</span>
              </Link>
            )}

            {!isAdmin && currentUser.role === 'LAB_MANAGER' && (
              <Link
                href="/labo"
                className="px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 transition flex items-center gap-1.5"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Labo &amp; Mikrotik</span>
              </Link>
            )}

            {!isAdmin && currentUser.role === 'COMMUNITY_MANAGER' && (
              <Link
                href="/community-manager"
                className="px-3 py-1.5 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-400 border border-pink-200 dark:border-pink-800 transition flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Gestion Médias</span>
              </Link>
            )}

            {/* Menu Déroulant Centralisé des Modules Exécutifs (pour Administrateurs & Bureau) */}
            {hasExecutiveRole && (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setModulesDropdownOpen(!modulesDropdownOpen)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                    isAdmin
                      ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-100'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                  }`}
                  aria-expanded={modulesDropdownOpen}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Modules &amp; Pôles</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${modulesDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {modulesDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#111827] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-fadeIn space-y-1">
                    <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                      Gestion &amp; Administration GIT
                    </div>

                    <Link
                      href="/evenements-admin"
                      onClick={() => setModulesDropdownOpen(false)}
                      className="flex items-center gap-2.5 p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 transition"
                    >
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs">Événements &amp; Communication</div>
                        <div className="text-[10px] text-slate-400">Planning &amp; inscriptions</div>
                      </div>
                    </Link>

                    <Link
                      href="/formations-admin"
                      onClick={() => setModulesDropdownOpen(false)}
                      className="flex items-center gap-2.5 p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:text-amber-600 transition"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs">Formations &amp; Projets R&amp;D</div>
                        <div className="text-[10px] text-slate-400">Ateliers, projets et certifs</div>
                      </div>
                    </Link>

                    <Link
                      href="/tresorier"
                      onClick={() => setModulesDropdownOpen(false)}
                      className="flex items-center gap-2.5 p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 transition"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs">Trésorerie &amp; Caisse</div>
                        <div className="text-[10px] text-slate-400">Cotisations, reçus PDF &amp; bilans</div>
                      </div>
                    </Link>

                    <Link
                      href="/censeur"
                      onClick={() => setModulesDropdownOpen(false)}
                      className="flex items-center gap-2.5 p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 transition"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                        <Scale className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs">Censeur &amp; Contrôle Accès</div>
                        <div className="text-[10px] text-slate-400">Scanner QR &amp; discipline</div>
                      </div>
                    </Link>

                    <Link
                      href="/labo"
                      onClick={() => setModulesDropdownOpen(false)}
                      className="flex items-center gap-2.5 p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 hover:text-cyan-600 transition"
                    >
                      <div className="w-7 h-7 rounded-lg bg-cyan-100 dark:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 flex items-center justify-center shrink-0">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs">Laboratoire &amp; Mikrotik</div>
                        <div className="text-[10px] text-slate-400">Filtrage MAC &amp; Wi-Fi 6</div>
                      </div>
                    </Link>

                    <Link
                      href="/community-manager"
                      onClick={() => setModulesDropdownOpen(false)}
                      className="flex items-center gap-2.5 p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-pink-50 dark:hover:bg-pink-950/50 hover:text-pink-600 transition"
                    >
                      <div className="w-7 h-7 rounded-lg bg-pink-100 dark:bg-pink-900/60 text-pink-700 dark:text-pink-300 flex items-center justify-center shrink-0">
                        <Camera className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs">Gestion Médias (Modération)</div>
                        <div className="text-[10px] text-slate-400">Upload &amp; albums Community Manager</div>
                      </div>
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setModulesDropdownOpen(false)}
                        className="flex items-center gap-2.5 p-2 rounded-xl text-purple-700 dark:text-purple-300 bg-purple-50/70 dark:bg-purple-950/40 hover:bg-purple-100 transition mt-1 border border-purple-200 dark:border-purple-800"
                      >
                        <div className="w-7 h-7 rounded-lg bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 flex items-center justify-center shrink-0">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs">Bureau Admin Central</div>
                          <div className="text-[10px] text-purple-600 dark:text-purple-400">Membres, rôles &amp; mots de passe</div>
                        </div>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Profil, Theme Toggle & Déconnexion */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <ThemeToggle />

            {/* Badge Utilisateur */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 sm:px-2.5 py-1 shadow-xs">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                {currentUser.prenom[0]}
                {currentUser.nom[0]}
              </div>
              <div className="text-left hidden md:block">
                <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight max-w-[130px] truncate">
                  {currentUser.prenom} {currentUser.nom}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border inline-block mt-0.5 ${ROLE_LABELS[currentUser.role]?.badgeClass || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
                  {ROLE_LABELS[currentUser.role]?.label || currentUser.role}
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
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold border border-red-200 dark:border-red-800 transition shadow-xs cursor-pointer"
              title="Se déconnecter"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quitter</span>
            </button>

            {/* Bouton Hamburger Mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition active:scale-95"
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu de navigation'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-red-500" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Menu Déroulant Mobile avec Navigation Complète et Structurée */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/98 dark:bg-[#0B0F19]/98 backdrop-blur-2xl px-4 py-4 space-y-4 animate-fadeIn max-h-[85vh] overflow-y-auto">
            {/* Profil utilisateur en mode compact */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                {currentUser.prenom[0]}{currentUser.nom[0]}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
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

            {/* Section 1 : Espace Membre & Consultation */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 font-bold">
                Espace Personnel &amp; Découverte
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <Link
                  href="/espace-membre"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 active:scale-98 transition flex items-center gap-2"
                >
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>Espace Membre</span>
                </Link>

                <Link
                  href="/mediatheque"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 active:scale-98 transition flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-slate-500" />
                  <span>Médiathèque</span>
                </Link>

                <Link
                  href="/organigramme"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 active:scale-98 transition flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                  <span>Organigramme</span>
                </Link>

                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 active:scale-98 transition flex items-center gap-2"
                >
                  <Home className="w-4 h-4 text-slate-500" />
                  <span>Site Vitrine</span>
                </Link>
              </div>
            </div>

            {/* Section 2 : Modules de Gestion & Direction (Tous les modules accessibles) */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200/80 dark:border-slate-800">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 font-bold">
                Direction &amp; Modules de Gestion
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold">
                <Link
                  href="/evenements-admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 active:scale-98 transition flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>🗓️ Événements &amp; Com</span>
                </Link>

                <Link
                  href="/formations-admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 active:scale-98 transition flex items-center gap-2"
                >
                  <GraduationCap className="w-4 h-4 text-amber-600" />
                  <span>🚀 Formations &amp; Projets</span>
                </Link>

                <Link
                  href="/tresorier"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 active:scale-98 transition flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>💰 Trésorerie &amp; Caisse</span>
                </Link>

                <Link
                  href="/censeur"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 active:scale-98 transition flex items-center gap-2"
                >
                  <Scale className="w-4 h-4 text-blue-600" />
                  <span>⚖️ Scanner Censeur</span>
                </Link>

                <Link
                  href="/labo"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-cyan-50/80 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400 active:scale-98 transition flex items-center gap-2"
                >
                  <Cpu className="w-4 h-4 text-cyan-600" />
                  <span>🔬 Laboratoire &amp; Mikrotik</span>
                </Link>

                <Link
                  href="/community-manager"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-pink-50/80 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-400 active:scale-98 transition flex items-center gap-2"
                >
                  <Camera className="w-4 h-4 text-pink-600" />
                  <span>📸 Gestion Médias (Modération)</span>
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 active:scale-98 transition flex items-center gap-2 col-span-1 sm:col-span-2"
                  >
                    <ShieldAlert className="w-4 h-4 text-purple-600" />
                    <span>👑 Bureau Admin Central</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
