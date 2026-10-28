'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  ScanResult, 
  Penalty,
  CURRENT_MONTH, 
  CURRENT_YEAR, 
  MONTH_NAMES 
} from '@/lib/types';
import { playSuccessTone, playErrorTone } from '@/lib/store';
import { useAuth } from '@/context/AuthContext';
import { 
  Scan, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  History, 
  Camera, 
  Volume2, 
  UserCheck, 
  Sparkles,
  QrCode,
  AlertTriangle,
  Search,
  X,
  UserX,
  Clock,
  Send,
  PlusCircle,
  FileWarning
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface CenseurViewProps {
  allUsers: User[];
  currentUser?: User;
}

export default function CenseurView({ allUsers, currentUser }: CenseurViewProps) {
  const { issuePenalty } = useAuth();

  // Navigation d'onglets Censeur
  const [activeTab, setActiveTab] = useState<'scan' | 'penalties'>('scan');

  // Scanner caméra
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [isScanningCamera, setIsScanningCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Modal de pénalité directe (après scan)
  const [penaltyTargetMember, setPenaltyTargetMember] = useState<User | null>(null);
  const [penaltyReason, setPenaltyReason] = useState('Non-respect des consignes de sécurité');
  const [penaltyAmount, setPenaltyAmount] = useState(1000);
  const [isSubmittingPenalty, setIsSubmittingPenalty] = useState(false);

  // Modal de refus de scan (Recherche manuelle & Transmission admin)
  const [isRefusalModalOpen, setIsRefusalModalOpen] = useState(false);
  const [refusalSearchQuery, setRefusalSearchQuery] = useState('');
  const [selectedRefusalMember, setSelectedRefusalMember] = useState<User | null>(null);
  const [refusalReason, setRefusalReason] = useState('Refus catégorique de présentation du badge QR Code au poste de filtrage');
  const [refusalAmount, setRefusalAmount] = useState(1000);
  const [isSubmittingRefusal, setIsSubmittingRefusal] = useState(false);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Traitement central du QR Code scanné
  const processScanData = (rawText: string) => {
    let targetUserId = '';
    
    // Décodage du format GIT:ACCESS:<userId>:<jwt> ou identifiant brut
    if (rawText.startsWith('GIT:ACCESS:')) {
      targetUserId = rawText.split(':')[2];
    } else if (rawText.startsWith('GIT:PAYMENT:')) {
      targetUserId = rawText.split(':')[2];
    } else {
      targetUserId = rawText.trim();
    }

    const member = allUsers.find(
      (u) => u.id === targetUserId || u.matricule.toLowerCase() === targetUserId.toLowerCase()
    );

    const nowStr = new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    if (!member) {
      playErrorTone();
      const res: ScanResult = {
        allowed: false,
        reason: 'QR Code non reconnu ou signature cryptographique invalide',
        timestamp: nowStr,
      };
      setLastScanResult(res);
      setScanHistory((prev) => [res, ...prev.slice(0, 19)]);
      return;
    }

    // Vérifier cotisation du mois courant et pénalités impayées
    const cotCurrent = member.cotisations?.find(
      (c) => c.mois === CURRENT_MONTH && c.annee === CURRENT_YEAR
    );
    const isPaid = !!cotCurrent?.isPaid;

    const pendingPenalties = (member.penalties || []).filter(p => p.status === 'PENDING');
    const hasUnpaidPenalties = pendingPenalties.length > 0;

    if (isPaid && member.isActive && !hasUnpaidPenalties) {
      playSuccessTone();
      const res: ScanResult = {
        allowed: true,
        user: member,
        matricule: member.matricule,
        reason: 'Cotisation à jour. Aucune pénalité. Accès Laboratoire & Wi-Fi AUTORISÉ.',
        timestamp: nowStr,
      };
      setLastScanResult(res);
      setScanHistory((prev) => [res, ...prev.slice(0, 19)]);
    } else {
      playErrorTone();
      let denialReason = '';
      if (hasUnpaidPenalties) {
        denialReason = `Sanction disciplinaire en attente : ${pendingPenalties.length} pénalité(s) impayée(s) (${pendingPenalties.reduce((sum, p) => sum + p.amount, 0)} FCFA).`;
      } else if (!isPaid) {
        const moisNom = MONTH_NAMES[CURRENT_MONTH - 1];
        denialReason = `Cotisation du mois de ${moisNom} non réglée.`;
      } else {
        denialReason = 'Compte suspendu par l\'Administration.';
      }

      const res: ScanResult = {
        allowed: false,
        user: member,
        matricule: member.matricule,
        reason: `${denialReason} Accès suspendu.`,
        timestamp: nowStr,
      };
      setLastScanResult(res);
      setScanHistory((prev) => [res, ...prev.slice(0, 19)]);
    }
  };

  // Démarrer la caméra
  const startCamera = async () => {
    try {
      setCameraError(null);
      setIsScanningCamera(true);

      const html5QrCode = new Html5Qrcode('qr-reader-region-censeur');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          processScanData(decodedText);
        },
        () => {}
      );
    } catch (err) {
      console.error(err);
      setCameraError('Impossible d\'accéder à la caméra. Vérifiez les autorisations de votre appareil.');
      setIsScanningCamera(false);
    }
  };

  // Stopper la caméra
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

  // Soumission d'une pénalité directe (après scan d'un membre)
  const handleConfirmDirectPenalty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!penaltyTargetMember) return;

    setIsSubmittingPenalty(true);
    const res = await issuePenalty({
      userId: penaltyTargetMember.id,
      censorId: currentUser?.id || 'censor_default',
      reason: penaltyReason.trim() || 'Infraction aux règles du laboratoire',
      amount: Number(penaltyAmount) || 1000,
      isRefusal: false,
    });
    setIsSubmittingPenalty(false);

    showToast(res.message);
    setPenaltyTargetMember(null);
  };

  // Soumission d'une demande de pénalité pour Refus de Scan
  const handleConfirmRefusalPenalty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRefusalMember) {
      showToast('Veuillez sélectionner le membre concerné.');
      return;
    }

    setIsSubmittingRefusal(true);
    const res = await issuePenalty({
      userId: selectedRefusalMember.id,
      censorId: currentUser?.id || 'censor_default',
      reason: refusalReason.trim(),
      amount: Number(refusalAmount) || 1000,
      isRefusal: true,
    });
    setIsSubmittingRefusal(false);

    showToast(res.message);
    setIsRefusalModalOpen(false);
    setSelectedRefusalMember(null);
    setRefusalSearchQuery('');
  };

  // Recherche des membres pour le refus de scan
  const refusalCandidates = allUsers
    .filter(u => u.role === 'MEMBER')
    .filter(u => {
      const q = refusalSearchQuery.trim().toLowerCase();
      if (!q) return false;
      return (
        u.nom.toLowerCase().includes(q) ||
        u.prenom.toLowerCase().includes(q) ||
        u.matricule.toLowerCase().includes(q)
      );
    })
    .slice(0, 6);

  // Toutes les pénalités pour l'onglet d'historique
  const allPenaltiesList = allUsers.flatMap((u) =>
    (u.penalties || []).map((p) => ({ penalty: p, member: u }))
  );

  const studentMembers = allUsers.filter((u) => u.role === 'MEMBER').slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 max-w-sm sm:max-w-md">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-xs font-bold leading-snug">{toast}</span>
        </div>
      )}

      {/* 1. Bannière d'état du Censeur avec Bouton de Refus de Scan */}
      <div className="card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border-l-4 border-l-[#0B3D91] bg-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#E8F0FC] border border-[#C7D7F8] flex items-center justify-center text-[#0B3D91] shadow-xs shrink-0">
            <Scan className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="section-label mb-0">Poste de Filtrage Labo</span>
              <span className="pill-green text-[10px] px-2 py-0.5 rounded-full font-bold">
                Contrôle Actif
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display mt-0.5">
              Guichet de Contrôle &amp; Discipline du Censeur
            </h2>
            <p className="text-xs text-slate-500">
              Scannez le badge QR du membre. Si le membre refuse le scan, recherchez son matricule pour transmettre une demande de sanction aux administrateurs.
            </p>
          </div>
        </div>

        {/* Actions Principales Censeur */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Bouton Refus de scan */}
          <button
            onClick={() => {
              setIsRefusalModalOpen(true);
              setSelectedRefusalMember(null);
            }}
            className="w-full sm:w-auto py-3 px-4 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center gap-2 cursor-pointer shadow-md transition"
          >
            <UserX className="w-4 h-4" />
            <span>Refus de Scan / Pénaliser</span>
          </button>

          {/* Bouton Caméra */}
          {!isScanningCamera ? (
            <button
              onClick={startCamera}
              className="btn-nasa w-full sm:w-auto py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Camera className="w-4 h-4" />
              <span>Activer Caméra Scanner</span>
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="btn-nasa-red w-full sm:w-auto py-3 px-4 text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer shadow-md rounded-xl"
            >
              <XCircle className="w-4 h-4" />
              <span>Arrêter Caméra</span>
            </button>
          )}
        </div>
      </div>

      {cameraError && (
        <div className="p-4 pill-red rounded-xl text-xs flex items-center gap-2">
          <XCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
          <span>{cameraError} Vous pouvez utiliser les boutons de simulation ou déclarer un refus de scan.</span>
        </div>
      )}

      {/* Zone Caméra Scanner (100% Responsive) */}
      {isScanningCamera && (
        <div className="card p-5 bg-slate-900 text-white rounded-3xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-mono font-bold uppercase text-blue-400 flex items-center gap-2">
              <Camera className="w-4 h-4" /> Scanner Actif · Alignez le QR Code dans le cadre
            </span>
            <button onClick={stopCamera} className="text-xs text-slate-400 hover:text-white cursor-pointer">
              Fermer
            </button>
          </div>
          <div className="w-full max-w-sm sm:max-w-md mx-auto overflow-hidden rounded-2xl bg-black border-2 border-blue-500/50 shadow-2xl">
            <div id="qr-reader-region-censeur" className="w-full"></div>
          </div>
        </div>
      )}

      {/* Résultat du dernier scan : Écran Contrasté Vert / Rouge + Bouton Pénaliser */}
      {lastScanResult && (
        <div
          className={`p-6 sm:p-8 rounded-3xl transition-all duration-300 shadow-lg ${
            lastScanResult.allowed
              ? 'result-granted text-emerald-950'
              : 'result-denied text-rose-950'
          }`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div
                className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-md shrink-0 ${
                  lastScanResult.allowed ? 'bg-[#16A34A] text-white' : 'bg-[#DC2626] text-white'
                }`}
              >
                {lastScanResult.allowed ? (
                  <CheckCircle2 className="w-12 h-12" />
                ) : (
                  <XCircle className="w-12 h-12" />
                )}
              </div>

              <div>
                <span
                  className={`text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full inline-block mb-1.5 ${
                    lastScanResult.allowed ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}
                >
                  {lastScanResult.allowed ? '● ACCÈS AUTORISÉ' : '● ACCÈS REFUSÉ'}
                </span>

                {lastScanResult.user ? (
                  <h3 className="text-2xl font-black text-slate-900 font-display tracking-tight">
                    {lastScanResult.user.nom} {lastScanResult.user.prenom}
                  </h3>
                ) : (
                  <h3 className="text-xl font-bold text-slate-900 font-display">Membre Inconnu</h3>
                )}

                <p className="text-sm font-semibold mt-1">
                  {lastScanResult.reason}
                </p>

                {lastScanResult.user && (
                  <div className="flex flex-wrap gap-2 mt-2 text-xs">
                    <span className="px-2.5 py-0.5 bg-white/70 rounded-md font-mono font-bold text-slate-800 border border-slate-300">
                      Matricule: {lastScanResult.user.matricule}
                    </span>
                    <span className="px-2.5 py-0.5 bg-white/70 rounded-md font-bold text-slate-800 border border-slate-300">
                      Niveau: {lastScanResult.user.niveau}
                    </span>
                    <span className="px-2.5 py-0.5 bg-white/70 rounded-md font-medium text-slate-700 border border-slate-300">
                      Pénalités: {(lastScanResult.user.penalties || []).filter(p => p.status === 'PENDING').length} impayée(s)
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-3 shrink-0 w-full sm:w-auto">
              <div className="text-center sm:text-right">
                <span className="text-[11px] font-semibold uppercase opacity-75 block">Heure de passage</span>
                <span className="text-xl font-mono font-black text-slate-900">
                  {lastScanResult.timestamp}
                </span>
              </div>

              {/* Bouton pour pénaliser le membre scanné */}
              {lastScanResult.user && (
                <button
                  onClick={() => {
                    setPenaltyTargetMember(lastScanResult.user!);
                    setPenaltyReason('Infraction constatée lors du filtrage au laboratoire');
                    setPenaltyAmount(1000);
                  }}
                  className="py-2 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition w-full sm:w-auto"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-300" />
                  <span>Infliger une Pénalité à ce membre</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Onglets de contrôle Censeur */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('scan')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'scan'
              ? 'border-[#0B3D91] text-[#0B3D91]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scan className="w-4 h-4" />
          <span>Poste de Scan &amp; Simulations</span>
        </button>

        <button
          onClick={() => setActiveTab('penalties')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'penalties'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileWarning className="w-4 h-4" />
          <span>Journal des Sanctions du Censeur ({allPenaltiesList.length})</span>
        </button>
      </div>

      {activeTab === 'scan' && (
        <div className="space-y-6 anim-fade-in">
          {/* Simulation rapide */}
          <div className="card p-6 space-y-4">
            <div>
              <span className="section-label">Outil de Contrôle Rapide</span>
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2 font-display">
                <Sparkles className="w-4 h-4 text-[#FC3D21]" />
                Simulateur de Scan Rapide (Membres Étudiants)
              </h4>
              <p className="text-xs text-slate-500">
                Testez immédiatement le filtrage et la sanction d&apos;un membre en un clic.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {studentMembers.map((student) => {
                const isStudentPaid = student.cotisations?.some(
                  (c) => c.mois === CURRENT_MONTH && c.isPaid
                );
                const hasPending = (student.penalties || []).some(p => p.status === 'PENDING');

                return (
                  <div
                    key={student.id}
                    className="p-4 rounded-2xl border bg-white border-slate-200 hover:border-slate-400 transition flex flex-col justify-between shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-[#0B3D91] font-bold">{student.matricule}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                            isStudentPaid && !hasPending ? 'pill-green' : 'pill-red'
                          }`}
                        >
                          {isStudentPaid && !hasPending ? 'À jour' : hasPending ? 'Pénalité' : 'Impayé'}
                        </span>
                      </div>
                      <h5 className="font-bold text-slate-900 text-sm">
                        {student.nom} {student.prenom}
                      </h5>
                      <p className="text-xs text-slate-500 font-medium">{student.niveau}</p>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => processScanData(`GIT:ACCESS:${student.id}:TOKEN`)}
                        className="text-xs text-[#0B3D91] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" /> Scanner
                      </button>

                      <button
                        onClick={() => {
                          setPenaltyTargetMember(student);
                          setPenaltyReason('Retard / Dégradation constatée');
                          setPenaltyAmount(1000);
                        }}
                        className="text-xs text-purple-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Pénaliser
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Journal des passages */}
          <div className="card p-6">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4 font-display">
              <History className="w-4 h-4 text-[#0B3D91]" />
              Journal des Passages au Guichet ({scanHistory.length})
            </h4>

            {scanHistory.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                Aucun passage enregistré pour l&apos;instant. Activez la caméra ou simulez un scan ci-dessus.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[550px]">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Heure</th>
                      <th className="py-2.5 px-3">Membre</th>
                      <th className="py-2.5 px-3">Matricule</th>
                      <th className="py-2.5 px-3">Décision</th>
                      <th className="py-2.5 px-3">Motif</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {scanHistory.map((scan, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition">
                        <td className="py-2.5 px-3 font-mono text-slate-500 font-bold">{scan.timestamp}</td>
                        <td className="py-2.5 px-3 text-slate-900 font-bold">
                          {scan.user ? `${scan.user.nom} ${scan.user.prenom}` : 'Inconnu'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#0B3D91] font-bold">{scan.matricule || '-'}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] border inline-block ${
                              scan.allowed ? 'pill-green' : 'pill-red'
                            }`}
                          >
                            {scan.allowed ? 'AUTORISÉ' : 'REFUSÉ'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{scan.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Onglet 2 : Journal des Pénalités Censeur */}
      {activeTab === 'penalties' && (
        <div className="card p-6 space-y-4 anim-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="section-label">Régime Disciplinaire</span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 font-display">
                <FileWarning className="w-5 h-5 text-purple-700" />
                Sanctions Consignées &amp; Signalements
              </h3>
              <p className="text-xs text-slate-500">
                Suivi du traitement administratif et de l&apos;encaissement à la trésorerie.
              </p>
            </div>

            <button
              onClick={() => {
                setIsRefusalModalOpen(true);
                setSelectedRefusalMember(null);
              }}
              className="btn-nasa py-2.5 px-4 text-xs font-bold cursor-pointer flex items-center gap-2"
            >
              <UserX className="w-4 h-4" />
              <span>Nouveau Signalement Refus de Scan</span>
            </button>
          </div>

          {allPenaltiesList.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              Aucune sanction émise pour le moment.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[650px]">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Membre</th>
                    <th className="py-3 px-3">Matricule</th>
                    <th className="py-3 px-3">Type &amp; Motif</th>
                    <th className="py-3 px-3">Montant</th>
                    <th className="py-3 px-3">État Validation / Paiement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {allPenaltiesList.map(({ penalty, member }) => {
                    const isRefusal = penalty.reason.includes('[DEMANDE_ADMIN_REFUS_SCAN]');
                    const isApproved = penalty.reason.includes('[VALIDÉ_PAR_ADMIN]');
                    const isPaid = penalty.status === 'PAID';
                    const isCancelled = penalty.status === 'CANCELLED';

                    return (
                      <tr key={penalty.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                          {new Date(penalty.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-3 px-3 text-slate-900 font-bold">
                          {member.nom} {member.prenom}
                        </td>
                        <td className="py-3 px-3 font-mono text-[#0B3D91] font-bold">
                          {member.matricule}
                        </td>
                        <td className="py-3 px-3 text-slate-700 max-w-xs">
                          {isRefusal && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 mr-1.5">
                              Refus de scan
                            </span>
                          )}
                          <span>{penalty.reason.replace(/\[.*?\]\s*/g, '')}</span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          {penalty.amount.toLocaleString('fr-FR')} FCFA
                        </td>
                        <td className="py-3 px-3">
                          {isPaid ? (
                            <span className="pill-green text-[10px] px-2 py-0.5 rounded-full font-bold">
                              Payée chez la Trésorière
                            </span>
                          ) : isCancelled ? (
                            <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold">
                              Rejetée par l&apos;Admin
                            </span>
                          ) : isRefusal && !isApproved ? (
                            <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                              En attente validation Bureau
                            </span>
                          ) : (
                            <span className="pill-red text-[10px] px-2 py-0.5 rounded-full font-bold">
                              Validée · À régler chez la Trésorière
                            </span>
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

      {/* MODAL 1 : PÉNALISER DIRECTEMENT UN MEMBRE SCANNÉ */}
      {penaltyTargetMember && (
        <div className="modal-backdrop">
          <div className="modal-card p-5 sm:p-6 space-y-4 max-w-md w-full bg-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">Infliger une Sanction</h3>
                  <p className="text-xs text-slate-500">Poste de contrôle du Censeur</p>
                </div>
              </div>
              <button
                onClick={() => setPenaltyTargetMember(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-purple-800 font-medium">Membre :</span>
                <strong className="text-slate-900">{penaltyTargetMember.nom} {penaltyTargetMember.prenom}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-800 font-medium">Matricule :</span>
                <span className="font-mono font-bold text-[#0B3D91]">{penaltyTargetMember.matricule}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-800 font-medium">Niveau :</span>
                <span className="font-bold text-slate-800">{penaltyTargetMember.niveau}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmDirectPenalty} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Motif de l&apos;infraction *
                </label>
                <select
                  value={penaltyReason}
                  onChange={(e) => setPenaltyReason(e.target.value)}
                  className="input-nasa text-xs w-full mb-2 cursor-pointer font-medium"
                >
                  <option value="Non-respect des consignes de sécurité et du règlement labo">
                    Non-respect des consignes de sécurité et du règlement labo
                  </option>
                  <option value="Retard injustifié à l'atelier ou séance de travaux pratiques">
                    Retard injustifié à l'atelier / séance pratique
                  </option>
                  <option value="Absence de blouse obligatoire / Équipement de protection">
                    Absence de blouse obligatoire
                  </option>
                  <option value="Comportement perturbateur ou indiscipline caractérisée">
                    Comportement perturbateur / indiscipline
                  </option>
                  <option value="Dégradation ou manipulation risquée du matériel expérimental">
                    Dégradation ou manipulation risquée du matériel
                  </option>
                  <option value="Autre infraction constatée">Autre motif</option>
                </select>

                <input
                  type="text"
                  placeholder="Préciser le motif ou détail..."
                  value={penaltyReason}
                  onChange={(e) => setPenaltyReason(e.target.value)}
                  className="input-nasa text-xs w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Montant de la pénalité (FCFA) *
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[500, 1000, 2000, 5000].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setPenaltyAmount(amt)}
                      className={`p-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        penaltyAmount === amt
                          ? 'bg-purple-700 text-white border-purple-700'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-purple-300'
                      }`}
                    >
                      {amt.toLocaleString('fr-FR')}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={penaltyAmount}
                  onChange={(e) => setPenaltyAmount(Number(e.target.value))}
                  className="input-nasa text-xs font-mono font-bold w-full"
                  required
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                <strong>Règle CDC :</strong> Cette sanction sera exigible immédiatement. Le membre devra la solder auprès de la <strong>Trésorière Générale</strong> pour réactiver ses accès réseau et laboratoire.
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setPenaltyTargetMember(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPenalty}
                  className="btn-nasa flex-1 py-2.5 text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingPenalty ? 'Envoi...' : 'Valider la Sanction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2 : REFUS DE SCANNER LE QR CODE (RECHERCHE + TRANSMISSION ADMIN) */}
      {isRefusalModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card p-5 sm:p-6 space-y-4 max-w-lg w-full bg-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                  <UserX className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">Signalement Refus de Scan QR</h3>
                  <p className="text-xs text-slate-500">Transmission au Bureau Administratif</p>
                </div>
              </div>
              <button
                onClick={() => setIsRefusalModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRefusalPenalty} className="space-y-4">
              {/* Étape 1 : Rechercher le membre */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  1. Rechercher le membre récalcitrant *
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Tapez nom, prénom ou matricule (Ex: SJP-GI-001)..."
                    value={refusalSearchQuery}
                    onChange={(e) => setRefusalSearchQuery(e.target.value)}
                    className="input-nasa pl-9 text-xs w-full"
                  />
                </div>

                {/* Résultats de recherche rapide */}
                {refusalCandidates.length > 0 && !selectedRefusalMember && (
                  <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-xl space-y-1 max-h-40 overflow-y-auto">
                    {refusalCandidates.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => setSelectedRefusalMember(m)}
                        className="p-2 hover:bg-amber-50 rounded-lg cursor-pointer transition flex items-center justify-between text-xs"
                      >
                        <div>
                          <strong className="text-slate-900 block">{m.nom} {m.prenom}</strong>
                          <span className="text-[11px] font-mono text-[#0B3D91]">{m.matricule} · {m.niveau}</span>
                        </div>
                        <span className="text-xs font-bold text-amber-700">Sélectionner</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Membre sélectionné */}
              {selectedRefusalMember && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-800 block">Membre ciblé :</span>
                    <strong className="text-slate-900 text-sm">{selectedRefusalMember.nom} {selectedRefusalMember.prenom}</strong>
                    <span className="text-xs font-mono font-bold text-[#0B3D91] block">{selectedRefusalMember.matricule} ({selectedRefusalMember.niveau})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedRefusalMember(null)}
                    className="text-xs text-rose-600 hover:underline font-bold"
                  >
                    Changer
                  </button>
                </div>
              )}

              {/* Étape 2 : Motif de refus */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  2. Constat &amp; Circonstances du refus *
                </label>
                <textarea
                  rows={2}
                  value={refusalReason}
                  onChange={(e) => setRefusalReason(e.target.value)}
                  className="input-nasa text-xs w-full leading-relaxed"
                  required
                />
              </div>

              {/* Étape 3 : Montant suggéré */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  3. Montant de sanction proposé (FCFA)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1000, 2000, 3000].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setRefusalAmount(amt)}
                      className={`p-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        refusalAmount === amt
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      {amt.toLocaleString('fr-FR')} FCFA
                    </button>
                  ))}
                </div>
              </div>

              {/* Note de workflow */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#0B3D91]" />
                  <span>Workflow de validation formelle :</span>
                </div>
                <p>
                  Le signalement apparaîtra immédiatement dans le tableau de bord des <strong>Administrateurs</strong> pour validation ou rejet. Dès validation par le Bureau, le membre devra s&apos;acquitter du montant auprès de la <strong>Trésorière Générale</strong>.
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRefusalModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!selectedRefusalMember || isSubmittingRefusal}
                  className="btn-nasa flex-1 py-2.5 text-xs font-bold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingRefusal ? 'Transmission...' : 'Envoyer aux Administrateurs'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
