'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { User, EventAlbum, EventMediaItem, GalleryCategory } from '@/lib/types';
import {
  loadEventAlbums,
  saveEventAlbums,
  saveOneAlbum,
  removeAlbum,
  GALLERY_CATEGORY_LABELS,
} from '@/lib/gallery-store';
import { readFileAsDataUrl, readMultipleFilesAsDataUrls, UploadedMediaItem } from '@/lib/image-uploader';
import { playSuccessTone, playErrorTone } from '@/lib/store';
import {
  Folder,
  FolderPlus,
  FolderOpen,
  Camera,
  Video,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  MapPin,
  Heart,
  Upload,
  Sparkles,
  Search,
  CheckCircle,
  X,
  Maximize2,
  ArrowLeft,
  Play,
  Layers,
  FileText,
  Eye,
  Check,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  ImageIcon,
  Loader2
} from 'lucide-react';

interface CommunityManagerViewProps {
  currentUser: User | null;
}

export default function CommunityManagerView({ currentUser }: CommunityManagerViewProps) {
  const [albums, setAlbums] = useState<EventAlbum[]>([]);
  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('TOUS');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal Création / Édition de Dossier
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<EventAlbum | null>(null);
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumDescription, setAlbumDescription] = useState('');
  const [albumCategory, setAlbumCategory] = useState<GalleryCategory>('HACKATHON');
  const [albumDate, setAlbumDate] = useState(new Date().toISOString().slice(0, 10));
  const [albumLocation, setAlbumLocation] = useState('Saint Jérôme Polytechnique');
  const [albumCoverDataUrl, setAlbumCoverDataUrl] = useState<string>('');
  const [albumError, setAlbumError] = useState('');
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Modal Upload Multiple de Médias dans un Dossier
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTargetAlbumId, setUploadTargetAlbumId] = useState<string>('');
  const [stagedFiles, setStagedFiles] = useState<UploadedMediaItem[]>([]);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Lightbox plein écran
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadEventAlbums().then((loaded) => setAlbums(loaded));
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const activeAlbum = useMemo(() => {
    return albums.find((a) => a.id === activeAlbumId) || null;
  }, [albums, activeAlbumId]);

  // Statistiques
  const stats = useMemo(() => {
    const totalAlbums = albums.length;
    let totalImages = 0;
    let totalVideos = 0;
    let totalLikes = 0;
    albums.forEach((a) => {
      a.media.forEach((m) => {
        if (m.type === 'IMAGE') totalImages++;
        if (m.type === 'VIDEO') totalVideos++;
        totalLikes += m.likes || 0;
      });
    });
    return { totalAlbums, totalImages, totalVideos, totalLikes };
  }, [albums]);

  // Ouverture du modal création d'album
  const handleOpenCreateAlbum = () => {
    setEditingAlbum(null);
    setAlbumTitle('');
    setAlbumDescription('');
    setAlbumCategory('HACKATHON');
    setAlbumDate(new Date().toISOString().slice(0, 10));
    setAlbumLocation('Laboratoire & Campus SJP');
    setAlbumCoverDataUrl('');
    setAlbumError('');
    setIsAlbumModalOpen(true);
  };

  // Ouverture du modal édition d'album
  const handleOpenEditAlbum = (album: EventAlbum, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAlbum(album);
    setAlbumTitle(album.title);
    setAlbumDescription(album.description);
    setAlbumCategory(album.category);
    setAlbumDate(album.date);
    setAlbumLocation(album.location || 'Saint Jérôme Polytechnique');
    setAlbumCoverDataUrl(album.coverImage);
    setAlbumError('');
    setIsAlbumModalOpen(true);
  };

  // Upload du fichier de couverture d'album
  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingCover(true);
      const uploaded = await readFileAsDataUrl(file);
      setAlbumCoverDataUrl(uploaded.url);
      setAlbumError('');
      playSuccessTone();
    } catch (err) {
      console.error('Erreur lecture image de couverture:', err);
      setAlbumError('Impossible de charger cette image. Veuillez réessayer.');
      playErrorTone();
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Sauvegarde d'album (création ou édition)
  const handleSaveAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    setAlbumError('');

    if (!albumTitle.trim()) {
      setAlbumError('Veuillez renseigner le nom de l\'événement.');
      playErrorTone();
      return;
    }

    if (!albumCoverDataUrl) {
      setAlbumError('Veuillez uploader une photo de couverture pour ce dossier.');
      playErrorTone();
      return;
    }

    if (editingAlbum) {
      const updated = albums.map((alb) => {
        if (alb.id === editingAlbum.id) {
          return {
            ...alb,
            title: albumTitle.trim(),
            description: albumDescription.trim(),
            category: albumCategory,
            date: albumDate,
            location: albumLocation.trim(),
            coverImage: albumCoverDataUrl,
          };
        }
        return alb;
      });
      setAlbums(updated);
      saveEventAlbums(updated);
      playSuccessTone();
      showToast('Dossier d\'événement mis à jour avec succès !');
      setIsAlbumModalOpen(false);
    } else {
      const newAlbum: EventAlbum = {
        id: `album_${Date.now()}`,
        title: albumTitle.trim(),
        description: albumDescription.trim(),
        category: albumCategory,
        date: albumDate,
        location: albumLocation.trim(),
        coverImage: albumCoverDataUrl,
        uploadedBy: currentUser ? `${currentUser.prenom} ${currentUser.nom} (${currentUser.matricule})` : 'KOUOH ETEKI Freddy (GIT-BUR-17)',
        featured: true,
        status: 'PUBLISHED',
        createdAt: new Date().toISOString(),
        media: [
          // La photo de couverture devient le 1er média de l'album
          {
            id: `med_${Date.now()}_cover`,
            type: 'IMAGE',
            url: albumCoverDataUrl,
            caption: `Photo de couverture - ${albumTitle.trim()}`,
            likes: 0,
            uploadedAt: new Date().toISOString(),
          },
        ],
      };

      const updated = [newAlbum, ...albums];
      setAlbums(updated);
      saveOneAlbum(newAlbum);
      playSuccessTone();
      showToast(`Dossier "${newAlbum.title}" créé avec succès !`);
      setIsAlbumModalOpen(false);
      setActiveAlbumId(newAlbum.id); // Ouvre le dossier créé pour permettre l'upload des photos
    }
  };

  // Suppression d'un dossier
  const handleDeleteAlbum = (albumId: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Supprimer définitivement le dossier "${title}" et tous ses médias associés ?`)) return;

    const updated = albums.filter((a) => a.id !== albumId);
    setAlbums(updated);
    removeAlbum(albumId);
    if (activeAlbumId === albumId) setActiveAlbumId(null);
    showToast('Dossier supprimé.');
  };

  // Ouverture du modal d'upload multiple de médias
  const handleOpenUploadModal = (albumId: string) => {
    setUploadTargetAlbumId(albumId);
    setStagedFiles([]);
    setUploadError('');
    setIsUploadModalOpen(true);
  };

  // Gestion de la sélection multiple de fichiers depuis l'appareil
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsProcessingFiles(true);
      setUploadError('');
      const processed = await readMultipleFilesAsDataUrls(files);
      setStagedFiles((prev) => [...prev, ...processed]);
      playSuccessTone();
    } catch (err) {
      console.error('Erreur traitement fichiers:', err);
      setUploadError('Erreur lors du traitement des fichiers.');
      playErrorTone();
    } finally {
      setIsProcessingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Suppression d'un fichier de la liste temporaire
  const handleRemoveStagedFile = (index: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Validation finale de l'upload multiple dans l'album
  const handleConfirmUpload = () => {
    if (stagedFiles.length === 0) {
      setUploadError('Veuillez sélectionner au moins une image ou vidéo à uploader.');
      playErrorTone();
      return;
    }

    const newMediaItems: EventMediaItem[] = stagedFiles.map((item) => ({
      id: item.id,
      type: item.type,
      url: item.url,
      caption: item.caption || item.name,
      likes: 0,
      uploadedAt: new Date().toISOString(),
    }));

    const updatedAlbums = albums.map((alb) => {
      if (alb.id === uploadTargetAlbumId) {
        return {
          ...alb,
          media: [...alb.media, ...newMediaItems],
        };
      }
      return alb;
    });

    setAlbums(updatedAlbums);
    saveEventAlbums(updatedAlbums);
    playSuccessTone();
    showToast(`✅ ${newMediaItems.length} médias uploadés avec succès dans le dossier !`);
    setIsUploadModalOpen(false);
    setStagedFiles([]);
  };

  // Suppression d'un média à l'intérieur d'un album
  const handleDeleteMedia = (albumId: string, mediaId: string) => {
    if (!confirm('Supprimer ce média du dossier ?')) return;

    const updatedAlbums = albums.map((alb) => {
      if (alb.id === albumId) {
        return {
          ...alb,
          media: alb.media.filter((m) => m.id !== mediaId),
        };
      }
      return alb;
    });

    setAlbums(updatedAlbums);
    saveEventAlbums(updatedAlbums);
    showToast('Média retiré du dossier.');
  };

  // Définir comme photo de couverture
  const handleSetAsCover = (albumId: string, mediaUrl: string) => {
    const updatedAlbums = albums.map((alb) => {
      if (alb.id === albumId) {
        return { ...alb, coverImage: mediaUrl };
      }
      return alb;
    });
    setAlbums(updatedAlbums);
    saveEventAlbums(updatedAlbums);
    playSuccessTone();
    showToast('Couverture du dossier mise à jour.');
  };

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

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 p-3.5 sm:p-4 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 anim-slide-in max-w-sm">
          <CheckCircle className="w-5 h-5 text-[#16A34A] shrink-0" />
          <span className="text-xs font-bold leading-tight">{toastMessage}</span>
        </div>
      )}

      {/* En-tête Community Manager - 100% Responsive */}
      <div className="card p-4 sm:p-6 bg-gradient-to-r from-pink-500/10 via-purple-500/5 to-blue-500/10 border border-pink-200/60 rounded-2xl sm:rounded-3xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-5">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-pink-600 text-white shadow-xs inline-flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5" />
                <span>Médiathèque &amp; Albums Événements</span>
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-white text-slate-700 border border-slate-300">
                CM : KOUOH ETEKI Freddy (GIT-BUR-17)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 font-display">
              Gestionnaire des Dossiers &amp; Upload de Médias
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
              Uploadez vos photos et vidéos directement depuis votre appareil (téléphone ou ordinateur). Les médias sont organisés par événement et disponibles pour consultation et likes publics.
            </p>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <button
              onClick={handleOpenCreateAlbum}
              className="w-full md:w-auto px-4 sm:px-5 py-2.5 sm:py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Créer un Dossier d&apos;Événement</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cartes d'indicateurs statistiques - 100% Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="card p-3 sm:p-4 bg-white border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Dossiers</span>
          <p className="text-lg sm:text-2xl font-black text-slate-900 mt-0.5">{stats.totalAlbums} <span className="text-xs font-medium text-slate-500">albums</span></p>
        </div>
        <div className="card p-3 sm:p-4 bg-blue-50/70 border border-blue-200">
          <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Photos Uploadées</span>
          <p className="text-lg sm:text-2xl font-black text-blue-900 mt-0.5">{stats.totalImages} <span className="text-xs font-medium text-blue-700">photos</span></p>
        </div>
        <div className="card p-3 sm:p-4 bg-purple-50/70 border border-purple-200">
          <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">Vidéos</span>
          <p className="text-lg sm:text-2xl font-black text-purple-900 mt-0.5">{stats.totalVideos} <span className="text-xs font-medium text-purple-700">vidéos</span></p>
        </div>
        <div className="card p-3 sm:p-4 bg-rose-50/70 border border-rose-200">
          <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">Total Likes</span>
          <p className="text-lg sm:text-2xl font-black text-rose-900 mt-0.5">{stats.totalLikes} <span className="text-xs font-medium text-rose-700">réactions</span></p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SI AUCUN DOSSIER OUVERT : VUE LISTE DES DOSSIERS
         ═══════════════════════════════════════════════════════════════ */}
      {!activeAlbum ? (
        <div className="space-y-4 sm:space-y-6">
          {/* Barre de filtres et recherche */}
          <div className="card p-3 sm:p-4 bg-white border border-slate-300 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Rechercher un dossier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-nasa pl-9 text-xs text-slate-900 w-full"
              />
            </div>

            {/* Scroll horizontal sur mobile pour éviter de casser la page */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar w-full md:w-auto">
              <button
                onClick={() => setSelectedCategory('TOUS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                  selectedCategory === 'TOUS' ? 'bg-slate-900 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Tous ({albums.length})
              </button>
              {(Object.keys(GALLERY_CATEGORY_LABELS) as GalleryCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                    selectedCategory === cat ? 'bg-pink-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {GALLERY_CATEGORY_LABELS[cat].label}
                </button>
              ))}
            </div>
          </div>

          {/* Grille des Cartes de Dossiers - 100% Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredAlbums.map((album) => {
              const catInfo = GALLERY_CATEGORY_LABELS[album.category] || {
                label: album.category,
                badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
              };
              const imgCount = album.media.filter((m) => m.type === 'IMAGE').length;
              const vidCount = album.media.filter((m) => m.type === 'VIDEO').length;
              const albumLikes = album.media.reduce((acc, curr) => acc + (curr.likes || 0), 0);

              return (
                <div
                  key={album.id}
                  onClick={() => setActiveAlbumId(album.id)}
                  className="card overflow-hidden bg-white border border-slate-200 hover:border-pink-400 transition-all duration-300 shadow-sm hover:shadow-xl rounded-2xl sm:rounded-3xl flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    {/* Image Couverture */}
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                      <img
                        src={album.coverImage}
                        alt={album.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

                      <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3">
                        <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold border backdrop-blur-md ${catInfo.badgeClass}`}>
                          {catInfo.label}
                        </span>
                      </div>

                      <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-mono font-bold bg-black/70 text-white backdrop-blur-md flex items-center gap-1.5 border border-white/20">
                          <Camera className="w-3 h-3" />
                          <span>{imgCount}</span>
                          {vidCount > 0 && (
                            <>
                              <span>&bull;</span>
                              <Video className="w-3 h-3 text-pink-400" />
                              <span>{vidCount}</span>
                            </>
                          )}
                        </span>
                      </div>

                      <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3 sm:left-3 sm:right-3 text-white space-y-0.5">
                        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono opacity-90">
                          <Calendar className="w-3 h-3 text-pink-400" />
                          <span>{album.date}</span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-pink-300 transition font-display line-clamp-1">
                          {album.title}
                        </h3>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="p-3.5 sm:p-5 space-y-2">
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {album.description}
                      </p>
                      {album.location && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                          <MapPin className="w-3 h-3 text-pink-500 shrink-0" />
                          <span className="truncate">{album.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions du dossier */}
                  <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs">
                      <Heart className="w-3.5 h-3.5 fill-rose-500" />
                      <span>{albumLikes} likes</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleOpenEditAlbum(album, e)}
                        className="p-1.5 sm:p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-300 transition cursor-pointer"
                        title="Modifier"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteAlbum(album.id, album.title, e)}
                        className="p-1.5 sm:p-2 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl border border-slate-300 hover:border-rose-300 transition cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setActiveAlbumId(album.id)}
                        className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Ouvrir</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════════════════
            SI UN DOSSIER EST OUVERT : GESTION DES MÉDIAS DE L'ÉVÉNEMENT
           ═══════════════════════════════════════════════════════════════ */
        <div className="space-y-4 sm:space-y-6 anim-fade-in">
          {/* Barre d'actions supérieure */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              onClick={() => setActiveAlbumId(null)}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-300 transition cursor-pointer shadow-xs w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Retour aux dossiers</span>
            </button>

            <button
              onClick={() => handleOpenUploadModal(activeAlbum.id)}
              className="px-4 sm:px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-md w-full sm:w-fit"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Uploader des Photos / Vidéos (depuis mon appareil)</span>
            </button>
          </div>

          {/* Fiche d'information du Dossier */}
          <div className="card p-4 sm:p-6 bg-white border border-slate-300 rounded-2xl sm:rounded-3xl shadow-sm space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${GALLERY_CATEGORY_LABELS[activeAlbum.category]?.badgeClass || 'bg-blue-100 text-blue-900 border-blue-300'}`}>
                {GALLERY_CATEGORY_LABELS[activeAlbum.category]?.label || activeAlbum.category}
              </span>
              <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{activeAlbum.date}</span>
              </span>
              {activeAlbum.location && (
                <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-pink-500" />
                  <span>{activeAlbum.location}</span>
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-2xl font-black text-slate-900 font-display">
              {activeAlbum.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {activeAlbum.description}
            </p>
            <div className="text-[11px] text-slate-500 font-mono pt-1">
              Médias dans le dossier : <strong>{activeAlbum.media.length}</strong> &bull; Responsable : <strong>{activeAlbum.uploadedBy}</strong>
            </div>
          </div>

          {/* Grille des Médias du Dossier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {activeAlbum.media.map((media, index) => (
              <div
                key={media.id}
                className="card overflow-hidden bg-white border border-slate-200 hover:border-pink-300 transition shadow-xs hover:shadow-lg rounded-2xl sm:rounded-3xl flex flex-col justify-between group"
              >
                <div>
                  <div
                    className="relative aspect-video w-full overflow-hidden bg-slate-950 cursor-pointer"
                    onClick={() => setLightboxIndex(index)}
                  >
                    {media.type === 'VIDEO' ? (
                      <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
                        <video src={media.url} className="w-full h-full object-cover" muted playsInline />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-pink-600 text-white flex items-center justify-center shadow-lg">
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          </div>
                        </div>
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-600 text-white flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          <span>Vidéo</span>
                        </span>
                      </div>
                    ) : (
                      <img
                        src={media.url}
                        alt={media.caption || 'Photo'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    )}

                    <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="p-1.5 rounded-lg bg-black/60 text-white backdrop-blur-md flex items-center gap-1 text-xs">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 space-y-1.5">
                    <p className="text-xs font-semibold text-slate-800 leading-relaxed line-clamp-2">
                      {media.caption || `Cliché officiel - ${activeAlbum.title}`}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1 text-rose-600 font-bold">
                        <Heart className="w-3.5 h-3.5 fill-rose-500" />
                        <span>{media.likes} likes</span>
                      </span>
                      <span>{media.type}</span>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                  {media.type === 'IMAGE' && activeAlbum.coverImage !== media.url && (
                    <button
                      onClick={() => handleSetAsCover(activeAlbum.id, media.url)}
                      className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-300 transition cursor-pointer"
                      title="Définir comme photo de couverture"
                    >
                      Couverture
                    </button>
                  )}
                  {activeAlbum.coverImage === media.url && (
                    <span className="px-2.5 py-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-300 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Couverture</span>
                    </span>
                  )}

                  <button
                    onClick={() => handleDeleteMedia(activeAlbum.id, media.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer ml-auto"
                    title="Supprimer ce média"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODAL 1 : CRÉATION / ÉDITION DE DOSSIER (AVEC UPLOAD DE COUVERTURE)
         ═══════════════════════════════════════════════════════════════ */}
      {isAlbumModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm anim-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-pink-600 flex items-center justify-center">
                  <FolderPlus className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base font-display">
                    {editingAlbum ? 'Modifier le Dossier' : 'Nouveau Dossier d\'Événement'}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400">
                    Regroupe toutes les photos et vidéos de l&apos;événement
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAlbumModalOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAlbum} className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
              {albumError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold">
                  {albumError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nom de l&apos;Événement *</label>
                <input
                  type="text"
                  placeholder="Ex: Hackathon IoT 2026, Ateliers FPGA au Labo..."
                  value={albumTitle}
                  onChange={(e) => setAlbumTitle(e.target.value)}
                  className="input-nasa text-xs text-slate-900 w-full"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Catégorie *</label>
                  <select
                    value={albumCategory}
                    onChange={(e) => setAlbumCategory(e.target.value as GalleryCategory)}
                    className="input-nasa text-xs text-slate-900 w-full cursor-pointer"
                  >
                    {(Object.keys(GALLERY_CATEGORY_LABELS) as GalleryCategory[]).map((cat) => (
                      <option key={cat} value={cat}>
                        {GALLERY_CATEGORY_LABELS[cat].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Date *</label>
                  <input
                    type="date"
                    value={albumDate}
                    onChange={(e) => setAlbumDate(e.target.value)}
                    className="input-nasa text-xs text-slate-900 w-full"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Lieu</label>
                <input
                  type="text"
                  placeholder="Ex: Grand Amphithéâtre, Laboratoire Réseau SJP"
                  value={albumLocation}
                  onChange={(e) => setAlbumLocation(e.target.value)}
                  className="input-nasa text-xs text-slate-900 w-full"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  placeholder="Courte description de l'événement..."
                  value={albumDescription}
                  onChange={(e) => setAlbumDescription(e.target.value)}
                  className="input-nasa text-xs text-slate-900 w-full"
                />
              </div>

              {/* UPLOAD DIRECT DE LA COUVERTURE DEPUIS L'APPAREIL */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Photo de Couverture du Dossier * (Upload depuis l&apos;appareil)
                </label>

                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverFileChange}
                  className="hidden"
                />

                <div
                  onClick={() => coverInputRef.current?.click()}
                  className="p-4 border-2 border-dashed border-pink-300 hover:border-pink-500 rounded-2xl bg-pink-50/50 hover:bg-pink-50 transition cursor-pointer text-center space-y-2"
                >
                  {isUploadingCover ? (
                    <div className="flex items-center justify-center gap-2 py-4 text-pink-600">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-xs font-bold">Chargement de la photo...</span>
                    </div>
                  ) : albumCoverDataUrl ? (
                    <div className="space-y-2">
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-300 bg-slate-900">
                        <img src={albumCoverDataUrl} alt="Couverture" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[11px] text-pink-700 font-bold block">
                        Cliquer pour remplacer la photo de couverture
                      </span>
                    </div>
                  ) : (
                    <div className="py-3 space-y-1">
                      <UploadCloud className="w-8 h-8 text-pink-500 mx-auto" />
                      <p className="text-xs font-bold text-slate-800">
                        Cliquez pour choisir une photo dans votre appareil
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Formats JPG, PNG, WEBP (compression automatique)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAlbumModalOpen(false)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>{editingAlbum ? 'Enregistrer' : 'Créer le Dossier'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODAL 2 : UPLOAD MULTIPLE DE FICHIERS DEPUIS L'APPAREIL
         ═══════════════════════════════════════════════════════════════ */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm anim-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-pink-600 flex items-center justify-center">
                  <UploadCloud className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base font-display">
                    Uploader des Photos / Vidéos
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400">
                    Sélectionnez plusieurs fichiers directement depuis votre appareil
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
              {uploadError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold">
                  {uploadError}
                </div>
              )}

              {/* INPUT FILE MULTIPLE CACHÉ */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFilesSelected}
                className="hidden"
              />

              {/* ZONE DRAG & DROP / CLIC POUR PARCOURIR */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-6 border-2 border-dashed border-pink-300 hover:border-pink-500 rounded-2xl bg-pink-50/50 hover:bg-pink-50 transition cursor-pointer text-center space-y-2"
              >
                {isProcessingFiles ? (
                  <div className="py-6 flex flex-col items-center justify-center gap-2 text-pink-600">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-xs font-bold">Traitement et compression des fichiers...</span>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center mx-auto">
                      <Camera className="w-6 h-6" />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">
                      Cliquez pour choisir des photos et vidéos
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                      Sélectionnez plusieurs fichiers à la fois depuis la galerie de votre téléphone ou de votre PC.
                    </p>
                  </>
                )}
              </div>

              {/* LISTE DES FICHIERS SÉLECTIONNÉS EN VIGNETTES */}
              {stagedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      Fichiers prêts ({stagedFiles.length}) :
                    </span>
                    <button
                      onClick={() => setStagedFiles([])}
                      className="text-rose-600 hover:underline text-[11px] font-bold"
                    >
                      Tout vider
                    </button>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                    {stagedFiles.map((file, idx) => (
                      <div key={file.id} className="relative aspect-square rounded-lg overflow-hidden bg-slate-900 group">
                        {file.type === 'VIDEO' ? (
                          <div className="w-full h-full flex items-center justify-center bg-slate-950 text-white">
                            <Video className="w-5 h-5 text-pink-400" />
                          </div>
                        ) : (
                          <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                        )}

                        <button
                          onClick={() => handleRemoveStagedFile(idx)}
                          className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-full transition"
                          title="Supprimer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmUpload}
                  disabled={stagedFiles.length === 0 || isProcessingFiles}
                  className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>Confirmer l&apos;Upload ({stagedFiles.length})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          LIGHTBOX PLEIN ÉCRAN
         ═══════════════════════════════════════════════════════════════ */}
      {lightboxIndex !== null && activeAlbum && activeAlbum.media[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/95 backdrop-blur-md anim-fade-in"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[92vh] flex flex-col items-center justify-center space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute -top-10 sm:-top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {lightboxIndex > 0 && (
              <button
                onClick={() => setLightboxIndex(lightboxIndex - 1)}
                className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition cursor-pointer z-10"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}

            {lightboxIndex < activeAlbum.media.length - 1 && (
              <button
                onClick={() => setLightboxIndex(lightboxIndex + 1)}
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition cursor-pointer z-10"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}

            {activeAlbum.media[lightboxIndex].type === 'VIDEO' ? (
              <video
                src={activeAlbum.media[lightboxIndex].url}
                className="max-h-[60vh] sm:max-h-[72vh] w-auto max-w-full rounded-2xl shadow-2xl"
                controls
                autoPlay
              />
            ) : (
              <img
                src={activeAlbum.media[lightboxIndex].url}
                alt={activeAlbum.media[lightboxIndex].caption || 'Photo'}
                className="max-h-[60vh] sm:max-h-[72vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl"
              />
            )}

            <div className="text-center text-white space-y-1 max-w-xl px-4">
              <p className="text-xs sm:text-sm font-semibold">
                {activeAlbum.media[lightboxIndex].caption || activeAlbum.title}
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-400">
                {activeAlbum.title} &bull; {activeAlbum.media[lightboxIndex].likes} likes
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
