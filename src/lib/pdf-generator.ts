import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { User, MONTH_NAMES } from './types';

export interface MacExportRow {
  matricule: string;
  nomComplet: string;
  deviceName: string;
  macAddress: string;
  statutCotisation: string;
}

export function generateMacReportPdf(params: {
  niveau: string;
  mois: number;
  annee: number;
  treasurerName: string;
  users: User[];
}) {
  const { niveau, mois, annee, treasurerName, users } = params;
  const doc = new jsPDF();
  const moisNom = MONTH_NAMES[mois - 1] || `Mois ${mois}`;

  // Filtrer les étudiants du niveau concerné
  const niveauUsers = users.filter((u) => u.niveau === niveau);

  const whitelistRows: MacExportRow[] = [];
  const blacklistRows: MacExportRow[] = [];

  let totalMembersInNiveau = niveauUsers.length;
  let paidMembersCount = 0;

  niveauUsers.forEach((user) => {
    const cot = user.cotisations.find((c) => c.mois === mois && c.annee === annee);
    const isPaid = !!cot?.isPaid;

    if (isPaid) {
      paidMembersCount++;
    }

    if (user.macAddresses && user.macAddresses.length > 0) {
      user.macAddresses.forEach((mac) => {
        const row: MacExportRow = {
          matricule: user.matricule,
          nomComplet: `${user.nom} ${user.prenom}`,
          deviceName: mac.deviceName || 'Équipement non spécifié',
          macAddress: mac.address.toUpperCase(),
          statutCotisation: isPaid ? 'RÉGLÉE' : 'IMPAYÉE'
        };

        if (isPaid) {
          whitelistRows.push(row);
        } else {
          blacklistRows.push(row);
        }
      });
    }
  });

  const recoveryRate = totalMembersInNiveau > 0 
    ? Math.round((paidMembersCount / totalMembersInNiveau) * 100) 
    : 0;

  // Header Graphique (Bleu Marine GIT: #0F2B5C)
  doc.setFillColor(15, 43, 92);
  doc.rect(0, 0, 210, 32, 'F');

  // Titre en-tête
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('DIVISION GÉNIE INFOTRONIQUE (GIT)', 14, 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(220, 230, 245);
  doc.text('Laboratoire de Recherche & Pratique - Rapport de Contrôle Réseau Wi-Fi', 14, 23);

  // Méta-données du document
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`PROMOTION / NIVEAU : ${niveau}`, 14, 42);
  doc.text(`PÉRIODE CONCERNÉE : ${moisNom} ${annee}`, 14, 48);
  doc.text(`DATE D'EXTRACTION : ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`, 120, 42);
  doc.text(`RESPONSABLE TRÉSORERIE : ${treasurerName}`, 120, 48);

  // Carte Statistique de recouvrement
  doc.setFillColor(243, 246, 252);
  doc.setDrawColor(200, 215, 235);
  doc.roundedRect(14, 54, 182, 18, 3, 3, 'FD');

  doc.setFontSize(10);
  doc.setTextColor(15, 43, 92);
  doc.text(`Taux de recouvrement des cotisations (${niveau}) : ${recoveryRate}%`, 20, 65);
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'normal');
  doc.text(`(${paidMembersCount} / ${totalMembersInNiveau} membres à jour - ${whitelistRows.length} adresses autorisées, ${blacklistRows.length} à bloquer)`, 115, 65);

  let currentY = 78;

  // Tableau 1 : WHITELIST (Vert foncé)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(16, 120, 60);
  doc.text(`1. WHITELIST - Adresses MAC autorisées (${whitelistRows.length})`, 14, currentY);

  autoTable(doc, {
    startY: currentY + 4,
    head: [['Matricule', 'Nom & Prénom', 'Appareil', 'Adresse MAC (Wi-Fi)', 'Statut']],
    body: whitelistRows.map((r) => [r.matricule, r.nomComplet, r.deviceName, r.macAddress, 'AUTORISÉ']),
    headStyles: {
      fillColor: [16, 130, 68],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 8,
    },
    styles: { fontSize: 8, cellPadding: 2.5 },
    alternateRowStyles: { fillColor: [240, 250, 244] },
    margin: { left: 14, right: 14 },
  });

  // Position pour le tableau 2
  // @ts-expect-error autoTable types augmentation
  const lastY = doc.lastAutoTable?.finalY || currentY + 40;
  currentY = lastY + 12;

  // Tableau 2 : BLACKLIST (Rouge bordeaux)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(180, 25, 25);
  doc.text(`2. BLACKLIST - Adresses MAC à révoquer / bloquer (${blacklistRows.length})`, 14, currentY);

  autoTable(doc, {
    startY: currentY + 4,
    head: [['Matricule', 'Nom & Prénom', 'Appareil', 'Adresse MAC', 'Statut / Motif']],
    body: blacklistRows.length > 0 
      ? blacklistRows.map((r) => [r.matricule, r.nomComplet, r.deviceName, r.macAddress, 'IMPAYÉ (BLOQUER)'])
      : [['-', 'Aucun membre en retard pour ce niveau', '-', '-', 'NEANT']],
    headStyles: {
      fillColor: [190, 30, 30],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 8,
    },
    styles: { fontSize: 8, cellPadding: 2.5 },
    alternateRowStyles: { fillColor: [255, 243, 243] },
    margin: { left: 14, right: 14 },
  });

  // Footer d'authenticité
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(130, 130, 130);
    doc.setFont('helvetica', 'italic');
    doc.text(
      'Document officiel GIT - Conforme au Cahier des Charges GIT-CDC-2026-001 - Remise manuelle à l\'administrateur réseau.',
      14,
      290
    );
    doc.text(`Page ${i} / ${pageCount}`, 190, 290);
  }

  // Télécharger le fichier
  const filename = `GIT_Filtrage_MAC_${niveau}_${moisNom}_${annee}.pdf`;
  doc.save(filename);
}

