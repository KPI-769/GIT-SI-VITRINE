'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  User, 
  Payment, 
  Penalty,
  Decaissement,
  AuditLogItem,
  AuditActionType,
  CURRENT_MONTH, 
  CURRENT_YEAR, 
  MONTH_NAMES,
  getCotisationAmountForUser,
  COTISATION_AMOUNT_MEMBER,
  COTISATION_AMOUNT_BUREAU
} from '@/lib/types';
import { 
  generateMacReportPdf, 
  generateReceiptPdf, 
  generateDecaissementPdf, 
  sendReceiptViaWhatsApp 
} from '@/lib/pdf-generator';
import { 
  playSuccessTone, 
  playErrorTone, 
  loadDecaissements, 
  saveDecaissements, 
  loadAuditLogs, 
  logAdminAction 
} from '@/lib/store';
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
  TrendingDown,
  X,
  CreditCard,
  Wifi,
  Camera,
  AlertCircle,
  XCircle,
  ShieldAlert,
  CheckCircle2,
  Receipt,
  Send,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  History,
  Filter,
  Smartphone,
  UserCheck,
  RefreshCw,
  Scale,
  Upload,
  Image as ImageIcon
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
  const [activeMainTab, setActiveMainTab] = useState<'cotisations' | 'penalites' | 'commissaire_audit' | 'tracabilite'>('cotisations');

  // Scanner Caméra QR Code (utilisé pour encaisser ou pour décaisser par scan)
  const [scanPurpose, setScanPurpose] = useState<'ENCAISSEMENT' | 'DECAISSEMENT'>('ENCAISSEMENT');
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
  const [whatsappPhone, setWhatsappPhone] = useState<string>('');
  const [sendWhatsAppOnConfirm, setSendWhatsAppOnConfirm] = useState<boolean>(true);
  
  // Pénalité sélectionnée pour paiement
  const [selectedPenalty, setSelectedPenalty] = useState<Penalty | null>(null);
  const [isProcessingPenaltyPay, setIsProcessingPenaltyPay] = useState(false);

  // Modal et État Commissaire aux Comptes & Décaissement par Scan
  const [decaissements, setDecaissements] = useState<Decaissement[]>([]);
  const [isDecaissementModalOpen, setIsDecaissementModalOpen] = useState(false);
  const [decaissementMember, setDecaissementMember] = useState<User | null>(null);
  const [decaissementAmount, setDecaissementAmount] = useState<number>(5000);
  const [decaissementMotif, setDecaissementMotif] = useState<string>('');
  const [decaissementCategory, setDecaissementCategory] = useState<'MEMBRE' | 'FOURNISSEUR' | 'PROJET_LABO' | 'EVENEMENT'>('PROJET_LABO');
  const [decaissementSearchQuery, setDecaissementSearchQuery] = useState<string>('');

  // État Journal d'Audit & Traçabilité
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [auditFilterAction, setAuditFilterAction] = useState<string>('ALL');
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>('');

  // Toast de notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Chargement des données centralisées (API) avec fallback localStorage
  useEffect(() => {
    // Décaissements centralisés
    fetch('/api/decaissements')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.decaissements)) setDecaissements(d.decaissements);
        else setDecaissements(loadDecaissements());
      })
      .catch(() => setDecaissements(loadDecaissements()));

    // Logs d'audit centralisés
    fetch('/api/audit-logs')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.auditLogs)) setAuditLogs(d.auditLogs);
        else setAuditLogs(loadAuditLogs());
      })
      .catch(() => setAuditLogs(loadAuditLogs()));
  }, []);

  const refreshAuditAndDecaissements = () => {
    fetch('/api/decaissements')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.decaissements)) setDecaissements(d.decaissements);
        else setDecaissements(loadDecaissements());
      })
      .catch(() => setDecaissements(loadDecaissements()));

    fetch('/api/audit-logs')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.auditLogs)) setAuditLogs(d.auditLogs);
        else setAuditLogs(loadAuditLogs());
      })
      .catch(() => setAuditLogs(loadAuditLogs()));
  };

  // Traitement central du QR Code scanné par la caméra
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

      if (scanPurpose === 'DECAISSEMENT') {
        setDecaissementMember(member);
        setIsDecaissementModalOpen(true);
        showToast(`Badge certifié pour décaissement : ${member.nom} ${member.prenom} (${member.matricule})`);
      } else {
        openEncaissementModal(member);
        showToast(`Membre scanné pour encaissement : ${member.nom} ${member.prenom} (${member.matricule})`);
      }
    } else {
      playErrorTone();
      showToast('QR Code non reconnu ou membre introuvable dans la base officielle.');
    }
  };

  // Démarrer la caméra (déclenche l'affichage du conteneur DOM qui sera ensuite initialisé par useEffect)
  const startCamera = (purpose: 'ENCAISSEMENT' | 'DECAISSEMENT' = 'ENCAISSEMENT') => {
    setScanPurpose(purpose);
    setCameraError(null);
    setIsScanningCamera(true);
  };

  // Arrêter la caméra proprement
  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (e) {
        console.error(e);
      }
      scannerRef.current = null;
    }
    setIsScanningCamera(false);
  };

  // Scan d'une photo / capture de QR code importée (pour smartphone ou PC)
  const handleScanImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode('qr-reader-region-treasurer-file');
      const decodedText = await html5QrCode.scanFile(file, true);
      html5QrCode.clear();
      handleProcessScan(decodedText);
    } catch (err) {
      console.error(err);
      playErrorTone();
      showToast("Aucun QR Code valide détecté sur cette image. Veuillez sélectionner une photo nette du badge.");
    } finally {
      e.target.value = '';
    }
  };

  // Initialisation du flux vidéo de la caméra APRES le montage du conteneur dans le DOM
  useEffect(() => {
    if (!isScanningCamera) return;

    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        const container = document.getElementById('qr-reader-region-treasurer');
        if (!container || !isMounted) return;

        // Arrêter l'ancienne instance si active
        if (scannerRef.current) {
          try {
            if (scannerRef.current.isScanning) {
              await scannerRef.current.stop();
            }
            scannerRef.current.clear();
          } catch {}
          scannerRef.current = null;
        }

        const html5QrCode = new Html5Qrcode('qr-reader-region-treasurer');
        scannerRef.current = html5QrCode;

        // Configuration du scan avec bascule automatique arrière -> avant / webcam
        try {
          await html5QrCode.start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              handleProcessScan(decodedText);
            },
            () => {}
          );
        } catch (envErr) {
          console.warn("Caméra arrière indisponible, tentative caméra par défaut...", envErr);
          await html5QrCode.start(
            { facingMode: 'user' },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              handleProcessScan(decodedText);
            },
            () => {}
          );
        }
      } catch (err: any) {
        console.error("Erreur Html5Qrcode start:", err);
        let msg = "Impossible d'activer la caméra. Assurez-vous d'autoriser l'accès dans votre navigateur.";
        if (err?.name === 'NotAllowedError' || err?.message?.includes('Permission') || err?.message?.includes('NotAllowedError')) {
          msg = "Autorisation caméra refusée. Cliquez sur l'icône de cadenas ou caméra dans la barre d'adresse du navigateur pour débloquer l'accès.";
        } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
          msg = "Aucune caméra détectée sur cet appareil.";
        } else if (typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
          msg = "Contexte HTTP non sécurisé. Les navigateurs bloquent la caméra en dehors de HTTPS ou localhost. Utilisez le bouton 'Importer Image QR' ou la sélection dans la liste.";
        }
        setCameraError(msg);
        setIsScanningCamera(false);
      }
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isScanningCamera, scanPurpose]);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {});
          }
        } catch {}
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
  const totalCollectedCotisations = payments.reduce((acc, p) => acc + p.montantTotal, 0);

  // Collecte de toutes les pénalités du système
  const allPenalties: Array<{ penalty: Penalty; user: User }> = allUsers.flatMap((u) =>
    (u.penalties || []).map((p) => ({ penalty: p, user: u }))
  );
  const pendingPenalties = allPenalties.filter((item) => item.penalty.status === 'PENDING');
  const paidPenalties = allPenalties.filter((item) => item.penalty.status === 'PAID');
  const totalPenaltiesPendingAmount = pendingPenalties.reduce((sum, item) => sum + item.penalty.amount, 0);
  const totalPenaltiesCollected = paidPenalties.reduce((sum, item) => sum + item.penalty.amount, 0);

  // Totaux Entrées / Sorties / Solde Net
  const totalDecaissementsAmount = decaissements.reduce((acc, d) => acc + d.amount, 0);
  const totalRecettesGlobales = totalCollectedCotisations + totalPenaltiesCollected;
  const soldeNetCaisse = totalRecettesGlobales - totalDecaissementsAmount;

  // Ouverture du modal complet pour un membre
  const openEncaissementModal = (member: User, initialTab: 'cotisation' | 'penalite' = 'cotisation') => {
    setModalMember(member);
    setModalTab(initialTab);
    const unpaidMonth = member.cotisations.find((c) => !c.isPaid)?.mois || CURRENT_MONTH;
    setSelectedMonthsToPay([unpaidMonth]);
    setPaymentRef('');
    setWhatsappPhone(member.phone || '');
    setSelectedPenalty(null);
  };

  // Validation encaissement Cotisation
  const handleConfirmCotisation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalMember || selectedMonthsToPay.length === 0) return;

    const unitPrice = getCotisationAmountForUser(modalMember);
    const totalAmount = selectedMonthsToPay.length * unitPrice;
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
      details: `Cotisation(s) officielle(s) pour le(s) mois de : ${monthsNames} (Tarif : ${unitPrice.toLocaleString('fr-FR')} FCFA/mois)`,
    });

    // Envoi via WhatsApp si demandé et si numéro fourni
    if (sendWhatsAppOnConfirm && whatsappPhone.trim()) {
      sendReceiptViaWhatsApp({
        phone: whatsappPhone.trim(),
        receiptType: 'COTISATION',
        receiptNumber: ref,
        member: modalMember,
        amount: totalAmount,
        method: paymentMethod,
        details: `Cotisation(s) ${monthsNames} (Tarif : ${unitPrice.toLocaleString('fr-FR')} FCFA/mois)`,
      });
    }

    showToast(`Cotisation de ${modalMember.matricule} enregistrée (${totalAmount.toLocaleString('fr-FR')} FCFA) ! Reçu PDF émis.`);
    setModalMember(null);
    refreshAuditAndDecaissements();
  };

  // Validation encaissement Pénalité (utilise le prix exact saisi par le censeur)
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
        details: `Règlement sanction / pénalité censeur : ${penalty.reason.replace(/\[.*?\]\s*/g, '')}`,
      });

      // Envoi du reçu par WhatsApp
      if (sendWhatsAppOnConfirm && (whatsappPhone.trim() || modalMember.phone)) {
        sendReceiptViaWhatsApp({
          phone: (whatsappPhone.trim() || modalMember.phone)!,
          receiptType: 'PENALITE',
          receiptNumber: ref,
          member: modalMember,
          amount: penalty.amount,
          method: paymentMethod,
          details: `Règlement sanction : ${penalty.reason.replace(/\[.*?\]\s*/g, '')}`,
        });
      }

      showToast(`Paiement pénalité de ${penalty.amount.toLocaleString('fr-FR')} FCFA validé ! Reçu PDF émis.`);
      setModalMember(null);
      setSelectedPenalty(null);
      refreshAuditAndDecaissements();
    } else {
      showToast(res.message || 'Erreur lors du paiement.');
    }
  };

  // Validation Décaissement par Scan QR (Commissaire aux Comptes)
  const handleConfirmDecaissement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decaissementMember || decaissementAmount <= 0 || !decaissementMotif.trim()) {
      showToast('Veuillez remplir tous les champs obligatoires du décaissement.');
      return;
    }

    const ref = `DEC-${Date.now().toString().slice(-6)}`;
    const nowIso = new Date().toISOString();

    const newDecaissement: Decaissement = {
      id: `dec_${Date.now()}`,
      memberId: decaissementMember.id,
      memberName: `${decaissementMember.nom} ${decaissementMember.prenom}`,
      memberMatricule: decaissementMember.matricule,
      amount: Number(decaissementAmount),
      motif: decaissementMotif.trim(),
      beneficiaireCategory: decaissementCategory,
      certifiedByCommissaireId: currentUser.id,
      certifiedByCommissaireName: `${currentUser.nom} ${currentUser.prenom}`,
      reference: ref,
      timestamp: nowIso,
      scanVerified: true,
    };

    const updatedDecaissements = [newDecaissement, ...decaissements];
    setDecaissements(updatedDecaissements);
    saveDecaissements(updatedDecaissements); // fallback localStorage

    // Synchronisation centralisée côté serveur
    fetch('/api/decaissements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDecaissement),
    }).catch(() => {});

    // Journalisation immédiate de l'action pour traçabilité
    logAdminAction({
      action: 'DECAISSEMENT_SCAN_CERTIFIE',
      actorId: currentUser.id,
      actorName: `${currentUser.nom} ${currentUser.prenom}`,
      actorRole: currentUser.role,
      targetId: decaissementMember.id,
      targetName: `${decaissementMember.nom} ${decaissementMember.prenom}`,
      targetMatricule: decaissementMember.matricule,
      amount: Number(decaissementAmount),
      details: `Sortie de caisse certifiée par scan : ${decaissementMotif.trim()} (${Number(decaissementAmount).toLocaleString('fr-FR')} FCFA)`,
    });

    // Génération du Bordereau PDF de décaissement
    generateDecaissementPdf({
      receiptNumber: ref,
      member: decaissementMember,
      commissaireName: `${currentUser.nom} ${currentUser.prenom}`,
      amount: Number(decaissementAmount),
      motif: decaissementMotif.trim(),
      beneficiaireCategory: decaissementCategory,
    });

    // Envoi via WhatsApp au bénéficiaire si numéro renseigné
    if (decaissementMember.phone) {
      sendReceiptViaWhatsApp({
        phone: decaissementMember.phone,
        receiptType: 'DECAISSEMENT',
        receiptNumber: ref,
        member: decaissementMember,
        amount: Number(decaissementAmount),
        method: 'Espèces (Sortie de caisse)',
        details: `Décaissement certifié : ${decaissementMotif.trim()}`,
      });
    }

    showToast(`Décaissement de ${decaissementAmount.toLocaleString('fr-FR')} FCFA certifié et archivé !`);
    setIsDecaissementModalOpen(false);
    setDecaissementMember(null);
    setDecaissementMotif('');
    refreshAuditAndDecaissements();
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

  // Filtrage des membres pour l'encaissement
  const membersFiltered = allUsers
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

  // Filtrage des logs d'audit
  const filteredAuditLogs = auditLogs
    .filter((log) => auditFilterAction === 'ALL' || log.action === auditFilterAction)
    .filter((log) => {
      const q = auditSearchQuery.toLowerCase();
      if (!q) return true;
      return (
        log.actorName.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        (log.targetName && log.targetName.toLowerCase().includes(q)) ||
        (log.targetMatricule && log.targetMatricule.toLowerCase().includes(q))
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

      {/* 1. Bannière Principale & Déclencheurs de Scanner QR Code */}
      <div className="card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border-l-4 border-l-[#16A34A] bg-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#16A34A] shadow-xs shrink-0">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="section-label mb-0">Finance &amp; Audit GIT-SJD</span>
              <span className="pill-green text-[10px] px-2 py-0.5 rounded-full font-bold">
                {currentUser.role === 'COMMISSAIRE_AUX_COMPTES' ? 'Commissariat Actif' : 'Trésorerie Connectée'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display mt-0.5">
              Guichet Financier, Décaissements &amp; Audit de Caisse
            </h2>
            <p className="text-xs text-slate-500">
              Cotisations mensuelles (1 000 FCFA membres / 1 500 FCFA bureau), recouvrement des pénalités du censeur, décaissements certifiés par scan QR et traçabilité intégrale.
            </p>
          </div>
        </div>

        {/* Boutons d'action rapides */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {!isScanningCamera ? (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => startCamera('ENCAISSEMENT')}
                className="btn-nasa w-full sm:w-auto py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>Scanner pour Encaisser</span>
              </button>

              <button
                onClick={() => startCamera('DECAISSEMENT')}
                className="bg-amber-600 hover:bg-amber-700 text-white w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition"
              >
                <ArrowDownLeft className="w-4 h-4 text-amber-200" />
                <span>Scanner pour Décaisser</span>
              </button>

              {/* Bouton alternatif Import de Photo de Badge QR (Fonctionne même sans caméra ou en HTTP) */}
              <label className="bg-slate-100 hover:bg-slate-200 text-slate-800 w-full sm:w-auto py-2.5 px-3 rounded-xl text-xs font-bold border border-slate-300 flex items-center justify-center gap-1.5 cursor-pointer transition shadow-xs">
                <Upload className="w-4 h-4 text-[#0B3D91]" />
                <span>Importer Photo QR</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleScanImageFile}
                />
              </label>
            </div>
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

      {/* Conteneur caché pour le décodage d'images de QR Code */}
      <div id="qr-reader-region-treasurer-file" className="hidden"></div>

      {cameraError && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-xs space-y-2 text-amber-950">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Information Accès Caméra</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            {cameraError}
          </p>
          <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200 text-[11px] space-y-1">
            <strong>Conseils pour activer la caméra :</strong>
            <ul className="list-disc list-inside space-y-0.5 text-slate-700">
              <li>Cliquez sur l&apos;icône <strong>🔒 Cadenas</strong> ou <strong>🎥 Caméra</strong> tout à gauche de la barre d&apos;adresse du navigateur.</li>
              <li>Activez la permission <strong>« Caméra »</strong> sur <strong>« Autoriser »</strong> puis actualisez la page.</li>
              <li>Sur smartphone via adresse IP locale (HTTP) : utilisez le bouton <strong>« Importer Photo QR »</strong> pour charger la photo du badge directement.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Zone Caméra Déployée */}
      {isScanningCamera && (
        <div className="card p-5 bg-slate-900 text-white rounded-3xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-mono font-bold uppercase text-emerald-400 flex items-center gap-2">
              <Camera className="w-4 h-4" /> Caméra Active · Mode {scanPurpose === 'DECAISSEMENT' ? 'Certification Décaissement' : 'Encaissement Rapide'}
            </span>
            <button onClick={stopCamera} className="text-xs text-slate-400 hover:text-white cursor-pointer">
              Fermer
            </button>
          </div>
          <div className="w-full max-w-sm sm:max-w-md mx-auto overflow-hidden rounded-2xl bg-black border-2 border-emerald-500/50 shadow-2xl">
            <div id="qr-reader-region-treasurer" className="w-full"></div>
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            Pointez la caméra sur le badge QR du membre pour {scanPurpose === 'DECAISSEMENT' ? 'certifier la remise physique des fonds' : 'encaisser sa cotisation ou pénalité'}.
          </p>
        </div>
      )}

      {/* 2. Métriques Clés Télémétrie Caisse & Audit Croisé */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Recettes Cotisations */}
        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Total Cotisations</span>
            <div className="w-8 h-8 rounded-xl bg-[#E8F0FC] text-[#0B3D91] flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="telemetry-value mt-2 text-[#0B3D91] text-xl sm:text-2xl">
            {totalCollectedCotisations.toLocaleString('fr-FR')} <span className="text-xs font-bold text-slate-400 font-mono">FCFA</span>
          </p>
          <span className="text-[10px] sm:text-[11px] text-[#16A34A] flex items-center gap-1 mt-1 font-bold">
            <TrendingUp className="w-3 h-3" /> {totalPaidCount} réglé(s) ce mois
          </span>
        </div>

        {/* Recettes Pénalités */}
        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Pénalités Encaissées</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="telemetry-value mt-2 text-purple-700 text-xl sm:text-2xl">
            {totalPenaltiesCollected.toLocaleString('fr-FR')} <span className="text-xs font-bold text-slate-400 font-mono">FCFA</span>
          </p>
          <span className="text-[10px] sm:text-[11px] text-purple-600 mt-1 block font-bold">
            {paidPenalties.length} sanction(s) recouvrée(s)
          </span>
        </div>

        {/* Sorties Décaissements certifiés */}
        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Sorties / Décaissements</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <p className="telemetry-value mt-2 text-amber-700 text-xl sm:text-2xl">
            {totalDecaissementsAmount.toLocaleString('fr-FR')} <span className="text-xs font-bold text-slate-400 font-mono">FCFA</span>
          </p>
          <span className="text-[10px] sm:text-[11px] text-amber-600 mt-1 block font-bold">
            {decaissements.length} décaissement(s) par scan
          </span>
        </div>

        {/* Solde Net Disponible */}
        <div className="card p-4 sm:p-5 border-l-4 border-l-[#16A34A]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Solde Net de Caisse</span>
            <div className="w-8 h-8 rounded-xl bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center font-bold">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <p className="telemetry-value mt-2 text-[#16A34A] text-xl sm:text-2xl font-black">
            {soldeNetCaisse.toLocaleString('fr-FR')} <span className="text-xs font-bold text-slate-400 font-mono">FCFA</span>
          </p>
          <span className="text-[10px] sm:text-[11px] text-slate-500 mt-1 block font-medium">
            Entrées : {totalRecettesGlobales.toLocaleString('fr-FR')} FCFA
          </span>
        </div>
      </div>

      {/* 3. Onglets de Navigation Principale */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveMainTab('cotisations')}
          className={`pb-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeMainTab === 'cotisations'
              ? 'border-[#0B3D91] text-[#0B3D91]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>1. Cotisations &amp; Export MAC</span>
        </button>

        <button
          onClick={() => setActiveMainTab('penalites')}
          className={`pb-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeMainTab === 'penalites'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>2. Pénalités du Censeur ({pendingPenalties.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('commissaire_audit')}
          className={`pb-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeMainTab === 'commissaire_audit'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>3. Commissaire aux Comptes &amp; Décaissements ({decaissements.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveMainTab('tracabilite');
            refreshAuditAndDecaissements();
          }}
          className={`pb-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeMainTab === 'tracabilite'
              ? 'border-slate-800 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>4. Traçabilité &amp; Journal d&apos;Audit</span>
        </button>
      </div>

      {/* CONTENU ONGLET 1 : COTISATIONS */}
      {activeMainTab === 'cotisations' && (
        <div className="space-y-6 anim-fade-in">
          {/* Tarifs Officiels Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-blue-950 font-display block">Barème Officiel des Cotisations GIT-SJD</strong>
                <span className="text-blue-800">
                  Membres simples : <strong className="font-mono text-blue-950">{COTISATION_AMOUNT_MEMBER.toLocaleString('fr-FR')} FCFA/mois</strong> · Membres du Bureau : <strong className="font-mono text-blue-950">{COTISATION_AMOUNT_BUREAU.toLocaleString('fr-FR')} FCFA/mois</strong>.
                </span>
              </div>
            </div>
            <span className="pill-blue text-[11px] px-3 py-1 rounded-full font-bold self-start sm:self-auto shrink-0">
              Reçu PDF + Envoi WhatsApp
            </span>
          </div>

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
                  Cotisations des Membres &amp; Bureau ({membersFiltered.length})
                </h4>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto items-center">
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-300 text-xs w-full sm:w-auto">
                  <span className="text-slate-700 font-bold">Filtre :</span>
                  <select
                    value={filterNiveau}
                    onChange={(e) => setFilterNiveau(e.target.value)}
                    className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">Tous les membres</option>
                    <option value="GI_Bureau">Membres du Bureau (1 500 FCFA)</option>
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
              <table className="w-full text-left text-xs min-w-[650px]">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Matricule</th>
                    <th className="py-3 px-3">Nom &amp; Prénom</th>
                    <th className="py-3 px-3">Statut / Rôle</th>
                    <th className="py-3 px-3">Tarif Mensuel</th>
                    <th className="py-3 px-3">Statut Mois En Cours</th>
                    <th className="py-3 px-3">Pénalités</th>
                    <th className="py-3 px-3 text-right">Actions Caisse</th>
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
                    const unitPrice = getCotisationAmountForUser(member);
                    const isBureau = member.role !== 'MEMBER' || member.niveau === 'GI_Bureau';

                    return (
                      <tr key={member.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-3 font-mono text-[#0B3D91] font-bold">
                          {member.matricule}
                        </td>
                        <td className="py-3 px-3 text-slate-900 font-bold">
                          {member.nom} {member.prenom}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            isBureau ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {isBureau ? `BUREAU (${member.role})` : member.niveau}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          {unitPrice.toLocaleString('fr-FR')} FCFA
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
                              {pendingPens.length} ({pendingPens.reduce((s, p) => s + p.amount, 0).toLocaleString('fr-FR')} FCFA)
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

      {/* CONTENU ONGLET 2 : PÉNALITÉS DU CENSEUR */}
      {activeMainTab === 'penalites' && (
        <div className="card p-6 space-y-4 anim-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="section-label">Recouvrement Disciplinaire Censeur</span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 font-display">
                <ShieldAlert className="w-5 h-5 text-purple-700" />
                Registre des Pénalités &amp; Sanctions ({allPenalties.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Le montant perçu correspond exactement au prix enregistré par le censeur. Le paiement délivre un reçu certifié et lève les restrictions d&apos;accès.
              </p>
            </div>
          </div>

          {allPenalties.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Aucune pénalité n&apos;est actuellement consignée dans le système.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Membre Sanctionné</th>
                    <th className="py-3 px-3">Matricule</th>
                    <th className="py-3 px-3">Motif de la Sanction</th>
                    <th className="py-3 px-3">Montant Censeur</th>
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
                        <td className="py-3 px-3 font-bold text-purple-900 font-mono text-sm">
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
                                setWhatsappPhone(user.phone || '');
                              }}
                              className="btn-nasa py-1.5 px-3 text-xs font-bold cursor-pointer"
                            >
                              Encaisser {penalty.amount.toLocaleString('fr-FR')} FCFA
                            </button>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
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
                                className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition flex items-center gap-1 cursor-pointer"
                              >
                                <Download className="w-3 h-3" /> Reçu PDF
                              </button>
                              {user.phone && (
                                <button
                                  onClick={() => {
                                    sendReceiptViaWhatsApp({
                                      phone: user.phone!,
                                      receiptType: 'PENALITE',
                                      receiptNumber: `REC-${penalty.id.slice(-6)}`,
                                      member: user,
                                      amount: penalty.amount,
                                      method: penalty.paymentMethod || 'Espèces',
                                      details: `Règlement sanction : ${penalty.reason}`,
                                    });
                                  }}
                                  className="px-2.5 py-1 text-[11px] rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold transition flex items-center gap-1 cursor-pointer"
                                  title="Renvoyer sur WhatsApp"
                                >
                                  <Smartphone className="w-3 h-3 text-emerald-600" /> WhatsApp
                                </button>
                              )}
                            </div>
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

      {/* CONTENU ONGLET 3 : COMMISSAIRE AUX COMPTES & DÉCAISSEMENTS PAR SCAN QR */}
      {activeMainTab === 'commissaire_audit' && (
        <div className="space-y-6 anim-fade-in">
          {/* Fiche explicative Commissariat aux Comptes */}
          <div className="card p-6 border-l-4 border-l-amber-600 bg-white space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="section-label text-amber-700">Contrôle &amp; Certification Physique</span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 font-display">
                  <Scale className="w-5 h-5 text-amber-600" />
                  Commissariat aux Comptes &amp; Décaissements par Scan QR
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Le commissaire aux comptes décaisse les fonds en scannant obligatoirement le badge QR du membre bénéficiaire pour certifier la remise de l&apos;argent et faire un audit croisé avec la trésorière.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => startCamera('DECAISSEMENT')}
                  className="bg-amber-600 hover:bg-amber-700 text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition"
                >
                  <QrCode className="w-4 h-4 text-amber-200" />
                  <span>Nouveau Décaissement par Scan</span>
                </button>

                <button
                  onClick={() => {
                    setDecaissementMember(allUsers[0]);
                    setIsDecaissementModalOpen(true);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 px-3 rounded-xl text-xs font-bold border border-slate-300 flex items-center gap-1.5 cursor-pointer transition"
                >
                  <span>Sélection Manuelle</span>
                </button>
              </div>
            </div>

            {/* Rapprochement Financier Trésorière vs Commissaire */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 font-bold block uppercase tracking-wider text-[10px]">1. Total Recettes (Trésorière)</span>
                <p className="font-mono text-base font-black text-slate-900">
                  {totalRecettesGlobales.toLocaleString('fr-FR')} FCFA
                </p>
                <span className="text-[11px] text-slate-600 block">
                  Cotisations ({totalCollectedCotisations.toLocaleString('fr-FR')}) + Pénalités ({totalPenaltiesCollected.toLocaleString('fr-FR')})
                </span>
              </div>

              <div className="space-y-1 border-y md:border-y-0 md:border-x border-slate-200 py-2 md:py-0 md:px-4">
                <span className="text-slate-500 font-bold block uppercase tracking-wider text-[10px]">2. Total Décaissements (Commissaire)</span>
                <p className="font-mono text-base font-black text-amber-700">
                  - {totalDecaissementsAmount.toLocaleString('fr-FR')} FCFA
                </p>
                <span className="text-[11px] text-amber-800 block">
                  {decaissements.length} sortie(s) certifiée(s) par scan QR
                </span>
              </div>

              <div className="space-y-1 md:pl-2">
                <span className="text-slate-500 font-bold block uppercase tracking-wider text-[10px]">3. Rapprochement / Solde Net Théorique</span>
                <p className="font-mono text-base font-black text-emerald-700">
                  = {soldeNetCaisse.toLocaleString('fr-FR')} FCFA
                </p>
                <span className="text-[11px] text-emerald-800 block">
                  Disponible immédiatement dans le coffre
                </span>
              </div>
            </div>
          </div>

          {/* Registre des Décaissements archivés */}
          <div className="card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2 font-display">
                <ArrowDownLeft className="w-5 h-5 text-amber-600" />
                Grand Livre des Décaissements Certifiés ({decaissements.length})
              </h4>
            </div>

            {decaissements.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                Aucun décaissement n&apos;a encore été certifié dans l&apos;exercice en cours.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Réf</th>
                      <th className="py-3 px-3">Bénéficiaire Scanné</th>
                      <th className="py-3 px-3">Catégorie</th>
                      <th className="py-3 px-3">Motif du Décaissement</th>
                      <th className="py-3 px-3">Montant Remis</th>
                      <th className="py-3 px-3">Certification</th>
                      <th className="py-3 px-3 text-right">Bordereau</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {decaissements.map((dec) => (
                      <tr key={dec.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                          {new Date(dec.timestamp).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-900 font-bold">
                          {dec.reference}
                        </td>
                        <td className="py-3 px-3">
                          <strong className="text-slate-900 block font-display">{dec.memberName}</strong>
                          <span className="font-mono text-[#0B3D91] text-[11px]">{dec.memberMatricule}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {dec.beneficiaireCategory}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-800 max-w-xs">
                          {dec.motif}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-amber-800 text-sm">
                          {dec.amount.toLocaleString('fr-FR')} FCFA
                        </td>
                        <td className="py-3 px-3">
                          <span className="pill-green text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-max">
                            <ShieldCheck className="w-3 h-3" /> Scan Authentifié
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              generateDecaissementPdf({
                                receiptNumber: dec.reference,
                                member: {
                                  nom: dec.memberName.split(' ')[0] || '',
                                  prenom: dec.memberName.split(' ').slice(1).join(' ') || '',
                                  matricule: dec.memberMatricule,
                                },
                                commissaireName: dec.certifiedByCommissaireName,
                                amount: dec.amount,
                                motif: dec.motif,
                                beneficiaireCategory: dec.beneficiaireCategory,
                                date: new Date(dec.timestamp).toLocaleDateString('fr-FR'),
                              });
                              showToast('Bordereau PDF de décaissement téléchargé.');
                            }}
                            className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <Download className="w-3 h-3" /> Bordereau PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTENU ONGLET 4 : TRAÇABILITÉ & JOURNAL D'AUDIT COMPLET */}
      {activeMainTab === 'tracabilite' && (
        <div className="card p-6 space-y-4 anim-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="section-label">Sécurité &amp; Transparence</span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 font-display">
                <History className="w-5 h-5 text-slate-800" />
                Journal Général d&apos;Audit &amp; Traçabilité des Actions Administratives ({auditLogs.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Chaque action sensible (encaissements, décaissements, pénalités, réinitialisations de mot de passe, rôles) est immuablement tracée pour les administrateurs.
              </p>
            </div>

            <button
              onClick={refreshAuditAndDecaissements}
              className="btn-nasa py-2 px-3 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Actualiser</span>
            </button>
          </div>

          {/* Filtres d'audit */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={auditFilterAction}
                onChange={(e) => setAuditFilterAction(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none cursor-pointer w-full sm:w-auto"
              >
                <option value="ALL">Toutes les actions</option>
                <option value="COTISATION_ENCAISSEE">Cotisations Encaissées</option>
                <option value="PENALITE_PAYEE">Pénalités Réglées</option>
                <option value="PENALITE_ENREGISTREE">Pénalités Enregistrées</option>
                <option value="DECAISSEMENT_SCAN_CERTIFIE">Décaissements Certifiés par Scan</option>
                <option value="MOT_DE_PASSE_REINITIALISE">Mots de passe réinitialisés</option>
                <option value="ROLE_MODIFIE">Changements de rôle</option>
              </select>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Filtrer par acteur, cible ou détails..."
                value={auditSearchQuery}
                onChange={(e) => setAuditSearchQuery(e.target.value)}
                className="input-nasa pl-9 text-xs w-full"
              />
            </div>
          </div>

          {/* Liste chronologique d'audit */}
          {filteredAuditLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Aucun log d&apos;action ne correspond à ces critères.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
              {filteredAuditLogs.map((log) => {
                const getActionBadge = (action: AuditActionType) => {
                  switch (action) {
                    case 'COTISATION_ENCAISSEE':
                      return { label: 'Cotisation Encaissée', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
                    case 'PENALITE_PAYEE':
                      return { label: 'Pénalité Réglée', bg: 'bg-purple-50 text-purple-800 border-purple-300' };
                    case 'PENALITE_ENREGISTREE':
                      return { label: 'Pénalité Émise', bg: 'bg-rose-50 text-rose-800 border-rose-300' };
                    case 'DECAISSEMENT_SCAN_CERTIFIE':
                      return { label: 'Décaissement par Scan', bg: 'bg-amber-50 text-amber-800 border-amber-300' };
                    case 'MOT_DE_PASSE_REINITIALISE':
                      return { label: 'Reset Mot de Passe', bg: 'bg-blue-50 text-blue-800 border-blue-300' };
                    case 'ROLE_MODIFIE':
                      return { label: 'Rôle Modifié', bg: 'bg-indigo-50 text-indigo-800 border-indigo-300' };
                    default:
                      return { label: action, bg: 'bg-slate-100 text-slate-800 border-slate-300' };
                  }
                };

                const badge = getActionBadge(log.action);

                return (
                  <div
                    key={log.id}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {new Date(log.timestamp).toLocaleString('fr-FR')}
                        </span>
                        <span className="text-slate-700 font-medium">
                          par <strong className="text-slate-900">{log.actorName}</strong> ({log.actorRole})
                        </span>
                      </div>
                      <p className="text-slate-800 font-medium">
                        {log.details}
                      </p>
                    </div>

                    {log.targetName && (
                      <div className="sm:text-right shrink-0 bg-white p-2 rounded-lg border border-slate-200 sm:bg-transparent sm:border-0 sm:p-0">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Membre ciblé</span>
                        <strong className="text-slate-900 block font-display">{log.targetName}</strong>
                        {log.targetMatricule && (
                          <span className="font-mono text-[#0B3D91] text-[11px]">{log.targetMatricule}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. MODAL D'ENCAISSEMENT RAPIDE (COTISATIONS & PÉNALITÉS + WHATSAPP) - 100% RESPONSIVE SMARTPHONE */}
      {modalMember && (
        <div className="modal-backdrop">
          <div className="modal-card max-w-lg w-full bg-white flex flex-col max-h-[92dvh] sm:max-h-[88vh] overflow-hidden rounded-2xl shadow-2xl">
            {/* Header fixe du modal */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#16A34A] shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display leading-tight">Guichet d&apos;Encaissement</h3>
                  <p className="text-[11px] text-slate-500 leading-tight">Reçu certifié &amp; transmission WhatsApp</p>
                </div>
              </div>
              <button
                onClick={() => setModalMember(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer shrink-0"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Corps scrollable du modal */}
            <div className="overflow-y-auto custom-scrollbar p-4 sm:p-5 space-y-4 flex-1">
              {/* Fiche du membre scanné / sélectionné */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Membre :</span>
                  <span className="font-bold text-slate-900 text-right">{modalMember.nom} {modalMember.prenom}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Matricule &amp; Rôle :</span>
                  <span className="font-mono text-[#0B3D91] font-bold">
                    {modalMember.matricule} ({modalMember.role})
                  </span>
                </div>
                <div className="flex items-center justify-between pt-0.5 border-t border-slate-200/60">
                  <span className="text-slate-500">Tarif Cotisation Applicable :</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    {getCotisationAmountForUser(modalMember).toLocaleString('fr-FR')} FCFA / mois
                  </span>
                </div>
              </div>

              {/* Sélecteur de type d'encaissement (Cotisation vs Pénalité) */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setModalTab('cotisation')}
                  className={`py-2 px-2 text-xs font-bold rounded-lg transition cursor-pointer text-center ${
                    modalTab === 'cotisation'
                      ? 'bg-white text-[#0B3D91] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  1. Cotisation ({getCotisationAmountForUser(modalMember).toLocaleString('fr-FR')} F)
                </button>

                <button
                  type="button"
                  onClick={() => setModalTab('penalite')}
                  className={`py-2 px-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    modalTab === 'penalite'
                      ? 'bg-white text-purple-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>2. Pénalités</span>
                  {modalMember.penalties && modalMember.penalties.filter(p => p.status === 'PENDING').length > 0 && (
                    <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[10px]">
                      {modalMember.penalties.filter(p => p.status === 'PENDING').length}
                    </span>
                  )}
                </button>
              </div>

              {/* FORMULAIRE A : COTISATIONS */}
              {modalTab === 'cotisation' && (
                <form id="cotisation-form" onSubmit={handleConfirmCotisation} className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Mois à régler ({getCotisationAmountForUser(modalMember).toLocaleString('fr-FR')} FCFA / mois)
                    </label>
                    {/* Grille responsive 3 colonnes sur mobile, 5 colonnes sur desktop */}
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
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
                            className={`p-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer min-h-[40px] flex flex-col items-center justify-center ${
                              alreadyPaid
                                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                : isSelected
                                ? 'bg-[#0B3D91] border-[#0B3D91] text-white shadow-xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-[#0B3D91]'
                            }`}
                          >
                            <span>{MONTH_NAMES[moisNum - 1]}</span>
                            {alreadyPaid && <span className="text-[9px] text-[#16A34A] leading-none">Réglé</span>}
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
                          className={`p-2 rounded-xl text-xs font-bold border transition cursor-pointer min-h-[40px] ${
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

                  {/* Numéro WhatsApp pour transmission instantanée du reçu */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                        Numéro WhatsApp du Membre
                      </label>
                      <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sendWhatsAppOnConfirm}
                          onChange={(e) => setSendWhatsAppOnConfirm(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Envoyer reçu</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder="Ex: 677000000 ou 237677000000"
                      value={whatsappPhone}
                      onChange={(e) => setWhatsappPhone(e.target.value)}
                      className="input-nasa font-mono text-xs w-full"
                    />
                  </div>

                  {/* Total */}
                  <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-[#16A34A]">Total à encaisser :</span>
                    <span className="text-base sm:text-lg font-black text-slate-900 font-display">
                      {(selectedMonthsToPay.length * getCotisationAmountForUser(modalMember)).toLocaleString('fr-FR')} FCFA
                    </span>
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
                            Aucune pénalité ou sanction n&apos;est actuellement en attente pour {modalMember.nom} {modalMember.prenom}.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        <p className="text-xs text-slate-600">
                          Sélectionnez la pénalité à solder. Le montant exact fixé par le censeur ({selectedPenalty ? selectedPenalty.amount.toLocaleString('fr-FR') : '...'} FCFA) est appliqué.
                        </p>

                        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
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
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                                  selectedPenalty?.id === p.id
                                    ? 'bg-purple-700 text-white'
                                    : 'bg-white text-purple-700 border border-purple-300 hover:bg-purple-50'
                                }`}
                              >
                                {selectedPenalty?.id === p.id ? 'Choisi' : 'Choisir'}
                              </button>
                            </div>
                          ))}
                        </div>

                        {selectedPenalty && (
                          <div className="space-y-3 pt-2 border-t border-slate-100">
                            {/* Mode de règlement pénalité */}
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                                Mode de règlement
                              </label>
                              <div className="grid grid-cols-3 gap-2">
                                {['Espèces', 'Mobile Money', 'Virement'].map((m) => (
                                  <button
                                    type="button"
                                    key={m}
                                    onClick={() => setPaymentMethod(m)}
                                    className={`p-2 rounded-xl text-xs font-bold border transition cursor-pointer min-h-[40px] ${
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
                                Numéro WhatsApp (Envoi reçu)
                              </label>
                              <input
                                type="text"
                                placeholder="Ex: 677000000"
                                value={whatsappPhone}
                                onChange={(e) => setWhatsappPhone(e.target.value)}
                                className="input-nasa font-mono text-xs w-full"
                              />
                            </div>

                            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between text-xs">
                              <span className="font-bold text-purple-900">Montant exact fixé par le Censeur :</span>
                              <span className="text-base font-black text-purple-950 font-display">
                                {selectedPenalty.amount.toLocaleString('fr-FR')} FCFA
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Footer fixe avec boutons d'action toujours visibles */}
            <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setModalMember(null)}
                className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer min-h-[44px]"
              >
                Annuler
              </button>

              {modalTab === 'cotisation' ? (
                <button
                  type="submit"
                  form="cotisation-form"
                  disabled={selectedMonthsToPay.length === 0}
                  className="btn-nasa flex-1 py-3 text-xs font-bold cursor-pointer disabled:opacity-50 min-h-[44px]"
                >
                  Valider &amp; Reçu
                </button>
              ) : selectedPenalty ? (
                <button
                  type="button"
                  disabled={isProcessingPenaltyPay}
                  onClick={() => handleConfirmPenaltyPay(selectedPenalty)}
                  className="bg-purple-700 hover:bg-purple-800 text-white flex-1 py-3 rounded-xl text-xs font-bold cursor-pointer transition shadow-md min-h-[44px]"
                >
                  {isProcessingPenaltyPay
                    ? 'Validation...'
                    : `Payer ${selectedPenalty.amount.toLocaleString('fr-FR')} F & Reçu`}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL DE DÉCAISSEMENT PAR SCAN QR (COMMISSAIRE AUX COMPTES) - 100% RESPONSIVE SMARTPHONE */}
      {isDecaissementModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card max-w-lg w-full bg-white flex flex-col max-h-[92dvh] sm:max-h-[88vh] overflow-hidden rounded-2xl shadow-2xl">
            {/* Header fixe */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display leading-tight">Bordereau de Décaissement</h3>
                  <p className="text-[11px] text-slate-500 leading-tight">Certification Commissaire aux Comptes</p>
                </div>
              </div>
              <button
                onClick={() => setIsDecaissementModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer shrink-0"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Corps scrollable */}
            <div className="overflow-y-auto custom-scrollbar p-4 sm:p-5 space-y-4 flex-1">
              {/* Récipiendaire scanné ou sélectionné */}
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-amber-900 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Récipiendaire Authentifié
                  </span>
                  <span className="pill-green text-[10px] px-2 py-0.5 rounded-full font-bold">
                    Badge QR Validé
                  </span>
                </div>
                {decaissementMember ? (
                  <div className="text-slate-900">
                    <strong className="text-sm block font-display">{decaissementMember.nom} {decaissementMember.prenom}</strong>
                    <span className="font-mono text-[#0B3D91] text-xs font-bold">{decaissementMember.matricule}</span>
                    <span className="text-slate-500 ml-2">({decaissementMember.niveau} · {decaissementMember.role})</span>
                  </div>
                ) : (
                  <div className="text-slate-500 italic">Aucun membre sélectionné.</div>
                )}
              </div>

              {/* Formulaire de décaissement */}
              <form id="decaissement-form" onSubmit={handleConfirmDecaissement} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Montant à Décaisser (FCFA) *
                  </label>
                  <input
                    type="number"
                    min="500"
                    step="500"
                    required
                    value={decaissementAmount}
                    onChange={(e) => setDecaissementAmount(Number(e.target.value))}
                    className="input-nasa font-mono text-sm w-full font-bold text-amber-900"
                    placeholder="Ex: 15000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Catégorie du Décaissement *
                  </label>
                  <select
                    value={decaissementCategory}
                    onChange={(e) => setDecaissementCategory(e.target.value as any)}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none cursor-pointer w-full"
                  >
                    <option value="PROJET_LABO">Projet R&amp;D &amp; Matériel Laboratoire</option>
                    <option value="EVENEMENT">Événement &amp; Organisation Hackathon</option>
                    <option value="MEMBRE">Dédommagement / Frais de Mission Membre</option>
                    <option value="FOURNISSEUR">Règlement Prestataire / Fournisseur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Motif Précis &amp; Justification *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={decaissementMotif}
                    onChange={(e) => setDecaissementMotif(e.target.value)}
                    placeholder="Ex: Achat composants électroniques ESP32, capteurs LoRa et bobines pour le labo..."
                    className="input-nasa text-xs w-full resize-none"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <span className="font-bold text-slate-900 block">Certificat de conformité :</span>
                  <p>
                    Ce décaissement sera contresigné numériquement par <strong className="text-slate-900">{currentUser.nom} {currentUser.prenom}</strong> ({currentUser.role}) et consigné dans le Grand Livre.
                  </p>
                </div>
              </form>
            </div>

            {/* Footer fixe */}
            <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsDecaissementModalOpen(false)}
                className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer min-h-[44px]"
              >
                Annuler
              </button>
              <button
                type="submit"
                form="decaissement-form"
                className="bg-amber-600 hover:bg-amber-700 text-white flex-1 py-3 rounded-xl text-xs font-bold cursor-pointer transition shadow-md min-h-[44px]"
              >
                Certifier &amp; Bordereau PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
