import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EventStatus } from '@prisma/client';

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { startDate: 'desc' },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      events: events.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        startDate: e.startDate.toISOString(),
        endDate: e.endDate ? e.endDate.toISOString() : null,
        location: e.location || '',
        status: e.status,
        coverImage: e.coverImage || '',
        registeredCount: e._count.registrations,
        createdAt: e.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Erreur GET /api/events:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des événements.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, startDate, endDate, location, status, coverImage } = body;

    if (!title || !description || !startDate) {
      return NextResponse.json(
        { success: false, message: 'Titre, description et date de début sont requis.' },
        { status: 400 }
      );
    }

    const newEvent = await prisma.event.create({
      data: {
        title: String(title).trim(),
        description: String(description).trim(),
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        location: location ? String(location).trim() : null,
        status: (status as EventStatus) || EventStatus.UPCOMING,
        coverImage: coverImage ? String(coverImage).trim() : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Événement créé avec succès dans la base MySQL.',
      event: newEvent,
    });
  } catch (error) {
    console.error('Erreur POST /api/events:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la création de l\'événement.' },
      { status: 500 }
    );
  }
}
