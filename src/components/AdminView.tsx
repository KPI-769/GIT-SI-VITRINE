'use client';

import React, { useState, useMemo } from 'react';
import { User, Role, Niveau, NIVEAUX, Penalty } from '@/lib/types';
import { 
  generateCredentialsPdf, 
  downloadCredentialsCsv,
  generateBureauCredentialsPdf,
  downloadBureauCredentialsCsv
} from '@/lib/pdf-generator';
import { 
  Users, 
  ShieldAlert, 
  Settings, 
  UserCheck, 
  Search, 
  UserPlus, 
  Edit, 
  CheckCircle,
  Database,
  Building,
  Activity,
  Layers,
  Sparkles,
  X,
  KeyRound,
  Lock,
  Mail,
  GraduationCap,
  AlertCircle,
  FileDown,
  Printer,
  FileSpreadsheet,
  RefreshCw,
  Phone,
  AlertTriangle,
  Check,
  ShieldCheck,
  Info,
  Gavel,
  Ban,
  Clock,
  ArrowRight,
  Camera
} from 'lucide-react';

interface AdminViewProps {
  allUsers: User[];
  onUpdateRole: (userId: string, newRole: Role) => void;
  onToggleUserActive: (userId: string) => void;
  onRegisterUser?: (userData: {
    nom: string;
    prenom: string;
    email: string;
    matricule: string;
    phone?: string;
    niveau: Niveau;
    role: Role;
    defaultPassword?: string;
  }) => { success: boolean; message?: string; user?: User };
  onProcessPasswordReset?: (userId: string, justification: string) => Promise<{ success: boolean; message: string }>;
  onRestoreOfficialUsers?: () => { success: boolean; count: number; message: string };
  onProcessPenalty?: (penaltyId: string, action: 'APPROVE' | 'REJECT') => Promise<{ success: boolean; message: string }>;
}

