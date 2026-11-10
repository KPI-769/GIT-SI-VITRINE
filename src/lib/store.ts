export * from './types';
import { User, Payment, Project, Course, Event, Broadcast, Penalty, AccessLog } from './types';
import { generateOfficialUsers, generateBureauUsers } from './members-data';

export const ADMIN_USER: User = {
  id: 'usr_admin',
  matricule: 'GIT-ADMIN',
  nom: 'BUREAU',
  prenom: 'Admin',
  email: 'admin.git@saintjerome.cm',
  phone: '677 00 00 00',
  niveau: 'GI_Bureau',
  role: 'ADMIN',
  poste: 'Administration Centrale GIT',
  isActive: true,
  mustChangePassword: false,
  password: 'git2026',
  qrCodeToken: 'token_admin_sjp_001',
  isWifiAllowed: true,
  isLabAllowed: true,
  macAddresses: [],
  cotisations: [],
  penalties: [],
  certifications: [],
  passwordResetRequested: false
};

export const INITIAL_USERS: User[] = [
  ADMIN_USER,
  ...generateBureauUsers(),
  ...generateOfficialUsers()
];

export const INITIAL_PAYMENTS: Payment[] = [];

export const INITIAL_PENALTIES: Penalty[] = [];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-01',
    title: 'Station Météo & Télémétrie Industrielle IoT',
    slug: 'station-meteo-telemetrie-iot',
    description: 'Système autonome de mesure environnementale (température, humidité, qualité de l\'air) avec transmission LoRaWAN longue portée et dashboard temps réel.',
    category: 'Réseaux & IoT',
    githubUrl: 'https://github.com/git-community/station-iot-lorawan',
    linkedinUrl: 'https://www.linkedin.com/company/git-sjd',
    tiktokUrl: 'https://www.tiktok.com/@git_sjd',
    demoUrl: 'https://iot.git-sjp.cm',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    featured: true,
    technologies: ['ESP32', 'LoRaWAN', 'FreeRTOS', 'MQTT', 'Next.js', 'Grafana'],
    membersCount: 4,
    contributors: [
      { id: 'c1', projectId: 'proj-01', userId: 'git-007', roleInProject: 'Lead Firmware ESP32', name: 'MBIAKOP Junior' },
      { id: 'c2', projectId: 'proj-01', userId: 'git-013', roleInProject: 'Architecture LoRaWAN', name: 'MPOPO Antoinne' },
      { id: 'c3', projectId: 'proj-01', userId: 'git-006', roleInProject: 'Intégration Passerelle', name: 'EKANGO Paul' },
      { id: 'c4', projectId: 'proj-01', userId: 'git-001', roleInProject: 'Supervision & Déploiement', name: 'KPWANDA Yvan' }
    ]
  },
  {
    id: 'proj-02',
    title: 'Contrôleur d\'Accès Dynamique & Passerelle RouterOS',
    slug: 'controleur-acces-routeros',
    description: 'Infrastructure de sécurité physique et réseau couplant des badges QR tournants chiffrés à un filtrage d\'adresses MAC automatique sur switch Mikrotik.',
    category: 'Systèmes Embarqués',
    githubUrl: 'https://github.com/git-community/mikrotik-gatekeeper',
    demoUrl: 'https://access.git-sjp.cm',
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    featured: true,
    technologies: ['MikroTik API', 'TypeScript', 'Cryptography', 'Next.js PWA', 'Docker'],
    membersCount: 3,
    contributors: [
      { id: 'c5', projectId: 'proj-02', userId: 'git-006', roleInProject: 'Ingénieur Réseau Mikrotik', name: 'EKANGO Paul' },
      { id: 'c6', projectId: 'proj-02', userId: 'git-002', roleInProject: 'Cryptographie & QR Engine', name: 'ABDALLAH Wahab' },
      { id: 'c7', projectId: 'proj-02', userId: 'git-001', roleInProject: 'Coordination Technique', name: 'KPWANDA Yvan' }
    ]
  },
  {
    id: 'proj-03',
    title: 'Banc d\'Essai Asservissement & Modbus SCADA',
    slug: 'banc-essai-scada-modbus',
    description: 'Banc d\'évaluation pour régulateurs PID industriels avec bus RS-485 / Modbus TCP, acquisition de données haute cadence et interface IHM tactile.',
    category: 'Automatique & Robotique',
    githubUrl: 'https://github.com/git-community/scada-pid-modbus',
    coverImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    featured: false,
    technologies: ['STM32F4', 'Modbus TCP', 'RS-485', 'Python Qt', 'Matlab Simulink'],
    membersCount: 2,
    contributors: [
      { id: 'c8', projectId: 'proj-03', userId: 'git-007', roleInProject: 'Automatique & PID', name: 'MBIAKOP Junior' },
      { id: 'c9', projectId: 'proj-03', userId: 'git-012', roleInProject: 'Électronique de puissance', name: 'FOTSO Jean' }
    ]
  },
  {
    id: 'proj-04',
    title: 'Plateforme PWA & Système de Gestion de la Division',
    slug: 'plateforme-pwa-division-git',
    description: 'Application PWA complète pour le suivi des cotisations, les cartes de membres hors-ligne, la médiathèque multimédia et la gestion des sanctions.',
    category: 'Logiciel & Fullstack',
    githubUrl: 'https://github.com/git-community/git-platform',
    demoUrl: 'https://git-community.cm',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    featured: true,
    technologies: ['Next.js 16', 'React 19', 'Tailwind CSS', 'Prisma ORM', 'PWA ServiceWorker', 'MySQL'],
    membersCount: 4,
    contributors: [
      { id: 'c10', projectId: 'proj-04', userId: 'git-001', roleInProject: 'Chef de Projet & Dev', name: 'KPWANDA Yvan' },
      { id: 'c11', projectId: 'proj-04', userId: 'git-003', roleInProject: 'Administration & Qualité', name: 'MAWADJOU Danielle' },
      { id: 'c12', projectId: 'proj-04', userId: 'git-017', roleInProject: 'Direction Artistique & Médias', name: 'KOUOH ETEKI Freddy' },
      { id: 'c13', projectId: 'proj-04', userId: 'git-004', roleInProject: 'Comptabilité & Trésorerie', name: 'LEKEUFACK Anne' }
    ]
  }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-01',
    title: 'Microcontrôleurs STM32 & FreeRTOS Temps Réel',
    description: 'Architecture ARM Cortex-M, ordonnancement multitâche, sémaphores, files de messages et drivers de périphériques.',
    status: 'IN_PROGRESS',
    instructor: 'MBIAKOP Junior',
    hoursCount: 24,
    startDate: '2026-10-15',
    level: 'GI_3+'
  },
  {
    id: 'course-02',
    title: 'Conception de Cartes Électroniques & Routage PCB Altium',
    description: 'Schématique avancée, contraintes CEM, routage 4 couches pour signaux rapides et génération des fichiers de fabrication Gerber.',
    status: 'PLANNED',
    instructor: 'MPOPO Antoinne',
    hoursCount: 20,
    startDate: '2026-11-25',
    level: 'Tous Niveaux'
  },
  {
    id: 'course-03',
    title: 'Fondamentaux C/C++ & Bonnes Pratiques MISRA pour l\'Embarqué',
    description: 'Gestion mémoire, pointeurs, structures de données bas niveau, compilation croisée et conformité industrielle.',
    status: 'COMPLETED',
    instructor: 'KPWANDA Yvan',
    hoursCount: 18,
    startDate: '2026-09-01',
    level: 'GI_1 & GI_2'
  }
];

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'evt-01',
    title: 'Hackathon Infotronique & Challenge IoT 2026',
    description: 'Compétition inter-promotions de 48h non-stop : prototypage matériel, firmware et supervision web temps réel.',
    startDate: '2026-11-22T08:00:00',
    endDate: '2026-11-24T18:00:00',
    location: 'Campus Saint Jérôme, Hall Technologique',
    status: 'UPCOMING',
    registeredCount: 14,
    registrations: []
  },
  {
    id: 'evt-02',
    title: 'Atelier Portes Ouvertes Laboratoire & Mesures RF',
    description: 'Démonstrations d\'analyse spectrale, bancs de tests télécoms et manipulation des oscilloscopes 4 voies.',
    startDate: '2026-11-12T10:00:00',
    endDate: '2026-11-12T16:00:00',
    location: 'Laboratoire SJP - Salle C102',
    status: 'ONGOING',
    registeredCount: 8,
    registrations: []
  },
  {
    id: 'evt-03',
    title: 'Séminaire Cybersécurité des Réseaux Industriels SCADA',
    description: 'Présentation des protocoles Modbus sécurisés, détection d\'intrusions réseau et isolation matérielle.',
    startDate: '2026-10-05T14:00:00',
    endDate: '2026-10-05T17:30:00',
    location: 'Amphithéâtre A',
    status: 'COMPLETED',
    registeredCount: 32,
    registrations: []
  }
];

