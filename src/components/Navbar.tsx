'use client';

import React from 'react';
import { User, Role } from '@/lib/types';
import { ROLE_LABELS } from './AdminView';
import { 
  ShieldCheck, 
  User as UserIcon, 
  Smartphone, 
  LogOut, 
  Wifi, 
  ChevronDown, 
  Cpu
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  allUsers: User[];
  onSelectUser: (user: User) => void;
  activeRoleTab: Role;
  onChangeRoleTab: (role: Role) => void;
}

export default function Navbar({
  currentUser,
  allUsers,
  onSelectUser,
  activeRoleTab,
  onChangeRoleTab,
}: NavbarProps) {
  return (
    <>
      <div className="accent-bar w-full" />
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-xl shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Titre officiel de la Division */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B3D91] shadow-xs flex items-center justify-center font-black text-white text-base">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#0B3D91] text-base tracking-tight font-display">GIT PLATFORM</span>
                <span className="px-2 py-0.5 bg-[#E8F0FC] text-[#0B3D91] text-[10px] font-bold rounded-full border border-[#C7D7F8]">
                  PWA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Division Génie Infotronique - Gestion & Laboratoire
              </p>
            </div>
          </div>

          {/* Navigation des Rôles */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onChangeRoleTab('MEMBER')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeRoleTab === 'MEMBER'
                  ? 'bg-[#0B3D91] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Membre
            </button>

            <button
              onClick={() => onChangeRoleTab('CENSEUR')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeRoleTab === 'CENSEUR'
                  ? 'bg-[#0B3D91] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Censeur (Scan)
            </button>

            <button
              onClick={() => onChangeRoleTab('TREASURER')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeRoleTab === 'TREASURER'
                  ? 'bg-[#0B3D91] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Trésorier (PDF)
            </button>

            <button
              onClick={() => onChangeRoleTab('ADMIN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeRoleTab === 'ADMIN'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bureau Admin
            </button>
          </nav>

          {/* Profil actif & Sélecteur rapide d'utilisateur */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
              <div className="w-7 h-7 rounded-lg bg-[#0B3D91] text-white flex items-center justify-center text-xs font-bold">
                {currentUser.prenom[0]}
              </div>
              
              <div className="text-left hidden sm:block">
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  {currentUser.prenom} {currentUser.nom}
                </span>
                <span className={`text-[10px] font-bold ${ROLE_LABELS[currentUser.role]?.badgeClass || 'text-slate-600'}`}>
                  {ROLE_LABELS[currentUser.role]?.label || currentUser.role}
                </span>
              </div>

              {/* Menu de changement d'utilisateur pour démonstration immédiate */}
              <select
                aria-label="Changer d'utilisateur pour la démonstration"
                value={currentUser.id}
                onChange={(e) => {
                  const found = allUsers.find((u) => u.id === e.target.value);
                  if (found) {
                    onSelectUser(found);
                    onChangeRoleTab(found.role);
                  }
                }}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              >
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id} className="bg-white text-slate-900">
                    {u.nom} {u.prenom} ({u.role} - {u.niveau})
                  </option>
                ))}
              </select>

              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </div>
          </div>
        </div>

        {/* Barre de navigation mobile pour petits écrans */}
        <div className="md:hidden flex border-t border-slate-200 bg-slate-50 px-2 py-1.5 gap-1 overflow-x-auto">
          <button
            onClick={() => onChangeRoleTab('MEMBER')}
            className={`flex-1 min-w-[75px] py-1.5 px-2 rounded-lg text-xs font-bold text-center ${
              activeRoleTab === 'MEMBER' ? 'bg-[#0B3D91] text-white' : 'text-slate-600'
            }`}
          >
            Membre
          </button>
          <button
            onClick={() => onChangeRoleTab('CENSEUR')}
            className={`flex-1 min-w-[75px] py-1.5 px-2 rounded-lg text-xs font-bold text-center ${
              activeRoleTab === 'CENSEUR' ? 'bg-[#0B3D91] text-white' : 'text-slate-600'
            }`}
          >
            Censeur
          </button>
          <button
            onClick={() => onChangeRoleTab('TREASURER')}
            className={`flex-1 min-w-[75px] py-1.5 px-2 rounded-lg text-xs font-bold text-center ${
              activeRoleTab === 'TREASURER' ? 'bg-[#0B3D91] text-white' : 'text-slate-600'
            }`}
          >
            Trésorier
          </button>
          <button
            onClick={() => onChangeRoleTab('ADMIN')}
            className={`flex-1 min-w-[75px] py-1.5 px-2 rounded-lg text-xs font-bold text-center ${
              activeRoleTab === 'ADMIN' ? 'bg-purple-700 text-white' : 'text-slate-600'
            }`}
          >
            Admin
          </button>
        </div>
      </header>
    </>
  );
}

