import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET /api/users - Liste tous les membres depuis la base MySQL
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        macAddresses: true,
        cotisations: true,
        penalties: true,
      },
      orderBy: [
        { niveau: 'asc' },
        { matricule: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      count: users.length,
      users: users.map((u) => ({
        id: u.id,
        matricule: u.matricule,
        nom: u.nom,
        prenom: u.prenom,
        email: u.email,
        phone: u.phone || '',
        niveau: u.niveau,
        role: u.role,
        poste: u.poste || '',
        isActive: u.isActive,
        mustChangePassword: u.mustChangePassword,
        qrCodeToken: u.qrCodeToken,
        isWifiAllowed: u.isWifiAllowed,
        isLabAllowed: u.isLabAllowed,
        passwordResetRequested: u.passwordResetRequested,
        passwordResetReason: u.passwordResetReason || '',
        passwordResetRequestedAt: u.passwordResetRequestedAt ? u.passwordResetRequestedAt.toISOString() : null,
        macAddresses: u.macAddresses.map((m) => ({
          id: m.id,
          address: m.address,
          deviceName: m.deviceName,
          userId: m.userId,
        })),
        cotisations: u.cotisations.map((c) => ({
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
        penalties: u.penalties.map((p) => ({
          id: p.id,
          userId: p.userId,
          censorId: p.censorId,
          reason: p.reason,
          amount: Number(p.amount),
          status: p.status,
          createdAt: p.createdAt.toISOString(),
          paidAt: p.paidAt ? p.paidAt.toISOString() : null,
        })),
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Erreur GET /api/users:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des utilisateurs.' },
      { status: 500 }
    );
  }
}

// POST /api/users - Création d'un nouvel utilisateur dans MySQL
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nom, prenom, email, matricule, phone, niveau, role, defaultPassword } = body;

    if (!nom || !prenom || !email || !matricule) {
      return NextResponse.json(
        { success: false, message: 'Nom, prénom, email et matricule sont obligatoires.' },
        { status: 400 }
      );
    }

    const cleanMatricule = String(matricule).trim().toUpperCase();
    const cleanEmail = String(email).trim().toLowerCase();

    // Vérifier l'unicité
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { matricule: cleanMatricule },
          { email: cleanEmail },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Un utilisateur avec ce matricule ou cet email existe déjà.' },
        { status: 409 }
      );
    }

    const passwordToHash = defaultPassword || 'git2026';
    const passwordHash = await bcrypt.hash(passwordToHash, 10);
    const qrCodeToken = `token_sjp_${cleanMatricule.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    const newUser = await prisma.user.create({
      data: {
        matricule: cleanMatricule,
        nom: String(nom).trim(),
        prenom: String(prenom).trim(),
        email: cleanEmail,
        phone: phone ? String(phone).trim() : '',
        niveau: niveau || 'GI_1',
        role: role || 'MEMBER',
        passwordHash,
        mustChangePassword: true,
        isActive: true,
        qrCodeToken,
        isWifiAllowed: true,
        isLabAllowed: role !== 'MEMBER',
      },
    });

    // Créer la cotisation du mois en cours
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    await prisma.cotisation.create({
      data: {
        userId: newUser.id,
        mois: currentMonth,
        annee: currentYear,
        montant: 2000,
        isPaid: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Utilisateur créé avec succès dans la base MySQL.',
      user: newUser,
    });
  } catch (error) {
    console.error('Erreur POST /api/users:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la création de l\'utilisateur.' },
      { status: 500 }
    );
  }
}
