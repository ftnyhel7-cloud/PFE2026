import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import CalendrierPage from './CalendrierPage';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

import {
  Home,
  Users,
  BookOpen,
  CheckSquare,
  Calendar,
  MessageCircle,
  Bell,
  User,
  LogOut,
  Plus,
  X,
} from 'lucide-react';

function DashboardEncadrant() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('accueil');
  const [sujets, setSujets] = useState([]);
  const [taches, setTaches] = useState([]);
  const [reunions, setReunions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notifCount, setNotifCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
const [encadrantInfo, setEncadrantInfo] = useState(null);

  // Formulaire nouvelle tâche
  const [nouvelleTache, setNouvelleTache] = useState({
    idEtudiant: '',
    idProjet: '',
    titre: '',
    description: '',
    dateDebut: '',
    dateLimite: '',
  });

  useEffect(() => {
    fetchSujets();
    fetchTaches();
    fetchReunions();
      fetchNotifications();
      fetchEncadrantInfo();
  }, []);

  const fetchSujets = async () => {
    try {
      const { data } = await API.get('/sujets/mes-sujets');
      setSujets(data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchTaches = async () => {
    try {
      const { data } = await API.get('/taches/mes-taches');
      setTaches(data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchReunions = async () => {
    try {
      const { data } = await API.get('/calendrier/encadrant');
      setReunions(data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data);
      const { data: count } = await API.get('/notifications/non-lues');
      setNotifCount(count.notificationsNonLues);
    } catch (err) {
      console.log(err);
    }
  };
    const fetchEncadrantInfo = async () => {
      try {
        const { data } = await API.get('/encadrants/mon-profil');
        setEncadrantInfo(data);
      } catch (err) {
        console.log(err);
      }
    };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreerTache = async (e) => {
    e.preventDefault();
    try {
      await API.post('/taches', nouvelleTache);
      setShowModal(false);
      fetchTaches();
      setNouvelleTache({
        idEtudiant: '',
        idProjet: '',
        titre: '',
        description: '',
        dateDebut: '',
        dateLimite: '',
      });
    } catch (err) {
      console.log(err);
    }
  };

  const menuItems = [
    { id: 'accueil', icon: Home, label: 'Accueil' },
    { id: 'sujets', icon: BookOpen, label: 'Mes Sujets' },
    { id: 'taches', icon: CheckSquare, label: 'Gérer Tâches' },
    { id: 'calendrier', icon: Calendar, label: 'Calendrier' },
    { id: 'messagerie', icon: MessageCircle, label: 'Messagerie' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'profil', icon: User, label: 'Profil' },
  ];

  const inputStyle = {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.1)',
  };

  return (
    <div className="flex min-h-screen" style={{ background: '#0F172A' }}>
      {/* ── SIDEBAR ── */}
      <div
        className="w-64 flex flex-col justify-between py-6 px-4"
        style={{
          background: 'rgba(255,255,255,0.03)',
          borderRight: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 mb-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
            >
              <span className="text-white font-bold">P</span>
            </div>
            <span className="text-white font-bold text-lg">PFE Manager</span>
          </div>

          {/* Menu */}
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                style={{
                  background: activePage === item.id ? 'rgba(99,102,241,0.2)' : 'transparent',
                  color: activePage === item.id ? '#6366F1' : '#94A3B8',
                  border:
                    activePage === item.id
                      ? '1px solid rgba(99,102,241,0.3)'
                      : '1px solid transparent',
                }}
              >
                <item.icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
                {item.id === 'notifications' && notifCount > 0 && (
                  <span
                    className="ml-auto text-xs px-2 py-0.5 rounded-full text-white"
                    style={{ background: '#EF4444' }}
                  >
                    {notifCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* User + Logout */}
        <div>
          <div
            className="px-3 py-3 rounded-xl mb-2"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <p className="text-white text-sm font-medium">
              {user?.prenom} {user?.nom}
            </p>
            <p className="text-slate-400 text-xs">Encadrant</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{ color: '#EF4444' }}
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </div>

      {/* ── CONTENU ── */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Accueil */}
        {activePage === 'accueil' && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white">Bonjour, Dr. {user?.nom} 👋</h1>
              <p className="text-slate-400 mt-1">Tableau de bord encadrant</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Sujets proposés', value: sujets.length, color: '#6366F1', emoji: '📝' },
                {
                  label: 'Sujets validés',
                  value: sujets.filter((s) => s.valide).length,
                  color: '#10B981',
                  emoji: '✅',
                },
                { label: 'Tâches créées', value: taches.length, color: '#F59E0B', emoji: '📋' },
                { label: 'Réunions', value: reunions.length, color: '#8B5CF6', emoji: '📅' },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="text-2xl mb-2">{stat.emoji}</div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Réunions à venir */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <h2 className="text-white font-bold text-lg mb-4">📅 Prochaines Réunions</h2>
              {reunions.length === 0 ? (
                <p className="text-slate-400">Aucune réunion planifiée</p>
              ) : (
                <div className="space-y-3">
                  {reunions.slice(0, 3).map((reunion) => (
                    <div
                      key={reunion._id}
                      className="flex items-center justify-between p-4 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)' }}
                    >
                      <div>
                        <p className="text-white font-medium">
                          {new Date(reunion.date).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                          })}
                        </p>
                        <p className="text-slate-400 text-sm">{reunion.lienVisio}</p>
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
          </div>
        )}

        {/* Sujets */}
        {activePage === 'sujets' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-white">📝 Mes Sujets</h1>
              <button
                onClick={() => navigate('/sujets/nouveau')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium"
                style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
              >
                <Plus size={16} /> Nouveau Sujet
              </button>
            </div>
            <div className="space-y-3">
              {sujets.map((sujet) => (
                <div
                  key={sujet._id}
                  className="p-4 rounded-xl flex items-center justify-between"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div>
                    <p className="text-white font-medium">{sujet.titre}</p>
                    <p className="text-slate-400 text-sm">{sujet.description}</p>
                    <div className="flex gap-2 mt-2">
                      {sujet.technologies?.map((tech, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full text-xs text-indigo-300"
                          style={{ background: 'rgba(99,102,241,0.2)' }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium text-white"
                    style={{ background: sujet.valide ? '#10B981' : '#F59E0B' }}
                  >
                    {sujet.valide ? '✅ Validé' : '⏳ En attente'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tâches */}
        {activePage === 'taches' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-white">✅ Gérer Tâches</h1>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium"
                style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
              >
                <Plus size={16} /> Nouvelle Tâche
              </button>
            </div>

            <div className="space-y-3">
              {taches.map((tache) => (
                <div
                  key={tache._id}
                  className="p-4 rounded-xl flex items-center justify-between"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div>
                    <p className="text-white font-medium">{tache.titre}</p>
                    <p className="text-slate-400 text-sm">{tache.description}</p>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium text-white"
                    style={{
                      background:
                        tache.statutTache === 'TERMINEE'
                          ? '#10B981'
                          : tache.statutTache === 'EN_COURS'
                            ? '#F59E0B'
                            : '#6B7280',
                    }}
                  >
                    {tache.statutTache}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications */}
        {activePage === 'notifications' && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-8">🔔 Notifications</h1>
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  className="p-4 rounded-xl flex items-start gap-4"
                  style={{
                    background: notif.lu ? 'rgba(255,255,255,0.03)' : 'rgba(99,102,241,0.1)',
                    border: notif.lu
                      ? '1px solid rgba(255,255,255,0.05)'
                      : '1px solid rgba(99,102,241,0.3)',
                  }}
                >
                  <span className="text-2xl">
                    {notif.type === 'TACHE' ? '📋' : notif.type === 'REUNION' ? '📅' : '✅'}
                  </span>
                  <div>
                    <p className="text-white font-medium">{notif.titre}</p>
                    <p className="text-slate-400 text-sm">{notif.contenu}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profil */}
        {activePage === 'profil' && (
          <div>
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '2rem',
              }}
            >
              <h1 className="text-3xl font-bold text-white">👤 Mon Profil</h1>
              <button
                onClick={() => navigate('/profil')}
                style={{
                  background: 'linear-gradient(135deg,#4338CA,#7C3AED)',
                  color: '#fff',
                  border: 'none',
                  padding: '.75rem 1.5rem',
                  borderRadius: 12,
                  cursor: 'pointer',
                  fontSize: '.9rem',
                  fontWeight: 600,
                }}
              >
                ✏️ Modifier
              </button>
            </div>

            {/* Avatar */}
            <div
              className="rounded-2xl p-6 mb-4"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
              }}
            >
              <div
                style={{
                  width: 75,
                  height: 75,
                  borderRadius: 20,
                  background: 'linear-gradient(135deg,#10B981,#059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: '#fff',
                }}
              >
                {user?.prenom?.[0]}
                {user?.nom?.[0]}
              </div>
              <div>
                <p className="text-white font-bold text-2xl">
                  {user?.prenom} {user?.nom}
                </p>
                <div
                  style={{ display: 'flex', gap: '.5rem', marginTop: '.5rem', flexWrap: 'wrap' }}
                >
                  <span
                    style={{
                      background: 'rgba(16,185,129,.15)',
                      color: '#6EE7B7',
                      padding: '.25rem .8rem',
                      borderRadius: 100,
                      fontSize: '.78rem',
                    }}
                  >
                    👨‍🏫 Encadrant
                  </span>
                  {encadrantInfo?.typeEncadrant && (
                    <span
                      style={{
                        background: 'rgba(99,102,241,.15)',
                        color: '#818CF8',
                        padding: '.25rem .8rem',
                        borderRadius: 100,
                        fontSize: '.78rem',
                      }}
                    >
                      {encadrantInfo.typeEncadrant}
                    </span>
                  )}
                  {encadrantInfo?.disponibilite !== undefined && (
                    <span
                      style={{
                        background: encadrantInfo.disponibilite
                          ? 'rgba(16,185,129,.15)'
                          : 'rgba(239,68,68,.15)',
                        color: encadrantInfo.disponibilite ? '#6EE7B7' : '#FCA5A5',
                        padding: '.25rem .8rem',
                        borderRadius: 100,
                        fontSize: '.78rem',
                      }}
                    >
                      {encadrantInfo.disponibilite ? '✅ Disponible' : '❌ Non disponible'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Infos personnelles */}
            <div
              className="rounded-2xl p-6 mb-4"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <h2 className="text-white font-bold text-lg mb-4">👤 Informations personnelles</h2>
              {[
                { label: 'Nom', value: user?.nom },
                { label: 'Prénom', value: user?.prenom },
                { label: 'Email', value: user?.email },
                { label: 'Téléphone', value: user?.telephone || 'Non renseigné' },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '.75rem 0',
                    borderBottom: '1px solid rgba(255,255,255,.05)',
                  }}
                >
                  <span className="text-slate-400 text-sm">{item.label}</span>
                  <span className="text-white font-medium text-sm">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Infos professionnelles */}
            <div
              className="rounded-2xl p-6 mb-4"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <h2 className="text-white font-bold text-lg mb-4">
                👨‍🏫 Informations professionnelles
              </h2>
              {[
                { label: 'Matricule Prof', value: encadrantInfo?.matriculeProf },
                { label: 'Spécialité', value: encadrantInfo?.specialite },
                { label: 'Département', value: encadrantInfo?.departement },
                { label: 'Type encadrant', value: encadrantInfo?.typeEncadrant },
                {
                  label: 'Disponibilité',
                  value: encadrantInfo?.disponibilite ? '✅ Disponible' : '❌ Non disponible',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '.75rem 0',
                    borderBottom: '1px solid rgba(255,255,255,.05)',
                  }}
                >
                  <span className="text-slate-400 text-sm">{item.label}</span>
                  <span className="text-white font-medium text-sm">
                    {item.value || 'Non renseigné'}
                  </span>
                </div>
              ))}
            </div>

            {/* Bio */}
            {encadrantInfo?.bio && (
              <div
                className="rounded-2xl p-6"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <h2 className="text-white font-bold text-lg mb-3">📝 Bio</h2>
                <p className="text-slate-300 text-sm" style={{ lineHeight: 1.7 }}>
                  {encadrantInfo.bio}
                </p>
              </div>
            )}
          </div>
        )}

        {activePage === 'calendrier' && <CalendrierPage role="ENCADRANT" />}
        {activePage === 'messagerie' && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-8">💬 Messagerie</h1>
            <p className="text-slate-400">Messagerie à venir...</p>
          </div>
        )}
      </div>

      {/* ── MODAL NOUVELLE TÂCHE ── */}
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-xl">Nouvelle Tâche</h2>
              <button onClick={() => setShowModal(false)} style={{ color: '#94A3B8' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreerTache} className="space-y-4">
              {[
                { name: 'titre', label: 'Titre', type: 'text', placeholder: 'Titre de la tâche' },
                {
                  name: 'description',
                  label: 'Description',
                  type: 'text',
                  placeholder: 'Description',
                },
                {
                  name: 'idEtudiant',
                  label: 'ID Étudiant',
                  type: 'text',
                  placeholder: "ID de l'étudiant",
                },
                { name: 'idProjet', label: 'ID Projet', type: 'text', placeholder: 'ID du projet' },
                { name: 'dateDebut', label: 'Date Début', type: 'date', placeholder: '' },
                { name: 'dateLimite', label: 'Date Limite', type: 'date', placeholder: '' },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-slate-300 text-sm mb-1">{field.label}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={nouvelleTache[field.name]}
                    onChange={(e) =>
                      setNouvelleTache({
                        ...nouvelleTache,
                        [e.target.name]: e.target.value,
                      })
                    }
                    placeholder={field.placeholder}
                    required
                    className="w-full px-4 py-2.5 rounded-xl text-white outline-none"
                    style={inputStyle}
                  />
                </div>
              ))}

              <button
                type="submit"
                className="w-full py-3 rounded-xl text-white font-medium"
                style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
              >
                ✅ Créer la Tâche
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardEncadrant;
