/**
 * Bot Autonome de Gestion Wi-Fi & Révocation du 15 du Mois
 * Division Génie Infotronique (GIT)
 * Exécution: node scripts/wifi-bot.js [--force-15th] [--router-ip=192.168.88.1]
 */

const fs = require('fs');
const path = require('path');

// Données d'échantillonnage de référence conformes à store.ts
const DEMO_MEMBERS = [
  {
    matricule: '22GIT041',
    nom: 'TCHOUASSI',
    prenom: 'Steve Jordan',
    niveau: 'GI_4',
    isPaid: true,
    pendingPenalties: 0,
    macs: ['50:E0:85:6A:7B:8C', 'DA:A1:19:11:22:33']
  },
  {
    matricule: '22GIT019',
    nom: 'ATANGANA',
    prenom: 'Kevin Landry',
    niveau: 'GI_4',
    isPaid: false, // En retard
    pendingPenalties: 1, // Pénalité labo
    macs: ['BC:D0:74:99:88:77']
  },
  {
    matricule: '25GIT012',
    nom: 'BIKIE',
    prenom: 'Vanessa Sandra',
    niveau: 'GI_2',
    isPaid: false, // En retard
    pendingPenalties: 0,
    macs: ['B8:27:EB:55:66:77']
  },
  {
    matricule: '21GIT008',
    nom: 'NGO MBELEG',
    prenom: 'Marie-Claire',
    niveau: 'GI_5',
    isPaid: true,
    pendingPenalties: 0,
    macs: ['AC:DE:48:55:66:77', 'F0:18:98:33:44:55']
  },
  {
    matricule: '21GIT033',
    nom: 'EBOUÉ',
    prenom: 'Yannick Joel',
    niveau: 'GI_5',
    isPaid: false, // En retard
    pendingPenalties: 0,
    macs: ['08:00:27:FE:DC:BA']
  }
];

function runWifiBot() {
  const now = new Date();
  const currentDay = now.getDate();
  const args = process.argv.slice(2);
  const force15th = args.includes('--force-15th') || true;

  console.log('================================================================');
  console.log('  BOT RÉSEAU AUTONOME · GESTION DU WI-FI 6 DE LA DIVISION GIT  ');
  console.log('================================================================');
  console.log(`[INFO] Date d'exécution système : ${now.toISOString()}`);
  console.log(`[INFO] Jour du mois détecté    : ${currentDay}`);
  console.log(`[INFO] Jour d'échéance légale  : 15 du mois`);

  if (!force15th && currentDay < 15) {
    console.log(`[STATUS] Le 15 du mois n'est pas encore atteint (${15 - currentDay} jours restants).`);
    console.log(`[STATUS] Aucune purge automatique n'est requise aujourd'hui.`);
    return;
  }

  console.log(`\n[CRITIQUE] Date butoir du 15 du mois atteinte ou forcée !`);
  console.log(`[ANALYSE] Évaluation des membres en retard de cotisation ou sanctionnés...`);

  const evictedMembers = [];
  const activeMembers = [];

  DEMO_MEMBERS.forEach(m => {
    const reasons = [];
    if (!m.isPaid) reasons.push('Cotisation mensuelle impayée (2 000 FCFA)');
    if (m.pendingPenalties > 0) reasons.push(`${m.pendingPenalties} pénalité(s) disciplinaire(s) non réglée(s)`);

    if (reasons.length > 0) {
      evictedMembers.push({ ...m, reasons });
    } else {
      activeMembers.push(m);
    }
  });

  console.log(`\n---------------- BILAN DE LA PURGE DU 15 DU MOIS ----------------`);
  console.log(`Membres analysés  : ${DEMO_MEMBERS.length}`);
  console.log(`Membres conformes : ${activeMembers.length} (Maintien de l'accès Wi-Fi 6)`);
  console.log(`Membres à évincer : ${evictedMembers.length} (Révocation immédiate des MACs)`);
  console.log(`-----------------------------------------------------------------`);

  // Construction du script RouterOS Mikrotik
  let rscScript = `# ========================================================\n`;
  rscScript += `# SCRIPT AUTO-GÉNÉRÉ PAR LE BOT WI-FI GIT - 15 DU MOIS\n`;
  rscScript += `# Date : ${now.toISOString()}\n`;
  rscScript += `# ========================================================\n\n`;

  evictedMembers.forEach(m => {
    console.log(`\n❌ [ÉVICTION] ${m.matricule} - ${m.nom} ${m.prenom} (${m.niveau})`);
    console.log(`   Motifs : ${m.reasons.join(' | ')}`);
    m.macs.forEach(mac => {
      console.log(`   -> Révocation MAC routeur : ${mac}`);
      rscScript += `/ip hotspot ip-binding remove [find mac-address="${mac}"]\n`;
      rscScript += `/ip hotspot ip-binding add mac-address="${mac}" type="blocked" comment="GIT_BOT_15TH: ${m.matricule} - ${m.reasons[0]}"\n`;
    });
  });

  // Sauvegarde des fichiers d'export
  const outDir = path.join(__dirname, '..', 'public', 'exports');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const rscPath = path.join(outDir, 'revocation-wifi-15th.rsc');
  const jsonPath = path.join(outDir, 'revocation-wifi-15th.json');

  fs.writeFileSync(rscPath, rscScript, 'utf8');
  fs.writeFileSync(jsonPath, JSON.stringify(evictedMembers, null, 2), 'utf8');

  console.log(`\n[SUCCÈS] Script Mikrotik généré : ${rscPath}`);
  console.log(`[SUCCÈS] Rapport JSON généré    : ${jsonPath}`);
  console.log(`[INFO] Le bot a achevé la procédure de coupure.`);
}

runWifiBot();
