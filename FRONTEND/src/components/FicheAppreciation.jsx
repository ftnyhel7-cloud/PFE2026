import { useState } from 'react';
import API from '../api/axios';

const PCT = [0, 0.25, 0.5, 0.75, 1.0];
const COLS = ['Médiocre', 'Moyen', 'Assez Bien', 'Bien', 'Très Bien'];
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
const MAX_TOTAL = 40;

const CRITERES = [
  { section: 'Comportement professionnel' },
  { id: 'assiduite', label: 'Assiduité & sérieux', max: 4 },
  { id: 'motivation', label: 'Motivation', max: 4 },
  { id: 'adaptation', label: 'Adaptation', max: 4 },
  { id: 'travail_grp', label: 'Travail en groupe', max: 4 },
  { id: 'initiative', label: 'Effort personnel & initiative', max: 4 },
  { section: 'Compétences techniques' },
  { id: 'niv_sci', label: 'Niveau scientifique & technique', max: 6 },
  { section: 'Communication' },
  { id: 'expression', label: 'Expression & présentation', max: 6 },
  { section: 'Bilan global' },
  { id: 'glob', label: 'Appréciation globale', max: 8 },
];

const P = {
  green: '#1a3d2b',
  greenLight: '#2e7d52',
  greenBg: '#e6f4ed',
  border: 'rgba(0,0,0,.07)',
  text: '#1e293b',
  muted: '#94a3b8',
  soft: '#64748b',
  warning: '#c47c0a',
  warningBg: '#faeeda',
  danger: '#d03030',
  dangerBg: '#fcebeb',
};

function getMention(note) {
  if (note >= 18) return { label: 'Excellent', color: P.greenLight, bg: P.greenBg };
  if (note >= 16) return { label: 'Très Bien', color: P.greenLight, bg: P.greenBg };
  if (note >= 14) return { label: 'Bien', color: '#185fa5', bg: '#e6f0fa' };
  if (note >= 12) return { label: 'Assez Bien', color: P.warning, bg: P.warningBg };
  if (note >= 10) return { label: 'Passable', color: P.warning, bg: P.warningBg };
  return { label: 'Insuffisant', color: P.danger, bg: P.dangerBg };
}

