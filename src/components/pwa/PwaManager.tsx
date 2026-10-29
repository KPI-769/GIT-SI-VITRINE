'use client';

import React, { useEffect, useState } from 'react';
import { Download, X, WifiOff, CheckCircle2, Smartphone, ShieldCheck } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function PwaManager() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  useEffect(() => {
    // 1. Enregistrement du Service Worker PWA
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            // Vérification périodique des mises à jour du cache
            reg.addEventListener('updatefound', () => {
              const newWorker = reg.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.info('[PWA] Nouvelle version prête');
                  }
                });
              }
            });
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker indisponible:', err);
          });
      });
    }

    // 2. Détection si l'application est déjà lancée en mode PWA autonome
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // 3. Écoute de l'événement d'installation natif du navigateur
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      // Vérifier si l'utilisateur a fermé la bannière récemment (7 jours de tranquillité)
      const dismissedUntil = localStorage.getItem('git_pwa_dismissed_until');
      const now = Date.now();
      if (!dismissedUntil || now > parseInt(dismissedUntil, 10)) {
        setShowBanner(true);
      }
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowBanner(false);
      setIsInstalled(true);
      setJustInstalled(true);
      setTimeout(() => setJustInstalled(false), 5000);
    };

    // 4. Détection du statut réseau en direct
    const updateOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    updateOnlineStatus();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } catch (e) {
      console.warn('[PWA] Erreur lors du prompt d\'installation:', e);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Masquer pour 7 jours
    const in7Days = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem('git_pwa_dismissed_until', in7Days.toString());
  };

  return (
    <>
      {/* ─── Toast Alerte Hors-Ligne ─── */}
      {isOffline && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2 bg-amber-950/90 text-amber-200 border border-amber-600/40 rounded-full shadow-lg backdrop-blur-md text-xs font-mono font-medium animate-fadeIn"
        >
          <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Mode hors connexion actif · Cache local engagé</span>
        </div>
      )}

      {/* ─── Notification de confirmation d'installation ─── */}
      {justInstalled && (
        <div
          role="status"
          className="fixed bottom-20 right-4 z-50 flex items-center gap-3 px-4 py-3 bg-[#0B3D91] text-white rounded-2xl shadow-xl border border-blue-400/30 text-xs font-medium animate-scaleIn"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Application GIT installée sur votre appareil !</span>
        </div>
      )}

      {/* ─── Bannière d'Installation PWA (Non-intrusive) ─── */}
      {showBanner && !isInstalled && deferredPrompt && (
        <aside
          aria-label="Installation de l'application"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-40 bg-white/95 dark:bg-[#0D1629]/95 backdrop-blur-xl border border-slate-200 dark:border-blue-900/40 rounded-2xl p-4 shadow-2xl transition-all duration-200"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0B3D91] flex items-center justify-center text-white shrink-0 shadow-md">
                <Smartphone className="w-5 h-5 text-blue-200" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                  Installer l'App GIT SJP
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                  Accès instantané 1-clic, carte QR d'accès au labo et consultation hors-ligne.
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              aria-label="Fermer la suggestion d'installation"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleInstallClick}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-[#0B3D91] hover:bg-blue-800 active:scale-[0.98] text-white rounded-xl text-xs font-bold font-mono shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Installer l'application</span>
            </button>
            <button
              onClick={handleDismiss}
              className="py-2 px-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold font-mono transition"
            >
              Plus tard
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
