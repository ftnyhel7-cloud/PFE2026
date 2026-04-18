const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');

const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1];
  
//Pas de token → bloque la requête401 = non autorisé
  if (!token) {
    return res.status(401).json({ message: 'Tu dois être connecté' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await Utilisateur.findById(decoded.id).select('-mot_de_passe');
    next();
  } catch {
    res.status(401).json({ message: 'Token invalide' });
  }
};

module.exports = { protect };
