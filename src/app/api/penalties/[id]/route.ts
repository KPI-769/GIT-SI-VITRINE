import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PenaltyStatus } from '@prisma/client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PATCH /api/penalties/[id] - Valider, rejeter, payer ou modifier une pénalité
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { action, method, reference, amount, reason } = body;

    const penalty = await prisma.penalty.findUnique({
      where: { id },
    });

    if (!penalty) {
      return NextResponse.json(
        { success: false, message: 'Pénalité introuvable.' },
        { status: 404 }
      );
    }

    const dataToUpdate: Record<string, unknown> = {};

    if (action === 'APPROVE') {
      // Validation par l'administrateur
      const cleanReason = penalty.reason.replace('[DEMANDE_ADMIN_REFUS_SCAN] ', '');
      dataToUpdate.reason = `[VALIDÉ_PAR_ADMIN] ${cleanReason}`;
      dataToUpdate.status = PenaltyStatus.PENDING;
    } else if (action === 'REJECT') {
      // Rejet par l'administrateur
      dataToUpdate.status = PenaltyStatus.CANCELLED;
      dataToUpdate.reason = `[REJETÉ_PAR_ADMIN] ${penalty.reason}`;
    } else if (action === 'PAY') {
      // Paiement auprès de la trésorière
      dataToUpdate.status = PenaltyStatus.PAID;
      dataToUpdate.paidAt = new Date();
      if (method || reference) {
        dataToUpdate.reason = `${penalty.reason} (Payé par ${method || 'Espèces'}${reference ? ` - Réf: ${reference}` : ''})`;
      }
    } else {
      if (amount !== undefined) dataToUpdate.amount = Number(amount);
      if (reason !== undefined) dataToUpdate.reason = String(reason).trim();
    }

    const updated = await prisma.penalty.update({
      where: { id },
      data: dataToUpdate,
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

    let returnMsg = 'Pénalité mise à jour.';
    if (action === 'APPROVE') returnMsg = 'Demande de pénalité validée avec succès par l\'administrateur.';
    if (action === 'REJECT') returnMsg = 'Demande de pénalité rejetée.';
    if (action === 'PAY') returnMsg = `Paiement de la pénalité (${Number(updated.amount)} FCFA) enregistré par la Trésorière.`;

    return NextResponse.json({
      success: true,
      message: returnMsg,
      penalty: {
        ...updated,
        amount: Number(updated.amount),
      },
    });
  } catch (error) {
    console.error('Erreur PATCH /api/penalties/[id]:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la mise à jour de la pénalité.' },
      { status: 500 }
    );
  }
}

// DELETE /api/penalties/[id] - Suppression d'une pénalité
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await prisma.penalty.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Pénalité supprimée avec succès.',
    });
  } catch (error) {
    console.error('Erreur DELETE /api/penalties/[id]:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la suppression de la pénalité.' },
      { status: 500 }
    );
  }
}
