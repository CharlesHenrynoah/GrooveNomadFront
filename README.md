# 🎵 GrooveNomad - Web App Musicale

GrooveNomad est une **application web** moderne qui permet d’explorer, écouter et découvrir des musiques, festivals et artistes du monde entier.

---

## 🚀 Démarrage rapide

### 📦 Installation

Clonez le projet et installez les dépendances :

```bash
git clone git@github.com:CharlesHenrynoah/GrooveNomadFront.git
cd GrooveNomadFront
npm install
```

### ▶️ Lancer la Web App

```bash
# Lancer frontend et backend en parallèle
npm run dev
```

Cela démarre automatiquement :

- 🔵 **Backend** : `http://localhost:5000/api`
- 🟢 **Frontend** : `http://localhost:3001`

---

## 🌟 Fonctionnalités principales

- ✅ **Authentification** : Inscription, Connexion sécurisée avec JWT
- ✅ **Navigation intelligente** : Menu dynamique connecté/déconnecté
- ✅ **Responsive Design** : Adaptée PC, tablette, mobile
- ✅ **API intégrées** : Airtable, PostgreSQL Neon

---

## 📂 Structure du projet

```
GrooveNomadFront/
├── backend/        # API Express (serveur)
├── src/            # Code React (frontend)
├── public/         # Fichiers statiques
├── package.json    # Dépendances frontend
├── start-dev.sh    # Script de lancement local
```

---

## 🔗 URLs locales

- **Frontend** : `http://localhost:3001`
- **Backend API** : `http://localhost:5000/api`
- **Health Check** : `http://localhost:5000/api/health`

---

## 📐 Schéma d’Architecture

```mermaid
graph TD
  A[👩‍💻 Utilisateur] -->|Requêtes HTTP| B[🌐 Frontend (React)]
  B -->|API REST| C[🖥️ Backend (Node.js + Express)]
  C -->|Requêtes SQL| D[(🗄️ Base de données PostgreSQL Neon)]
  C -->|API externe| E[☁️ Airtable API]
```

---

## 🛠️ Technologies utilisées

- **Frontend** : React 18, React Router, Axios, Tailwind CSS
- **Backend** : Node.js, Express, PostgreSQL Neon, JWT, bcrypt
- **Autres** : Context API React, Airtable API

---

## 📖 Documentation associée

- [Guide Authentification](#)
- [Setup Airtable](#)
- [Mémoire contextuelle](#)

---

## ✨ Contribution

Les contributions sont les bienvenues :

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/ma-nouvelle-fonction`)
3. Commitez vos changements
4. Poussez la branche
5. Ouvrez une Pull Request

---

## 📜 Licence

Distribué sous licence MIT.
