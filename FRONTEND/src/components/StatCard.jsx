import React from 'react';

/**
 * Composant StatCard
 * Affiche une carte de statistique rapide avec Glassmorphism
 * 
 * @param {string} title Le titre de la statistique
 * @param {string|number} value La valeur principale à afficher
 * @param {React.ReactNode} icon L'icône lucide-react ou autre
 * @param {string} trend Une tendance éventuelle (ex: "+12%")
 * @param {boolean} isPositive Définit si la tendance est positive (vert) ou négative (rouge)
 */
const StatCard = ({ title, value, icon, trend, isPositive = true }) => {
  return (
    <div className="glass-effect p-6 rounded-2xl flex items-start justify-between min-w-[240px] hover:-translate-y-1 transition-all-smooth">
      <div>
        <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-heading font-bold text-white">{value}</h3>
        
        {/* Affichage de la tendance s'il y en a une */}
        {trend && (
          <p className={`text-sm mt-2 font-medium ${isPositive ? 'text-secondary' : 'text-red-400'}`}>
            {trend}
          </p>
        )}
      </div>
      
      {/* Conteneur de l'icône avec un léger fond coloré */}
      <div className="p-3 bg-primary/20 rounded-xl text-primary">
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
