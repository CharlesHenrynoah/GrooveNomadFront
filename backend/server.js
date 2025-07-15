const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Augmenter la limite pour les images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configuration de la base de données
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Middleware d'authentification JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'Token d\'accès requis' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'votre_secret_jwt', (err, user) => {
    if (err) {
      console.log('JWT verification error:', err.message);
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};

// Routes existantes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Serveur actif' });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'OK', 
      message: 'Base de données connectée',
      timestamp: result.rows[0].now 
    });
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Erreur de connexion à la base de données' 
    });
  }
});

// Route d'inscription
app.post('/api/inscription', async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse } = req.body;

    // Validation des données
    if (!nom || !prenom || !email || !motDePasse) {
      return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
    }

    // Vérification de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email invalide' });
    }

    // Vérification de la force du mot de passe
    if (motDePasse.length < 8) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await pool.query(
      'SELECT * FROM utilisateurs WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }

    // Hacher le mot de passe
    const motDePasseHash = await bcrypt.hash(motDePasse, 10);

    // Insérer l'utilisateur
    const result = await pool.query(
      'INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe_hash, date_creation) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, nom, prenom, email, date_creation',
      [nom, prenom, email, motDePasseHash]
    );

    const user = result.rows[0];

    // Générer un token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'votre_secret_jwt',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Inscription réussie',
      token: token,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        dateCreation: user.date_creation
      }
    });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ error: 'Erreur serveur lors de l\'inscription' });
  }
});

// Route de connexion
app.post('/api/connexion', async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    if (!email || !motDePasse) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Trouver l'utilisateur
    const result = await pool.query(
      'SELECT * FROM utilisateurs WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const user = result.rows[0];

    // Vérifier le mot de passe
    const motDePasseValide = await bcrypt.compare(motDePasse, user.mot_de_passe_hash);

    if (!motDePasseValide) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Mettre à jour le dernier login
    await pool.query(
      'UPDATE utilisateurs SET dernier_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Générer un token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'votre_secret_jwt',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Connexion réussie',
      token: token,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        dateCreation: user.date_creation,
        dernierLogin: user.dernier_login,
        photo: user.photo
      }
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
  }
});

// Route pour récupérer les informations utilisateur
app.get('/api/utilisateur', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Extraire l'ID utilisateur du token JWT
    
    const result = await pool.query(
      'SELECT id, nom, prenom, email, date_creation, dernier_login, photo FROM utilisateurs WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      dateCreation: user.date_creation,
      dernierLogin: user.dernier_login,
      photo: user.photo
    });
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour mettre à jour la photo de profil
app.put('/api/utilisateur/photo', authenticateToken, async (req, res) => {
  try {
    const { photo } = req.body;
    const userId = req.user.id; // Extraire l'ID utilisateur du token JWT
    
    if (!photo) {
      return res.status(400).json({ error: 'Photo requise' });
    }

    // Vérifier que c'est bien une image en base64
    if (!photo.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Format d\'image invalide' });
    }

    // Mettre à jour la photo dans la base de données
    const result = await pool.query(
      'UPDATE utilisateurs SET photo = $1 WHERE id = $2 RETURNING photo',
      [photo, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({
      message: 'Photo de profil mise à jour avec succès',
      photo: result.rows[0].photo
    });
  } catch (error) {
    console.error('Erreur mise à jour photo:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour de la photo' });
  }
});

// Route pour supprimer la photo de profil
app.delete('/api/utilisateur/photo', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Extraire l'ID utilisateur du token JWT
    
    const result = await pool.query(
      'UPDATE utilisateurs SET photo = NULL WHERE id = $1 RETURNING id',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({
      message: 'Photo de profil supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression photo:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression de la photo' });
  }
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
