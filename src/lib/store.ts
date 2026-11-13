export * from './types';
import { User, Payment, Project, Course, Event, Broadcast, Penalty, AccessLog, Decaissement, AuditLogItem, COTISATION_AMOUNT_BUREAU, CURRENT_YEAR } from './types';
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
  cotisations: [9, 10, 11, 12, 1, 2, 3, 4, 5, 6].map((mois) => ({
    id: `cot_usr_admin_${mois}`,
    mois,
    annee: CURRENT_YEAR,
    montant: COTISATION_AMOUNT_BUREAU,
    isPaid: false,
    userId: 'usr_admin',
  })),
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

export const INITIAL_BROADCASTS: Broadcast[] = [];

export const INITIAL_ACCESS_LOGS: AccessLog[] = [];

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

export const INITIAL_DECAISSEMENTS: Decaissement[] = [];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [];

const DECAISSEMENTS_STORAGE_KEY = 'git_decaissements_v2';
const AUDIT_LOGS_STORAGE_KEY = 'git_audit_logs_v2';

export function loadDecaissements(): Decaissement[] {
  if (typeof window === 'undefined') return INITIAL_DECAISSEMENTS;
  try {
    const stored = localStorage.getItem(DECAISSEMENTS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_DECAISSEMENTS;
}

export function saveDecaissements(items: Decaissement[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DECAISSEMENTS_STORAGE_KEY, JSON.stringify(items));
}

export function loadAuditLogs(): AuditLogItem[] {
  if (typeof window === 'undefined') return INITIAL_AUDIT_LOGS;
  try {
    const stored = localStorage.getItem(AUDIT_LOGS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_AUDIT_LOGS;
}

export function saveAuditLogs(logs: AuditLogItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(logs));
}

export function logAdminAction(params: Omit<AuditLogItem, 'id' | 'timestamp'>) {
  if (typeof window === 'undefined') return;
  const currentLogs = loadAuditLogs();
  const newItem: AuditLogItem = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...params,
  };
  const updated = [newItem, ...currentLogs];
  saveAuditLogs(updated);

  // Synchronisation centralisée côté serveur
  fetch('/api/audit-logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newItem),
  }).catch(() => {});
}
