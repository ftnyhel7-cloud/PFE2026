import { useState, useEffect } from 'react';
import CalendrierPage from './CalendrierPage';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import SujetsPage from './SujetsPage';
import {
  Home,
  BookOpen,
  CheckSquare,
  Calendar,
  MessageCircle,
  Bell,
  User,
  LogOut,
} from 'lucide-react';

function DashboardEtudiant() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('accueil');
  const [taches, setTaches] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notifCount, setNotifCount] = useState(0);
  const [etudiantInfo, setEtudiantInfo] = useState(null);
  const [projetInfo, setProjetInfo] = useState(null);

  useEffect(() => {
    fetchTaches();
      fetchNotifications();
      fetchProfilComplet();
  }, []);

  const fetchTaches = async () => {
    try {
      const { data } = await API.get('/taches/mes-taches');
      setTaches(data);
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
  const fetchProfilComplet = async () => {
    try {
      const { data: e } = await API.get('/etudiants/mon-profil');
      setEtudiantInfo(e);
      try {
        const { data: p } = await API.get('/projets/mon-projet');
        setProjetInfo(p);
      } catch {
        setProjetInfo(null);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'accueil', icon: Home, label: 'Accueil' },
    { id: 'projet', icon: BookOpen, label: 'Mon Projet' },
    { id: 'taches', icon: CheckSquare, label: 'Mes Tâches' },
    { id: 'calendrier', icon: Calendar, label: 'Calendrier' },
    { id: 'messagerie', icon: MessageCircle, label: 'Messagerie' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'profil', icon: User, label: 'Profil' },
    { id: 'sujets', icon: BookOpen, label: 'Sujets PFE' },
  ];

  const getStatutColor = (statut) => {
    if (statut === 'TERMINEE') return '#10B981';
    if (statut === 'EN_COURS') return '#F59E0B';
    return '#6B7280';
  };

  const getStatutLabel = (statut) => {
    if (statut === 'TERMINEE') return 'Terminée';
    if (statut === 'EN_COURS') return 'En cours';
    return 'À faire';
  };

  return (
    <div className="flex min-h-screen" style={{ background: '#0F172A' }}>
      {/* SIDEBAR */}
      <div
        className="w-64 flex flex-col justify-between py-6 px-4"
        style={{
          background: 'rgba(255,255,255,0.03)',
          borderRight: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div>
          <div className="flex items-center gap-3 px-2 mb-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
            >
              <span className="text-white font-bold">P</span>
            </div>
            <span className="text-white font-bold text-lg">PFE Manager</span>
          </div>

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

        <div>
          <div
            className="px-3 py-3 rounded-xl mb-2"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <p className="text-white text-sm font-medium">
              {user?.prenom} {user?.nom}
            </p>
            <p className="text-slate-400 text-xs">Étudiant</p>
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

      {/* CONTENU */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activePage === 'accueil' && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white">Bonjour, {user?.prenom} 👋</h1>
              <p className="text-slate-400 mt-1">Voici votre tableau de bord PFE</p>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Tâches totales', value: taches.length, emoji: '📋' },
                {
                  label: 'Terminées',
                  value: taches.filter((t) => t.statutTache === 'TERMINEE').length,
                  emoji: '✅',
                },
                {
                  label: 'En cours',
                  value: taches.filter((t) => t.statutTache === 'EN_COURS').length,
                  emoji: '⚡',
                },
                { label: 'Notifications', value: notifCount, emoji: '🔔' },
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

            <div
              className="rounded-2xl p-6"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <h2 className="text-white font-bold text-lg mb-4">📋 Mes Tâches Récentes</h2>
              {taches.length === 0 ? (
                <p className="text-slate-400">Aucune tâche pour l'instant</p>
              ) : (
                <div className="space-y-3">
                  {taches.slice(0, 5).map((tache) => (
                    <div
                      key={tache._id}
                      className="flex items-center justify-between p-4 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)' }}
                    >
                      <div>
                        <p className="text-white font-medium">{tache.titre}</p>
                        <p className="text-slate-400 text-sm">{tache.description}</p>
                      </div>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{ background: getStatutColor(tache.statutTache) }}
                      >
                        {getStatutLabel(tache.statutTache)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activePage === 'taches' && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-8">✅ Mes Tâches</h1>
            <div className="space-y-3">
              {taches.length === 0 ? (
                <p className="text-slate-400">Aucune tâche pour l'instant</p>
              ) : (
                taches.map((tache) => (
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
                      <p className="text-slate-500 text-xs mt-1">
                        Date limite :{' '}
                        {tache.dateLimite
                          ? new Date(tache.dateLimite).toLocaleDateString('fr-FR')
                          : 'Non définie'}
                      </p>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{ background: getStatutColor(tache.statutTache) }}
                    >
                      {getStatutLabel(tache.statutTache)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activePage === 'notifications' && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-8">🔔 Notifications</h1>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <p className="text-slate-400">Aucune notification</p>
              ) : (
                notifications.map((notif) => (
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
                      {notif.type === 'TACHE'
                        ? '📋'
                        : notif.type === 'REUNION'
                          ? '📅'
                          : notif.type === 'VALIDATION'
                            ? '✅'
                            : '🔔'}
                    </span>
                    <div>
                      <p className="text-white font-medium">{notif.titre}</p>
                      <p className="text-slate-400 text-sm">{notif.contenu}</p>
                    </div>
                    {!notif.lu && (
                      <span
                        className="ml-auto w-2 h-2 rounded-full mt-2"
                        style={{ background: '#6366F1' }}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

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
                  background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
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
                      background: 'rgba(99,102,241,.15)',
                      color: '#818CF8',
                      padding: '.25rem .8rem',
                      borderRadius: 100,
                      fontSize: '.78rem',
                    }}
                  >
                    🎓 Étudiant
                  </span>
                  {etudiantInfo?.niveau && (
                    <span
                      style={{
                        background: 'rgba(16,185,129,.15)',
                        color: '#6EE7B7',
                        padding: '.25rem .8rem',
                        borderRadius: 100,
                        fontSize: '.78rem',
                      }}
                    >
                      {etudiantInfo.niveau}
                    </span>
                  )}
                  {etudiantInfo?.statutPFE && (
                    <span
                      style={{
                        background: 'rgba(245,158,11,.15)',
                        color: '#FCD34D',
                        padding: '.25rem .8rem',
                        borderRadius: 100,
                        fontSize: '.78rem',
                      }}
                    >
                      PFE : {etudiantInfo.statutPFE.replace(/_/g, ' ')}
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

            {/* Infos académiques */}
            <div
              className="rounded-2xl p-6 mb-4"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <h2 className="text-white font-bold text-lg mb-4">🎓 Informations académiques</h2>
              {[
                { label: 'Matricule', value: etudiantInfo?.matricule },
                { label: 'Filière', value: etudiantInfo?.filiere },
                { label: 'Niveau', value: etudiantInfo?.niveau },
                { label: 'Statut PFE', value: etudiantInfo?.statutPFE?.replace(/_/g, ' ') },
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

            {/* Sujet PFE */}
            <div
              className="rounded-2xl p-6 mb-4"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <h2 className="text-white font-bold text-lg mb-4">📝 Sujet PFE</h2>
              {projetInfo ? (
                <>
                  {[
                    { label: 'Titre', value: projetInfo.titre || projetInfo.idSujet?.titre },
                    {
                      label: 'Description',
                      value: projetInfo.description || projetInfo.idSujet?.description,
                    },
                    { label: 'Statut', value: projetInfo.statutProjet },
                    {
                      label: 'Date début',
                      value: projetInfo.dateDebut
                        ? new Date(projetInfo.dateDebut).toLocaleDateString('fr-FR')
                        : null,
                    },
                    {
                      label: 'Date fin',
                      value: projetInfo.dateFin
                        ? new Date(projetInfo.dateFin).toLocaleDateString('fr-FR')
                        : null,
                    },
                  ]
                    .filter((i) => i.value)
                    .map((item) => (
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
                        <span
                          className="text-white font-medium text-sm"
                          style={{ maxWidth: '60%', textAlign: 'right' }}
                        >
                          {item.value}
                        </span>
                      </div>
                    ))}
                  {projetInfo.idSujet?.technologies?.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '.75rem 0',
                        alignItems: 'center',
                      }}
                    >
                      <span className="text-slate-400 text-sm">Technologies</span>
                      <div
                        style={{
                          display: 'flex',
                          gap: '.4rem',
                          flexWrap: 'wrap',
                          justifyContent: 'flex-end',
                        }}
                      >
                        {projetInfo.idSujet.technologies.map((tech, i) => (
                          <span
                            key={i}
                            style={{
                              background: 'rgba(99,102,241,.15)',
                              color: '#818CF8',
                              padding: '.2rem .6rem',
                              borderRadius: 100,
                              fontSize: '.75rem',
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                  <p style={{ fontSize: '2rem', marginBottom: '.5rem' }}>📭</p>
                  <p className="text-slate-400 text-sm">Aucun sujet PFE assigné</p>
                </div>
              )}
            </div>

            {/* CV */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <h2 className="text-white font-bold text-lg mb-4">📄 CV</h2>
              {etudiantInfo?.cvUrl ? (
                <a
                  href={etudiantInfo.cvUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '.5rem',
                    background: 'rgba(99,102,241,.15)',
                    color: '#818CF8',
                    padding: '.75rem 1.5rem',
                    borderRadius: 12,
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  📄 Voir mon CV
                </a>
              ) : (
                <p className="text-slate-400 text-sm">
                  Aucun CV renseigné — cliquez sur Modifier pour en ajouter un.
                </p>
              )}
            </div>
          </div>
        )}

        {activePage === 'sujets' && <SujetsPage />}

        {activePage === 'calendrier' && <CalendrierPage role="ETUDIANT" />}

        {activePage === 'messagerie' && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-8">💬 Messagerie</h1>
            <p className="text-slate-400">Messagerie à venir...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardEtudiant;
