'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Home,
  BookOpen,
  QrCode,
  Users,
  Compass,
  Sparkles,
  ShieldCheck,
  Camera,
  Layers,
  X,
  Lock,
  LogOut
} from 'lucide-react';
import PermissionsModal from '@/components/PermissionsModal';

export default function MobileBottomBar() {
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();
  const [isPermsOpen, setIsPermsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Vérifier si un onglet est actif
  const isHome = pathname === '/';
  const isMediatheque = pathname.startsWith('/mediatheque') || pathname === '/media';
  const isBadge = pathname === '/espace-membre' || pathname === '/censeur';
  const isOrganigramme = pathname === '/organigramme';

  return (
    <>
      <PermissionsModal
        isOpen={isPermsOpen}
        onClose={() => setIsPermsOpen(false)}
        requiredFor="all"
      />

      {/* Menu Tiroir Rapide Mobile (Style YouTube "Plus / Explorer") */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fadeIn flex flex-col justify-end">
          <div className="bg-white dark:bg-[#111827] border-t border-slate-200 dark:border-slate-800 rounded-t-3xl p-5 space-y-4 max-h-[80vh] overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl animate-slideUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                  {currentUser ? `${currentUser.prenom[0]}${currentUser.nom[0]}` : 'GIT'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {currentUser ? `${currentUser.prenom} ${currentUser.nom}` : 'Division GIT-SJD'}
                  </h4>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    {currentUser?.role || 'Plateforme Mobile'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Accès Autorisations PWA */}
            <button
              onClick={() => {
                setIsMenuOpen(false);
                setIsPermsOpen(true);
              }}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-200 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Autorisations PWA (Caméra, Audio, Alertes)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-mono">
                Gérer
              </span>
            </button>

            {/* Raccourcis de Navigation */}
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <Link
                href="/evenements-admin"
                onClick={() => setIsMenuOpen(false)}
                className="p-3 rounded-xl bg-slate-50 dark:bg-[#161F30] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:text-blue-600 flex items-center gap-2"
              >
                <span>🗓️ Événements & Com</span>
              </Link>
              <Link
                href="/formations-admin"
                onClick={() => setIsMenuOpen(false)}
                className="p-3 rounded-xl bg-slate-50 dark:bg-[#161F30] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:text-blue-600 flex items-center gap-2"
              >
                <span>🚀 Formations & R&D</span>
              </Link>
              <Link
                href="/tresorier"
                onClick={() => setIsMenuOpen(false)}
                className="p-3 rounded-xl bg-slate-50 dark:bg-[#161F30] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:text-blue-600 flex items-center gap-2"
              >
                <span>💰 Trésorerie & Reçus</span>
              </Link>
              <Link
                href="/censeur"
                onClick={() => setIsMenuOpen(false)}
                className="p-3 rounded-xl bg-slate-50 dark:bg-[#161F30] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:text-blue-600 flex items-center gap-2"
              >
                <span>⚖️ Censeur & Scan</span>
              </Link>
              <Link
                href="/labo"
                onClick={() => setIsMenuOpen(false)}
                className="p-3 rounded-xl bg-slate-50 dark:bg-[#161F30] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:text-blue-600 flex items-center gap-2"
              >
                <span>🔬 Labo & Wi-Fi 6</span>
              </Link>
              <Link
                href="/community-manager"
                onClick={() => setIsMenuOpen(false)}
                className="p-3 rounded-xl bg-slate-50 dark:bg-[#161F30] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:text-blue-600 flex items-center gap-2"
              >
                <span>📸 Gestion Médias</span>
              </Link>
              {currentUser?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="col-span-2 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-100 flex items-center gap-2"
                >
                  <span>🛡️ Bureau Admin Central</span>
                </Link>
              )}
            </div>

            {/* Déconnexion ou Connexion */}
            {currentUser ? (
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  logout();
                }}
                className="w-full py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-200 dark:border-rose-800 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Se déconnecter</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="btn-nasa w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Connexion Membre</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Barre Footer Mobile YouTube-Style (Flottante & Blur Ultra-Clean) */}
      <nav
        aria-label="Navigation principale mobile"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-2xl border-t border-slate-200 dark:border-slate-800/90 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_24px_rgba(0,0,0,0.4)] transition-all duration-200"
      >
        <div className="flex items-center justify-between px-3 max-w-md mx-auto h-14">
          {/* 1. ACCUEIL */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all active:scale-95 ${
              isHome
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Home className={`w-5 h-5 transition-transform ${isHome ? 'scale-110' : ''}`} />
            <span className="text-[10px] tracking-tight">Accueil</span>
          </Link>

          {/* 2. MÉDIATHÈQUE */}
          <Link
            href="/mediatheque"
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all active:scale-95 ${
              isMediatheque
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className={`w-5 h-5 transition-transform ${isMediatheque ? 'scale-110' : ''}`} />
            <span className="text-[10px] tracking-tight">Médias</span>
          </Link>

          {/* 3. BOUTON CENTRAL YOUTUBE-STYLE (BADGE QR & SCAN) */}
          <div className="flex-1 flex justify-center -mt-4">
            <Link
              href={currentUser?.role === 'CENSEUR' ? '/censeur' : '/espace-membre'}
              className="relative group p-0.5 rounded-full"
              title="Mon Badge d'accès QR"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 ring-4 ring-white dark:ring-[#0B0F19] group-active:scale-95 transition-all">
                <QrCode className="w-6 h-6 animate-pulse" />
              </div>
            </Link>
          </div>

          {/* 4. ORGANIGRAMME */}
          <Link
            href="/organigramme"
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all active:scale-95 ${
              isOrganigramme
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Users className={`w-5 h-5 transition-transform ${isOrganigramme ? 'scale-110' : ''}`} />
            <span className="text-[10px] tracking-tight">Bureau</span>
          </Link>

          {/* 5. EXPLORER / MENU */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-col items-center justify-center gap-1 flex-1 py-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all active:scale-95 cursor-pointer"
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Plus</span>
          </button>
        </div>
      </nav>
    </>
  );
}
