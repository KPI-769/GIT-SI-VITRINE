import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PATCH /api/users/[id] - Mise à jour rôle, statut actif, ou réinitialisation mot de passe
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { role, isActive, resetPassword, justification, newPassword } = body;

    const dataToUpdate: Record<string, unknown> = {};

    if (role !== undefined) {
      dataToUpdate.role = role;
    }

    if (isActive !== undefined) {
      dataToUpdate.isActive = Boolean(isActive);
    }

    if (resetPassword) {
      // Réinitialisation par l'admin avec le mot de passe par défaut
      const defaultPasswordHash = await bcrypt.hash('git2026', 10);
      dataToUpdate.passwordHash = defaultPasswordHash;
      dataToUpdate.mustChangePassword = true;
      dataToUpdate.passwordResetRequested = false;
      dataToUpdate.passwordResetReason = null;
      dataToUpdate.passwordResetRequestedAt = null;
    }

    if (newPassword) {
      // Changement de mot de passe par l'utilisateur
      const passwordHash = await bcrypt.hash(String(newPassword), 10);
      dataToUpdate.passwordHash = passwordHash;
      dataToUpdate.mustChangePassword = false;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès.',
      user: {
        id: updatedUser.id,
        matricule: updatedUser.matricule,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        mustChangePassword: updatedUser.mustChangePassword,
      },
    });
  } catch (error) {
    console.error('Erreur PATCH /api/users/[id]:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la mise à jour de l\'utilisateur.' },
      { status: 500 }
    );
  }
}
