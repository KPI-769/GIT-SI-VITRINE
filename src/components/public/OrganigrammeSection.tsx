'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck, Award, Briefcase, ChevronDown,
  UserCheck, Mail, Phone, Cpu, Network, Zap,
  Terminal, Users, Clock, Sparkles, Play,
  RotateCcw, CheckCircle2, Layers, Search,
  ArrowDown, ChevronRight, Filter, ShieldAlert,
  GraduationCap, Binary, BookOpen, Rocket,
  ExternalLink, Building2, User
} from 'lucide-react';
import gsap from 'gsap';
import { SJP_OFFICIAL_MEMBERS, OfficialMember } from '@/lib/members-data';

export interface PyramidalRole {
  id: string;
  level: 1 | 2 | 3;
  title: string;
  department: string;
  name: string;
  matricule: string;
  contact: string;
  phone?: string;
  accent: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  badgeLight: string;
  badgeDark: string;
  responsibilities: string[];
  prerogatives: string;
}

// ─── Postes Officiels de la Pyramide de Gouvernance GIT — Saint Jérôme Polytechnique ───
const PYRAMID_LEVEL_1: PyramidalRole[] = [
  {
    id: 'president',
    level: 1,
    title: 'Président du Bureau Exécutif / Délégué Général',
    department: 'Haute Présidence & Représentation Institutionnelle',
    name: 'Présidence de la Division',
    matricule: 'SJP-GIT-EXEC-01',
    contact: 'bureau.git@saintjerome.cm',
    phone: '+237 677 38 70 05',
    accent: '#2563EB',
    icon: Award,
    badgeLight: 'bg-blue-50 text-blue-800 border-blue-200',
    badgeDark: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
    responsibilities: [
      'Représentation officielle de la Division auprès de la Direction de Saint Jérôme Polytechnique.',
      'Arbitrage stratégique, ordonnancement des résolutions et coordination générale des 4 pôles métiers.',
      'Validation conjointe des engagements budgétaires avec la Trésorerie Générale.',
      'Présidence des Assemblées Générales ordinaires et extraordinaires de la Division.'
    ],
    prerogatives: 'Droit de veto suspensif, signature des conventions et des partenariats industriels.'
  }
];

const PYRAMID_LEVEL_2: PyramidalRole[] = [
  {
    id: 'sg',
    level: 2,
    title: 'Secrétaire Général',
    department: 'Administration Générale & Registre Numérique',
    name: 'Secrétariat Général',
    matricule: 'SJP-GIT-EXEC-02',
    contact: 'sg.git@saintjerome.cm',
    phone: '+237 653 62 91 58',
    accent: '#0284C7',
    icon: Terminal,
    badgeLight: 'bg-sky-50 text-sky-800 border-sky-200',
    badgeDark: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
    responsibilities: [
      'Rédaction et conservation des Procès-Verbaux (PV) de toutes les séances officielles.',
      'Gestion et mise à jour du registre certifié des 99 membres de la Division.',
      'Publication des convocations, ordres du jour et diffusion des circulaires techniques.',
      'Archivage sécurisé des documents administratifs et suivi des correspondances.'
    ],
    prerogatives: 'Détention du sceau officiel et validation de la conformité statutaire des actes.'
  },
  {
    id: 'censeur',
    level: 2,
    title: 'Censeur Général & Responsable Discipline',
    department: 'Discipline, Présences & Contrôle d\'Accès Labo',
    name: 'Censure & Régulation',
    matricule: 'SJP-GIT-EXEC-03',
    contact: 'censeur.git@saintjerome.cm',
    phone: '+237 677 23 86 04',
    accent: '#DC2626',
    icon: ShieldCheck,
    badgeLight: 'bg-red-50 text-red-800 border-red-200',
    badgeDark: 'bg-red-500/20 text-red-300 border-red-400/40',
    responsibilities: [
      'Contrôle rigoureux des présences aux séances plénières, ateliers et travaux pratiques au laboratoire.',
      'Gestion du terminal d\'émargement PWA et scan des badges QR numériques des étudiants.',
      'Application du barème officiel des sanctions et notification des pénalités de retard ou absence.',
      'Maintien de l\'ordre, du respect des équipements sensibles et du calme en salle de recherche.'
    ],
    prerogatives: 'Notification des avertissements et émission des rapports disciplinaires au Conseil.'
  },
  {
    id: 'tresorier',
    level: 2,
    title: 'Trésorier Général',
    department: 'Finances, Recouvrement des Cotisations & Quitus',
    name: 'Trésorerie de la Division',
    matricule: 'SJP-GIT-EXEC-04',
    contact: 'finances.git@saintjerome.cm',
    phone: '+237 688 64 32 45',
    accent: '#059669',
    icon: Zap,
    badgeLight: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    badgeDark: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    responsibilities: [
      'Recouvrement systématique des cotisations mensuelles statutaires (2 000 FCFA / étudiant).',
      'Tenue rigoureuse du grand livre comptable et rapprochement bancaire / Mobile Money.',
      'Délivrance instantanée des quittances et certificats de quitus financier informatisés.',
      'Présentation du bilan financier trimestriel audité devant l\'Assemblée Générale.'
    ],
    prerogatives: 'Signature financière, gestion de la caisse de menues dépenses et des décaissements votés.'
  }
];

