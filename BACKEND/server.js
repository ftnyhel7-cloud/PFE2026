const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// ── Routes ──
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/sujets', require('./routes/sujetRoutes'));
app.use('/api/projets', require('./routes/projetRoutes'));
app.use('/api/taches', require('./routes/tacheRoutes'));
app.use('/api/calendrier', require('./routes/calendrierRoutes'));
app.use('/api/messagerie', require('./routes/messagerieRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/candidatures', require('./routes/candidatureRoutes'));
app.use('/api/etudiants', require('./routes/etudiantRoutes'));
app.use('/api/encadrants', require('./routes/encadrantRoutes'));

app.listen(process.env.PORT || 5000, () => {
  console.log('🚀 Serveur démarré sur le port 5000');
});
