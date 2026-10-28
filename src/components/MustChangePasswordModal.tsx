'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  LogOut,
  Sparkles
} from 'lucide-react';

export default function MustChangePasswordModal() {
  const { currentUser, changePassword, logout } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ne pas afficher si aucun utilisateur ou s'il n'a pas besoin de changer son mot de passe
  if (!currentUser || !currentUser.mustChangePassword) {
    return null;
  }

  const isMinLength = newPassword.length >= 6;
  const isDifferentFromDefault = newPassword.length > 0 && newPassword !== 'git2026' && newPassword !== '123456';
  const isMatching = newPassword.length > 0 && newPassword === confirmPassword;
  const isValid = isMinLength && isDifferentFromDefault && isMatching;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!isMinLength) {
      setErrorMessage('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (!isDifferentFromDefault) {
      setErrorMessage('Le nouveau mot de passe doit être différent du mot de passe par défaut.');
      return;
    }

    if (!isMatching) {
      setErrorMessage('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setIsSubmitting(true);
    const res = await changePassword(newPassword);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMessage('Mot de passe mis à jour ! Accès déverrouillé.');
    } else {
      setErrorMessage(res.message || 'Une erreur est survenue lors de la mise à jour.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md anim-fade-in">
      <div className="w-full max-w-md bg-white border border-slate-300 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 text-slate-900 anim-scale-in">
        {/* En-tête modal */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-[#E8F0FC] border border-[#C7D7F8] text-[#0B3D91] flex items-center justify-center mx-auto shadow-md">
            <KeyRound className="w-8 h-8" />
          </div>
          <span className="section-label">Sécurité Obligatoire</span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight">
            Première Connexion Sécurisée
          </h2>
          <p className="text-xs text-slate-600 max-w-xs mx-auto">
            Votre compte a été initialisé par l&apos;Administrateur de la Division. Veuillez définir votre mot de passe personnel pour continuer.
          </p>
        </div>

        {/* Fiche récapitulative du compte */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Membre :</span>
            <span className="font-bold text-slate-900">{currentUser.nom} {currentUser.prenom}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Matricule :</span>
            <span className="font-mono text-[#0B3D91] font-bold">{currentUser.matricule}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Niveau académique :</span>
            <span className="font-bold text-slate-800">{currentUser.niveau}</span>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 pill-red rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
              <span className="text-slate-900 font-medium">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 pill-green rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16A34A]" />
              <span className="text-slate-900 font-medium">{successMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Au moins 6 caractères..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-nasa pl-10 pr-10 text-sm font-medium"
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                title={showPassword ? 'Masquer' : 'Afficher'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Confirmer le nouveau mot de passe
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Retapez le mot de passe..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-nasa pl-10 text-sm font-medium"
                required
              />
            </div>
          </div>

          {/* Règles de validation visuelles */}
          <div className="space-y-1.5 pt-1 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isMinLength ? 'bg-[#16A34A]' : 'bg-slate-300'}`} />
              <span className={isMinLength ? 'text-[#16A34A] font-semibold' : 'text-slate-500'}>
                Au moins 6 caractères
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isDifferentFromDefault ? 'bg-[#16A34A]' : 'bg-slate-300'}`} />
              <span className={isDifferentFromDefault ? 'text-[#16A34A] font-semibold' : 'text-slate-500'}>
                Différent du mot de passe par défaut
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isMatching ? 'bg-[#16A34A]' : 'bg-slate-300'}`} />
              <span className={isMatching ? 'text-[#16A34A] font-semibold' : 'text-slate-500'}>
                Les deux mots de passe correspondent
              </span>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="space-y-2 pt-2">
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="btn-nasa w-full py-3.5 text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <ShieldCheck className="w-4 h-4" />
              {isSubmitting ? 'Mise à jour en cours...' : 'Enregistrer et Déverrouiller l\'Accès'}
            </button>

            <button
              type="button"
              onClick={logout}
              className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Se déconnecter pour le moment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
