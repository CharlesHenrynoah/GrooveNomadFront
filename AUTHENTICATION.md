# 🔐 Guide d'Authentification GrooveNomad

## 📋 Configuration

### Base de données Neon PostgreSQL

La table `utilisateurs` doit être créée avec cette structure :

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

## 🚀 Démarrage rapide

### Option 1 : Script automatique
```bash
./start-dev.sh
```

### Option 2 : Démarrage manuel
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
npm start
```

## 🌐 URLs

- **Frontend**: http://localhost:3001
- **Backend**: http://localhost:5000
- **Base de données**: Neon PostgreSQL

## 🔧 API Endpoints

### Authentication

- `POST /api/inscription` - Créer un compte
- `POST /api/connexion` - Se connecter
- `GET /api/utilisateur` - Informations utilisateur (protégé)

### Test

- `GET /api/health` - Santé du serveur
- `GET /api/test-db` - Test de connexion BDD

## 📊 Fonctionnalités

### ✅ Inscription
- Validation des données
- Hachage sécurisé des mots de passe (bcrypt)
- Token JWT généré automatiquement
- Redirection vers l'accueil après inscription

### ✅ Connexion
- Authentification email/mot de passe
- Token JWT stocké localement
- Mise à jour du dernier login en BDD
- Redirection vers l'accueil après connexion

### ✅ Navigation intelligente
- **Non connecté**: Affiche "SE CONNECTER"
- **Connecté**: Affiche "MON COMPTE" avec menu déroulant
- Menu utilisateur avec nom et bouton déconnexion

### ✅ Sécurité
- Tokens JWT avec expiration (24h)
- Mots de passe hachés avec bcrypt
- Headers d'authentification automatiques
- Validation côté serveur

## 🛠️ Technologies utilisées

### Frontend
- React 18
- React Router
- Axios (API calls)
- Context API (gestion d'état)
- React Icons

### Backend
- Node.js + Express
- PostgreSQL (pg)
- JWT (jsonwebtoken)
- bcrypt (hachage mots de passe)
- CORS

### Base de données
- Neon PostgreSQL (serverless)
- SSL/TLS sécurisé

## 📝 Notes importantes

1. **Tokens JWT** : Stockés dans localStorage, expiration 24h
2. **Mots de passe** : Hachés avec bcrypt (saltRounds: 10)
3. **Base de données** : Connexion SSL requise
4. **CORS** : Configuré pour http://localhost:3001

## 🔍 Test de l'authentification

1. **Créer un compte** : http://localhost:3001/inscription
2. **Se connecter** : http://localhost:3001/connexion
3. **Vérifier la navbar** : "MON COMPTE" doit apparaître
4. **Menu utilisateur** : Hover sur "MON COMPTE"
5. **Déconnexion** : Cliquer sur "Se déconnecter"

## 🐛 Dépannage

### Erreur de connexion BDD
- Vérifier les credentials Neon
- Tester avec `GET /api/test-db`

### Erreur CORS
- Vérifier que le frontend est sur port 3001
- Redémarrer le backend

### Token invalide
- Vider le localStorage
- Se reconnecter

## 📱 Responsive Design

L'interface est entièrement responsive :
- Mobile : < 480px
- Tablette : 480px - 768px
- Desktop : > 768px 