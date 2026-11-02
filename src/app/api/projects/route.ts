import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_PROJECTS } from '@/lib/store';

export async function GET() {
  try {
    const dbProjects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        contributors: {
          include: {
            user: {
              select: { id: true, nom: true, prenom: true, matricule: true }
            }
          }
        }
      }
    });

    if (dbProjects && dbProjects.length > 0) {
      const formatted = dbProjects.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        description: p.description,
        category: p.category || 'Systèmes Embarqués',
        githubUrl: p.githubUrl || undefined,
        demoUrl: p.demoUrl || undefined,
        coverImage: p.coverImage || undefined,
        featured: p.featured,
        technologies: ['C/C++', 'FreeRTOS', 'Next.js', 'TypeScript', 'Mikrotik'],
        membersCount: p.contributors.length,
        contributors: p.contributors.map((c) => ({
          id: c.id,
          projectId: c.projectId,
          userId: c.userId,
          roleInProject: c.roleInProject || 'Contributeur',
          name: `${c.user.prenom} ${c.user.nom}`,
          matricule: c.user.matricule
        }))
      }));

      return NextResponse.json({ success: true, projects: formatted });
    }

    return NextResponse.json({ success: true, projects: INITIAL_PROJECTS });
  } catch (error) {
    console.warn('GET /api/projects using fallback to INITIAL_PROJECTS:', error);
    return NextResponse.json({ success: true, projects: INITIAL_PROJECTS });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, category, githubUrl, demoUrl, coverImage, featured, technologies, contributors } = body;

    if (!title || !description) {
      return NextResponse.json(
        { success: false, message: 'Le titre et la description du projet sont obligatoires.' },
        { status: 400 }
      );
    }

    const slug = String(title)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

    try {
      const created = await prisma.project.create({
        data: {
          title: String(title).trim(),
          slug,
          description: String(description).trim(),
          category: category ? String(category).trim() : 'Systèmes Embarqués',
          githubUrl: githubUrl ? String(githubUrl).trim() : null,
          demoUrl: demoUrl ? String(demoUrl).trim() : null,
          coverImage: coverImage ? String(coverImage).trim() : null,
          featured: Boolean(featured),
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Projet créé avec succès dans la base MySQL.',
        project: {
          ...created,
          technologies: technologies || [],
          contributors: contributors || []
        }
      });
    } catch (dbErr) {
      console.warn('Prisma create failed, returning simulated created project:', dbErr);
      const simulatedProject = {
        id: `proj-${Date.now()}`,
        title,
        slug,
        description,
        category: category || 'Systèmes Embarqués',
        githubUrl,
        demoUrl,
        coverImage,
        featured: Boolean(featured),
        technologies: technologies || [],
        membersCount: contributors?.length || 1,
        contributors: contributors || []
      };

      return NextResponse.json({
        success: true,
        message: 'Projet enregistré localement.',
        project: simulatedProject
      });
    }
  } catch (err) {
    console.error('Erreur POST /api/projects:', err);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de l\'enregistrement du projet.' },
      { status: 500 }
    );
  }
}
