import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  ClipboardList, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  MessageSquare, 
  Bell, 
  User, 
  LogOut,
  Users,
  FileText,
  Link as LinkIcon,
  BarChart
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = () => {
  // Récupération de l'utilisateur depuis le contexte
  const { user, logout } = useContext(AuthContext);

  // MOCK pour les tests sans Backend
  const currentUser = user || { role: 'ETUDIANT', nom: 'Ghariani', prenom: 'Na7la' }; 

  // Définition des menus selon le rôle
  const getMenuLinks = () => {
    switch (currentUser.role) {
      case 'ETUDIANT':
        return [
          { name: 'Accueil', path: '/etudiant', icon: <Home size={20} /> },
          { name: 'Mon Projet', path: '/etudiant/projet', icon: <ClipboardList size={20} /> },
          { name: 'Mes Tâches', path: '/etudiant/taches', icon: <CheckSquare size={20} /> },
          { name: 'Calendrier', path: '/etudiant/calendrier', icon: <CalendarIcon size={20} /> },
          { name: 'Messagerie', path: '/messages', icon: <MessageSquare size={20} /> },
          { name: 'Notifications', path: '/notifications', icon: <Bell size={20} /> },
          { name: 'Profil', path: '/profil', icon: <User size={20} /> },
        ];
      case 'ENCADRANT':
        return [
          { name: 'Accueil', path: '/encadrant', icon: <Home size={20} /> },
          { name: 'Mes Étudiants', path: '/encadrant/etudiants', icon: <Users size={20} /> },
          { name: 'Mes Sujets', path: '/encadrant/sujets', icon: <FileText size={20} /> },
          { name: 'Gérer Tâches', path: '/encadrant/taches', icon: <CheckSquare size={20} /> },
          { name: 'Gérer Calendrier', path: '/encadrant/calendrier', icon: <CalendarIcon size={20} /> },
          { name: 'Messagerie', path: '/messages', icon: <MessageSquare size={20} /> },
          { name: 'Notifications', path: '/notifications', icon: <Bell size={20} /> },
          { name: 'Profil', path: '/profil', icon: <User size={20} /> },
        ];
      case 'ADMINISTRATEUR':
        return [
          { name: 'Accueil', path: '/admin', icon: <Home size={20} /> },
          { name: 'Gérer Utilisateurs', path: '/admin/utilisateurs', icon: <Users size={20} /> },
          { name: 'Gérer Sujets PFE', path: '/admin/sujets', icon: <FileText size={20} /> },
          { name: 'Gérer Affectations', path: '/admin/affectations', icon: <LinkIcon size={20} /> },
          { name: 'Statistiques', path: '/admin/statistiques', icon: <BarChart size={20} /> },
        ];
      default:
        return [];
    }
  };

  const links = getMenuLinks();

  return (
    <div className="w-64 min-h-screen glass-effect flex flex-col justify-between hidden md:flex border-r border-white/10 m-4 rounded-2xl overflow-hidden self-start sticky top-4" style={{ height: 'calc(100vh - 32px)' }}>
      {/* Sidebar Header (Logo) */}
      <div className="p-6 border-b border-white/10 flex items-center justify-center">
        <h1 className="text-2xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          PFE Tracker
        </h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            end={link.path === '/admin' || link.path === '/etudiant' || link.path === '/encadrant'} // 'end' permet de ne pas surligner l'accueil si on est sur une sous-page
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all-smooth font-medium ${
                isActive
                  ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {link.icon}
            {link.name}
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer (User & Logout) */}
      <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-4 px-2">
          {/* Avatar statique pour la maquette */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg">
            {currentUser.prenom.charAt(0)}{currentUser.nom.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{currentUser.prenom} {currentUser.nom}</p>
            <p className="text-xs text-gray-400 capitalize">{currentUser.role.toLowerCase()}</p>
          </div>
        </div>
        
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-all-smooth font-medium border border-transparent hover:border-red-500/20"
        >
          <LogOut size={20} />
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
