'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Camera,
  Video,
  Heart,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Eye,
  Folder,
  Share2,
  Sparkles
} from 'lucide-react';
import { EventAlbum, GalleryCategory } from '@/lib/types';
import {
  loadEventAlbums,
  getUserLikedMediaIds,
  toggleLikeMedia,
  GALLERY_CATEGORY_LABELS,
} from '@/lib/gallery-store';
import { playSuccessTone } from '@/lib/store';
import ThemeToggle from '@/components/ThemeToggle';

function EventAlbumDetailContent() {
  const params = useParams();
  const albumId = (params?.id as string) || '';
  const router = useRouter();

  const [albums, setAlbums] = useState<EventAlbum[]>([]);
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'ALL' | 'IMAGE' | 'VIDEO'>('ALL');
  const [likedMediaIds, setLikedMediaIds] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const refreshAlbums = async () => {
    const loaded = await loadEventAlbums();
    setAlbums(loaded);
    setLikedMediaIds(getUserLikedMediaIds());
  };

  useEffect(() => {
    refreshAlbums();
    const handler = () => { refreshAlbums(); };
    window.addEventListener('storage', handler);
    window.addEventListener('git_albums_updated', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('git_albums_updated', handler);
    };
  }, []);

  const currentAlbum = useMemo(() => {
    return albums.find((a) => a.id === albumId) || null;
  }, [albums, albumId]);

  const filteredMedia = useMemo(() => {
    if (!currentAlbum) return [];
    return currentAlbum.media.filter((m) => {
      if (mediaTypeFilter === 'ALL') return true;
      return m.type === mediaTypeFilter;
    });
  }, [currentAlbum, mediaTypeFilter]);

  // Support clavier Lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => {
          if (prev === null || !currentAlbum) return prev;
          return prev < filteredMedia.length - 1 ? prev + 1 : prev;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, currentAlbum, filteredMedia.length]);

  const handleLike = async (mediaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentAlbum) return;

    const res = await toggleLikeMedia(currentAlbum.id, mediaId);
    playSuccessTone();

    setLikedMediaIds((prev) =>
      res.isLiked ? [...prev, mediaId] : prev.filter((id) => id !== mediaId)
    );

    setAlbums((prev) =>
      prev.map((alb) => {
        if (alb.id === currentAlbum.id) {
          return {
            ...alb,
            media: alb.media.map((med) =>
              med.id === mediaId ? { ...med, likes: res.newLikes } : med
            ),
          };
        }
        return alb;
      })
    );
  };

  if (!currentAlbum) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100">
        <div className="accent-bar" />
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B0F19]/95 p-4">
          <Link href="/mediatheque" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600">
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à la Médiathèque</span>
          </Link>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <Folder className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-display">Dossier d&apos;Événement Introuvable</h2>
          <p className="text-xs text-slate-500 max-w-sm">
            Ce dossier a peut-être été déplacé ou supprimé par le Community Manager.
          </p>
          <Link href="/mediatheque" className="btn-nasa text-xs font-bold py-2.5 px-4">
            Voir tous les dossiers disponibles
          </Link>
        </div>
      </div>
    );
  }

  const catInfo = GALLERY_CATEGORY_LABELS[currentAlbum.category] || {
    label: currentAlbum.category,
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="accent-bar" />

      {/* Barre de navigation dédiée - Toujours accessible */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-md shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/mediatheque"
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition cursor-pointer flex items-center gap-2 text-xs font-bold shadow-xs shrink-0"
              title="Retour à la liste des dossiers d'événements"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Retour aux dossiers</span>
            </Link>

            <Link href="/" className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
              <span>Accueil</span>
              <span>/</span>
              <span>Médiathèque</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:block text-xs font-mono text-slate-500 dark:text-slate-400">
              {currentAlbum.media.length} médias
            </span>
            <ThemeToggle />
            <Link
              href="/espace-membre"
              className="btn-nasa text-xs font-bold py-2 px-3 sm:px-4 cursor-pointer hidden sm:inline-flex"
            >
              Espace Membre
            </Link>
          </div>
        </div>
      </header>

      {/* Contenu principal de consultation */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
        
        {/* Fiche d'information détaillée de l'Événement */}
        <div className="card p-5 sm:p-8 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${catInfo.badgeClass}`}>
              {catInfo.label}
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>{currentAlbum.date}</span>
            </span>
            {currentAlbum.location && (
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                <span>{currentAlbum.location}</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-display leading-tight">
            {currentAlbum.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
            {currentAlbum.description}
          </p>

          <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] sm:text-xs">
              Reportage officiel : <strong>{currentAlbum.uploadedBy}</strong>
            </span>

            {/* Filtre Photos / Vidéos */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
              <button
                onClick={() => setMediaTypeFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  mediaTypeFilter === 'ALL'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Tous ({currentAlbum.media.length})
              </button>
              <button
                onClick={() => setMediaTypeFilter('IMAGE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  mediaTypeFilter === 'IMAGE'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Photos ({currentAlbum.media.filter((m) => m.type === 'IMAGE').length})</span>
              </button>
              <button
                onClick={() => setMediaTypeFilter('VIDEO')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  mediaTypeFilter === 'VIDEO'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Vidéos ({currentAlbum.media.filter((m) => m.type === 'VIDEO').length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Grille Complète de TOUTES les Photos & Vidéos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredMedia.map((media, index) => {
            const isLiked = likedMediaIds.includes(media.id);

            return (
              <div
                key={media.id}
                className="cyber-panel overflow-hidden bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-pink-400 dark:hover:border-pink-500/60 transition-all duration-300 shadow-sm hover:shadow-lg rounded-2xl sm:rounded-3xl flex flex-col justify-between group"
              >
                <div>
                  <div
                    className="relative aspect-video w-full overflow-hidden bg-slate-950 cursor-pointer"
                    onClick={() => setLightboxIndex(index)}
                    title="Cliquer pour afficher en plein écran"
                  >
                    {media.type === 'VIDEO' ? (
                      <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
                        <video src={media.url} className="w-full h-full object-cover" muted playsInline />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                          <div className="w-12 h-12 rounded-full bg-pink-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 fill-white ml-0.5" />
                          </div>
                        </div>
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-600 text-white flex items-center gap-1 shadow-sm">
                          <Video className="w-3 h-3" />
                          <span>Vidéo</span>
                        </span>
                      </div>
                    ) : (
                      <img
                        src={media.url}
                        alt={media.caption || currentAlbum.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 group-hover:opacity-70 transition-opacity" />

                    <div className="absolute bottom-2.5 right-2.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      <span className="p-1.5 rounded-lg bg-black/70 text-white backdrop-blur-md flex items-center gap-1 text-xs">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 text-[10px] text-white/90 font-mono bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                      #{index + 1}
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 space-y-1.5">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed line-clamp-2">
                      {media.caption || `Cliché officiel - ${currentAlbum.title}`}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-black/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={(e) => handleLike(media.id, e)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      isLiked
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 shadow-xs'
                        : 'bg-white dark:bg-slate-900 hover:bg-rose-50 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                    }`}
                    title="Voter pour ce média"
                  >
                    <Heart className={`w-3.5 h-3.5 transition-transform active:scale-125 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                    <span>{media.likes} {media.likes > 1 ? 'likes' : 'like'}</span>
                  </button>

                  <button
                    onClick={() => setLightboxIndex(index)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-mono font-medium flex items-center gap-1 border border-slate-200 dark:border-slate-800 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-500" />
                    <span>Consulter</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Grand Bouton de Retour en Pied de Page */}
        <div className="pt-8 pb-4 text-center">
          <Link
            href="/mediatheque"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Revenir à la liste de tous les dossiers d&apos;événements</span>
          </Link>
        </div>
      </main>

      {/* ═══════════════════════════════════════════════════════════════
          LIGHTBOX IMMERSIVE AVEC FILMSTRIP MINIATURES
         ═══════════════════════════════════════════════════════════════ */}
      {lightboxIndex !== null && filteredMedia[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-md anim-fade-in"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[96vh] flex flex-col items-center justify-between space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Barre supérieure Lightbox */}
            <div className="w-full flex items-center justify-between px-2 pt-1 text-white">
              <span className="text-xs font-mono opacity-80">
                {lightboxIndex + 1} / {filteredMedia.length}
              </span>

              <button
                onClick={() => setLightboxIndex(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Fermer (Échap)"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Média principal grand format avec flèches */}
            <div className="relative w-full flex items-center justify-center">
              {lightboxIndex > 0 && (
                <button
                  onClick={() => setLightboxIndex(lightboxIndex - 1)}
                  className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition cursor-pointer z-20 shadow-xl"
                  title="Précédent"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              )}

              {lightboxIndex < filteredMedia.length - 1 && (
                <button
                  onClick={() => setLightboxIndex(lightboxIndex + 1)}
                  className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition cursor-pointer z-20 shadow-xl"
                  title="Suivant"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              )}

              {filteredMedia[lightboxIndex].type === 'VIDEO' ? (
                <video
                  src={filteredMedia[lightboxIndex].url}
                  className="max-h-[55vh] sm:max-h-[65vh] w-auto max-w-full rounded-2xl shadow-2xl"
                  controls
                  autoPlay
                />
              ) : (
                <img
                  src={filteredMedia[lightboxIndex].url}
                  alt={filteredMedia[lightboxIndex].caption || 'Média grand format'}
                  className="max-h-[55vh] sm:max-h-[65vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl"
                />
              )}
            </div>

            {/* Légende & Like */}
            <div className="text-center text-white space-y-1.5 max-w-xl px-4">
              <p className="text-xs sm:text-sm font-semibold">
                {filteredMedia[lightboxIndex].caption || currentAlbum.title}
              </p>
              <div className="flex items-center justify-center gap-3 text-xs">
                <button
                  onClick={(e) => handleLike(filteredMedia[lightboxIndex].id, e)}
                  className="px-3.5 py-1 rounded-full bg-rose-600 text-white font-bold flex items-center gap-1.5 shadow-md hover:bg-rose-700 transition cursor-pointer text-xs"
                >
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  <span>{filteredMedia[lightboxIndex].likes} J&apos;aime</span>
                </button>
                <span className="text-slate-400 text-[11px]">
                  {currentAlbum.title}
                </span>
              </div>
            </div>

            {/* Pellicule Filmstrip en bas */}
            <div className="w-full overflow-x-auto pb-2 pt-1 no-scrollbar px-2">
              <div className="flex items-center justify-center gap-1.5 min-w-max mx-auto">
                {filteredMedia.map((m, idx) => (
                  <button
                    key={m.id}
                    onClick={() => setLightboxIndex(idx)}
                    className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      lightboxIndex === idx
                        ? 'border-pink-500 scale-105 ring-2 ring-pink-500/50'
                        : 'border-white/30 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {m.type === 'VIDEO' ? (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white">
                        <Play className="w-4 h-4 fill-white" />
                      </div>
                    ) : (
                      <img src={m.url} alt={`Vignette ${idx}`} className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default function EventAlbumDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-500 font-medium" style={{ background: 'var(--surface-1)' }}>
          Chargement de l'album...
        </div>
      }
    >
      <EventAlbumDetailContent />
    </Suspense>
  );
}
