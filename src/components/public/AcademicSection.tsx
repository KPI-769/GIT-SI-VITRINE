'use client';

import React, { useState } from 'react';
import { Course, User } from '@/lib/types';
import {
  GraduationCap, Award, BookOpen, Clock,
  CheckCircle2, Users, Search, ChevronRight,
  ShieldCheck, Terminal, Cpu, FileCheck
} from 'lucide-react';

interface AcademicSectionProps {
  courses: Course[];
  users: User[];
}

export default function AcademicSection({ courses = [], users = [] }: AcademicSectionProps) {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchCertified, setSearchCertified] = useState('');

  const filteredCourses = filterStatus === 'ALL'
    ? courses
    : courses.filter(c => c.status === filterStatus);

  // Tous les membres ayant au moins une certification
  const certifiedMembers = users
    .filter(u => u.certifications && u.certifications.length > 0)
    .filter(u => {
      const q = searchCertified.toLowerCase();
      return (
        u.nom.toLowerCase().includes(q) ||
        u.prenom.toLowerCase().includes(q) ||
        u.matricule.toLowerCase().includes(q)
      );
    });

  return (
    <section id="academic" className="py-24 bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 relative overflow-hidden transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14 relative z-10">
        {/* En-tête */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Pôle Formation &amp; Syllabi Spécialisés</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight font-display text-slate-900 dark:text-white">
            Pôle Académique &amp; Catalogue des Formations
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Modules d&apos;ingénierie certifiants de la Division Génie Infotronique à <strong>Saint Jérôme Polytechnique</strong> : micro-électronique avancée, cybersécurité réseau et architectures industrielles temps réel.
          </p>
        </div>

        {courses.length === 0 ? (
          /* État d'attente officiel pour les cours */
          <div className="cyber-panel p-10 sm:p-14 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-5 max-w-3xl mx-auto shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                Catalogue Pédagogique en Cours de Révision
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
                Le syllabus officiel des modules certifiants et ateliers technologiques de <strong>Saint Jérôme Polytechnique</strong> est en cours d&apos;harmonisation avec le corps enseignant. Les inscriptions ouvriront à la publication des programmes.
              </p>
            </div>
            <div className="pt-2 text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
              <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Programmes validés par la commission académique GIT-SJP</span>
            </div>
          </div>
        ) : (
          <>
            {/* Filtres de statut de cours */}
            <div className="flex justify-center items-center gap-2 flex-wrap">
              {[
                { id: 'ALL', label: 'Toutes les Formations' },
                { id: 'IN_PROGRESS', label: 'En Cours' },
                { id: 'PLANNED', label: 'À Venir' },
                { id: 'COMPLETED', label: 'Achevées' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                    filterStatus === f.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Grille des Formations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="cyber-panel p-6 flex flex-col justify-between space-y-5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/50 transition-all duration-300 shadow-xs hover:shadow-md group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold border ${
                        course.status === 'COMPLETED'
                          ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                          : course.status === 'IN_PROGRESS'
                          ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30 animate-pulse'
                          : 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
                      }`}>
                        {course.status === 'COMPLETED' ? 'Achevé' : course.status === 'IN_PROGRESS' ? 'En Cours' : 'Planifié'}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        <span>{course.hoursCount ? `${course.hoursCount}h` : '30h'}</span>
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition font-display">
                      {course.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-mono">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                      <span>Instructeur</span>
                      <strong className="text-slate-800 dark:text-white">{course.instructor || 'Corps Enseignant'}</strong>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                        Niveau : {course.level}
                      </span>
                      {course.startDate && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          Début : {course.startDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Registre des Certifications & Recherche Radar */}
        <div className="cyber-panel p-8 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>Registre Numérique Officiel</span>
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display mt-0.5">
                Membres Titulaires de Certifications GIT
              </h3>
            </div>

            {certifiedMembers.length > 0 && (
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Rechercher étudiant, matricule..."
                  value={searchCertified}
                  onChange={(e) => setSearchCertified(e.target.value)}
                  className="input-nasa pl-9 text-xs font-mono"
                />
              </div>
            )}
          </div>

          {certifiedMembers.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <FileCheck className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Registre en Attente d&apos;Émargement
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Aucune certification n&apos;est encore enregistrée pour cette session. Les attestations d&apos;ingénierie délivrées aux étudiants de Saint Jérôme Polytechnique seront répertoriées ici après examen.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {certifiedMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-800 flex items-start gap-3 hover:border-emerald-400 dark:hover:border-emerald-500/50 transition"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-400/40 flex items-center justify-center shrink-0 font-bold text-blue-700 dark:text-blue-300 text-xs">
                    {member.prenom[0]}{member.nom[0]}
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {member.prenom} {member.nom}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      Matricule : <span className="text-blue-600 dark:text-blue-400 font-bold">{member.matricule}</span> ({member.niveau})
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {member.certifications?.map((c) => (
                        <span key={c.id} className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono truncate max-w-full">
                          ✓ {c.courseTitle}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
