// ═══════════════════════════════════════════════════════════
//  FRONTEND/src/context/NotificationsContext.jsx  ✅ CORRIGÉ
//  PROBLÈME RACINE : sendNotif() n'appelait jamais l'API
//  → les notifications restaient en mémoire locale (state React)
//  → disparaissaient au rechargement, invisibles pour les autres
//
//  FIX : sendNotif() appelle maintenant POST /api/notifications
//  avec idUtilisateur pour chaque destinataire ciblé
// ═══════════════════════════════════════════════════════════
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import Pusher from 'pusher-js';
import API from '../api/axios';
import { useAuth } from './AuthContext';

const NotifContext = createContext(null);

// ─────────────────────────────────────────────────────────
//  Publications initiales (restent locales — pas de modèle DB)
// ─────────────────────────────────────────────────────────
const INIT_PUBS = [
  {
    _id: 'p1',
    titre: 'Ouverture des inscriptions PFE 2026',
    contenu:
      "Les inscriptions pour les projets de fin d'études sont désormais ouvertes. Connectez-vous pour soumettre votre candidature avant le 15 mai.",
    auteur: 'Admin',
    date: '2026-04-10',
    statut: 'PUBLIE',
    vues: 142,
    type: 'ANNONCE',
    audience: 'TOUS',
  },
  {
    _id: 'p2',
    titre: 'Guide de rédaction du rapport final',
    contenu:
      'Un guide actualisé pour la rédaction du rapport final de PFE est disponible dans la section documents. Consultez-le avant de commencer la rédaction.',
    auteur: 'Admin',
    date: '2026-04-05',
    statut: 'PUBLIE',
    vues: 98,
    type: 'RESSOURCE',
    audience: 'ETUDIANT',
  },
  {
    _id: 'p3',
    titre: 'Calendrier des soutenances Mai 2026',
    contenu:
      'Le calendrier prévisionnel des soutenances a été mis en ligne. Merci de confirmer votre disponibilité avant le 30 avril.',
    auteur: 'Admin',
    date: '2026-04-01',
    statut: 'PUBLIE',
    vues: 45,
    type: 'CALENDRIER',
    audience: 'ENCADRANT',
  },
  {
    _id: 'p4',
    titre: 'Nouvelle procédure de dépôt numérique',
    contenu:
      'À partir de cette année, les rapports finaux doivent être déposés uniquement en format numérique sur la plateforme. Plus de version papier requise.',
    auteur: 'Admin',
    date: '2026-03-28',
    statut: 'PUBLIE',
    vues: 0,
    type: 'ANNONCE',
    audience: 'TOUS',
  },
];

