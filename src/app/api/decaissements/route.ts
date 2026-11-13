import { NextResponse } from 'next/server';
import { readServerFinance, writeServerFinance } from '@/lib/server-finance';
import { Decaissement } from '@/lib/types';

// GET /api/decaissements - Liste tous les décaissements certifiés centralisés
export async function GET() {
  const finance = readServerFinance();
  return NextResponse.json({
    success: true,
    decaissements: finance.decaissements,
    count: finance.decaissements.length,
    totalAmount: finance.decaissements.reduce((sum, d) => sum + d.amount, 0),
  });
}

// POST /api/decaissements - Enregistre un nouveau décaissement certifié par scan QR
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      memberId,
      memberName,
      memberMatricule,
      amount,
      motif,
      beneficiaireCategory,
      certifiedByCommissaireId,
      certifiedByCommissaireName,
      reference,
      scanVerified,
    } = body;

    if (!memberId || !amount || !motif) {
      return NextResponse.json(
        { success: false, message: 'Bénéficiaire, montant et motif sont obligatoires.' },
        { status: 400 }
      );
    }

    const newDecaissement: Decaissement = {
      id: `dec_${Date.now()}`,
      memberId: String(memberId),
      memberName: String(memberName || 'Membre GIT'),
      memberMatricule: String(memberMatricule || 'GIT-SJP'),
      amount: Number(amount),
      motif: String(motif),
      beneficiaireCategory: beneficiaireCategory || 'PROJET_LABO',
      certifiedByCommissaireId: certifiedByCommissaireId || 'GIT-BUR-05',
      certifiedByCommissaireName: certifiedByCommissaireName || 'Commissaire aux Comptes',
      reference: reference || `DEC-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      scanVerified: Boolean(scanVerified),
    };

    const finance = readServerFinance();
    const updated = [newDecaissement, ...finance.decaissements];
    writeServerFinance({ decaissements: updated });

    return NextResponse.json({
      success: true,
      decaissement: newDecaissement,
      message: 'Décaissement centralisé avec succès.',
    });
  } catch (error) {
    console.error('Erreur POST /api/decaissements:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de l\'enregistrement du décaissement.' },
      { status: 500 }
    );
  }
}

