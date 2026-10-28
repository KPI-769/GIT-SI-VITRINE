const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');
const autoTableModule = require('jspdf-autotable');
const autoTable = autoTableModule.default || autoTableModule;

// Liste officielle des 17 membres du Bureau Exécutif GIT
const bureauMembers = [
  {
    num: 1,
    matricule: 'GIT-BUR-01',
    nom: 'KPWANDA Yvan',
    poste: 'Président de la Division',
    role: 'ADMIN',
    email: 'kpwanda.yvan@saintjerome.cm',
    pole: 'Haute Direction'
  },
  {
    num: 2,
    matricule: 'GIT-BUR-02',
    nom: 'MOUNYICHE ABDALLAH Wahab',
    poste: 'Vice-Président',
    role: 'ADMIN',
    email: 'abdallah.wahab@saintjerome.cm',
    pole: 'Haute Direction'
  },
  {
    num: 3,
    matricule: 'GIT-BUR-03',
    nom: 'MAWADJOU Dokass Danielle',
    poste: 'Secrétaire Générale',
    role: 'ADMIN',
    email: 'mawadjou.dokass@saintjerome.cm',
    pole: 'Titulaires Exécutifs'
  },
  {
    num: 4,
    matricule: 'GIT-BUR-04',
    nom: 'SIGNE Astrid',
    poste: 'Censeur Principal (Scan & Contrôle)',
    role: 'CENSEUR',
    email: 'signe.astrid@saintjerome.cm',
    pole: 'Titulaires Exécutifs'
  },
  {
    num: 5,
    matricule: 'GIT-BUR-05',
    nom: 'MIMCHE Marouf',
    poste: 'Commissaire aux Comptes',
    role: 'TREASURER',
    email: 'mimche.marouf@saintjerome.cm',
    pole: 'Titulaires Exécutifs'
  },
  {
    num: 6,
    matricule: 'GIT-BUR-06',
    nom: 'EBODE Erika',
    poste: 'Trésorière Générale',
    role: 'TREASURER',
    email: 'ebode.erika@saintjerome.cm',
    pole: 'Titulaires Exécutifs'
  },
  {
    num: 7,
    matricule: 'GIT-BUR-07',
    nom: 'NYATCHOU Junior',
    poste: 'Responsable Labo & Réseau WiFi',
    role: 'LAB_MANAGER',
    email: 'nyatchou.junior@saintjerome.cm',
    pole: 'Titulaires Exécutifs'
  },
  {
    num: 8,
    matricule: 'GIT-BUR-08',
    nom: 'NGEUMOU Jemima',
    poste: 'Resp. Communication & Événements',
    role: 'COMMUNICATION',
    email: 'ngeumou.jemima@saintjerome.cm',
    pole: 'Titulaires Exécutifs'
  },
  {
    num: 9,
    matricule: 'GIT-BUR-09',
    nom: 'MBIAKOP Junior',
    poste: 'Resp. Formation & Projets R&D',
    role: 'FORMATION',
    email: 'mbiakop.junior@saintjerome.cm',
    pole: 'Titulaires Exécutifs'
  },
  {
    num: 10,
    matricule: 'GIT-BUR-10',
    nom: 'NJOUME ETEH Claude Arsène',
    poste: 'Conseiller Spécial 1',
    role: 'CONSEILLER',
    email: 'njoume.claude@saintjerome.cm',
    pole: 'Conseil & Stratégie'
  },
  {
    num: 11,
    matricule: 'GIT-BUR-11',
    nom: 'MAPOURE Davelton',
    poste: 'Conseiller Spécial 2',
    role: 'CONSEILLER',
    email: 'mapoure.davelton@saintjerome.cm',
    pole: 'Conseil & Stratégie'
  },
  {
    num: 12,
    matricule: 'GIT-BUR-12',
    nom: 'SEMPEY Pierre Lionel',
    poste: 'Conseiller Spécial 3',
    role: 'CONSEILLER',
    email: 'sempey.lionel@saintjerome.cm',
    pole: 'Conseil & Stratégie'
  },
  {
    num: 13,
    matricule: 'GIT-BUR-13',
    nom: 'MPOPO Antoinne',
    poste: 'Resp. Formation & Projets Adjoint',
    role: 'FORMATION',
    email: 'mpopo.antoinne@saintjerome.cm',
    pole: 'Adjoints Exécutifs'
  },
  {
    num: 14,
    matricule: 'GIT-BUR-14',
    nom: 'POKASSA Moustapha',
    poste: 'Resp. Communication Adjoint',
    role: 'COMMUNICATION',
    email: 'pokassa.moustapha@saintjerome.cm',
    pole: 'Adjoints Exécutifs'
  },
  {
    num: 15,
    matricule: 'GIT-BUR-15',
    nom: 'NOUBEYO Jean Célestin',
    poste: 'Censeur Adjoint (Contrôle d\'accès)',
    role: 'CENSEUR',
    email: 'noubeyo.celestin@saintjerome.cm',
    pole: 'Adjoints Exécutifs'
  },
  {
    num: 16,
    matricule: 'GIT-BUR-16',
    nom: 'ARMEL Jennifer',
    poste: 'Secrétaire Générale Adjointe',
    role: 'ADMIN',
    email: 'armel.jennifer@saintjerome.cm',
    pole: 'Adjoints Exécutifs'
  },
  {
    num: 17,
    matricule: 'GIT-BUR-17',
    nom: 'KOUOH ETEKI Freddy',
    poste: 'Community Manager & Galerie',
    role: 'COMMUNITY_MANAGER',
    email: 'kouoh.fredy@saintjerome.cm',
    pole: 'Titulaires Exécutifs'
  }
];

