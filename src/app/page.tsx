'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Cpu, ShieldCheck, Wifi, QrCode, ExternalLink,
  ChevronRight, Zap, Server, Lock, Sparkles,
  ArrowRight, GraduationCap, Terminal, CheckCircle2,
  Code2, CircuitBoard, Network, Gauge, Layers,
  Microscope, Radio, Rocket, Star, Calendar, Users, Camera,
  Activity, Binary, ShieldAlert, Menu, X
} from 'lucide-react';

import HeroGsap from '@/components/public/HeroGsap';
import EventsSection from '@/components/public/EventsSection';
import ShowcaseSection from '@/components/public/ShowcaseSection';
import AcademicSection from '@/components/public/AcademicSection';
import OrganigrammeSection from '@/components/public/OrganigrammeSection';
import MediathequeSection from '@/components/public/MediathequeSection';
import NewsletterSection from '@/components/public/NewsletterSection';
import MobileBottomBar from '@/components/public/MobileBottomBar';
import ThemeToggle from '@/components/ThemeToggle';

import {
  INITIAL_PROJECTS,
  INITIAL_EVENTS,
  INITIAL_COURSES,
  INITIAL_USERS
} from '@/lib/store';
import { Event, Course, User } from '@/lib/types';

/* ─── LinkedIn Icon ─── */
function LinkedInIcon({ className = 'w-4 h-4', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.53 1.53 0 1 0 0-3.05 1.53 1.53 0 0 0 0 3.05m1.39 9.74v-8.37H5.07v8.37h2.78z" />
    </svg>
  );
}

/* ─── Animated counter ─── */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / 35;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 30);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count}{suffix}</span>;
}

/* ─── Skills data ─── */
const GIT_SKILLS = [
  {
    cat: 'Logiciel & Architecture Fullstack',
    icon: Code2,
    color: '#2563EB',
    tags: ['Next.js 16', 'TypeScript', 'React 19', 'Node.js', 'PostgreSQL', 'Prisma ORM', 'REST API', 'JWT Crypté', 'Zod']
  },
  {
    cat: 'Systèmes Embarqués & Micro-Électronique',
    icon: CircuitBoard,
    color: '#D97706',
    tags: ['ARM Cortex-M7', 'STM32', 'ESP32-S3', 'FPGA (Verilog)', 'C/C++ Bare-Metal', 'FreeRTOS', 'SPI / I²C / UART', 'PCB Altium 4 Couches']
  },
  {
    cat: 'Réseaux Industriels & Télécoms IoT',
    icon: Network,
    color: '#0284C7',
    tags: ['Wi-Fi 6 (802.11ax)', 'LoRaWAN 868MHz', 'BLE 5.3', 'VLANs Sécurisés', 'WPA3 Enterprise', 'Cat 6A S/FTP', 'Filtrage MAC Mikrotik']
  },
  {
    cat: 'Automatique & Systèmes Cyber-Physiques',
    icon: Gauge,
    color: '#059669',
    tags: ['PID & Asservissement', 'SCADA Industriel', 'Modbus TCP', 'OPC-UA', 'Capteurs LiDAR & IMU', 'MATLAB & Simulink']
  },
];

