'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ROLE_LABELS } from './AdminView';
import MustChangePasswordModal from './MustChangePasswordModal';
import ThemeToggle from './ThemeToggle';
import {
  LogOut,
  Home,
  User as UserIcon,
  ChevronDown,
  Calendar,
  GraduationCap,
  CreditCard,
  Scale,
  Cpu,
  Camera,
  ShieldAlert,
  BookOpen,
  LayoutGrid,
  Users,
  Bell,
  Search,
  ChevronRight,
} from 'lucide-react';

/* ────────────────────────────── MODULE CONFIG ────────────────────────────── */
const MODULES = [
  { href: '/evenements-admin', label: 'Événements & Com', sub: 'Planning & inscriptions', icon: Calendar, color: 'indigo' },
  { href: '/formations-admin', label: 'Formations & R&D', sub: 'Ateliers, projets et certifs', icon: GraduationCap, color: 'amber' },
  { href: '/tresorier', label: 'Trésorerie & Caisse', sub: 'Cotisations, reçus & bilans', icon: CreditCard, color: 'emerald' },
  { href: '/censeur', label: 'Censeur & Accès', sub: 'Scanner QR & discipline', icon: Scale, color: 'blue' },
  { href: '/labo', label: 'Laboratoire & Mikrotik', sub: 'Filtrage MAC & Wi-Fi 6', icon: Cpu, color: 'cyan' },
  { href: '/community-manager', label: 'Gestion Médias', sub: 'Upload & albums CM', icon: Camera, color: 'pink' },
] as const;

const NAV_LINKS = [
  { href: '/espace-membre', label: 'Espace Membre' },
  { href: '/mediatheque', label: 'Médiathèque' },
  { href: '/organigramme', label: 'Organigramme' },
] as const;

/* Color map for module badge backgrounds */
const COLOR_MAP: Record<string, { bg: string; bgDark: string; text: string; textDark: string; border: string; borderDark: string }> = {
  indigo:  { bg: 'bg-indigo-50',  bgDark: 'dark:bg-indigo-950/50',  text: 'text-indigo-700',  textDark: 'dark:text-indigo-300',  border: 'border-indigo-200',  borderDark: 'dark:border-indigo-800' },
  amber:   { bg: 'bg-amber-50',   bgDark: 'dark:bg-amber-950/50',   text: 'text-amber-700',   textDark: 'dark:text-amber-300',   border: 'border-amber-200',   borderDark: 'dark:border-amber-800' },
  emerald: { bg: 'bg-emerald-50', bgDark: 'dark:bg-emerald-950/50', text: 'text-emerald-700', textDark: 'dark:text-emerald-300', border: 'border-emerald-200', borderDark: 'dark:border-emerald-800' },
  blue:    { bg: 'bg-blue-50',    bgDark: 'dark:bg-blue-950/50',    text: 'text-blue-700',    textDark: 'dark:text-blue-300',    border: 'border-blue-200',    borderDark: 'dark:border-blue-800' },
  cyan:    { bg: 'bg-cyan-50',    bgDark: 'dark:bg-cyan-950/50',    text: 'text-cyan-700',    textDark: 'dark:text-cyan-300',    border: 'border-cyan-200',    borderDark: 'dark:border-cyan-800' },
  pink:    { bg: 'bg-pink-50',    bgDark: 'dark:bg-pink-950/50',    text: 'text-pink-700',    textDark: 'dark:text-pink-300',    border: 'border-pink-200',    borderDark: 'dark:border-pink-800' },
  purple:  { bg: 'bg-purple-50',  bgDark: 'dark:bg-purple-950/50',  text: 'text-purple-700',  textDark: 'dark:text-purple-300',  border: 'border-purple-200',  borderDark: 'dark:border-purple-800' },
};

