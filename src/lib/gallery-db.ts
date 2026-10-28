// IndexedDB storage pour les albums de la médiathèque
// Remplace localStorage qui est limité à ~5-10 MB et échoue silencieusement
// IndexedDB peut stocker des centaines de MB sans problème

import { EventAlbum } from './types';

const DB_NAME = 'git_gallery_db';
const DB_VERSION = 1;
const STORE_NAME = 'albums';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Récupère tous les albums depuis IndexedDB */
export async function getAllAlbumsFromDB(): Promise<EventAlbum[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const albums = request.result as EventAlbum[];
        // Trier par date de création décroissante
        albums.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        resolve(albums);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Erreur lecture IndexedDB albums:', err);
    return [];
  }
}

/** Sauvegarde un album (création ou mise à jour) */
export async function saveAlbumToDB(album: EventAlbum): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(album);
      tx.oncomplete = () => {
        window.dispatchEvent(new CustomEvent('git_albums_updated'));
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Erreur sauvegarde IndexedDB album:', err);
  }
}

/** Sauvegarde tous les albums (remplacement complet) */
export async function saveAllAlbumsToDB(albums: EventAlbum[]): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear();
      albums.forEach((album) => store.put(album));
      tx.oncomplete = () => {
        window.dispatchEvent(new CustomEvent('git_albums_updated'));
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Erreur sauvegarde IndexedDB albums:', err);
  }
}

/** Supprime un album par ID */
export async function deleteAlbumFromDB(albumId: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(albumId);
      tx.oncomplete = () => {
        window.dispatchEvent(new CustomEvent('git_albums_updated'));
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Erreur suppression IndexedDB album:', err);
  }
}

/** Migration unique : importe les anciens albums localStorage vers IndexedDB */
export async function migrateFromLocalStorage(): Promise<boolean> {
  const MIGRATION_KEY = 'git_gallery_idb_migrated_v1';
  if (typeof window === 'undefined') return false;

  try {
    if (localStorage.getItem(MIGRATION_KEY)) return false;

    const raw = localStorage.getItem('git_community_event_albums_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        await saveAllAlbumsToDB(parsed);
        console.log(`Migration IndexedDB: ${parsed.length} albums importés depuis localStorage.`);
      }
    }

    localStorage.setItem(MIGRATION_KEY, 'true');
    return true;
  } catch (err) {
    console.error('Erreur migration localStorage → IndexedDB:', err);
    return false;
  }
}
