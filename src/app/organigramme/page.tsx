'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppHeader from '@/components/AppHeader';
import { SJP_BUREAU_MEMBERS } from '@/lib/members-data';
import { ROLE_LABELS } from '@/components/AdminView';
import { Role } from '@/lib/types';
import {
  Award,
  ShieldCheck,
  Zap,
  Network,
  Sparkles,
  GraduationCap,
  Users,
  Mail,
  Phone,
  ArrowLeft,
  Building,
  CheckCircle2,
  ChevronRight,
  UserCheck
} from 'lucide-react';

const POLE_INFO = {
  1: {
    title: 'Pôle 1 · Haute Présidence & Conseil',
    badge: 'Présidence & Conseil',
    desc: 'Représentation institutionnelle de la Division GIT auprès de Saint Jérôme Polytechnique et arbitrage stratégique.',
    color: '#0B3D91',
    bgBadge: 'bg-blue-100 text-blue-900 border-blue-300'
  },
  2: {
    title: 'Pôle 2 · Dirigeants Exécutifs Titulaires',
    badge: 'Titulaires Exécutifs',
    desc: 'Pilotage opérationnel direct des missions : Secrétariat, Censure, Trésorerie, Laboratoire, Formation et Communication.',
    color: '#F59E0B',
    bgBadge: 'bg-amber-100 text-amber-900 border-amber-300'
  },
  3: {
    title: 'Pôle 3 · Adjoints Exécutifs',
    badge: 'Adjoints Opérationnels',
    desc: 'Continuité de service, contrôle de terrain et cogestion des pôles Formation, Communication, Censure et Secrétariat.',
    color: '#10B981',
    bgBadge: 'bg-emerald-100 text-emerald-900 border-emerald-300'
  }
};

export default function OrganigrammePage() {
  const [selectedPole, setSelectedPole] = useState<number | 'ALL'>('ALL');

  const filteredMembers = selectedPole === 'ALL'
    ? SJP_BUREAU_MEMBERS
    : SJP_BUREAU_MEMBERS.filter(m => m.pole === selectedPole);

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: 'var(--surface-1)' }}>
      <AppHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 anim-fade-in">
        {/* En-tête officiel */}
        <section className="card p-6 sm:p-8 border-l-4 border-l-[#0B3D91] shadow-md bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0FC] border border-[#C7D7F8] text-[#0B3D91] text-xs font-bold mb-3">
                <Building className="w-3.5 h-3.5 text-[#FC3D21]" />
                <span>Saint Jérôme Polytechnique Douala · Division Génie Infotronique</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
                Organigramme Officiel du Bureau Exécutif
              </h1>
              <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
                Structure hiérarchique officielle régissant la Division Génie Infotronique (GIT) pour le mandat 2026/2027. Retrouvez les <strong>16 officiers dirigeants</strong> répartis en 3 pôles d&apos;exercice avec leurs fonctions, contacts et compétences.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/espace-membre"
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 flex items-center gap-2 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Espace Membre</span>
              </Link>
            </div>
          </div>

          {/* Filtres par Pôle */}
          <div className="mt-6 pt-5 border-t border-slate-200 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700 mr-2 uppercase tracking-wider">Filtrer par Pôle :</span>
            <button
              onClick={() => setSelectedPole('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedPole === 'ALL'
                  ? 'bg-[#0B3D91] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Tous les Dirigeants (16)
            </button>
            <button
              onClick={() => setSelectedPole(1)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedPole === 1
                  ? 'bg-[#0B3D91] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Pôle 1 · Présidence &amp; Conseil (5)
            </button>
            <button
              onClick={() => setSelectedPole(2)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedPole === 2
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Pôle 2 · Titulaires Exécutifs (7)
            </button>
            <button
              onClick={() => setSelectedPole(3)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedPole === 3
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Pôle 3 · Adjoints Exécutifs (4)
            </button>
          </div>
        </section>

        {/* Grille des membres officiels de l'organigramme */}
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMembers.map((member) => {
              const poleData = POLE_INFO[member.pole as 1 | 2 | 3];
              const roleMeta = ROLE_LABELS[member.role as Role] || { label: member.role, badgeClass: 'bg-slate-100 text-slate-800' };

              return (
                <div
                  key={member.id}
                  className="card p-5 bg-white border border-slate-300 hover:border-[#0B3D91] transition shadow-xs hover:shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    {/* Badge Pôle & Matricule */}
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${poleData.bgBadge}`}>
                        {poleData.badge}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-[#0B3D91] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {member.matricule}
                      </span>
                    </div>

                    {/* Identité */}
                    <div>
                      <h3 className="text-base font-black text-slate-900 font-display">
                        {member.fullName}
                      </h3>
                      <p className="text-xs font-bold text-[#0B3D91] mt-0.5">
                        {member.poste}
                      </p>
                    </div>

                    {/* Rôle RBAC associé */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">Privilège RBAC :</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${roleMeta.badgeClass}`}>
                        {roleMeta.label}
                      </span>
                    </div>

                    {/* Contacts officiels */}
                    <div className="pt-2 space-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate font-mono text-[11px]">{member.email}</span>
                      </div>
                      {member.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono text-[11px]">{member.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Mandat Actif
                    </span>
                    <span>2026/2027</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
