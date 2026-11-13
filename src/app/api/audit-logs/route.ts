import { NextResponse } from 'next/server';
import { readServerFinance, writeServerFinance } from '@/lib/server-finance';
import { AuditLogItem } from '@/lib/types';

// GET /api/audit-logs - Liste toutes les actions d'audit centralisées
export async function GET() {
  const finance = readServerFinance();
  return NextResponse.json({
    success: true,
    auditLogs: finance.auditLogs,
    count: finance.auditLogs.length,
  });
}

// POST /api/audit-logs - Enregistre une action d'audit centralisée
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      action,
      actorId,
      actorName,
      actorRole,
      targetId,
      targetName,
      targetMatricule,
      amount,
      details,
    } = body;

    const newLog: AuditLogItem = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      action: action || 'ACTION_GENERALE',
      actorId: String(actorId || 'system'),
      actorName: String(actorName || 'Système'),
      actorRole: String(actorRole || 'ADMIN'),
      targetId: targetId ? String(targetId) : undefined,
      targetName: targetName ? String(targetName) : undefined,
      targetMatricule: targetMatricule ? String(targetMatricule) : undefined,
      amount: amount !== undefined ? Number(amount) : undefined,
      details: String(details || ''),
      timestamp: new Date().toISOString(),
    };

    const finance = readServerFinance();
    const updated = [newLog, ...finance.auditLogs].slice(0, 500); // Conserver les 500 dernières traces
    writeServerFinance({ auditLogs: updated });

    return NextResponse.json({
      success: true,
      auditLog: newLog,
    });
  } catch (error) {
    console.error('Erreur POST /api/audit-logs:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de l\'enregistrement du log d\'audit.' },
      { status: 500 }
    );
  }
}

