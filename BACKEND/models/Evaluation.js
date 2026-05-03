const mongoose = require('mongoose');

const ficheSchema = new mongoose.Schema(
  {
    assiduite: { col: Number, pts: Number },
    motivation: { col: Number, pts: Number },
    adaptation: { col: Number, pts: Number },
    travail_grp: { col: Number, pts: Number },
    initiative: { col: Number, pts: Number },
    niv_sci: { col: Number, pts: Number },
    expression: { col: Number, pts: Number },
    glob: { col: Number, pts: Number },
  },
  { _id: false }
);

const EvaluationSchema = new mongoose.Schema(
  {
    idProjet: { type: mongoose.Schema.Types.ObjectId, ref: 'Projet', required: true },
    idEtudiant: { type: mongoose.Schema.Types.ObjectId, ref: 'Etudiant', required: true },
    idEncadrant: { type: mongoose.Schema.Types.ObjectId, ref: 'Encadrant', required: true },

    criteres: {
      travailRealise: { type: Number, min: 0, max: 5, default: 0 },
      qualiteTechnique: { type: Number, min: 0, max: 4, default: 0 },
      autonomie: { type: Number, min: 0, max: 3, default: 0 },
      respectDelais: { type: Number, min: 0, max: 3, default: 0 },
      qualiteRedaction: { type: Number, min: 0, max: 3, default: 0 },
      aptitudesRelationnelles: { type: Number, min: 0, max: 2, default: 0 },
    },

    fiche: { type: ficheSchema, default: null },
    totalFiche: { type: Number, default: 0 },
    typeSaisie: { type: String, enum: ['simple', 'fiche'], default: 'simple' },

    note: { type: Number, min: 0, max: 20 },
    mention: {
      type: String,
      enum: ['Excellent', 'Très Bien', 'Bien', 'Assez Bien', 'Passable', 'Insuffisant'],
    },
    observations: { type: String, default: '' },
    dateEvaluation: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ── Hook pre-save ─────────────────────────────────────────────
EvaluationSchema.pre('save', function (next) {
  try {
    const PCT = [0, 0.25, 0.5, 0.75, 1.0];
    const MAX_CRIT = {
      assiduite: 4,
      motivation: 4,
      adaptation: 4,
      travail_grp: 4,
      initiative: 4,
      niv_sci: 6,
      expression: 6,
      glob: 8,
    };
    const MAX_FICHE = 40;

    if (this.typeSaisie === 'fiche' && this.fiche) {
      let total = 0;
      for (const [key, max] of Object.entries(MAX_CRIT)) {
        const col = this.fiche[key]?.col;
        if (col !== null && col !== undefined) {
          const pts = Math.round(max * PCT[col]);
          this.fiche[key] = { col, pts };
          total += pts;
        }
      }
      this.totalFiche = total;
      this.note = parseFloat(((total / MAX_FICHE) * 20).toFixed(2));
    } else {
      const c = this.criteres || {};
      this.note =
        (c.travailRealise || 0) +
        (c.qualiteTechnique || 0) +
        (c.autonomie || 0) +
        (c.respectDelais || 0) +
        (c.qualiteRedaction || 0) +
        (c.aptitudesRelationnelles || 0);
    }

    const n = this.note || 0;
    if (n >= 18) this.mention = 'Excellent';
    else if (n >= 16) this.mention = 'Très Bien';
    else if (n >= 14) this.mention = 'Bien';
    else if (n >= 12) this.mention = 'Assez Bien';
    else if (n >= 10) this.mention = 'Passable';
    else this.mention = 'Insuffisant';

    next();
  } catch (err) {
    next(err);
  }
});

EvaluationSchema.index({ idProjet: 1, idEtudiant: 1 }, { unique: true });

module.exports = mongoose.model('Evaluation', EvaluationSchema);
