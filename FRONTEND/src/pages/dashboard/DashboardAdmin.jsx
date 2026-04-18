import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { Home, Users, BookOpen, Link, BarChart2, LogOut, CheckCircle, XCircle } from 'lucide-react';

function DashboardAdmin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('accueil');
  const [sujetsNonValides, setSujetsNonValides] = useState([]);
  const [sujetsValides, setSujetsValides] = useState([]);
  const [stats, setStats] = useState({
    totalSujets: 0,
    sujetsEnAttente: 0,
    sujetsValides: 0,
  });

  useEffect(() => {
    fetchSujets();
  }, []);

  const fetchSujets = async () => {
    try {
      const [nonValides, valides] = await Promise.all([
        API.get('/sujets/non-valides'),
        API.get('/sujets'),
      ]);
      setSujetsNonValides(nonValides.data);
      setSujetsValides(valides.data);
      setStats({
        totalSujets: nonValides.data.length + valides.data.length,
        sujetsEnAttente: nonValides.data.length,
        sujetsValides: valides.data.length,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleValider = async (id) => {
    try {
      await API.put(`/sujets/${id}/valider`);
      fetchSujets();
    } catch (err) {
      console.log(err);
    }
  };

  const handleSupprimer = async (id) => {
    try {
      await API.delete(`/sujets/${id}`);
      fetchSujets();
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
    { id: 'utilisateurs', icon: Users, label: 'Utilisateurs' },
    { id: 'sujets', icon: BookOpen, label: 'Gérer Sujets' },
    { id: 'affectations', icon: Link, label: 'Affectations' },
    { id: 'statistiques', icon: BarChart2, label: 'Statistiques' },
  ];

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
            <p className="text-slate-400 text-xs">Administrateur</p>
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
              <h1 className="text-3xl font-bold text-white">Tableau de bord Admin 🛡️</h1>
              <p className="text-slate-400 mt-1">
                Bienvenue, {user?.prenom} {user?.nom}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                {
                  label: 'Total Sujets',
                  value: stats.totalSujets,
                  color: '#6366F1',
                  emoji: '📝',
                },
                {
                  label: 'En Attente',
                  value: stats.sujetsEnAttente,
                  color: '#F59E0B',
                  emoji: '⏳',
                },
                {
                  label: 'Validés',
                  value: stats.sujetsValides,
                  color: '#10B981',
                  emoji: '✅',
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="text-3xl mb-3">{stat.emoji}</div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Sujets en attente */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <h2 className="text-white font-bold text-lg mb-4">
                ⏳ Sujets en attente de validation
              </h2>
              {sujetsNonValides.length === 0 ? (
                <p className="text-slate-400">Aucun sujet en attente ✅</p>
              ) : (
                <div className="space-y-3">
                  {sujetsNonValides.map((sujet) => (
                    <div
                      key={sujet._id}
                      className="flex items-center justify-between p-4 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)' }}
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
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleValider(sujet._id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-sm font-medium"
                          style={{ background: '#10B981' }}
                        >
                          <CheckCircle size={14} /> Valider
                        </button>
                        <button
                          onClick={() => handleSupprimer(sujet._id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-sm font-medium"
                          style={{ background: '#EF4444' }}
                        >
                          <XCircle size={14} /> Refuser
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Gérer Sujets */}
        {activePage === 'sujets' && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-8">📝 Gérer les Sujets</h1>

            {/* Non validés */}
            <div className="mb-6">
              <h2 className="text-yellow-400 font-bold mb-4">
                ⏳ En attente ({sujetsNonValides.length})
              </h2>
              <div className="space-y-3">
                {sujetsNonValides.map((sujet) => (
                  <div
                    key={sujet._id}
                    className="flex items-center justify-between p-4 rounded-xl"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(245,158,11,0.3)',
                    }}
                  >
                    <div>
                      <p className="text-white font-medium">{sujet.titre}</p>
                      <p className="text-slate-400 text-sm">{sujet.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleValider(sujet._id)}
                        className="px-3 py-1.5 rounded-lg text-white text-sm"
                        style={{ background: '#10B981' }}
                      >
                        ✅ Valider
                      </button>
                      <button
                        onClick={() => handleSupprimer(sujet._id)}
                        className="px-3 py-1.5 rounded-lg text-white text-sm"
                        style={{ background: '#EF4444' }}
                      >
                        ❌ Refuser
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Validés */}
            <div>
              <h2 className="text-green-400 font-bold mb-4">✅ Validés ({sujetsValides.length})</h2>
              <div className="space-y-3">
                {sujetsValides.map((sujet) => (
                  <div
                    key={sujet._id}
                    className="flex items-center justify-between p-4 rounded-xl"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(16,185,129,0.3)',
                    }}
                  >
                    <div>
                      <p className="text-white font-medium">{sujet.titre}</p>
                      <p className="text-slate-400 text-sm">{sujet.description}</p>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-xs text-white"
                      style={{ background: '#10B981' }}
                    >
                      Validé ✅
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Autres pages */}
        {activePage === 'utilisateurs' && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-8">👥 Gérer Utilisateurs</h1>
            <p className="text-slate-400">Liste des utilisateurs à venir...</p>
          </div>
        )}

        {activePage === 'affectations' && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-8">🔗 Gérer Affectations</h1>
            <p className="text-slate-400">Affectations à venir...</p>
          </div>
        )}

        {activePage === 'statistiques' && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-8">📊 Statistiques</h1>
            <p className="text-slate-400">Graphiques à venir...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardAdmin;
