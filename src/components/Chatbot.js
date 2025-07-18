import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaPaperPlane, FaRobot, FaUser, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import airtableService from '../services/airtableService';
import FestivalCard from './FestivalCard';
import './Chatbot.css';

const Chatbot = () => {
  const { user } = useAuth();
  const location = useLocation();
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
        
        // Ajouter un message une fois les données chargées SEULEMENT s'il n'y a pas de message initial
        if (data.length > 0 && !location.state?.initialMessage) {
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
  }, [location.state]);

  // Gérer le message initial depuis la page d'accueil
  useEffect(() => {
    if (location.state?.initialMessage && festivalsData.length > 0) {
      const initialMessage = location.state.initialMessage;
      console.log('📩 Message initial reçu depuis la page d\'accueil:', initialMessage);
      
      // Ajouter le message de chargement des données d'abord
      const dataLoadedMessage = {
        id: Date.now(),
        text: `🎉 Parfait ! J'ai chargé ${festivalsData.length} festivals dans ma base de données. Je peux maintenant vous aider à trouver des informations précises !`,
        sender: 'bot',
        timestamp: new Date(),
        festivals: null
      };
      
      // Ajouter le message de l'utilisateur
      const userMessage = {
        id: Date.now() + 1,
        text: initialMessage,
        sender: 'user',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, dataLoadedMessage, userMessage]);
      setIsTyping(true);
      
      // Traiter le message automatiquement
      setTimeout(async () => {
        try {
          const botResponse = await getBotResponse(initialMessage);
          
          const typingDuration = Math.min(Math.max(botResponse.text.length * 20, 1500), 4000);
          
          setTimeout(() => {
            const botMessage = {
              id: Date.now() + 1,
              text: botResponse.text,
              sender: 'bot',
              timestamp: new Date(),
              festivals: botResponse.festivals
            };
            
            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
          }, typingDuration);
          
        } catch (error) {
          console.error('❌ Erreur lors du traitement du message initial:', error);
          
          setTimeout(() => {
            const errorMessage = {
              id: Date.now() + 1,
              text: "Désolé, je rencontre des difficultés techniques. Pouvez-vous réessayer votre question ? 🤖",
              sender: 'bot',
              timestamp: new Date(),
              festivals: null
            };
            
            setMessages(prev => [...prev, errorMessage]);
            setIsTyping(false);
          }, 1500);
        }
      }, 500);
      
      // Nettoyer le state pour éviter de retraiter le message
      window.history.replaceState({}, document.title);
    }
  }, [location.state, festivalsData]);

  // Vérifier si la question est sur un sujet musical autorisé
  const isMusicalTopic = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Si c'est une conversation continue (questions courtes), accepter plus facilement
    const conversationContinuers = [
      'donne les moi', 'donne moi', 'montre les moi', 'montre moi', 'affiche les',
      'liste les', 'présente les', 'dis moi', 'raconte moi', 'explique moi',
      'oui', 'non', 'ok', 'merci', 'parfait', 'génial', 'cool', 'super',
      'et', 'aussi', 'encore', 'plus', 'autre', 'autres', 'différent',
      'lesquels', 'lesquelles', 'combien', 'comment', 'pourquoi', 'quand', 'où',
      'peux tu', 'peux-tu', 'pourrais tu', 'pourrais-tu', 'aurais tu', 'aurais-tu'
    ];
    
    // Vérifier si c'est une continuation de conversation
    const isContinuation = conversationContinuers.some(continuer => 
      lowerMessage.includes(continuer) || lowerMessage === continuer
    );
    
    // Si c'est une continuation ET qu'on a déjà parlé de festivals, accepter
    if (isContinuation && chatContext.conversationHistory.length > 0) {
      const hasRecentFestivalContext = chatContext.conversationHistory.slice(-3).some(entry => 
        entry.message && (
          entry.message.toLowerCase().includes('festival') ||
          entry.message.toLowerCase().includes('house') ||
          entry.message.toLowerCase().includes('techno') ||
          entry.message.toLowerCase().includes('concert') ||
          entry.message.toLowerCase().includes('musique') ||
          entry.extractedInfo?.genre
        )
      );
      
      if (hasRecentFestivalContext) {
        return true;
      }
    }
    
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

  // AGENT 1: Agent Critères - Analyse les critères de recherche
  const agentCriteres = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    let newPreferences = {...chatContext.userPreferences};
    let newFilters = {...chatContext.lastFilters};
    
    console.log('🎯 AGENT CRITÈRES activé:', userMessage);
    
    const criteres = {
      budget: null,
      lieu: null,
      genre: null,
      artiste: null,
      atmosphere: null,
      capacite: null,
      duree: null,
      hebergement: null,
      periode: null,
      experience: null,
      confidence: 0
    };
    
    // Analyser le budget avec patterns avancés
    const budgetPatterns = [
      /budget[^0-9]*(\d+)/i,
      /(\d+)[^0-9]*euro/i,
      /moins de[^0-9]*(\d+)/i,
      /pas plus de[^0-9]*(\d+)/i,
      /maximum[^0-9]*(\d+)/i,
      /max[^0-9]*(\d+)/i,
      /jusqu'à[^0-9]*(\d+)/i,
      /(\d+)[^0-9]*€/i
    ];
    
    for (const pattern of budgetPatterns) {
      const match = lowerMessage.match(pattern);
      if (match) {
        criteres.budget = parseInt(match[1]);
        newPreferences.budget = criteres.budget;
        newFilters.budget = criteres.budget;
        criteres.confidence += 20;
        console.log('💰 Budget détecté:', criteres.budget);
        break;
      }
    }
    
    // Détecter la suppression du budget
    if (lowerMessage.includes('pas forcement') || lowerMessage.includes('n\'importe quel prix') || 
        lowerMessage.includes('sans limite') || lowerMessage.includes('peu importe le prix')) {
      delete newPreferences.budget;
      delete newFilters.budget;
      criteres.budget = null;
      console.log('💸 Budget supprimé (pas de limite)');
    }
    
    // Analyser le lieu avec mapping étendu
    const lieuMappings = {
      'allemagne': 'Germany',
      'germany': 'Germany',
      'deutschland': 'Germany',
      'france': 'France',
      'belgique': 'Belgium',
      'belgium': 'Belgium',
      'pays-bas': 'Netherlands',
      'netherlands': 'Netherlands',
      'hollande': 'Netherlands',
      'espagne': 'Spain',
      'spain': 'Spain',
      'italie': 'Italy',
      'italy': 'Italy',
      'portugal': 'Portugal',
      'canada': 'Canada',
      'usa': 'USA',
      'états-unis': 'USA',
      'etats-unis': 'USA',
      'united states': 'USA',
      'royaume-uni': 'UK',
      'uk': 'UK',
      'angleterre': 'UK',
      'suisse': 'Switzerland',
      'switzerland': 'Switzerland',
      'australie': 'Australia',
      'australia': 'Australia',
      'croatie': 'Croatia',
      'croatia': 'Croatia',
      'hongrie': 'Hungary',
      'hungary': 'Hungary',
      'serbie': 'Serbia',
      'serbia': 'Serbia',
      'vietnam': 'Vietnam',
      'thailande': 'Thailand',
      'thailand': 'Thailand',
      'inde': 'India',
      'india': 'India',
      'islande': 'Iceland',
      'iceland': 'Iceland'
    };
    
    for (const [key, value] of Object.entries(lieuMappings)) {
      if (lowerMessage.includes(key)) {
        criteres.lieu = value;
        newPreferences.lieu = value;
        newFilters.lieu = value;
        criteres.confidence += 25;
        console.log('🌍 Lieu détecté:', value);
        break;
      }
    }
    
    // Analyser le genre avec mapping étendu
    const genreMappings = {
      'house': 'House',
      'techno': 'Techno',
      'trance': 'Trance',
      'hardstyle': 'Hardstyle',
      'edm': 'EDM',
      'psytrance': 'Psytrance',
      'drum and bass': 'Drum',
      'dubstep': 'Dubstep',
      'electronic': 'Electronic',
      'électro': 'Electronic',
      'progressive': 'Progressive',
      'minimal': 'Minimal',
      'deep house': 'House',
      'tech house': 'House',
      'tribal': 'Tribal',
      'ambient': 'Ambient',
      'breakbeat': 'Breakbeat'
    };
    
    for (const [key, value] of Object.entries(genreMappings)) {
      if (lowerMessage.includes(key)) {
        criteres.genre = value;
        newPreferences.genre = value;
        newFilters.genre = value;
        criteres.confidence += 20;
        console.log('🎵 Genre détecté:', value);
        break;
      }
    }
    
    // Analyser l'artiste
    const artistPatterns = [
      /qui joue/,
      /lineup/,
      /programmation/,
      /artiste/,
      /dj/
    ];
    
    if (artistPatterns.some(pattern => pattern.test(lowerMessage))) {
      criteres.artiste = lowerMessage;
      criteres.confidence += 15;
      console.log('🎤 Recherche d\'artiste détectée');
    }
    
    // Analyser l'atmosphère
    const atmosphereKeywords = {
      'intime': 'One-stage intimate',
      'intimate': 'One-stage intimate',
      'familial': 'Family-friendly',
      'underground': 'Underground',
      'commercial': 'Commercial',
      'desert': 'Desert gathering',
      'désert': 'Desert gathering',
      'forêt': 'Forest rave',
      'forest': 'Forest rave',
      'plage': 'Beach',
      'beach': 'Beach',
      'multi-scene': 'Multi-stage',
      'multi-scène': 'Multi-stage'
    };
    
    for (const [key, value] of Object.entries(atmosphereKeywords)) {
      if (lowerMessage.includes(key)) {
        criteres.atmosphere = value;
        criteres.confidence += 12;
        console.log('🌟 Atmosphère détectée:', value);
        break;
      }
    }
    
    // Analyser la capacité
    const capacityPatterns = [
      /petit[^0-9]*(\d+)/i,
      /grand[^0-9]*(\d+)/i,
      /(\d+)[^0-9]*personnes/i,
      /capacité[^0-9]*(\d+)/i
    ];
    
    for (const pattern of capacityPatterns) {
      const match = lowerMessage.match(pattern);
      if (match) {
        criteres.capacite = parseInt(match[1]);
        criteres.confidence += 10;
        console.log('👥 Capacité détectée:', criteres.capacite);
        break;
      }
    }
    
    // Analyser l'hébergement
    const accommodationKeywords = {
      'camping': 'Camping',
      'hotel': 'Hotel',
      'hôtel': 'Hotel',
      'glamping': 'Glamping',
      'bungalow': 'Bungalow',
      'airbnb': 'Airbnb',
      'auberge': 'Hostel',
      'hostel': 'Hostel'
    };
    
    for (const [key, value] of Object.entries(accommodationKeywords)) {
      if (lowerMessage.includes(key)) {
        criteres.hebergement = value;
        criteres.confidence += 8;
        console.log('🏨 Hébergement détecté:', value);
        break;
      }
    }
    
    // Analyser l'expérience
    if (lowerMessage.includes('première fois') || lowerMessage.includes('débutant') || lowerMessage.includes('novice')) {
      criteres.experience = 'debutant';
      criteres.confidence += 5;
      console.log('👶 Expérience: débutant');
    }
    
    // Analyser la période
    const periodes = ['été', 'hiver', 'printemps', 'automne', 'juillet', 'août', 'juin', 'septembre'];
    const periodeMatch = periodes.find(periode => lowerMessage.includes(periode));
    if (periodeMatch) {
      criteres.periode = periodeMatch;
      newPreferences.periode = periodeMatch;
      newFilters.periode = periodeMatch;
      criteres.confidence += 10;
      console.log('📅 Période détectée:', periodeMatch);
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
      }].slice(-10)
    }));
    
    console.log('🎯 AGENT CRITÈRES - Résultat:', { criteres, confidence: criteres.confidence });
    
    return { criteres, newPreferences, newFilters };
  };

  // AGENT 2: Agent Données - Recherche dans la base de données Airtable
  const agentDonnees = (query, criteres, contextFilters = {}) => {
    const searchTerm = query.toLowerCase();
    const results = [];

    console.log('🔍 AGENT DONNÉES activé:', {
      query: searchTerm,
      criteres: criteres,
      filters: contextFilters,
      totalFestivals: festivalsData.length
    });

    // Utiliser les critères détectés par l'Agent Critères
    const detectedCriteria = {
      country: criteres.lieu || contextFilters.lieu,
      genre: criteres.genre || contextFilters.genre,
      budget: criteres.budget || contextFilters.budget,
      artist: criteres.artiste,
      atmosphere: criteres.atmosphere,
      capacity: criteres.capacite,
      accommodation: criteres.hebergement,
      duration: criteres.duree,
      month: criteres.periode || contextFilters.periode
    };

    console.log('🔍 AGENT DONNÉES - Critères reçus:', detectedCriteria);

    // Filtrer les festivals selon TOUS les critères détectés ET les filtres contextuels
    festivalsData.forEach(festival => {
      let relevanceScore = 0;
      let matchedInfo = [];
      let passFilters = true;

      // FILTRE PAYS (priorité haute - exclusif)
      const targetCountry = detectedCriteria.country || contextFilters.lieu;
      if (targetCountry) {
        const festivalCountry = festival.pays;
        if (festivalCountry !== targetCountry) {
          passFilters = false;
          console.log(`❌ Festival ${festival.nom} exclu: pays ${festivalCountry} !== ${targetCountry}`);
        } else {
          relevanceScore += 25; // Score élevé pour correspondance pays
          matchedInfo.push(`Pays: ${festivalCountry}`);
          console.log(`✅ Festival ${festival.nom} inclus: pays ${festivalCountry}`);
        }
      }

      // FILTRE GENRE (priorité haute)
      const targetGenre = detectedCriteria.genre || contextFilters.genre;
      if (targetGenre && festival.genre) {
        if (festival.genre.toLowerCase().includes(targetGenre.toLowerCase())) {
          relevanceScore += 20;
          matchedInfo.push(`Genre: ${festival.genre}`);
          console.log(`🎵 Genre correspondant: ${festival.genre}`);
        } else {
          // Pénalité pour genre non correspondant
          relevanceScore -= 10;
        }
      }

      // FILTRE BUDGET (priorité moyenne)
      const targetBudget = detectedCriteria.budget || contextFilters.budget;
      if (targetBudget && festival.prix && festival.prix.length > 0) {
        const validPrices = festival.prix.filter(p => p > 0);
        if (validPrices.length > 0) {
          const minPrice = Math.min(...validPrices);
          const maxPrice = Math.max(...validPrices);
          
          if (minPrice <= targetBudget) {
            relevanceScore += 15;
            matchedInfo.push(`Prix accessible: ${minPrice}€ <= ${targetBudget}€`);
            console.log(`💰 Prix accessible: ${minPrice}€ pour budget ${targetBudget}€`);
          } else {
            // Pénalité pour prix trop élevé
            relevanceScore -= 8;
            console.log(`💸 Prix trop élevé: ${minPrice}€ > ${targetBudget}€`);
          }
        }
      }

      // FILTRE ARTISTE (recherche dans le lineup)
      if (detectedCriteria.artist && festival.lineup && festival.lineup.length > 0) {
        const artistFound = festival.lineup.some(artiste => 
          artiste.nom && artiste.nom.toLowerCase().includes(searchTerm)
        );
        if (artistFound) {
          relevanceScore += 18;
          matchedInfo.push(`Artiste trouvé dans le lineup`);
          console.log(`🎤 Artiste trouvé dans le lineup de ${festival.nom}`);
        }
      }

      // FILTRE ATMOSPHÈRE/AMBIANCE
      if (detectedCriteria.atmosphere && festival.typeEvenement) {
        if (festival.typeEvenement.toLowerCase().includes(detectedCriteria.atmosphere.toLowerCase())) {
          relevanceScore += 12;
          matchedInfo.push(`Atmosphère: ${festival.typeEvenement}`);
          console.log(`🌟 Atmosphère correspondante: ${festival.typeEvenement}`);
        }
      }

      // FILTRE CAPACITÉ
      if (detectedCriteria.capacity && festival.capacite) {
        const festivalCapacity = parseInt(festival.capacite);
        if (festivalCapacity && festivalCapacity >= detectedCriteria.capacity) {
          relevanceScore += 8;
          matchedInfo.push(`Capacité: ${festivalCapacity} personnes`);
          console.log(`👥 Capacité suffisante: ${festivalCapacity} >= ${detectedCriteria.capacity}`);
        }
      }

      // FILTRE HÉBERGEMENT
      if (detectedCriteria.accommodation && festival.hebergement) {
        const accommodationMatch = festival.hebergement.some(h => 
          h.toLowerCase().includes(detectedCriteria.accommodation.toLowerCase())
        );
        if (accommodationMatch) {
          relevanceScore += 10;
          matchedInfo.push(`Hébergement disponible: ${detectedCriteria.accommodation}`);
          console.log(`🏨 Hébergement correspondant trouvé`);
        }
      }

      // FILTRE DURÉE
      if (detectedCriteria.duration && festival.duree) {
        const festivalDuration = parseInt(festival.duree);
        if (festivalDuration && Math.abs(festivalDuration - detectedCriteria.duration) <= 1) {
          relevanceScore += 6;
          matchedInfo.push(`Durée: ${festivalDuration} jours`);
          console.log(`⏱️ Durée correspondante: ${festivalDuration} jours`);
        }
      }

      // RECHERCHE TEXTUELLE AVANCÉE dans tous les champs
      if (!targetCountry && !targetGenre && !targetBudget && !detectedCriteria.artist) {
        // Recherche par nom de festival
        if (festival.nom?.toLowerCase().includes(searchTerm)) {
          relevanceScore += 15;
          matchedInfo.push(`Festival: ${festival.nom}`);
        }

        // Recherche par ville/pays
        if (festival.ville?.toLowerCase().includes(searchTerm) || 
            festival.pays?.toLowerCase().includes(searchTerm)) {
          relevanceScore += 12;
          matchedInfo.push(`Lieu: ${festival.ville}, ${festival.pays}`);
        }

        // Recherche par venue/lieu
        if (festival.lieu?.toLowerCase().includes(searchTerm)) {
          relevanceScore += 10;
          matchedInfo.push(`Venue: ${festival.lieu}`);
        }

        // Recherche par genre
        if (festival.genre?.toLowerCase().includes(searchTerm)) {
          relevanceScore += 10;
          matchedInfo.push(`Genre: ${festival.genre}`);
        }

        // Recherche dans la description
        if (festival.description?.toLowerCase().includes(searchTerm)) {
          relevanceScore += 8;
          matchedInfo.push(`Description contient le terme recherché`);
        }

        // Recherche dans les artistes du lineup
        if (festival.lineup && festival.lineup.length > 0) {
          const artistMatch = festival.lineup.some(artiste => 
            artiste.nom && artiste.nom.toLowerCase().includes(searchTerm)
          );
          if (artistMatch) {
            relevanceScore += 12;
            matchedInfo.push(`Artiste dans le lineup`);
          }
        }

        // Recherche par aéroport le plus proche
        if (festival.aeroport?.toLowerCase().includes(searchTerm)) {
          relevanceScore += 5;
          matchedInfo.push(`Aéroport: ${festival.aeroport}`);
        }

        // Recherche par type d'événement/atmosphère
        if (festival.typeEvenement?.toLowerCase().includes(searchTerm)) {
          relevanceScore += 8;
          matchedInfo.push(`Type: ${festival.typeEvenement}`);
        }
      }

      // Bonus pour les festivals avec des données complètes
      let completenessBonus = 0;
      if (festival.description && festival.description.trim()) completenessBonus += 2;
      if (festival.lineup && festival.lineup.length > 0) completenessBonus += 3;
      if (festival.medias && festival.medias.length > 0) completenessBonus += 2;
      if (festival.prix && festival.prix.some(p => p > 0)) completenessBonus += 2;
      if (festival.hebergement && festival.hebergement.length > 0) completenessBonus += 2;

      relevanceScore += completenessBonus;

      // Ajouter le festival s'il passe les filtres OU a un score de pertinence suffisant
      if (passFilters && relevanceScore > 0) {
        results.push({
          festival,
          score: relevanceScore,
          matchedInfo,
          completenessBonus
        });
      }
    });

    // Trier par score de pertinence (décroissant)
    const sortedResults = results.sort((a, b) => b.score - a.score);
    
    console.log('🔍 AGENT DONNÉES - Résultats:', {
      totalFound: sortedResults.length,
      criteria: detectedCriteria,
      topResults: sortedResults.slice(0, 5).map(r => ({
        name: r.festival.nom,
        country: r.festival.pays,
        genre: r.festival.genre,
        score: r.score,
        matched: r.matchedInfo,
        completeness: r.completenessBonus
      }))
    });

    return {
      results: sortedResults,
      criteria: detectedCriteria,
      totalFound: sortedResults.length,
      searchPerformed: true
    };
  };

  // AGENT 3: Agent Synthèse - Combine les résultats et génère la synthèse finale
  const agentSynthese = (criteres, donneesResults, userMessage) => {
    console.log('🧠 AGENT SYNTHÈSE activé');
    
    const synthese = {
      criteresDetectes: criteres,
      nombreResultats: donneesResults.totalFound,
      resultatsFiltrés: donneesResults.results.slice(0, 3),
      scoreMoyenPertinence: 0,
      recommandationsPrincipales: [],
      informationsManquantes: [],
      contexteSuggestions: [],
      confidence: criteres.confidence || 0
    };
    
    // Calculer le score moyen de pertinence
    if (donneesResults.results.length > 0) {
      synthese.scoreMoyenPertinence = donneesResults.results.reduce((sum, r) => sum + r.score, 0) / donneesResults.results.length;
    }
    
    // Générer les recommandations principales
    donneesResults.results.slice(0, 3).forEach((result, index) => {
      const festival = result.festival;
      const recommendation = {
        rang: index + 1,
        nom: festival.nom,
        pays: festival.pays,
        genre: festival.genre,
        score: result.score,
        raisonsRecommandation: result.matchedInfo,
        informationsClés: []
      };
      
      // Ajouter les informations clés disponibles
      if (festival.ville) recommendation.informationsClés.push(`Ville: ${festival.ville}`);
      if (festival.capacite) recommendation.informationsClés.push(`Capacité: ${festival.capacite} personnes`);
      if (festival.duree) recommendation.informationsClés.push(`Durée: ${festival.duree} jours`);
      if (festival.prix && festival.prix.some(p => p > 0)) {
        const validPrices = festival.prix.filter(p => p > 0);
        recommendation.informationsClés.push(`Prix: ${Math.min(...validPrices)}€-${Math.max(...validPrices)}€`);
      }
      if (festival.lineup && festival.lineup.length > 0) {
        const artistes = festival.lineup.map(a => a.nom).filter(n => n).slice(0, 3);
        if (artistes.length > 0) recommendation.informationsClés.push(`Artistes: ${artistes.join(', ')}`);
      }
      if (festival.aeroport) recommendation.informationsClés.push(`Aéroport: ${festival.aeroport}`);
      if (festival.typeEvenement) recommendation.informationsClés.push(`Atmosphère: ${festival.typeEvenement}`);
      
      synthese.recommandationsPrincipales.push(recommendation);
    });
    
    // Identifier les informations manquantes
    if (!criteres.lieu && !criteres.budget && !criteres.genre) {
      synthese.informationsManquantes.push("Critères de recherche peu spécifiques");
    }
    if (!criteres.budget) {
      synthese.informationsManquantes.push("Budget non spécifié");
    }
    if (!criteres.lieu) {
      synthese.informationsManquantes.push("Lieu de préférence non spécifié");
    }
    
    // Générer des suggestions contextuelles
    if (synthese.nombreResultats === 0) {
      synthese.contexteSuggestions.push("Essayez d'élargir vos critères de recherche");
      synthese.contexteSuggestions.push("Vérifiez l'orthographe des termes utilisés");
    } else if (synthese.nombreResultats > 10) {
      synthese.contexteSuggestions.push("Beaucoup de résultats trouvés, vous pourriez affiner vos critères");
    }
    
    // Suggestions basées sur les critères manquants
    if (criteres.lieu && !criteres.genre) {
      synthese.contexteSuggestions.push("Vous pourriez spécifier un genre musical pour affiner");
    }
    if (criteres.genre && !criteres.lieu) {
      synthese.contexteSuggestions.push("Vous pourriez spécifier un pays ou une région");
    }
    
    console.log('🧠 AGENT SYNTHÈSE - Résultat:', synthese);
    
    return synthese;
  };

  // Système multi-agents avec synthèse intelligente
  const generateGeminiResponse = async (userMessage) => {
    console.log('🚀 SYSTÈME MULTI-AGENTS activé pour:', userMessage);
    
    try {
      // Clé API Gemini
      const GEMINI_API_KEY = 'AIzaSyB_lBRH0ja-p9-8Xzvzv8RfTU6z5QHKRWs';
      
      if (!GEMINI_API_KEY) {
        throw new Error('Clé API Gemini manquante');
      }
      
      // ÉTAPE 1: Agent Critères - Analyser les critères de recherche
      console.log('🎯 Activation de l\'Agent Critères...');
      const { criteres, newPreferences, newFilters } = agentCriteres(userMessage);
      
      // ÉTAPE 2: Agent Données - Rechercher dans la base de données
      console.log('🔍 Activation de l\'Agent Données...');
      const donneesResults = agentDonnees(userMessage, criteres, newFilters);
      
      // ÉTAPE 3: Agent Synthèse - Combiner les résultats
      console.log('🧠 Activation de l\'Agent Synthèse...');
      const synthese = agentSynthese(criteres, donneesResults, userMessage);
      
      // ÉTAPE 4: Préparer le contexte avec la synthèse des 3 agents
      let contextData = "";
      
      contextData += "SYNTHÈSE DES AGENTS:\n";
      contextData += `- Critères détectés: ${JSON.stringify(synthese.criteresDetectes)}\n`;
      contextData += `- Confidence: ${synthese.confidence}/100\n`;
      contextData += `- Résultats trouvés: ${synthese.nombreResultats}\n`;
      contextData += `- Score moyen pertinence: ${synthese.scoreMoyenPertinence.toFixed(1)}\n`;
      
      if (synthese.nombreResultats > 0) {
        contextData += "\nRECOMMANDATIONS PRINCIPALES:\n";
        
        synthese.recommandationsPrincipales.forEach((recommendation, index) => {
          contextData += `${recommendation.rang}. ${recommendation.nom} (${recommendation.genre || 'Genre non spécifié'})`;
          contextData += ` - ${recommendation.pays || 'Pays non spécifié'}`;
          contextData += ` - Score: ${recommendation.score}`;
          contextData += ` - Raisons: ${recommendation.raisonsRecommandation.join(', ')}`;
          
          if (recommendation.informationsClés.length > 0) {
            contextData += ` - Infos: ${recommendation.informationsClés.join(', ')}`;
          }
          
          contextData += "\n";
        });
      } else {
        contextData += "\nAucun festival trouvé avec ces critères.\n";
        contextData += "FESTIVALS DISPONIBLES (échantillon):\n";
        festivalsData.slice(0, 3).forEach((festival, index) => {
          contextData += `${index + 1}. ${festival.nom} (${festival.genre || 'Musique'}) - ${festival.ville || 'Lieu non spécifié'}, ${festival.pays || 'Pays non spécifié'}`;
          if (festival.prix && festival.prix.some(p => p > 0)) {
            const validPrices = festival.prix.filter(p => p > 0);
            contextData += ` - Prix: ${Math.min(...validPrices)}€-${Math.max(...validPrices)}€`;
          }
          contextData += "\n";
        });
      }
      
      // Ajouter les informations manquantes et suggestions
      if (synthese.informationsManquantes.length > 0) {
        contextData += `\nINFORMATIONS MANQUANTES: ${synthese.informationsManquantes.join(', ')}\n`;
      }
      
      if (synthese.contexteSuggestions.length > 0) {
        contextData += `\nSUGGESTIONS: ${synthese.contexteSuggestions.join(', ')}\n`;
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
      
      // Construire le prompt pour Gemini avec système multi-agents
      const prompt = `Tu es GrooveBot, assistant spécialisé dans les festivals de musique avec un système multi-agents ultra-performant.

SYSTÈME MULTI-AGENTS ACTIVÉ:
Tu travailles avec 3 agents spécialisés qui ont déjà analysé la demande:
1. 🎯 AGENT CRITÈRES: A analysé et extrait tous les critères de recherche
2. 🔍 AGENT DONNÉES: A recherché dans la base de données Airtable
3. 🧠 AGENT SYNTHÈSE: A combiné les résultats et généré une synthèse

IMPORTANT: Les agents ont déjà fait le travail d'analyse et de recherche. Tu dois utiliser leur synthèse pour donner une réponse naturelle et conversationnelle.

INSTRUCTIONS:
- Utilise la synthèse fournie pour répondre de manière personnalisée
- Explique POURQUOI ces festivals correspondent aux critères détectés
- Mentionne les informations clés disponibles (prix, capacité, lineup, etc.)
- Sois enthousiaste et naturel, comme si tu connaissais personnellement ces festivals
- Ne montre JAMAIS le processus technique ou les scores
- Adapte ton ton selon le niveau de confidence de la détection des critères

MÉMOIRE CONTEXTUELLE:
${userPreferencesText}

HISTORIQUE DE CONVERSATION:
${conversationHistory}

DONNÉES DISPONIBLES:
${contextData}

RÈGLES IMPORTANTES ULTRA-PERFORMANTES:
- Utilise la mémoire contextuelle des conversations précédentes
- Réponds UNIQUEMENT sur les festivals, musique, artistes, événements musicaux
- Sois enthousiaste et conversationnel avec des emojis
- Réponds en français
- Comprends le contexte même sans mots-clés musicaux directs
- Tu peux répondre aux questions générales sur les artistes musicaux (biographie, style, collaborations, etc.)
- Relie toujours les artistes aux festivals où ils pourraient jouer
- UTILISE TOUTES LES DONNÉES DISPONIBLES: lineup, venue, capacité, hébergement, aéroport, description, atmosphère, durée, prix détaillés
- Explique POURQUOI un festival correspond aux critères demandés
- Donne des informations pratiques et concrètes (transport, hébergement, prix, durée, etc.)
- Utilise le score de pertinence pour justifier tes recommandations
- Mentionne les détails spécifiques qui font la différence entre les festivals

FORMATAGE OBLIGATOIRE:
- N'UTILISE JAMAIS d'astérisques (*) pour mettre en gras ou souligner
- N'UTILISE JAMAIS de markdown (**texte**, __texte__, ###, etc.)
- Pour les listes, utilise des tirets (-) ou des puces (•) uniquement
- Écris en texte plain sans formatage spécial
- Exemple correct: "Festival Tomorrowland en Belgique" (pas "**Festival Tomorrowland**")
- Exemple correct: "- Awakenings Festival" (pas "* **Awakenings Festival**")

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

INSTRUCTIONS POUR LA CHAÎNE DE PENSÉE:
1. Commence par analyser PRÉCISÉMENT ce que l'utilisateur demande
2. Identifie les critères exacts (budget, dates, genre, lieu)
3. Filtre les festivals selon CES critères spécifiques
4. Réponds de manière PRÉCISE et PERTINENTE à la question posée
5. Évite les réponses génériques - sois spécifique à la demande

ATTENTION FORMATAGE:
- Écris UNIQUEMENT en texte plain, sans aucun formatage
- Pas d'astérisques (*), pas de markdown (**), pas de soulignement
- Utilise des tirets (-) pour les listes si nécessaire
- Exemple: "Awakenings Festival en Belgique" (pas "**Awakenings Festival**")

Utilise cette chaîne de thought interne pour donner une réponse précise et pertinente.`;

      console.log('🔑 Clé API Gemini:', GEMINI_API_KEY ? 'Présente' : 'Manquante');
      console.log('🧠 Contexte utilisateur analysé:', newPreferences);
      console.log('🔍 Filtres appliqués:', newFilters);
      console.log('📊 Résultats trouvés:', synthese.nombreResultats, 'festivals');
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
        // Utiliser la synthèse pour retourner les meilleurs festivals
        let festivalsToReturn = null;
        
        if (synthese.nombreResultats > 0) {
          festivalsToReturn = synthese.resultatsFiltrés.map(r => r.festival);
        } else {
          // Si pas de résultats spécifiques, prendre les premiers festivals de la base
          festivalsToReturn = festivalsData.slice(0, 3);
        }
        
        console.log('🚀 SYSTÈME MULTI-AGENTS - Réponse générée avec succès');
        console.log('📊 Festivals retournés:', festivalsToReturn.map(f => f.nom));
        
        return {
          text: data.candidates[0].content.parts[0].text,
          festivals: festivalsToReturn,
          synthese: synthese // Ajouter la synthèse pour debug
        };
      } else {
        throw new Error('Réponse invalide de Gemini');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'appel à Gemini:', error);
      
      // Fallback avec le système multi-agents même si Gemini ne fonctionne pas
      try {
        console.log('🔄 Activation du fallback multi-agents...');
        
        const { criteres, newPreferences, newFilters } = agentCriteres(userMessage);
        const donneesResults = agentDonnees(userMessage, criteres, newFilters);
        const synthese = agentSynthese(criteres, donneesResults, userMessage);
        
        if (synthese.nombreResultats > 0) {
          const topRecommendation = synthese.recommandationsPrincipales[0];
          
          let response = `🎵 J'ai trouvé des informations sur ${topRecommendation.nom} !\n\n`;
          
          if (topRecommendation.genre) response += `🎶 Genre: ${topRecommendation.genre}\n`;
          if (topRecommendation.pays) response += `📍 Pays: ${topRecommendation.pays}\n`;
          if (topRecommendation.score) response += `⭐ Score de pertinence: ${topRecommendation.score}\n`;
          
          if (topRecommendation.raisonsRecommandation.length > 0) {
            response += `\n✅ Pourquoi ce festival vous correspond:\n`;
            topRecommendation.raisonsRecommandation.forEach(raison => {
              response += `• ${raison}\n`;
            });
          }
          
          if (topRecommendation.informationsClés.length > 0) {
            response += `\n📋 Informations clés:\n`;
            topRecommendation.informationsClés.forEach(info => {
              response += `• ${info}\n`;
            });
          }
          
          return {
            text: response,
            festivals: synthese.resultatsFiltrés.map(r => r.festival),
            synthese: synthese
          };
        } else {
          return {
            text: "Désolé, je n'ai pas trouvé de festivals correspondant à vos critères. Essayez d'élargir votre recherche ! 🤖",
            festivals: festivalsData.slice(0, 3)
          };
        }
      } catch (fallbackError) {
        console.error('❌ Erreur dans le fallback multi-agents:', fallbackError);
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
      
      // Simuler un effet de typing plus réaliste
      const typingDuration = Math.min(Math.max(botResponse.text.length * 20, 1500), 4000); // Entre 1.5s et 4s
      
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          text: botResponse.text,
          sender: 'bot',
          timestamp: new Date(),
          festivals: botResponse.festivals
        };

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, typingDuration);
      
    } catch (error) {
      console.error('❌ Erreur lors de la génération de la réponse:', error);
      
      setTimeout(() => {
        const errorMessage = {
          id: Date.now() + 1,
          text: "Désolé, je rencontre des difficultés techniques. Pouvez-vous réessayer votre question ? 🤖",
          sender: 'bot',
          timestamp: new Date(),
          festivals: null
        };

        setMessages(prev => [...prev, errorMessage]);
        setIsTyping(false);
      }, 1500);
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const quickActions = [
    "A quel festival je peux aller avec un budget de 100 euros ?",
    "Donne-moi des festivals de House",
    "Est-ce qu'il y a un festival au Canada ?"
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
            <img src="/ChatGPT Image 18 juil. 2025, 03_01_37.png" alt="GroovBot" className="bot-avatar-img" />
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
                  <img src="/ChatGPT Image 18 juil. 2025, 03_01_37.png" alt="GroovBot" className="message-avatar-img" />
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
                <img src="/ChatGPT Image 18 juil. 2025, 03_01_37.png" alt="GroovBot" className="message-avatar-img" />
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