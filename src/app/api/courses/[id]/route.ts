import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CourseStatus } from '@prisma/client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PATCH /api/courses/[id] - Mise à jour d'une formation
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { title, description, instructor, hoursCount, level, status, startDate } = body;

    const dataToUpdate: Record<string, unknown> = {};
    if (title !== undefined) dataToUpdate.title = String(title).trim();
    if (description !== undefined) dataToUpdate.description = String(description).trim();
    if (instructor !== undefined) dataToUpdate.instructor = instructor ? String(instructor).trim() : null;
    if (hoursCount !== undefined) dataToUpdate.hoursCount = Number(hoursCount);
    if (level !== undefined) dataToUpdate.level = level ? String(level).trim() : 'Tous Niveaux';
    if (status !== undefined) dataToUpdate.status = status as CourseStatus;
    if (startDate !== undefined) dataToUpdate.startDate = startDate ? new Date(startDate) : null;

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      message: 'Formation mise à jour avec succès dans la base MySQL.',
      course: updatedCourse,
    });
  } catch (error) {
    console.error('Erreur PATCH /api/courses/[id]:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la mise à jour de la formation.' },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id] - Suppression d'une formation
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await prisma.course.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Formation supprimée avec succès de la base MySQL.',
    });
  } catch (error) {
    console.error('Erreur DELETE /api/courses/[id]:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la suppression de la formation.' },
      { status: 500 }
    );
  }
}
