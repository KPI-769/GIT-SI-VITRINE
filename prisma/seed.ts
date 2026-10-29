import { PrismaClient, Role, EventStatus, CourseStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SJP_OFFICIAL_MEMBERS, SJP_BUREAU_MEMBERS } from '../src/lib/members-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Début du peuplement de la base MySQL git_community...');

  const defaultPasswordHash = await bcrypt.hash('git2026', 10);
  const adminPasswordHash = await bcrypt.hash('admin2026', 10);

  // 1. Administrateur Central
  console.log('👤 Création du compte Administrateur Central...');
  await prisma.user.upsert({
    where: { matricule: 'GIT-ADMIN' },
    update: {},
    create: {
      matricule: 'GIT-ADMIN',
      nom: 'BUREAU',
      prenom: 'Admin Central',
      email: 'admin.git@saintjerome.cm',
      phone: '677 00 00 00',
      niveau: 'GI_Bureau',
      role: Role.ADMIN,
      poste: 'Administration Centrale GIT',
      passwordHash: adminPasswordHash,
      mustChangePassword: false,
      isActive: true,
      qrCodeToken: 'token_admin_sjp_001',
      isWifiAllowed: true,
      isLabAllowed: true,
    },
  });

  // Helper pour exécuter par petits lots (évite la saturation réseau et accélère 10x)
  async function processInBatches<T>(items: T[], batchSize: number, fn: (item: T, index: number) => Promise<void>) {
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      await Promise.all(batch.map((item, idx) => fn(item, i + idx)));
    }
  }

  // 2. 17 Membres du Bureau Exécutif
  console.log(`🏛️ Insertion des ${SJP_BUREAU_MEMBERS.length} membres du Bureau Exécutif...`);
  await processInBatches(SJP_BUREAU_MEMBERS, 6, async (bm) => {
    await prisma.user.upsert({
      where: { matricule: bm.matricule },
      update: {
        role: bm.role as Role,
        poste: bm.poste,
        nom: bm.nom,
        prenom: bm.prenom,
        email: bm.email,
        phone: bm.phone,
      },
      create: {
        matricule: bm.matricule,
        nom: bm.nom,
        prenom: bm.prenom,
        email: bm.email,
        phone: bm.phone || '',
        niveau: 'GI_Bureau',
        role: bm.role as Role,
        poste: bm.poste,
        passwordHash: defaultPasswordHash,
        mustChangePassword: true,
        isActive: true,
        qrCodeToken: `token_bureau_${bm.matricule.toLowerCase()}`,
        isWifiAllowed: true,
        isLabAllowed: true,
      },
    });
  });

  // 3. 99 Membres Élèves-Ingénieurs
  console.log(`🎓 Insertion des ${SJP_OFFICIAL_MEMBERS.length} élèves-ingénieurs...`);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  interface MinimalUser {
    id: string;
    email: string;
    matricule: string;
  }

  // Pré-chargement des emails existants pour éviter les findUnique réseau lents
  const existingUsers: MinimalUser[] = await prisma.user.findMany({ select: { id: true, email: true, matricule: true } });
  const existingEmailMap = new Map<string, MinimalUser>(existingUsers.map((u: MinimalUser) => [u.email, u]));
  const existingMatriculeMap = new Map<string, MinimalUser>(existingUsers.map((u: MinimalUser) => [u.matricule, u]));

  await processInBatches(SJP_OFFICIAL_MEMBERS, 8, async (om, i) => {
    const parts = om.fullName.trim().split(' ');
    const nom = parts[0] || 'MEMBRE';
    const prenom = parts.slice(1).join(' ') || 'GIT';
    const niveauIndex = (i % 5) + 1;
    const niveau = `GI_${niveauIndex}`;

    let user: MinimalUser | null | undefined = existingEmailMap.get(om.email) || existingMatriculeMap.get(om.matricule);
    if (!user) {
      user = await prisma.user.upsert({
        where: { matricule: om.matricule },
        update: {
          nom,
          prenom,
          email: om.email,
          phone: om.phone,
        },
        create: {
          matricule: om.matricule,
          nom,
          prenom,
          email: om.email,
          phone: om.phone,
          niveau,
          role: Role.MEMBER,
          passwordHash: defaultPasswordHash,
          mustChangePassword: true,
          isActive: true,
          qrCodeToken: `token_mem_${om.matricule.toLowerCase()}`,
          isWifiAllowed: true,
          isLabAllowed: false,
        },
      });
      existingEmailMap.set(user.email, user);
      existingMatriculeMap.set(user.matricule, user);
    }

    // Créer une cotisation pour le mois courant si elle n'existe pas
    await prisma.cotisation.upsert({
      where: {
        userId_mois_annee: {
          userId: user.id,
          mois: currentMonth,
          annee: currentYear,
        },
      },
      update: {},
      create: {
        userId: user.id,
        mois: currentMonth,
        annee: currentYear,
        montant: 2000,
        isPaid: i % 3 === 0, // 1 sur 3 est à jour pour la simulation
      },
    });
  });

  // 4. Événements initiaux
  console.log('📅 Insertion des événements initiaux...');
  const initialEvents = [
    {
      title: 'Hackathon GIT 2026 · IoT & IA Embarquée',
      description: 'Grand hackathon inter-promotions de 48h centré sur le développement de solutions intelligentes pour les défis locaux camerounais (agriculture de précision, énergie solaire et gestion de l\'eau).',
      startDate: new Date('2026-11-15T08:00:00Z'),
      endDate: new Date('2026-11-17T18:00:00Z'),
      location: 'Laboratoire GIT · Saint Jérôme Polytechnique',
      status: EventStatus.UPCOMING,
      coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Séminaire Cybersécurité & Cloud Architecture',
      description: 'Conférence animée par des ingénieurs seniors alumni sur la sécurisation des architectures cloud hybrides, Kubernetes et la conformité RGPD/APDP.',
      startDate: new Date('2026-11-28T14:00:00Z'),
      endDate: new Date('2026-11-28T17:30:00Z'),
      location: 'Amphithéâtre 300 · Campus Saint Jérôme',
      status: EventStatus.UPCOMING,
      coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Atelier Câblage Réseaux Industriels & Cisco',
      description: 'Session pratique de raccordement de fibre optique, configuration de VLANs et tests de bande passante sur bancs de test certifiés.',
      startDate: new Date('2026-10-10T09:00:00Z'),
      endDate: new Date('2026-10-10T16:00:00Z'),
      location: 'Salle Réseau 204 · Bâtiment Polytechnique',
      status: EventStatus.COMPLETED,
      coverImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  for (const ev of initialEvents) {
    const existing = await prisma.event.findFirst({ where: { title: ev.title } });
    if (!existing) {
      await prisma.event.create({ data: ev });
    }
  }

  // 5. Formations & Certifications initiales
  console.log('📚 Insertion des formations initiales...');
  const initialCourses = [
    {
      title: 'Conception de Systèmes Embarqués STM32 & FreeRTOS',
      description: 'Maîtrise de la programmation en C/C++ sur microcontrôleurs ARM Cortex-M4, gestion des tâches temps réel avec FreeRTOS et protocoles SPI/I2C/CAN.',
      instructor: 'Ing. Tchounga K. (Resp. Formation)',
      hoursCount: 30,
      status: CourseStatus.IN_PROGRESS,
      level: 'GI_3+',
      startDate: new Date('2026-10-15T15:00:00Z'),
    },
    {
      title: 'Architecture Microservices avec Docker & Kubernetes',
      description: 'Conteneurisation d\'applications industrielles, orchestration multi-nœuds, pipelines CI/CD automatisés et déploiement haute disponibilité.',
      instructor: 'Dr. Fouda M.',
      hoursCount: 25,
      status: CourseStatus.PLANNED,
      level: 'GI_4 & GI_5',
      startDate: new Date('2026-12-01T14:00:00Z'),
    },
    {
      title: 'Fondamentaux de la Robotique Mobile Autonome & ROS 2',
      description: 'Introduction aux cinématiques de robots différentiels, SLAM (cartographie simultanée), navigation autonome avec LiDAR et simulation sous Gazebo.',
      instructor: 'Ing. Kamga P.',
      hoursCount: 20,
      status: CourseStatus.PLANNED,
      level: 'Tous Niveaux',
      startDate: new Date('2026-12-10T09:00:00Z'),
    },
  ];

  for (const crs of initialCourses) {
    const existing = await prisma.course.findFirst({ where: { title: crs.title } });
    if (!existing) {
      await prisma.course.create({ data: crs });
    }
  }

  // 6. Projets Vitrine
  console.log('💡 Insertion des projets vitrine...');
  const initialProjects = [
    {
      title: 'Smart Campus SJP · Monitoring Énergétique IoT',
      slug: 'smart-campus-sjp',
      description: 'Réseau de capteurs communicants sans fil déployé sur les compteurs du campus permettant le suivi en temps réel des consommations électriques et détection d\'anomalies.',
      category: 'IoT & Énergie',
      featured: true,
      githubUrl: 'https://github.com/saintjerome-git/smart-campus',
      demoUrl: 'https://git.saintjerome.cm/demo/smart-campus',
      coverImage: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Passerelle LoRaWAN Autonome pour Stations Météo',
      slug: 'passerelle-lorawan',
      description: 'Passerelle radio longue portée alimentée par panneau solaire et batterie LiFePO4, transmettant les données météorologiques vers la plateforme centrale du laboratoire.',
      category: 'Embarqué & Télécoms',
      featured: true,
      githubUrl: 'https://github.com/saintjerome-git/lorawan-gateway',
      coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  for (const prj of initialProjects) {
    await prisma.project.upsert({
      where: { slug: prj.slug },
      update: {},
      create: prj,
    });
  }

  console.log('✅ Base de données MySQL git_community initialisée et peuplée avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed Prisma:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
