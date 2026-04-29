import { useNavigate } from 'react-router-dom';

const TEAL = '#1a7a8a';
const YELLOW = '#F5C518';
const DARK = '#0d1f30';

const SECTIONS = [
  {
    num: '01',
    titre: 'Responsable du traitement',
    contenu:
      "Project Finder est une plateforme universitaire de gestion des projets de fin d'etudes editee par Project Finder University, dont le siege est situe a Tunis, Tunisie. En tant que responsable de traitement, nous nous engageons a proteger la confidentialite et la securite de vos donnees personnelles conformement a la loi organique tunisienne n 2004-63 du 27 juillet 2004 portant sur la protection des donnees a caractere personnel.",
  },
  {
    num: '02',
    titre: 'Donnees collectees',
    contenu:
      "Nous collectons les categories de donnees suivantes :\n\n• Donnees d'identification : nom, prenom, adresse email, telephone\n• Donnees academiques : matricule, filiere, niveau, statut PFE\n• Donnees professionnelles (encadrants) : specialite, departement\n• Documents : CV (PDF/DOC), lettres de motivation, certifications\n• Donnees de connexion : adresse IP, navigateur, date et heure\n• Communications : messages internes, notifications recues",
  },
  {
    num: '03',
    titre: 'Finalites du traitement',
    contenu:
      'Vos donnees sont collectees pour les finalites suivantes :\n\n• Gestion des comptes utilisateurs et authentification securisee\n• Mise en relation etudiants et encadrants pour les PFE\n• Analyse automatisee des candidatures par intelligence artificielle\n• Gestion des processus de candidature, selection et affectation\n• Communication relative aux candidatures (acceptation, refus, entretien)\n• Gestion du calendrier des reunions et des taches\n• Amelioration continue de nos services\n• Etablissement de statistiques anonymisees',
  },
  {
    num: '04',
    titre: 'Base legale du traitement',
    contenu:
      "Le traitement de vos donnees repose sur les bases legales suivantes :\n\n• Execution d'un contrat : traitement necessaire a nos obligations contractuelles lors de la creation du compte\n• Consentement : pour les traitements optionnels (notifications, partage de profil)\n• Interet legitime : pour l'amelioration de nos services et la securite\n• Obligation legale : pour les traitements requis par la legislation applicable",
  },
  {
    num: '05',
    titre: 'Duree de conservation',
    contenu:
      "Nous conservons vos donnees pendant les durees suivantes :\n\n• Donnees de compte actif : pendant toute la duree d'utilisation\n• Donnees de candidature : 2 ans apres cloture du processus\n• CV et documents : 1 an apres le dernier depot\n• Journaux de connexion : 12 mois (obligations legales)\n• Donnees anonymisees statistiques : conservation indefinie\n\nA l'expiration de ces delais, vos donnees sont supprimees de maniere securisee.",
  },
  {
    num: '06',
    titre: 'Partage des donnees',
    contenu:
      "Nous ne vendons jamais vos donnees a des tiers. Partages possibles :\n\n• Encadrants : vos informations de profil et candidature\n• Prestataires techniques : hebergement, email, stockage cloud (sous contrats stricts)\n• Autorites competentes : si la loi l'exige\n\nTous nos sous-traitants sont soumis a des obligations contractuelles garantissant la protection de vos donnees.",
  },
  {
    num: '07',
    titre: 'Securite des donnees',
    contenu:
      'Mesures de securite implementees :\n\n• Chiffrement des mots de passe (algorithme bcrypt)\n• Connexions securisees via HTTPS\n• Authentification par tokens JWT securises\n• Acces aux donnees limite au personnel habilite\n• Sauvegardes regulieres et securisees\n• Surveillance des acces et detection des anomalies',
  },
  {
    num: '08',
    titre: 'Vos droits',
    contenu:
      "Vous disposez des droits suivants :\n\n• Droit d'acces : obtenir une copie de vos donnees\n• Droit de rectification : corriger des donnees inexactes\n• Droit a l'effacement : demander la suppression (sous conditions)\n• Droit a la portabilite : recevoir vos donnees dans un format lisible\n• Droit d'opposition : vous opposer a certains traitements\n• Droit de retrait du consentement : a tout moment\n\nContact : privacy@projectfinder.tn",
  },
  {
    num: '09',
    titre: 'Cookies et traceurs',
    contenu:
      "Notre plateforme utilise des cookies pour :\n\n• Cookies essentiels : maintenir votre session de connexion (obligatoires)\n• Cookies fonctionnels : memoriser vos preferences d'interface\n• Cookies analytiques : mesurer l'audience (avec votre consentement)\n\nVous pouvez gerer vos preferences via les parametres de votre navigateur.",
  },
  {
    num: '10',
    titre: 'Contact et reclamations',
    contenu:
      "Pour toute question relative a vos donnees personnelles :\n\nEmail : privacy@projectfinder.tn\nAdresse : Project Finder University, Avenue Habib Bourguiba, 1000 Tunis\nTelephone : +216 71 000 000\n\nEn cas de litige, vous pouvez saisir l'Instance Nationale de Protection des Donnees Personnelles (INPDP) de Tunisie.",
  },
];