export const INITIAL_BROADCASTS: Broadcast[] = [
  {
    id: 'bc-01',
    title: 'Live Talk : Les Défis de l\'Ingénierie Embarquée au Cameroun',
    description: 'Table ronde interactive avec les ingénieurs et anciens de la division GIT sur les opportunités IoT et firmware.',
    scheduledAt: '2026-11-20T17:00:00',
    platform: 'YouTube',
    streamUrl: 'https://youtube.com/live/git-talk-01',
    status: 'UPCOMING',
    registrations: [],
    createdAt: '2026-11-01T10:00:00',
  },
  {
    id: 'bc-02',
    title: 'Démos Flash TikTok & Q&A Projets Étudiants',
    description: 'Présentation de 5 projets R&D en direct avec séance de questions-réponses pour les étudiants.',
    scheduledAt: '2026-11-28T18:30:00',
    platform: 'TikTok',
    streamUrl: 'https://tiktok.com/@git_sjd/live',
    status: 'UPCOMING',
    registrations: [],
    createdAt: '2026-11-05T12:00:00',
  }
];

export const INITIAL_ACCESS_LOGS: AccessLog[] = [];

export const DEFAULT_COTISATION_AMOUNT = 2000; // 2 000 FCFA
export const CURRENT_MONTH = new Date().getMonth() + 1;
export const CURRENT_YEAR = new Date().getFullYear();

export function playSuccessTone() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch {}
}

export function playErrorTone() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.setValueAtTime(180, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
}
