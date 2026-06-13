// ═══════════════════════════════════════════════════════════
//  BACKEND/utils/pusher.js
//  Helper Pusher — réutilisable dans tous les controllers
// ═══════════════════════════════════════════════════════════
const Pusher = require('pusher');
const Notification = require('../models/Notification');

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

// Envoyer une notification temps réel à un utilisateur
async function envoyerNotifPusher(idUtilisateur, notification) {
  try {
    await pusher.trigger(`user-${idUtilisateur}`, 'nouvelle-notification', {
      _id: notification._id,
      titre: notification.titre,
      contenu: notification.contenu,
      type: notification.type,
      lu: false,
      createdAt: notification.createdAt || new Date(),
    });
    console.log(`📡 Pusher → user-${idUtilisateur} | ${notification.titre}`);
  } catch (err) {
    console.error('Erreur Pusher:', err.message);
  }
}

// Créer en base ET envoyer via Pusher
async function creerEtEnvoyerNotif({
  idUtilisateur,
  titre,
  contenu,
  type = 'SYSTEME',
  envoyePar = null,
}) {
  const notif = await Notification.create({
    idUtilisateur,
    titre,
    contenu,
    type,
    lu: false,
    envoyePar,
  });
  await envoyerNotifPusher(idUtilisateur.toString(), notif);
  return notif;
}

module.exports = { pusher, envoyerNotifPusher, creerEtEnvoyerNotif };
