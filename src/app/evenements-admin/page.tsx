'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AppHeader from '@/components/AppHeader';
import { Event, EventStatus } from '@/lib/types';
import { INITIAL_EVENTS } from '@/lib/store';
import {
  Calendar,
  Plus,
  Edit3,
  Trash2,
  CheckCircle,
  Clock,
  MapPin,
  Users,
  ShieldAlert,
  Sparkles,
  X,
  AlertCircle
} from 'lucide-react';

const STATUS_META: Record<EventStatus, { label: string; badge: string }> = {
  UPCOMING: { label: 'À venir', badge: 'bg-blue-100 text-blue-900 border-blue-300' },
  ONGOING: { label: 'En cours', badge: 'bg-amber-100 text-amber-900 border-amber-300' },
  COMPLETED: { label: 'Terminé', badge: 'bg-emerald-100 text-emerald-900 border-emerald-300' }
};

const EVENT_STORAGE_KEY = 'git_events_v2';

function loadEvents(): Event[] {
  if (typeof window === 'undefined') return INITIAL_EVENTS;
  try {
    const stored = localStorage.getItem(EVENT_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return INITIAL_EVENTS;
}

function saveEvents(events: Event[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(events));
}

const EMPTY_EVENT: Omit<Event, 'id'> = {
  title: '',
  description: '',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
  location: '',
  status: 'UPCOMING',
  coverImage: '',
  registeredCount: 0
};

export default function EvenementsAdminPage() {
  const { isInitialized, currentUser } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Event | null>(null);
  const [form, setForm] = useState<Omit<Event, 'id'>>(EMPTY_EVENT);
  const [toast, setToast] = useState<string | null>(null);

  // Chargement initial depuis le localStorage puis synchronisation avec MySQL
  useEffect(() => {
    setEvents(loadEvents());

    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.events)) {
          setEvents(data.events);
          saveEvents(data.events);
        }
      })
      .catch((err) => console.error('Erreur chargement /api/events:', err));
  }, []);

  useEffect(() => {
    if (isInitialized && !currentUser) { router.push('/login'); return; }
  }, [isInitialized, currentUser, router]);

  if (!isInitialized || !currentUser) return null;

  // RBAC guard: only COMMUNICATION (titulaire + adjoint) and ADMIN
  const canAccess =
    currentUser.role === 'COMMUNICATION' ||
    currentUser.role === 'ADMIN';

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
            <p className="text-xs text-slate-600">
              La gestion des événements et de la communication est réservée au{' '}
              <strong>Responsable Communication & Événementielle</strong> et son adjoint.
              <br /><br />
              Matricules autorisés : <code className="font-bold text-[#0B3D91]">GIT-BUR-08</code> (NGEUMOU Jemima) &amp;{' '}
              <code className="font-bold text-[#0B3D91]">GIT-BUR-14</code> (POKASSA Moustapha)
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

  const handleSave = async () => {
    if (!form.title.trim() || !form.startDate) return;

    if (editTarget) {
      // Modification
      const updated = events.map(e => e.id === editTarget.id ? { ...form, id: editTarget.id } : e);
      setEvents(updated);
      saveEvents(updated);
      showToast(`Événement « ${form.title} » mis à jour.`);

      try {
        await fetch(`/api/events/${editTarget.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } catch (err) {
        console.error('Erreur sync PATCH /api/events:', err);
      }
    } else {
      // Création
      const tempId = `evt_${Date.now()}`;
      const tempEvent: Event = { ...form, id: tempId };
      const updated = [tempEvent, ...events];
      setEvents(updated);
      saveEvents(updated);
      showToast(`Événement « ${form.title} » enregistré dans la base !`);

      try {
        const res = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.success && data.event) {
          const synced = updated.map(e => e.id === tempId ? { ...e, id: data.event.id } : e);
          setEvents(synced);
          saveEvents(synced);
        }
      } catch (err) {
        console.error('Erreur sync POST /api/events:', err);
      }
    }

    setIsAddOpen(false);
    setEditTarget(null);
    setForm(EMPTY_EVENT);
  };

  const handleEdit = (event: Event) => {
    setEditTarget(event);
    setForm({
      title: event.title,
      description: event.description,
      startDate: event.startDate ? event.startDate.slice(0, 10) : '',
      endDate: event.endDate ? event.endDate.slice(0, 10) : '',
      location: event.location || '',
      status: event.status,
      coverImage: event.coverImage || '',
      registeredCount: event.registeredCount || 0
    });
    setIsAddOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Supprimer l'événement « ${title} » ? Cette action est irréversible.`)) return;
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    saveEvents(updated);
    showToast(`Événement « ${title} » supprimé.`);

    try {
      await fetch(`/api/events/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Erreur DELETE /api/events:', err);
    }
  };

  const handleStatusChange = async (id: string, status: EventStatus) => {
    const updated = events.map(e => e.id === id ? { ...e, status } : e);
    setEvents(updated);
    saveEvents(updated);
    showToast('Statut mis à jour.');

    try {
      await fetch(`/api/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch (err) {
      console.error('Erreur PATCH status /api/events:', err);
    }
  };

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
        <section className="card p-6 border-l-4 border-l-indigo-600 shadow-md bg-white flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Pôle Communication &amp; Événements · Mandat 2026/2027</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 font-display">
              Gestion des Événements &amp; Communication
            </h1>
            <p className="text-xs text-slate-600 mt-1.5 max-w-2xl">
              Vous êtes <strong>{currentUser.prenom} {currentUser.nom}</strong> — {currentUser.poste || 'Responsable Communication'}. Créez, publiez et archivez les événements officiels de la Division GIT.
            </p>
          </div>

          <button
            onClick={() => { setEditTarget(null); setForm(EMPTY_EVENT); setIsAddOpen(true); }}
            className="btn-nasa text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvel Événement</span>
          </button>
        </section>

        {/* Stats rapides */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(['UPCOMING', 'ONGOING', 'COMPLETED'] as EventStatus[]).map(s => {
            const count = events.filter(e => e.status === s).length;
            const meta = STATUS_META[s];
            return (
              <div key={s} className="card p-4 bg-white border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{meta.label}</span>
                <p className="text-2xl font-black text-slate-900 mt-0.5">{count} <span className="text-sm font-medium text-slate-500">événement{count > 1 ? 's' : ''}</span></p>
              </div>
            );
          })}
        </div>

        {/* Liste des événements */}
        <div className="card p-6 bg-white border border-slate-300 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Tous les Événements ({events.length})
            </h2>
          </div>

          {events.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">Aucun événement enregistré</p>
              <p className="mt-1">Cliquez sur « Nouvel Événement » pour commencer.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map(event => (
                <div key={event.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-200 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${STATUS_META[event.status].badge}`}>
                        {STATUS_META[event.status].label}
                      </span>
                      {event.registeredCount !== undefined && event.registeredCount > 0 && (
                        <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                          <Users className="w-3 h-3" /> {event.registeredCount} inscrits
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{event.title}</h3>
                    <div className="flex flex-wrap gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(event.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {event.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <select
                      value={event.status}
                      onChange={e => handleStatusChange(event.id, e.target.value as EventStatus)}
                      className="bg-white border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-400 cursor-pointer"
                    >
                      <option value="UPCOMING">À venir</option>
                      <option value="ONGOING">En cours</option>
                      <option value="COMPLETED">Terminé</option>
                    </select>
                    <button
                      onClick={() => handleEdit(event)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 transition cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id, event.title)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal Créer / Éditer */}
      {isAddOpen && (
        <div className="modal-backdrop">
          <div className="modal-card p-6 sm:p-7 space-y-4 max-w-lg bg-white border border-slate-300 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 font-display">
                {editTarget ? 'Modifier l\'Événement' : 'Nouvel Événement'}
              </h3>
              <button onClick={() => { setIsAddOpen(false); setEditTarget(null); }} className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">Titre de l&apos;Événement *</label>
                <input
                  type="text"
                  placeholder="Ex: Atelier Systèmes Embarqués ARM Cortex-M7"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="input-nasa text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">Description</label>
                <textarea
                  rows={3}
                  placeholder="Description détaillée de l'événement..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="input-nasa text-xs text-slate-900 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">Date de début *</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    className="input-nasa text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">Date de fin</label>
                  <input
                    type="date"
                    value={form.endDate || ''}
                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    className="input-nasa text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">Lieu</label>
                  <input
                    type="text"
                    placeholder="Ex: Laboratoire SJP, Salle C102"
                    value={form.location || ''}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    className="input-nasa text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wider">Statut</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as EventStatus }))}
                    className="input-nasa text-xs text-slate-900 bg-white"
                  >
                    <option value="UPCOMING">À venir</option>
                    <option value="ONGOING">En cours</option>
                    <option value="COMPLETED">Terminé</option>
                  </select>
                </div>
              </div>

              {!form.title.trim() && (
                <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Le titre est obligatoire.</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => { setIsAddOpen(false); setEditTarget(null); }} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer">
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={!form.title.trim() || !form.startDate}
                className="btn-nasa flex-1 py-2.5 text-xs font-bold cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editTarget ? 'Mettre à Jour' : 'Créer l\'Événement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
