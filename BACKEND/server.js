// ═══════════════════════════════════════════════════════════
//  BACKEND/server.js — Version complète avec nouveaux modules
//  Seule la section "Routes" change par rapport à l'original
// ═══════════════════════════════════════════════════════════
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const seedReferentielIfEmpty = require('./utils/seedReferentiel');
const seedSujetsIfNeeded = require('./utils/seedSujets');

dotenv.config();

const app = express();
const server = http.createServer(app);

// ── Origines autorisées ───────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5175',
].filter(Boolean);

// ── Socket.IO ─────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Token manquant'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.role = decoded.role;
    next();
  } catch {
    next(new Error('Token invalide'));
  }
});

io.on('connection', (socket) => {
  socket.join(socket.userId);
  socket.on('disconnect', () => {});
});

app.set('io', io);

// ── Middlewares ───────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origine non autorisée: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Routes existantes ─────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/sujets', require('./routes/sujetRoutes'));
app.use('/api/projets', require('./routes/projetRoutes'));
app.use('/api/taches', require('./routes/tacheRoutes'));
app.use('/api/calendrier', require('./routes/calendrierRoutes'));
app.use('/api/messagerie', require('./routes/messagerieRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes')); // ← version mise à jour
app.use('/api/candidatures', require('./routes/candidatureRoutes'));
app.use('/api/etudiants', require('./routes/etudiantRoutes'));
app.use('/api/encadrants', require('./routes/encadrantRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/referentiels', require('./routes/referentielRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));

// ── ✅ NOUVELLES ROUTES ────────────────────────────────────
app.use('/api/evaluations', require('./routes/evaluationRoutes'));
app.use('/api/publications', require('./routes/publicationRoutes'));
app.use('/api/feedbacks', require('./routes/feedbackRoutes'));

// ── Erreurs ───────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Erreur:', err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Erreur interne' : err.message,
  });
});
app.use((req, res) => res.status(404).json({ status: 'error', message: 'Route introuvable' }));

// ── Démarrage ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
async function startServer() {
  await connectDB();
  await seedReferentielIfEmpty();
  await seedSujetsIfNeeded();
  server.listen(PORT, () => console.log(`🚀 Serveur démarré sur le port ${PORT}`));
}
startServer().catch((err) => {
  console.error('❌ Erreur démarrage:', err);
  process.exit(1);
});
