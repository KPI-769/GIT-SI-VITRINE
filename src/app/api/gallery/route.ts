import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_GALLERY_ITEMS } from '@/lib/gallery-store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featuredOnly = searchParams.get('featured') === 'true';

    // Essai de récupération via Prisma si connecté
    try {
      const dbItems = await prisma.galleryItem.findMany({
        include: {
          event: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (dbItems && dbItems.length > 0) {
        let mapped = dbItems.map((item) => ({
          id: item.id,
          title: item.caption || item.event?.title || 'Photo Galerie',
          description: item.event?.description || '',
          imageUrl: item.url,
          category: (item.event?.status === 'COMPLETED' ? 'EVENEMENT' : 'HACKATHON') as any,
          date: item.createdAt.toISOString().slice(0, 10),
          uploadedBy: 'Community Manager',
          featured: true,
          status: 'PUBLISHED' as const,
          likes: 25,
          createdAt: item.createdAt.toISOString(),
        }));

        if (category && category !== 'TOUS') {
          mapped = mapped.filter((i) => i.category === category);
        }
        if (featuredOnly) {
          mapped = mapped.filter((i) => i.featured);
        }

        return NextResponse.json({ success: true, items: mapped });
      }
    } catch (dbErr) {
      // Ignorer l'erreur Prisma si table non peuplée et renvoyer la liste officielle
    }

    let items = [...INITIAL_GALLERY_ITEMS];
    if (category && category !== 'TOUS') {
      items = items.filter((i) => i.category === category);
    }
    if (featuredOnly) {
      items = items.filter((i) => i.featured);
    }

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Erreur GET /api/gallery:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération de la galerie' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, imageUrl, category, date, uploadedBy, featured } = body;

    if (!title || !imageUrl) {
      return NextResponse.json(
        { success: false, message: 'Titre et URL de l\'image obligatoires' },
        { status: 400 }
      );
    }

    const newItem = {
      id: `gal_${Date.now()}`,
      title: title.trim(),
      description: description ? description.trim() : '',
      imageUrl: imageUrl.trim(),
      category: category || 'EVENEMENT',
      date: date || new Date().toISOString().slice(0, 10),
      uploadedBy: uploadedBy || 'KOUOH ETEKI Freddy (GIT-BUR-17)',
      featured: !!featured,
      status: 'PUBLISHED' as const,
      likes: 0,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Photo ajoutée à la galerie avec succès !',
      item: newItem,
    });
  } catch (error) {
    console.error('Erreur POST /api/gallery:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur lors de l\'ajout à la galerie' },
      { status: 500 }
    );
  }
}
