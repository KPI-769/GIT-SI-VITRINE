'use client';

import React, { useState } from 'react';
import { 
  User, 
  MONTH_NAMES, 
  CURRENT_MONTH, 
  CURRENT_YEAR 
} from '@/lib/types';
import DynamicQrCode from './DynamicQrCode';
import { 
  Wifi, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  QrCode, 
  CreditCard, 
  Laptop, 
  Smartphone,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Award,
  BookOpen,
  Cpu,
  CheckCircle2,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Shield
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { INITIAL_PROJECTS } from '@/lib/store';

interface MemberViewProps {
  user: User;
  onUpdateMacs: (newMacs: User['macAddresses']) => void;
}

export default function MemberView({ user, onUpdateMacs }: MemberViewProps) {
  const { changePassword, requestPasswordReset } = useAuth();
  const [activeTab, setActiveTab] = useState<'CARD_QR' | 'MACS' | 'COTISATIONS' | 'ACTIVITES' | 'PENALTIES' | 'SECURITY'>('CARD_QR');
  const [qrType, setQrType] = useState<'ACCESS' | 'PAYMENT'>('ACCESS');
  
  // États pour l'ajout d'adresse MAC
  const [newMacAddress, setNewMacAddress] = useState('');
  const [newDeviceName, setNewDeviceName] = useState('');
  const [macError, setMacError] = useState('');

  // États pour la sécurité & mot de passe du membre
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdatingPwd, setIsUpdatingPwd] = useState(false);
  const [userResetReason, setUserResetReason] = useState('');
  const [resetSentMsg, setResetSentMsg] = useState<string | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);

    if (newPwd.length < 6) {
      setPwdMsg({ type: 'error', text: 'Le mot de passe doit comporter au moins 6 caractères.' });
      return;
    }

    if (newPwd !== confirmPwd) {
      setPwdMsg({ type: 'error', text: 'Les deux mots de passe ne correspondent pas.' });
      return;
    }

    if (newPwd === 'git2026' || newPwd === '123456') {
      setPwdMsg({ type: 'error', text: 'Veuillez choisir un mot de passe différent du mot de passe par défaut.' });
      return;
    }

    setIsUpdatingPwd(true);
    const res = await changePassword(newPwd);
    setIsUpdatingPwd(false);

    if (res.success) {
      setPwdMsg({ type: 'success', text: 'Votre mot de passe a été mis à jour avec succès !' });
      setNewPwd('');
      setConfirmPwd('');
    } else {
      setPwdMsg({ type: 'error', text: res.message || 'Erreur lors du changement de mot de passe.' });
    }
  };

  const handleSendMemberReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetSentMsg(null);
    const res = await requestPasswordReset(user.matricule, userResetReason);
    if (res.success) {
      setResetSentMsg(res.message);
      setUserResetReason('');
    }
  };

  // Vérifier statut de cotisation du mois en cours
  const currentCotisation = user.cotisations.find(
    (c) => c.mois === CURRENT_MONTH && c.annee === CURRENT_YEAR
  );
  const isUpToDate = !!currentCotisation?.isPaid;
  const pendingPenalties = user.penalties?.filter(p => p.status === 'PENDING') || [];
  const isEligibleForWifi = isUpToDate && pendingPenalties.length === 0 && user.macAddresses.length > 0;

  // Validation format MAC (ex: AA:BB:CC:DD:EE:FF ou AA-BB-CC-DD-EE-FF)
  const validateMac = (mac: string) => {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macRegex.test(mac);
  };

  const handleAddMac = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = newMacAddress.trim().toUpperCase().replace(/-/g, ':');
    if (!validateMac(formatted)) {
      setMacError('Format invalide. Exemple requis : 00:1A:2B:3C:4D:5E');
      return;
    }

    if (user.macAddresses.some((m) => m.address.toUpperCase() === formatted)) {
      setMacError('Cette adresse MAC est déjà enregistrée sur votre compte.');
      return;
    }

    const newMac = {
      id: `mac_${Date.now()}`,
      address: formatted,
      deviceName: newDeviceName.trim() || 'Équipement personnel',
      userId: user.id,
    };

    onUpdateMacs([...user.macAddresses, newMac]);
    setNewMacAddress('');
    setNewDeviceName('');
    setMacError('');
  };

  const handleDeleteMac = (macId: string) => {
    onUpdateMacs(user.macAddresses.filter((m) => m.id !== macId));
  };

  return (
    <div className="space-y-6">
      {/* Sélecteur d'onglets mobile-friendly */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('CARD_QR')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'CARD_QR'
              ? 'bg-[#0B3D91] text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Badge QR</span>
        </button>
        <button
          onClick={() => setActiveTab('MACS')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'MACS'
              ? 'bg-[#0B3D91] text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wifi className="w-4 h-4" />
          <span>Wi-Fi &amp; MAC ({user.macAddresses.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('COTISATIONS')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'COTISATIONS'
              ? 'bg-[#0B3D91] text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Cotisations</span>
        </button>
        <button
          onClick={() => setActiveTab('ACTIVITES')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'ACTIVITES'
              ? 'bg-[#0B3D91] text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Activités &amp; Formations</span>
        </button>
        <button
          onClick={() => setActiveTab('PENALTIES')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'PENALTIES'
              ? 'bg-[#0B3D91] text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Discipline ({pendingPenalties.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('SECURITY')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'SECURITY'
              ? 'bg-[#0B3D91] text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Sécurité Compte</span>
        </button>
      </div>

      {/* Onglet 1: Carte de Membre & QR Code */}
      {activeTab === 'CARD_QR' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Carte Membre Virtuelle */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-[#C7D7F8]" style={{ background: 'linear-gradient(135deg, #071e4a 0%, #0B3D91 60%, #1552bf 100%)' }}>
              {/* Effet holographique de fond */}
              <div className="absolute -right-16 -top-16 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -left-16 -bottom-16 w-52 h-52 bg-[#FC3D21]/20 rounded-full blur-2xl pointer-events-none" />

              {/* En-tête de la carte */}
              <div className="flex items-center justify-between pb-4 border-b border-white/15">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white text-[#0B3D91] flex items-center justify-center shadow-md font-black text-lg tracking-wider">
                    GIT
                  </div>
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-sky-200 font-extrabold font-display">
                      Division Génie Infotronique
                    </h3>
                    <p className="text-[11px] text-white/80">Carte de Membre Numérique Officielle</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-xs">
                  {isUpToDate ? (
                    <span className="flex items-center gap-1 text-emerald-300 border-emerald-400/40 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3.5 h-3.5" /> À JOUR
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-300 border-rose-400/40 bg-rose-500/20 px-2 py-0.5 rounded-full">
                      <AlertCircle className="w-3.5 h-3.5" /> EN RETARD
                    </span>
                  )}
                </div>
              </div>

              {/* Informations du membre */}
              <div className="mt-6 flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-2xl font-black text-white shadow-inner">
                  {user.prenom[0]}
                  {user.nom[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white font-display">
                    {user.nom} {user.prenom}
                  </h2>
                  <p className="text-sm text-white/90 font-mono mt-0.5">
                    Matricule : <span className="text-amber-300 font-bold">{user.matricule}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2.5 py-0.5 bg-white/20 text-white rounded-md text-xs font-bold border border-white/25">
                      Niveau {user.niveau}
                    </span>
                    <span className="px-2.5 py-0.5 bg-black/20 text-white/90 rounded-md text-xs">
                      {user.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Statut accès & Wi-Fi */}
              <div className="mt-6 grid grid-cols-2 gap-3 pt-4 border-t border-white/15 text-xs">
                <div className="p-3 rounded-2xl bg-white/10 border border-white/15">
                  <span className="text-white/70 block mb-1">Accès Laboratoire :</span>
                  <span className={`font-bold flex items-center gap-1.5 ${isUpToDate ? 'text-emerald-300' : 'text-rose-300'}`}>
                    <span className={`status-dot ${isUpToDate ? 'green' : 'red'}`} />
                    {isUpToDate ? 'Autorisé (Badge Actif)' : 'Suspendu (Impayé)'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white/10 border border-white/15">
                  <span className="text-white/70 block mb-1">Filtrage Wi-Fi 6 :</span>
                  <span className={`font-bold flex items-center gap-1.5 ${isUpToDate ? 'text-emerald-300' : 'text-rose-300'}`}>
                    <span className={`status-dot ${isUpToDate ? 'green' : 'red'}`} />
                    {isUpToDate ? 'Whitelist Active' : 'Blacklist (Bloqué)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Commutateur de QR Code */}
            <div className="card p-2 flex gap-2">
              <button
                onClick={() => setQrType('ACCESS')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                  qrType === 'ACCESS'
                    ? 'btn-nasa text-white'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                QR Accès Labo (Censeur)
              </button>
              <button
                onClick={() => setQrType('PAYMENT')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                  qrType === 'PAYMENT'
                    ? 'bg-[#16A34A] text-white shadow-md'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                QR Paiement (Trésorier)
              </button>
            </div>
          </div>

          {/* Module QR Code Dynamique */}
          <div className="lg:col-span-6">
            <DynamicQrCode user={user} mode={qrType} />
          </div>
        </div>
      )}

      {/* Onglet 2: Gestion des adresses MAC */}
      {activeTab === 'MACS' && (
        <div className="space-y-6">
          {/* Formulaire d'ajout */}
          <div className="card p-6">
            <span className="section-label">Filtrage Réseau Wi-Fi 6 du Laboratoire</span>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2 font-display">
              <Wifi className="w-5 h-5 text-[#0B3D91]" />
              Enregistrer un nouvel équipement Wi-Fi
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              L&apos;adresse MAC enregistrée sera automatiquement intégrée à la liste blanche (Whitelist) du routeur Wi-Fi du laboratoire si vos cotisations sont à jour.
            </p>

            <form onSubmit={handleAddMac} className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Nom de l&apos;appareil
                </label>
                <input
                  type="text"
                  placeholder="Ex: PC Dell XPS, iPhone 15"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  className="input-nasa"
                />
              </div>

              <div className="md:col-span-5">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Adresse MAC (Format : XX:XX:XX:XX:XX:XX)
                </label>
                <input
                  type="text"
                  placeholder="00:1A:2B:3C:4D:5E"
                  value={newMacAddress}
                  onChange={(e) => {
                    setNewMacAddress(e.target.value);
                    if (macError) setMacError('');
                  }}
                  className="input-nasa font-mono uppercase"
                />
              </div>

              <div className="md:col-span-2 flex items-end">
                <button
                  type="submit"
                  className="btn-nasa w-full py-2.5 text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Ajouter
                </button>
              </div>
            </form>

            {macError && (
              <p className="mt-3 text-xs text-[#DC2626] flex items-center gap-1 font-semibold">
                <AlertCircle className="w-3.5 h-3.5" /> {macError}
              </p>
            )}
          </div>

          {/* Liste des adresses MAC */}
          <div className="card p-6">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 font-display">
              Vos équipements déclarés ({user.macAddresses.length})
            </h4>

            {user.macAddresses.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                Aucun équipement enregistré. Ajoutez votre PC portable ou smartphone ci-dessus pour accéder au Wi-Fi du laboratoire.
              </div>
            ) : (
              <div className="space-y-3">
                {user.macAddresses.map((mac) => (
                  <div
                    key={mac.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-[#0B3D91] transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#E8F0FC] border border-[#C7D7F8] flex items-center justify-center text-[#0B3D91]">
                        {mac.deviceName?.toLowerCase().includes('phone') || mac.deviceName?.toLowerCase().includes('iphone') ? (
                          <Smartphone className="w-5 h-5" />
                        ) : (
                          <Laptop className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-sm">{mac.deviceName || 'Appareil'}</h5>
                        <p className="font-mono text-xs text-[#0B3D91] font-semibold">{mac.address}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                          isUpToDate
                            ? 'pill-green'
                            : 'pill-red'
                        }`}
                      >
                        {isUpToDate ? 'Whitelist (Autorisé)' : 'Blacklist (Impayé)'}
                      </span>
                      <button
                        onClick={() => handleDeleteMac(mac.id)}
                        className="p-2 text-slate-400 hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-xl transition cursor-pointer"
                        title="Supprimer cet équipement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Onglet 3: Cotisations */}
      {activeTab === 'COTISATIONS' && (
        <div className="card p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="section-label">Trésorerie & Dettes</span>
              <h3 className="text-lg font-bold text-slate-900 font-display">Historique des Cotisations</h3>
              <p className="text-xs text-slate-500">Cotisation mensuelle fixée à 2 000 FCFA / mois selon CDC</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Exercice en cours</span>
              <span className="text-sm font-bold text-[#0B3D91]">Année {CURRENT_YEAR}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {user.cotisations.map((cot) => (
              <div
                key={cot.id}
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  cot.isPaid
                    ? 'bg-[#F0FDF4] border-[#BBF7D0]'
                    : 'bg-[#FEF2F2] border-[#FECACA]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cot.isPaid ? 'bg-emerald-100 text-[#16A34A]' : 'bg-rose-100 text-[#DC2626]'}`}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">
                      {MONTH_NAMES[cot.mois - 1]} {cot.annee}
                    </h5>
                    <p className="text-xs text-slate-500 font-medium">{cot.montant.toLocaleString('fr-FR')} FCFA</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {cot.isPaid ? (
                    <span className="pill-green px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Réglée
                    </span>
                  ) : (
                    <span className="pill-red px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> En attente
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Onglet 4: Activités, Formations & Projets (CDC Module 3) */}
      {activeTab === 'ACTIVITES' && (
        <div className="space-y-6">
          {/* Projets de recherche attribués */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="section-label">R&amp;D &amp; Ingénierie</span>
                <h3 className="text-lg font-bold text-slate-900 font-display">Mes Projets de Laboratoire Attribués</h3>
                <p className="text-xs text-slate-500">Projets officiels dans lesquels vous êtes désigné contributeur actif.</p>
              </div>
            </div>

            {INITIAL_PROJECTS.filter(p => p.contributors.some(c => c.userId === user.id)).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {INITIAL_PROJECTS.filter(p => p.contributors.some(c => c.userId === user.id)).map(p => {
                  const myRole = p.contributors.find(c => c.userId === user.id)?.roleInProject;
                  return (
                    <div key={p.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F0FC] text-[#0B3D91] border border-[#C7D7F8]">
                          {p.category}
                        </span>
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          Rôle : {myRole}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 font-display">{p.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2">{p.description}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Cpu className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">Aucun projet attribué pour l&apos;instant</p>
                <p className="mt-1">Rapprochez-vous de votre responsable de division pour rejoindre une équipe R&amp;D.</p>
              </div>
            )}
          </div>

          {/* Formations & Certifications validées */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="section-label">Validation des Compétences</span>
                <h3 className="text-lg font-bold text-slate-900 font-display">Mes Certifications Obtenues</h3>
                <p className="text-xs text-slate-500">Certificats techniques délivrés après validation d&apos;examens pratiques sur paillasse.</p>
              </div>
            </div>

            {user.certifications && user.certifications.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {user.certifications.map(c => (
                  <div key={c.id} className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{c.courseTitle}</h4>
                      <span className="text-[10px] text-emerald-800 font-semibold block mt-0.5">
                        Délivré le {new Date(c.issuedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <BookOpen className="w-7 h-7 text-slate-400 mx-auto mb-1.5" />
                <p className="font-semibold text-slate-700">Aucune certification enregistrée</p>
                <p className="mt-0.5">Inscrivez-vous aux formations du Pôle Académique pour obtenir vos accréditations officielles.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Onglet 5: Discipline & Pénalités (CDC Module 3 & DAT Mikrotik Hook) */}
      {activeTab === 'PENALTIES' && (
        <div className="card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="section-label">Règlement Intérieur &amp; Discipline</span>
              <h3 className="text-lg font-bold text-slate-900 font-display">Suivi Disciplinaire &amp; Pénalités</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Règle stricte du laboratoire : toute pénalité non réglée révoque immédiatement vos droits Wi-Fi 6.
              </p>
            </div>

            <div className="px-3.5 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 shrink-0 bg-slate-50 border-slate-200">
              {pendingPenalties.length === 0 ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Dossier Disciplinaire Vierge
                </span>
              ) : (
                <span className="text-rose-700 font-bold flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4 text-rose-600" /> {pendingPenalties.length} Pénalité(s) en attente
                </span>
              )}
            </div>
          </div>

          {/* Bannière explicative statut Mikrotik */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
            isEligibleForWifi
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isEligibleForWifi ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'}`}>
              <Wifi className="w-5 h-5" />
            </div>
            <div className="text-xs space-y-1">
              <strong className="block text-sm font-bold">
                {isEligibleForWifi
                  ? 'Éligibilité Réseau Wi-Fi 6 : Accordée (Bypass Routeur Actif)'
                  : 'Éligibilité Réseau Wi-Fi 6 : Suspendue ou Bloquée'}
              </strong>
              <p className="opacity-90">
                {isEligibleForWifi
                  ? 'Vos cotisations sont à jour, votre dossier disciplinaire est conforme et votre adresse MAC est autorisée.'
                  : !isUpToDate
                  ? 'Votre cotisation du mois est en attente. Veuillez régulariser auprès du Trésorier.'
                  : pendingPenalties.length > 0
                  ? 'Vous avez des pénalités disciplinaires non soldées. Veuillez contacter le Trésorier pour règlement.'
                  : 'Aucune adresse MAC déclarée. Veuillez enregistrer la carte réseau de votre PC.'}
              </p>
            </div>
          </div>

          {/* Liste des pénalités */}
          {user.penalties && user.penalties.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Registre des Sanctions Enregistrées :
              </h4>
              <div className="space-y-2">
                {user.penalties.map((pen) => (
                  <div
                    key={pen.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          pen.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                          {pen.status === 'PAID' ? 'Acquittée' : 'En souffrance'}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {new Date(pen.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-900">{pen.reason}</p>
                    </div>

                    <div className="text-right sm:shrink-0">
                      <span className="text-sm font-black text-rose-600 block">
                        {pen.amount.toLocaleString('fr-FR')} FCFA
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {pen.status === 'PAID' ? 'Réglée' : 'À régler à la caisse'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="font-bold text-slate-800">Aucune infraction ni pénalité enregistrée</p>
              <p className="text-slate-500 mt-0.5">Votre comportement au laboratoire et lors des séances est irréprochable.</p>
            </div>
          )}
        </div>
      )}

      {/* Onglet 6: Sécurité & Mot de Passe du Compte */}
      {activeTab === 'SECURITY' && (
        <div className="card p-6 bg-white border border-slate-300 space-y-6 shadow-sm">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-[#0B3D91] flex items-center justify-center">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Sécurité &amp; Mot de Passe du Compte
              </h3>
              <p className="text-xs text-slate-500">
                Gérez votre accès personnel en toute souveraineté
              </p>
            </div>
          </div>

          {/* Rappel de la règle RGPD / CDC */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Shield className="w-4 h-4 text-[#0B3D91]" />
              Politique de Confidentialité de la Division GIT
            </div>
            <p className="leading-relaxed">
              L&apos;Administration Centrale <strong>n&apos;a pas accès à votre mot de passe</strong> et la plateforme garantit qu&apos;aucun mot de passe ne peut être modifié par l&apos;administrateur sans votre demande expresse formulée par ticket ou au guichet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Formulaire de changement autonome de mot de passe */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#0B3D91]" />
                Modifier mon mot de passe
              </h4>

              <form onSubmit={handleUpdatePassword} className="space-y-3">
                {pwdMsg && (
                  <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${pwdMsg.type === 'success' ? 'pill-green' : 'pill-red'}`}>
                    {pwdMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" /> : <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />}
                    <span className="font-semibold text-slate-900">{pwdMsg.text}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      placeholder="Minimum 6 caractères..."
                      value={newPwd}
                      onChange={(e) => setNewPwd(e.target.value)}
                      className="input-nasa pr-9 text-xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Retapez le mot de passe..."
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    className="input-nasa text-xs"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingPwd}
                  className="btn-nasa w-full py-2.5 text-xs font-bold cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isUpdatingPwd ? 'Mise à jour...' : 'Enregistrer mon mot de passe'}
                </button>
              </form>
            </div>

            {/* Formulaire de demande de réinitialisation adressée au Bureau */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-600" />
                Demander une assistance / Réinitialisation
              </h4>

              <p className="text-xs text-slate-600 leading-relaxed">
                En cas de blocage d&apos;accès, transmettez une demande formelle à l&apos;Administration. L&apos;administrateur recevra votre requête et pourra réinitialiser votre accès vers le mot de passe temporaire <code className="font-bold text-[#0B3D91]">git2026</code>.
              </p>

              <form onSubmit={handleSendMemberReset} className="space-y-3">
                {resetSentMsg && (
                  <div className="p-3 pill-green rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                    <span className="font-semibold text-slate-900">{resetSentMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Motif de la demande
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Difficulté de mémorisation / Demande de reset officiel"
                    value={userResetReason}
                    onChange={(e) => setUserResetReason(e.target.value)}
                    className="input-nasa text-xs"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Transmettre la Demande au Bureau
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