export default function FicheAppreciation({ etudiantData, onSaved, onCancel }) {
  // etudiantData = un objet de mesEtudiants :
  // { etudiant: { _id, utilisateur: {prenom, nom} }, projet: { _id, titre } }

  const existingFiche = etudiantData?.evaluation?.fiche;

  const [scores, setScores] = useState(() => {
    if (!existingFiche) return {};
    const s = {};
    Object.entries(existingFiche).forEach(([k, v]) => {
      if (v?.col !== null && v?.col !== undefined) s[k] = v.col;
    });
    return s;
  });

  const [obs, setObs] = useState(etudiantData?.evaluation?.observations || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);

  const total = Object.entries(scores).reduce((s, [key, col]) => {
    if (col === undefined || col === null) return s;
    return s + Math.round((MAX_CRIT[key] || 0) * PCT[col]);
  }, 0);

  const note20 = parseFloat(((total / MAX_TOTAL) * 20).toFixed(1));
  const mention = getMention(note20);
  const filled = Object.values(scores).filter((v) => v !== undefined).length;
  const critCount = CRITERES.filter((c) => c.id).length;

  const toggle = (id, col) => setScores((p) => ({ ...p, [id]: p[id] === col ? undefined : col }));

  const handleSave = async () => {
    if (filled === 0) {
      setMsg('Veuillez remplir au moins un critère.');
      setIsError(true);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        idProjet: etudiantData.projet._id,
        ficheData: scores,
        observations: obs,
      };

      const existingId = etudiantData?.evaluation?._id;
      if (existingId) {
        await API.put(`/evaluations/${existingId}/fiche`, payload);
      } else {
        await API.post('/evaluations/fiche', payload);
      }

      setMsg("Fiche enregistrée. L'admin la verra automatiquement.");
      setIsError(false);
      setTimeout(() => {
        onSaved?.();
      }, 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || "Erreur lors de l'enregistrement.");
      setIsError(true);
    } finally {
      setSaving(false);
    }
  };

  const etudiantNom =
    `${etudiantData?.etudiant?.utilisateur?.prenom || ''} ${etudiantData?.etudiant?.utilisateur?.nom || ''}`.trim();
  const projetTitre = etudiantData?.projet?.titre || 'Projet non défini';

  return (
    <div style={{ fontFamily: 'Nunito, sans-serif', maxWidth: 760, margin: '0 auto' }}>
      {/* ── En-tête ── */}
      <div
        style={{
          background: P.green,
          borderRadius: 14,
          padding: '16px 20px',
          marginBottom: 14,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <p style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>{etudiantNom}</p>
          <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 12, marginTop: 2 }}>
            {projetTitre}
          </p>
          <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 11, marginTop: 2 }}>
            {filled}/{critCount} critères remplis
          </p>
        </div>
        <div
          style={{
            textAlign: 'center',
            background: 'rgba(255,255,255,.12)',
            borderRadius: 12,
            padding: '10px 18px',
            minWidth: 90,
          }}
        >
          <p style={{ color: '#fff', fontSize: 28, fontWeight: 800, lineHeight: 1 }}>
            {filled > 0 ? note20 : '—'}
          </p>
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 11 }}>/20</p>
          {filled > 0 && (
            <span
              style={{
                marginTop: 4,
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: 999,
                fontSize: 10,
                fontWeight: 700,
                background: mention.bg,
                color: mention.color,
              }}
            >
              {mention.label}
            </span>
          )}
        </div>
      </div>

      {/* ── Tableau ── */}
      <div
        style={{
          borderRadius: 12,
          overflow: 'hidden',
          border: `0.5px solid ${P.border}`,
          marginBottom: 12,
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: P.green }}>
              <th
                style={{
                  textAlign: 'left',
                  padding: '9px 16px',
                  color: 'rgba(255,255,255,.7)',
                  fontSize: 11,
                  fontWeight: 600,
                  width: '34%',
                }}
              >
                Critère
              </th>
              {COLS.map((c) => (
                <th
                  key={c}
                  style={{
                    textAlign: 'center',
                    padding: '9px 6px',
                    color: 'rgba(255,255,255,.7)',
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CRITERES.map((c, i) => {
              if (c.section)
                return (
                  <tr key={i}>
                    <td
                      colSpan={6}
                      style={{
                        background: '#f8fafc',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '.08em',
                        textTransform: 'uppercase',
                        color: '#94a3b8',
                        padding: '5px 16px',
                        borderBottom: `0.5px solid ${P.border}`,
                      }}
                    >
                      {c.section}
                    </td>
                  </tr>
                );
              return (
                <tr key={c.id} style={{ borderBottom: `0.5px solid #f1f5f9` }}>
                  <td
                    style={{ padding: '10px 16px', fontSize: 12, fontWeight: 600, color: P.text }}
                  >
                    {c.label}
                    <span style={{ color: P.muted, fontWeight: 400, fontSize: 10, marginLeft: 4 }}>
                      /{c.max}pts
                    </span>
                  </td>
                  {[0, 1, 2, 3, 4].map((col) => {
                    const isOn = scores[c.id] === col;
                    return (
                      <td
                        key={col}
                        style={{ textAlign: 'center', padding: '8px 4px', cursor: 'pointer' }}
                        onClick={() => toggle(c.id, col)}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 7,
                            margin: '0 auto',
                            border: isOn ? `2px solid ${P.green}` : `1.5px solid #e2e8f0`,
                            background: isOn ? P.green : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                            color: isOn ? '#fff' : 'transparent',
                            transition: 'all .12s',
                            cursor: 'pointer',
                          }}
                        >
                          ✕
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Observations ── */}
      <textarea
        value={obs}
        onChange={(e) => setObs(e.target.value)}
        placeholder="Observations (optionnel)…"
        rows={3}
        style={{
          width: '100%',
          border: `0.5px solid #e2e8f0`,
          borderRadius: 10,
          padding: '10px 14px',
          fontFamily: 'Nunito, sans-serif',
          fontSize: 13,
          color: P.text,
          background: '#f8fafc',
          resize: 'vertical',
          marginBottom: 12,
          outline: 'none',
        }}
      />

      {/* ── Message retour ── */}
      {msg && (
        <div
          style={{
            background: isError ? P.dangerBg : P.greenBg,
            color: isError ? P.danger : P.greenLight,
            border: `0.5px solid ${isError ? '#f5c6c6' : '#b2d8c5'}`,
            borderRadius: 9,
            padding: '9px 14px',
            fontSize: 13,
            fontWeight: 500,
            marginBottom: 12,
          }}
        >
          {msg}
        </div>
      )}

      {/* ── Actions ── */}
      <div style={{ display: 'flex', gap: 10 }}>
        {onCancel && (
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 10,
              border: `0.5px solid ${P.border}`,
              background: 'transparent',
              color: P.soft,
              fontFamily: 'Nunito, sans-serif',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Annuler
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            flex: 2,
            background: P.green,
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '10px',
            fontFamily: 'Nunito, sans-serif',
            fontSize: 13,
            fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Enregistrement…' : '✓ Enregistrer la fiche'}
        </button>
      </div>
    </div>
  );
}
