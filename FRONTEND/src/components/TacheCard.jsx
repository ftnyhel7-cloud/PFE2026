import React from 'react';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Composant TacheCard
 * Affiche une tâche avec son statut, sa progression et sa date limite
 * 
 * @param {object} tache Objet contenant les détails de la tâche ({titre, description, statut_tache, DateLimite, urlLivrable})
 */
const TacheCard = ({ tache }) => {
  
  // Fonction pour déterminer les couleurs et icônes en fonction du statut de la tâche (basé sur l'enum statutT)
  const getStatusConfig = (status) => {
    switch (status) {
      case 'TERMINEE':
        return { color: 'text-secondary', bg: 'bg-secondary/10', bar: 'bg-secondary w-full', icon: <CheckCircle size={16} /> };
      case 'EN_COURS':
        return { color: 'text-orange-400', bg: 'bg-orange-400/10', bar: 'bg-orange-400 w-1/2', icon: <Clock size={16} /> };
      case 'A_FAIRE':
      default:
        return { color: 'text-gray-400', bg: 'bg-gray-400/10', bar: 'bg-gray-400 w-0', icon: <AlertCircle size={16} /> };
    }
  };

  const config = getStatusConfig(tache.statut_tache);

  // Déterminer si la date limite est proche (rouge si moins de 3 jours)
  // Utilisation simple de Date native pour comparer, sinon avec `date-fns` c'est plus facile
  const dateLimite = new Date(tache.DateLimite);
  const diffTime = Math.abs(dateLimite - new Date());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isUrgent = diffDays <= 3 && tache.statut_tache !== 'TERMINEE';

  return (
    <div className="glass-effect p-5 rounded-2xl border-l-4 border-l-primary hover:bg-white/10 transition-all-smooth">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-lg font-bold text-white mb-1">{tache.titre}</h4>
          <p className="text-sm text-gray-400">{tache.description}</p>
        </div>
        {/* Badge de Statut */}
        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${config.bg} ${config.color}`}>
          {config.icon}
          {tache.statut_tache.replace('_', ' ')}
        </span>
      </div>

      <div className="mt-4">
        {/* Barre de progression simple basée sur le statut (en attendant une vraie propriété progression) */}
        <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden mb-2">
          <div className={`h-full rounded-full transition-all duration-1000 ${config.bar}`}></div>
        </div>

        {/* Pied de la carte : DeadLine */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500 font-medium">Progression Automatique</span>
          {tache.DateLimite && (
            <span className={`font-semibold px-2 py-1 rounded-md ${isUrgent ? 'bg-red-500/20 text-red-400' : 'text-gray-400'}`}>
              🗓 Échéance : {dateLimite.toLocaleDateString('fr-FR')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TacheCard;
