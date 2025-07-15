# 🎵 GrooveNomad - Application Musicale

## 🚀 Démarrage Rapide

### 🎯 Commande unique (Recommandée)
```bash
npm run dev
```
Cette commande lance **automatiquement** :
- 🔧 **Backend** sur le port 5000 (bleu)
- 🎨 **Frontend** sur le port 3001 (vert)

### 🔧 Commandes alternatives
```bash
# Lancer seulement le backend
npm run dev:backend

# Lancer seulement le frontend  
npm run dev:frontend

# Lancer le frontend normalement
npm start
```

## 🌐 URLs
- **Frontend** : http://localhost:3001
- **Backend** : http://localhost:5000/api
- **Test Backend** : http://localhost:5000/api/health

## 📋 Fonctionnalités

### ✅ Authentification complète
- **Inscription** avec validation
- **Connexion** sécurisée
- **Base de données** Neon PostgreSQL
- **JWT** tokens avec expiration 24h

### ✅ Navigation intelligente
- **Non connecté** : "SE CONNECTER"
- **Connecté** : "MON COMPTE" + menu déroulant

### ✅ Design moderne
- **Responsive** (Mobile, Tablette, Desktop)
- **Icônes SVG** authentiques
- **Glassmorphism** effects
- **Animations** fluides

## 🛠️ Technologies

### Frontend
- React 18
- React Router
- Axios
- React Icons
- CSS3 (Glassmorphism)

### Backend
- Node.js + Express
- PostgreSQL (Neon)
- JWT + bcrypt
- CORS

## 📊 Structure des dossiers
```
GrooveNomadFront/groove-nomad-front/
├── backend/           # API Backend
│   ├── server.js      # Serveur Express
│   └── package.json   # Dépendances backend
├── src/               # Code React
│   ├── components/    # Composants React
│   ├── context/       # Context API
│   └── ...
├── public/            # Fichiers statiques
└── package.json       # Config principale
```

## 🔐 Base de données

### Table utilisateurs
```sql
CREATE TABLE utilisateurs (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe_hash VARCHAR(255) NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dernier_login TIMESTAMP,
    status VARCHAR(20) DEFAULT 'actif'
);
```

## 🎯 Test de l'authentification

1. **Lancer l'app** : `npm run dev`
2. **Créer un compte** : http://localhost:3001/inscription
3. **Se connecter** : http://localhost:3001/connexion
4. **Vérifier** : La navbar affiche "MON COMPTE"

## 🐛 Dépannage

### Problèmes de démarrage
```bash
# Nettoyer les caches
npm run dev

# Si erreur de port
lsof -ti:3001 | xargs kill -9
lsof -ti:5000 | xargs kill -9
```

### Problèmes d'authentification
- Vérifier que le backend est démarré
- Tester l'API : http://localhost:5000/api/health
- Vider le localStorage et se reconnecter

## 📱 Responsive Design

- **Mobile** : < 480px
- **Tablette** : 480px - 768px  
- **Desktop** : > 768px

---

**🎵 GrooveNomad - Découvrez votre Musique, Explorez votre Monde**
