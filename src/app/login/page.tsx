'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  Home,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';

export default function LoginPage() {
  const { currentUser, login, requestPasswordReset } = useAuth();
  const router = useRouter();
  const [identifiant, setIdentifiant] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirection automatique si déjà connecté
  useEffect(() => {
    if (currentUser) {
      switch (currentUser.role) {
        case 'ADMIN':
          router.push('/admin');
          break;
        case 'TREASURER':
          router.push('/tresorier');
          break;
        case 'CENSEUR':
          router.push('/censeur');
          break;
        case 'LAB_MANAGER':
          router.push('/labo');
          break;
        case 'COMMUNITY_MANAGER':
          router.push('/community-manager');
          break;
        case 'COMMUNICATION':
          router.push('/evenements-admin');
          break;
        case 'FORMATION':
          router.push('/formations-admin');
          break;
        case 'CONSEILLER':
        case 'MEMBER':
        default:
          router.push('/espace-membre');
          break;
      }
    }
  }, [currentUser, router]);

  // Modal de demande de réinitialisation
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetMatriculeOrEmail, setResetMatriculeOrEmail] = useState('');
  const [resetReason, setResetReason] = useState('');
  const [resetMsg, setResetMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifiant.trim()) {
      setErrorMsg('Veuillez renseigner votre matricule ou email.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg("Veuillez renseigner votre mot de passe (mot de passe initial par défaut : git2026).");
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    const res = await login(identifiant.trim(), password.trim());

    if (res.success) {
      setIsSuccess(true);
      // La redirection est déjà initiée par AuthContext via window.location.href
    } else {
      setIsLoading(false);
      setErrorMsg(res.message || 'Échec de connexion.');
    }
  };


  const handleSendResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetMatriculeOrEmail.trim()) {
      setResetMsg({ type: 'error', text: 'Veuillez saisir votre matricule ou adresse email.' });
      return;
    }

    setIsSubmittingReset(true);
    setResetMsg(null);
    const res = await requestPasswordReset(resetMatriculeOrEmail.trim(), resetReason.trim());
    setIsSubmittingReset(false);

    if (res.success) {
      setResetMsg({ type: 'success', text: res.message });
      setTimeout(() => {
        setIsResetModalOpen(false);
        setResetMsg(null);
        setResetMatriculeOrEmail('');
        setResetReason('');
      }, 3000);
    } else {
      setResetMsg({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden" style={{ background: 'var(--surface-1)' }}>
      {/* Accent top line */}
      <div className="accent-bar fixed top-0 left-0 right-0 z-30" />

      {/* Bouton retour site vitrine */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-[#0B3D91] rounded-xl text-xs font-semibold border border-slate-200 transition shadow-xs"
        >
          <Home className="w-4 h-4 text-[#0B3D91]" />
          Retour au Site Vitrine
        </Link>
      </div>

      <div className="w-full max-w-md relative z-10 anim-fade-up">
        {/* Logo Officiel et Titre */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-3 p-1 rounded-2xl bg-white shadow-md border border-slate-200">
            <div className="w-20 h-20 relative rounded-xl overflow-hidden bg-white flex items-center justify-center p-1">
              <Image
                src="/logo.jpg"
                alt="Logo Division Génie Infotronique"
                width={80}
                height={80}
                className="object-contain"
                priority
              />
            </div>
          </div>

          <span className="section-label block">Portail Sécurisé Infotronique</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">
            DIVISION GÉNIE INFOTRONIQUE
          </h1>
          <p className="text-xs text-[#0B3D91] font-bold tracking-wider uppercase mt-1">
            Gestion des Membres, Accès Labo & Trésorerie
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Conforme au Cahier des Charges <strong className="text-slate-700">GIT-CDC-2026-001</strong>
          </p>
        </div>

        {/* Boîte de Connexion */}
        <div className="card p-8 space-y-6 shadow-lg border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 pill-red rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Matricule ou Email institutionnel
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Ex: GIT-ADMIN ou admin.git@saintjerome.cm"
                  value={identifiant}
                  onChange={(e) => setIdentifiant(e.target.value)}
                  className="input-nasa pl-10 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-nasa pl-10 pr-10 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(true)}
                  className="text-[11px] text-[#0B3D91] hover:underline font-semibold cursor-pointer"
                >
                  Mot de passe oublié ? Demander une réinitialisation au Bureau
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="btn-nasa w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {isSuccess ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Connexion validée ! Redirection...</span>
                </span>
              ) : isLoading ? (
                <span>Connexion sécurisée en cours...</span>
              ) : (
                <>
                  <span>Accéder à mon tableau de bord</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Modal de demande de réinitialisation formulée par l'étudiant */}
        {isResetModalOpen && (
          <div className="modal-backdrop">
            <div className="modal-card p-6 space-y-4 max-w-md bg-white border border-slate-300 text-slate-900">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#0B3D91] flex items-center justify-center">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-display">Demande de Réinitialisation</h3>
                    <p className="text-[11px] text-slate-500">Transmise au Bureau de la Division GIT</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                >
                  <Home className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed">
                <strong>Règle de sécurité :</strong> L&apos;administrateur ne peut réinitialiser un compte que sur demande formelle de l&apos;étudiant. Votre demande sera consignée pour vérification.
              </div>

              <form onSubmit={handleSendResetRequest} className="space-y-3">
                {resetMsg && (
                  <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${resetMsg.type === 'success' ? 'pill-green' : 'pill-red'}`}>
                    {resetMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" /> : <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />}
                    <span className="font-semibold text-slate-900">{resetMsg.text}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Matricule ou Email *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: SJP-GI-001 ou votre email"
                    value={resetMatriculeOrEmail}
                    onChange={(e) => setResetMatriculeOrEmail(e.target.value)}
                    className="input-nasa text-xs text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Motif ou Précision
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Oubli du mot de passe / Première connexion bloquée"
                    value={resetReason}
                    onChange={(e) => setResetReason(e.target.value)}
                    className="input-nasa text-xs text-slate-900"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsResetModalOpen(false)}
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReset}
                    className="btn-nasa flex-1 py-2 px-3 text-xs font-bold cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isSubmittingReset ? 'Envoi...' : 'Transmettre au Bureau'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Note de sécurité */}
        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
          <span>Contrôle cryptographique JWT tournant conforme norme CDC</span>
        </div>
      </div>
    </div>
  );
}

