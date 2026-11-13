import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readServerFinance, writeServerFinance } from '@/lib/server-finance';
import { COTISATION_AMOUNT_MEMBER, COTISATION_AMOUNT_BUREAU } from '@/lib/types';

// GET /api/cotisations - Récupère toutes les cotisations et l'état centralisé
export async function GET() {
  try {
    const cotisations = await prisma.cotisation.findMany({
      orderBy: [
        { annee: 'desc' },
        { mois: 'asc' },
      ],
      include: {
        user: {
          select: {
            id: true,
            matricule: true,
            nom: true,
            prenom: true,
            role: true,
            poste: true,
            niveau: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: cotisations.length,
      cotisations: cotisations.map((c) => ({
        id: c.id,
        mois: c.mois,
        annee: c.annee,
        montant: Number(c.montant),
        isPaid: c.isPaid,
        userId: c.userId,
        paymentId: c.paymentId,
        scannedBy: c.scannedBy,
        createdAt: c.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.warn('Prisma unavailable for GET /api/cotisations:', error);
    return NextResponse.json({
      success: true,
      cotisations: [],
      message: 'Base de données non accessible en direct.',
    });
  }
}

// POST /api/cotisations - Enregistrement d'un paiement de cotisation
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberId, months, method, reference, treasurerId, unitPrice: requestedPrice, amount } = body;

    if (!memberId || !Array.isArray(months) || months.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Identifiant du membre et liste des mois requis.' },
        { status: 400 }
      );
    }

    const currentYear = new Date().getFullYear();

    // Déterminer le tarif exact sans cumul de poste :
    // Si membre du bureau -> 1 500 FCFA, sinon 1 000 FCFA
    let unitPrice = Number(requestedPrice) || 0;
    if (!unitPrice) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: memberId },
          select: { role: true, niveau: true },
        });
        const isBureau = user && (user.role !== 'MEMBER' || user.niveau === 'GI_Bureau');
        unitPrice = isBureau ? COTISATION_AMOUNT_BUREAU : COTISATION_AMOUNT_MEMBER;
      } catch {
        unitPrice = COTISATION_AMOUNT_MEMBER;
      }
    }

    const montantTotal = Number(amount) || months.length * unitPrice;
    const paymentId = `pay_${Date.now()}`;

    // 1. Enregistrement dans Prisma
    try {
      // Créer le paiement global
      await prisma.payment.create({
        data: {
          id: paymentId,
          montantTotal,
          method: method || 'Espèces',
          reference: reference ? String(reference).trim() : null,
          treasurerId: treasurerId || 'usr_admin',
        },
      });

      // Mettre à jour ou créer les cotisations
      for (const m of months) {
        await prisma.cotisation.upsert({
          where: {
            userId_mois_annee: {
              userId: memberId,
              mois: m,
              annee: currentYear,
            },
          },
          update: {
            isPaid: true,
            montant: unitPrice,
            paymentId,
          },
          create: {
            userId: memberId,
            mois: m,
            annee: currentYear,
            montant: unitPrice,
            isPaid: true,
            paymentId,
          },
        });
      }
    } catch (dbErr) {
      console.warn('Prisma upsert failed for cotisations, stored in server-finance:', dbErr);
    }

    // 2. Synchronisation dans le stockage persistant serveur
    const finance = readServerFinance();
    const builtCotisationIds = months.map((m: number) => `cot_${memberId}_${currentYear}_${m}`);
    const newPayment = {
      id: paymentId,
      montantTotal,
      method: method || 'Espèces',
      reference: reference ? String(reference).trim() : undefined,
      treasurerId: treasurerId || 'usr_admin',
      createdAt: new Date().toISOString(),
      cotisationIds: builtCotisationIds,
    };
    writeServerFinance({
      payments: [newPayment, ...finance.payments.filter((p) => p.id !== paymentId)],
    });

    return NextResponse.json({
      success: true,
      message: 'Cotisations et paiement centralisés avec succès.',
      payment: newPayment,
      unitPrice,
      montantTotal,
    });
  } catch (error) {
    console.error('Erreur POST /api/cotisations:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de l\'enregistrement de la cotisation.' },
      { status: 500 }
    );
  }
}
