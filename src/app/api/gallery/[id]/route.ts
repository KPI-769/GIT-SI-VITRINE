import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    return NextResponse.json({
      success: true,
      message: 'Photo mise à jour avec succès',
      id,
      updates: body,
    });
  } catch (error) {
    console.error('Erreur PATCH /api/gallery/[id]:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return NextResponse.json({
      success: true,
      message: 'Photo supprimée de la galerie avec succès',
      id,
    });
  } catch (error) {
    console.error('Erreur DELETE /api/gallery/[id]:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
