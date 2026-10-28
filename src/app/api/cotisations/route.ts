import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberId, months, method, reference, treasurerId } = body;

    if (!memberId || !Array.isArray(months) || months.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Identifiant du membre et liste des mois requis.' },
        { status: 400 }
      );
    }

    const currentYear = new Date().getFullYear();
    const montantTotal = months.length * 2000;

    // 1. Créer le paiement global
    const payment = await prisma.payment.create({
      data: {
        montantTotal,
        method: method || 'Espèces',
        reference: reference ? String(reference).trim() : null,
        treasurerId: treasurerId || 'usr_admin',
      },
    });

    // 2. Mettre à jour ou créer les cotisations
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
          paymentId: payment.id,
        },
        create: {
          userId: memberId,
          mois: m,
          annee: currentYear,
          montant: 2000,
          isPaid: true,
          paymentId: payment.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Paiement et cotisations enregistrés avec succès dans MySQL.',
      payment,
    });
  } catch (error) {
    console.error('Erreur POST /api/cotisations:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de l\'enregistrement du paiement.' },
      { status: 500 }
    );
  }
}
