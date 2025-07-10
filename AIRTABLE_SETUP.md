# Configuration Airtable pour BloomNomad

## Configuration requise

### 1. Créer un fichier .env
Créez un fichier `.env` à la racine du projet avec le contenu suivant :

```env
REACT_APP_AIRTABLE_API_KEY=YOUR_SECRET_API_TOKEN
```

### 2. Obtenir votre clé API Airtable

1. Allez sur [https://airtable.com/create/tokens](https://airtable.com/create/tokens)
2. Créez un nouveau token d'accès personnel
3. Copiez le token généré
4. Remplacez `YOUR_SECRET_API_TOKEN` dans le fichier .env par votre vraie clé API

### 3. Configuration de la base

L'application est configurée pour fonctionner avec :
- **Base ID**: `appdJC3RsnMtbbMzf`
- **Table**: `Table 1`

### 4. Structure des champs

La table doit contenir les champs suivants :
- **Name** (Text): Nom de l'élément
- **Notes** (Long text): Notes détaillées
- **Status** (Single select): Statut avec options "Todo", "In progress", "Done"
- **Assignee** (Collaborator): Personne assignée
- **Attachments** (Attachment): Fichiers joints

## Fonctionnalités

### Lecture des données
- Affichage de tous les enregistrements de la table
- Filtrage et tri des données
- Affichage des pièces jointes

### Création d'enregistrements
- Formulaire pour ajouter de nouveaux éléments
- Validation des champs obligatoires
- Actualisation automatique après ajout

### Mise à jour
- Modification du statut directement depuis la liste
- Mise à jour en temps réel

### Suppression
- Bouton de suppression pour chaque enregistrement
- Confirmation avant suppression

## Sécurité

⚠️ **Important** : Ne jamais exposer votre clé API dans le code source public !

- Utilisez toujours des variables d'environnement
- Ajoutez `.env` à votre `.gitignore`
- Pour la production, utilisez les variables d'environnement de votre hébergeur

## Dépannage

### Erreur d'authentification
- Vérifiez que votre clé API est correcte
- Assurez-vous que le token a les permissions nécessaires

### Erreur de base ou table
- Vérifiez l'ID de la base (`appdJC3RsnMtbbMzf`)
- Assurez-vous que la table "Table 1" existe

### Limite de taux
- L'API Airtable est limitée à 5 requêtes par seconde
- L'application gère automatiquement ces limites 