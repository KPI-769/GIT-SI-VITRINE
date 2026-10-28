'use client';

import React, { useState, useEffect } from 'react';
import { User, AccessLog, CURRENT_MONTH, CURRENT_YEAR } from '@/lib/types';
import { playSuccessTone, playErrorTone } from '@/lib/store';
import {
  Wifi, ShieldCheck, ShieldAlert, Cpu, QrCode,
  CheckCircle2, AlertCircle, RefreshCw, Terminal,
  Download, Search, Radio, Laptop, Smartphone,
  Activity, Zap, UserCheck, Play, Square, Bot,
  Calendar, FileText, Send, Copy, Check
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { wifiBot, BotExecutionReport } from '@/lib/wifi-bot';

interface LabManagerViewProps {
  allUsers: User[];
}

export default function LabManagerView({ allUsers }: LabManagerViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'SCANNER' | 'WHITELIST' | 'ROUTEROS' | 'BOT_15TH'>('SCANNER');
  
  // Bot states
  const [botReport, setBotReport] = useState<BotExecutionReport>(() => wifiBot.generateCutoffReport(allUsers));
  const [isBotRunning, setIsBotRunning] = useState(false);
  const [botMessage, setBotMessage] = useState('');
  const [directMacInput, setDirectMacInput] = useState('');
  const [directMatriculeInput, setDirectMatriculeInput] = useState('');
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showScriptPreview, setShowScriptPreview] = useState(false);
  
  // Scanner states
  const [scanResult, setScanResult] = useState<{
    allowed: boolean;
    user?: User;
    reason: string;
    timestamp: string;
    macMatched?: string;
  } | null>(null);
  const [manualMatricule, setManualMatricule] = useState('');
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);

  // Mikrotik Sync status
  const [syncStatus, setSyncStatus] = useState<{
    isSyncing: boolean;
    lastSync: string;
    syncedMacCount: number;
    blockedMacCount: number;
  }>({
    isSyncing: false,
    lastSync: 'Aujourd\'hui à 18:45',
    syncedMacCount: 14,
    blockedMacCount: 3
  });

  // Recherche dans la whitelist
  const [searchQuery, setSearchQuery] = useState('');

  // Initialisation du scanner HTML5 QR
  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    if (isScannerActive && activeSubTab === 'SCANNER') {
      try {
        scanner = new Html5QrcodeScanner(
          'lab-qr-reader',
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );

        scanner.render(
          (decodedText) => {
            handleProcessDecodedPayload(decodedText);
          },
          (err) => {
            // Ignorer les frames sans QR
          }
        );
      } catch (e) {
        console.error('Erreur initialisation scanner caméra:', e);
      }
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, [isScannerActive, activeSubTab]);

  // Évaluation de l'éligibilité conforme au Dossier d'Architecture Technique (Hook Mikrotik)
  const evaluateEligibility = (user: User) => {
    const isPaid = user.cotisations.some(
      c => c.mois === CURRENT_MONTH && c.annee === CURRENT_YEAR && c.isPaid
    );
    const hasPendingPenalty = user.penalties?.some(p => p.status === 'PENDING') || false;
    const hasMac = user.macAddresses.length > 0;

    if (!user.isActive) {
      return { allowed: false, reason: 'Compte étudiant désactivé par l\'administration' };
    }
    if (!isPaid) {
      return { allowed: false, reason: `Cotisation de ${CURRENT_MONTH}/${CURRENT_YEAR} non réglée` };
    }
    if (hasPendingPenalty) {
      return { allowed: false, reason: 'Pénalité disciplinaire non régularisée auprès du Censeur' };
    }
    if (!hasMac) {
      return { allowed: false, reason: 'Aucune adresse MAC déclarée sur ce compte étudiant' };
    }

    return { allowed: true, reason: 'Éligibilité physique et Wi-Fi 6 confirmée' };
  };

  const handleProcessDecodedPayload = (payload: string) => {
    let targetUser: User | undefined;

    // Décryptage / Matching
    try {
      const parsed = JSON.parse(payload);
      if (parsed.matricule) {
        targetUser = allUsers.find(u => u.matricule.toUpperCase() === parsed.matricule.toUpperCase());
      }
    } catch {
      targetUser = allUsers.find(
        u => u.matricule.toUpperCase() === payload.trim().toUpperCase() ||
             u.qrCodeToken === payload.trim()
      );
    }

    if (!targetUser) {
      playErrorTone();
      setScanResult({
        allowed: false,
        reason: 'Badge QR ou matricule inconnu dans le répertoire officiel GIT',
        timestamp: new Date().toLocaleTimeString('fr-FR')
      });
      return;
    }

    const { allowed, reason } = evaluateEligibility(targetUser);

    if (allowed) {
      playSuccessTone();
    } else {
      playErrorTone();
    }

    const newLog: AccessLog = {
      id: `log_${Date.now()}`,
      matricule: targetUser.matricule,
      nom: targetUser.nom,
      prenom: targetUser.prenom,
      niveau: targetUser.niveau,
      granted: allowed,
      reason,
      scannedBy: 'GIT-LAB-004',
      createdAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    setAccessLogs(prev => [newLog, ...prev.slice(0, 19)]);
    setScanResult({
      allowed,
      user: targetUser,
      reason,
      timestamp: new Date().toLocaleTimeString('fr-FR'),
      macMatched: targetUser.macAddresses[0]?.address
    });
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualMatricule.trim()) return;
    handleProcessDecodedPayload(manualMatricule);
    setManualMatricule('');
  };

  // Déclencheur du Hook de synchronisation Mikrotik
  const handleTriggerMikrotikSync = () => {
    setSyncStatus(prev => ({ ...prev, isSyncing: true }));
    setTimeout(() => {
      let allowedCount = 0;
      let blockedCount = 0;

      allUsers.forEach(u => {
        const { allowed } = evaluateEligibility(u);
        if (allowed) allowedCount += u.macAddresses.length;
        else blockedCount += u.macAddresses.length;
      });

      setSyncStatus({
        isSyncing: false,
        lastSync: `Aujourd'hui à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
        syncedMacCount: allowedCount,
        blockedMacCount: blockedCount
      });
      playSuccessTone();
    }, 1500);
  };

  // Exportation configuration RouterOS .rsc
  const handleExportRouterOsConfig = () => {
    let script = `# --------------------------------------------------------\n`;
    script += `# Script RouterOS Mikrotik Auto-Généré - Division GIT\n`;
    script += `# Date d'exportation: ${new Date().toISOString()}\n`;
    script += `# Conforme Spécification Technique GIT-DAT-2026-001\n`;
    script += `# --------------------------------------------------------\n\n`;
    script += `/ip hotspot ip-binding remove [find comment~"GIT_AUTO"]\n\n`;

    allUsers.forEach(u => {
      const { allowed } = evaluateEligibility(u);
      u.macAddresses.forEach(mac => {
        const type = allowed ? 'bypassed' : 'blocked';
        script += `/ip hotspot ip-binding add mac-address="${mac.address}" type="${type}" comment="GIT_AUTO: ${u.matricule} - ${u.nom} ${u.prenom} (${type})"\n`;
      });
    });

    const blob = new Blob([script], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mikrotik-hotspot-bindings-${new Date().toISOString().slice(0, 10)}.rsc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Déclenchement de la purge par le Bot Wi-Fi
  const handleRunPurge = async () => {
    setIsBotRunning(true);
    setBotMessage('');
    try {
      const res = await fetch('/api/network/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'PURGE_ROUTER' })
      });
      const data = await res.json();
      if (data.success) {
        playSuccessTone();
        setBotMessage(data.message || `Purge RouterOS exécutée avec succès : ${botReport.evictedMacsCount} adresses MAC bloquées.`);
        setBotReport(wifiBot.generateCutoffReport(allUsers));
      } else {
        playErrorTone();
        setBotMessage(data.message || 'Erreur lors de la purge.');
      }
    } catch {
      playSuccessTone();
      setBotMessage(`Purge RouterOS simulée avec succès : ${botReport.evictedMacsCount} adresses MAC bloquées sur le contrôleur Mikrotik.`);
    } finally {
      setIsBotRunning(false);
    }
  };

  // Téléchargement du script RouterOS de purge du 15
  const handleDownloadEvictionScript = () => {
    const blob = new Blob([botReport.routerOsEvictionScript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mikrotik-bot-purge-15th-${new Date().toISOString().slice(0, 10)}.rsc`;
    a.click();
    URL.revokeObjectURL(url);
    playSuccessTone();
  };

  // Téléchargement des commandes D-Link
  const handleDownloadDlinkCommands = () => {
    const content = botReport.dlinkEvictionCommands.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dlink-mac-filter-purge-15th-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    playSuccessTone();
  };

  // Inscription rapide en dérogation / bypass
  const handleDirectAddMac = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directMacInput.trim() || !directMatriculeInput.trim()) return;

    try {
      const res = await fetch('/api/network/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_MAC',
          macAddress: directMacInput.trim().toUpperCase(),
          matricule: directMatriculeInput.trim().toUpperCase()
        })
      });
      const data = await res.json();
      if (data.success) {
        playSuccessTone();
        setBotMessage(`Dérogation accordée : L'adresse MAC ${directMacInput.toUpperCase()} a été inscrite en bypass RouterOS pour ${directMatriculeInput.toUpperCase()}.`);
        setDirectMacInput('');
        setDirectMatriculeInput('');
      }
    } catch {
      playSuccessTone();
      setBotMessage(`Dérogation simulée : MAC ${directMacInput.toUpperCase()} inscrite.`);
      setDirectMacInput('');
      setDirectMatriculeInput('');
    }
  };

  // Copie du message type de relance
  const handleCopyNotificationTemplate = () => {
    const text = `⚠️ [GIT COMMUNITY - CELLULE RÉSEAU & LABO]\nNotification d'échéance du 15 du mois :\nVos accès au réseau Wi-Fi 6 haute vitesse ont été révoqués pour défaut de cotisation mensuelle ou pénalité disciplinaire non soldée.\nMerci de vous rapprocher sans délai du Trésorier ou du Censeur pour régulariser votre situation et débloquer vos adresses MAC.`;
    navigator.clipboard.writeText(text);
    setCopiedNotice(true);
    playSuccessTone();
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  // Copie du script RouterOS
  const handleCopyScript = () => {
    navigator.clipboard.writeText(botReport.routerOsEvictionScript);
    setCopiedScript(true);
    playSuccessTone();
    setTimeout(() => setCopiedScript(false), 2500);
  };

  // Métriques de calcul du Bot du 15
  const totalAmountDue = botReport.evictionList.reduce((acc, curr) => acc + curr.totalDue, 0);
  const now = new Date();
  const currentDay = now.getDate();
  const daysUntil15th = 15 - currentDay;
  const isPast15th = currentDay >= 15;

  // Liste de toutes les adresses MAC avec statut calculé
  const allMacEntries = allUsers.flatMap(u => {
    const { allowed, reason } = evaluateEligibility(u);
    return u.macAddresses.map(mac => ({
      ...mac,
      user: u,
      isAllowed: allowed,
      eligibilityReason: reason
    }));
  }).filter(entry => {
    const q = searchQuery.toLowerCase();
    return (
      entry.address.toLowerCase().includes(q) ||
      entry.user.matricule.toLowerCase().includes(q) ||
      entry.user.nom.toLowerCase().includes(q) ||
      entry.user.prenom.toLowerCase().includes(q) ||
      (entry.deviceName && entry.deviceName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* En-tête contextuel */}
      <div className="card p-6 sm:p-8 bg-white border-l-4 border-l-[#0EA5E9] shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0F6FF] border border-[#BAE6FD] text-[#0284C7] text-xs font-bold mb-2">
              <Radio className="w-3.5 h-3.5 text-[#0EA5E9]" />
              <span>Poste Technique · Contrôle Labo &amp; Supervision Réseau Wi-Fi 6</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
              Responsable Laboratoire &amp; Réseau Mikrotik
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Vérification des droits d&apos;accès physique aux paillasses de recherche, gestion dynamique de la Whitelist MAC et synchronisation du contrôleur RouterOS (Réf. GIT-DAT-2026-001).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
            <button
              onClick={handleTriggerMikrotikSync}
              disabled={syncStatus.isSyncing}
              className="btn-nasa text-xs px-4 py-2.5 flex items-center justify-center gap-2 bg-[#0284C7] hover:bg-[#0369A1] shadow-sm cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
              <span>{syncStatus.isSyncing ? 'Synchronisation...' : 'Synchroniser Mikrotik'}</span>
            </button>

            <button
              onClick={handleExportRouterOsConfig}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-800 text-slate-700 hover:text-slate-900 font-bold text-xs flex items-center justify-center gap-2 transition bg-white shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exporter Script .RSC</span>
            </button>
          </div>
        </div>

        {/* Bilan télémétrique réseau */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 block">Dernière Synchro API</span>
            <strong className="text-slate-900 font-bold">{syncStatus.lastSync}</strong>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-[11px] text-emerald-700 block">MACs Bypassed (Wi-Fi Actif)</span>
            <strong className="text-emerald-800 font-black text-sm">{syncStatus.syncedMacCount} autorisées</strong>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
            <span className="text-[11px] text-rose-700 block">MACs Bloquées (Retard/Pénalité)</span>
            <strong className="text-rose-800 font-black text-sm">{syncStatus.blockedMacCount} révoquées</strong>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
            <span className="text-[11px] text-blue-700 block">Borne de Labo</span>
            <strong className="text-[#0B3D91] font-bold">Wi-Fi 6 (802.11ax) 1Gbps</strong>
          </div>
        </div>
      </div>

      {/* Onglets Métiers */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={() => setActiveSubTab('SCANNER')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeSubTab === 'SCANNER'
              ? 'bg-[#0B3D91] text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Scanner Accès Physique Labo</span>
        </button>

        <button
          onClick={() => setActiveSubTab('WHITELIST')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeSubTab === 'WHITELIST'
              ? 'bg-[#0B3D91] text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wifi className="w-4 h-4" />
          <span>Whitelist Wi-Fi 6 ({allMacEntries.length} MACs)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ROUTEROS')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeSubTab === 'ROUTEROS'
              ? 'bg-[#0B3D91] text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Console Hook Mikrotik</span>
        </button>

        <button
          onClick={() => setActiveSubTab('BOT_15TH')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeSubTab === 'BOT_15TH'
              ? 'bg-[#0B3D91] text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bot className="w-4 h-4 text-amber-400" />
          <span>Bot Wi-Fi &amp; Échéance 15 ({botReport.evictedMembersCount})</span>
        </button>
      </div>

      {/* Onglet 1 : Scanner d'accès labo */}
      {activeSubTab === 'SCANNER' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 space-y-5">
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="section-label">Pointage d&apos;Entrée</span>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Scanner QR Code Vidéo ou Manuel
                  </h3>
                </div>
                <button
                  onClick={() => setIsScannerActive(prev => !prev)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    isScannerActive
                      ? 'bg-rose-100 text-rose-700 border border-rose-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  {isScannerActive ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isScannerActive ? 'Arrêter Caméra' : 'Activer Caméra'}</span>
                </button>
              </div>

              {/* Zone Caméra */}
              {isScannerActive ? (
                <div id="lab-qr-reader" className="w-full rounded-2xl overflow-hidden border border-slate-300 bg-black" />
              ) : (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
                  <QrCode className="w-12 h-12 text-slate-400 mx-auto" />
                  <p className="font-bold text-slate-700">Caméra en veille</p>
                  <p>Cliquez sur &quot;Activer Caméra&quot; ou utilisez la saisie manuelle ci-dessous.</p>
                </div>
              )}

              {/* Saisie manuelle matricule */}
              <form onSubmit={handleManualSubmit} className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Saisie Rapide du Matricule / Token
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: 22GIT041 ou token_sec_mem1_041"
                    value={manualMatricule}
                    onChange={(e) => setManualMatricule(e.target.value)}
                    className="input-nasa text-xs flex-1"
                  />
                  <button type="submit" className="btn-nasa text-xs px-4 py-2 font-bold cursor-pointer">
                    Évaluer
                  </button>
                </div>
              </form>
            </div>

            {/* Résultat d'évaluation */}
            {scanResult && (
              <div className={`card p-6 border-2 transition ${
                scanResult.allowed ? 'result-granted' : 'result-denied'
              }`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    scanResult.allowed ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                  }`}>
                    {scanResult.allowed ? <CheckCircle2 className="w-7 h-7" /> : <AlertCircle className="w-7 h-7" />}
                  </div>

                  <div className="space-y-1 flex-1">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full inline-block ${
                      scanResult.allowed ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                    }`}>
                      {scanResult.allowed ? 'ACCÈS PHYSIQUE & WI-FI AUTORISÉ' : 'ACCÈS LABORATOIRE REFUSÉ'}
                    </span>

                    {scanResult.user ? (
                      <div>
                        <h4 className="text-lg font-black text-slate-900 font-display">
                          {scanResult.user.nom} {scanResult.user.prenom}
                        </h4>
                        <p className="text-xs text-slate-700 font-mono">
                          Matricule : <strong>{scanResult.user.matricule}</strong> ({scanResult.user.niveau})
                        </p>
                        {scanResult.macMatched && (
                          <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                            MAC Wi-Fi : <span className="font-bold text-sky-700">{scanResult.macMatched}</span>
                          </p>
                        )}
                      </div>
                    ) : (
                      <h4 className="text-base font-bold text-slate-900">Utilisateur non identifié</h4>
                    )}

                    <p className={`text-xs font-semibold pt-1 ${scanResult.allowed ? 'text-emerald-800' : 'text-rose-800'}`}>
                      Motif : {scanResult.reason}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Colonne droite : Historique des scans d'accès */}
          <div className="lg:col-span-6 space-y-4">
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-display">
                  <Activity className="w-4 h-4 text-[#0EA5E9]" />
                  Historique des Passages Labo en Temps Réel
                </h3>
                <span className="text-xs text-slate-500 font-mono">20 derniers logs</span>
              </div>

              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {accessLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                      log.granted ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50/60 border-rose-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold ${
                        log.granted ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {log.granted ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      </div>
                      <div>
                        <strong className="block text-slate-900 font-bold">
                          {log.prenom} {log.nom} ({log.matricule})
                        </strong>
                        <span className="text-[11px] text-slate-600 block">{log.reason}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">
                      {log.createdAt}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Onglet 2 : Whitelist dynamique Wi-Fi */}
      {activeSubTab === 'WHITELIST' && (
        <div className="card p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <span className="section-label">Filtrage Matériel Wi-Fi 6</span>
              <h3 className="text-lg font-bold text-slate-900 font-display">
                Tableau de Correspondance MAC &amp; Baux Statiques
              </h3>
              <p className="text-xs text-slate-500">
                Synchronisé automatiquement selon l&apos;état financier (cotisation) et disciplinaire (pénalités).
              </p>
            </div>

            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Rechercher MAC, nom, matricule..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-nasa pl-9 text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Statut Mikrotik</th>
                  <th className="py-3 px-3">Adresse MAC</th>
                  <th className="py-3 px-3">Équipement</th>
                  <th className="py-3 px-3">Étudiant &amp; Matricule</th>
                  <th className="py-3 px-3">Niveau</th>
                  <th className="py-3 px-3">Évaluation d&apos;Éligibilité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allMacEntries.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        item.isAllowed
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {item.isAllowed ? 'BYPASSED' : 'BLOCKED'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {item.address}
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {item.deviceName || 'Matériel personnel'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{item.user.nom} {item.user.prenom}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{item.user.matricule}</span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-600">
                      {item.user.niveau}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {item.eligibilityReason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Onglet 3 : Console Hook Mikrotik */}
      {activeSubTab === 'ROUTEROS' && (
        <div className="card p-6 bg-slate-950 border-slate-800 text-slate-200 space-y-4 font-mono text-xs shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-sky-400 font-bold">
              <Terminal className="w-4 h-4" />
              <span>Console API RouterOS · Simulation du Hook /ip/hotspot/ip-binding</span>
            </div>
            <span className="text-[10px] text-slate-500">RouterOS v7.14</span>
          </div>

          <div className="p-4 bg-black/60 rounded-xl space-y-2 text-slate-300">
            <p className="text-emerald-400 font-bold"># Algorithme d&apos;évaluation de l&apos;API Hook :</p>
            <p className="text-slate-400">1. Cotisation.month == {CURRENT_MONTH} &amp;&amp; Cotisation.year == {CURRENT_YEAR}</p>
            <p className="text-slate-400">2. COUNT(Penalties WHERE status == &apos;PENDING&apos;) == 0</p>
            <p className="text-slate-400">3. User.macAddress != null</p>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300">
              <p className="text-sky-300">[API Hook Trigger] Synchronisation exécutée avec succès.</p>
              <p className="text-slate-400">Baux statiques générés : {syncStatus.syncedMacCount} autorisées / {syncStatus.blockedMacCount} bloquées.</p>
            </div>
          </div>
        </div>
      )}

      {/* Onglet 4 : Bot Wi-Fi & Échéance 15 */}
      {activeSubTab === 'BOT_15TH' && (
        <div className="space-y-6">
          {/* Bannière de Contrôle Haute Télémétrie */}
          <div className="card p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl shadow-xl border border-slate-700/60 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold font-mono">
                  <Bot className="w-4 h-4 text-amber-400" />
                  <span>AGENT AUTONOME · RÈGLE DE COUPE MENSUELLE (15 DU MOIS)</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white flex items-center gap-2">
                  <span>Robot de Révocation &amp; Purge Mikrotik</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-600 font-mono font-normal text-slate-300">
                    CDC-2026-001
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Conformément au cahier des charges de la Division GIT, le 15 de chaque mois à 23h59, tout étudiant n&apos;ayant pas soldé sa cotisation ou ayant des pénalités disciplinaires non régularisées voit ses baux Wi-Fi 6 révoqués instantanément du contrôleur RouterOS.
                </p>
              </div>

              {/* Statut d'échéance et déclencheur */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                <div className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs font-mono ${
                  isPast15th
                    ? 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                    : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                }`}>
                  <div className={`w-3 h-3 rounded-full animate-pulse shrink-0 ${isPast15th ? 'bg-rose-500' : 'bg-amber-400'}`} />
                  <div>
                    <span className="font-bold block">
                      {isPast15th ? 'Échéance du 15 dépassée' : `Échéance dans ${daysUntil15th} jour${daysUntil15th > 1 ? 's' : ''}`}
                    </span>
                    <span className="text-[11px] opacity-80">
                      Aujourd&apos;hui : {now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleRunPurge}
                  disabled={isBotRunning}
                  className="btn-nasa text-xs px-5 py-3 font-bold flex items-center justify-center gap-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-lg cursor-pointer transition disabled:opacity-50"
                >
                  <Zap className={`w-4 h-4 ${isBotRunning ? 'animate-spin' : ''}`} />
                  <span>{isBotRunning ? 'Purge en cours...' : 'Exécuter la Purge Mikrotik en Direct'}</span>
                </button>
              </div>
            </div>

            {/* Notification message bot */}
            {botMessage && (
              <div className="mt-5 p-3.5 bg-emerald-500/20 border border-emerald-400/40 rounded-xl flex items-center justify-between text-xs text-emerald-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{botMessage}</span>
                </div>
                <button
                  onClick={() => setBotMessage('')}
                  className="text-emerald-400 hover:text-white font-bold ml-2 text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* 4 Cartes Métriques */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-5 border-l-4 border-l-rose-500 bg-white">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Étudiants en Infraction
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-rose-600 font-display">
                  {botReport.evictedMembersCount}
                </span>
                <span className="text-xs text-slate-500">/ {botReport.totalMembersEvaluated} membres</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Cotisation en retard ou pénalités actives
              </span>
            </div>

            <div className="card p-5 border-l-4 border-l-amber-500 bg-white">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Adresses MAC Révocables
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-amber-600 font-display">
                  {botReport.evictedMacsCount}
                </span>
                <span className="text-xs text-slate-500">équipements</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Baux statiques passés en `blocked`
              </span>
            </div>

            <div className="card p-5 border-l-4 border-l-indigo-500 bg-white">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Créances en Souffrance
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-black text-indigo-700 font-display">
                  {totalAmountDue.toLocaleString('fr-FR')}
                </span>
                <span className="text-xs font-bold text-indigo-900">FCFA</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Total cotisations + amendes à recouvrer
              </span>
            </div>

            <div className="card p-5 border-l-4 border-l-emerald-500 bg-white">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Équipements Maintenus
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-emerald-600 font-display">
                  {botReport.whitelistedMacsCount}
                </span>
                <span className="text-xs text-emerald-700 font-bold">en règle</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Accès Wi-Fi 6 permanent garanti
              </span>
            </div>
          </div>

          {/* Barre d'Actions d'Export et Relance */}
          <div className="card p-4 bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleDownloadEvictionScript}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:border-slate-800 text-slate-800 font-bold text-xs flex items-center gap-2 transition shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-sky-600" />
                <span>Télécharger Script RouterOS (.rsc)</span>
              </button>

              <button
                onClick={handleDownloadDlinkCommands}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:border-slate-800 text-slate-800 font-bold text-xs flex items-center gap-2 transition shadow-xs cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                <span>Exporter Commandes D-Link</span>
              </button>

              <button
                onClick={handleCopyNotificationTemplate}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:border-slate-800 text-slate-800 font-bold text-xs flex items-center gap-2 transition shadow-xs cursor-pointer"
              >
                {copiedNotice ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Send className="w-3.5 h-3.5 text-indigo-600" />}
                <span>{copiedNotice ? 'Message Copié !' : 'Copier Message Relance (SMS / WhatsApp)'}</span>
              </button>
            </div>

            <button
              onClick={() => setShowScriptPreview(!showScriptPreview)}
              className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1.5 cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{showScriptPreview ? 'Masquer aperçu script' : 'Voir aperçu script RouterOS'}</span>
            </button>
          </div>

          {/* Aperçu interactif du script RouterOS */}
          {showScriptPreview && (
            <div className="card p-5 bg-slate-950 border-slate-800 text-slate-200 space-y-3 font-mono text-xs shadow-xl rounded-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-amber-400 font-bold flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  mikrotik-hotspot-eviction-15th.rsc
                </span>
                <button
                  onClick={handleCopyScript}
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1.5 cursor-pointer transition"
                >
                  {copiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedScript ? 'Copié' : 'Copier Tout'}</span>
                </button>
              </div>
              <pre className="p-3 bg-black/70 rounded-xl overflow-x-auto text-[11px] leading-relaxed text-slate-300 max-h-64 overflow-y-auto">
                {botReport.routerOsEvictionScript}
              </pre>
            </div>
          )}

          {/* Tableau de la Liste Noire / Évictions du 15 */}
          <div className="card p-6 space-y-5 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="section-label text-rose-600">Dossiers en Défaut de Règlement</span>
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  Liste des Membres Ciblés pour Révocation ({botReport.evictionList.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Adresses MAC automatiquement basculées en statut &apos;blocked&apos; sur le Hotspot Mikrotik au 15 du mois.
                </p>
              </div>

              <span className="text-xs font-mono bg-rose-50 text-rose-800 border border-rose-200 px-3 py-1 rounded-full font-bold">
                Coupure automatique active
              </span>
            </div>

            {botReport.evictionList.length === 0 ? (
              <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900">Aucun membre en infraction</h4>
                <p className="text-xs text-emerald-700">Tous les membres enregistrés sont à jour de leurs cotisations et pénalités.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">Statut Wi-Fi</th>
                      <th className="py-3 px-3">Étudiant</th>
                      <th className="py-3 px-3">Niveau</th>
                      <th className="py-3 px-3">Adresses MAC ({botReport.evictedMacsCount})</th>
                      <th className="py-3 px-3">Motifs de Coupure</th>
                      <th className="py-3 px-3 text-right">Montant en Souffrance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {botReport.evictionList.map((record) => (
                      <tr key={record.userId} className="hover:bg-rose-50/40 transition">
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            BLOCKED
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <strong className="block text-slate-900">{record.nom} {record.prenom}</strong>
                          <span className="text-[10px] text-slate-500 font-mono">{record.matricule}</span>
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-600">
                          {record.niveau}
                        </td>
                        <td className="py-3 px-3">
                          {record.macAddresses.length > 0 ? (
                            <div className="space-y-1">
                              {record.macAddresses.map((mac) => (
                                <div key={mac.address} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[11px] text-slate-800 mr-1.5 mb-1">
                                  <Laptop className="w-3 h-3 text-slate-500" />
                                  <span>{mac.address}</span>
                                  {mac.deviceName && (
                                    <span className="text-[9px] text-slate-500">({mac.deviceName})</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Aucune MAC enregistrée</span>
                          )}
                        </td>
                        <td className="py-3 px-3 space-y-1">
                          {record.reasons.map((r, idx) => (
                            <span key={idx} className="block text-[11px] text-rose-700 font-medium">
                              • {r}
                            </span>
                          ))}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="text-xs font-black text-rose-700 font-mono">
                            {record.totalDue.toLocaleString('fr-FR')} FCFA
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Formulaire de Dérogation Rapide (Bypass Exceptionnel) */}
          <div className="card p-6 bg-white space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <span className="section-label text-sky-600">Action d&apos;Urgence</span>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Ajouter une Dérogation Directe sur la Whitelist Mikrotik
              </h3>
              <p className="text-xs text-slate-500">
                Permet au Responsable Laboratoire d&apos;autoriser temporairement une machine en bypass sans attendre la synchronisation.
              </p>
            </div>

            <form onSubmit={handleDirectAddMac} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Matricule Étudiant
                </label>
                <input
                  type="text"
                  placeholder="Ex: 22GIT041"
                  value={directMatriculeInput}
                  onChange={(e) => setDirectMatriculeInput(e.target.value)}
                  className="input-nasa text-xs w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Adresse MAC Matériel
                </label>
                <input
                  type="text"
                  placeholder="Ex: 00:1A:2B:3C:4D:5E"
                  value={directMacInput}
                  onChange={(e) => setDirectMacInput(e.target.value)}
                  className="input-nasa text-xs w-full font-mono"
                  required
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="btn-nasa text-xs w-full py-2.5 font-bold flex items-center justify-center gap-2 bg-[#0284C7] hover:bg-[#0369A1] cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Enregistrer Dérogation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
