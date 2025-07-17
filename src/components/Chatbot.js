import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPaperPlane, FaRobot, FaUser, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import airtableService from '../services/airtableService';
import FestivalCard from './FestivalCard';
import './Chatbot.css';

const Chatbot = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Salut je suis GrooveBot votre assistant de recherches d'événement musical ! Que souhaitez vous savoir !",
      sender: 'bot',
      timestamp: new Date(),
      festivals: null
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [festivalsData, setFestivalsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatContext, setChatContext] = useState({
    userPreferences: {},
    conversationHistory: [],
    lastFilters: {}
  });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Charger les données Airtable au démarrage
  useEffect(() => {
    const loadFestivalsData = async () => {
      try {
        setIsLoading(true);
        const data = await airtableService.getFestivalsFromAirtable();
        setFestivalsData(data);
        console.log('📊 Données festivals chargées pour le chatbot:', data.length, 'festivals');
        
        // Ajouter un message une fois les données chargées
        if (data.length > 0) {
          const dataLoadedMessage = {
            id: Date.now(),
            text: `🎉 Parfait ! J'ai chargé ${data.length} festivals dans ma base de données. Je peux maintenant vous aider à trouver des informations précises !`,
            sender: 'bot',
            timestamp: new Date(),
            festivals: null
          };
          setMessages(prev => [...prev, dataLoadedMessage]);
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement des données pour le chatbot:', error);
        const errorMessage = {
          id: Date.now(),
          text: "⚠️ Je rencontre des difficultés pour charger les données des festivals. Vous pouvez quand même me poser des questions générales !",
          sender: 'bot',
          timestamp: new Date(),
          festivals: null
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFestivalsData();
  }, []);

  // Vérifier si la question est sur un sujet musical autorisé
  const isMusicalTopic = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Mots-clés musicaux directs
    const musicalKeywords = [
      'festival', 'concert', 'artiste', 'musicien', 'dj', 'musique', 'electronic', 'électro',
      'techno', 'house', 'trance', 'dubstep', 'rock', 'pop', 'jazz', 'hip-hop', 'rap',
      'lineup', 'scène', 'scene', 'événement', 'évènement', 'event', 'show', 'spectacle',
      'billet', 'ticket', 'prix', 'tarif', 'lieu', 'ville', 'pays', 'date', 'quand',
      'qui joue', 'qui chante', 'programmation', 'genre', 'style', 'sound', 'beat',
      'venue', 'stage', 'performance', 'live', 'set', 'mix', 'remix', 'album',
      'track', 'song', 'chanson', 'morceau', 'drop', 'bass', 'synth', 'vocal',
      'rave', 'club', 'boite', 'discothèque', 'dance', 'danse', 'beat', 'tempo',
      'ambiance', 'atmosphere', 'vibe', 'mood', 'énergie', 'energy'
    ];
    
    // Artistes musicaux connus (DJ, producteurs, artistes électroniques, etc.)
    const knownArtists = [
      'david guetta', 'martin garrix', 'armin van buuren', 'tiësto', 'calvin harris',
      'deadmau5', 'skrillex', 'diplo', 'avicii', 'swedish house mafia', 'above & beyond',
      'hardwell', 'afrojack', 'steve aoki', 'zedd', 'axwell', 'ingrosso', 'angello',
      'daft punk', 'justice', 'moderat', 'caribou', 'disclosure', 'flume', 'odesza',
      'porter robinson', 'madeon', 'rezz', 'fisher', 'chris lake', 'claude vonstroke',
      'adam beyer', 'charlotte de witte', 'amelie lens', 'boris brejcha', 'artbat',
      'tale of us', 'maceo plex', 'dixon', 'solomun', 'ben böhmer', 'nora en pure',
      'paul kalkbrenner', 'nina kraviz', 'peggy gou', 'patrick topping', 'camelphat',
      'fisher', 'john summit', 'vintage culture', 'meduza', 'fred again', 'four tet',
      'bicep', 'floating points', 'jamie xx', 'bonobo', 'tycho', 'emancipator',
      'pretty lights', 'griz', 'bassnectar', 'illenium', 'seven lions', 'said the sky',
      'marshmello', 'the chainsmokers', 'alan walker', 'kygo', 'don diablo',
      'oliver heldens', 'tchami', 'malaa', 'ac slater', 'destructo', 'brohug',
      'martin solveig', 'bob sinclar', 'cassius', 'modjo', 'stardust', 'mr. oizo',
      'cassius', 'superfunk', 'alex gopher', 'étienne de crécy', 'kavinsky'
    ];
    
    // Contextes liés aux festivals (même sans mots-clés directs)
    const festivalContexts = [
      'budget', 'pas cher', 'économique', 'abordable', 'gratuit', 'free',
      'recommande', 'conseil', 'suggestion', 'propose', 'trouve', 'cherche',
      'été', 'hiver', 'printemps', 'automne', 'juillet', 'août', 'juin',
      'weekend', 'vacances', 'sortie', 'sortir', 'aller', 'voir',
      'proche', 'près', 'loin', 'distance', 'transport', 'hébergement',
      'camping', 'hotel', 'logement', 'dormir', 'rester',
      'amis', 'groupe', 'solo', 'famille', 'couple', 'entre potes',
      'première fois', 'débutant', 'expérience', 'découvrir',
      'meilleur', 'top', 'excellent', 'incroyable', 'génial', 'cool',
      'atmosphère', 'ambiance', 'énergie', 'foule', 'public', 'crowd',
      'nourriture', 'boisson', 'restauration', 'bar', 'food truck',
      'sécurité', 'famille', 'enfant', 'age', 'restriction'
    ];
    
    // Patterns de questions contextuelles
    const contextualPatterns = [
      /j'ai un budget de \d+/,
      /budget maximum \d+/,
      /pas plus de \d+/,
      /moins de \d+ euro/,
      /trouve[z]? moi/,
      /recommande[z]? moi/,
      /conseil[le]?[z]? moi/,
      /qu'est-ce que tu/,
      /que me propose[z]?/,
      /j'aimerais aller/,
      /je veux voir/,
      /je cherche/,
      /où puis-je/,
      /comment faire pour/,
      /c'est quoi/,
      /parle[z]? moi de/,
      /infos? sur/,
      /détails? sur/
    ];
    
    // Vérifier les mots-clés directs
    const hasMusicalKeywords = musicalKeywords.some(keyword => lowerMessage.includes(keyword));
    
    // Vérifier le contexte festival
    const hasFestivalContext = festivalContexts.some(context => lowerMessage.includes(context));
    
    // Vérifier les patterns contextuels
    const hasContextualPattern = contextualPatterns.some(pattern => pattern.test(lowerMessage));
    
    // Vérifier si un artiste musical connu est mentionné
    const hasKnownArtist = knownArtists.some(artist => lowerMessage.includes(artist));
    
    // Questions générales sur les artistes/musique
    const generalMusicQuestions = [
      /qui est /,
      /c'est qui /,
      /connaissez.vous /,
      /connais.tu /,
      /parlez.moi de /,
      /parle.moi de /,
      /que penses.tu de /,
      /que pensez.vous de /,
      /infos sur /,
      /informations sur /
    ];
    
    const hasGeneralMusicQuestion = generalMusicQuestions.some(pattern => pattern.test(lowerMessage));
    
    // Dans un contexte de bot festival, si c'est une question contextuelle, on l'accepte
    if (hasContextualPattern && (hasFestivalContext || hasMusicalKeywords || hasKnownArtist)) {
      return true;
    }
    
    // Accepter si c'est une question générale sur un artiste connu
    if (hasGeneralMusicQuestion && hasKnownArtist) {
      return true;
    }
    
    // Accepter si on a des mots-clés musicaux, du contexte festival, ou un artiste connu
    return hasMusicalKeywords || hasFestivalContext || hasKnownArtist;
  };

  // Analyser et stocker le contexte utilisateur
  const analyzeUserContext = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    let newPreferences = {...chatContext.userPreferences};
    let newFilters = {...chatContext.lastFilters};
    
    // Analyser le budget
    const budgetMatch = lowerMessage.match(/budget[^0-9]*(\d+)/i) || 
                       lowerMessage.match(/(\d+)[^0-9]*euro/i) ||
                       lowerMessage.match(/moins de[^0-9]*(\d+)/i) ||
                       lowerMessage.match(/pas plus de[^0-9]*(\d+)/i);
    if (budgetMatch) {
      newPreferences.budget = parseInt(budgetMatch[1]);
      newFilters.budget = parseInt(budgetMatch[1]);
    }
    
    // Analyser le lieu
    const lieux = ['france', 'paris', 'lyon', 'marseille', 'toulouse', 'europe', 'allemagne', 'belgique', 'espagne', 'italie', 'pays-bas', 'amsterdam', 'berlin', 'londres'];
    const lieuMatch = lieux.find(lieu => lowerMessage.includes(lieu));
    if (lieuMatch) {
      newPreferences.lieu = lieuMatch;
      newFilters.lieu = lieuMatch;
    }
    
    // Analyser le genre
    const genres = ['techno', 'house', 'trance', 'hardstyle', 'drum and bass', 'dubstep', 'electronic', 'électro', 'underground', 'minimal', 'deep house'];
    const genreMatch = genres.find(genre => lowerMessage.includes(genre));
    if (genreMatch) {
      newPreferences.genre = genreMatch;
      newFilters.genre = genreMatch;
    }
    
    // Analyser l'expérience
    if (lowerMessage.includes('première fois') || lowerMessage.includes('débutant') || lowerMessage.includes('novice')) {
      newPreferences.experience = 'debutant';
    }
    
    // Analyser la période
    const periodes = ['été', 'hiver', 'printemps', 'automne', 'juillet', 'août', 'juin', 'septembre'];
    const periodeMatch = periodes.find(periode => lowerMessage.includes(periode));
    if (periodeMatch) {
      newPreferences.periode = periodeMatch;
      newFilters.periode = periodeMatch;
    }
    
    // Mettre à jour le contexte
    setChatContext(prev => ({
      ...prev,
      userPreferences: newPreferences,
      lastFilters: newFilters,
      conversationHistory: [...prev.conversationHistory, {
        message: userMessage,
        timestamp: new Date(),
        extractedInfo: { budget: newPreferences.budget, lieu: newPreferences.lieu, genre: newPreferences.genre }
      }].slice(-10) // Garder seulement les 10 derniers messages
    }));
    
    return { newPreferences, newFilters };
  };

  // Rechercher dans les données Airtable avec contexte
  const searchInFestivalsData = (query, contextFilters = {}) => {
    const searchTerm = query.toLowerCase();
    const results = [];

    festivalsData.forEach(festival => {
      let relevanceScore = 0;
      let matchedInfo = [];
      let passFilters = true;

      // Appliquer les filtres contextuels
      if (contextFilters.budget && festival.prix) {
        const minPrice = Math.min(...festival.prix.filter(p => p > 0));
        if (minPrice > contextFilters.budget) {
          passFilters = false;
        }
      }
      
      if (contextFilters.lieu) {
        const lieuFilter = contextFilters.lieu.toLowerCase();
        const festivalLieu = `${festival.ville} ${festival.pays}`.toLowerCase();
        if (!festivalLieu.includes(lieuFilter)) {
          passFilters = false;
        }
      }
      
      if (contextFilters.genre) {
        const genreFilter = contextFilters.genre.toLowerCase();
        if (!festival.genre?.toLowerCase().includes(genreFilter)) {
          passFilters = false;
        }
      }
      
      if (contextFilters.periode) {
        const periodeFilter = contextFilters.periode.toLowerCase();
        const festivalDates = `${festival.dateDebut} ${festival.dateFin}`.toLowerCase();
        if (!festivalDates.includes(periodeFilter)) {
          passFilters = false;
        }
      }

      if (!passFilters) return;

      // Recherche par nom de festival
      if (festival.nom?.toLowerCase().includes(searchTerm)) {
        relevanceScore += 10;
        matchedInfo.push(`Festival: ${festival.nom}`);
      }

      // Recherche par genre musical
      if (festival.genre?.toLowerCase().includes(searchTerm)) {
        relevanceScore += 8;
        matchedInfo.push(`Genre: ${festival.genre}`);
      }

      // Recherche par ville/pays
      if (festival.ville?.toLowerCase().includes(searchTerm) || 
          festival.pays?.toLowerCase().includes(searchTerm)) {
        relevanceScore += 6;
        matchedInfo.push(`Lieu: ${festival.ville}, ${festival.pays}`);
      }

      // Recherche dans le lineup
      const artisteMatch = festival.lineup?.find(artiste => 
        artiste.nom?.toLowerCase().includes(searchTerm)
      );
      if (artisteMatch) {
        relevanceScore += 9;
        matchedInfo.push(`Artiste: ${artisteMatch.nom}`);
      }

      // Recherche par date
      if (festival.dateDebut?.includes(searchTerm) || festival.dateFin?.includes(searchTerm)) {
        relevanceScore += 5;
        matchedInfo.push(`Date: ${festival.dateDebut} - ${festival.dateFin}`);
      }

      // Recherche dans la description
      if (festival.description?.toLowerCase().includes(searchTerm)) {
        relevanceScore += 3;
        matchedInfo.push(`Description trouvée`);
      }

      // Bonus pour les filtres contextuels appliqués
      if (contextFilters.budget && festival.prix) {
        const minPrice = Math.min(...festival.prix.filter(p => p > 0));
        if (minPrice <= contextFilters.budget) {
          relevanceScore += 5;
        }
      }

      if (relevanceScore > 0 || passFilters) {
        results.push({
          festival,
          score: relevanceScore,
          matchedInfo
        });
      }
    });

    // Trier par score de pertinence
    return results.sort((a, b) => b.score - a.score);
  };

  // Générer une réponse intelligente avec Gemini et chaîne de thought
  const generateGeminiResponse = async (userMessage) => {
    // Étape 1: Analyser le contexte utilisateur (avant le try-catch pour être accessible partout)
    const { newPreferences, newFilters } = analyzeUserContext(userMessage);
    
    try {
      // Clé API Gemini
      const GEMINI_API_KEY = 'AIzaSyB_lBRH0ja-p9-8Xzvzv8RfTU6z5QHKRWs';
      
      if (!GEMINI_API_KEY) {
        throw new Error('Clé API Gemini manquante');
      }
      
      // Étape 2: Rechercher avec le contexte
      const searchResults = searchInFestivalsData(userMessage, newFilters);
      
      // Étape 3: Préparer le contexte avec les données des festivals
      let contextData = "";
      
      if (searchResults.length > 0) {
        contextData = "FESTIVALS TROUVÉS:\n";
        
        // Prendre les 2 meilleurs résultats pour éviter un prompt trop long
        searchResults.slice(0, 2).forEach((result, index) => {
          const festival = result.festival;
          contextData += `${index + 1}. ${festival.nom}`;
          if (festival.genre) contextData += ` (${festival.genre})`;
          if (festival.ville && festival.pays) contextData += ` - ${festival.ville}, ${festival.pays}`;
          if (festival.dateDebut && festival.dateFin) contextData += ` - ${festival.dateDebut} au ${festival.dateFin}`;
          
          if (festival.lineup && festival.lineup.length > 0) {
            const artistes = festival.lineup.map(a => a.nom).filter(n => n).slice(0, 3);
            if (artistes.length > 0) contextData += ` - Artistes: ${artistes.join(', ')}`;
          }
          
          if (festival.prix && festival.prix.some(p => p > 0)) {
            const validPrices = festival.prix.filter(p => p > 0);
            contextData += ` - Prix: ${validPrices.join('-')}€`;
          }
          
          contextData += "\n";
        });
      } else {
        // Si pas de résultats spécifiques, donner un contexte général
        contextData = "FESTIVALS DISPONIBLES:\n";
        festivalsData.slice(0, 3).forEach((festival, index) => {
          contextData += `${index + 1}. ${festival.nom} (${festival.genre || 'Musique'}) - ${festival.ville || 'Lieu non spécifié'}\n`;
        });
        
        if (festivalsData.length > 3) {
          contextData += `... et ${festivalsData.length - 3} autres festivals.\n`;
        }
      }

      // Préparer l'historique de conversation
      const conversationHistory = chatContext.conversationHistory.slice(-3)
        .filter(entry => entry.message && entry.message.trim())
        .map(entry => 
          `Message: "${entry.message}" - Infos extraites: ${JSON.stringify(entry.extractedInfo)}`
        ).join('\n') || "Pas d'historique de conversation";

      // Préparer les préférences utilisateur
      const userPreferencesText = Object.keys(newPreferences).length > 0 
        ? `Préférences utilisateur: ${JSON.stringify(newPreferences)}` 
        : "Pas de préférences spécifiques détectées";
      
      // Construire le prompt pour Gemini avec chaîne de thought
      const prompt = `Tu es GrooveBot, assistant spécialisé dans les festivals de musique.

PROCESSUS INTERNE (NE PAS MONTRER À L'UTILISATEUR):
1. ANALYSER: Comprendre ce que l'utilisateur demande et son contexte
2. FILTRER: Sélectionner les festivals pertinents selon ses critères
3. RÉPONDRE: Donner une réponse personnalisée et conversationnelle

IMPORTANT: Ne montre JAMAIS ce processus à l'utilisateur. Réponds directement et naturellement.

MÉMOIRE CONTEXTUELLE:
${userPreferencesText}

HISTORIQUE DE CONVERSATION:
${conversationHistory}

DONNÉES DISPONIBLES:
${contextData}

RÈGLES IMPORTANTES:
- Utilise la mémoire contextuelle des conversations précédentes
- Réponds UNIQUEMENT sur les festivals, musique, artistes, événements musicaux
- Sois enthousiaste et conversationnel avec des emojis
- Réponds en français
- Comprends le contexte même sans mots-clés musicaux directs
- Tu peux répondre aux questions générales sur les artistes musicaux (biographie, style, collaborations, etc.)
- Relie toujours les artistes aux festivals où ils pourraient jouer

TYPES DE QUESTIONS QUE TU DOIS TRAITER:
1. BUDGET: "j'ai un budget de 100€", "pas cher", "économique", "gratuit"
2. RECHERCHE: "trouve-moi", "recommande", "conseil", "propose"
3. GENRE: "techno", "house", "électro", "rock", "jazz", "trance"
4. LIEU: "en France", "à Paris", "proche", "près de chez moi"
5. DATE: "en été", "juillet", "weekend", "vacances", "2024"
6. ARTISTE: "Martin Garrix", "qui joue", "lineup", "programmation"
7. QUESTIONS ARTISTES: "Qui est David Guetta?", "Parle-moi de Tiësto", "C'est qui Armin van Buuren?"
8. EXPÉRIENCE: "première fois", "débutant", "meilleur", "top"
9. PRATIQUE: "transport", "hébergement", "camping", "hotel"
10. AMBIANCE: "underground", "familial", "jeune", "crowd", "atmosphère"
11. INFOS: "c'est quoi", "parle-moi de", "détails", "informations"

INSTRUCTIONS SPÉCIALES:
- Si l'utilisateur a dit "France" précédemment, ne propose QUE des festivals en France
- Si l'utilisateur a donné un budget, respecte-le strictement
- Si l'utilisateur a précisé un genre, reste focalisé sur ce genre
- Utilise les informations des messages précédents pour affiner ta réponse
- Quand tu recommandes des festivals, les cartes visuelles s'afficheront automatiquement
- Fait référence aux cartes qui vont apparaître : "Voici les festivals que j'ai trouvés pour toi :" ou "Regarde ces festivals qui correspondent à tes critères :"

QUESTION ACTUELLE: "${userMessage}"

Utilise la chaîne de thought pour analyser, filtrer et répondre intelligemment.`;

      console.log('🔑 Clé API Gemini:', GEMINI_API_KEY ? 'Présente' : 'Manquante');
      console.log('🧠 Contexte utilisateur analysé:', newPreferences);
      console.log('🔍 Filtres appliqués:', newFilters);
      console.log('📊 Résultats trouvés:', searchResults.length, 'festivals');
      console.log('📝 Prompt envoyé à Gemini:', prompt.substring(0, 200) + '...');
      
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      };

      console.log('📤 Requête envoyée à Gemini:', JSON.stringify(requestBody, null, 2));

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Statut de la réponse Gemini:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Détails de l\'erreur Gemini:', errorText);
        throw new Error(`Erreur API Gemini: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return {
          text: data.candidates[0].content.parts[0].text,
          festivals: searchResults.length > 0 ? searchResults.slice(0, 3).map(r => r.festival) : null
        };
      } else {
        throw new Error('Réponse invalide de Gemini');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'appel à Gemini:', error);
      
      // Fallback vers la réponse basique si Gemini ne fonctionne pas
      const fallbackSearchResults = searchInFestivalsData(userMessage, newFilters);
      
      if (fallbackSearchResults.length > 0) {
        const topResult = fallbackSearchResults[0];
        const festival = topResult.festival;
        
        let response = `🎵 J'ai trouvé des informations sur **${festival.nom}** !\n\n`;
        
        if (festival.genre) response += `🎶 Genre: ${festival.genre}\n`;
        if (festival.ville && festival.pays) response += `📍 Lieu: ${festival.ville}, ${festival.pays}\n`;
        if (festival.dateDebut && festival.dateFin) response += `📅 Dates: ${festival.dateDebut} - ${festival.dateFin}\n`;
        
        if (festival.lineup && festival.lineup.length > 0) {
          response += `\n🎤 Lineup:\n`;
          festival.lineup.forEach(artiste => {
            if (artiste.nom) response += `• ${artiste.nom}\n`;
          });
        }
        
        return {
          text: response,
          festivals: fallbackSearchResults.slice(0, 3).map(r => r.festival)
        };
      } else {
        return {
          text: "Désolé, je rencontre des difficultés techniques. Pouvez-vous réessayer votre question ? 🤖",
          festivals: null
        };
      }
    }
  };

  // Réponses intelligentes avec Gemini
  const getBotResponse = async (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Vérifier si la question est sur un sujet musical autorisé
    if (!isMusicalTopic(message)) {
      return {
        text: "Désolé, je suis spécialisé uniquement dans les événements musicaux, festivals, artistes et styles musicaux. Pouvez-vous me poser une question sur ces sujets ? 🎵",
        festivals: null
      };
    }
    
    // Si les données ne sont pas encore chargées
    if (festivalsData.length === 0) {
      return {
        text: "Je charge encore les données des festivals... Veuillez patienter un moment ! ⏳",
        festivals: null
      };
    }
    
    // Utiliser Gemini pour générer une réponse intelligente
    try {
      const geminiResponse = await generateGeminiResponse(userMessage);
      return geminiResponse;
    } catch (error) {
      console.error('❌ Erreur lors de la génération de la réponse:', error);
      return {
        text: "Désolé, je rencontre des difficultés techniques. Pouvez-vous réessayer votre question ? 🤖",
        festivals: null
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Ajouter le message de l'utilisateur
    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInputValue = inputValue; // Sauvegarder la valeur
    setInputValue('');
    setIsTyping(true);

        try {
      // Appel asynchrone à Gemini
      const botResponse = await getBotResponse(currentInputValue);
      
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse.text,
        sender: 'bot',
        timestamp: new Date(),
        festivals: botResponse.festivals
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('❌ Erreur lors de la génération de la réponse:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: "Désolé, je rencontre des difficultés techniques. Pouvez-vous réessayer votre question ? 🤖",
        sender: 'bot',
        timestamp: new Date(),
        festivals: null
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const quickActions = [
    "Événements près de moi",
    "Genres musicaux",
    "Comment s'inscrire ?",
    "Tarifs des concerts"
  ];

  const handleQuickAction = (action) => {
    setInputValue(action);
  };

  return (
    <div className="chatbot-page">
      {/* Header */}
      <div className="chatbot-header">
        <Link to="/" className="back-btn">
          <FaArrowLeft /> Retour
        </Link>
        <div className="bot-info">
          <div className="bot-avatar">
            <img src="/teslabot.png" alt="GroovBot" className="bot-avatar-img" />
          </div>
          <div className="bot-details">
            <h1>GroovBot</h1>
            <span className="bot-status">En ligne</span>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="chat-container">
        <div className="messages-container">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.sender}`}>
              <div className="message-avatar">
                {message.sender === 'bot' ? (
                  <img src="/teslabot.png" alt="GroovBot" className="message-avatar-img" />
                ) : (
                  user && user.photo ? (
                    <img src={user.photo} alt="Photo de profil" className="message-avatar-img" />
                  ) : (
                    <FaUser />
                  )
                )}
              </div>
              <div className="message-content">
                <div className="message-bubble">
                  {message.text}
                </div>
                
                {/* Affichage des cartes de festivals */}
                {message.festivals && message.festivals.length > 0 && (
                  <div className="festivals-cards-container">
                    {message.festivals.map((festival, index) => (
                      <FestivalCard 
                        key={festival.id || index} 
                        festival={festival} 
                        compact={true}
                      />
                    ))}
                  </div>
                )}
                
                <div className="message-time">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message bot">
              <div className="message-avatar">
                <img src="/teslabot.png" alt="GroovBot" className="message-avatar-img" />
              </div>
              <div className="message-content">
                <div className="message-bubble typing">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Actions rapides */}
        <div className="quick-actions">
          {quickActions.map((action, index) => (
            <button 
              key={index}
              className="quick-action-btn"
              onClick={() => handleQuickAction(action)}
            >
              {action}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="message-form">
          <div className="input-container">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Tapez votre message..."
              className="message-input"
              disabled={isTyping}
            />
            <button 
              type="submit" 
              className="send-btn"
              disabled={!inputValue.trim() || isTyping}
            >
              <FaPaperPlane />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chatbot; 