/* ─── Stats ─── */
const STATS = [
  { value: 5,   suffix: '',      label: "Promotions d'Ingénieurs", sub: 'Promos GI 1 à GI 5', icon: GraduationCap },
  { value: 100, suffix: '%',     label: 'Numérisation PWA', sub: 'Badges QR dynamiques tournants', icon: QrCode },
  { value: 1,   suffix: ' Gbps', label: 'Desserte Réseau Labo', sub: 'Baie Cat 6A & Wi-Fi 6 MIMO', icon: Network },
  { value: 2,   suffix: ' kVA',  label: 'Continuité Électrique', sub: 'Onduleur On-Line pur sinus', icon: Zap },
];

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });

    // 1. Chargement instantané depuis le cache local s'il existe
    try {
      const storedEvts = localStorage.getItem('git_events_v2');
      if (storedEvts) {
        const parsed = JSON.parse(storedEvts);
        if (Array.isArray(parsed) && parsed.length > 0) setEvents(parsed);
      }

      const storedCourses = localStorage.getItem('git_courses_v2');
      if (storedCourses) {
        const parsed = JSON.parse(storedCourses);
        if (Array.isArray(parsed) && parsed.length > 0) setCourses(parsed);
      }

      const storedUsers = localStorage.getItem('git_community_users_v5_sjp');
      if (storedUsers) {
        const parsed = JSON.parse(storedUsers);
        if (Array.isArray(parsed) && parsed.length > 0) setUsers(parsed);
      }
    } catch (e) {
      console.warn('Erreur lecture cache local vitrine:', e);
    }

    // 2. Synchronisation en direct avec la base MySQL Prisma
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.events) && data.events.length > 0) {
          setEvents(data.events);
          localStorage.setItem('git_events_v2', JSON.stringify(data.events));
        }
      })
      .catch(() => {});

    fetch('/api/courses')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.courses) && data.courses.length > 0) {
          setCourses(data.courses);
          localStorage.setItem('git_courses_v2', JSON.stringify(data.courses));
        }
      })
      .catch(() => {});

    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.users) && data.users.length > 0) {
          setUsers(data.users);
        }
      })
      .catch(() => {});

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 transition-colors duration-200 pb-20 md:pb-0">

      {/* ══════════════════ ACCENT TOP LASER BAR ══════════════════ */}
      <div className="accent-bar" />

      {/* ══════════════════ NAVBAR POLYTECHNIQUE ══════════════════ */}
      <header className={`navbar ${scrolled ? 'shadow-md border-b border-slate-200 dark:border-slate-800' : 'border-b border-slate-200/80 dark:border-slate-800/60'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4 py-3">

          {/* Logo officiel */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-105">
              <Image src="/logo.jpg" alt="Logo GIT" width={44} height={44} className="object-contain" priority />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight font-display text-slate-900 dark:text-white">GIT</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                  OFFICIEL
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400 hidden sm:block">
                Division Génie Infotronique · Saint Jérôme Polytechnique
              </p>
            </div>
          </Link>

          {/* Navigation thématique conforme au CDC */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-mono font-semibold text-slate-600 dark:text-slate-300">
            {[
              ['#events', 'Événements'],
              ['#projects', 'Projets R&D'],
              ['#academic', 'Pôle Académique'],
              ['#organigramme', 'Organigramme'],
              ['#mediatheque', 'Médiathèque'],
              ['#skills', 'Technologies'],
              ['#labo', 'Laboratoire'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-150"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* CTAs Navbar + Theme Toggle */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
            >
              <LinkedInIcon className="w-3.5 h-3.5 text-[#0A66C2]" />
              <span className="hidden xl:inline">LinkedIn</span>
            </a>

            <Link href="/login" className="btn-nasa flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-mono">
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Portail Membres</span>
              <span className="sm:hidden">Connexion</span>
            </Link>

            {/* Hamburger Button Mobile */}
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

        {/* Menu Déroulant Mobile Plein Écran pour la Landing Page */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/98 dark:bg-[#0B0F19]/98 backdrop-blur-2xl px-4 py-4 space-y-3 animate-fadeIn">
            <div className="grid grid-cols-2 gap-2 text-xs font-mono font-semibold">
              {[
                ['#events', '🗓️ Événements'],
                ['#projects', '🚀 Projets R&D'],
                ['#academic', '🎓 Pôle Académique'],
                ['#organigramme', '🏛️ Organigramme'],
                ['#mediatheque', '📚 Médiathèque'],
                ['#skills', '⚡ Technologies'],
                ['#labo', '🔬 Laboratoire'],
                ['/login', '🔒 Espace Membre'],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 active:scale-98 transition flex items-center gap-1.5"
                >
                  <span>{label}</span>
                </a>
              ))}
            </div>
            <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500">
              <span>Division GIT · Douala</span>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold"
              >
                <LinkedInIcon className="w-3.5 h-3.5" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ══════════════════ 1. HERO — DUAL THEME GSAP ══════════════════ */}
      <HeroGsap />

      {/* ══════════════════ 2. TELEMETRY STREAM RIBBON ══════════════════ */}
      <section className="bg-white dark:bg-[#0D1322] border-b border-slate-200 dark:border-slate-800/80 relative z-20 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ value, suffix, label, sub, icon: Icon }) => (
              <div key={label} className="cyber-panel p-6 bg-slate-50/80 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-center hover:border-blue-400/50 transition">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="telemetry-value text-3xl font-black font-display text-blue-600 dark:text-blue-400">
                  <AnimatedCounter target={value} suffix={suffix} />
                </div>
                <p className="text-xs font-bold mt-2 text-slate-900 dark:text-white font-mono">{label}</p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 block">{sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 3. ACCUEIL & ÉVÉNEMENTS (CDC 2) ══════════════════ */}
      <EventsSection events={events} />

      {/* ══════════════════ 4. SHOWCASE PROJETS (CDC 2) ══════════════════ */}
      <ShowcaseSection projects={INITIAL_PROJECTS} />

      {/* ══════════════════ 5. PÔLE ACADÉMIQUE & FORMATIONS (CDC 2) ══════════════════ */}
      <AcademicSection courses={courses} users={users} />

      {/* ══════════════════ 6. ORGANIGRAMME INTERACTIF (CDC 2) ══════════════════ */}
      <OrganigrammeSection />

      {/* ══════════════════ 7. MÉDIATHÈQUE PAR ÉVÉNEMENT (CDC 2) ══════════════════ */}
      <MediathequeSection />

      {/* ══════════════════ 8. COMPÉTENCES TECHNIQUES GIT ══════════════════ */}
      <section id="skills" className="py-24 bg-white dark:bg-[#0D1322] border-b border-slate-200 dark:border-slate-800/80 relative overflow-hidden transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-mono font-bold uppercase tracking-wider">
              <Microscope className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Stack Scientifique &amp; Ingénierie de Pointe</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-display">
              L&apos;Écosystème Technologique de la Division
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Une maîtrise transversale intégrée : des registres matériels bare-metal aux architectures cloud scalables chiffrées.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {GIT_SKILLS.map(({ cat, icon: Icon, color, tags }) => (
              <div
                key={cat}
                className="cyber-panel p-7 space-y-5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-blue-400/50 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border group-hover:scale-105 transition"
                    style={{ background: `${color}14`, borderColor: `${color}30` }}
                  >
                    <Icon className="w-6 h-6" style={{ color }} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white font-display group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      {cat}
                    </h3>
                    <div className="h-1 w-10 rounded-full mt-1.5" style={{ background: color }} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1 rounded-full font-mono font-semibold border bg-white dark:bg-black/30 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700/60 shadow-2xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ 9. LABORATOIRE RÉHABILITÉ (CDC 1 & 5) ══════════════════ */}
      <section id="labo" className="py-24 bg-slate-50 dark:bg-[#0B0F19] border-b border-slate-200 dark:border-slate-800/80 relative overflow-hidden transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
                <Server className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Station Expérimentale &amp; Réseau Labo</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-display">
                Le Laboratoire Réhabilité aux Normes Industrielles
              </h2>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Conforme aux spécifications du cahier des charges <strong>GIT-CDC-2026-001</strong>, le laboratoire offre un environnement de haute précision pour le développement de prototypes et l&apos;expérimentation en conditions réelles.
              </p>
              <div className="space-y-3">
                {[
                  { icon: ShieldCheck, title: 'Guichet d\'Accueil & Paillasses ESD', desc: 'Poste de contrôle du Censeur avec terminal PWA et goulottes électriques sécurisées.', color: '#2563EB' },
                  { icon: Wifi,        title: 'Baie Cat 6A & Borne Wi-Fi 6',        desc: 'Switch Gigabit administrable avec VLANs et filtrage MAC dynamique synchronisé.', color: '#0284C7' },
                  { icon: Zap,         title: 'Onduleur On-Line Dédié 2 kVA',       desc: 'Alimentation continue sans micro-coupure pour serveurs et bancs d\'essai.', color: '#D97706' },
                  { icon: Radio,       title: 'Terminaux Portables & Scanner HD',   desc: 'Vérification instantanée des badges QR numériques en moins de 1 seconde.', color: '#059669' },
                ].map(({ icon: Icon, title, desc, color }) => (
                  <div key={title} className="flex items-start gap-3.5 p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-blue-400/50 transition">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}14`, border: `1px solid ${color}30` }}>
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">{title}</h4>
                      <p className="text-xs mt-0.5 text-slate-500 dark:text-slate-400">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="cyber-panel p-8 space-y-6 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Spécifications Réseau &amp; Énergie
                  </span>
                  <span className="text-xs font-mono px-3 py-1 rounded-full font-bold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                    Norme CDC Validée
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Réseau Filaire', value: 'Catégorie 6A (S/FTP)', sub: '10 Gbps ready', color: '#2563EB' },
                    { label: 'Sans-Fil', value: 'Wi-Fi 6 (802.11ax)', sub: 'Haute densité MIMO', color: '#0284C7' },
                    { label: 'Protection', value: 'Anti-poussière ESD', sub: 'Sécurité CMOS/FPGA', color: '#D97706' },
                    { label: 'Contrôleur', value: 'Mikrotik RouterOS', sub: 'Purge du 15 automatisée', color: '#059669' },
                  ].map(({ label, value, sub, color }) => (
                    <div key={label} className="p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono block">{label}</span>
                      <strong className="text-sm block mt-0.5 text-slate-900 dark:text-white font-display">{value}</strong>
                      <p className="text-[10px] font-mono mt-1 font-bold" style={{ color }}>{sub}</p>
                    </div>
                  ))}
                </div>
                <Link href="/login" className="btn-nasa w-full flex items-center justify-center gap-2 py-3.5 text-xs font-mono font-bold shadow-md cursor-pointer">
                  <span>Accéder au Poste de Contrôle Labo</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ 10. NEWSLETTER & COMMUNICATION (CDC 2) ══════════════════ */}
      <NewsletterSection />

      {/* ══════════════════ 11. FOOTER INSTITUTIONNEL ══════════════════ */}
      <footer className="bg-slate-100 dark:bg-[#060A12] border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 shadow-2xs">
                  <Image src="/logo.jpg" alt="Logo GIT" width={40} height={40} className="object-contain" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white font-display">Division Génie Infotronique (GIT)</h4>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-mono font-semibold">Saint Jérôme Polytechnique · Douala</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed max-w-md text-slate-600 dark:text-slate-400">
                Plateforme officielle de gestion des membres, suivi des cotisations par QR code dynamique sécurisé, filtrage réseau Wi-Fi 6 et exploitation du laboratoire de recherche.
              </p>
              <div className="flex gap-2 flex-wrap pt-1 font-mono">
                {['Next.js 16', 'TypeScript', 'Prisma ORM', 'PWA Offline', 'Lenis Smooth'].map(t => (
                  <span key={t} className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="md:col-span-3 space-y-3 font-mono">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Espaces Métiers</h5>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                {[
                  ['Portail Membres & Carte QR', '/espace-membre'],
                  ['Poste Censeur (Contrôle)', '/censeur'],
                  ['Espace Trésorerie (Export PDF)', '/tresorier'],
                  ['Bureau Administrateur (RBAC)', '/admin'],
                  ['Responsable Labo & Bot Wi-Fi', '/labo'],
                ].map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-3 space-y-3 font-mono">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Spécifications Officielles</h5>
              <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                Référence CDC : <strong className="text-blue-600 dark:text-blue-400">GIT-CDC-2026-001</strong><br />
                Architecture : <strong className="text-blue-600 dark:text-blue-400">GIT-DAT-2026-001</strong><br />
                PWA Standalone · Mode Hors-ligne<br />
                RBAC 5 Rôles · QR Tournant Sécurisé<br />
                Filtrage MAC Mikrotik · Bot Wi-Fi 15e
              </p>
            </div>
          </div>

          <div className="pt-8 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono border-t border-slate-200 dark:border-slate-800 text-slate-500">
            <p>© 2026 Division Génie Infotronique (GIT) · Saint Jérôme Polytechnique. Tous droits réservés.</p>
            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
              <Link href="/login" className="hover:text-blue-600 dark:hover:text-blue-400">Connexion</Link>
              <span>·</span>
              <a href="#events" className="hover:text-blue-600 dark:hover:text-blue-400">Événements</a>
              <span>·</span>
              <a href="#projects" className="hover:text-blue-600 dark:hover:text-blue-400">Projets</a>
              <span>·</span>
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Barre de navigation tactile PWA Mobile */}
      <MobileBottomBar />
    </div>
  );
}