const PYRAMID_LEVEL_3: PyramidalRole[] = [
  {
    id: 'labo_manager',
    level: 3,
    title: 'Responsable Laboratoire & Réseau Wi-Fi',
    department: 'Infrastructure Réseau & Bancs d\'Essai Électroniques',
    name: 'Direction du Laboratoire',
    matricule: 'SJP-GIT-TECH-01',
    contact: 'labo.git@saintjerome.cm',
    phone: '+237 680 89 67 65',
    accent: '#D97706',
    icon: Network,
    badgeLight: 'bg-amber-50 text-amber-800 border-amber-200',
    badgeDark: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    responsibilities: [
      'Gestion et maintenance de la baie Cat 6A et des bornes Wi-Fi 6 MIMO du laboratoire.',
      'Supervision du contrôleur Mikrotik RouterOS et automatisation du filtrage MAC au 15 de chaque mois.',
      'Surveillance continue de l\'onduleur on-line 2 kVA et des protocoles de protection ESD.',
      'Inventaire des kits de développement (STM32, ESP32, FPGA, oscilloscopes numériques).'
    ],
    prerogatives: 'Attribution des autorisations d\'accès physique et validation des adresses MAC autorisées.'
  },
  {
    id: 'academique',
    level: 3,
    title: 'Responsable Pôle Académique & Tutorat',
    department: 'Syllabi d\'Ingénierie, Ateliers & Certifications',
    name: 'Commission Pédagogique',
    matricule: 'SJP-GIT-TECH-02',
    contact: 'formation.git@saintjerome.cm',
    phone: '+237 653 24 51 05',
    accent: '#7C3AED',
    icon: GraduationCap,
    badgeLight: 'bg-purple-50 text-purple-800 border-purple-200',
    badgeDark: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
    responsibilities: [
      'Organisation des sessions de formation technique certifiantes en micro-électronique et IoT.',
      'Mise en place du programme de parrainage et tutorat solidaire entre promotions GI 1 et GI 5.',
      'Coordination avec le corps professoral de Saint Jérôme Polytechnique pour les ressources de cours.',
      'Animation des revues de code et ateliers pratiques de programmation bare-metal C/C++.'
    ],
    prerogatives: 'Validation des attestations de formation délivrées lors des workshops.'
  },
  {
    id: 'projets',
    level: 3,
    title: 'Responsable Pôle R&D & Projets',
    department: 'Prototypage Industriel, PCB & Projets Phares',
    name: 'Laboratoire R&D',
    matricule: 'SJP-GIT-TECH-03',
    contact: 'projets.git@saintjerome.cm',
    phone: '+237 688 50 04 14',
    accent: '#2563EB',
    icon: Cpu,
    badgeLight: 'bg-blue-50 text-blue-800 border-blue-200',
    badgeDark: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
    responsibilities: [
      'Encadrement technique des projets d\'ingénierie et préparation aux hackathons nationaux.',
      'Assistance à la conception des circuits imprimés (PCB Altium/KiCad) et gravure assistée.',
      'Revue qualité du code source sur le dépôt GitHub de la communauté.',
      'Organisation des démos scientifiques et stands de présentation lors des journées portes ouvertes.'
    ],
    prerogatives: 'Sélection des projets bénéficiant des composants et du matériel du laboratoire.'
  },
  {
    id: 'communication',
    level: 3,
    title: 'Responsable Communication & Médiathèque',
    department: 'Relations Extérieures, Presse & Archives Multimédia',
    name: 'Cellule Communication',
    matricule: 'SJP-GIT-TECH-04',
    contact: 'communication.git@saintjerome.cm',
    phone: '+237 655 43 60 93',
    accent: '#EA580C',
    icon: Sparkles,
    badgeLight: 'bg-orange-50 text-orange-800 border-orange-200',
    badgeDark: 'bg-orange-500/20 text-orange-300 border-orange-400/40',
    responsibilities: [
      'Couverture photo et vidéo de haute définition lors des conférences, soutenances et hackathons.',
      'Alimentation régulière de la médiathèque officielle et des comptes professionnels LinkedIn.',
      'Rédaction de la newsletter mensuelle de veille technologique et des communiqués de presse.',
      'Relations publiques avec les entreprises partenaires et le réseau des anciens élèves (Alumni).'
    ],
    prerogatives: 'Gestion de l\'identité visuelle et modération des publications officielles de la Division.'
  }
];

