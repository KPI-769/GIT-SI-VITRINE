import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const logs = await prisma.accessLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      logs: logs.map((l) => ({
        id: l.id,
        matricule: l.matricule,
        nom: l.nom || '',
        prenom: l.prenom || '',
        niveau: l.niveau || '',
        granted: l.granted,
        reason: l.reason,
        scannedBy: l.scannedBy || '',
        createdAt: l.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Erreur GET /api/access-logs:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des logs d\'accès.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { matricule, nom, prenom, niveau, granted, reason, scannedBy } = body;

    if (!matricule) {
      return NextResponse.json(
        { success: false, message: 'Le matricule est obligatoire.' },
        { status: 400 }
      );
    }

    const log = await prisma.accessLog.create({
      data: {
        matricule: String(matricule).trim().toUpperCase(),
        nom: nom ? String(nom).trim() : null,
        prenom: prenom ? String(prenom).trim() : null,
        niveau: niveau ? String(niveau).trim() : null,
        granted: Boolean(granted),
        reason: String(reason || 'Contrôle d\'accès au Laboratoire'),
        scannedBy: scannedBy ? String(scannedBy).trim() : null,
      },
    });

    return NextResponse.json({
      success: true,
      log,
    });
  } catch (error) {
    console.error('Erreur POST /api/access-logs:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de l\'enregistrement du log d\'accès.' },
      { status: 500 }
    );
  }
}
