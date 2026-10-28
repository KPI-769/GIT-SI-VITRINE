import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PenaltyStatus } from '@prisma/client';

// GET /api/penalties - Liste toutes les pénalités avec détails membre et censeur
export async function GET() {
  try {
    const penalties = await prisma.penalty.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            matricule: true,
            nom: true,
            prenom: true,
            niveau: true,
            phone: true,
            email: true,
          },
        },
        censor: {
          select: {
            id: true,
            matricule: true,
            nom: true,
            prenom: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      penalties: penalties.map((p) => ({
        id: p.id,
        userId: p.userId,
        censorId: p.censorId,
        reason: p.reason,
        amount: Number(p.amount),
        status: p.status,
        createdAt: p.createdAt.toISOString(),
        paidAt: p.paidAt ? p.paidAt.toISOString() : null,
        user: p.user,
        censor: p.censor,
      })),
    });
  } catch (error) {
    console.error('Erreur GET /api/penalties:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des pénalités.' },
      { status: 500 }
    );
  }
}

// POST /api/penalties - Création d'une nouvelle pénalité (Censeur ou Admin)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, censorId, reason, amount, isRefusal } = body;

    if (!userId || !reason || amount === undefined) {
      return NextResponse.json(
        { success: false, message: 'Membre, motif et montant sont obligatoires.' },
        { status: 400 }
      );
    }

    // Si censorId n'est pas fourni, chercher le censeur ou admin par défaut
    let finalCensorId = censorId;
    if (!finalCensorId) {
      const defaultCensor = await prisma.user.findFirst({
        where: { role: { in: ['CENSEUR', 'ADMIN'] } },
      });
      finalCensorId = defaultCensor?.id || userId;
    }

    // Si c'est un refus de scanner, on préfixe le motif pour que les admins le repèrent
    const formattedReason = isRefusal
      ? `[DEMANDE_ADMIN_REFUS_SCAN] ${String(reason).trim()}`
      : String(reason).trim();

    const penalty = await prisma.penalty.create({
      data: {
        userId,
        censorId: finalCensorId,
        reason: formattedReason,
        amount: Number(amount) || 1000,
        status: PenaltyStatus.PENDING,
      },
      include: {
        user: {
          select: {
            id: true,
            matricule: true,
            nom: true,
            prenom: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: isRefusal
        ? 'Demande de pénalité pour refus de scan transmise aux administrateurs.'
        : 'Pénalité enregistrée avec succès. À régler auprès de la Trésorière.',
      penalty: {
        ...penalty,
        amount: Number(penalty.amount),
      },
    });
  } catch (error) {
    console.error('Erreur POST /api/penalties:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la création de la pénalité.' },
      { status: 500 }
    );
  }
}
