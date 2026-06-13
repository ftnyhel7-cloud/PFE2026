import { useNavigate } from 'react-router-dom';

const TEAL = '#1a7a8a';
const YELLOW = '#F5C518';
const DARK = '#0d1f30';

const SECTIONS = [
  {
    num: '01',
    titre: 'Acceptation des conditions',
    contenu:
      "En accedant a la plateforme SmartPFE et en creant un compte, vous acceptez sans reserve les presentes Conditions Generales d'Utilisation (CGU). Ces conditions constituent un contrat juridiquement contraignant entre vous et SmartPFE University.\n\nSi vous etes mineur (moins de 18 ans), l'utilisation requiert l'autorisation de votre representant legal.\n\nNous nous reservons le droit de modifier ces conditions a tout moment. Les modifications entrent en vigueur 30 jours apres publication. L'utilisation continuee vaut acceptation.",
  },
  {
    num: '02',
    titre: 'Description du service',
    contenu:
      "SmartPFE est une plateforme numerique universitaire permettant :\n\nPour les etudiants :\n• Consultation et recherche de sujets PFE disponibles\n• Depot de candidatures avec CV et lettre de motivation\n• Suivi des candidatures en temps reel\n• Acces a un espace de travail collaboratif\n• Gestion du calendrier et des taches\n\nPour les encadrants :\n• Publication et gestion de sujets PFE\n• Examen et traitement des candidatures\n• Suivi de l'avancement des projets\n\nPour les administrateurs :\n• Supervision globale de la plateforme\n• Validation des sujets proposes\n• Gestion des affectations et utilisateurs",
  },
  {
    num: '03',
    titre: 'Creation et gestion du compte',
    contenu:
      'Eligibilite : Acces reserve aux etudiants inscrits, encadrants habilites et administrateurs designes.\n\nInformations exactes : Vous vous engagez a fournir des informations exactes, completes et a jour.\n\nConfidentialite des identifiants : Vous etes seul responsable de la confidentialite de votre mot de passe et des activites depuis votre compte.\n\nSignalement : Notifiez-nous de toute utilisation non autorisee a security@projectfinder.tn\n\nCompte unique : Un seul compte par utilisateur. La creation de comptes multiples est interdite.',
  },
  {
    num: '04',
    titre: 'Obligations des utilisateurs',
    contenu:
      "En utilisant la plateforme, vous vous engagez a :\n\n• Utiliser la plateforme uniquement a des fins academiques legitimes\n• Ne pas publier de contenu faux, trompeur ou offensant\n• Respecter la propriete intellectuelle\n• Ne pas tenter de contourner les mesures de securite\n• Respecter la vie privee des autres utilisateurs\n• Ne pas harceler ou intimider d'autres utilisateurs\n• Signaler tout contenu inapproprie\n\nVous etes seul responsable du contenu que vous publiez.",
  },
  {
    num: '05',
    titre: 'Propriete intellectuelle',
    contenu:
      "Droits de SmartPFE : La plateforme, son design, son code source, ses algorithmes (notamment l'IA de matching) sont la propriete exclusive de SmartPFE University, proteges par les lois sur la propriete intellectuelle.\n\nVos contenus : Vous conservez la propriete de vos contenus (CV, projets, messages). En les deposant, vous accordez a SmartPFE une licence limitee pour les utiliser dans le cadre du service.\n\nInterdictions : Il est interdit de copier, reproduire ou exploiter commercialement les elements de la plateforme sans autorisation ecrite prealable.",
  },
  {
    num: '06',
    titre: 'Sujets PFE et candidatures',
    contenu:
      "Exactitude des sujets : Les encadrants s'engagent a publier des sujets exacts et realisables.\n\nProcessus de candidature : Le depot d'une candidature ne garantit pas l'obtention du sujet. La decision finale appartient a l'encadrant.\n\nScore IA : Le score de compatibilite IA est indicatif et ne constitue pas une decision definitive.\n\nAuthenticite du CV : En deposant votre CV, vous certifiez que toutes les informations sont exactes. Tout document falsifie entraine la suspension immediate du compte.\n\nEngagement : Une fois accepte, l'etudiant s'engage a mener son PFE a terme avec serieux.",
  },
  {
    num: '07',
    titre: 'Limitation de responsabilite',
    contenu:
      "SmartPFE est fourni en l'etat. Nous ne garantissons pas :\n\n• La disponibilite continue et ininterrompue de la plateforme\n• L'adequation parfaite entre etudiants et encadrants\n• L'exactitude des informations publiees par les utilisateurs\n• L'absence totale de bugs ou d'erreurs techniques\n\nNotre responsabilite ne peut etre engagee pour les dommages indirects resultant de l'utilisation de la plateforme.",
  },
  {
    num: '08',
    titre: 'Suspension et resiliation',
    contenu:
      "Par l'utilisateur : Suppression du compte possible depuis Parametres > Zone dangereuse.\n\nPar SmartPFE : Nous pouvons suspendre ou supprimer tout compte en cas de :\n• Violation des presentes CGU\n• Comportement frauduleux ou abusif\n• Inactivite prolongee (plus de 2 ans)\n• Demande de l'administration universitaire\n\nConsequences : Vos donnees seront conservees selon les durees definies dans notre Politique de Confidentialite, puis supprimees.",
  },
  {
    num: '09',
    titre: 'Droit applicable',
    contenu:
      "Les presentes CGU sont regies par le droit tunisien. En cas de litige, les parties s'engagent a rechercher une solution amiable avant tout recours judiciaire.\n\nA defaut de resolution amiable, tout litige sera soumis aux tribunaux competents de Tunis.",
  },
  {
    num: '10',
    titre: 'Contact',
    contenu:
      'Pour toute question relative aux presentes CGU :\n\nEmail legal : legal@projectfinder.tn\nAdresse : SmartPFE University, Avenue Habib Bourguiba, 1000 Tunis, Tunisie\nTelephone : +216 71 000 000\n\nHoraires de support : Lundi au Vendredi, 8h00 - 17h00',
  },
];

