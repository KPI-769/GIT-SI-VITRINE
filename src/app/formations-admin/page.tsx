'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppHeader from '@/components/AppHeader';
import { Course, CourseStatus, User, Certification, Project, ProjectContributor } from '@/lib/types';
import { INITIAL_COURSES, INITIAL_PROJECTS } from '@/lib/store';
import {
  GraduationCap,
  Plus,
  Edit3,
  Trash2,
  CheckCircle,
  Clock,
  Award,
  BookOpen,
  ShieldAlert,
  X,
  AlertCircle,
  Search,
  UserCheck,
  Cpu,
  FolderGit2,
  ExternalLink,
  Star,
  Users,
  Code2,
  Sparkles,
  ChevronDown,
  UserPlus
} from 'lucide-react';

const STATUS_META: Record<CourseStatus, { label: string; badge: string }> = {
  PLANNED: { label: 'Planifié', badge: 'bg-blue-100 text-blue-900 border-blue-300' },
  IN_PROGRESS: { label: 'En cours', badge: 'bg-amber-100 text-amber-900 border-amber-300' },
  COMPLETED: { label: 'Terminé', badge: 'bg-emerald-100 text-emerald-900 border-emerald-300' }
};

const PROJECT_CATEGORIES = [
  'Systèmes Embarqués',
  'Logiciel & Fullstack',
  'Réseaux & IoT',
  'Automatique & Robotique'
] as const;

const COURSE_STORAGE_KEY = 'git_courses_v2';
const CERTIF_STORAGE_KEY = 'git_certifications_v2';
const PROJECT_STORAGE_KEY = 'git_projects_v2';

