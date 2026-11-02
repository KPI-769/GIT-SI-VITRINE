'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import AppHeader from '@/components/AppHeader';
import { Camera, Folder, Sparkles, ArrowRight, BookOpen } from 'lucide-react';

export default function MediaHubPage() {
  const { isInitialized, currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized) {
      if (currentUser?.role === 'COMMUNITY_MANAGER') {
        router.replace('/community-manager');
      }
    }
  }, [isInitialized, currentUser, router]);

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: 'var(--surface-1)' }}>
      <AppHeader />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 flex flex-col items-center justify-center space-y-8 anim-fade-in text-center">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Pôle Multimédia &bull; Division Génie Infotronique</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-display">
            Portail Multimédia &amp; Galerie
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            La Division GIT dispose de deux espaces dédiés pour la gestion et la consultation des contenus audiovisuels. Choisissez votre destination :
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left">
          {/* Option 1: Médiathèque Publique */}
          <Link
            href="/mediatheque"
            className="card p-6 sm:p-7 bg-white border border-slate-200 hover:border-blue-400 hover:shadow-lg transition space-y-4 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center group-hover:scale-105 transition">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 font-display group-hover:text-blue-600 transition">
                Médiathèque Publique
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Consultation libre de tous les albums photos et vidéos classés par événement (Hackathons, Assemblées, Cérémonies). Accessible à tous les membres et visiteurs.
              </p>
            </div>
            <div className="text-xs font-bold text-blue-600 flex items-center gap-1.5 pt-3 border-t border-slate-100">
              <span>Consulter les albums</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Option 2: Gestion des Médias */}
          <Link
            href="/community-manager"
            className="card p-6 sm:p-7 bg-white border border-slate-200 hover:border-pink-400 hover:shadow-lg transition space-y-4 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 border border-pink-200 flex items-center justify-center group-hover:scale-105 transition">
                <Camera className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 font-display group-hover:text-pink-600 transition">
                Gestion des Médias (Modération)
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Panneau d&apos;administration réservé au Community Manager et au Bureau pour créer des dossiers d&apos;événements, téléverser des photos en masse et modérer la galerie.
              </p>
            </div>
            <div className="text-xs font-bold text-pink-600 flex items-center gap-1.5 pt-3 border-t border-slate-100">
              <span>Panneau de Contrôle &amp; Upload</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