export default function ConditionsUtilisation() {
  const navigate = useNavigate();

  return (
    <div
      className="conditions-page"
      style={{ minHeight: '100vh', background: '#f4f7fa', fontFamily: 'Poppins, sans-serif' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        .conditions-page, .conditions-page * { box-sizing: border-box; }
        .conditions-page .hexshape { clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%); }
        .conditions-page .scard { background: #fff; border-radius: 16px; padding: 1.75rem 2rem; margin-bottom: 1.25rem; box-shadow: 0 3px 14px rgba(0,0,0,.06); border: 1px solid #eee; transition: box-shadow .2s; }
        .conditions-page .scard:hover { box-shadow: 0 8px 28px rgba(0,0,0,.1); }
        .conditions-page .hex-pat { position: absolute; inset: 0; background-image: repeating-linear-gradient(60deg,rgba(255,255,255,.04) 0,rgba(255,255,255,.04) 1px,transparent 0,transparent 50%),repeating-linear-gradient(120deg,rgba(255,255,255,.04) 0,rgba(255,255,255,.04) 1px,transparent 0,transparent 50%); background-size: 40px 70px; pointer-events: none; }
        .conditions-page .back-btn { background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.22); color: #fff; padding: .5rem 1.2rem; border-radius: 8px; cursor: pointer; font-family: Poppins,sans-serif; font-size: .85rem; transition: background .2s; }
        .conditions-page .back-btn:hover { background: rgba(255,255,255,.2); }
        .conditions-page .nav-link-btn { border: none; padding: .65rem 1.4rem; border-radius: 10px; cursor: pointer; font-family: Poppins,sans-serif; font-size: .88rem; font-weight: 700; transition: all .25s; }
        .conditions-page .nav-link-btn:hover { transform: translateY(-1px); }
        .conditions-page .toc-item { display: flex; align-items: center; gap: .6rem; padding: .42rem .65rem; border-radius: 8px; background: #f8fafc; }
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
            📋
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
            Conditions <span style={{ color: YELLOW }}>d'Utilisation</span>
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
            Veuillez lire attentivement ces conditions avant d'utiliser la plateforme Project
            Finder. En vous inscrivant, vous acceptez ces termes.
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
              Version <strong style={{ color: YELLOW }}>3.0</strong>
            </span>
          </div>
        </div>
      </div>

      {/* CONTENU */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 2.5rem' }}>
        {/* Avertissement */}
        <div
          style={{
            background: 'rgba(245,197,24,.08)',
            border: '1px solid rgba(245,197,24,.25)',
            borderRadius: 14,
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start',
          }}
        >
          <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>⚠️</span>
          <p style={{ color: '#555', fontSize: '.88rem', lineHeight: 1.7 }}>
            Ces conditions regissent l'ensemble de votre utilisation de la plateforme. En creant un
            compte, vous reconnaissez avoir lu, compris et accepte ces conditions dans leur
            integralite.
          </p>
        </div>

        {/* Table des matieres */}
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: '1.75rem',
            marginBottom: '2rem',
            boxShadow: '0 3px 14px rgba(0,0,0,.06)',
            border: '1px solid #eee',
          }}
        >
          <h2 style={{ fontWeight: 700, color: DARK, fontSize: '1rem', marginBottom: '1.25rem' }}>
            Table des matieres
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem' }}>
            {SECTIONS.map((s) => (
              <div key={s.num} className="toc-item">
                <span style={{ color: TEAL, fontWeight: 700, fontSize: '.77rem', flexShrink: 0 }}>
                  {s.num}
                </span>
                <span style={{ color: '#555', fontSize: '.8rem', lineHeight: 1.3 }}>{s.titre}</span>
              </div>
            ))}
          </div>
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
                  background: YELLOW,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: DARK,
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

        {/* Footer */}
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
              Questions juridiques ?
            </p>
            <p style={{ color: 'rgba(255,255,255,.55)', fontSize: '.83rem' }}>
              legal@projectfinder.tn
            </p>
          </div>
          <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
            <button
              className="nav-link-btn"
              style={{ background: TEAL, color: '#fff' }}
              onClick={() => navigate('/politique-confidentialite')}
            >
              Politique de confidentialite →
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
