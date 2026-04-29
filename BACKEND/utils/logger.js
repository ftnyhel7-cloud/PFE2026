// ═══════════════════════════════════════════════════════════
//  BACKEND/utils/logger.js
//  Helper centralisé pour journaliser les actions
// ═══════════════════════════════════════════════════════════
const Log = require('../models/Log');

/**
 * Enregistre une action dans les logs
 * @param {string} action - Type d'action (voir enum Log.action)
 * @param {object} options - { userId, userRole, userEmail, details, ip }
 */
async function logAction(action, options = {}) {
  try {
    await Log.create({
      action,
      userId: options.userId || null,
      userRole: options.userRole || 'SYSTEME',
      userEmail: options.userEmail || '',
      details: options.details || '',
      ip: options.ip || '',
    });
  } catch (err) {
    // Ne jamais faire crasher l'app à cause d'un log
    console.error('Erreur logger:', err.message);
  }
}

/**
 * Middleware Express pour extraire l'IP réelle
 */
function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '';
}

module.exports = { logAction, getClientIp };
