'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppHeader from '@/components/AppHeader';
import { Course, CourseStatus, User, Certification } from '@/lib/types';
import { INITIAL_COURSES } from '@/lib/store';
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
  Cpu
} from 'lucide-react';

const STATUS_META: Record<CourseStatus, { label: string; badge: string }> = {
  PLANNED: { label: 'Planifié', badge: 'bg-blue-100 text-blue-900 border-blue-300' },
  IN_PROGRESS: { label: 'En cours', badge: 'bg-amber-100 text-amber-900 border-amber-300' },
  COMPLETED: { label: 'Terminé', badge: 'bg-emerald-100 text-emerald-900 border-emerald-300' }
};

const COURSE_STORAGE_KEY = 'git_courses_v2';
const CERTIF_STORAGE_KEY = 'git_certifications_v2';

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

const EMPTY_COURSE: Omit<Course, 'id'> = {
  title: '',
  description: '',
  status: 'PLANNED',
  instructor: '',
  hoursCount: 20,
  startDate: new Date().toISOString().slice(0, 10),
  level: 'Tous Niveaux'
};

export default function FormationsAdminPage() {
  const { isInitialized, currentUser, allUsers } = useAuth();
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [activeTab, setActiveTab] = useState<'courses' | 'certifs'>('courses');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Course | null>(null);
  const [form, setForm] = useState<Omit<Course, 'id'>>(EMPTY_COURSE);

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

    fetch('/api/courses')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.courses)) {
          setCourses(data.courses);
          saveCourses(data.courses);
        }
      })
      .catch((err) => console.error('Erreur chargement /api/courses:', err));
  }, []);

  useEffect(() => {
    if (isInitialized && !currentUser) { router.push('/login'); return; }
  }, [isInitialized, currentUser, router]);

  if (!isInitialized || !currentUser) return null;

  // RBAC guard: only FORMATION (MBIAKOP Junior titulaire + MPOPO Antoinne adjoint) and ADMIN
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
  const handleSave = async () => {
    if (!form.title.trim()) return;

    if (editTarget) {
      // Modification
      const updated = courses.map(c => c.id === editTarget.id ? { ...form, id: editTarget.id } : c);
      setCourses(updated);
      saveCourses(updated);
      showToast(`Formation « ${form.title} » mise à jour.`);

      try {
        await fetch(`/api/courses/${editTarget.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } catch (err) {
        console.error('Erreur sync PATCH /api/courses:', err);
      }
    } else {
      // Création
      const tempId = `crs_${Date.now()}`;
      const tempCourse: Course = { ...form, id: tempId };
      const updated = [tempCourse, ...courses];
      setCourses(updated);
      saveCourses(updated);
      showToast(`Formation « ${form.title} » enregistrée dans la base !`);

      try {
        const res = await fetch('/api/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.success && data.course) {
          const synced = updated.map(c => c.id === tempId ? { ...c, id: data.course.id } : c);
          setCourses(synced);
          saveCourses(synced);
        }
      } catch (err) {
        console.error('Erreur sync POST /api/courses:', err);
      }
    }

    setIsAddOpen(false);
    setEditTarget(null);
    setForm(EMPTY_COURSE);
  };

  const handleEdit = (c: Course) => {
    setEditTarget(c);
    setForm({
      title: c.title,
      description: c.description,
      status: c.status,
      instructor: c.instructor || '',
      hoursCount: c.hoursCount || 20,
      startDate: c.startDate ? c.startDate.slice(0, 10) : '',
      level: c.level
    });
    setIsAddOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Supprimer la formation « ${title} » ?`)) return;
    const updated = courses.filter(c => c.id !== id);
    setCourses(updated);
    saveCourses(updated);
    showToast(`Formation « ${title} » supprimée.`);

    try {
      await fetch(`/api/courses/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Erreur DELETE /api/courses:', err);
    }
  };

  const handleStatusChange = (id: string, status: CourseStatus) => {
    const updated = courses.map(c => c.id === id ? { ...c, status } : c);
    setCourses(updated);
    saveCourses(updated);
    showToast('Statut mis à jour.');
  };

  // Certifications
  const openCertifModal = (course: Course) => {
    setCertifCourse(course);
    setMemberSearch('');
    setSelectedMember(null);
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
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toast}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 anim-fade-in">
        {/* Header */}
        <section className="card p-6 border-l-4 border-l-amber-500 shadow-md bg-white flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-3">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Pôle Formation, Projets R&amp;D &amp; Certifications · Mandat 2026/2027</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 font-display">
              Gestion des Formations, Projets &amp; Certifications
            </h1>
            <p className="text-xs text-slate-600 mt-1.5 max-w-2xl">
              Vous êtes <strong>{currentUser.prenom} {currentUser.nom}</strong> — {currentUser.poste || 'Responsable Formation'}. Organisez les formations, délivrez des certifications officielles aux membres étudiants.
            </p>
          </div>

          <button
            onClick={() => { setEditTarget(null); setForm(EMPTY_COURSE); setIsAddOpen(true); }}
            className="btn-nasa text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Formation</span>
          </button>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['PLANNED', 'IN_PROGRESS', 'COMPLETED'] as CourseStatus[]).map(s => {
            const count = courses.filter(c => c.status === s).length;
            const meta = STATUS_META[s];
            return (
              <div key={s} className="card p-4 bg-white border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{meta.label}</span>
                <p className="text-2xl font-black text-slate-900 mt-0.5">{count}</p>
              </div>
            );
          })}
          <div className="card p-4 bg-amber-50 border border-amber-200">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Certifications Délivrées</span>
            <p className="text-2xl font-black text-amber-900 mt-0.5">{certifications.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 w-fit">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${activeTab === 'courses' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Formations ({courses.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('certifs')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${activeTab === 'certifs' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> Certifications Délivrées ({certifications.length})</span>
          </button>
        </div>

        {/* Tab: Formations */}
        {activeTab === 'courses' && (
          <div className="card p-6 bg-white border border-slate-300 shadow-sm space-y-3">
            {courses.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Cpu className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">Aucune formation enregistrée</p>
                <p className="mt-1">Créez votre première formation pour commencer.</p>
              </div>
            ) : (
              courses.map(course => {
                const count = certifsByCourseName(course.title).length;
                return (
                  <div key={course.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-amber-200 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${STATUS_META[course.status].badge}`}>
                          {STATUS_META[course.status].label}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                          {course.level}
                        </span>
                        {course.hoursCount && (
                          <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                            <Clock className="w-3 h-3" /> {course.hoursCount}h
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                          <Award className="w-3 h-3" /> {count} certif{count > 1 ? 's' : ''} délivrée{count > 1 ? 's' : ''}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">{course.title}</h3>
                      {course.instructor && (
                        <p className="text-[11px] text-slate-500">Intervenant : <strong className="text-slate-700">{course.instructor}</strong></p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <select
                        value={course.status}
                        onChange={e => handleStatusChange(course.id, e.target.value as CourseStatus)}
                        className="bg-white border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="PLANNED">Planifié</option>
                        <option value="IN_PROGRESS">En cours</option>
                        <option value="COMPLETED">Terminé</option>
                      </select>
                      <button
                        onClick={() => openCertifModal(course)}
                        title="Délivrer une certification"
                        className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                      >
                        <Award className="w-3.5 h-3.5" /> Certifier
                      </button>
                      <button onClick={() => handleEdit(course)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-700 cursor-pointer transition">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(course.id, course.title)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 cursor-pointer transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab: Certifications Délivrées */}
        {activeTab === 'certifs' && (
          <div className="card p-6 bg-white border border-slate-300 shadow-sm space-y-3">
            {certifications.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Award className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">Aucune certification délivrée</p>
                <p className="mt-1">Créez des formations puis cliquez sur « Certifier » pour délivrer des certifications aux membres.</p>
              </div>
            ) : (
              certifications.map(cert => {
                const member = allUsers.find(u => u.id === cert.userId);
                return (
                  <div key={cert.id} className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <Award className="w-5 h-5 text-emerald-700" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{cert.courseTitle}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          {member ? `${member.prenom} ${member.nom} (${member.matricule})` : cert.userId}
                        </p>
                        <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                          Délivrée le {new Date(cert.issuedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevokeCertif(cert.id, member ? `${member.prenom} ${member.nom}` : cert.userId, cert.courseTitle)}
                      className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 text-[10px] font-bold rounded-lg cursor-pointer transition shrink-0"
                    >
                      Révoquer
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* Modal Créer / Éditer Formation */}
      {isAddOpen && (
        <div className="modal-backdrop">
          <div className="modal-card p-6 sm:p-7 space-y-4 max-w-lg bg-white border border-slate-300 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 font-display">
                {editTarget ? 'Modifier la Formation' : 'Nouvelle Formation'}
              </h3>
              <button onClick={() => { setIsAddOpen(false); setEditTarget(null); }} className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">Intitulé de la Formation *</label>
                <input type="text" placeholder="Ex: Programmation STM32 Bare-Metal C/C++" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-nasa text-xs text-slate-900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">Description</label>
                <textarea rows={2} placeholder="Objectifs et contenu de la formation..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-nasa text-xs text-slate-900 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">Intervenant</label>
                  <input type="text" placeholder="Nom du formateur" value={form.instructor || ''} onChange={e => setForm(f => ({ ...f, instructor: e.target.value }))} className="input-nasa text-xs text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">Durée (heures)</label>
                  <input type="number" min={1} value={form.hoursCount || 20} onChange={e => setForm(f => ({ ...f, hoursCount: Number(e.target.value) }))} className="input-nasa text-xs text-slate-900" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">Niveau Cible</label>
                  <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))} className="input-nasa text-xs text-slate-900 bg-white">
                    <option value="Tous Niveaux">Tous Niveaux</option>
                    <option value="GI_1 & GI_2">GI 1 & GI 2</option>
                    <option value="GI_3+">GI 3 et plus</option>
                    <option value="GI_4 & GI_5">GI 4 & GI 5 (Avancé)</option>
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
              <button onClick={handleSave} disabled={!form.title.trim()} className="btn-nasa flex-1 py-2.5 text-xs font-bold cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                {editTarget ? 'Mettre à Jour' : 'Créer la Formation'}
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
