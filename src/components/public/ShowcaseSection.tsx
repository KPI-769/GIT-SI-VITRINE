'use client';

import React, { useState } from 'react';
import { Project } from '@/lib/types';
import {
  Code2, ExternalLink, Cpu,
  Layers, Users, Sparkles, ArrowUpRight, Terminal, Clock, FolderGit2
} from 'lucide-react';

function GithubIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

interface ShowcaseSectionProps {
  projects: Project[];
}

const CATEGORIES = [
  'Tous',
  'Systèmes Embarqués',
  'Réseaux & IoT',
  'Logiciel & Fullstack',
  'Automatique & Robotique'
] as const;

export default function ShowcaseSection({ projects = [] }: ShowcaseSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>('Tous');

  const filteredProjects = activeCategory === 'Tous'
    ? projects
    : projects.filter(p => p.category === activeCategory);

  return (
    <section id="projects" className="py-24 bg-white dark:bg-[#0D1322] text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 relative overflow-hidden transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        {/* Titre et introduction */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-mono font-bold tracking-wider uppercase">
              <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>R&amp;D &amp; Prototypage Industriel</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight font-display text-slate-900 dark:text-white">
              Showcase des Projets R&amp;D
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Réalisations d&apos;ingénierie des étudiants de la Division Génie Infotronique à <strong>Saint Jérôme Polytechnique</strong> : systèmes cyber-physiques, cartes électroniques et infrastructures de télécommunication.
            </p>
          </div>

          {projects.length > 0 && (
            /* Badges statistiques télémétriques si projets existants */
            <div className="flex items-center gap-5 text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#111827] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs shrink-0">
              <div>
                <span className="block text-xl font-black text-blue-600 dark:text-blue-400">{projects.length}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Projets Publiés</span>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
              <div>
                <span className="block text-xl font-black text-emerald-600 dark:text-emerald-400">100%</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Code Open Source</span>
              </div>
            </div>
          )}
        </div>

        {projects.length === 0 ? (
          /* État d'attente sobre et officiel */
          <div className="cyber-panel p-10 sm:p-14 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-5 max-w-3xl mx-auto shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs">
              <FolderGit2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                Catalogue des Réalisations en Phase de Recensement
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
                Les projets d&apos;ingénierie infotronique, prototypes de cartes PCB et solutions logicielles développés par les étudiants de <strong>Saint Jérôme Polytechnique</strong> seront documentés et indexés ici dès validation par les jurys et la direction académique.
              </p>
            </div>
            <div className="pt-2 text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Publication officielle programmée après évaluation des commissions de projets</span>
            </div>
          </div>
        ) : (
          <>
            {/* Filtres par catégorie */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition whitespace-nowrap cursor-pointer ${
                    activeCategory === category
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-[#111827] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Grille des projets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredProjects.map((project) => (
                <article
                  key={project.id}
                  className="cyber-panel p-7 sm:p-8 flex flex-col justify-between space-y-6 bg-slate-50/80 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 transition-all duration-300 shadow-xs hover:shadow-md group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/40">
                        {project.category}
                      </span>
                      {project.featured && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-400/40 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                          Projet Phare
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition font-display">
                      {project.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {project.description}
                    </p>

                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {project.technologies.map((tech: string) => (
                          <span
                            key={tech}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-white dark:bg-black/40 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                      <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>{project.membersCount || project.contributors?.length || 1} contributeur(s)</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                          title="Dépôt GitHub"
                        >
                          <GithubIcon className="w-4 h-4" />
                        </a>
                      )}
                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition flex items-center gap-1 text-xs font-mono font-bold"
                        >
                          <span>Démo</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