export const ROLE_LABELS: Record<Role, { label: string; badgeClass: string }> = {
  ADMIN: { label: 'Administrateur', badgeClass: 'bg-purple-100 text-purple-900 border-purple-300' },
  TREASURER: { label: 'Trésorier', badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  CENSEUR: { label: 'Censeur (Contrôle)', badgeClass: 'bg-[#D8E6FD] text-[#0B3D91] border-[#ADC8FA]' },
  COMMUNITY_MANAGER: { label: 'Community Manager (Galerie)', badgeClass: 'bg-pink-100 text-pink-900 border-pink-300' },
  LAB_MANAGER: { label: 'Resp. Labo & Réseau', badgeClass: 'bg-cyan-100 text-cyan-900 border-cyan-300' },
  COMMUNICATION: { label: 'Resp. Communication', badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
  FORMATION: { label: 'Resp. Formation & R&D', badgeClass: 'bg-amber-100 text-amber-900 border-amber-300' },
  CONSEILLER: { label: 'Conseiller Spécial', badgeClass: 'bg-teal-100 text-teal-900 border-teal-300' },
  MEMBER: { label: 'Membre / Étudiant', badgeClass: 'bg-slate-100 text-slate-800 border-slate-300' },
};

export const NIVEAU_LABELS: Record<Niveau, string> = {
  GI_1: 'GI 1 (1ère Année)',
  GI_2: 'GI 2 (2ème Année)',
  GI_3: 'GI 3 (3ème Année)',
  GI_4: 'GI 4 (4ème Année)',
  GI_5: 'GI 5 (5ème Année)',
  GI_Bureau: 'Bureau Exécutif GIT',
};

export default function AdminView({
  allUsers,
  onUpdateRole,
  onToggleUserActive,
  onRegisterUser,
  onProcessPasswordReset,
  onRestoreOfficialUsers,
  onProcessPenalty,
}: AdminViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [niveauFilter, setNiveauFilter] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [processingPenaltyId, setProcessingPenaltyId] = useState<string | null>(null);

  // Modal d'ajout de membre
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newNom, setNewNom] = useState('');
  const [newPrenom, setNewPrenom] = useState('');
  const [newMatricule, setNewMatricule] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newNiveau, setNewNiveau] = useState<Niveau>('GI_4');
  const [newRole, setNewRole] = useState<Role>('MEMBER');
  const [newDefaultPassword, setNewDefaultPassword] = useState('git2026');
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  // Modal d'export des identifiants
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Modal Sécurisé de Réinitialisation de Mot de Passe
  // RÈGLE : L'admin NE PEUT PAS modifier les mots de passe sans demande de l'utilisateur
  const [resetTargetUser, setResetTargetUser] = useState<User | null>(null);
  const [resetJustification, setResetJustification] = useState('');
  const [resetCertifyChecked, setResetCertifyChecked] = useState(false);
  const [resetModalError, setResetModalError] = useState('');
  const [resetModalSuccess, setResetModalSuccess] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Demandes de sanctions pour Refus de Scan transmises par le Censeur
  const pendingSanctions = useMemo(() => {
    const list: { penalty: Penalty; member: User }[] = [];
    allUsers.forEach((u) => {
      (u.penalties || []).forEach((p) => {
        const isRefusal = p.isRefusal || p.reason?.includes('[DEMANDE_ADMIN_REFUS_SCAN]');
        const isPending = p.status === 'PENDING' && (!p.adminApprovalStatus || p.adminApprovalStatus === 'PENDING');
        if (isRefusal && isPending) {
          list.push({ penalty: p, member: u });
        }
      });
    });
    return list;
  }, [allUsers]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApprovePenalty = async (penaltyId: string, memberName: string) => {
    if (!onProcessPenalty) return;
    setProcessingPenaltyId(penaltyId);
    const res = await onProcessPenalty(penaltyId, 'APPROVE');
    setProcessingPenaltyId(null);
    if (res.success) {
      showToast(`✅ Sanction validée pour ${memberName}. Transmise à la Trésorière pour encaissement.`);
    } else {
      showToast(`Erreur : ${res.message}`);
    }
  };

  const handleRejectPenalty = async (penaltyId: string, memberName: string) => {
    if (!onProcessPenalty) return;
    if (!confirm(`Confirmez-vous le rejet de cette demande de sanction pour ${memberName} ?`)) return;
    setProcessingPenaltyId(penaltyId);
    const res = await onProcessPenalty(penaltyId, 'REJECT');
    setProcessingPenaltyId(null);
    if (res.success) {
      showToast(`❌ Demande de sanction rejetée pour ${memberName}.`);
    } else {
      showToast(`Erreur : ${res.message}`);
    }
  };

  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch =
      u.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.matricule.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery));

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesNiveau = niveauFilter === 'ALL' || u.niveau === niveauFilter;

    return matchesSearch && matchesRole && matchesNiveau;
  });

  // Calcul des statistiques rapides
  const stats = {
    total: allUsers.length,
    bureau: allUsers.filter((u) => u.niveau === 'GI_Bureau' || u.matricule.startsWith('GIT-BUR-')).length,
    mustChange: allUsers.filter((u) => u.mustChangePassword).length,
    resetRequests: allUsers.filter((u) => u.passwordResetRequested).length,
    admins: allUsers.filter((u) => u.role === 'ADMIN').length,
    censeurs: allUsers.filter((u) => u.role === 'CENSEUR').length,
    tresoriers: allUsers.filter((u) => u.role === 'TREASURER').length,
    labManagers: allUsers.filter((u) => u.role === 'LAB_MANAGER').length,
  };

  // Gestion du changement de rôle avec notification
  const handleRoleChange = (userId: string, targetName: string, newRole: Role) => {
    onUpdateRole(userId, newRole);
    showToast(`Rôle de ${targetName} mis à jour avec succès : ${ROLE_LABELS[newRole].label}`);
  };

  // Enregistrement manuel d'un membre par l'admin
  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');

    if (!onRegisterUser) {
      setModalError('Fonction d\'enregistrement non disponible.');
      return;
    }

    if (!newNom.trim() || !newPrenom.trim() || !newMatricule.trim() || !newEmail.trim()) {
      setModalError('Veuillez remplir tous les champs obligatoires (*).');
      return;
    }

    const res = onRegisterUser({
      nom: newNom.trim(),
      prenom: newPrenom.trim(),
      matricule: newMatricule.trim().toUpperCase(),
      email: newEmail.trim().toLowerCase(),
      phone: newPhone.trim(),
      niveau: newNiveau,
      role: newRole,
      defaultPassword: newDefaultPassword.trim() || 'git2026',
    });

    if (res.success) {
      setModalSuccess(res.message || 'Membre enregistré avec succès avec mot de passe initial git2026 !');
      showToast(`Compte ${newMatricule.toUpperCase()} créé avec succès.`);
      setNewNom('');
      setNewPrenom('');
      setNewMatricule('');
      setNewPhone('');
      setNewEmail('');
      setNewDefaultPassword('git2026');
      setTimeout(() => {
        setIsAddModalOpen(false);
        setModalSuccess('');
      }, 1300);
    } else {
      setModalError(res.message || 'Erreur lors de la création du membre.');
    }
  };

  // Ouverture du modal de réinitialisation sécurisée
  const openResetModal = (user: User) => {
    setResetTargetUser(user);
    setResetJustification(user.passwordResetReason || '');
    setResetCertifyChecked(!!user.passwordResetRequested);
    setResetModalError('');
    setResetModalSuccess('');
  };

  // Soumission de la réinitialisation par l'administrateur
  const handleConfirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser || !onProcessPasswordReset) return;

    setResetModalError('');
    setResetModalSuccess('');

    // RÈGLE : Sans demande explicite, l'admin doit impérativement certifier et justifier
    if (!resetTargetUser.passwordResetRequested) {
      if (!resetCertifyChecked) {
        setResetModalError('Vous devez impérativement attester de la demande formelle formulée par l\'étudiant.');
        return;
      }
      if (!resetJustification.trim() || resetJustification.trim().length < 5) {
        setResetModalError('Veuillez renseigner un motif ou numéro de ticket de demande valide (au moins 5 caractères).');
        return;
      }
    }

    setIsResetting(true);
    const res = await onProcessPasswordReset(resetTargetUser.id, resetJustification);
    setIsResetting(false);

    if (res.success) {
      setResetModalSuccess(res.message);
      showToast(`Mot de passe réinitialisé sur 'git2026' pour ${resetTargetUser.matricule}.`);
      setTimeout(() => {
        setResetTargetUser(null);
        setResetModalSuccess('');
        setResetJustification('');
      }, 1500);
    } else {
      setResetModalError(res.message);
    }
  };

  // Re-synchronisation de la liste des 99 membres
  const handleRestoreOfficial = () => {
    if (!onRestoreOfficialUsers) return;
    if (confirm('Voulez-vous synchroniser et recharger la liste officielle des 99 membres dédoublonnés (Saint Jérôme Polytechnique) ? Les comptes auront tous le mot de passe initial "git2026" modifiable à la première connexion.')) {
      const res = onRestoreOfficialUsers();
      showToast(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 anim-slide-in">
          <CheckCircle className="w-5 h-5 text-[#16A34A] shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* En-tête Administration & Paramétrage */}
      <div className="card p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-white border border-slate-300 shadow-sm">
        <div>
          <span className="section-label">Centre de Contrôle &amp; Administration</span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5 font-display">
            <Building className="w-6 h-6 text-[#0B3D91]" />
            Administration Centrale de la Division (Bureau GIT)
          </h2>
          <p className="text-xs text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
            Gestion intégrale des <strong>99 comptes officiels</strong> SJP, attribution des rôles RBAC, création de membres et exports certifiés des identifiants avec mot de passe initial par défaut modifiable à première connexion.
          </p>
        </div>

        {/* Boutons d'actions principales */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Bouton Export Liste & Mots de Passe */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-4 py-2.5 bg-[#0B3D91] hover:bg-[#072B68] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-md cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-white" />
            <span>Exporter Fiche des Identifiants</span>
          </button>

          {/* Bouton Galerie & Médias (Community Manager) */}
          <a
            href="/community-manager"
            className="px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-md cursor-pointer"
          >
            <Camera className="w-4 h-4 text-white" />
            <span>Galerie &amp; Médias (CM)</span>
          </a>

          {/* Bouton Nouveau Membre */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-nasa text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
          >
            <UserPlus className="w-4 h-4" />
            <span>Créer un Compte Membre</span>
          </button>

          {/* Synchronisation des 99 membres */}
          <button
            onClick={handleRestoreOfficial}
            title="Recharger la liste officielle des 99 membres"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-[#0B3D91] rounded-xl border border-slate-300 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cartes d'indicateurs statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="card p-3.5 bg-white border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Effectif Total</span>
          <p className="text-xl font-black text-slate-900 mt-0.5">{stats.total} <span className="text-xs font-medium text-slate-500">membres</span></p>
        </div>
        <div className="card p-3.5 bg-amber-50/60 border border-amber-200">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">MDP Initial (git2026)</span>
          <p className="text-xl font-black text-amber-900 mt-0.5">{stats.mustChange} <span className="text-xs font-medium text-amber-700">en attente</span></p>
        </div>
        <div className="card p-3.5 bg-rose-50/60 border border-rose-200">
          <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">Demandes Reset</span>
          <p className="text-xl font-black text-rose-900 mt-0.5">{stats.resetRequests} <span className="text-xs font-medium text-rose-700">à traiter</span></p>
        </div>
        <div className="card p-3.5 bg-purple-50/60 border border-purple-200">
          <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">Administrateurs</span>
          <p className="text-xl font-black text-purple-900 mt-0.5">{stats.admins}</p>
        </div>
        <div className="card p-3.5 bg-blue-50/60 border border-blue-200">
          <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Censeurs (Scan)</span>
          <p className="text-xl font-black text-[#0B3D91] mt-0.5">{stats.censeurs}</p>
        </div>
        <div className="card p-3.5 bg-emerald-50/60 border border-emerald-200">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Trésoriers</span>
          <p className="text-xl font-black text-emerald-900 mt-0.5">{stats.tresoriers}</p>
        </div>
      </div>

      {/* Règle de Sécurité Clé mise en avant (CDC GIT) */}
      <div className="card p-4 bg-[#E8F0FC] border border-[#C7D7F8] rounded-2xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#0B3D91] shrink-0 mt-0.5" />
        <div className="text-xs text-slate-800 space-y-1">
          <p className="font-bold text-[#0B3D91] uppercase tracking-wider">
            Politique de Sécurité &amp; Confidentialité des Mots de Passe
          </p>
          <p className="leading-relaxed text-slate-700">
            <strong>1. Mot de passe initial universel :</strong> <code className="text-[#0B3D91] font-bold bg-white px-1.5 py-0.5 rounded border border-[#ADC8FA]">git2026</code> · Changement strictement forcé dès la première connexion du membre.
            <br />
            <strong>2. Restriction Administrateur :</strong> L&apos;administrateur <strong>ne peut pas modifier ou définir un mot de passe arbitraire</strong> sans une demande formelle expresse de l&apos;utilisateur (ticket guichet ou requête portail). Seule la réinitialisation vers le mot de passe temporaire <code className="text-[#0B3D91] font-bold">git2026</code> (avec obligation de renouvellement) est autorisée.
          </p>
        </div>
      </div>

      {/* SECTION : Demandes de Sanctions & Pénalités Transmises par le Censeur (Refus de Scan) */}
      <div className={`card p-5 border rounded-2xl transition shadow-sm ${
        pendingSanctions.length > 0 
          ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-300/40' 
          : 'bg-white border-slate-300'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              pendingSanctions.length > 0 ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 font-display">
                  Sanctions &amp; Refus de Scan en Attente d&apos;Arbitrage
                </h3>
                {pendingSanctions.length > 0 ? (
                  <span className="px-2 py-0.5 bg-rose-600 text-white text-[11px] font-bold rounded-full animate-pulse">
                    {pendingSanctions.length} à valider
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-300">
                    À jour (0 en attente)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Requêtes de pénalités soumises par le Censeur suite à un refus de présentation du QR Code ou infraction de discipline.
              </p>
            </div>
          </div>
        </div>

        {pendingSanctions.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Aucune demande de pénalité en attente d&apos;approbation. Tout est en règle.</span>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {pendingSanctions.map(({ penalty, member }) => {
              const cleanReason = (penalty.reason || '')
                .replace('[DEMANDE_ADMIN_REFUS_SCAN]', '')
                .trim();
              const isProcessing = processingPenaltyId === penalty.id;

              return (
                <div
                  key={penalty.id}
                  className="p-4 bg-white rounded-xl border border-rose-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-slate-900 text-sm">
                        {member.prenom} {member.nom}
                      </span>
                      <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-300">
                        {member.matricule}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-100 text-rose-800 rounded border border-rose-200">
                        Refus de Scan QR
                      </span>
                      <span className="text-[10px] font-medium text-slate-500">
                        {NIVEAU_LABELS[member.niveau as Niveau] || member.niveau}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <strong className="text-slate-900">Motif du Censeur :</strong> {cleanReason || 'Refus de présenter le QR Code lors du contrôle'}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-500">
                      <span>Date : {new Date(penalty.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                      <span>Montant proposé : <strong className="text-rose-700 font-bold">{penalty.amount.toLocaleString('fr-FR')} FCFA</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <button
                      onClick={() => handleRejectPenalty(penalty.id, `${member.prenom} ${member.nom}`)}
                      disabled={isProcessing}
                      className="px-3 py-2 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-300 cursor-pointer disabled:opacity-50"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Rejeter</span>
                    </button>

                    <button
                      onClick={() => handleApprovePenalty(penalty.id, `${member.prenom} ${member.nom}`)}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isProcessing ? 'Validation...' : 'Valider la Sanction'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Barre de recherche et filtres Niveau & Rôle */}
      <div className="card p-4 flex flex-col md:flex-row gap-3 items-center justify-between bg-white border border-slate-300">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Rechercher nom, matricule, email ou téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-nasa pl-9 text-xs text-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs w-full md:w-auto">
          {/* Filtre Niveau (GI_1 à GI_5 & GI_Bureau) */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-300">
            <span className="text-slate-700 font-bold">Niveau :</span>
            <select
              value={niveauFilter}
              onChange={(e) => setNiveauFilter(e.target.value)}
              className="bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL">Tous les effectifs ({allUsers.length})</option>
              <option value="GI_Bureau">Bureau Exécutif GIT ({stats.bureau})</option>
              {NIVEAUX.map((niv) => (
                <option key={niv} value={niv}>
                  {NIVEAU_LABELS[niv]}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre Rôle RBAC */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-300">
            <span className="text-slate-700 font-bold">Rôle RBAC :</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL">Tous les rôles</option>
              <option value="ADMIN">Administrateurs (Présidents / Secrétaires)</option>
              <option value="COMMUNICATION">Resp. Communication & Événements</option>
              <option value="FORMATION">Resp. Formation & Projets R&D</option>
              <option value="TREASURER">Trésoriers & Commissaire</option>
              <option value="CENSEUR">Censeurs (Contrôle Scan)</option>
              <option value="LAB_MANAGER">Resp. Laboratoire & Réseau</option>
              <option value="CONSEILLER">Conseillers Spéciaux</option>
              <option value="MEMBER">Membres / Étudiants</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau complet de gestion des utilisateurs */}
      <div className="card p-6 overflow-x-auto bg-white border border-slate-300 shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-800 uppercase text-[11px] font-bold tracking-wider border-b border-slate-300">
            <tr>
              <th className="py-3 px-3">Matricule</th>
              <th className="py-3 px-3">Nom &amp; Prénom</th>
              <th className="py-3 px-3">Contact</th>
              <th className="py-3 px-3">Niveau</th>
              <th className="py-3 px-3">Rôle RBAC</th>
              <th className="py-3 px-3">Sécurité Mot de Passe</th>
              <th className="py-3 px-3 text-center">Statut Compte</th>
              <th className="py-3 px-3 text-right">Attribuer un Rôle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-medium text-slate-900">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-600 font-medium">
                  Aucun membre ne correspond aux critères de recherche.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition">
                  {/* Matricule */}
                  <td className="py-3 px-3 font-mono text-[#0B3D91] font-bold">
                    {user.matricule}
                  </td>

                  {/* Nom & Prénom */}
                  <td className="py-3 px-3 text-slate-900 font-bold whitespace-nowrap">
                    <div>{user.nom} {user.prenom}</div>
                    {user.poste && (
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
                        {user.poste}
                      </span>
                    )}
                  </td>

                  {/* Contact Phone & Email */}
                  <td className="py-3 px-3 text-slate-600 text-[11px]">
                    <div className="font-semibold text-slate-800">{user.email}</div>
                    {user.phone ? (
                      <div className="text-slate-500 font-mono text-[10px]">{user.phone}</div>
                    ) : (
                      <span className="text-slate-400 text-[10px] italic">Tél. non renseigné</span>
                    )}
                  </td>

                  {/* Niveau Académique */}
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-900 rounded-md font-bold border border-slate-300 text-[11px]">
                      {user.niveau}
                    </span>
                  </td>

                  {/* Rôle RBAC Actuel */}
                  <td className="py-3 px-3">
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold text-[10px] border inline-block ${
                        ROLE_LABELS[user.role]?.badgeClass || 'bg-slate-100 text-slate-800 border-slate-300'
                      }`}
                    >
                      {ROLE_LABELS[user.role]?.label || user.role}
                    </span>
                  </td>

                  {/* Sécurité Mot de Passe & Demande de Reset */}
                  <td className="py-3 px-3">
                    <div className="flex flex-col gap-1 items-start">
                      {user.passwordResetRequested ? (
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-900 border border-rose-300 rounded-md font-bold text-[10px] inline-flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-rose-600" /> Demande Reçue !
                          </span>
                          <button
                            onClick={() => openResetModal(user)}
                            className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold block cursor-pointer transition shadow-xs"
                          >
                            Traiter la Demande
                          </button>
                        </div>
                      ) : user.mustChangePassword ? (
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-md font-bold text-[10px] inline-flex items-center gap-1">
                            <KeyRound className="w-3 h-3 text-amber-700" /> Initial (git2026)
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-md font-bold text-[10px] inline-flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-700" /> Personnalisé
                          </span>
                          <button
                            onClick={() => openResetModal(user)}
                            title="Réinitialiser uniquement sur demande formelle de l'étudiant"
                            className="p-1 text-slate-400 hover:text-[#0B3D91] transition cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Statut Compte Actif / Suspendu */}
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => onToggleUserActive(user.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                        user.isActive ? 'pill-green' : 'pill-red'
                      }`}
                    >
                      {user.isActive ? 'ACTIF' : 'SUSPENDU'}
                    </button>
                  </td>

                  {/* Option Admin : Changer un rôle */}
                  <td className="py-3 px-3 text-right">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, `${user.nom} ${user.prenom}`, e.target.value as Role)}
                      className="bg-white text-slate-900 border border-slate-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-[#0B3D91] font-semibold shadow-xs cursor-pointer"
                    >
                      <option value="MEMBER">Membre / Étudiant</option>
                      <option value="CENSEUR">Censeur (Scan)</option>
                      <option value="TREASURER">Trésorier (Finances)</option>
                      <option value="LAB_MANAGER">Resp. Labo &amp; Réseau</option>
                      <option value="COMMUNICATION">Resp. Communication &amp; Événements</option>
                      <option value="FORMATION">Resp. Formation, Projets &amp; Certifs</option>
                      <option value="CONSEILLER">Conseiller Spécial</option>
                      <option value="ADMIN">Administrateur (Présidence / Secrétariat)</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1 : Export de la liste officielle des comptes avec identifiants */}
      {isExportModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card p-6 sm:p-7 space-y-5 max-w-2xl bg-white border border-slate-300 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#0B3D91] text-white flex items-center justify-center shadow-md">
                  <FileDown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Export Certifié des Identifiants Étudiants
                  </h3>
                  <p className="text-xs text-slate-600">
                    Génération des listes officielles avec mot de passe par défaut pour distribution
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Fiche récapitulative de l'export */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-semibold">Effectif total inclus :</span>
                <span className="font-bold text-[#0B3D91]">{allUsers.length} comptes membres</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-semibold">Mot de passe initial officiel :</span>
                <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-300 text-slate-900">
                  git2026
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-semibold">Changement au premier accès :</span>
                <span className="font-bold text-[#16A34A] flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Forcé et Obligatoire
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Avis administratif :</strong> Ces documents contiennent les identifiants initiaux des membres. Ils doivent être distribués individuellement ou émargés par chaque étudiant auprès du Bureau de la Division.
              </div>
            </div>

            {/* Options d'exportation divisées Bureau vs Membres */}
            <div className="space-y-4 pt-1">
              {/* Option A : Bureau Exécutif (16 Membres) */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-600 text-white font-bold text-[10px] uppercase tracking-wider">
                      Officiel
                    </span>
                    <strong className="text-sm font-bold text-amber-950">
                      Fiche du Bureau Exécutif GIT (16 Dirigeants)
                    </strong>
                  </div>
                  <span className="text-[11px] font-bold text-amber-800">
                    Source : MEMEBRE DU BUREAU.txt
                  </span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  Comptes de haute responsabilité (Présidence, Secrétariat, Censure, Trésorerie, Laboratoire, R&amp;D, Communication) avec rôles RBAC dédiés et mot de passe initial <code className="font-bold">git2026</code>.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => generateBureauCredentialsPdf({ users: allUsers, adminName: 'Présidence & Bureau GIT' })}
                    className="p-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Télécharger PDF Bureau Exécutif</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadBureauCredentialsCsv(allUsers)}
                    className="p-3 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Télécharger CSV Bureau Exécutif</span>
                  </button>
                </div>
              </div>

              {/* Option B : Promotion Générale des Étudiants (99 Membres) */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#0B3D91] text-white font-bold text-[10px] uppercase tracking-wider">
                      Promotion
                    </span>
                    <strong className="text-sm font-bold text-slate-900">
                      Fiche Générale des Membres Étudiants (99 Membres)
                    </strong>
                  </div>
                  <span className="text-[11px] font-bold text-[#0B3D91]">
                    Source : fiche de cont.txt
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ensemble des élèves-ingénieurs infotronique avec matricules SJP-GI-001 à SJP-GI-099, cotisations et mot de passe par défaut <code className="font-bold text-[#0B3D91]">git2026</code>.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => generateCredentialsPdf({ users: allUsers, adminName: 'Bureau Central GIT' })}
                    className="p-3 bg-[#0B3D91] hover:bg-[#072B68] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Télécharger PDF Promotion Complète</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadCredentialsCsv(allUsers)}
                    className="p-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Télécharger CSV Promotion Complète</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2 : Inscription d'un membre par l'administrateur */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card p-6 sm:p-7 space-y-4 max-w-lg bg-white border border-slate-300 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#E8F0FC] border border-[#C7D7F8] flex items-center justify-center text-[#0B3D91]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Créer un Compte Utilisateur (Admin)
                  </h3>
                  <p className="text-xs text-slate-600">
                    Génération du compte avec mot de passe initial par défaut
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-[#E8F0FC] border border-[#C7D7F8] rounded-xl text-xs text-slate-800 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#0B3D91] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#0B3D91]">Obligation de Sécurité :</strong> Le compte est créé avec le mot de passe initial par défaut <code className="font-bold text-[#0B3D91]">git2026</code>. Le membre sera automatiquement invité à définir son propre mot de passe personnel dès sa 1ère connexion.
              </div>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-3.5">
              {modalError && (
                <div className="p-3 pill-red rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
                  <span className="font-semibold text-slate-900">{modalError}</span>
                </div>
              )}

              {modalSuccess && (
                <div className="p-3 pill-green rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-[#16A34A]" />
                  <span className="font-semibold text-slate-900">{modalSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">
                    Nom de famille *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: TCHOUASSI"
                    value={newNom}
                    onChange={(e) => setNewNom(e.target.value)}
                    className="input-nasa text-xs text-slate-900 uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Steve"
                    value={newPrenom}
                    onChange={(e) => setNewPrenom(e.target.value)}
                    className="input-nasa text-xs text-slate-900 capitalize"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">
                    Matricule Officiel *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: SJP-GI-100"
                    value={newMatricule}
                    onChange={(e) => setNewMatricule(e.target.value)}
                    className="input-nasa text-xs font-mono text-[#0B3D91] font-bold uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">
                    Numéro de Téléphone
                  </label>
                  <input
                    type="tel"
                    placeholder="Ex: 677 38 70 05"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="input-nasa text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">
                  Email Institutionnel *
                </label>
                <input
                  type="email"
                  placeholder="prenom.nom@saintjerome.cm"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="input-nasa text-xs text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">
                    Niveau Académique *
                  </label>
                  <select
                    value={newNiveau}
                    onChange={(e) => setNewNiveau(e.target.value as Niveau)}
                    className="input-nasa text-xs text-slate-900 font-bold bg-white"
                  >
                    {NIVEAUX.map((niv) => (
                      <option key={niv} value={niv}>
                        {NIVEAU_LABELS[niv]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">
                    Rôle RBAC Attribué *
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as Role)}
                    className="input-nasa text-xs text-slate-900 font-bold bg-white"
                  >
                    <option value="MEMBER">Membre / Étudiant</option>
                    <option value="CENSEUR">Censeur (Poste Scan)</option>
                    <option value="TREASURER">Trésorier (Finances)</option>
                    <option value="LAB_MANAGER">Resp. Labo &amp; Réseau</option>
                    <option value="COMMUNICATION">Resp. Communication &amp; Événements</option>
                    <option value="FORMATION">Resp. Formation, Projets &amp; Certifs</option>
                    <option value="CONSEILLER">Conseiller Spécial</option>
                    <option value="ADMIN">Administrateur (Présidence / Secrétariat)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">
                  Mot de passe par défaut
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={newDefaultPassword}
                    onChange={(e) => setNewDefaultPassword(e.target.value)}
                    className="input-nasa pl-9 text-xs font-mono text-slate-900"
                    required
                  />
                </div>
                <span className="text-[11px] text-slate-600 mt-1 block">
                  Valeur par défaut recommandée : <code className="text-[#0B3D91] font-bold">git2026</code> (Changement requis au 1er login)
                </span>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-nasa flex-1 py-2.5 px-4 text-xs font-bold cursor-pointer shadow-md"
                >
                  Créer le Compte Membre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3 : Réinitialisation Sécurisée du Mot de Passe */}
      {/* RÈGLE ABSOLUE : L'admin NE PEUT PAS modifier un mot de passe sans demande de l'utilisateur */}
      {resetTargetUser && (
        <div className="modal-backdrop">
          <div className="modal-card p-6 sm:p-7 space-y-4 max-w-lg bg-white border border-slate-300 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Protocole de Réinitialisation de Mot de Passe
                  </h3>
                  <p className="text-xs text-slate-600">
                    Contrôle de sécurité strict CDC GIT-2026-001
                  </p>
                </div>
              </div>
              <button
                onClick={() => setResetTargetUser(null)}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Avertissement de sécurité fondamental */}
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-950 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                RÈGLE FORMELLE DE SÉCURITÉ
              </div>
              <p className="leading-relaxed">
                L&apos;administrateur <strong>ne peut pas modifier ou définir un mot de passe personnel à sa guise</strong>. La réinitialisation restaure uniquement le mot de passe initial par défaut (<code className="font-bold text-rose-900">git2026</code>) et <strong>nécessite obligatoirement une demande expresse</strong> de l&apos;étudiant.
              </p>
            </div>

            {/* Détails du compte cible */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Membre :</span>
                <span className="font-bold text-slate-900">{resetTargetUser.nom} {resetTargetUser.prenom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Matricule :</span>
                <span className="font-mono font-bold text-[#0B3D91]">{resetTargetUser.matricule}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email :</span>
                <span className="text-slate-700">{resetTargetUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Demande en attente :</span>
                {resetTargetUser.passwordResetRequested ? (
                  <span className="font-bold text-rose-700">OUI (Enregistrée le {new Date(resetTargetUser.passwordResetRequestedAt || '').toLocaleDateString('fr-FR')})</span>
                ) : (
                  <span className="text-slate-500">Aucune demande portail</span>
                )}
              </div>
              {resetTargetUser.passwordResetReason && (
                <div className="pt-1 text-[11px] text-slate-700 border-t border-slate-200">
                  <strong>Motif déclaré :</strong> {resetTargetUser.passwordResetReason}
                </div>
              )}
            </div>

            <form onSubmit={handleConfirmPasswordReset} className="space-y-4">
              {resetModalError && (
                <div className="p-3 pill-red rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
                  <span className="font-semibold text-slate-900">{resetModalError}</span>
                </div>
              )}

              {resetModalSuccess && (
                <div className="p-3 pill-green rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-[#16A34A]" />
                  <span className="font-semibold text-slate-900">{resetModalSuccess}</span>
                </div>
              )}

              {/* Justification de la demande */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">
                  Raison ou Réf. de la demande de l&apos;étudiant *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Demande verbale au guichet du Bureau par l'étudiant ce 21/10"
                  value={resetJustification}
                  onChange={(e) => setResetJustification(e.target.value)}
                  className="input-nasa text-xs text-slate-900"
                  required
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Toute réinitialisation est auditée et archivée dans le journal système.
                </span>
              </div>

              {/* Attestation légale */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={resetCertifyChecked}
                  onChange={(e) => setResetCertifyChecked(e.target.checked)}
                  className="mt-0.5 rounded text-[#0B3D91] focus:ring-0 cursor-pointer"
                />
                <span className="text-xs text-slate-700 leading-snug">
                  Je certifie sur l&apos;honneur que cette réinitialisation fait suite à la <strong>demande expresse et vérifiée</strong> de l&apos;étudiant titulaire du compte.
                </span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResetTargetUser(null)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isResetting || !resetCertifyChecked}
                  className="btn-nasa flex-1 py-2.5 px-4 text-xs font-bold cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResetting ? 'Réinitialisation...' : 'Valider la Réinitialisation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Volet Réhabilitation physique du Laboratoire (Rappel CDC Section 5) */}
      <div className="card p-6 border-l-4 border-l-[#0B3D91] space-y-4 bg-white border border-slate-300 shadow-sm">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#0B3D91]" />
          <h3 className="text-sm font-bold text-slate-900 font-display">
            Suivi de la Réhabilitation Physique du Laboratoire (Cahier des Charges Section 5)
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-300">
            <span className="text-[#0B3D91] font-bold block mb-1">5.1 &amp; 5.2 Aménagement Guichet &amp; Paillasses</span>
            <p className="text-slate-800">Guichet de contrôle à l&apos;entrée pour le censeur et paillasses avec goulottes encastrées.</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-300">
            <span className="text-[#0B3D91] font-bold block mb-1">5.3 Réseau Cat 6A &amp; Wi-Fi 6</span>
            <p className="text-slate-800">Baie de brassage 19&quot;, switch Gigabit avec VLANs séparés et Borne Wi-Fi 6 professionnelle.</p>
          </div>
          <div className="p-4 bg-[#FC3D21]/10 rounded-xl border border-[#FC3D21]/30">
            <span className="text-[#FC3D21] font-bold block mb-1">5.4 &amp; 5.5 Énergie &amp; Terminaux PWA</span>
            <p className="text-slate-800">Onduleur On-Line 2 kVA de secours et tablettes de numérisation PWA haute autonomie.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
