import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EventStatus } from '@prisma/client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PATCH /api/events/[id] - Mise à jour d'un événement
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { title, description, startDate, endDate, location, status, coverImage } = body;

    const dataToUpdate: Record<string, unknown> = {};
    if (title !== undefined) dataToUpdate.title = String(title).trim();
    if (description !== undefined) dataToUpdate.description = String(description).trim();
    if (startDate !== undefined) dataToUpdate.startDate = new Date(startDate);
    if (endDate !== undefined) dataToUpdate.endDate = endDate ? new Date(endDate) : null;
    if (location !== undefined) dataToUpdate.location = location ? String(location).trim() : null;
    if (status !== undefined) dataToUpdate.status = status as EventStatus;
    if (coverImage !== undefined) dataToUpdate.coverImage = coverImage ? String(coverImage).trim() : null;

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      message: 'Événement mis à jour avec succès dans la base MySQL.',
      event: updatedEvent,
    });
  } catch (error) {
    console.error('Erreur PATCH /api/events/[id]:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la mise à jour de l\'événement.' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Suppression d'un événement
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Événement supprimé avec succès de la base MySQL.',
    });
  } catch (error) {
    console.error('Erreur DELETE /api/events/[id]:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la suppression de l\'événement.' },
      { status: 500 }
    );
  }
}
