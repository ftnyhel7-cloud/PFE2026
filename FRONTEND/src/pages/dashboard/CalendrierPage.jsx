import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import API from '../../api/axios';

function CalendrierPage({ role }) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [reunions, setReunions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    idEtudiant: '',
    lienVisio: '',
    heure: '09:00',
  });

  useEffect(() => {
    fetchReunions();
  }, []);

  const fetchReunions = async () => {
    try {
      const endpoint = role === 'ENCADRANT' ? '/calendrier/encadrant' : '/calendrier/etudiant';
      const { data } = await API.get(endpoint);
      setReunions(data);
    } catch (err) {
      console.log(err);
    }
  };

  // Navigation mois
  const moisPrecedent = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const moisSuivant = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Infos du mois actuel
  const annee = currentDate.getFullYear();
  const mois = currentDate.getMonth();

  const nomsMois = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];

  const joursEnTete = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  // Premier jour du mois (0=dim, 1=lun...)
  const premierJour = new Date(annee, mois, 1).getDay();
  const decalage = premierJour === 0 ? 6 : premierJour - 1;

  // Nombre de jours dans le mois
  const nbJours = new Date(annee, mois + 1, 0).getDate();

  // Vérifie si une date est passée
  const estPassee = (jour) => {
    const date = new Date(annee, mois, jour);
    date.setHours(0, 0, 0, 0);
    const auj = new Date();
    auj.setHours(0, 0, 0, 0);
    return date < auj;
  };

  // Vérifie si c'est aujourd'hui
  const estAujourdhui = (jour) => {
    return jour === today.getDate() && mois === today.getMonth() && annee === today.getFullYear();
  };

  // Vérifie si une date a une réunion
  const aReunion = (jour) => {
    return reunions.some((r) => {
      const dateReunion = new Date(r.date);
      return (
        dateReunion.getDate() === jour &&
        dateReunion.getMonth() === mois &&
        dateReunion.getFullYear() === annee
      );
    });
  };

  // Clic sur un jour
  const handleClickJour = (jour) => {
    if (estPassee(jour)) {
      setError('❌ Impossible de planifier dans le passé');
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (role !== 'ENCADRANT') return;
    setSelectedDate(new Date(annee, mois, jour));
    setShowModal(true);
    setError('');
  };

  // Planifier réunion
  const handlePlanifier = async (e) => {
    e.preventDefault();
    try {
      const [heures, minutes] = formData.heure.split(':');
      const dateComplete = new Date(selectedDate);
      dateComplete.setHours(parseInt(heures), parseInt(minutes));

      await API.post('/calendrier', {
        idEtudiant: formData.idEtudiant,
        date: dateComplete,
        lienVisio: formData.lienVisio,
      });

      setSuccess('✅ Réunion planifiée avec succès !');
      setShowModal(false);
      fetchReunions();
      setFormData({ idEtudiant: '', lienVisio: '', heure: '09:00' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la planification');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">📅 Calendrier</h1>
        <p className="text-slate-400 mt-1">
          {role === 'ENCADRANT'
            ? 'Cliquez sur une date future pour planifier une réunion'
            : 'Consultez vos réunions planifiées'}
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div
          className="mb-4 p-3 rounded-xl text-red-400 text-sm"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
        >
          {error}
        </div>
      )}
      {success && (
        <div
          className="mb-4 p-3 rounded-xl text-green-400 text-sm"
          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}
        >
          {success}
        </div>
      )}

      {/* Calendrier */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Navigation mois */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={moisPrecedent}
            className="p-2 rounded-xl transition-all hover:bg-white/10"
            style={{ color: '#94A3B8' }}
          >
            <ChevronLeft size={20} />
          </button>

          <h2 className="text-white font-bold text-xl">
            {nomsMois[mois]} {annee}
          </h2>

          <button
            onClick={moisSuivant}
            className="p-2 rounded-xl transition-all hover:bg-white/10"
            style={{ color: '#94A3B8' }}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Jours en tête */}
        <div className="grid grid-cols-7 mb-2">
          {joursEnTete.map((jour) => (
            <div key={jour} className="text-center text-slate-400 text-sm font-medium py-2">
              {jour}
            </div>
          ))}
        </div>

        {/* Grille des jours */}
        <div className="grid grid-cols-7 gap-1">
          {/* Cases vides avant le 1er */}
          {Array.from({ length: decalage }).map((_, i) => (
            <div key={`vide-${i}`} />
          ))}

          {/* Jours du mois */}
          {Array.from({ length: nbJours }).map((_, i) => {
            const jour = i + 1;
            const passe = estPassee(jour);
            const aujourdhui = estAujourdhui(jour);
            const reunion = aReunion(jour);

            return (
              <button
                key={jour}
                onClick={() => handleClickJour(jour)}
                disabled={passe}
                className="relative flex flex-col items-center justify-center h-12 rounded-xl transition-all"
                style={{
                  background: aujourdhui
                    ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
                    : passe
                      ? 'transparent'
                      : 'rgba(255,255,255,0.03)',
                  color: passe ? '#374151' : aujourdhui ? '#FFFFFF' : '#F1F5F9',
                  cursor: passe ? 'not-allowed' : role === 'ENCADRANT' ? 'pointer' : 'default',
                  border: aujourdhui ? 'none' : '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <span className="text-sm font-medium">{jour}</span>

                {/* Point réunion */}
                {reunion && (
                  <span
                    className="absolute bottom-1 w-1.5 h-1.5 rounded-full"
                    style={{ background: aujourdhui ? '#FFFFFF' : '#10B981' }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Légende */}
        <div
          className="flex items-center gap-6 mt-6 pt-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
            />
            <span className="text-slate-400 text-sm">Aujourd'hui</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            />
            <span className="text-slate-400 text-sm">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#10B981' }} />
            <span className="text-slate-400 text-sm">Réunion planifiée</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600 text-sm">Grisé</span>
            <span className="text-slate-400 text-sm">= Date passée</span>
          </div>
        </div>
      </div>

      {/* Liste réunions */}
      <div
        className="mt-6 rounded-2xl p-6"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <h2 className="text-white font-bold text-lg mb-4">📋 Mes Réunions</h2>
        {reunions.length === 0 ? (
          <p className="text-slate-400">Aucune réunion planifiée</p>
        ) : (
          <div className="space-y-3">
            {reunions.map((reunion) => (
              <div
                key={reunion._id}
                className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <div>
                  <p className="text-white font-medium">
                    📅{' '}
                    {new Date(reunion.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-slate-400 text-sm">
                    🕐{' '}
                    {new Date(reunion.date).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {reunion.lienVisio && (
                    <a
                      href={reunion.lienVisio}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-400 text-sm hover:text-indigo-300"
                    >
                      🔗 Rejoindre la réunion
                    </a>
                  )}
                </div>
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium text-white"
                  style={{
                    background:
                      reunion.statutReunion === 'PLANIFIEE'
                        ? '#6366F1'
                        : reunion.statutReunion === 'EFFECTUEE'
                          ? '#10B981'
                          : '#EF4444',
                  }}
                >
                  {reunion.statutReunion}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL PLANIFIER ── */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.7)' }}
        >
          <div
            className="w-full max-w-md p-6 rounded-2xl"
            style={{
              background: '#1E293B',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {/* Header modal */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-xl">📅 Planifier une Réunion</h2>
              <button onClick={() => setShowModal(false)} style={{ color: '#94A3B8' }}>
                <X size={20} />
              </button>
            </div>

            {/* Date sélectionnée */}
            <div
              className="mb-4 p-3 rounded-xl"
              style={{
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.3)',
              }}
            >
              <p className="text-indigo-400 text-sm font-medium">
                📅 Date sélectionnée :{' '}
                {selectedDate?.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>

            <form onSubmit={handlePlanifier} className="space-y-4">
              {/* Heure */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  🕐 Heure de la réunion
                </label>
                <input
                  type="time"
                  value={formData.heure}
                  onChange={(e) => setFormData({ ...formData, heure: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl text-white outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
              </div>

              {/* ID Etudiant */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  👤 ID Étudiant
                </label>
                <input
                  type="text"
                  value={formData.idEtudiant}
                  onChange={(e) => setFormData({ ...formData, idEtudiant: e.target.value })}
                  placeholder="ID de l'étudiant"
                  required
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
              </div>

              {/* Lien Google Meet */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  🔗 Lien Google Meet
                </label>
                <input
                  type="url"
                  value={formData.lienVisio}
                  onChange={(e) => setFormData({ ...formData, lienVisio: e.target.value })}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  required
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
              </div>

              {/* Bouton */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl text-white font-semibold"
                style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
              >
                ✅ Confirmer la Réunion
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendrierPage;
