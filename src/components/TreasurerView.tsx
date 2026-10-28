'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Payment, 
  Penalty,
  CURRENT_MONTH, 
  CURRENT_YEAR, 
  MONTH_NAMES, 
  DEFAULT_COTISATION_AMOUNT 
} from '@/lib/types';
import { generateMacReportPdf, generateReceiptPdf } from '@/lib/pdf-generator';
import { playSuccessTone, playErrorTone } from '@/lib/store';
import { 
  DollarSign, 
  FileText, 
  Download, 
  CheckCircle, 
  Clock, 
  Search, 
  QrCode, 
  PlusCircle, 
  TrendingUp, 
  X,
  CreditCard,
  Wifi,
  Sparkles,
  Camera,
  AlertCircle,
  XCircle,
  ShieldAlert,
  CheckCircle2,
  Receipt
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface TreasurerViewProps {
  currentUser: User;
  allUsers: User[];
  payments: Payment[];
  onRecordPayment: (payment: {
    memberId: string;
    months: number[];
    method: string;
    reference?: string;
  }) => void;
  onPayPenalty?: (data: {
    penaltyId: string;
    userId: string;
    method: string;
    reference?: string;
  }) => Promise<{ success: boolean; message: string }>;
}

export default function TreasurerView({
  currentUser,
  allUsers,
  payments,
  onRecordPayment,
  onPayPenalty,
}: TreasurerViewProps) {
  // Navigation d'onglets du tableau de bord Trésorerie
  const [activeMainTab, setActiveMainTab] = useState<'cotisations' | 'penalites'>('cotisations');

  // Scanner Caméra QR Code
  const [isScanningCamera, setIsScanningCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Filtres d'exportation réseau PDF
  const [selectedNiveau, setSelectedNiveau] = useState<string>('GI_4');
  const [selectedMois, setSelectedMois] = useState<number>(CURRENT_MONTH);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Filtre et recherche membres
  const [filterNiveau, setFilterNiveau] = useState<string>('ALL');
  const [searchMemberQuery, setSearchMemberQuery] = useState('');

  // Modal d'encaissement (Cotisation ou Pénalité)
  const [modalMember, setModalMember] = useState<User | null>(null);
  const [modalTab, setModalTab] = useState<'cotisation' | 'penalite'>('cotisation');
  const [selectedMonthsToPay, setSelectedMonthsToPay] = useState<number[]>([CURRENT_MONTH]);
  const [paymentMethod, setPaymentMethod] = useState<string>('Mobile Money');
  const [paymentRef, setPaymentRef] = useState<string>('');
  
  // Pénalité sélectionnée pour paiement
  const [selectedPenalty, setSelectedPenalty] = useState<Penalty | null>(null);
  const [isProcessingPenaltyPay, setIsProcessingPenaltyPay] = useState(false);

  // Toast de notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Traitement central du QR Code scanné par la caméra de la trésorière
  const handleProcessScan = (rawText: string) => {
    let targetUserId = '';
    if (rawText.startsWith('GIT:PAYMENT:')) {
      targetUserId = rawText.split(':')[2];
    } else if (rawText.startsWith('GIT:ACCESS:')) {
      targetUserId = rawText.split(':')[2];
    } else {
      targetUserId = rawText.trim();
    }

    const member = allUsers.find(
      (u) => u.id === targetUserId || u.matricule.toLowerCase() === targetUserId.toLowerCase()
    );

    if (member) {
      playSuccessTone();
      stopCamera();
      openEncaissementModal(member);
      showToast(`Membre scanné : ${member.nom} ${member.prenom} (${member.matricule})`);
    } else {
      playErrorTone();
      showToast('QR Code non reconnu ou membre introuvable.');
    }
  };

  // Démarrer la caméra
  const startCamera = async () => {
    try {
      setCameraError(null);
      setIsScanningCamera(true);

      const html5QrCode = new Html5Qrcode('qr-reader-region-treasurer');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleProcessScan(decodedText);
        },
        () => {}
      );
    } catch (err) {
      console.error(err);
      setCameraError('Impossible d\'activer la caméra. Assurez-vous d\'autoriser l\'accès dans votre navigateur.');
      setIsScanningCamera(false);
    }
  };

  // Arrêter la caméra
  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {
        console.error(e);
      }
      scannerRef.current = null;
    }
    setIsScanningCamera(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Statistiques financières
  const allCotisations = allUsers.flatMap((u) => u.cotisations || []);
  const currentMonthCotisations = allCotisations.filter(
    (c) => c.mois === CURRENT_MONTH && c.annee === CURRENT_YEAR
  );
  const totalPaidCount = currentMonthCotisations.filter((c) => c.isPaid).length;
  const totalUnpaidCount = currentMonthCotisations.filter((c) => !c.isPaid).length;
  const totalCollectedAmount = payments.reduce((acc, p) => acc + p.montantTotal, 0);

  // Collecte de toutes les pénalités du système
  const allPenalties: Array<{ penalty: Penalty; user: User }> = allUsers.flatMap((u) =>
    (u.penalties || []).map((p) => ({ penalty: p, user: u }))
  );
  const pendingPenalties = allPenalties.filter((item) => item.penalty.status === 'PENDING');
  const paidPenalties = allPenalties.filter((item) => item.penalty.status === 'PAID');
  const totalPenaltiesPendingAmount = pendingPenalties.reduce((sum, item) => sum + item.penalty.amount, 0);
  const totalPenaltiesCollected = paidPenalties.reduce((sum, item) => sum + item.penalty.amount, 0);

  // Ouverture du modal complet pour un membre
  const openEncaissementModal = (member: User, initialTab: 'cotisation' | 'penalite' = 'cotisation') => {
    setModalMember(member);
    setModalTab(initialTab);
    const unpaidMonth = member.cotisations.find((c) => !c.isPaid)?.mois || CURRENT_MONTH;
    setSelectedMonthsToPay([unpaidMonth]);
    setPaymentRef('');
    setSelectedPenalty(null);
  };

  // Validation encaissement Cotisation
  const handleConfirmCotisation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalMember || selectedMonthsToPay.length === 0) return;

    const totalAmount = selectedMonthsToPay.length * DEFAULT_COTISATION_AMOUNT;
    const ref = paymentRef.trim() || `REC-${Date.now().toString().slice(-6)}`;
    const monthsNames = selectedMonthsToPay.map(m => MONTH_NAMES[m - 1]).join(', ');

    onRecordPayment({
      memberId: modalMember.id,
      months: selectedMonthsToPay,
      method: paymentMethod,
      reference: ref,
    });

    // Génération automatique du Reçu PDF Certifié
    generateReceiptPdf({
      receiptType: 'COTISATION',
      receiptNumber: ref,
      member: modalMember,
      treasurerName: `${currentUser.nom} ${currentUser.prenom}`,
      amount: totalAmount,
      method: paymentMethod,
      reference: ref,
      details: `Cotisation(s) officielle(s) pour le(s) mois de : ${monthsNames}`,
    });

    showToast(`Cotisation de ${modalMember.matricule} enregistrée ! Reçu PDF téléchargé.`);
    setModalMember(null);
  };

  // Validation encaissement Pénalité
  const handleConfirmPenaltyPay = async (penalty: Penalty) => {
    if (!modalMember || !onPayPenalty) return;

    setIsProcessingPenaltyPay(true);
    const ref = paymentRef.trim() || `PEN-REC-${Date.now().toString().slice(-6)}`;

    const res = await onPayPenalty({
      penaltyId: penalty.id,
      userId: modalMember.id,
      method: paymentMethod,
      reference: ref,
    });

    setIsProcessingPenaltyPay(false);

    if (res.success) {
      // Génération automatique du Reçu PDF Pénalité
      generateReceiptPdf({
        receiptType: 'PENALITE',
        receiptNumber: ref,
        member: modalMember,
        treasurerName: `${currentUser.nom} ${currentUser.prenom}`,
        amount: penalty.amount,
        method: paymentMethod,
        reference: ref,
        details: `Règlement sanction / pénalité : ${penalty.reason.replace(/\[.*?\]\s*/g, '')}`,
      });

      showToast(`Paiement pénalité de ${penalty.amount} FCFA validé ! Reçu PDF émis.`);
      setModalMember(null);
      setSelectedPenalty(null);
    } else {
      showToast(res.message || 'Erreur lors du paiement.');
    }
  };

  // Export PDF Réseau MAC
  const handleExportPdf = () => {
    setIsGeneratingPdf(true);
    setTimeout(() => {
      generateMacReportPdf({
        niveau: selectedNiveau,
        mois: selectedMois,
        annee: CURRENT_YEAR,
        treasurerName: `${currentUser.nom} ${currentUser.prenom}`,
        users: allUsers,
      });
      setIsGeneratingPdf(false);
    }, 400);
  };

  // Filtrage des membres
  const membersFiltered = allUsers
    .filter((u) => u.role === 'MEMBER')
    .filter((u) => filterNiveau === 'ALL' || u.niveau === filterNiveau)
    .filter((u) => {
      const q = searchMemberQuery.toLowerCase();
      return (
        u.nom.toLowerCase().includes(q) ||
        u.prenom.toLowerCase().includes(q) ||
        u.matricule.toLowerCase().includes(q) ||
        u.niveau.toLowerCase().includes(q)
      );
    });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 max-w-sm sm:max-w-md">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold leading-snug">{toastMsg}</span>
        </div>
      )}

      {/* 1. Bannière Principale & Déclencheur du Scanner QR Code */}
      <div className="card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border-l-4 border-l-[#16A34A] bg-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#16A34A] shadow-xs shrink-0">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="section-label mb-0">Guichet & Caisse Générale</span>
              <span className="pill-green text-[10px] px-2 py-0.5 rounded-full font-bold">
                Trésorière en ligne
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display mt-0.5">
              Guichet d&apos;Encaissement &amp; Recouvrement
            </h2>
            <p className="text-xs text-slate-500">
              Workflow officiel CDC : Scannez le QR Code de l&apos;étudiant pour trouver sa fiche, percevoir sa cotisation ou régulariser ses pénalités avec reçu PDF certifié.
            </p>
          </div>
        </div>

        {/* Boutons d'activation Caméra Scanner QR Code */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {!isScanningCamera ? (
            <button
              onClick={startCamera}
              className="btn-nasa w-full sm:w-auto py-3 px-5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Activer Caméra Scanner QR</span>
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="btn-nasa-red w-full sm:w-auto py-3 px-5 text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer shadow-md rounded-xl"
            >
              <XCircle className="w-4 h-4" />
              <span>Arrêter la Caméra</span>
            </button>
          )}
        </div>
      </div>

      {cameraError && (
        <div className="p-4 pill-red rounded-xl text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
          <span>{cameraError} Vous pouvez également sélectionner manuellement un membre dans la liste ci-dessous.</span>
        </div>
      )}

      {/* Zone Caméra Déployée (100% Responsive) */}
      {isScanningCamera && (
        <div className="card p-5 bg-slate-900 text-white rounded-3xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-mono font-bold uppercase text-emerald-400 flex items-center gap-2">
              <Camera className="w-4 h-4" /> Caméra Active · Présentez le QR Code de l&apos;étudiant
            </span>
            <button onClick={stopCamera} className="text-xs text-slate-400 hover:text-white cursor-pointer">
              Fermer
            </button>
          </div>
          <div className="w-full max-w-sm sm:max-w-md mx-auto overflow-hidden rounded-2xl bg-black border-2 border-emerald-500/50 shadow-2xl">
            <div id="qr-reader-region-treasurer" className="w-full"></div>
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            Pointez l&apos;appareil photo sur le badge QR ou le téléphone de l&apos;étudiant pour identifier son profil en &lt; 1 seconde.
          </p>
        </div>
      )}

      {/* 2. Métriques Clés Télémétrie Trésorerie */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Cotisations Encaissées</span>
            <div className="w-8 h-8 rounded-xl bg-[#E8F0FC] text-[#0B3D91] flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="telemetry-value mt-2 text-[#0B3D91] text-xl sm:text-2xl">
            {totalCollectedAmount.toLocaleString('fr-FR')} <span className="text-xs font-bold text-slate-400 font-mono">FCFA</span>
          </p>
          <span className="text-[10px] sm:text-[11px] text-[#16A34A] flex items-center gap-1 mt-1 font-bold">
            <TrendingUp className="w-3 h-3" /> Exercice Budgétaire {CURRENT_YEAR}
          </span>
        </div>

        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Membres Réglés</span>
            <div className="w-8 h-8 rounded-xl bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center font-bold">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="telemetry-value mt-2 text-[#16A34A] text-xl sm:text-2xl">{totalPaidCount}</p>
          <span className="text-[10px] sm:text-[11px] text-slate-500 mt-1 block font-medium">
            Mois de {MONTH_NAMES[CURRENT_MONTH - 1]}
          </span>
        </div>

        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Pénalités Recouvrées</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="telemetry-value mt-2 text-purple-700 text-xl sm:text-2xl">
            {totalPenaltiesCollected.toLocaleString('fr-FR')} <span className="text-xs font-bold text-slate-400 font-mono">FCFA</span>
          </p>
          <span className="text-[10px] sm:text-[11px] text-purple-600 mt-1 block font-bold">
            {paidPenalties.length} pénalité(s) soldée(s)
          </span>
        </div>

        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Pénalités à Récupérer</span>
            <div className="w-8 h-8 rounded-xl bg-[#FFF0EE] text-[#FC3D21] flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="telemetry-value mt-2 text-[#FC3D21] text-xl sm:text-2xl">
            {totalPenaltiesPendingAmount.toLocaleString('fr-FR')} <span className="text-xs font-bold text-slate-400 font-mono">FCFA</span>
          </p>
          <span className="text-[10px] sm:text-[11px] text-[#DC2626] mt-1 block font-bold">
            {pendingPenalties.length} sanction(s) en attente
          </span>
        </div>
      </div>

      {/* 3. Onglets de Navigation Supérieurs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveMainTab('cotisations')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeMainTab === 'cotisations'
              ? 'border-[#0B3D91] text-[#0B3D91]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Gestion des Cotisations &amp; Export MAC</span>
        </button>

        <button
          onClick={() => setActiveMainTab('penalites')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeMainTab === 'penalites'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Paiement des Pénalités &amp; Sanctions ({pendingPenalties.length})</span>
        </button>
      </div>

      {/* CONTENU ONGLET 1 : COTISATIONS */}
      {activeMainTab === 'cotisations' && (
        <div className="space-y-6 anim-fade-in">
          {/* Module d'Exportation Réseau MAC / PDF (CDC 4.3) */}
          <div className="card p-6 border-l-4 border-l-[#0B3D91] space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="section-label">Transmission Réseau Officielle</span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 font-display">
                  <Wifi className="w-5 h-5 text-[#0B3D91]" />
                  Génération du Rapport Réseau Wi-Fi &amp; Filtrage MAC (PDF A4)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Extrait le document certifié de filtrage MAC (Whitelist &amp; Blacklist) pour transmission au responsable réseau.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-300 text-xs">
                  <span className="text-slate-700 font-bold">Niveau :</span>
                  <select
                    value={selectedNiveau}
                    onChange={(e) => setSelectedNiveau(e.target.value)}
                    className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="GI_1">GI 1</option>
                    <option value="GI_2">GI 2</option>
                    <option value="GI_3">GI 3</option>
                    <option value="GI_4">GI 4</option>
                    <option value="GI_5">GI 5</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-300 text-xs">
                  <span className="text-slate-700 font-bold">Mois :</span>
                  <select
                    value={selectedMois}
                    onChange={(e) => setSelectedMois(Number(e.target.value))}
                    className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
                  >
                    {MONTH_NAMES.map((name, index) => (
                      <option key={index + 1} value={index + 1}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleExportPdf}
                  disabled={isGeneratingPdf}
                  className="btn-nasa text-xs font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>{isGeneratingPdf ? 'Génération...' : 'Télécharger Rapport PDF (A4)'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Registre des membres pour encaissement */}
          <div className="card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="section-label">Registre Général</span>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2 font-display">
                  <CreditCard className="w-5 h-5 text-[#16A34A]" />
                  Cotisations des Membres Étudiants ({membersFiltered.length})
                </h4>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto items-center">
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-300 text-xs w-full sm:w-auto">
                  <span className="text-slate-700 font-bold">Promo :</span>
                  <select
                    value={filterNiveau}
                    onChange={(e) => setFilterNiveau(e.target.value)}
                    className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">Tous les niveaux (1-5)</option>
                    <option value="GI_1">GI 1</option>
                    <option value="GI_2">GI 2</option>
                    <option value="GI_3">GI 3</option>
                    <option value="GI_4">GI 4</option>
                    <option value="GI_5">GI 5</option>
                  </select>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Rechercher nom ou matricule..."
                    value={searchMemberQuery}
                    onChange={(e) => setSearchMemberQuery(e.target.value)}
                    className="input-nasa pl-9 text-xs w-full"
                  />
                </div>
              </div>
            </div>

            {/* Tableau responsive des membres */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[600px]">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Matricule</th>
                    <th className="py-3 px-3">Nom &amp; Prénom</th>
                    <th className="py-3 px-3">Niveau</th>
                    <th className="py-3 px-3">Statut Mois En Cours</th>
                    <th className="py-3 px-3">Pénalités</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {membersFiltered.map((member) => {
                    const currentCot = member.cotisations.find(
                      (c) => c.mois === CURRENT_MONTH && c.annee === CURRENT_YEAR
                    );
                    const isPaid = !!currentCot?.isPaid;
                    const memberPenalties = member.penalties || [];
                    const pendingPens = memberPenalties.filter(p => p.status === 'PENDING');

                    return (
                      <tr key={member.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-3 font-mono text-[#0B3D91] font-bold">
                          {member.matricule}
                        </td>
                        <td className="py-3 px-3 text-slate-900 font-bold">
                          {member.nom} {member.prenom}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-bold border border-slate-200">
                            {member.niveau}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-1 rounded-full font-bold text-[10px] border inline-block ${
                              isPaid ? 'pill-green' : 'pill-red'
                            }`}
                          >
                            {isPaid ? 'RÉGLÉE' : 'IMPAYÉE'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {pendingPens.length > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              {pendingPens.length} en attente
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Aucune</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEncaissementModal(member, 'cotisation')}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs ${
                                isPaid
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                                  : 'bg-[#16A34A] hover:bg-[#15803d] text-white shadow-sm'
                              }`}
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>{isPaid ? '+ Mois' : 'Encaisser'}</span>
                            </button>

                            {pendingPens.length > 0 && (
                              <button
                                onClick={() => openEncaissementModal(member, 'penalite')}
                                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 transition cursor-pointer"
                                title="Payer la pénalité"
                              >
                                Pénalité
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CONTENU ONGLET 2 : PÉNALITÉS ET SANCTIONS */}
      {activeMainTab === 'penalites' && (
        <div className="card p-6 space-y-4 anim-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="section-label">Recouvrement Disciplinaire</span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 font-display">
                <ShieldAlert className="w-5 h-5 text-purple-700" />
                Registre des Pénalités &amp; Sanctions ({allPenalties.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Les sanctions validées par le Bureau ou infligées au contrôle doivent être soldées à la caisse pour lever les restrictions d&apos;accès.
              </p>
            </div>
          </div>

          {allPenalties.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Aucune pénalité n&apos;est actuellement consignée dans le système.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[650px]">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Membre Sanctionné</th>
                    <th className="py-3 px-3">Matricule</th>
                    <th className="py-3 px-3">Motif de la Sanction</th>
                    <th className="py-3 px-3">Montant</th>
                    <th className="py-3 px-3">Statut</th>
                    <th className="py-3 px-3 text-right">Action Caisse</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {allPenalties.map(({ penalty, user }) => {
                    const isPending = penalty.status === 'PENDING';
                    const isPaid = penalty.status === 'PAID';

                    return (
                      <tr key={penalty.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                          {new Date(penalty.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-3 px-3 text-slate-900 font-bold">
                          {user.nom} {user.prenom}
                        </td>
                        <td className="py-3 px-3 font-mono text-[#0B3D91] font-bold">
                          {user.matricule}
                        </td>
                        <td className="py-3 px-3 text-slate-700 max-w-xs">
                          {penalty.reason}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900 font-mono">
                          {penalty.amount.toLocaleString('fr-FR')} FCFA
                        </td>
                        <td className="py-3 px-3">
                          {isPaid ? (
                            <span className="pill-green text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                              RÉGLÉE
                            </span>
                          ) : isPending ? (
                            <span className="pill-red text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                              À PAYER
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-500 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                              ANNULÉE
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {isPending ? (
                            <button
                              onClick={() => {
                                setModalMember(user);
                                setModalTab('penalite');
                                setSelectedPenalty(penalty);
                              }}
                              className="btn-nasa py-1.5 px-3 text-xs font-bold cursor-pointer"
                            >
                              Encaisser
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                generateReceiptPdf({
                                  receiptType: 'PENALITE',
                                  receiptNumber: `REC-${penalty.id.slice(-6)}`,
                                  member: user,
                                  treasurerName: `${currentUser.nom} ${currentUser.prenom}`,
                                  amount: penalty.amount,
                                  method: penalty.paymentMethod || 'Espèces',
                                  reference: penalty.paymentReference,
                                  details: `Règlement sanction : ${penalty.reason}`,
                                  date: penalty.paidAt ? new Date(penalty.paidAt).toLocaleDateString('fr-FR') : undefined,
                                });
                                showToast('Reçu PDF officiel réédité.');
                              }}
                              className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition flex items-center gap-1 ml-auto cursor-pointer"
                            >
                              <Download className="w-3 h-3" /> Reçu PDF
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. MODAL UNIFIÉ D'ENCAISSEMENT RAPIDE (COTISATIONS & PÉNALITÉS) */}
      {modalMember && (
        <div className="modal-backdrop">
          <div className="modal-card p-5 sm:p-6 space-y-4 max-w-lg w-full bg-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#16A34A]">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">Guichet d&apos;Encaissement</h3>
                  <p className="text-xs text-slate-500">Validation et édition du reçu certifié</p>
                </div>
              </div>
              <button
                onClick={() => setModalMember(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Fiche du membre scanné / sélectionné */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Membre :</span>
                <span className="font-bold text-slate-900">{modalMember.nom} {modalMember.prenom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Matricule :</span>
                <span className="font-mono text-[#0B3D91] font-bold">{modalMember.matricule}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Promotion :</span>
                <span className="font-bold text-slate-800">{modalMember.niveau}</span>
              </div>
            </div>

            {/* Sélecteur de type d'encaissement (Cotisation vs Pénalité) */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setModalTab('cotisation')}
                className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                  modalTab === 'cotisation'
                    ? 'bg-white text-[#0B3D91] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Cotisation Annuelle
              </button>

              <button
                type="button"
                onClick={() => setModalTab('penalite')}
                className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  modalTab === 'penalite'
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>2. Pénalité(s)</span>
                {modalMember.penalties && modalMember.penalties.filter(p => p.status === 'PENDING').length > 0 && (
                  <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[10px]">
                    {modalMember.penalties.filter(p => p.status === 'PENDING').length}
                  </span>
                )}
              </button>
            </div>

            {/* FORMULAIRE A : COTISATIONS */}
            {modalTab === 'cotisation' && (
              <form onSubmit={handleConfirmCotisation} className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Mois concerné(s) (2 000 FCFA / mois)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                    {[9, 10, 11, 12, 1, 2, 3, 4, 5, 6].map((moisNum) => {
                      const isSelected = selectedMonthsToPay.includes(moisNum);
                      const alreadyPaid = modalMember.cotisations.some(
                        (c) => c.mois === moisNum && c.isPaid
                      );

                      return (
                        <button
                          type="button"
                          key={moisNum}
                          onClick={() => {
                            if (alreadyPaid) return;
                            if (isSelected) {
                              setSelectedMonthsToPay(selectedMonthsToPay.filter((m) => m !== moisNum));
                            } else {
                              setSelectedMonthsToPay([...selectedMonthsToPay, moisNum]);
                            }
                          }}
                          disabled={alreadyPaid}
                          className={`p-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                            alreadyPaid
                              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                              : isSelected
                              ? 'bg-[#0B3D91] border-[#0B3D91] text-white shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-[#0B3D91]'
                          }`}
                        >
                          {MONTH_NAMES[moisNum - 1]}
                          {alreadyPaid && <span className="block text-[9px] text-[#16A34A]">Réglé</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mode de règlement */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Mode de règlement
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Mobile Money', 'Espèces', 'Virement'].map((method) => (
                      <button
                        type="button"
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`p-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          paymentMethod === method
                            ? 'bg-[#16A34A] border-[#16A34A] text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Référence de transaction */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Référence de reçu ou transaction
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: OM-2026-9941 ou RECU-001"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    className="input-nasa font-mono text-xs w-full"
                  />
                </div>

                {/* Total */}
                <div className="p-3.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl flex items-center justify-between text-xs">
                  <span className="font-bold text-[#16A34A]">Total à encaisser :</span>
                  <span className="text-lg font-black text-slate-900 font-display">
                    {(selectedMonthsToPay.length * DEFAULT_COTISATION_AMOUNT).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalMember(null)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={selectedMonthsToPay.length === 0}
                    className="btn-nasa flex-1 py-2.5 text-xs font-bold cursor-pointer disabled:opacity-50"
                  >
                    Valider &amp; Télécharger Reçu PDF
                  </button>
                </div>
              </form>
            )}

            {/* FORMULAIRE B : PÉNALITÉS DU MEMBRE */}
            {modalTab === 'penalite' && (
              <div className="space-y-4 pt-1">
                {(() => {
                  const memberPendingPens = (modalMember.penalties || []).filter(p => p.status === 'PENDING');

                  if (memberPendingPens.length === 0) {
                    return (
                      <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                        <h4 className="text-sm font-bold text-emerald-950 font-display">Membre en Règle</h4>
                        <p className="text-xs text-emerald-800">
                          Aucune pénalité ou sanction n&apos;est actuellement en attente de paiement pour {modalMember.nom} {modalMember.prenom}.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-600">
                        Sélectionnez la pénalité à solder. Une fois réglée, le membre sera réhabilité au poste de contrôle du censeur.
                      </p>

                      <div className="space-y-2 max-h-56 overflow-y-auto">
                        {memberPendingPens.map((p) => (
                          <div
                            key={p.id}
                            className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                              selectedPenalty?.id === p.id
                                ? 'bg-purple-50 border-purple-400'
                                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <span className="text-[10px] text-slate-500 font-mono block">
                                Émise le {new Date(p.createdAt).toLocaleDateString('fr-FR')}
                              </span>
                              <strong className="text-xs text-slate-900 block font-display">
                                {p.reason}
                              </strong>
                              <span className="text-xs font-black text-purple-700 font-mono">
                                {p.amount.toLocaleString('fr-FR')} FCFA
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => setSelectedPenalty(p)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                selectedPenalty?.id === p.id
                                  ? 'bg-purple-700 text-white'
                                  : 'bg-white text-purple-700 border border-purple-300 hover:bg-purple-50'
                              }`}
                            >
                              {selectedPenalty?.id === p.id ? 'Sélectionnée' : 'Choisir'}
                            </button>
                          </div>
                        ))}
                      </div>

                      {selectedPenalty && (
                        <div className="space-y-3 pt-2 border-t border-slate-100">
                          {/* Mode de règlement pénalité */}
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                              Mode de règlement de la pénalité
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              {['Espèces', 'Mobile Money', 'Virement'].map((m) => (
                                <button
                                  type="button"
                                  key={m}
                                  onClick={() => setPaymentMethod(m)}
                                  className={`p-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                                    paymentMethod === m
                                      ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                                      : 'bg-white border-slate-200 text-slate-700'
                                  }`}
                                >
                                  {m}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                              Référence transaction (Facultatif)
                            </label>
                            <input
                              type="text"
                              placeholder="Ex: CASH-GUICHET-01"
                              value={paymentRef}
                              onChange={(e) => setPaymentRef(e.target.value)}
                              className="input-nasa font-mono text-xs w-full"
                            />
                          </div>

                          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between text-xs">
                            <span className="font-bold text-purple-900">Montant sanction à encaisser :</span>
                            <span className="text-base font-black text-purple-950 font-display">
                              {selectedPenalty.amount.toLocaleString('fr-FR')} FCFA
                            </span>
                          </div>

                          <button
                            type="button"
                            disabled={isProcessingPenaltyPay}
                            onClick={() => handleConfirmPenaltyPay(selectedPenalty)}
                            className="btn-nasa w-full py-2.5 text-xs font-bold cursor-pointer disabled:opacity-50"
                          >
                            {isProcessingPenaltyPay
                              ? 'Enregistrement...'
                              : `Valider le paiement de ${selectedPenalty.amount.toLocaleString('fr-FR')} FCFA & Reçu PDF`}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