export default function AppHeader() {
  const { currentUser, logout } = useAuth();
  const pathname = usePathname();
  const [modulesOpen, setModulesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const closeAll = useCallback(() => {
    setModulesOpen(false);
    setProfileOpen(false);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setModulesOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on route change
  useEffect(() => {
    closeAll();
  }, [pathname, closeAll]);

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'ADMIN';
  const hasExecutiveRole = isAdmin || [
    'COMMUNICATION', 'FORMATION', 'TREASURER', 'CENSEUR', 'LAB_MANAGER', 'COMMUNITY_MANAGER'
  ].includes(currentUser.role);

  const initials = `${currentUser.prenom[0]}${currentUser.nom[0]}`;
  const roleInfo = ROLE_LABELS[currentUser.role];

  return (
    <>
      <MustChangePasswordModal />

      {/* ═══ STICKY HEADER ═══ */}
      <header className="sticky top-0 z-50 w-full">
        {/* Accent laser bar */}
        <div className="h-[3px] bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-400" />

        {/* Main bar */}
        <div className="bg-white/90 dark:bg-[#0B0F19]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8">
            <div className="h-14 flex items-center justify-between gap-2">

              {/* ──── LEFT: Logo ──── */}
              <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
                  <Image
                    src="/logo.jpg"
                    alt="Logo GIT"
                    width={36}
                    height={36}
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                      GIT
                    </span>
                    <span className="px-1.5 py-px text-[9px] font-bold rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-700/50">
                      PWA
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-500 font-medium hidden lg:block leading-tight">
                    Division Génie Infotronique
                  </p>
                </div>
              </Link>

              {/* ──── CENTER: Nav Links (desktop only) ──── */}
              <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
                {NAV_LINKS.map(({ href, label }) => {
                  const isActive = pathname === href || pathname.startsWith(href + '/');
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}

                {/* Modules dropdown (desktop) */}
                {hasExecutiveRole && (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => { setModulesOpen(!modulesOpen); setProfileOpen(false); }}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 cursor-pointer ${
                        modulesOpen
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                      aria-expanded={modulesOpen}
                    >
                      <LayoutGrid className="w-4 h-4" />
                      <span>Modules</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${modulesOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown panel */}
                    {modulesOpen && (
                      <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/80 p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-3 py-2 mb-1">
                          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                            Gestion & Administration
                          </p>
                        </div>

                        {MODULES.map(({ href, label, sub, icon: Icon, color }) => {
                          const c = COLOR_MAP[color];
                          const isActive = pathname === href;
                          return (
                            <Link
                              key={href}
                              href={href}
                              onClick={() => setModulesOpen(false)}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group ${
                                isActive
                                  ? `${c.bg} ${c.bgDark} ${c.text} ${c.textDark}`
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${c.bg} ${c.bgDark} ${c.border} ${c.borderDark} border`}>
                                <Icon className={`w-4 h-4 ${c.text} ${c.textDark}`} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[13px] font-semibold leading-tight truncate">{label}</p>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight truncate">{sub}</p>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition shrink-0" />
                            </Link>
                          );
                        })}

                        {isAdmin && (
                          <>
                            <div className="h-px bg-slate-100 dark:bg-slate-800 my-1.5 mx-2" />
                            <Link
                              href="/admin"
                              onClick={() => setModulesOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-purple-700 dark:text-purple-300 bg-purple-50/60 dark:bg-purple-950/30 hover:bg-purple-100/80 dark:hover:bg-purple-950/50 transition group"
                            >
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-purple-100 dark:bg-purple-900/60 border border-purple-200 dark:border-purple-700">
                                <ShieldAlert className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[13px] font-semibold leading-tight">Bureau Admin Central</p>
                                <p className="text-[11px] text-purple-500 dark:text-purple-400 leading-tight">Membres, rôles & mots de passe</p>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-purple-300 dark:text-purple-600 group-hover:text-purple-500 transition shrink-0" />
                            </Link>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </nav>

              {/* ──── RIGHT: Actions ──── */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Theme toggle */}
                <ThemeToggle />

                {/* Home link */}
                <Link
                  href="/"
                  className="hidden sm:flex w-9 h-9 items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                  title="Site Vitrine"
                >
                  <Home className="w-4 h-4" />
                </Link>

                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    type="button"
                    onClick={() => { setProfileOpen(!profileOpen); setModulesOpen(false); }}
                    className="flex items-center gap-2 rounded-xl px-1.5 py-1 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all duration-200 cursor-pointer"
                    aria-expanded={profileOpen}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                      {initials}
                    </div>
                    <div className="hidden md:block text-left max-w-[120px]">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate leading-tight">
                        {currentUser.prenom}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate leading-tight">
                        {roleInfo?.label || currentUser.role}
                      </p>
                    </div>
                    <ChevronDown className={`w-3 h-3 text-slate-400 hidden md:block transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile dropdown panel */}
                  {profileOpen && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/80 p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* User info */}
                      <div className="px-3 py-3 mb-1 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {currentUser.prenom} {currentUser.nom}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${roleInfo?.badgeClass || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200'}`}>
                                {roleInfo?.label || currentUser.role}
                              </span>
                            </div>
                            <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                              {currentUser.matricule}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Quick links */}
                      <Link
                        href="/espace-membre"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition text-[13px] font-medium"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        Mon Espace Membre
                      </Link>
                      <Link
                        href="/"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition text-[13px] font-medium"
                      >
                        <Home className="w-4 h-4 text-slate-400" />
                        Site Vitrine
                      </Link>

                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2" />

                      {/* Logout */}
                      <button
                        onClick={() => { setProfileOpen(false); logout(); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-[13px] font-medium cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Se déconnecter
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </header>
    </>
  );
}
