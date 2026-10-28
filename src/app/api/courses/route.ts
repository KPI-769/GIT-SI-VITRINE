import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CourseStatus } from '@prisma/client';

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { certifications: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      courses: courses.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        status: c.status,
        instructor: c.instructor || '',
        hoursCount: c.hoursCount || 20,
        level: c.level || 'Tous Niveaux',
        startDate: c.startDate ? c.startDate.toISOString() : null,
        certifiedCount: c._count.certifications,
        createdAt: c.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Erreur GET /api/courses:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des formations.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, instructor, hoursCount, level, status, startDate } = body;

    if (!title || !description) {
      return NextResponse.json(
        { success: false, message: 'Titre et description sont requis.' },
        { status: 400 }
      );
    }

    const newCourse = await prisma.course.create({
      data: {
        title: String(title).trim(),
        description: String(description).trim(),
        instructor: instructor ? String(instructor).trim() : null,
        hoursCount: hoursCount ? Number(hoursCount) : 20,
        level: level ? String(level).trim() : 'Tous Niveaux',
        status: (status as CourseStatus) || CourseStatus.PLANNED,
        startDate: startDate ? new Date(startDate) : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Formation créée avec succès dans la base MySQL.',
      course: newCourse,
    });
  } catch (error) {
    console.error('Erreur POST /api/courses:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la création de la formation.' },
      { status: 500 }
    );
  }
}
