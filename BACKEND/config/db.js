const mongoose = require('mongoose');//c'est lui qui fait le lien entre Node.js et MongoDB

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connecté');
  } catch (err) {
    console.log('❌ Erreur :', err);
    process.exit(1);
  }
};

module.exports = connectDB;
