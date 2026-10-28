'use client';

import React, { useState, useEffect } from 'react';
import { Event } from '@/lib/types';
import {
  Calendar, Clock, MapPin, Users,
  ArrowRight, CheckCircle2, Sparkles, X, Bell
} from 'lucide-react';

interface EventsSectionProps {
  events: Event[];
}

export default function EventsSection({ events = [] }: EventsSectionProps) {
  const upcomingEvents = events.filter(e => e.status === 'UPCOMING');
  const nextEvent = upcomingEvents[0];
  const targetDate = nextEvent ? new Date(nextEvent.startDate).getTime() : 0;

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [matricule, setMatricule] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!targetDate) return;
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricule || !email) return;
    setRegisterSuccess(true);
    setTimeout(() => {
      setRegisterSuccess(false);
      setSelectedEvent(null);
      setMatricule('');
      setEmail('');
    }, 2500);
  };

  return (
    <section id="events" className="py-24 bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-white relative overflow-hidden border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-14">
        {/* En-tête de section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Agenda &amp; Vie de la Division</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-display">
            Événements Majeurs &amp; Calendrier Officiel
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Hackathons d&apos;ingénierie, workshops techniques, soutenances de projets et démonstrations scientifiques de Saint Jérôme Polytechnique.
          </p>
        </div>

        {events.length === 0 ? (
          /* État d'attente officiel et sobre */
          <div className="cyber-panel p-10 sm:p-14 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-6 max-w-3xl mx-auto shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs">
              <Calendar className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                Calendrier des Événements en Cours d&apos;Établissement
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
                Aucun événement public n&apos;est programmé pour le moment. L&apos;agenda officiel des hackathons, séminaires industriels et ateliers de robotique de <strong>Saint Jérôme Polytechnique</strong> sera publié ici dès validation par le Bureau Exécutif.
              </p>
            </div>
            <div className="pt-2">
              <a
                href="#newsletter"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 transition border border-slate-200 dark:border-slate-700"
              >
                <Bell className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Être alerté des prochaines publications</span>
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Compte à rebours de l'événement le plus proche si disponible */}
            {nextEvent && targetDate > 0 && (
              <div className="card p-8 sm:p-10 border border-blue-800/40 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white shadow-2xl relative overflow-hidden">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                  <div className="space-y-3 text-center lg:text-left max-w-xl">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-widest inline-block font-mono">
                      Prochain Grand Rendez-vous
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-white font-display">
                      {nextEvent.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {nextEvent.description}
                    </p>
                    <div className="flex items-center justify-center lg:justify-start gap-4 text-xs text-slate-300 pt-1 font-mono">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        {new Date(nextEvent.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      {nextEvent.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-amber-400" />
                          {nextEvent.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Chiffres du compte à rebours */}
                  <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    {[
                      { label: 'Jours', value: timeLeft.days },
                      { label: 'Heures', value: timeLeft.hours },
                      { label: 'Minutes', value: timeLeft.minutes },
                      { label: 'Secondes', value: timeLeft.seconds },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex flex-col items-center bg-black/40 border border-white/10 rounded-2xl p-3 sm:p-4 min-w-[70px] sm:min-w-[85px] shadow-lg">
                        <span className="font-mono text-2xl sm:text-4xl font-black text-blue-300">
                          {String(value).padStart(2, '0')}
                        </span>
                        <span className="text-[10px] sm:text-xs text-slate-300 font-semibold uppercase tracking-wider mt-1 font-mono">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Liste des événements */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="card p-6 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between space-y-4 hover:border-blue-400 dark:hover:border-blue-500/50 transition duration-300 shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full font-mono border ${
                        evt.status === 'UPCOMING'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}>
                        {evt.status === 'UPCOMING' ? 'À Venir' : 'Terminé'}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                        <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>{evt.registeredCount ?? 0} inscrits</span>
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-white font-display">
                      {evt.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {evt.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>{new Date(evt.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                      {evt.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span className="truncate">{evt.location}</span>
                        </div>
                      )}
                    </div>

                    {evt.status === 'UPCOMING' ? (
                      <button
                        onClick={() => setSelectedEvent(evt)}
                        className="btn-nasa w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        <span>S&apos;inscrire en ligne</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-not-allowed"
                      >
                        Événement clôturé
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal d'inscription rapide */}
      {selectedEvent && (
        <div className="modal-backdrop">
          <div className="modal-card p-6 sm:p-8 space-y-5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white relative shadow-2xl">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-1 font-mono">Inscription Officielle</span>
              <h3 className="text-xl font-bold font-display">{selectedEvent.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{selectedEvent.location}</p>
            </div>

            {registerSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <strong className="block font-bold">Inscription confirmée !</strong>
                  <span>Votre place a été réservée. Un email de confirmation vous a été envoyé.</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-mono">Matricule Étudiant</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 24GIT..."
                    value={matricule}
                    onChange={(e) => setMatricule(e.target.value)}
                    className="input-nasa text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-mono">Email Institutionnel</label>
                  <input
                    type="email"
                    required
                    placeholder="prenom.nom@saintjerome.cm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-nasa text-xs font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-nasa w-full py-3 text-xs font-bold cursor-pointer"
                >
                  Confirmer ma participation
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