/**
 * Génère le document PDF officiel de la liste des comptes avec identifiants par défaut
 * Conforme à la demande de l'utilisateur : "générer la liste avec le mot de passe par défaut changeable à première connexion"
 */
export function generateCredentialsPdf(params: {
  users: User[];
  adminName?: string;
}) {
  const { users, adminName = 'Bureau GIT' } = params;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Bandeau Supérieur Bleu Marine SJP/GIT
  doc.setFillColor(11, 61, 145); // #0B3D91
  doc.rect(0, 0, 210, 34, 'F');

  // Ligne fine d'accent rouge NASA / SJP
  doc.setFillColor(252, 61, 33); // #FC3D21
  doc.rect(0, 34, 210, 2, 'F');

  // Titres du bandeau
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('SAINT JÉRÔME POLYTECHNIQUE · DOUALA', 14, 13);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(230, 240, 255);
  doc.text('DIVISION GÉNIE INFOTRONIQUE (GIT) · LISTE OFFICIELLE DES COMPTES', 14, 21);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 220, 250);
  doc.text('Identifiants de première connexion · Changement de mot de passe obligatoire au 1er accès', 14, 29);

  // Métadonnées & Cartouche de Sécurité
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`DATE D'EXTRACTION : ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`, 14, 43);
  doc.text(`ÉMIS PAR : ${adminName}`, 120, 43);
  doc.text(`TOTAL COMPTES INITIALISÉS : ${users.length} membres`, 14, 49);
  doc.text(`POLITIQUE : CDC GIT-2026-001 (Sécurité & RBAC)`, 120, 49);

  // Boîte d'instructions de sécurité pour l'étudiant et l'administration
  doc.setFillColor(235, 243, 255);
  doc.setDrawColor(180, 210, 245);
  doc.roundedRect(14, 53, 182, 18, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(11, 61, 145);
  doc.setFont('helvetica', 'bold');
  doc.text('CONSIGNE STRICTE DE SÉCURITÉ (ARTICLE 3.2 DU CAHIER DES CHARGES GIT) :', 18, 59);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 60, 80);
  doc.text('1. Le mot de passe par défaut est : git2026. Tout étudiant DOIT obligatoirement le renouveler dès sa 1ère connexion.', 18, 64);
  doc.text('2. L\'administrateur ne détient pas les mots de passe et ne peut réinitialiser un compte que sur demande expresse du titulaire.', 18, 68);

  const tableRows = users.map((u, i) => [
    `${i + 1}`,
    u.matricule,
    `${u.nom} ${u.prenom}`,
    u.phone || 'Non renseigné',
    u.email,
    u.role,
    u.mustChangePassword ? 'git2026 (Initial)' : 'Défini / Protégé',
    u.mustChangePassword ? 'Obligatoire' : 'Actif'
  ]);

  autoTable(doc, {
    startY: 75,
    head: [['N°', 'Matricule', 'Nom & Prénom', 'Téléphone', 'Email Institutionnel', 'Rôle', 'Mot de Passe', 'Changement']],
    body: tableRows,
    headStyles: {
      fillColor: [11, 61, 145],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left',
    },
    styles: {
      fontSize: 7,
      cellPadding: 1.8,
      overflow: 'linebreak',
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 22, fontStyle: 'bold' },
      2: { cellWidth: 42, fontStyle: 'bold' },
      3: { cellWidth: 24 },
      4: { cellWidth: 42 },
      5: { cellWidth: 15 },
      6: { cellWidth: 23, fontStyle: 'bold' },
      7: { cellWidth: 16, halign: 'center' },
    },
    alternateRowStyles: { fillColor: [248, 250, 253] },
    margin: { left: 10, right: 10 },
  });

  // Footer de certification sur chaque page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'italic');
    doc.text(
      'Division Génie Infotronique · Saint Jérôme Polytechnique Douala · Document Administratif Confidentiel',
      10,
      292
    );
    doc.text(`Page ${i} sur ${pageCount}`, 185, 292);
  }

  const filename = `GIT_Comptes_Etudiants_Identifiants_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

/**
 * Téléchargement au format CSV compatible Excel (UTF-8 avec BOM)
 */
export function downloadCredentialsCsv(users: User[]) {
  const headers = [
    'Numero',
    'Matricule',
    'Nom',
    'Prenom',
    'Nom Complet',
    'Telephone',
    'Email',
    'Niveau',
    'Role',
    'Mot de passe par defaut',
    'Changement requis 1ere connexion',
    'Statut Compte'
  ];

  const rows = users.map((u, i) => [
    i + 1,
    `"${u.matricule}"`,
    `"${u.nom.replace(/"/g, '""')}"`,
    `"${u.prenom.replace(/"/g, '""')}"`,
    `"${(u.nom + ' ' + u.prenom).replace(/"/g, '""')}"`,
    `"${(u.phone || '').replace(/"/g, '""')}"`,
    `"${u.email}"`,
    `"${u.niveau}"`,
    `"${u.role}"`,
    `"${u.mustChangePassword ? 'git2026' : '[Protégé]'}"`,
    `"${u.mustChangePassword ? 'OUI (Obligatoire)' : 'NON (Déjà changé)'}"`,
    `"${u.isActive ? 'ACTIF' : 'SUSPENDU'}"`
  ]);

  const csvContent = '\uFEFF' + [
    headers.join(';'),
    ...rows.map((r) => r.join(';'))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `GIT_Liste_Membres_Identifiants_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Génère le document PDF officiel des identifiants des MEMBRES DU BUREAU
 * Source : MEMEBRE DU BUREAU.txt (16 membres officiels avec postes et rôles)
 */
export function generateBureauCredentialsPdf(params: {
  users: User[];
  adminName?: string;
}) {
  const { users, adminName = 'Présidence & Bureau GIT' } = params;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Filtrer ou ordonner les membres du bureau
  const bureauUsers = users.filter((u) => u.niveau === 'GI_Bureau' || u.matricule.startsWith('GIT-BUR-'));
  const listToExport = bureauUsers.length > 0 ? bureauUsers : users;

  // Bandeau Supérieur Bleu Marine SJP/GIT
  doc.setFillColor(11, 61, 145); // #0B3D91
  doc.rect(0, 0, 210, 36, 'F');

  // Ligne fine d'accent or / bronze exécutif
  doc.setFillColor(245, 158, 11); // #F59E0B
  doc.rect(0, 36, 210, 2.5, 'F');

  // Titres du bandeau
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('SAINT JÉRÔME POLYTECHNIQUE · DOUALA', 14, 13);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(253, 230, 138); // Amber clair
  doc.text('DIVISION GÉNIE INFOTRONIQUE (GIT) · BUREAU EXÉCUTIF 2026/2027', 14, 22);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(220, 235, 255);
  doc.text('Fiche Officielle des Comptes & Accès Privilégiés RBAC (16 Membres du Bureau)', 14, 30);

  // Métadonnées & Cartouche de Sécurité
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`DATE D'EXTRACTION : ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`, 14, 45);
  doc.text(`AUTORITÉ ÉMETTRICE : ${adminName}`, 115, 45);
  doc.text(`TOTAL MEMBRES BUREAU : ${listToExport.length} dirigeants`, 14, 51);
  doc.text(`POLITIQUE DE SÉCURITÉ : CDC GIT-2026-001 (Section 3 & RBAC)`, 115, 51);

  // Boîte d'instructions de sécurité du Bureau
  doc.setFillColor(254, 243, 199); // Fond ambré doux
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(14, 55, 182, 19, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(146, 64, 14); // Ambre foncé
  doc.setFont('helvetica', 'bold');
  doc.text('DIRECTIVES STRICTES DE CONFIDENTIALITÉ DU BUREAU EXÉCUTIF :', 18, 61);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('1. Mot de passe initial universel : git2026. Renouvellement personnel obligatoire dès la 1ère connexion.', 18, 66);
  doc.text('2. L\'administrateur ne peut pas modifier un mot de passe sans demande formelle de l\'officier concerné.', 18, 70);

  const tableRows = listToExport.map((u, i) => [
    `${i + 1}`,
    u.matricule,
    `${u.nom} ${u.prenom}`,
    u.poste || 'Officier Exécutif',
    u.role,
    u.email,
    u.mustChangePassword ? 'git2026 (Initial)' : 'Défini / Protégé',
    u.mustChangePassword ? 'Obligatoire' : 'Actif'
  ]);

  autoTable(doc, {
    startY: 78,
    head: [['N°', 'Matricule', 'Nom & Prénom', 'Poste au Bureau', 'Rôle RBAC', 'Email Institutionnel', 'Mot de Passe', 'Changement']],
    body: tableRows,
    headStyles: {
      fillColor: [11, 61, 145],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left',
    },
    styles: {
      fontSize: 7,
      cellPadding: 2,
      overflow: 'linebreak',
    },
    columnStyles: {
      0: { cellWidth: 7, halign: 'center' },
      1: { cellWidth: 20, fontStyle: 'bold' },
      2: { cellWidth: 38, fontStyle: 'bold' },
      3: { cellWidth: 38 },
      4: { cellWidth: 16 },
      5: { cellWidth: 37 },
      6: { cellWidth: 20, fontStyle: 'bold' },
      7: { cellWidth: 14, halign: 'center' },
    },
    alternateRowStyles: { fillColor: [254, 252, 247] },
    margin: { left: 10, right: 10 },
  });

  // Footer de certification sur chaque page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'italic');
    doc.text(
      'Document Officiel Exécutif · Saint Jérôme Polytechnique Douala · Division Génie Infotronique (GIT)',
      10,
      292
    );
    doc.text(`Page ${i} sur ${pageCount}`, 185, 292);
  }

  const filename = `GIT_Bureau_Executif_Identifiants_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

/**
 * Téléchargement au format CSV des MEMBRES DU BUREAU
 */
export function downloadBureauCredentialsCsv(users: User[]) {
  const bureauUsers = users.filter((u) => u.niveau === 'GI_Bureau' || u.matricule.startsWith('GIT-BUR-'));
  const listToExport = bureauUsers.length > 0 ? bureauUsers : users;

  const headers = [
    'Numero',
    'Matricule',
    'Poste Officiel',
    'Nom',
    'Prenom',
    'Nom Complet',
    'Telephone',
    'Email',
    'Niveau',
    'Role RBAC',
    'Mot de passe par defaut',
    'Changement requis 1ere connexion',
    'Statut Compte'
  ];

  const rows = listToExport.map((u, i) => [
    i + 1,
    `"${u.matricule}"`,
    `"${(u.poste || 'Membre du Bureau').replace(/"/g, '""')}"`,
    `"${u.nom.replace(/"/g, '""')}"`,
    `"${u.prenom.replace(/"/g, '""')}"`,
    `"${(u.nom + ' ' + u.prenom).replace(/"/g, '""')}"`,
    `"${(u.phone || '').replace(/"/g, '""')}"`,
    `"${u.email}"`,
    `"${u.niveau}"`,
    `"${u.role}"`,
    `"${u.mustChangePassword ? 'git2026' : '[Protégé]'}"`,
    `"${u.mustChangePassword ? 'OUI (Obligatoire)' : 'NON (Déjà changé)'}"`,
    `"${u.isActive ? 'ACTIF' : 'SUSPENDU'}"`
  ]);

  const csvContent = '\uFEFF' + [
    headers.join(';'),
    ...rows.map((r) => r.join(';'))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `GIT_Bureau_Executif_Identifiants_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Reçu de paiement certifié officiel (Cotisation ou Pénalité)
 */
export function generateReceiptPdf(params: {
  receiptType: 'COTISATION' | 'PENALITE';
  receiptNumber: string;
  member: User;
  treasurerName: string;
  amount: number;
  method: string;
  reference?: string;
  details: string;
  date?: string;
}) {
  const {
    receiptType,
    receiptNumber,
    member,
    treasurerName,
    amount,
    method,
    reference,
    details,
    date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  } = params;

  const doc = new jsPDF();

  // En-tête officiel
  doc.setFillColor(11, 61, 145); // Bleu institutionnel SJP
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SAINT JÉRÔME POLYTECHNIQUE · DOUALA', 105, 12, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('DIVISION GÉNIE INFOTRONIQUE (GIT) · TRÉSORERIE GÉNÉRALE', 105, 19, { align: 'center' });

  doc.setFontSize(8);
  doc.text('REÇU OFFICIEL DE PAIEMENT CERTIFIÉ · CAHIER DES CHARGES GIT-CDC-2026-001', 105, 26, { align: 'center' });

  // Cadre du reçu
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, 38, 180, 240, 4, 4);

  // Type de reçu & Numéro
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const titre = receiptType === 'COTISATION' ? 'REÇU DE COTISATION ANNUELLE' : 'REÇU DE PAIEMENT DE PÉNALITÉ';
  doc.text(titre, 25, 52);

  doc.setFontSize(10);
  doc.setFont('courier', 'bold');
  doc.setTextColor(11, 61, 145);
  doc.text(`N° ${receiptNumber}`, 180, 52, { align: 'right' });

  doc.setDrawColor(226, 232, 240);
  doc.line(25, 58, 185, 58);

  // Date et guichet
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Date d'émission : ${date}`, 25, 66);
  doc.text(`Émis par : ${treasurerName} (Trésorerie Générale)`, 185, 66, { align: 'right' });

  // Informations Membre
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(25, 74, 160, 48, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(25, 74, 160, 48, 2, 2, 'S');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 61, 145);
  doc.text('BÉNÉFICIAIRE DU REÇU (MEMBRE)', 32, 83);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`Nom & Prénom : ${member.nom} ${member.prenom}`, 32, 92);
  doc.text(`Matricule : ${member.matricule}`, 32, 100);
  doc.text(`Promotion : ${member.niveau}`, 32, 108);
  doc.text(`Email institutionnel : ${member.email}`, 32, 116);

  // Tableau récapitulatif
  autoTable(doc, {
    startY: 130,
    margin: { left: 25, right: 25 },
    head: [['Désignation', 'Mode de Règlement', 'Référence Transaction', 'Montant Payé']],
    body: [
      [
        details,
        method,
        reference || 'Paiement direct guichet',
        `${amount.toLocaleString('fr-FR')} FCFA`
      ]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [11, 61, 145],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [15, 23, 42],
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 35 },
      2: { cellWidth: 35 },
      3: { cellWidth: 20, fontStyle: 'bold', halign: 'right' },
    },
  });

  // Montant en lettres et statut
  const finalY = (doc as any).lastAutoTable?.finalY || 160;

  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(25, finalY + 8, 160, 22, 2, 2, 'FD');

  doc.setTextColor(22, 101, 52);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('STATUT DU PAIEMENT : ENCAISSÉ & CERTIFIÉ CONFORME', 32, finalY + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Total perçu : ${amount.toLocaleString('fr-FR')} Francs CFA (valide pour régularisation laboratoire et réseau Wi-Fi).`, 32, finalY + 24);

  // Signatures
  doc.setDrawColor(226, 232, 240);
  doc.line(25, finalY + 45, 185, finalY + 45);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Le Membre Bénéficiaire', 40, finalY + 54);
  doc.text('Pour la Trésorerie Générale GIT', 140, finalY + 54);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text('(Signature)', 40, finalY + 62);
  doc.text('Cachet officiel & Signature électronique', 140, finalY + 62);
  doc.text(treasurerName, 140, finalY + 70);

  // Bas de page
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Ce document fait foi de paiement officiel devant le Conseil de Discipline, le Censeur et la Division Génie Infotronique.',
    105,
    270,
    { align: 'center' }
  );

  const filename = `${receiptType}_${member.matricule}_${receiptNumber}.pdf`;
  doc.save(filename);
}

