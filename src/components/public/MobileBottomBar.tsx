'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Home,
  Calendar,
  Layers,
  Users,
  BookOpen,
  UserCheck,
  Lock,
  QrCode
} from 'lucide-react';

export default function MobileBottomBar() {
  const pathname = usePathname();
  const { currentUser } = useAuth();

  // Si on est sur une page d'administration lourde ou scan, adapter
  const isCenseur = pathname === '/censeur';

  return (
    <nav
      aria-label="Navigation rapide mobile"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#080D1A]/95 backdrop-blur-2xl border-t border-slate-200 dark:border-slate-800/90 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(0,0,0,0.08)] transition-colors duration-200"
    >
      <div className="flex items-center justify-around h-15 px-2 max-w-md mx-auto">
        {/* Accueil */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-1 w-14 py-1 text-[10px] font-mono font-bold transition active:scale-95 ${
            pathname === '/'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Home className="w-4.5 h-4.5" />
          <span>Accueil</span>
        </Link>

        {/* Événements */}
        <a
          href="/#events"
          className="flex flex-col items-center justify-center gap-1 w-14 py-1 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition active:scale-95"
        >
          <Calendar className="w-4.5 h-4.5" />
          <span>Agenda</span>
        </a>

        {/* Projets R&D */}
        <a
          href="/#projects"
          className="flex flex-col items-center justify-center gap-1 w-14 py-1 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition active:scale-95"
        >
          <Layers className="w-4.5 h-4.5" />
          <span>R&D</span>
        </a>

        {/* Médiathèque / Formations */}
        <Link
          href="/mediatheque"
          className={`flex flex-col items-center justify-center gap-1 w-14 py-1 text-[10px] font-mono font-bold transition active:scale-95 ${
            pathname.startsWith('/mediatheque')
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4.5 h-4.5" />
          <span>Ressources</span>
        </Link>

        {/* Organigramme */}
        <Link
          href="/organigramme"
          className={`flex flex-col items-center justify-center gap-1 w-14 py-1 text-[10px] font-mono font-bold transition active:scale-95 ${
            pathname === '/organigramme'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4.5 h-4.5" />
          <span>Bureau</span>
        </Link>

        {/* Espace Membre / Connexion */}
        {currentUser ? (
          <Link
            href="/espace-membre"
            className={`flex flex-col items-center justify-center gap-1 w-14 py-1 text-[10px] font-mono font-bold transition active:scale-95 ${
              pathname === '/espace-membre'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 border border-blue-400/40 flex items-center justify-center text-blue-700 dark:text-blue-300">
              <QrCode className="w-3.5 h-3.5" />
            </div>
            <span>Mon QR</span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex flex-col items-center justify-center gap-1 w-14 py-1 text-[10px] font-mono font-bold text-[#FC3D21] hover:text-red-500 transition active:scale-95"
          >
            <Lock className="w-4.5 h-4.5" />
            <span>Portail</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
