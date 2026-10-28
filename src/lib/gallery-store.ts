import { EventAlbum, EventMediaItem, GalleryCategory, GalleryItem } from './types';
import {
  getAllAlbumsFromDB,
  saveAlbumToDB,
  saveAllAlbumsToDB,
  deleteAlbumFromDB,
  migrateFromLocalStorage
} from './gallery-db';

// Plus d'albums factices — seuls les albums créés par l'utilisateur apparaissent
export const INITIAL_EVENT_ALBUMS: EventAlbum[] = [];

const STORAGE_KEY_LIKES = 'git_community_user_likes_v2';

// ─── IndexedDB-backed API (async) ───

/** Charge les albums depuis IndexedDB (avec migration automatique au 1er appel) */
export async function loadEventAlbums(): Promise<EventAlbum[]> {
  if (typeof window === 'undefined') return [];
  await migrateFromLocalStorage();
  return getAllAlbumsFromDB();
}

/** Sauvegarde tous les albums dans IndexedDB */
export async function saveEventAlbums(albums: EventAlbum[]): Promise<void> {
  await saveAllAlbumsToDB(albums);
}

/** Sauvegarde un seul album (ajout ou mise à jour) */
export async function saveOneAlbum(album: EventAlbum): Promise<void> {
  await saveAlbumToDB(album);
}

/** Supprime un album */
export async function removeAlbum(albumId: string): Promise<void> {
  await deleteAlbumFromDB(albumId);
}

// ─── Fonctions synchrones legacy (rétrocompatibilité localStorage) ───

export function getLocalEventAlbums(): EventAlbum[] {
  if (typeof window === 'undefined') return [];
  // Retourne un tableau vide — les composants doivent migrer vers loadEventAlbums()
  return [];
}

export function saveLocalEventAlbums(albums: EventAlbum[]): void {
  if (typeof window === 'undefined') return;
  // Sauvegarde dans IndexedDB de manière asynchrone
  saveAllAlbumsToDB(albums).catch((err) =>
    console.error('Erreur sauvegarde albums IndexedDB:', err)
  );
}

// Gestion des likes utilisateur
export function getUserLikedMediaIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LIKES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function toggleLikeMedia(albumId: string, mediaId: string): Promise<{ isLiked: boolean; newLikes: number }> {
  if (typeof window === 'undefined') return { isLiked: false, newLikes: 0 };
  const likedIds = getUserLikedMediaIds();
  const isAlreadyLiked = likedIds.includes(mediaId);

  const albums = await getAllAlbumsFromDB();
  let newLikes = 0;

  const updatedAlbums = albums.map((alb) => {
    if (alb.id === albumId) {
      const updatedMedia = alb.media.map((med) => {
        if (med.id === mediaId) {
          const count = isAlreadyLiked ? Math.max(0, med.likes - 1) : med.likes + 1;
          newLikes = count;
          return { ...med, likes: count };
        }
        return med;
      });
      return { ...alb, media: updatedMedia };
    }
    return alb;
  });

  await saveAllAlbumsToDB(updatedAlbums);

  const updatedLikesList = isAlreadyLiked
    ? likedIds.filter((id) => id !== mediaId)
    : [...likedIds, mediaId];

  localStorage.setItem(STORAGE_KEY_LIKES, JSON.stringify(updatedLikesList));

  return { isLiked: !isAlreadyLiked, newLikes };
}

// Rétrocompatibilité items à plat
export const INITIAL_GALLERY_ITEMS: GalleryItem[] = [];

export function getLocalGalleryItems(): GalleryItem[] {
  return [];
}

export function saveLocalGalleryItems(items: GalleryItem[]): void {
  // no-op pour compatibilité
}

export const GALLERY_CATEGORY_LABELS: Record<GalleryCategory, { label: string; badgeClass: string; color: string }> = {
  EVENEMENT: { label: 'Événement', badgeClass: 'bg-blue-100 text-blue-900 border-blue-300', color: '#0B3D91' },
  HACKATHON: { label: 'Hackathon', badgeClass: 'bg-purple-100 text-purple-900 border-purple-300', color: '#7C3AED' },
  CONFERENCE: { label: 'Conférence', badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300', color: '#059669' },
  VIE_DU_CLUB: { label: 'Vie du Club & Labo', badgeClass: 'bg-amber-100 text-amber-900 border-amber-300', color: '#D97706' },
  REMISE_PRIX: { label: 'Remise des Prix', badgeClass: 'bg-rose-100 text-rose-900 border-rose-300', color: '#E11D48' },
  ASSEMBLEE: { label: 'Assemblée Générale', badgeClass: 'bg-cyan-100 text-cyan-900 border-cyan-300', color: '#0891B2' },
};