function generatePdf() {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // 1. Bandeau supérieur bleu nuit SJP
  doc.setFillColor(11, 43, 100); // Navy blue
  doc.rect(0, 0, 210, 38, 'F');

  // Ligne d'accent or
  doc.setFillColor(217, 119, 6); // Warm Amber
  doc.rect(0, 38, 210, 3, 'F');

  // Titres du bandeau
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('SAINT JÉRÔME POLYTECHNIQUE · DOUALA', 14, 14);

  doc.setFontSize(11);
  doc.setTextColor(253, 230, 138); // Amber clair
  doc.text('DIVISION GÉNIE INFOTRONIQUE (GIT) · MANDAT 2026/2027', 14, 23);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(224, 231, 255);
  doc.text('LISTE OFFICIELLE DES MEMBRES DU BUREAU EXÉCUTIF & ATTRIBUTIONS', 14, 32);

  // 2. Bloc Métadonnées & Authentification
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  const dateStr = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  doc.text(`DATE D'ÉMISSION : ${dateStr}`, 14, 48);
  doc.text('AUTORITÉ : Présidence & Bureau Exécutif GIT', 110, 48);
  doc.text('EFFECTIF BUREAU : 17 Membres Officiels', 14, 54);
  doc.text('STATUT : Document de Référence Institutionnel', 110, 54);

  // 3. Cadre Récapitulatif / Note institutionnelle
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 59, 182, 17, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('MISSION DU BUREAU EXÉCUTIF :', 18, 65);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(
    'Direction, animation pédagogique, coordination des projets R&D, gestion du laboratoire de robotique,',
    18,
    70
  );
  doc.text(
    'gestion de la trésorerie et discipline au sein de la Division Génie Infotronique (Saint Jérôme Polytechnique).',
    18,
    74
  );

  // 4. Tableau principal avec jspdf-autotable
  const tableData = bureauMembers.map((m) => [
    `${m.num}`,
    m.matricule,
    m.nom,
    m.poste,
    m.pole,
    m.role,
    m.email
  ]);

  autoTable(doc, {
    startY: 81,
    head: [['N°', 'Matricule', 'Nom & Prénom', 'Poste au Bureau', 'Pôle', 'Rôle', 'Email Institutionnel']],
    body: tableData,
    headStyles: {
      fillColor: [11, 43, 100],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left'
    },
    styles: {
      fontSize: 7.2,
      cellPadding: 2.2,
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    columnStyles: {
      0: { cellWidth: 7, halign: 'center' },
      1: { cellWidth: 20, fontStyle: 'bold' },
      2: { cellWidth: 38, fontStyle: 'bold' },
      3: { cellWidth: 42 },
      4: { cellWidth: 25 },
      5: { cellWidth: 16, halign: 'center' },
      6: { cellWidth: 34 }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 14, right: 14 },
    theme: 'grid'
  });

  // 5. Zone de signatures en bas
  const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) || 240;
  const signY = Math.min(finalY + 8, 255);

  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text('Pour le Secrétariat Général', 25, signY);
  doc.text('Pour la Présidence du Bureau', 135, signY);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Dokass MAWADJOU', 25, signY + 6);
  doc.text('Yvan KPWANDA', 135, signY + 6);

  doc.setDrawColor(203, 213, 225);
  doc.line(25, signY + 18, 75, signY + 18);
  doc.line(135, signY + 18, 185, signY + 18);

  doc.setFontSize(6.5);
  doc.text('(Signature & Cachet)', 35, signY + 22);
  doc.text('(Signature & Cachet)', 145, signY + 22);

  // 6. Pied de page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'Document Officiel · Division Génie Infotronique (GIT) · Saint Jérôme Polytechnique Douala',
      14,
      290
    );
    doc.text(`Page ${i} / ${pageCount}`, 185, 290);
  }

  const outputPath = path.join(__dirname, '..', 'LISTE_OFFICIELLE_MEMBRES_BUREAU_GIT.pdf');
  const buffer = Buffer.from(doc.output('arraybuffer'));
  fs.writeFileSync(outputPath, buffer);
  console.log(`PDF généré avec succès à : ${outputPath}`);
}

generatePdf();
