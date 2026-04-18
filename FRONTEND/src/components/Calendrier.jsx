import React, { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  isBefore, 
  startOfDay 
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, XIcon } from 'lucide-react';

/**
 * Composant Calendrier Utilisant date-fns
 * Affiche le mois courant, gère les réunions et l'ajout interactif d'événements
 */
const Calendrier = ({ reunions = [], onAddReunion }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date()); // Par défaut, mois actuel (avril 2026)
  const [selectedDate, setSelectedDate] = useState(null);
  
  // État du modal d'ajout
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [studentId, setStudentId] = useState('');

  const today = startOfDay(new Date());

  // Navigation des mois
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Clique sur une date du calendrier
  const onDateClick = (day) => {
    // Si la date est dans le passé, on refuse (les dates passées sont strictements < today)
    if (isBefore(day, today)) {
      alert("❌ Impossible de planifier dans le passé");
      return;
    }
    // Ouvre le modal
    setSelectedDate(day);
    setIsModalOpen(true);
  };

  const handleCreateMeeting = (e) => {
    e.preventDefault();
    if(onAddReunion) {
      onAddReunion({
        date: selectedDate,
        time: meetingTime,
        link: meetingLink,
        studentId
      });
    }
    setIsModalOpen(false);
    setMeetingTime('');
    setMeetingLink('');
    setStudentId('');
  };

  // --- RENDU DU HEADER DU CALENDRIER (Mois / Annee + boutons de navigation) ---
  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-heading font-bold text-white capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 rounded-full glass-effect hover:bg-white/10 text-white transition-all-smooth">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextMonth} className="p-2 rounded-full glass-effect hover:bg-white/10 text-white transition-all-smooth">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  };

  // --- RENDU DES JOURS DE LA SEMAINE (L, M, M, J, V, S, D) ---
  const renderDays = () => {
    const days = [];
    let startDate = startOfWeek(currentMonth, { weekStartsOn: 1 }); // Commence le Lundi

    for (let i = 0; i < 7; i++) {
        days.push(
        <div key={i} className="text-center font-semibold text-gray-400 text-sm py-2">
          {format(addDays(startDate, i), 'EEEE', { locale: fr }).substring(0, 3)}
        </div>
      );
    }
    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  // --- RENDU DE LA GRILLE DES JOURS DU MOIS ---
  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        
        // Vérifier le statut du jour
        const past = isBefore(day, today);
        const isSelected = isSameDay(day, selectedDate);
        const isTodayDay = isSameDay(day, today);
        const isCurrentMonth = isSameMonth(day, monthStart);
        
        // Vérifier s'il y a une réunion ce jour là
        const hasReunion = reunions.some(r => isSameDay(new Date(r.date), cloneDay));

        // Styling conditionnel
        let dayStyle = "relative flex items-center justify-center h-12 w-12 rounded-full mx-auto cursor-pointer transition-all-smooth font-medium ";
        
        if (!isCurrentMonth) {
            dayStyle += "text-gray-600 cursor-default "; // Jours des autres mois
        } else if (past) {
            dayStyle += "text-gray-500 bg-white/5 cursor-not-allowed "; // Passé grisé
        } else if (isTodayDay) {
            dayStyle += "bg-primary text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] "; // Aujourd'hui
        } else if (isSelected) {
            dayStyle += "bg-white/20 text-white border border-white/40 "; // Sélectionné
        } else {
            dayStyle += "text-gray-300 hover:bg-white/10 "; // Jours futurs
        }

        days.push(
          <div
            className={`py-1 ${!isCurrentMonth ? 'pointer-events-none' : ''}`}
            key={day}
            onClick={() => onDateClick(cloneDay)}
          >
            <div className={dayStyle}>
              {formattedDate}
              
              {/* Point de réunion */}
              {hasReunion && isCurrentMonth && (
                  <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_5px_rgba(16,185,129,0.8)]"></span>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <div className="glass-effect p-6 rounded-3xl relative w-full h-full">
      {renderHeader()}
      {renderDays()}
      {renderCells()}

      {/* --- MODAL D'AJOUT DE RÉUNION --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#1E293B] border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in-up">
            
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-heading font-bold text-white">Planifier une réunion</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                    <XIcon size={20} />
                </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-4">
              {/* Date Sélectionnée - Lecture Seule */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Date Sélectionnée</label>
                <div className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white font-medium">
                    {selectedDate ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr }) : ''}
                </div>
              </div>

              {/* Heure */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Heure de début</label>
                <input 
                  type="time" 
                  required
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors [color-scheme:dark]"
                />
              </div>

              {/* Étudiant */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Étudiant concerné</label>
                <select 
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors appearance-none"
                >
                  <option value="" disabled>Sélectionner un étudiant...</option>
                  {/* Valeurs mockées */}
                  <option value="1">Sami Etudiant</option>
                  <option value="2">Ahmed Dev</option>
                </select>
              </div>

              {/* Lien Meet */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Lien Google Meet</label>
                <input 
                  type="url" 
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  required
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors placeholder:text-gray-600"
                />
              </div>

              {/* Boutons */}
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors font-medium">
                  Annuler
                </button>
                <button type="submit" className="flex-1 py-3 px-4 rounded-xl bg-secondary hover:bg-secondary/90 text-white font-medium shadow-lg transition-all-smooth">
                  Confirmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendrier;