function loadCourses(): Course[] {
  if (typeof window === 'undefined') return INITIAL_COURSES;
  try {
    const stored = localStorage.getItem(COURSE_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return INITIAL_COURSES;
}

function saveCourses(courses: Course[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COURSE_STORAGE_KEY, JSON.stringify(courses));
}

function loadCertifications(): Certification[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CERTIF_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveCertifications(certs: Certification[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CERTIF_STORAGE_KEY, JSON.stringify(certs));
}

function loadProjects(): Project[] {
  if (typeof window === 'undefined') return INITIAL_PROJECTS;
  try {
    const stored = localStorage.getItem(PROJECT_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return INITIAL_PROJECTS;
}

function saveProjects(projects: Project[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projects));
  window.dispatchEvent(new Event('git_projects_updated'));
}

const EMPTY_COURSE: Omit<Course, 'id'> = {
  title: '',
  description: '',
  status: 'PLANNED',
  instructor: '',
  hoursCount: 20,
  startDate: new Date().toISOString().slice(0, 10),
  level: 'Tous Niveaux'
};

const EMPTY_PROJECT: Omit<Project, 'id'> = {
  title: '',
  slug: '',
  description: '',
  category: 'Systèmes Embarqués',
  githubUrl: '',
  linkedinUrl: '',
  tiktokUrl: '',
  demoUrl: '',
  coverImage: '',
  featured: false,
  technologies: ['C/C++', 'FreeRTOS'],
  membersCount: 1,
  contributors: []
};

export default function FormationsAdminPage() {
  const { isInitialized, currentUser, allUsers } = useAuth();
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState<'courses' | 'projects' | 'certifs'>('courses');
  const [courseEnrollments, setCourseEnrollments] = useState<Record<string, string[]>>({});
  const [courseStatusFilter, setCourseStatusFilter] = useState<'ALL' | CourseStatus>('ALL');
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [certifFilterCourse, setCertifFilterCourse] = useState<string>('ALL');

  // Course modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Course | null>(null);
  const [form, setForm] = useState<Omit<Course, 'id'>>(EMPTY_COURSE);

  // Project modal state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState<Omit<Project, 'id'>>(EMPTY_PROJECT);
  const [techInput, setTechInput] = useState('');
  const [contributorSearch, setContributorSearch] = useState('');
  const [newContributorRole, setNewContributorRole] = useState('Contributeur R&D');

  // Certification modal state
  const [isCertifOpen, setIsCertifOpen] = useState(false);
  const [certifCourse, setCertifCourse] = useState<Course | null>(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<User | null>(null);

  const [toast, setToast] = useState<string | null>(null);

  // Chargement initial depuis le localStorage puis synchronisation avec MySQL
  useEffect(() => {
    setCourses(loadCourses());
    setCertifications(loadCertifications());
    setProjects(loadProjects());
    try {
      const ce = localStorage.getItem('git_course_enrollments_v1');
      if (ce) setCourseEnrollments(JSON.parse(ce));
    } catch {}

    fetch('/api/courses')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.courses) && data.courses.length > 0) {
          setCourses(data.courses);
          saveCourses(data.courses);
        }
      })
      .catch((err) => console.error('Erreur chargement /api/courses:', err));

    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.projects) && data.projects.length > 0) {
          setProjects(data.projects);
          saveProjects(data.projects);
        }
      })
      .catch((err) => console.error('Erreur chargement /api/projects:', err));
  }, []);

  useEffect(() => {
    if (isInitialized && !currentUser) { router.push('/login'); return; }
  }, [isInitialized, currentUser, router]);

  if (!isInitialized || !currentUser) return null;

  // RBAC guard: only FORMATION and ADMIN
  const canAccess = currentUser.role === 'FORMATION' || currentUser.role === 'ADMIN';

  if (!canAccess) {
    return (
      <div className="min-h-screen flex flex-col font-sans" style={{ background: 'var(--surface-1)' }}>
        <AppHeader />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="card p-8 border-l-4 border-l-[#FC3D21] max-w-md text-center space-y-4 shadow-lg bg-white">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Accès Restreint</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              La gestion des formations, projets R&amp;D et certifications est réservée au{' '}
              <strong>Responsable Formation &amp; Projets</strong> et son adjoint.
              <br /><br />
              Matricules autorisés : <code className="font-bold text-[#0B3D91]">GIT-BUR-09</code> (MBIAKOP Junior) &amp;{' '}
              <code className="font-bold text-[#0B3D91]">GIT-BUR-13</code> (MPOPO Antoinne)
            </p>
            <button onClick={() => router.push('/espace-membre')} className="btn-nasa text-xs font-bold cursor-pointer">
              Retourner à mon Espace Membre
            </button>
          </div>
        </div>
      </div>
    );
  }

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Cours CRUD
  const handleSaveCourse = async () => {
    if (!form.title.trim()) return;

    if (editTarget) {
      const updated = courses.map(c => c.id === editTarget.id ? { ...c, ...form } : c);
      setCourses(updated);
      saveCourses(updated);
      showToast('Formation modifiée avec succès.');

      fetch(`/api/courses/${editTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      }).catch(err => console.error('Erreur sync PATCH /api/courses:', err));
    } else {
      const newCourse: Course = {
        id: `course_${Date.now()}`,
        ...form
      };
      const updated = [newCourse, ...courses];
      setCourses(updated);
      saveCourses(updated);
      showToast('Nouvelle formation créée.');

      fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.course?.id) {
            const synced = updated.map(c => c.id === newCourse.id ? { ...c, id: data.course.id } : c);
            setCourses(synced);
            saveCourses(synced);
          }
        })
        .catch(err => console.error('Erreur sync POST /api/courses:', err));
    }

    setIsAddOpen(false);
    setEditTarget(null);
    setForm(EMPTY_COURSE);
  };

  const handleDeleteCourse = async (id: string, title: string) => {
    if (!confirm(`Supprimer définitivement la formation « ${title} » ?`)) return;
    const updated = courses.filter(c => c.id !== id);
    setCourses(updated);
    saveCourses(updated);
    showToast('Formation supprimée.');

    fetch(`/api/courses/${id}`, { method: 'DELETE' })
      .catch(err => console.error('Erreur sync DELETE /api/courses:', err));
  };

  const handleStatusChangeCourse = (courseId: string, status: CourseStatus) => {
    const updated = courses.map(c => c.id === courseId ? { ...c, status } : c);
    setCourses(updated);
    saveCourses(updated);
    showToast('Statut de la formation mis à jour.');
    fetch(`/api/courses/${courseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(err => console.error('Erreur sync PATCH /api/courses:', err));
  };

  const removeEnrollment = (courseId: string, userId: string) => {
    const current = courseEnrollments[courseId] || [];
    const updatedList = current.filter(id => id !== userId);
    const updatedAll = { ...courseEnrollments, [courseId]: updatedList };
    setCourseEnrollments(updatedAll);
    localStorage.setItem('git_course_enrollments_v1', JSON.stringify(updatedAll));
    showToast('Inscription retirée.');
  };

  // Projets CRUD
  const openNewProject = () => {
    setEditingProject(null);
    setProjectForm(EMPTY_PROJECT);
    setTechInput('ESP32, Next.js, FreeRTOS');
    setIsProjectModalOpen(true);
  };

  const openEditProject = (p: Project) => {
    setEditingProject(p);
    setProjectForm({
      title: p.title,
      slug: p.slug,
      description: p.description,
      category: p.category,
      githubUrl: p.githubUrl || '',
      linkedinUrl: p.linkedinUrl || '',
      tiktokUrl: p.tiktokUrl || '',
      demoUrl: p.demoUrl || '',
      coverImage: p.coverImage || '',
      featured: Boolean(p.featured),
      technologies: p.technologies || [],
      membersCount: p.membersCount || p.contributors?.length || 1,
      contributors: p.contributors || []
    });
    setTechInput((p.technologies || []).join(', '));
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async () => {
    if (!projectForm.title.trim() || !projectForm.description.trim()) {
      showToast('Le titre et la description du projet sont obligatoires.');
      return;
    }

    const techArray = techInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const slug = String(projectForm.title)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const projectPayload = {
      ...projectForm,
      slug,
      technologies: techArray,
      membersCount: projectForm.contributors.length || 1
    };

    if (editingProject) {
      const updated = projects.map(p => p.id === editingProject.id ? { ...p, ...projectPayload } : p);
      setProjects(updated);
      saveProjects(updated);
      showToast('Projet R&D mis à jour.');

      fetch(`/api/projects/${editingProject.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectPayload),
      }).catch(err => console.error('Erreur sync PATCH /api/projects:', err));
    } else {
      const newProj: Project = {
        id: `proj-${Date.now()}`,
        ...projectPayload
      };
      const updated = [newProj, ...projects];
      setProjects(updated);
      saveProjects(updated);
      showToast('Nouveau projet R&D ajouté.');

      fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectPayload),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.project?.id) {
            const synced = updated.map(p => p.id === newProj.id ? { ...p, id: data.project.id } : p);
            setProjects(synced);
            saveProjects(synced);
          }
        })
        .catch(err => console.error('Erreur sync POST /api/projects:', err));
    }

    setIsProjectModalOpen(false);
    setEditingProject(null);
  };

  const handleDeleteProject = async (id: string, title: string) => {
    if (!confirm(`Supprimer définitivement le projet R&D « ${title} » ?`)) return;
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    saveProjects(updated);
    showToast('Projet R&D supprimé.');

    fetch(`/api/projects/${id}`, { method: 'DELETE' })
      .catch(err => console.error('Erreur sync DELETE /api/projects:', err));
  };

  const addContributorToProject = (user: User) => {
    if (projectForm.contributors.some(c => c.userId === user.id)) {
      showToast(`${user.prenom} ${user.nom} est déjà contributeur.`);
      return;
    }
    const newContrib: ProjectContributor = {
      id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      projectId: editingProject ? editingProject.id : 'temp',
      userId: user.id,
      name: `${user.prenom} ${user.nom}`,
      matricule: user.matricule,
      roleInProject: newContributorRole || 'Développeur Firmware'
    };
    setProjectForm(prev => ({
      ...prev,
      contributors: [...prev.contributors, newContrib]
    }));
    setContributorSearch('');
  };

  const removeContributorFromProject = (userId: string) => {
    setProjectForm(prev => ({
      ...prev,
      contributors: prev.contributors.filter(c => c.userId !== userId)
    }));
  };

  // Certification modal handlers
  const openDeliverModal = (course: Course) => {
    setCertifCourse(course);
    setSelectedMember(null);
    setMemberSearch('');
    setIsCertifOpen(true);
  };

  const filteredMembers = allUsers.filter(u =>
    u.role === 'MEMBER' &&
    (u.nom.toLowerCase().includes(memberSearch.toLowerCase()) ||
      u.prenom.toLowerCase().includes(memberSearch.toLowerCase()) ||
      u.matricule.toLowerCase().includes(memberSearch.toLowerCase()))
  ).slice(0, 6);

  const alreadyCertified = (userId: string, courseId: string) =>
    certifications.some(c => c.userId === userId && c.courseId === courseId);

  const handleDeliverCertif = () => {
    if (!selectedMember || !certifCourse) return;
    if (alreadyCertified(selectedMember.id, certifCourse.id)) {
      showToast(`${selectedMember.prenom} ${selectedMember.nom} a déjà cette certification.`);
      return;
    }
    const newCertif: Certification = {
      id: `cert_${Date.now()}`,
      courseId: certifCourse.id,
      userId: selectedMember.id,
      courseTitle: certifCourse.title,
      issuedAt: new Date().toISOString()
    };
    const updated = [newCertif, ...certifications];
    setCertifications(updated);
    saveCertifications(updated);
    showToast(`✅ Certification délivrée à ${selectedMember.prenom} ${selectedMember.nom} pour « ${certifCourse.title} » !`);
    setSelectedMember(null);
    setMemberSearch('');
  };

  const handleRevokeCertif = (certId: string, memberName: string, courseTitle: string) => {
    if (!confirm(`Révoquer la certification de ${memberName} pour « ${courseTitle} » ?`)) return;
    const updated = certifications.filter(c => c.id !== certId);
    setCertifications(updated);
    saveCertifications(updated);
    showToast('Certification révoquée.');
  };

  const certifsByCourseName = (courseTitle: string) =>
    certifications.filter(c => c.courseTitle === courseTitle);

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: 'var(--surface-1)' }}>
      <AppHeader />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toast}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 anim-fade-in">
        {/* Header de la page */}
        <section className="card p-6 border-l-4 border-l-amber-500 shadow-md bg-white flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-3">
              <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
              <span>Pôle Formation, Projets R&amp;D &amp; Certifications · Mandat 2026/2027</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
              Gestion des Formations &amp; Projets R&amp;D
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
              Vous êtes <strong>{currentUser.prenom} {currentUser.nom}</strong> ({currentUser.role}). Coordonnez les ateliers théoriques, les projets d&apos;ingénierie R&amp;D et délivrez les accréditations officielles.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {activeTab === 'courses' && (
              <button
                onClick={() => { setEditTarget(null); setForm(EMPTY_COURSE); setIsAddOpen(true); }}
                className="btn-nasa text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvelle Formation</span>
              </button>
            )}

            {activeTab === 'projects' && (
              <button
                onClick={openNewProject}
                className="btn-nasa text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Projet R&amp;D</span>
              </button>
            )}
          </div>
        </section>

        {/* Statistiques Rapides */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="card p-4 bg-white border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Formations Totales</span>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{courses.length}</p>
          </div>
          <div className="card p-4 bg-white border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Projets R&amp;D Actifs</span>
            <p className="text-2xl font-black text-blue-600 mt-0.5">{projects.length}</p>
          </div>
          <div className="card p-4 bg-white border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Projets En Vedette</span>
            <p className="text-2xl font-black text-amber-600 mt-0.5">{projects.filter(p => p.featured).length}</p>
          </div>
          <div className="card p-4 bg-amber-50 border border-amber-200">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Certifications Délivrées</span>
            <p className="text-2xl font-black text-amber-900 mt-0.5">{certifications.length}</p>
          </div>
        </div>

        {/* Sélecteur d'Onglets */}
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-full sm:w-fit">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'courses' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>Formations ({courses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'projects' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderGit2 className="w-4 h-4 text-blue-600" />
            <span>Projets R&amp;D &amp; Labo ({projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('certifs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'certifs' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Certifications ({certifications.length})</span>
          </button>
        </div>

        {/* ════════════ ONGLET 1: FORMATIONS ════════════ */}
        {activeTab === 'courses' && (
          <div className="card p-6 bg-white border border-slate-300 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-600" />
                  <span>Modules Académiques &amp; Ateliers Pratiques</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Gérez les formations en cours, futures (planifiées) et passées, suivez les inscrits et certifiez les étudiants.
                </p>
              </div>
              <span className="text-xs text-slate-500 font-mono shrink-0">{courses.length} formation(s) enregistrée(s)</span>
            </div>

            {/* Filtres de statut de formation */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => setCourseStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  courseStatusFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                Toutes ({courses.length})
              </button>
              <button
                onClick={() => setCourseStatusFilter('IN_PROGRESS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  courseStatusFilter === 'IN_PROGRESS'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <span>En cours</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                  {courses.filter(c => c.status === 'IN_PROGRESS').length}
                </span>
              </button>
              <button
                onClick={() => setCourseStatusFilter('PLANNED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  courseStatusFilter === 'PLANNED'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                <span>Futures / Planifiées</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                  {courses.filter(c => c.status === 'PLANNED').length}
                </span>
              </button>
              <button
                onClick={() => setCourseStatusFilter('COMPLETED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  courseStatusFilter === 'COMPLETED'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <span>Passées / Terminées</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                  {courses.filter(c => c.status === 'COMPLETED').length}
                </span>
              </button>
            </div>

            {courses.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <GraduationCap className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">Aucune formation enregistrée.</p>
                <button
                  onClick={() => { setEditTarget(null); setForm(EMPTY_COURSE); setIsAddOpen(true); }}
                  className="mt-3 text-xs text-amber-700 font-bold underline cursor-pointer"
                >
                  Créer la première formation
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses
                  .filter(c => courseStatusFilter === 'ALL' || c.status === courseStatusFilter)
                  .map(course => {
                    const meta = STATUS_META[course.status];
                    const certCount = certifsByCourseName(course.title).length;
                    const enrolledUserIds = courseEnrollments[course.id] || [];
                    const isExpanded = expandedCourseId === course.id;

                    return (
                      <div key={course.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-300 transition space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.badge}`}>
                              {meta.label}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {course.level || 'Tous Niveaux'}
                            </span>
                          </div>
                          <h3 className="font-bold text-slate-900 text-sm leading-snug">{course.title}</h3>
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{course.description}</p>
                        </div>

                        <div className="pt-2 border-t border-slate-200 space-y-2 text-xs text-slate-600">
                          {course.instructor && (
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <span className="text-slate-400 font-bold">Intervenant :</span>
                              <span className="font-semibold text-slate-800">{course.instructor}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {course.hoursCount ? `${course.hoursCount}h de cours` : '20h'}
                            </span>
                            <span className="text-amber-700 font-bold flex items-center gap-1">
                              <Award className="w-3.5 h-3.5" />
                              {certCount} certifié(s)
                            </span>
                          </div>

                          {/* Inscrits PWA / Espace Membre */}
                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                            <span className="flex items-center gap-1 text-slate-600 font-semibold">
                              <Users className="w-3.5 h-3.5 text-blue-600" />
                              {enrolledUserIds.length} membre{enrolledUserIds.length !== 1 ? 's' : ''} inscrit{enrolledUserIds.length !== 1 ? 's' : ''}
                            </span>
                            {enrolledUserIds.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer"
                              >
                                <span>{isExpanded ? 'Masquer' : 'Voir liste'}</span>
                                <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </button>
                            )}
                          </div>

                          {/* Liste déroulante des inscrits */}
                          {isExpanded && enrolledUserIds.length > 0 && (
                            <div className="p-2.5 rounded-xl bg-white border border-blue-200 space-y-1.5 max-h-36 overflow-y-auto">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                                Inscrits à cette formation :
                              </p>
                              {enrolledUserIds.map(uid => {
                                const m = allUsers.find(u => u.id === uid);
                                return (
                                  <div key={uid} className="flex items-center justify-between text-[11px] p-1 bg-slate-50 rounded-lg">
                                    <span className="font-medium text-slate-800">
                                      {m ? `${m.prenom} ${m.nom}` : uid}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      {m && <span className="text-[9px] font-mono text-slate-400">{m.matricule}</span>}
                                      <button
                                        type="button"
                                        onClick={() => removeEnrollment(course.id, uid)}
                                        className="text-slate-400 hover:text-rose-600 p-0.5"
                                        title="Désinscrire"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Quick change status & actions */}
                          <div className="pt-2 flex flex-col gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-slate-400">Statut :</span>
                              <select
                                value={course.status}
                                onChange={e => handleStatusChangeCourse(course.id, e.target.value as CourseStatus)}
                                className="flex-1 bg-white border border-slate-200 text-slate-800 text-[11px] font-semibold rounded-lg px-2 py-1 cursor-pointer focus:outline-none"
                              >
                                <option value="PLANNED">Planifié (Futur)</option>
                                <option value="IN_PROGRESS">En cours</option>
                                <option value="COMPLETED">Terminé (Passé)</option>
                              </select>
                            </div>

                            <div className="flex gap-1.5">
                              <button
                                onClick={() => openDeliverModal(course)}
                                className="flex-1 py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold border border-amber-200 transition cursor-pointer flex items-center justify-center gap-1"
                              >
                                <Award className="w-3.5 h-3.5 text-amber-600" />
                                <span>Certifier</span>
                              </button>
                              <button
                                onClick={() => {
                                  setEditTarget(course);
                                  setForm({
                                    title: course.title,
                                    description: course.description,
                                    status: course.status,
                                    instructor: course.instructor || '',
                                    hoursCount: course.hoursCount || 20,
                                    startDate: course.startDate ? course.startDate.slice(0, 10) : '',
                                    level: course.level || 'Tous Niveaux'
                                  });
                                  setIsAddOpen(true);
                                }}
                                className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition cursor-pointer"
                                title="Modifier"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCourse(course.id, course.title)}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-200 transition cursor-pointer"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* ════════════ ONGLET 2: PROJETS R&D ════════════ */}
        {activeTab === 'projects' && (
          <div className="card p-6 bg-white border border-slate-300 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-blue-600" />
                  <span>Projets d&apos;Ingénierie &amp; R&amp;D Laboratoire</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Les projets créés ici sont visibles sur le Showcase de la vitrine publique et attribués aux membres dans leur espace individuel.
                </p>
              </div>

              <button
                onClick={openNewProject}
                className="btn-nasa text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Projet</span>
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <FolderGit2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">Aucun projet R&amp;D enregistré.</p>
                <button
                  onClick={openNewProject}
                  className="mt-3 text-xs text-blue-700 font-bold underline cursor-pointer"
                >
                  Ajouter le premier projet R&amp;D
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map(project => (
                  <div
                    key={project.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          {project.category}
                        </span>
                        {project.featured && (
                          <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>En vedette</span>
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-slate-900 text-base leading-snug font-display">
                        {project.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {project.description}
                      </p>

                      {/* Technologies */}
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {project.technologies.map(tech => (
                            <span
                              key={tech}
                              className="px-2 py-0.5 bg-white rounded-md text-[10px] font-mono text-slate-700 border border-slate-200"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Contributeurs & Actions */}
                    <div className="pt-3 border-t border-slate-200 space-y-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Équipe &amp; Contributeurs ({project.contributors?.length || 0})
                        </span>
                        {project.contributors && project.contributors.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {project.contributors.map(c => (
                              <span
                                key={c.id || c.userId}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] text-slate-800"
                              >
                                <span className="font-semibold">{c.name || 'Membre'}</span>
                                {c.roleInProject && (
                                  <span className="text-[9px] text-blue-600 font-mono">({c.roleInProject})</span>
                                )}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Aucun contributeur désigné</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {project.githubUrl && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-white text-slate-700 hover:text-blue-600 rounded-lg border border-slate-200 text-xs flex items-center gap-1 transition"
                              title="Voir le dépôt GitHub"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-mono">GitHub</span>
                            </a>
                          )}
                          {(project as any).linkedinUrl && (
                            <a
                              href={(project as any).linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-white text-blue-700 hover:text-blue-900 rounded-lg border border-blue-200 text-xs flex items-center gap-1 transition"
                              title="Voir sur LinkedIn"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-mono">LinkedIn</span>
                            </a>
                          )}
                          {(project as any).tiktokUrl && (
                            <a
                              href={(project as any).tiktokUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-white text-pink-700 hover:text-pink-900 rounded-lg border border-pink-200 text-xs flex items-center gap-1 transition"
                              title="Voir sur TikTok"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-mono">TikTok</span>
                            </a>
                          )}
                          {project.demoUrl && (
                            <a
                              href={project.demoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-white text-slate-700 hover:text-blue-600 rounded-lg border border-slate-200 text-xs flex items-center gap-1 transition"
                              title="Voir la démo en ligne"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              <span className="text-[10px] font-mono">Démo</span>
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEditProject(project)}
                            className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition cursor-pointer"
                            title="Modifier ce projet"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project.id, project.title)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-200 transition cursor-pointer"
                            title="Supprimer ce projet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════ ONGLET 3: CERTIFICATIONS ════════════ */}
        {activeTab === 'certifs' && (
          <div className="card p-6 bg-white border border-slate-300 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span>Certifications Officielles Délivrées</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Consultez la liste des étudiants certifiés par atelier et révoquez les certificats si nécessaire.
                </p>
              </div>

              {/* Filtre par formation */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500">Filtrer :</span>
                <select
                  value={certifFilterCourse}
                  onChange={e => setCertifFilterCourse(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-1.5 cursor-pointer focus:outline-none"
                >
                  <option value="ALL">Toutes les formations ({certifications.length})</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.title}>
                      {c.title} ({certifsByCourseName(c.title).length})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {certifications.filter(c => certifFilterCourse === 'ALL' || c.courseTitle === certifFilterCourse).length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Award className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">Aucune certification trouvée.</p>
                <p className="mt-1">Rendez-vous dans l&apos;onglet Formations pour certifier des membres étudiants.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {certifications
                  .filter(c => certifFilterCourse === 'ALL' || c.courseTitle === certifFilterCourse)
                  .map(c => {
                  const member = allUsers.find(u => u.id === c.userId);
                  const memberName = member ? `${member.prenom} ${member.nom}` : c.userId;
                  const matricule = member?.matricule || 'N/A';
                  return (
                    <div key={c.id} className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                          <Award className="w-5 h-5 text-emerald-700" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">{c.courseTitle}</h4>
                          <p className="text-xs font-semibold text-emerald-900 mt-0.5">{memberName}</p>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            Matricule : {matricule} &bull; {new Date(c.issuedAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRevokeCertif(c.id, memberName, c.courseTitle)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition cursor-pointer"
                        title="Révoquer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal Création/Modification Formation */}
      {isAddOpen && (
        <div className="modal-backdrop">
          <div className="modal-card p-6 sm:p-7 space-y-4 max-w-lg bg-white border border-slate-300 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    {editTarget ? 'Modifier la Formation' : 'Créer une Formation'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Pôle Pédagogique GIT</p>
                </div>
              </div>
              <button onClick={() => { setIsAddOpen(false); setEditTarget(null); }} className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">Intitulé de la formation *</label>
                <input
                  type="text"
                  placeholder="Ex : Architecture Microcontrôleurs STM32 & FreeRTOS"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="input-nasa text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">Description &amp; Objectifs</label>
                <textarea
                  rows={3}
                  placeholder="Programme, prérequis et livrables attendus..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="input-nasa text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">Intervenant / Formateur</label>
                  <input
                    type="text"
                    placeholder="Ex : MBIAKOP Junior"
                    value={form.instructor || ''}
                    onChange={e => setForm(f => ({ ...f, instructor: e.target.value }))}
                    className="input-nasa text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">Volume Horaire (h)</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={form.hoursCount || 20}
                    onChange={e => setForm(f => ({ ...f, hoursCount: parseInt(e.target.value) || 20 }))}
                    className="input-nasa text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">Niveau Cible</label>
                  <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))} className="input-nasa text-xs text-slate-900 bg-white">
                    <option value="Tous Niveaux">Tous Niveaux</option>
                    <option value="GI_1 & GI_2">GI 1 &amp; GI 2</option>
                    <option value="GI_3+">GI 3 et plus</option>
                    <option value="GI_4 & GI_5">GI 4 &amp; GI 5 (Avancé)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">Statut</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as CourseStatus }))} className="input-nasa text-xs text-slate-900 bg-white">
                    <option value="PLANNED">Planifié</option>
                    <option value="IN_PROGRESS">En cours</option>
                    <option value="COMPLETED">Terminé</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">Date de début</label>
                <input type="date" value={form.startDate || ''} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="input-nasa text-xs text-slate-900" />
              </div>
              {!form.title.trim() && (
                <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" /><span>L&apos;intitulé est obligatoire.</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => { setIsAddOpen(false); setEditTarget(null); }} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer">Annuler</button>
              <button onClick={handleSaveCourse} disabled={!form.title.trim()} className="btn-nasa flex-1 py-2.5 text-xs font-bold cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                {editTarget ? 'Mettre à Jour' : 'Créer la Formation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Création/Modification Projet R&D */}
      {isProjectModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card p-6 sm:p-7 space-y-4 max-w-xl bg-white border border-slate-300 text-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    {editingProject ? 'Modifier le Projet R&D' : 'Nouveau Projet R&D Laboratoire'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Pôle Recherche, Développement &amp; Ingénierie</p>
                </div>
              </div>
              <button onClick={() => setIsProjectModalOpen(false)} className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">Titre du Projet *</label>
                <input
                  type="text"
                  placeholder="Ex : Station Météo Connectée & Surveillance Labo"
                  value={projectForm.title}
                  onChange={e => setProjectForm(p => ({ ...p, title: e.target.value }))}
                  className="input-nasa text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">Catégorie Technique</label>
                  <select
                    value={projectForm.category}
                    onChange={e => setProjectForm(p => ({ ...p, category: e.target.value as Project['category'] }))}
                    className="input-nasa text-xs text-slate-900 bg-white"
                  >
                    {PROJECT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={projectForm.featured}
                      onChange={e => setProjectForm(p => ({ ...p, featured: e.target.checked }))}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Mettre en vedette (Showcase)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">Description &amp; Cahier des charges *</label>
                <textarea
                  rows={3}
                  placeholder="Détaillez l'objectif d'ingénierie, l'architecture et les composants utilisés..."
                  value={projectForm.description}
                  onChange={e => setProjectForm(p => ({ ...p, description: e.target.value }))}
                  className="input-nasa text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">Technologies (séparées par virgules)</label>
                <input
                  type="text"
                  placeholder="Ex : ESP32, LoRaWAN, Next.js, FreeRTOS, MQTT"
                  value={techInput}
                  onChange={e => setTechInput(e.target.value)}
                  className="input-nasa text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">Lien GitHub (Optionnel)</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={projectForm.githubUrl || ''}
                    onChange={e => setProjectForm(p => ({ ...p, githubUrl: e.target.value }))}
                    className="input-nasa text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">Lien Démo / Live (Optionnel)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={projectForm.demoUrl || ''}
                    onChange={e => setProjectForm(p => ({ ...p, demoUrl: e.target.value }))}
                    className="input-nasa text-xs text-slate-900"
                  />
                </div>
              </div>

              {/* Liens de suivi social */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">Suivi LinkedIn</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/..."
                    value={(projectForm as any).linkedinUrl || ''}
                    onChange={e => setProjectForm(p => ({ ...p, linkedinUrl: e.target.value }))}
                    className="input-nasa text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">Suivi TikTok</label>
                  <input
                    type="url"
                    placeholder="https://tiktok.com/@..."
                    value={(projectForm as any).tiktokUrl || ''}
                    onChange={e => setProjectForm(p => ({ ...p, tiktokUrl: e.target.value }))}
                    className="input-nasa text-xs text-slate-900"
                  />
                </div>
              </div>

              {/* Attribution des Contributeurs */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Contributeurs Attribués ({projectForm.contributors.length})
                </label>

                {projectForm.contributors.length > 0 && (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                    {projectForm.contributors.map(c => (
                      <div key={c.userId} className="flex items-center justify-between text-xs p-1.5 bg-white rounded-lg border border-slate-200">
                        <div>
                          <span className="font-bold text-slate-800">{c.name}</span>
                          <span className="text-[10px] text-blue-600 font-mono ml-2">({c.roleInProject})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeContributorFromProject(c.userId)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
                  <div className="sm:col-span-6 relative">
                    <input
                      type="text"
                      placeholder="Chercher un membre (nom, matricule)..."
                      value={contributorSearch}
                      onChange={e => setContributorSearch(e.target.value)}
                      className="input-nasa text-xs text-slate-900"
                    />
                  </div>
                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      placeholder="Rôle (ex: Lead Firmware)..."
                      value={newContributorRole}
                      onChange={e => setNewContributorRole(e.target.value)}
                      className="input-nasa text-xs text-slate-900"
                    />
                  </div>
                </div>

                {contributorSearch.trim().length > 0 && (
                  <div className="space-y-1 max-h-32 overflow-y-auto p-1 bg-slate-100 rounded-xl border border-slate-200">
                    {allUsers
                      .filter(u =>
                        u.nom.toLowerCase().includes(contributorSearch.toLowerCase()) ||
                        u.prenom.toLowerCase().includes(contributorSearch.toLowerCase()) ||
                        u.matricule.toLowerCase().includes(contributorSearch.toLowerCase())
                      )
                      .slice(0, 5)
                      .map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => addContributorToProject(u)}
                          className="w-full text-left p-2 rounded-lg bg-white hover:bg-blue-50 text-xs flex items-center justify-between transition cursor-pointer"
                        >
                          <span className="font-bold text-slate-800">{u.prenom} {u.nom} ({u.matricule})</span>
                          <span className="text-[10px] text-blue-600 font-bold">+ Ajouter</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button onClick={() => setIsProjectModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer">
                Annuler
              </button>
              <button
                onClick={handleSaveProject}
                disabled={!projectForm.title.trim() || !projectForm.description.trim()}
                className="btn-nasa flex-1 py-2.5 text-xs font-bold cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingProject ? 'Mettre à Jour le Projet' : 'Enregistrer le Projet R&D'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Délivrer Certification */}
      {isCertifOpen && certifCourse && (
        <div className="modal-backdrop">
          <div className="modal-card p-6 sm:p-7 space-y-4 max-w-lg bg-white border border-slate-300 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">Délivrer une Certification</h3>
                  <p className="text-[11px] text-slate-500">{certifCourse.title}</p>
                </div>
              </div>
              <button onClick={() => setIsCertifOpen(false)} className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2 uppercase tracking-wider">Rechercher un Membre Étudiant</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Nom, prénom ou matricule..."
                  value={memberSearch}
                  onChange={e => { setMemberSearch(e.target.value); setSelectedMember(null); }}
                  className="input-nasa pl-9 text-xs text-slate-900"
                />
              </div>
            </div>

            {memberSearch.trim().length > 0 && (
              <div className="space-y-1.5 max-h-52 overflow-y-auto">
                {filteredMembers.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">Aucun membre trouvé.</p>
                ) : (
                  filteredMembers.map(member => {
                    const certified = alreadyCertified(member.id, certifCourse.id);
                    const isSelected = selectedMember?.id === member.id;
                    return (
                      <button
                        key={member.id}
                        onClick={() => !certified && setSelectedMember(isSelected ? null : member)}
                        disabled={certified}
                        className={`w-full p-3 rounded-xl text-left text-xs transition flex items-center justify-between gap-3 ${
                          certified
                            ? 'bg-emerald-50 border border-emerald-200 cursor-not-allowed opacity-75'
                            : isSelected
                            ? 'bg-amber-50 border border-amber-300 cursor-pointer'
                            : 'bg-slate-50 border border-slate-200 hover:border-amber-300 hover:bg-amber-50 cursor-pointer'
                        }`}
                      >
                        <div>
                          <span className="font-bold text-slate-900 block">{member.prenom} {member.nom}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{member.matricule} · {member.niveau}</span>
                        </div>
                        {certified ? (
                          <span className="text-emerald-700 text-[10px] font-bold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Déjà certifié</span>
                        ) : isSelected ? (
                          <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
                        ) : null}
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {selectedMember && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900">
                <strong>Sélectionné :</strong> {selectedMember.prenom} {selectedMember.nom} ({selectedMember.matricule})
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={() => setIsCertifOpen(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer transition">Annuler</button>
              <button
                onClick={handleDeliverCertif}
                disabled={!selectedMember}
                className="btn-nasa flex-1 py-2.5 text-xs font-bold cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4" /> Délivrer la Certification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
