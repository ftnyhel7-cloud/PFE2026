// ═══════════════════════════════════════════════════════════
//  BACKEND/middleware/authMiddleware.js
//  Vérifie le JWT Access Token sur les routes protégées
// ═══════════════════════════════════════════════════════════
const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');

exports.protect = async (req, res, next) => {
  try {
    // ── Extraire le token depuis le header Authorization ─
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Accès refusé — authentification requise',
      });
    }

    // ── Vérifier et décoder le token ─────────────────────
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          code: 'TOKEN_EXPIRED',
          message: 'Token expiré — veuillez rafraîchir votre session',
        });
      }
      return res.status(401).json({
        status: 'error',
        code: 'TOKEN_INVALID',
        message: 'Token invalide',
      });
    }

    // ── Vérifier que l'utilisateur existe toujours ───────
    const user = await Utilisateur.findById(decoded.id).select('-mot_de_passe -refreshToken');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Utilisateur introuvable',
      });
    }

    // ── Attacher l'utilisateur à la requête ──────────────
    // ── Vérifier que le compte est actif ─────────────────
    if (user.isActive === false) {
      return res.status(403).json({
        status: 'error',
        code: 'ACCOUNT_DISABLED',
        message: "Votre compte a été désactivé. Contactez l'administration.",
      });
    }

    // ── Attacher l'utilisateur à la requête ──────────────
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ status: 'error', message: "Erreur d'authentification" });
  }
};

// ═══════════════════════════════════════════════════════════
//  BACKEND/middleware/roleMiddleware.js
//  Vérifie que l'utilisateur a le rôle requis
// ═══════════════════════════════════════════════════════════
exports.authorizeRoles =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Non authentifié',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Accès refusé — rôle '${req.user.role}' non autorisé. Rôles acceptés : ${roles.join(', ')}`,
      });
    }

    next();
  };