export function NotifProvider({ children }) {
  const { user, isAuthenticated } = useAuth();

  // Les notifs admin viennent maintenant de l'API (voir useEffect)
  const [notifs, setNotifs] = useState([]);
  const [pubs, setPubs] = useState(INIT_PUBS);
  const [seenPubs, setSeenPubs] = useState({ ETUDIANT: [], ENCADRANT: [] });
  const [sending, setSending] = useState(false);
  const [nouvellesNotifs, setNouvellesNotifs] = useState([]);

  const pusherRef = useRef(null);
  const channelRef = useRef(null);

  // ── Pusher — écoute temps réel ───────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !user?._id) return;

    pusherRef.current = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
    });

    const channel = pusherRef.current.subscribe(`user-${user._id}`);
    channelRef.current = channel;

    channel.bind('nouvelle-notification', (data) => {
      console.log('Nouvelle notification Pusher:', data.titre);
      setNotifs((prev) => {
        if (prev.some((n) => n._id === data._id)) return prev;
        return [data, ...prev];
      });
      setNouvellesNotifs((prev) => [...prev, data]);
    });

    return () => {
      channel.unbind_all();
      pusherRef.current?.unsubscribe(`user-${user._id}`);
      pusherRef.current?.disconnect();
    };
  }, [isAuthenticated, user?._id]);

  const clearNouvellesNotifs = useCallback(() => setNouvellesNotifs([]), []);

  // Les notifications sont chargées par NotificationsPage.jsx directement
  // Ne pas appeler l'API ici — l'utilisateur n'est pas encore connecté au montage

  // ─────────────────────────────────────────────────────────
  //  ENVOYER UNE NOTIFICATION — ✅ APPEL API RÉEL
  //  Avant ce fix : setNotifs([n, ...prev]) local uniquement
  //  Après ce fix : POST /api/admin → sendNotification
  //                 qui crée les notifs pour chaque destinataire
  // ─────────────────────────────────────────────────────────
  const sendNotif = useCallback(
    async ({ titre, description, type = 'SYSTEME', cibles, userIds }) => {
      setSending(true);
      try {
        // Mapper les cibles vers les rôles attendus par le backend
        let rolesCibles = [];
        if (cibles) {
          if (cibles.includes('TOUS')) rolesCibles = ['ETUDIANT', 'ENCADRANT', 'ADMINISTRATEUR'];
          if (cibles.includes('ETUDIANT')) rolesCibles.push('ETUDIANT');
          if (cibles.includes('ENCADRANT')) rolesCibles.push('ENCADRANT');
          if (cibles.includes('ADMIN')) rolesCibles.push('ADMINISTRATEUR');
        }

        // Appel à la route admin dédiée (adminController.sendNotification)
        await API.post('/admin/notifications', {
          titre,
          contenu: description,
          type,
          rolesCibles: userIds ? [] : rolesCibles,
          userIds: userIds || [],
        });

        // Ajouter localement pour affichage immédiat dans le dashboard admin
        const n = {
          _id: `n_${Date.now()}`,
          type,
          titre,
          description,
          contenu: description,
          auteur: 'Admin',
          date: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          lu: false,
          cibles: cibles || ['TOUS'],
        };
        setNotifs((prev) => [n, ...prev]);
        return n;
      } catch (err) {
        console.error('Erreur envoi notification:', err);
        throw err;
      } finally {
        setSending(false);
      }
    },
    []
  );

  // ── Publications (restent locales) ────────────────────────
  const savePub = useCallback((pub, editingId = null) => {
    if (editingId) {
      setPubs((prev) =>
        prev.map((p) =>
          p._id === editingId ? { ...p, ...pub, date: new Date().toISOString().slice(0, 10) } : p
        )
      );
    } else {
      const newPub = {
        _id: `p_${Date.now()}`,
        ...pub,
        auteur: 'Admin',
        date: new Date().toISOString().slice(0, 10),
        vues: 0,
      };
      setPubs((prev) => [newPub, ...prev]);
    }
  }, []);

  const publishPub = useCallback(
    (id) => setPubs((prev) => prev.map((p) => (p._id === id ? { ...p, statut: 'PUBLIE' } : p))),
    []
  );

  const deletePub = useCallback((id) => setPubs((prev) => prev.filter((p) => p._id !== id)), []);

  // ── Accesseurs par rôle ───────────────────────────────────
  const getNotifsByRole = useCallback(
    (role) => notifs.filter((n) => n.cibles?.includes(role) || n.cibles?.includes('TOUS')),
    [notifs]
  );

  const getPubsByAudience = useCallback(
    (role) =>
      pubs.filter((p) => p.statut === 'PUBLIE' && (p.audience === 'TOUS' || p.audience === role)),
    [pubs]
  );

  const getUnseenPubs = useCallback(
    (role) => {
      const seen = seenPubs[role] || [];
      return getPubsByAudience(role).filter((p) => !seen.includes(p._id));
    },
    [getPubsByAudience, seenPubs]
  );

  const markPubsSeen = useCallback((role, pubIds) => {
    setSeenPubs((prev) => ({
      ...prev,
      [role]: [...new Set([...(prev[role] || []), ...pubIds])],
    }));
  }, []);

  // ── Notifications ─────────────────────────────────────────
  const markRead = useCallback(
    (id) => setNotifs((prev) => prev.map((n) => (n._id === id ? { ...n, lu: true } : n))),
    []
  );

  const markAllRead = useCallback(
    (role) =>
      setNotifs((prev) =>
        prev.map((n) =>
          n.cibles?.includes(role) || n.cibles?.includes('TOUS') ? { ...n, lu: true } : n
        )
      ),
    []
  );

  const dismissNotif = useCallback(
    (id) => setNotifs((prev) => prev.filter((n) => n._id !== id)),
    []
  );

  return (
    <NotifContext.Provider
      value={{
        notifs,
        setNotifs,
        pubs,
        setPubs,
        sending,
        sendNotif,
        savePub,
        publishPub,
        deletePub,
        getNotifsByRole,
        getPubsByAudience,
        getUnseenPubs,
        markPubsSeen,
        markRead,
        markAllRead,
        dismissNotif,
        nouvellesNotifs,
        clearNouvellesNotifs,
      }}
    >
      {children}
    </NotifContext.Provider>
  );
}

export function useNotifContext() {
  const ctx = useContext(NotifContext);
  if (!ctx) throw new Error('useNotifContext doit être utilisé dans <NotifProvider>');
  return ctx;
}
