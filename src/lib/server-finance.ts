import fs from 'fs';
import path from 'path';
import { Payment, Decaissement, AuditLogItem } from '@/lib/types';

const DATA_DIR = path.join(process.cwd(), '.data');
const FINANCE_FILE = path.join(DATA_DIR, 'finance_centralized.json');

interface CentralizedFinanceData {
  payments: Payment[];
  decaissements: Decaissement[];
  auditLogs: AuditLogItem[];
  updatedAt: string;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {}
  }
}

export function readServerFinance(): CentralizedFinanceData {
  ensureDataDir();
  if (!fs.existsSync(FINANCE_FILE)) {
    const initial: CentralizedFinanceData = {
      payments: [],
      decaissements: [],
      auditLogs: [],
      updatedAt: new Date().toISOString(),
    };
    try {
      fs.writeFileSync(FINANCE_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    } catch {}
    return initial;
  }

  try {
    const raw = fs.readFileSync(FINANCE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      payments: Array.isArray(parsed.payments) ? parsed.payments : [],
      decaissements: Array.isArray(parsed.decaissements) ? parsed.decaissements : [],
      auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : [],
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch (e) {
    console.error('Erreur lecture finance_centralized.json:', e);
    return {
      payments: [],
      decaissements: [],
      auditLogs: [],
      updatedAt: new Date().toISOString(),
    };
  }
}

export function writeServerFinance(data: Partial<CentralizedFinanceData>): CentralizedFinanceData {
  ensureDataDir();
  const current = readServerFinance();
  const updated: CentralizedFinanceData = {
    payments: data.payments !== undefined ? data.payments : current.payments,
    decaissements: data.decaissements !== undefined ? data.decaissements : current.decaissements,
    auditLogs: data.auditLogs !== undefined ? data.auditLogs : current.auditLogs,
    updatedAt: new Date().toISOString(),
  };

  try {
    fs.writeFileSync(FINANCE_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (e) {
    console.error('Erreur écriture finance_centralized.json:', e);
  }

  return updated;
}

