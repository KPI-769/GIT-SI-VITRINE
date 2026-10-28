'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, Send, Sparkles, BellRing } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState('Etudiant');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
  };

  return (
    <section className="py-20 bg-slate-100 dark:bg-[#080D18] border-b border-slate-200 dark:border-slate-800 relative overflow-hidden transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="card p-8 sm:p-12 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white border border-blue-800/40 rounded-3xl shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Colonne texte */}
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                <BellRing className="w-3.5 h-3.5" />
                <span>Restez Connecté à la Division</span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-display">
                Abonnez-vous à la Newsletter Infotronique
              </h3>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed max-w-xl">
                Recevez chaque mois le condensé des avancées de recherche, les annonces des hackathons, les offres de stages chez nos partenaires et les comptes-rendus du laboratoire.
              </p>
            </div>

            {/* Colonne formulaire */}
            <div className="lg:col-span-5">
              {subscribed ? (
                <div className="p-6 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-3.5">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <strong className="block text-sm font-bold text-white mb-0.5">Abonnement Validé !</strong>
                    <span>Merci pour votre intérêt. Vous recevrez la prochaine édition mensuelle directement sur votre boîte mail.</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="flex gap-2">
                    <select
                      value={profile}
                      onChange={(e) => setProfile(e.target.value)}
                      className="bg-white/10 border border-white/20 text-white rounded-xl text-xs px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer font-mono"
                    >
                      <option value="Etudiant" className="bg-slate-900 text-white">Étudiant Ingénieur</option>
                      <option value="Enseignant" className="bg-slate-900 text-white">Enseignant / Chercheur</option>
                      <option value="Industrie" className="bg-slate-900 text-white">Partenaire Industriel</option>
                      <option value="Alumnus" className="bg-slate-900 text-white">Alumnus GIT</option>
                    </select>

                    <input
                      type="email"
                      required
                      placeholder="Votre adresse email..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl text-xs px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition font-mono uppercase tracking-wider"
                  >
                    <Send className="w-4 h-4" />
                    <span>S&apos;abonner gratuitement</span>
                  </button>

                  <span className="text-[10px] text-white/60 block text-center font-mono">
                    Zéro spam · Désinscription à tout moment en un clic.
                  </span>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
