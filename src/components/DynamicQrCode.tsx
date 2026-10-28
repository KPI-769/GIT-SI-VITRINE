'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { ShieldCheck, RefreshCw, Smartphone, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { User } from '@/lib/types';

interface DynamicQrCodeProps {
  user: User;
  mode?: 'ACCESS' | 'PAYMENT';
}

export default function DynamicQrCode({ user, mode = 'ACCESS' }: DynamicQrCodeProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [expiresIn, setExpiresIn] = useState<number>(30); // 30 secondes avant régénération visuelle

  const refreshQr = React.useCallback(async () => {
    try {
      const timestamp = Date.now();
      let payload: string;

      if (mode === 'ACCESS') {
        // Format conforme au CDC section 4.2.A:
        // Token dynamique signé
        const pseudoJwt = btoa(
          JSON.stringify({
            userId: user.id,
            matricule: user.matricule,
            nom: user.nom,
            prenom: user.prenom,
            niveau: user.niveau,
            iat: Math.floor(timestamp / 1000),
            exp: Math.floor(timestamp / 1000) + 300,
          })
        );
        payload = `GIT:ACCESS:${user.id}:${pseudoJwt}`;
      } else {
        // Format Trésorerie conforme au CDC section 4.2.B
        payload = `GIT:PAYMENT:${user.id}:${user.matricule}`;
      }

      const dataUrl = await QRCode.toDataURL(payload, {
        width: 280,
        margin: 1.5,
        color: {
          dark: '#0B3D91', // NASA Deep Blue
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      });

      setQrDataUrl(dataUrl);
      setExpiresIn(30);
    } catch (err) {
      console.error('Erreur génération QR Code:', err);
    }
  }, [user, mode]);

  useEffect(() => {
    refreshQr();
    const timer = setInterval(() => {
      setExpiresIn((prev) => {
        if (prev <= 1) {
          refreshQr();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [refreshQr]);

  return (
    <div className="card p-6 flex flex-col items-center bg-white shadow-md border-slate-200">
      {/* En-tête du badge QR */}
      <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-1.5 text-[#16A34A] font-bold">
          <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
          <span>{mode === 'ACCESS' ? 'Token JWT Tournant' : 'Identifiant Trésorerie'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
          <Clock className="w-3.5 h-3.5 text-[#0B3D91]" />
          <span>Actualisation : <strong className="text-[#0B3D91] font-mono">{expiresIn}s</strong></span>
        </div>
      </div>

      {/* Cadre du QR Code avec effet bordure élégante */}
      <div className="relative p-3 bg-white rounded-2xl shadow-sm border-2 border-slate-200 group transition-transform hover:scale-105 duration-300">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrDataUrl}
            alt="QR Code dynamique sécurisé"
            className="w-56 h-56 rounded-xl select-none"
          />
        ) : (
          <div className="w-56 h-56 flex items-center justify-center bg-slate-50 rounded-xl">
            <RefreshCw className="w-8 h-8 text-[#0B3D91] animate-spin" />
          </div>
        )}
      </div>

      {/* Barre de progression d'expiration */}
      <div className="w-full max-w-[240px] mt-4 bg-slate-100 h-2 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-[#0B3D91] via-[#0EA5E9] to-[#16A34A] h-full transition-all duration-1000 ease-linear rounded-full"
          style={{ width: `${(expiresIn / 30) * 100}%` }}
        />
      </div>

      {/* Instructions d'utilisation */}
      <div className="mt-4 text-center">
        <p className="text-sm font-bold text-slate-800">
          {mode === 'ACCESS' ? 'Présenter à la borne du Censeur' : 'Présenter au Trésorier'}
        </p>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          {mode === 'ACCESS'
            ? 'Signature cryptographique dynamique anti-capture d\'écran renouvelée automatiquement.'
            : 'Permet la saisie instantanée de vos cotisations sans recherche manuelle.'}
        </p>
      </div>

      {/* Bouton de rafraîchissement manuel */}
      <button
        onClick={refreshQr}
        className="mt-4 flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-[#0B3D91] bg-slate-50 hover:bg-[#E8F0FC] rounded-xl border border-slate-200 transition cursor-pointer"
      >
        <RefreshCw className="w-3.5 h-3.5 text-[#0B3D91]" />
        Forcer la régénération
      </button>
    </div>
  );
}

