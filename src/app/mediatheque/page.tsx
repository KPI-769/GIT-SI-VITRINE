'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Folder,
  FolderOpen,
  Camera,
  Video,
  Heart,
  Calendar,
  MapPin,
  Search,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { EventAlbum, GalleryCategory } from '@/lib/types';
import {
  getLocalEventAlbums,
  GALLERY_CATEGORY_LABELS,
  INITIAL_EVENT_ALBUMS
} from '@/lib/gallery-store';
import ThemeToggle from '@/components/ThemeToggle';

export default function MediathequeIndexPage() {
  const [albums, setAlbums] = useState<EventAlbum[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('TOUS');
  const [searchQuery, setSearchQuery] = useState('');

  const refreshAlbums = () => {
    const loaded = getLocalEventAlbums();
    setAlbums(loaded.length > 0 ? loaded : INITIAL_EVENT_ALBUMS);
  };

  useEffect(() => {
    refreshAlbums();
    window.addEventListener('storage', refreshAlbums);
    window.addEventListener('git_albums_updated', refreshAlbums);
    return () => {
      window.removeEventListener('storage', refreshAlbums);
      window.removeEventListener('git_albums_updated', refreshAlbums);
    };
  }, []);

  const filteredAlbums = useMemo(() => {
    return albums.filter((alb) => {
      const matchCat = selectedCategory === 'TOUS' || alb.category === selectedCategory;
      const matchSearch =
        alb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alb.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (alb.location && alb.location.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [albums, selectedCategory, searchQuery]);

  const categories = ['TOUS', 'HACKATHON', 'VIE_DU_CLUB', 'ASSEMBLEE', 'REMISE_PRIX', 'CONFERENCE', 'EVENEMENT'];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="accent-bar" />

      {/* Barre de navigation dédiée */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Retour à l'accueil"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Accueil</span>
            </Link>

            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center p-0.5">
                <Image src="/logo.jpg" alt="Logo GIT" width={36} height={36} className="object-contain" priority />
              </div>
              <span className="font-extrabold text-base tracking-tight font-display text-slate-900 dark:text-white">
                MÉDIATHÈQUE GIT
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/espace-membre"
              className="btn-nasa text-xs font-bold py-2 px-3 sm:px-4 cursor-pointer"
            >
              Espace Membre
            </Link>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* En-tête de la Médiathèque */}
        <div className="card p-6 sm:p-10 bg-gradient-to-r from-blue-600/10 via-purple-600/5 to-pink-600/10 border border-blue-200/70 dark:border-blue-900/40 rounded-3xl shadow-sm space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-500/30 text-blue-800 dark:text-blue-300 text-xs font-mono font-bold uppercase">
            <Folder className="w-3.5 h-3.5" />
            <span>Portail des Archives Visuelles &bull; Saint Jérôme Polytechnique</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-display">
            Tous les Dossiers d&apos;Événements
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            Explorez les reportages photographiques et vidéos classés par événement. Cliquez sur un dossier pour ouvrir sa page dédiée et consulter l&apos;ensemble de ses clichés en haute définition.
          </p>
        </div>

        {/* Filtres & Recherche */}
        <div className="card p-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Rechercher un dossier ou un événement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-nasa pl-9 text-xs text-slate-900 dark:text-white w-full bg-white dark:bg-[#111827]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar w-full md:w-auto">
            {categories.map((cat) => {
              const label = cat === 'TOUS' ? 'Tous les Dossiers' : GALLERY_CATEGORY_LABELS[cat as GalleryCategory]?.label || cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-mono font-bold transition shrink-0 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grille des Dossiers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlbums.map((album) => {
            const catInfo = GALLERY_CATEGORY_LABELS[album.category] || {
              label: album.category,
              badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
            };
            const imageCount = album.media.filter((m) => m.type === 'IMAGE').length;
            const videoCount = album.media.filter((m) => m.type === 'VIDEO').length;
            const totalLikes = album.media.reduce((acc, curr) => acc + (curr.likes || 0), 0);

            return (
              <Link
                key={album.id}
                href={`/mediatheque/${album.id}`}
                className="card overflow-hidden bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-blue-500/70 dark:hover:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-xl group flex flex-col justify-between rounded-3xl cursor-pointer"
              >
                <div>
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                    <img
                      src={album.coverImage}
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30" />

                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md ${catInfo.badgeClass}`}>
                        {catInfo.label}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-black/70 text-white backdrop-blur-md flex items-center gap-1.5 border border-white/20">
                        <Camera className="w-3 h-3 text-white" />
                        <span>{imageCount}</span>
                        {videoCount > 0 && (
                          <>
                            <span className="opacity-40">&bull;</span>
                            <Video className="w-3 h-3 text-pink-400" />
                            <span>{videoCount}</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white space-y-0.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono opacity-90">
                        <Calendar className="w-3 h-3 text-blue-400" />
                        <span>{album.date}</span>
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition font-display line-clamp-1">
                        {album.title}
                      </h3>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                      {album.description}
                    </p>
                    {album.location && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                        <span className="truncate">{album.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-black/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
                    <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    <span>{totalLikes} likes</span>
                  </div>

                  <span className="px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-1 border border-blue-200 dark:border-blue-500/30 group-hover:bg-blue-600 group-hover:text-white transition">
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Consulter le Dossier ({album.media.length})</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
