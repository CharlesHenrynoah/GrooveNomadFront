# 🧠 Mémoire Contextuelle et Chaîne de Thought - GrooveBot

## 🎯 Problème résolu

**AVANT :**
- Utilisateur : "as tu un festival a me proposer en france"
- Utilisateur : "Techno"
- Bot : Propose des festivals aux USA et en Allemagne ❌

**MAINTENANT :**
- Utilisateur : "as tu un festival a me proposer en france"
- Utilisateur : "Techno"
- Bot : Propose UNIQUEMENT des festivals techno en France ✅

## 🚀 Nouvelles fonctionnalités

### 1. **Mémoire Contextuelle**
Le bot se souvient maintenant de :
- **Budget** : "j'ai un budget de 100€"
- **Lieu** : "en France", "proche de Paris"
- **Genre** : "techno", "house", "électro"
- **Expérience** : "première fois", "débutant"
- **Période** : "en été", "juillet"

### 2. **Chaîne de Thought en 3 étapes**
1. **ANALYSER** : Comprendre la demande et le contexte
2. **FILTRER** : Sélectionner les festivals pertinents
3. **RÉPONDRE** : Donner une réponse personnalisée

### 3. **Filtrage intelligent**
- Filtre par **budget** : Ne propose que des festivals dans la fourchette de prix
- Filtre par **lieu** : Respecte la localisation demandée
- Filtre par **genre** : Reste focalisé sur le style musical
- Filtre par **période** : Prend en compte les dates

## 🧪 Exemples d'utilisation

### Conversation 1 : Budget
```
User: "j'ai un budget de 100 euros max"
Bot: [Stocke budget=100]

User: "trouve-moi un festival techno"
Bot: [Cherche festivals techno ≤100€] → Propose uniquement les festivals dans le budget
```

### Conversation 2 : Lieu
```
User: "as tu un festival a me proposer en france"
Bot: [Stocke lieu=france]

User: "Techno"
Bot: [Cherche festivals techno en France] → Propose uniquement des festivals français
```

### Conversation 3 : Combinaison
```
User: "festivals pas chers en France"
Bot: [Stocke lieu=france, budget=économique]

User: "électro underground"
Bot: [Ajoute genre=électro, style=underground] → Filtre selon tous les critères
```

## 🔍 Détection automatique

### Patterns de budget :
- "j'ai un budget de 150€"
- "budget maximum 200€"
- "pas plus de 100€"
- "moins de 80 euros"

### Patterns de lieu :
- "en France"
- "proche de Paris"
- "pas trop loin"
- "Europe du Nord"

### Patterns de genre :
- "techno", "house", "trance"
- "électro underground"
- "deep house minimal"

## 🎛️ Fonctionnalités techniques

### Analyse contextuelle :
```javascript
// Détecte automatiquement
const budgetMatch = message.match(/budget[^0-9]*(\d+)/i);
const lieuMatch = lieux.find(lieu => message.includes(lieu));
const genreMatch = genres.find(genre => message.includes(genre));
```

### Filtrage des résultats :
```javascript
// Applique les filtres
if (contextFilters.budget && minPrice > budget) return false;
if (contextFilters.lieu && !festivalLieu.includes(lieu)) return false;
if (contextFilters.genre && !festival.genre.includes(genre)) return false;
```

### Mémoire persistante :
```javascript
// Stocke dans le contexte
setChatContext(prev => ({
  userPreferences: newPreferences,
  conversationHistory: [...prev.conversationHistory, entry],
  lastFilters: newFilters
}));
```

## 📊 Logs de débogage

Dans la console, vous verrez :
```
🧠 Contexte utilisateur analysé: {budget: 100, lieu: 'france', genre: 'techno'}
🔍 Filtres appliqués: {budget: 100, lieu: 'france', genre: 'techno'}
📊 Résultats trouvés: 3 festivals
```

## 🎯 Tests recommandés

### Test 1 : Mémoire de budget
```
1. "j'ai un budget de 100 euros"
2. "trouve-moi un festival"
→ Doit proposer uniquement des festivals ≤100€
```

### Test 2 : Mémoire de lieu
```
1. "festivals en France"
2. "techno"
→ Doit proposer uniquement des festivals techno français
```

### Test 3 : Accumulation de contexte
```
1. "budget 150€"
2. "en France"
3. "techno underground"
→ Doit combiner tous les critères
```

## 🔧 Avantages

✅ **Conversations naturelles** : Plus besoin de répéter les critères
✅ **Filtrage intelligent** : Résultats pertinents selon le contexte
✅ **Mémoire persistante** : Se souvient des préférences
✅ **Chaîne de thought** : Raisonnement structuré
✅ **Logs détaillés** : Traçabilité des décisions

Votre GrooveBot est maintenant capable de conversations contextuelles intelligentes ! 🎵✨ 