export default function PolitiqueConfidentialite() {
  const navigate = useNavigate();

  return (
    <div
      className="politique-page"
      style={{ minHeight: '100vh', background: '#f4f7fa', fontFamily: 'Poppins, sans-serif' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        .politique-page, .politique-page * { box-sizing: border-box; }
        .politique-page .hexshape { clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%); }
        .politique-page .scard { background: #fff; border-radius: 16px; padding: 1.75rem 2rem; margin-bottom: 1.25rem; box-shadow: 0 3px 14px rgba(0,0,0,.06); border: 1px solid #eee; transition: box-shadow .2s; }
        .politique-page .scard:hover { box-shadow: 0 8px 28px rgba(0,0,0,.1); }
        .politique-page .hex-pat { position: absolute; inset: 0; background-image: repeating-linear-gradient(60deg,rgba(255,255,255,.04) 0,rgba(255,255,255,.04) 1px,transparent 0,transparent 50%),repeating-linear-gradient(120deg,rgba(255,255,255,.04) 0,rgba(255,255,255,.04) 1px,transparent 0,transparent 50%); background-size: 40px 70px; pointer-events: none; }
        .politique-page .back-btn { background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.22); color: #fff; padding: .5rem 1.2rem; border-radius: 8px; cursor: pointer; font-family: Poppins,sans-serif; font-size: .85rem; transition: background .2s; }
        .politique-page .back-btn:hover { background: rgba(255,255,255,.2); }
        .politique-page .nav-link-btn { border: none; padding: .65rem 1.4rem; border-radius: 10px; cursor: pointer; font-family: Poppins,sans-serif; font-size: .88rem; font-weight: 700; transition: all .25s; }
        .politique-page .nav-link-btn:hover { transform: translateY(-1px); }
      `}</style>

      {/* HEADER */}
      <div
        style={{
          background: `linear-gradient(135deg,${DARK} 0%,#1a3a5c 100%)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="hex-pat" />

        {/* Navbar */}
        <div
          style={{
            padding: '1rem 2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,.08)',
            position: 'relative',
          }}
        >
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '.75rem', cursor: 'pointer' }}
            onClick={() => navigate('/accueil')}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: YELLOW,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
              }}
            >
              🎓
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', lineHeight: 1 }}>
                Project
              </div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '.6rem',
                  color: YELLOW,
                  letterSpacing: '.15em',
                  textTransform: 'uppercase',
                }}
              >
                Finder
              </div>
            </div>
          </div>
          <button className="back-btn" onClick={() => navigate('/accueil')}>
            ← Retour a l'accueil
          </button>
        </div>

        {/* Hero */}
        <div
          style={{
            maxWidth: 860,
            margin: '0 auto',
            padding: '4rem 2.5rem 3.5rem',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <div
            className="hexshape"
            style={{
              width: 80,
              height: 80,
              background: YELLOW,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.2rem',
              margin: '0 auto 1.5rem',
            }}
          >
            🔒
          </div>
          <h1
            style={{
              fontWeight: 800,
              fontSize: 'clamp(1.8rem,4vw,2.8rem)',
              color: '#fff',
              marginBottom: '1rem',
              lineHeight: 1.2,
            }}
          >
            Politique de <span style={{ color: YELLOW }}>Confidentialite</span>
          </h1>
          <p
            style={{
              color: 'rgba(255,255,255,.72)',
              fontSize: '.97rem',
              lineHeight: 1.75,
              maxWidth: 600,
              margin: '0 auto 2rem',
            }}
          >
            Nous nous engageons a proteger vos donnees personnelles. Decouvrez comment nous
            collectons, utilisons et securisons vos informations.
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '1.5rem',
              background: 'rgba(255,255,255,.08)',
              border: '1px solid rgba(255,255,255,.14)',
              borderRadius: 12,
              padding: '.75rem 1.75rem',
            }}
          >
            <span style={{ color: 'rgba(255,255,255,.65)', fontSize: '.82rem' }}>
              Derniere mise a jour : <strong style={{ color: YELLOW }}>1 Janvier 2026</strong>
            </span>
            <span style={{ color: 'rgba(255,255,255,.25)' }}>|</span>
            <span style={{ color: 'rgba(255,255,255,.65)', fontSize: '.82rem' }}>
              Version <strong style={{ color: YELLOW }}>2.1</strong>
            </span>
          </div>
        </div>
      </div>

      {/* CONTENU */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 2.5rem' }}>
        {/* Alerte info */}
        <div
          style={{
            background: 'rgba(26,122,138,.07)',
            border: '1px solid rgba(26,122,138,.2)',
            borderRadius: 14,
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start',
          }}
        >
          <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>ℹ️</span>
          <p style={{ color: '#555', fontSize: '.88rem', lineHeight: 1.7 }}>
            En utilisant la plateforme Project Finder, vous acceptez les termes de cette politique.
            Elle s'applique a tous les utilisateurs : etudiants, encadrants et administrateurs.
          </p>
        </div>

        {/* Sections */}
        {SECTIONS.map((s) => (
          <div key={s.num} className="scard">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.1rem' }}>
              <div
                className="hexshape"
                style={{
                  width: 44,
                  height: 44,
                  background: TEAL,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '.8rem',
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {s.num}
              </div>
              <div style={{ flex: 1 }}>
                <h2
                  style={{ fontWeight: 700, color: DARK, fontSize: '1rem', marginBottom: '.9rem' }}
                >
                  {s.titre}
                </h2>
                <div
                  style={{
                    color: '#555',
                    fontSize: '.88rem',
                    lineHeight: 1.85,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {s.contenu}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Footer liens */}
        <div
          style={{
            marginTop: '2.5rem',
            padding: '2rem',
            background: DARK,
            borderRadius: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <p
              style={{ color: '#fff', fontWeight: 700, marginBottom: '.3rem', fontSize: '.95rem' }}
            >
              Des questions ?
            </p>
            <p style={{ color: 'rgba(255,255,255,.55)', fontSize: '.83rem' }}>
              privacy@projectfinder.tn
            </p>
          </div>
          <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
            <button
              className="nav-link-btn"
              style={{ background: YELLOW, color: DARK }}
              onClick={() => navigate('/conditions-utilisation')}
            >
              Conditions d'utilisation →
            </button>
            <button
              className="nav-link-btn"
              style={{
                background: 'rgba(255,255,255,.1)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,.2)',
              }}
              onClick={() => navigate('/accueil')}
            >
              Retour accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
