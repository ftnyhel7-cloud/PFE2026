exports.creerFiche = async (req, res) => {
  try {
    console.log('Body reçu:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user);
    // ... reste du code
  } catch (err) {
    console.error('ERREUR creerFiche:', err); // ← log complet
    res.status(500).json({ message: err.message });
  }
};
