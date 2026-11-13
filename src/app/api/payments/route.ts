import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readServerFinance, writeServerFinance } from '@/lib/server-finance';
import { Payment } from '@/lib/types';

export async function GET() {
  try {
    const dbPayments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        cotisations: true,
      },
    });

    if (dbPayments && dbPayments.length > 0) {
      const formatted: Payment[] = dbPayments.map((p) => ({
        id: p.id,
        montantTotal: Number(p.montantTotal),
        method: p.method,
        reference: p.reference || undefined,
        treasurerId: p.treasurerId,
        createdAt: p.createdAt.toISOString(),
        cotisationIds: p.cotisations ? p.cotisations.map((c: { id: string }) => c.id) : [],
      }));

      // Mettre à jour le cache serveur
      writeServerFinance({ payments: formatted });

      return NextResponse.json({
        success: true,
        payments: formatted,
        count: formatted.length,
      });
    }
  } catch (err) {
    console.warn('Prisma unavailable for GET /api/payments, falling back to server finance store:', err);
  }

  // Fallback sur le stockage serveur persistant
  const finance = readServerFinance();
  return NextResponse.json({
    success: true,
    payments: finance.payments,
    count: finance.payments.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, montantTotal, method, reference, treasurerId, createdAt } = body;

    const paymentId = id || `pay_${Date.now()}`;
    const amount = Number(montantTotal) || 0;
    const dateStr = createdAt || new Date().toISOString();

    const newPayment: Payment = {
      id: paymentId,
      montantTotal: amount,
      method: method || 'Espèces',
      reference: reference ? String(reference).trim() : undefined,
      treasurerId: treasurerId || 'usr_treasurer',
      createdAt: dateStr,
      cotisationIds: [],
    };

    // 1. Sauvegarde dans Prisma si accessible
    try {
      await prisma.payment.create({
        data: {
          id: paymentId,
          montantTotal: amount,
          method: newPayment.method,
          reference: newPayment.reference || null,
          treasurerId: newPayment.treasurerId,
          createdAt: new Date(dateStr),
        },
      });
    } catch (dbErr) {
      console.warn('Prisma create failed for payment, stored in server-finance:', dbErr);
    }

    // 2. Sauvegarde dans le fichier centralisé serveur
    const finance = readServerFinance();
    const updatedPayments = [newPayment, ...finance.payments.filter((p) => p.id !== paymentId)];
    writeServerFinance({ payments: updatedPayments });

    return NextResponse.json({
      success: true,
      payment: newPayment,
      message: 'Paiement centralisé avec succès.',
    });
  } catch (error) {
    console.error('Erreur POST /api/payments:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de l\'enregistrement du paiement.' },
      { status: 500 }
    );
  }
}

