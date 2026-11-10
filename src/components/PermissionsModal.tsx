'use client';

import React, { useState, useEffect } from 'react';
import {
  Camera,
  Mic,
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sparkles,
  X,
  Volume2,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { playSuccessTone } from '@/lib/store';

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredFor?: 'camera' | 'audio' | 'all';
}

export default function PermissionsModal({
  isOpen,
  onClose,
  requiredFor = 'all',
}: PermissionsModalProps) {
  const [cameraStatus, setCameraStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [micStatus, setMicStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [notifStatus, setNotifStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isRequesting, setIsRequesting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Vérifier l'état actuel des permissions dans le navigateur
  const checkPermissions = async () => {
    if (typeof window === 'undefined') return;

    // 1. Caméra
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const camQuery = await navigator.permissions.query({ name: 'camera' });
        setCameraStatus(camQuery.state as 'prompt' | 'granted' | 'denied');
        camQuery.onchange = () => {
          setCameraStatus(camQuery.state as 'prompt' | 'granted' | 'denied');
        };
      }
    } catch {}

    // 2. Microphone / Audio
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const micQuery = await navigator.permissions.query({ name: 'microphone' });
        setMicStatus(micQuery.state as 'prompt' | 'granted' | 'denied');
        micQuery.onchange = () => {
          setMicStatus(micQuery.state as 'prompt' | 'granted' | 'denied');
        };
      }
    } catch {}

    // 3. Notifications
    try {
      if ('Notification' in window) {
        if (Notification.permission === 'granted') setNotifStatus('granted');
        else if (Notification.permission === 'denied') setNotifStatus('denied');
        else setNotifStatus('prompt');
      }
    } catch {}
  };

  useEffect(() => {
    if (isOpen) {
      checkPermissions();
    }
  }, [isOpen]);

  // Demande d'accès Caméra
  const requestCamera = async () => {
    setIsRequesting(true);
    setFeedback(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        // Libération immédiate après confirmation
        stream.getTracks().forEach((track) => track.stop());
        setCameraStatus('granted');
        setFeedback('✅ Accès à la caméra autorisé !');
        playSuccessTone();
      } else {
        setCameraStatus('denied');
        setFeedback('Votre navigateur ne prend pas en charge l\'accès caméra.');
      }
    } catch (err: unknown) {
      setCameraStatus('denied');
      setFeedback('Accès caméra refusé. Modifiez les autorisations dans les paramètres de votre navigateur.');
    } finally {
      setIsRequesting(false);
    }
  };

  // Demande d'accès Audio / Microphone
  const requestAudio = async () => {
    setIsRequesting(true);
    setFeedback(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        setMicStatus('granted');
        setFeedback('✅ Accès audio autorisé avec succès !');
        playSuccessTone();
      }
    } catch {
      setMicStatus('denied');
      setFeedback('Accès microphone refusé.');
    } finally {
      setIsRequesting(false);
    }
  };

  // Demande d'accès Notifications
  const requestNotification = async () => {
    if (!('Notification' in window)) {
      setFeedback('Les notifications ne sont pas supportées sur cet appareil.');
      return;
    }
    try {
      const res = await Notification.requestPermission();
      if (res === 'granted') {
        setNotifStatus('granted');
        setFeedback('✅ Notifications PWA activées !');
        playSuccessTone();
      } else {
        setNotifStatus('denied');
        setFeedback('Notifications refusées.');
      }
    } catch {
      setNotifStatus('denied');
    }
  };

  // Tout autoriser en un clic
  const requestAll = async () => {
    setIsRequesting(true);
    setFeedback(null);
    try {
      // 1. Caméra & Audio conjointement
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          stream.getTracks().forEach((t) => t.stop());
          setCameraStatus('granted');
          setMicStatus('granted');
        } catch {
          // Essai individuel si l'un échoue
          await requestCamera();
        }
      }

      // 2. Notification
      if ('Notification' in window) {
        try {
          const notif = await Notification.requestPermission();
          if (notif === 'granted') setNotifStatus('granted');
        } catch {}
      }

      playSuccessTone();
      setFeedback('✅ Vérification des autorisations terminée.');
    } catch (err) {
      setFeedback('Une ou plusieurs autorisations nécessitent un déblocage manuel.');
    } finally {
      setIsRequesting(false);
    }
  };

  if (!isOpen) return null;

  const renderBadge = (status: 'prompt' | 'granted' | 'denied') => {
    if (status === 'granted') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300">
          <CheckCircle className="w-3 h-3" /> Accordé
        </span>
      );
    }
    if (status === 'denied') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-300">
          <XCircle className="w-3 h-3" /> Bloqué
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-300">
        <AlertTriangle className="w-3 h-3" /> En attente
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-[#111827] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 text-slate-900 dark:text-white">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black font-display text-slate-900 dark:text-white">
                Autorisations PWA &amp; Périphériques
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Division GIT-SJD · Contrôle des fonctionnalités
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message explicatif */}
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Pour offrir l&apos;expérience d&apos;une application mobile fluide (scan des QR codes de présence, retours sonores et notifications d&apos;urgence), la plateforme a besoin des autorisations suivantes :
        </p>

        {/* Feedback message */}
        {feedback && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Liste des permissions */}
        <div className="space-y-2.5">
          {/* 1. Caméra */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#161F30] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                <Camera className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">Caméra Vidéo</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Scan des badges QR &amp; photos d&apos;événements</div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {renderBadge(cameraStatus)}
              {cameraStatus !== 'granted' && (
                <button
                  onClick={requestCamera}
                  disabled={isRequesting}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
                >
                  Activer
                </button>
              )}
            </div>
          </div>

          {/* 2. Audio & Bips Sonores */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#161F30] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <Volume2 className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">Audio &amp; Sons</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Bips de confirmation d&apos;accès et validation</div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {renderBadge(micStatus)}
              {micStatus !== 'granted' && (
                <button
                  onClick={requestAudio}
                  disabled={isRequesting}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
                >
                  Activer
                </button>
              )}
            </div>
          </div>

          {/* 3. Notifications */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#161F30] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
                <Bell className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">Notifications PWA</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Rappels de cotisations et annonces officielles</div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {renderBadge(notifStatus)}
              {notifStatus !== 'granted' && (
                <button
                  onClick={requestNotification}
                  disabled={isRequesting}
                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
                >
                  Activer
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Boutons d'action globaux */}
        <div className="flex items-center gap-2.5 pt-2">
          <button
            onClick={requestAll}
            disabled={isRequesting}
            className="btn-nasa flex-1 py-3 text-xs font-bold cursor-pointer shadow-md flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Tout autoriser en un clic</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
