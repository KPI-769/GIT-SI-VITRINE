'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Folder,
  FolderOpen,
  Camera,
  Video,
  Heart,
  Calendar,
  MapPin,
  Search,
  ChevronRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { EventAlbum, GalleryCategory } from '@/lib/types';
import {
  loadEventAlbums,
  GALLERY_CATEGORY_LABELS,
} from '@/lib/gallery-store';

export default function MediathequeSection() {
  const [albums, setAlbums] = useState<EventAlbum[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('TOUS');
  const [searchQuery, setSearchQuery] = useState('');

  const refreshAlbums = async () => {
    const loaded = await loadEventAlbums();
    setAlbums(loaded);
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
    <section id="mediatheque" className="py-16 sm:py-24 bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 relative overflow-hidden transition-colors duration-200 w-full max-w-full">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-8 sm:space-y-12 relative z-10 w-full">
        
        {/* En-tête de la Médiathèque */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider">
              <Folder className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Archives Visuelles &amp; Mémoire Vivante GIT</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight font-display text-slate-900 dark:text-white">
              Médiathèque des Événements &amp; Ateliers
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Consultez les reportages officiels de chaque événement. Cliquez sur un dossier pour ouvrir sa <strong>page de consultation dédiée</strong> et voir l&apos;intégralité des clichés haute définition.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/mediatheque"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-sm transition cursor-pointer"
            >
              <span>Explorer toute la Médiathèque</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Barre de recherche et catégories - Défilement tactile fluide */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Rechercher un dossier ou événement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-nasa pl-9 text-xs text-slate-900 dark:text-white w-full bg-white dark:bg-[#111827]"
            />
          </div>

          {/* Filtres Catégories avec défilement tactile sur mobile */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar w-full md:w-auto">
            {categories.map((cat) => {
              const label = cat === 'TOUS' ? 'Tous les Dossiers' : GALLERY_CATEGORY_LABELS[cat as GalleryCategory]?.label || cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-mono font-bold transition shrink-0 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grille des Dossiers - Redirection propre vers la page dédiée de consultation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                className="cyber-panel overflow-hidden bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-blue-500/70 dark:hover:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-xl group flex flex-col justify-between rounded-2xl sm:rounded-3xl cursor-pointer"
              >
                <div>
                  {/* Image de couverture du dossier */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                    <img
                      src={album.coverImage}
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30" />

                    <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold border backdrop-blur-md ${catInfo.badgeClass}`}>
                        {catInfo.label}
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 flex items-center gap-1.5">
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

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3 sm:left-3 sm:right-3 text-white space-y-0.5">
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono opacity-90">
                        <Calendar className="w-3 h-3 text-blue-400" />
                        <span>{album.date}</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-300 transition font-display line-clamp-1">
                        {album.title}
                      </h3>
                    </div>
                  </div>

                  <div className="p-3.5 sm:p-5 space-y-2">
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

                <div className="p-3 sm:p-4 bg-slate-50 dark:bg-black/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold text-xs">
                    <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    <span>{totalLikes} likes</span>
                  </div>

                  <span className="px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-1.5 border border-blue-200 dark:border-blue-500/30 group-hover:bg-blue-600 group-hover:text-white transition">
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Consulter ({album.media.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
