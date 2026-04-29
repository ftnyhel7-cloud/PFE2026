// ═══════════════════════════════════════════════════════════
//  BACKEND/controllers/referentielController.js
//  CRUD des codes autorisés (matricules / codes contrat)
// ═══════════════════════════════════════════════════════════
const Referentiel = require('../models/Referentiel');
const { logAction, getClientIp } = require('../utils/logger');

// ─────────────────────────────────────────────────────────
//  LISTER TOUS LES CODES (pagination + filtres)
// ─────────────────────────────────────────────────────────
exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 50, type, utilise, search } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (utilise !== undefined) filter.utilise = utilise === 'true';
    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: 'i' } },
        { label: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Referentiel.countDocuments(filter);
    const referentiels = await Referentiel.find(filter)
      .populate('utilisePar', 'nom prenom email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      referentiels,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ─────────────────────────────────────────────────────────
//  AJOUTER UN CODE
// ─────────────────────────────────────────────────────────
exports.addCode = async (req, res) => {
  try {
    const { type, code, label } = req.body;

    if (!type || !code) {
      return res.status(400).json({ status: 'error', message: 'Type et code sont requis' });
    }

    if (!['ETUDIANT', 'ENCADRANT'].includes(type)) {
      return res.status(400).json({ status: 'error', message: 'Type invalide' });
    }

    // Vérifier si le code existe déjà
    const existe = await Referentiel.findOne({ code: code.toUpperCase().trim() });
    if (existe) {
      return res.status(409).json({ status: 'error', message: 'Ce code existe déjà dans le référentiel' });
    }

    const ref = await Referentiel.create({
      type,
      code: code.toUpperCase().trim(),
      label: label || '',
    });

    // Log
    await logAction('ADD_REFERENTIEL', {
      userId: req.user._id,
      userRole: 'ADMINISTRATEUR',
      userEmail: req.user.email,
      details: `Ajout code ${type}: ${code}`,
      ip: getClientIp(req),
    });

    res.status(201).json({ status: 'success', referentiel: ref });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ─────────────────────────────────────────────────────────
//  MODIFIER UN CODE
// ─────────────────────────────────────────────────────────
exports.updateCode = async (req, res) => {
  try {
    const { type, code, label } = req.body;
    const ref = await Referentiel.findById(req.params.id);

    if (!ref) {
      return res.status(404).json({ status: 'error', message: 'Code introuvable' });
    }

    if (ref.utilise && code && code.toUpperCase().trim() !== ref.code) {
      return res.status(400).json({
        status: 'error',
        message: 'Impossible de modifier le code d\'une entrée déjà utilisée',
      });
    }

    if (type && !['ETUDIANT', 'ENCADRANT'].includes(type)) {
      return res.status(400).json({ status: 'error', message: 'Type invalide' });
    }

    if (code && code.toUpperCase().trim() !== ref.code) {
      const existe = await Referentiel.findOne({
        _id: { $ne: ref._id },
        code: code.toUpperCase().trim(),
      });
      if (existe) {
        return res.status(409).json({ status: 'error', message: 'Ce code existe déjà dans le référentiel' });
      }
      ref.code = code.toUpperCase().trim();
    }

    if (type) ref.type = type;
    if (label !== undefined) ref.label = label;

    await ref.save();

    await logAction('ADD_REFERENTIEL', {
      userId: req.user._id,
      userRole: 'ADMINISTRATEUR',
      userEmail: req.user.email,
      details: `Modification code ${ref.type}: ${ref.code}`,
      ip: getClientIp(req),
    });

    return res.json({ status: 'success', referentiel: ref });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

// ─────────────────────────────────────────────────────────
//  SUPPRIMER UN CODE
// ─────────────────────────────────────────────────────────
exports.deleteCode = async (req, res) => {
  try {
    const ref = await Referentiel.findById(req.params.id);
    if (!ref) return res.status(404).json({ status: 'error', message: 'Code introuvable' });

    if (ref.utilise) {
      return res.status(400).json({
        status: 'error',
        message: 'Impossible de supprimer un code déjà utilisé lors d\'une inscription',
      });
    }

    await Referentiel.findByIdAndDelete(req.params.id);

    // Log
    await logAction('DELETE_REFERENTIEL', {
      userId: req.user._id,
      userRole: 'ADMINISTRATEUR',
      userEmail: req.user.email,
      details: `Suppression code ${ref.type}: ${ref.code}`,
      ip: getClientIp(req),
    });

    res.json({ status: 'success', message: 'Code supprimé' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ─────────────────────────────────────────────────────────
//  IMPORT EN MASSE
// ─────────────────────────────────────────────────────────
exports.importBulk = async (req, res) => {
  try {
    const { codes } = req.body;
    // codes = [{ type: 'ETUDIANT', code: 'MAT001', label: 'Ali Ben Ahmed' }, ...]

    if (!codes || !Array.isArray(codes) || codes.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Tableau de codes requis' });
    }

    let created = 0;
    let skipped = 0;

    for (const item of codes) {
      if (!item.type || !item.code) {
        skipped++;
        continue;
      }

      const existe = await Referentiel.findOne({ code: item.code.toUpperCase().trim() });
      if (existe) {
        skipped++;
        continue;
      }

      await Referentiel.create({
        type: item.type,
        code: item.code.toUpperCase().trim(),
        label: item.label || '',
      });
      created++;
    }

    // Log
    await logAction('ADD_REFERENTIEL', {
      userId: req.user._id,
      userRole: 'ADMINISTRATEUR',
      userEmail: req.user.email,
      details: `Import en masse: ${created} créés, ${skipped} ignorés`,
      ip: getClientIp(req),
    });

    res.json({
      status: 'success',
      message: `${created} code(s) importé(s), ${skipped} ignoré(s)`,
      created,
      skipped,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