export default function OrganigrammeSection() {
  const [selectedRole, setSelectedRole] = useState<PyramidalRole | null>(null);
  const [activeLevel, setActiveLevel] = useState<number | 'ALL'>('ALL');
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchMember, setSearchMember] = useState('');
  const [selectedMember, setSelectedMember] = useState<OfficialMember | null>(null);
  const [showMembersBase, setShowMembersBase] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const level1Ref = useRef<HTMLDivElement>(null);
  const level2Ref = useRef<HTMLDivElement>(null);
  const level3Ref = useRef<HTMLDivElement>(null);
  const level4Ref = useRef<HTMLDivElement>(null);

  // Animation progressive au fur et à mesure (Sommet -> Base)
  const runProgressiveAnimation = () => {
    if (!containerRef.current) return;
    setIsPlaying(true);

    const tl = gsap.timeline({
      onComplete: () => setIsPlaying(false)
    });

    // Reset initial states
    tl.set([level1Ref.current, level2Ref.current, level3Ref.current, level4Ref.current], {
      opacity: 0,
      y: 35,
      scale: 0.96
    });

    // 1. Sommet (Présidence)
    tl.to(level1Ref.current, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.7,
      ease: 'power3.out'
    });

    // 2. Étage 2 (Direction Exécutive & Contrôle)
    tl.to(level2Ref.current, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.7,
      ease: 'power3.out'
    }, '-=0.3');

    // 3. Étage 3 (Pôles Techniques)
    tl.to(level3Ref.current, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.7,
      ease: 'power3.out'
    }, '-=0.3');

    // 4. Étage 4 (Base : 99 Membres)
    tl.to(level4Ref.current, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.6,
      ease: 'power3.out'
    }, '-=0.2');
  };

  useEffect(() => {
    // Déclenchement automatique initial fluide
    const timer = setTimeout(() => {
      runProgressiveAnimation();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Filtrage des membres de la base de la pyramide
  const filteredMembers = SJP_OFFICIAL_MEMBERS.filter(m => {
    const q = searchMember.toLowerCase();
    return (
      m.fullName.toLowerCase().includes(q) ||
      m.phone.toLowerCase().includes(q) ||
      m.matricule.toLowerCase().includes(q)
    );
  });

  return (
    <section
      id="organigramme"
      ref={containerRef}
      className="py-24 bg-white dark:bg-[#0D1322] text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 relative overflow-hidden transition-colors duration-200"
    >
      {/* Halo subtil de fond */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-500/5 dark:bg-blue-600/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14 relative z-10">

        {/* ─── EN-TÊTE DE SECTION ─── */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-mono font-bold uppercase tracking-wider shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Gouvernance &amp; Architecture Hiérarchique</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight font-display text-slate-900 dark:text-white">
            Organigramme Pyramidal du Bureau Exécutif
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Structure organisationnelle de la Division Génie Infotronique à <strong>Saint Jérôme Polytechnique</strong>. Conçue selon une chaîne hiérarchique pyramidale stricte reliant le haut commandement, les organes de contrôle, les pôles d&apos;ingénierie et la communauté des <strong>99 élèves-ingénieurs</strong>.
          </p>

          {/* ─── BARRE D'ANIMATION & CONTRÔLES INTERACTIFS ─── */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
            <button
              onClick={runProgressiveAnimation}
              disabled={isPlaying}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold transition shadow-md shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isPlaying ? 'animate-spin' : ''}`} />
              <span>{isPlaying ? 'Animation en cours...' : 'Rejouer l\'animation progressive'}</span>
            </button>

            {/* Filtrage par étage de la pyramide */}
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-xs font-mono">
              {[
                { id: 'ALL', label: 'Toute la Pyramide' },
                { id: 1, label: 'Niv. 1 · Présidence' },
                { id: 2, label: 'Niv. 2 · Direction' },
                { id: 3, label: 'Niv. 3 · Pôles Tech' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveLevel(filter.id as number | 'ALL')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                    activeLevel === filter.id
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            STRUCTURE PYRAMIDALE OFFICIELLE EN 4 ÉTAGES LIÉS
        ═══════════════════════════════════════════════════════════════ */}
        <div className="space-y-10">

          {/* ────────── ÉTAGE 1 : LE SOMMET DE LA PYRAMIDE (PRÉSIDENCE) ────────── */}
          {(activeLevel === 'ALL' || activeLevel === 1) && (
            <div ref={level1Ref} className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest">
                <span className="w-8 h-px bg-blue-300 dark:bg-blue-700" />
                <span>Niveau I — Sommet de la Pyramide</span>
                <span className="w-8 h-px bg-blue-300 dark:bg-blue-700" />
              </div>

              <div className="flex justify-center">
                {PYRAMID_LEVEL_1.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole?.id === role.id;
                  return (
                    <div
                      key={role.id}
                      onClick={() => setSelectedRole(isSelected ? null : role)}
                      className={`w-full max-w-xl cyber-panel p-6 sm:p-7 rounded-3xl border transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-xl relative overflow-hidden ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-500/30'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-[#111827] hover:border-blue-400 dark:hover:border-blue-500/50'
                      }`}
                    >
                      {/* Ligne lumineuse sommet */}
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border group-hover:scale-105 transition-transform shadow-xs"
                            style={{ background: `${role.accent}15`, borderColor: `${role.accent}35` }}
                          >
                            <Icon className="w-7 h-7" style={{ color: role.accent }} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-600 text-white">
                                {role.matricule}
                              </span>
                              <span className="text-[11px] font-mono font-semibold text-blue-600 dark:text-blue-400">
                                Saint Jérôme Polytechnique
                              </span>
                            </div>
                            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-display mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                              {role.title}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                              {role.department}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 text-slate-400 group-hover:text-blue-500 transition">
                          <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isSelected ? 'rotate-180' : ''}`} />
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>{role.responsibilities.length} attributions statutaires</span>
                        </span>
                        <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:underline">
                          {isSelected ? 'Masquer la fiche' : 'Consulter les prérogatives →'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Connecteur vertical descendant (faisceau lumineux) */}
              <div className="flex justify-center py-1">
                <div className="flex flex-col items-center">
                  <div className="w-0.5 h-8 bg-gradient-to-b from-blue-500 to-sky-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-500/20" />
                </div>
              </div>
            </div>
          )}

          {/* ────────── ÉTAGE 2 : DIRECTION EXÉCUTIVE & CONTRÔLE (3 CARTES) ────────── */}
          {(activeLevel === 'ALL' || activeLevel === 2) && (
            <div ref={level2Ref} className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-sky-600 dark:text-sky-400 font-bold uppercase tracking-widest">
                <span className="w-8 h-px bg-sky-300 dark:bg-sky-700" />
                <span>Niveau II — Direction Exécutive &amp; Organes de Contrôle</span>
                <span className="w-8 h-px bg-sky-300 dark:bg-sky-700" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PYRAMID_LEVEL_2.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole?.id === role.id;
                  return (
                    <div
                      key={role.id}
                      onClick={() => setSelectedRole(isSelected ? null : role)}
                      className={`cyber-panel p-6 rounded-2xl border transition-all duration-300 cursor-pointer group shadow-xs hover:shadow-lg flex flex-col justify-between space-y-4 relative overflow-hidden ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-500/30'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#111827] hover:border-sky-400 dark:hover:border-sky-500/40'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${role.badgeLight} dark:${role.badgeDark}`}>
                            {role.matricule}
                          </span>
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border group-hover:scale-105 transition shadow-2xs"
                            style={{ background: `${role.accent}15`, borderColor: `${role.accent}30` }}
                          >
                            <Icon className="w-5 h-5" style={{ color: role.accent }} />
                          </div>
                        </div>

                        <div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white font-display group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                            {role.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                            {role.department}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                        <span>{role.responsibilities.length} missions CDC</span>
                        <ChevronRight className={`w-4 h-4 text-blue-600 dark:text-blue-400 transition-transform ${isSelected ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Connecteur vertical descendant vers les Pôles */}
              <div className="flex justify-center py-1">
                <div className="flex flex-col items-center">
                  <div className="w-0.5 h-8 bg-gradient-to-b from-sky-400 to-indigo-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20" />
                </div>
              </div>
            </div>
          )}

          {/* ────────── ÉTAGE 3 : PÔLES TECHNIQUES & OPÉRATIONNELS (4 CARTES) ────────── */}
          {(activeLevel === 'ALL' || activeLevel === 3) && (
            <div ref={level3Ref} className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest">
                <span className="w-8 h-px bg-indigo-300 dark:bg-indigo-700" />
                <span>Niveau III — Pôles Techniques &amp; Opérationnels</span>
                <span className="w-8 h-px bg-indigo-300 dark:bg-indigo-700" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {PYRAMID_LEVEL_3.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole?.id === role.id;
                  return (
                    <div
                      key={role.id}
                      onClick={() => setSelectedRole(isSelected ? null : role)}
                      className={`cyber-panel p-5 rounded-2xl border transition-all duration-300 cursor-pointer group shadow-2xs hover:shadow-md flex flex-col justify-between space-y-3 relative overflow-hidden ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-500/30'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#111827] hover:border-indigo-400 dark:hover:border-indigo-500/40'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${role.badgeLight} dark:${role.badgeDark}`}>
                            {role.matricule}
                          </span>
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border group-hover:scale-105 transition"
                            style={{ background: `${role.accent}15`, borderColor: `${role.accent}30` }}
                          >
                            <Icon className="w-4 h-4" style={{ color: role.accent }} />
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display group-hover:text-blue-600 dark:group-hover:text-blue-400 transition leading-snug">
                            {role.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 leading-relaxed">
                            {role.department}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        <span>{role.responsibilities.length} attributions</span>
                        <ChevronRight className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 transition-transform ${isSelected ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ────────── DÉTAIL D'UN POSTE SÉLECTIONNÉ ────────── */}
          {selectedRole && (
            <div className="cyber-panel p-6 sm:p-8 bg-white dark:bg-[#111827] border-2 border-blue-500/50 rounded-3xl shadow-2xl space-y-6 anim-scale-up">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-wider bg-blue-600 text-white">
                      {selectedRole.matricule}
                    </span>
                    <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-bold uppercase">
                      Fiche de Poste Officielle · GIT-CDC-2026
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white font-display">
                    {selectedRole.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {selectedRole.department} · Saint Jérôme Polytechnique
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {selectedRole.contact && (
                    <a
                      href={`mailto:${selectedRole.contact}`}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
                    >
                      <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>{selectedRole.contact}</span>
                    </a>
                  )}
                  {selectedRole.phone && (
                    <a
                      href={`tel:${selectedRole.phone}`}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 text-xs font-mono font-bold border border-blue-200 dark:border-blue-500/30 transition"
                    >
                      <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>{selectedRole.phone}</span>
                    </a>
                  )}
                  <button
                    onClick={() => setSelectedRole(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Fermer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Responsabilités & Prérogatives */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Attributions Réglementaires &amp; Missions Directes :</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedRole.responsibilities.map((resp, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-200 flex items-start gap-2.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{resp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-4 p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-700 dark:text-blue-300 uppercase">
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Pouvoirs &amp; Prérogatives CDC</span>
                  </div>
                  <p className="text-xs font-mono text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedRole.prerogatives}
                  </p>
                  <div className="pt-2 text-[10px] font-mono text-slate-500 dark:text-slate-400 border-t border-blue-200/60 dark:border-blue-500/20">
                    Statut validé par la Division Génie Infotronique · SJP
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ────────── ÉTAGE 4 : LA BASE DE LA PYRAMIDE (99 MEMBRES OFFICIELS DÉDOUBLONNÉS) ────────── */}
          <div ref={level4Ref} className="space-y-6 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                  <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Base de la Pyramide · {SJP_OFFICIAL_MEMBERS.length} Membres Vérifiés</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display">
                  Communauté des Élèves-Ingénieurs de la Division (GI 1 à GI 5)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Base officielle constituée des 99 étudiants inscrits de Saint Jérôme Polytechnique, débarrassée de tout doublon.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowMembersBase(!showMembersBase)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold transition shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{showMembersBase ? 'Masquer l\'annuaire' : 'Déplier l\'annuaire des 99 membres'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showMembersBase ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* Annuaire interactif dépliable des 99 membres */}
            {showMembersBase && (
              <div className="space-y-6 p-6 rounded-3xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 shadow-xl anim-fade-in">
                {/* Barre de recherche instantanée */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="relative w-full sm:max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Rechercher par nom, téléphone (ex: 677...) ou matricule..."
                      value={searchMember}
                      onChange={(e) => setSearchMember(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-mono bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-400"
                    />
                  </div>

                  <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    <strong className="text-blue-600 dark:text-blue-400">{filteredMembers.length}</strong> membres affichés sur 99
                  </div>
                </div>

                {/* Grille des membres */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredMembers.map((member, idx) => {
                    const isSelected = selectedMember?.id === member.id;
                    return (
                      <div
                        key={member.id}
                        onClick={() => setSelectedMember(isSelected ? null : member)}
                        className={`p-4 rounded-xl border text-xs font-mono transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-2 ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 shadow-sm'
                            : 'bg-slate-50/80 dark:bg-[#111827] border-slate-200 dark:border-slate-800 hover:border-blue-400/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 block mb-0.5">
                              {member.matricule}
                            </span>
                            <h5 className="font-bold text-slate-900 dark:text-white font-display text-xs leading-snug">
                              {member.fullName}
                            </h5>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                            #{idx + 1}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1.5 truncate">
                            <Phone className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>{member.phone}</span>
                          </span>
                          <span className="text-blue-600 dark:text-blue-400 font-semibold text-[10px]">
                            {isSelected ? 'Détail ▲' : 'Voir ▼'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Détail du membre sélectionné */}
                {selectedMember && (
                  <div className="p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-600 text-white">
                          {selectedMember.matricule}
                        </span>
                        <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-300">
                          {selectedMember.promo} · Saint Jérôme Polytechnique
                        </span>
                      </div>
                      <h4 className="text-base font-black text-slate-900 dark:text-white font-display">
                        {selectedMember.fullName}
                      </h4>
                      <p className="text-xs font-mono text-slate-600 dark:text-slate-300 flex items-center gap-4 flex-wrap">
                        <span>📞 {selectedMember.phone}</span>
                        <span>✉️ {selectedMember.email}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${selectedMember.phone}`}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold transition shadow-xs"
                      >
                        Appeler
                      </a>
                      <button
                        onClick={() => setSelectedMember(null)}
                        className="px-3 py-2 rounded-xl text-xs font-mono text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
                      >
                        Fermer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
