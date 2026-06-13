const Certification = require('../models/Certification');
const Etudiant = require('../models/Etudiant');
const Notification = require('../models/Notification');

exports.ajouterCertification = async (req, res) => {
  try {
    const etudiant = await Etudiant.findOne({ utilisateur: req.user._id });
    if (!etudiant) return res.status(404).json({ message: 'Profil étudiant introuvable.' });
    const { titre, organisme, dateObtention, dateExpiration, lienVerification, idProjet } =
      req.body;
    const fichierCertif = req.file ? req.file.path : '';
    const certif = await Certification.create({
      idEtudiant: etudiant._id,
      idProjet: idProjet || null,
      titre,
      organisme,
      dateObtention,
      dateExpiration: dateExpiration || null,
      lienVerification: lienVerification || '',
      fichierCertif,
    });
    res.status(201).json(certif);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.mesCertifications = async (req, res) => {
  try {
    const etudiant = await Etudiant.findOne({ utilisateur: req.user._id });
    if (!etudiant) return res.status(404).json({ message: 'Profil étudiant introuvable.' });
    const certifs = await Certification.find({ idEtudiant: etudiant._id })
      .populate('idProjet', 'titre')
      .sort({ dateObtention: -1 });
    res.json(certifs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toutesLesCertifications = async (req, res) => {
  try {
    const certifs = await Certification.find()
      .populate({
        path: 'idEtudiant',
        populate: { path: 'utilisateur', select: 'nom prenom email' },
      })
      .populate('idProjet', 'titre')
      .sort({ createdAt: -1 });
    res.json(certifs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.changerStatut = async (req, res) => {
  try {
    const { statut, commentaireAdmin } = req.body;
    if (!['VALIDEE', 'REJETEE'].includes(statut))
      return res.status(400).json({ message: 'Statut invalide.' });
    const certif = await Certification.findById(req.params.id).populate({
      path: 'idEtudiant',
      populate: { path: 'utilisateur', select: 'nom prenom' },
    });
    if (!certif) return res.status(404).json({ message: 'Certification introuvable.' });
    certif.statut = statut;
    if (commentaireAdmin) certif.commentaireAdmin = commentaireAdmin;
    await certif.save();
    const idUtil = certif.idEtudiant?.utilisateur?._id;
    if (idUtil) {
      await Notification.create({
        idUtilisateur: idUtil,
        titre: statut === 'VALIDEE' ? '🏅 Certification validée' : '❌ Certification rejetée',
        contenu:
          statut === 'VALIDEE'
            ? `Votre certification "${certif.titre}" a été validée.`
            : `Votre certification "${certif.titre}" a été rejetée.${commentaireAdmin ? ' Motif : ' + commentaireAdmin : ''}`,
        type: 'SYSTEME',
      });
    }
    res.json(certif);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.supprimerCertification = async (req, res) => {
  try {
    const etudiant = await Etudiant.findOne({ utilisateur: req.user._id });
    const certif = await Certification.findById(req.params.id);
    if (!certif) return res.status(404).json({ message: 'Certification introuvable.' });
    if (certif.idEtudiant.toString() !== etudiant._id.toString())
      return res.status(403).json({ message: 'Action non autorisée.' });
    await certif.deleteOne();
    res.json({ message: 'Certification supprimée.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
