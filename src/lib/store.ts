export * from './types';
import { User, Payment, Project, Course, Event, Penalty, AccessLog } from './types';
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

export const INITIAL_PROJECTS: Project[] = [];

export const INITIAL_COURSES: Course[] = [];

export const INITIAL_EVENTS: Event[] = [];

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
