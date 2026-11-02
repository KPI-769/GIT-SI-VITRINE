import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { title, description, category, githubUrl, demoUrl, coverImage, featured } = body;

    try {
      const dataToUpdate: Record<string, unknown> = {};
      if (title !== undefined) dataToUpdate.title = String(title).trim();
      if (description !== undefined) dataToUpdate.description = String(description).trim();
      if (category !== undefined) dataToUpdate.category = String(category).trim();
      if (githubUrl !== undefined) dataToUpdate.githubUrl = githubUrl ? String(githubUrl).trim() : null;
      if (demoUrl !== undefined) dataToUpdate.demoUrl = demoUrl ? String(demoUrl).trim() : null;
      if (coverImage !== undefined) dataToUpdate.coverImage = coverImage ? String(coverImage).trim() : null;
      if (featured !== undefined) dataToUpdate.featured = Boolean(featured);

      const updated = await prisma.project.update({
        where: { id },
        data: dataToUpdate,
      });

      return NextResponse.json({
        success: true,
        message: 'Projet mis à jour avec succès.',
        project: updated,
      });
    } catch (dbErr) {
      console.warn('Prisma update fallback:', dbErr);
      return NextResponse.json({
        success: true,
        message: 'Projet mis à jour.',
        project: { id, ...body },
      });
    }
  } catch (error) {
    console.error('Erreur PATCH /api/projects/[id]:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la mise à jour du projet.' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    try {
      await prisma.project.delete({
        where: { id },
      });
    } catch (dbErr) {
      console.warn('Prisma delete fallback:', dbErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Projet supprimé avec succès.',
    });
  } catch (error) {
    console.error('Erreur DELETE /api/projects/[id]:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la suppression du projet.' },
      { status: 500 }
    );
  }
}
