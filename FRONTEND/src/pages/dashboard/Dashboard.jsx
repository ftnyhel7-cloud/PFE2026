import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import DashboardEtudiant from './DashboardEtudiant';
import DashboardEncadrant from './DashboardEncadrant';
import DashboardAdmin from './DashboardAdmin';
import SujetsPage from './SujetsPage';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [statutPFE, setStatutPFE] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'ETUDIANT') {
      fetchStatutEtudiant();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchStatutEtudiant = async () => {
    try {
      const { data } = await API.get('/etudiants/mon-profil');
      setStatutPFE(data?.statutPFE);
    } catch {
      setStatutPFE('NON_AFFECTE');
    } finally {
      setLoading(false);
    }
  };


  // ENCADRANT → dashboard encadrant
  if (user?.role === 'ENCADRANT') return <DashboardEncadrant />;

  // ADMIN → dashboard admin
  if (user?.role === 'ADMINISTRATEUR') return <DashboardAdmin />;

  // ETUDIANT
  if (user?.role === 'ETUDIANT') {
    // ✅ Validé → dashboard complet
    if (statutPFE === 'EN_COURS' || statutPFE === 'TERMINE') {
      return <DashboardEtudiant />;
    }

    // ❌ Pas encore validé → page sujets seulement
    return (
      <SujetsPage />
    );
  }

  return null;
}

export default Dashboard;
