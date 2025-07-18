import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaFilter, FaMapMarkerAlt, FaCalendarAlt, FaEye, FaHeart, FaMusic, FaGlobe, FaUsers, FaTwitter, FaInstagram, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';
import { useAuth } from '../context/AuthContext';
import { getFestivalsFromAirtable, checkUserLike } from '../services/airtableService';
import testAirtableConnection from '../testAirtable';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  CardActionArea, 
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Container,
  Grid,
  Stack,
  IconButton,
  Alert,
  CircularProgress,
  Pagination,
  Tabs,
  Tab
} from '@mui/material';
import {
  Event as EventIcon,
  SmartToy as SmartToyIcon,
  Person as PersonIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import './Evenements.css';

// Navbar flottante glassmorphism
const GlassNavbar = styled(Box)(({ theme }) => ({
  fontFamily: 'Poppins, sans-serif',
  position: 'fixed',
  bottom: 20,
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(15px)',
  WebkitBackdropFilter: 'blur(15px)',
  borderRadius: '50px',
  padding: '15px 30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '25px',
  transition: 'all 0.3s ease',
  width: 'auto',
  minWidth: '700px',
  boxShadow: '0 4px 24px 0 rgba(31,38,135,0.18)',
  zIndex: 1000,
  [theme.breakpoints.down('md')]: {
    minWidth: 'auto',
    width: '90%',
    padding: '10px 20px',
    gap: '25px',
    borderRadius: '32px',
  },
  [theme.breakpoints.down('sm')]: {
    bottom: 15,
    width: '85%',
    padding: '8px 15px',
    gap: '20px',
    borderRadius: '25px',
  },
}));

const GlassNavItemNew = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  padding: '12px',
  cursor: 'pointer',
  transition: 'color 0.3s ease',
  borderRadius: '30px',
  width: '40px',
  overflow: 'hidden',
  background: 'transparent',
  color: '#fc6c34',
  textDecoration: 'none',
  [theme.breakpoints.up('md')]: {
    '&:hover': {
      background: 'rgba(110, 31, 157, 0.1)',
      width: '140px',
      color: '#6e1f9d',
      '& span': {
        display: 'block',
      },
    },
  },
  '& span': {
    display: 'none',
    whiteSpace: 'nowrap',
    transition: 'opacity 0.3s ease',
    fontWeight: 600,
    fontSize: '15px',
  },
  '& .MuiSvgIcon-root': {
    width: '26px',
    height: '26px',
  },
  [theme.breakpoints.down('md')]: {
    width: '40px',
    padding: '6px',
    '& span': {
      display: 'none',
    },
    '&:hover': {
      color: '#6e1f9d',
    },
    '& .MuiSvgIcon-root': {
      width: '24px',
      height: '24px',
    },
  },
  [theme.breakpoints.down('sm')]: {
    padding: '4px',
    '& .MuiSvgIcon-root': {
      width: '22px',
      height: '22px',
    },
  },
}));

// Footer glassmorphism
const GlassFooter = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '32px 32px 0 0',
  boxShadow: '0 -8px 32px 0 rgba(31,38,135,0.18)',
  color: 'white',
  py: 4,
  mt: 'auto',
  position: 'relative',
  zIndex: 10,
  flexShrink: 0,
  width: '100%',
}));

// Styled component pour la pagination
const StyledPagination = styled(Pagination)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(8),
  padding: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.2)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  '& .MuiPaginationItem-root': {
    color: '#ffffff',
    fontSize: '1.1rem',
    minWidth: '40px',
    height: '40px',
    margin: '0 4px',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderColor: '#fc6c34',
    },
    '&.Mui-selected': {
      backgroundColor: '#fc6c34',
      color: '#ffffff',
      fontWeight: 'bold',
      '&:hover': {
        backgroundColor: '#e85a20',
      },
    },
  },
  [theme.breakpoints.down('sm')]: {
    '& .MuiPaginationItem-root': {
      minWidth: '36px',
      height: '36px',
      fontSize: '1rem',
      margin: '0 2px',
    },
  },
}));

const Evenements = () => {
  const { isAuthenticated, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    genre: [],
    pays: [],
    hebergement: [],
    typeEvenement: [],
    devise: []
  });
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Nouveaux états pour la pagination
  const [page, setPage] = useState(1);
  const eventsPerPage = 6;
  
  // Onglets
  const [activeTab, setActiveTab] = useState(0); // 0: Tous les événements, 1: Événements likés
  
  // Fonction pour filtrer les événements likés
  const getLikedEvents = () => {
    if (!user) return [];
    return festivals.filter(event => checkUserLike(user.id.toString(), event.id));
  };
  
  // Fonction pour gérer le changement d'onglet
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Réinitialiser la page quand les filtres ou la recherche changent
  useEffect(() => {
    setPage(1);
  }, [searchTerm, activeFilters, activeTab]);

  // Fonction pour charger les données des événements depuis Airtable
  const loadEventData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Debug: Tentative de connexion à Airtable (console seulement)
      
      console.log('🚀 Début du chargement des festivals depuis Airtable...');
      
      // Test de connexion d'abord
      await testAirtableConnection();
      
      // Récupérer les données depuis Airtable
      console.log('📡 Récupération des données...');
      const airtableEvents = await getFestivalsFromAirtable();
      
      console.log('📋 Festivals récupérés bruts:', airtableEvents.length);
      
      if (airtableEvents.length === 0) {
        setError('Aucun festival trouvé dans la table Airtable. Vérifiez que la table "festivals" contient des données.');
        setLoading(false);
        return;
      }
      
      // Filtrer les événements pour ne garder que ceux qui ont les champs obligatoires
      const validEvents = airtableEvents.filter(event => {
        const isValid = event.nom && event.genre && event.ville && event.pays;
        if (!isValid) {
          console.warn('⚠️ Événement exclu (champs manquants):', event);
        }
        return isValid;
      });
      
      console.log('✅ Festivals valides:', validEvents.length);
      
      // Log pour déboguer le nombre de personnes intéressées
      validEvents.forEach((event, index) => {
        console.log(`🎪 Festival ${index + 1}: ${event.nom} - Nombre de personnes intéressées: ${event.nombreLikes || 0}`);
      });
      
      // Debug: Festivals valides chargés (console seulement)
      
      setFestivals(validEvents);
      setLoading(false);
      
      if (validEvents.length === 0) {
        setError('Aucun festival valide trouvé. Vérifiez que vos festivals ont tous les champs requis : nom, genre, ville, pays.');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des événements:', error);
      const errorMessage = error.message || 'Erreur inconnue';
      setError(`Impossible de charger les événements depuis Airtable: ${errorMessage}`);
      // Debug: Erreur (console seulement)
      setLoading(false);
      
      // En cas d'erreur, utiliser des données de fallback
      console.log('🔄 Utilisation des données de fallback...');
      const fallbackEvents = [
        {
          id: 'fallback-1',
          nom: "Tomorrowland (Fallback)",
          dateDebut: "2025-07-18",
          dateFin: "2025-07-21",
          genre: "Trance",
          ville: "Boom",
          pays: "Belgium",
          lieu: "De Schorre",
          capacite: 400000,
          siteWeb: "https://www.tomorrowland.com",
          duree: 3,
          hebergement: ["Camping", "Glamping"],
          aeroport: "Brussels International Airport",
          typeEvenement: "Multi-stage",
          description: "Le festival de musique électronique le plus magique au monde",
          typeBillet: "Weekend Pass",
          devise: "EUR",
          prix: [299, 399, 499],
          image: "/fete_bg.png",
          nombreLikes: 0,
          dates: "2025-07-18 - 2025-07-21",
          interessees: 0
        }
      ];
      
      setFestivals(fallbackEvents);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadEventData();
  }, []);

  // Fonction pour mettre à jour un événement spécifique
  const updateEvent = (eventId, updates) => {
    setFestivals(prev => 
      prev.map(event => 
        event.id === eventId 
          ? { ...event, ...updates }
          : event
      )
    );
  };

  // Fonction pour ajouter un nouvel événement
  const addEvent = (newEvent) => {
    const eventWithId = {
      ...newEvent,
      id: Date.now(), // Simple ID génération
      dates: `${newEvent.dateDebut} - ${newEvent.dateFin}`,
      interessees: newEvent.nombreLikes || 0
    };
    setFestivals(prev => [...prev, eventWithId]);
  };

  // Fonction pour supprimer un événement
  const deleteEvent = (eventId) => {
    setFestivals(prev => prev.filter(event => event.id !== eventId));
  };

  // Fonction pour recharger les données
  const reloadData = () => {
    loadEventData();
  };

  // Variables pour les propriétés des événements
  const getEventProperties = (event) => ({
    nomEvenement: event.nom,
    lieuEvenement: event.lieu,
    datesEvenement: event.dates,
    villeEvenement: event.ville,
    paysEvenement: event.pays,
    styleEvenement: event.genre,
    nombreLikesEvenement: event.nombreLikes || 0,
    imageEvenement: event.image,
    capaciteEvenement: event.capacite,
    dureeEvenement: event.duree,
    typeEvenement: event.typeEvenement,
    deviseEvenement: event.devise,
    prixEvenement: event.prix,
    descriptionEvenement: event.description,
    siteWebEvenement: event.siteWeb,
    lineupEvenement: event.lineup || [],
    mediasEvenement: event.medias || []
  });

  // Générer les options de filtres dynamiquement basées sur les données d'Airtable
  const generateFilterOptions = () => {
    const genres = [...new Set(festivals.map(f => f.genre).filter(Boolean))];
    const pays = [...new Set(festivals.map(f => f.pays).filter(Boolean))];
    const hebergements = [...new Set(festivals.flatMap(f => f.hebergement || []))];
    const typesEvenement = [...new Set(festivals.map(f => f.typeEvenement).filter(Boolean))];
    const devises = [...new Set(festivals.map(f => f.devise).filter(Boolean))];

    const genreColors = {
      'Trance': '#3498db',
      'Hardstyle': '#e74c3c',
      'EDM': '#f39c12',
      'Techno': '#9b59b6',
      'House': '#1abc9c',
      'Psytrance': '#8e44ad'
    };

    const paysLabels = {
      'Canada': 'Canada',
      'Germany': 'Allemagne',
      'USA': 'États-Unis',
      'Italy': 'Italie',
      'Serbia': 'Serbie',
      'Vietnam': 'Vietnam',
      'Spain': 'Espagne',
      'Thailand': 'Thaïlande',
      'UK': 'Royaume-Uni',
      'India': 'Inde',
      'Belgium': 'Belgique',
      'Portugal': 'Portugal',
      'Hungary': 'Hongrie',
      'Australia': 'Australie',
      'Switzerland': 'Suisse',
      'Iceland': 'Islande',
      'Netherlands': 'Pays-Bas',
      'Croatia': 'Croatie',
      'France': 'France'
    };

    const hebergementIcons = {
      'Glamping': '🏕️',
      'Camping': '⛺',
      'Hotel': '🏨',
      'Bungalow': '🏠',
      'Airbnb': '🏡'
    };

    const typeEvenementLabels = {
      'One-stage intimate': 'Scène unique intime',
      'Multi-stage': 'Multi-scènes',
      'Desert gathering': 'Rassemblement désert',
      'Forest rave': 'Rave forestière'
    };

    const deviseLabels = {
      'EUR': 'Euro (€)',
      'USD': 'Dollar ($)',
      'GBP': 'Livre (£)'
    };

    return {
      genre: genres.map(genre => ({
        id: genre,
        label: genre,
        color: genreColors[genre] || '#3498db'
      })),
      pays: pays.map(pays => ({
        id: pays,
        label: paysLabels[pays] || pays
      })),
      hebergement: hebergements.map(heb => ({
        id: heb,
        label: heb,
        icon: hebergementIcons[heb] || '🏠'
      })),
      typeEvenement: typesEvenement.map(type => ({
        id: type,
        label: typeEvenementLabels[type] || type
      })),
      devise: devises.map(devise => ({
        id: devise,
        label: deviseLabels[devise] || devise
      }))
    };
  };

  // Options de filtres basées sur les données d'Airtable
  const filterOptions = useMemo(() => generateFilterOptions(), [festivals]);

  // Filtrer les événements
  useEffect(() => {
    // Commencer par sélectionner les événements selon l'onglet actuel
    let filtered = activeTab === 1 ? getLikedEvents() : festivals;

    // Filtre par recherche textuelle
    if (searchTerm) {
      filtered = filtered.filter(event => {
        const properties = getEventProperties(event);
        return properties.nomEvenement.toLowerCase().includes(searchTerm.toLowerCase()) ||
               properties.villeEvenement.toLowerCase().includes(searchTerm.toLowerCase()) ||
               properties.paysEvenement.toLowerCase().includes(searchTerm.toLowerCase()) ||
               properties.styleEvenement.toLowerCase().includes(searchTerm.toLowerCase()) ||
               properties.descriptionEvenement.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Filtre par genre
    if (activeFilters.genre.length > 0) {
      filtered = filtered.filter(event => 
        activeFilters.genre.includes(getEventProperties(event).styleEvenement)
      );
    }

    // Filtre par pays
    if (activeFilters.pays.length > 0) {
      filtered = filtered.filter(event => 
        activeFilters.pays.includes(getEventProperties(event).paysEvenement)
      );
    }

    // Filtre par hébergement
    if (activeFilters.hebergement.length > 0) {
      filtered = filtered.filter(event => 
        activeFilters.hebergement.some(filter => event.hebergement.includes(filter))
      );
    }

    // Filtre par type d'événement
    if (activeFilters.typeEvenement.length > 0) {
      filtered = filtered.filter(event => 
        activeFilters.typeEvenement.includes(getEventProperties(event).typeEvenement)
      );
    }

    // Filtre par devise
    if (activeFilters.devise.length > 0) {
      filtered = filtered.filter(event => 
        activeFilters.devise.includes(getEventProperties(event).deviseEvenement)
      );
    }

    setFilteredEvents(filtered);
  }, [searchTerm, activeFilters, festivals, activeTab, user]);

  // Initialiser les événements filtrés
  useEffect(() => {
    setFilteredEvents(festivals);
  }, [festivals]);

  // Calcul des événements à afficher pour la page courante
  const currentEvents = useMemo(() => {
    const startIndex = (page - 1) * eventsPerPage;
    return filteredEvents.slice(startIndex, startIndex + eventsPerPage);
  }, [filteredEvents, page]);

  // Calcul du nombre total de pages
  const pageCount = Math.ceil(filteredEvents.length / eventsPerPage);

  // Gestionnaire de changement de page
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    // Scroll vers le haut de la page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Gérer les filtres
  const toggleFilter = (category, filterId) => {
    setActiveFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(filterId)
        ? prev[category].filter(id => id !== filterId)
        : [...prev[category], filterId]
    }));
  };

  // Réinitialiser les filtres
  const clearFilters = () => {
    setActiveFilters({
      genre: [],
      pays: [],
      hebergement: [],
      typeEvenement: [],
      devise: []
    });
    setSearchTerm('');
  };

  // Formater les dates en format court avec l'année
  const formatDateRangeShort = (dateString) => {
    const [startDate, endDate] = dateString.split(' - ');
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const formatDateShort = (date) => {
      const day = date.getDate();
      const month = date.toLocaleDateString('fr-FR', { month: 'short' });
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    };
    
    // Si les dates sont dans la même année, afficher l'année seulement à la fin
    if (start.getFullYear() === end.getFullYear()) {
      const startFormatted = `${start.getDate()} ${start.toLocaleDateString('fr-FR', { month: 'short' })}`;
      const endFormatted = `${end.getDate()} ${end.toLocaleDateString('fr-FR', { month: 'short' })} ${end.getFullYear()}`;
      return `${startFormatted} - ${endFormatted}`;
    } else {
      // Si les dates sont dans des années différentes, afficher l'année pour chaque date
      return `${formatDateShort(start)} - ${formatDateShort(end)}`;
    }
  };

  // Gérer l'affichage des détails
  const handleViewDetails = (eventId) => {
    // Navigation handled by Link component
  };

  const navigationItems = [
    { icon: <HomeIcon />, text: 'HOME', href: '/' },
    { icon: <EventIcon />, text: 'ÉVÉNEMENTS', href: '/evenements' },
    { icon: <SmartToyIcon />, text: 'CHATBOT', href: '/chatbot' },
    { 
      icon: <PersonIcon />, 
      text: isAuthenticated ? 'MON COMPTE' : 'SE CONNECTER', 
      href: isAuthenticated ? '/mon-compte' : '/connexion' 
    },
  ];

  // Afficher un loader pendant le chargement
  if (loading) {
    return (
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundImage: `url(${process.env.PUBLIC_URL}/bg.png)`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          gap: 2
        }}
      >
        <CircularProgress size={60} sx={{ color: '#fc6c34' }} />
      </Box>
    );
  }

  return (
    <Box 
      className="evenements-page"
      sx={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/bg.png)`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        margin: 0,
        padding: 0,
      }}
    >
      {/* Contenu principal */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Navigation */}
        <GlassNavbar>
        {navigationItems.map((item, index) => (
          <GlassNavItemNew
            key={index}
            component={item.href.startsWith('/') ? Link : 'a'}
            to={item.href.startsWith('/') ? item.href : undefined}
            href={item.href.startsWith('/') ? undefined : item.href}
          >
            {item.icon}
            <span>{item.text}</span>
          </GlassNavItemNew>
        ))}
      </GlassNavbar>

      {/* Hero Section */}
      <section className="events-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Découvrez les <span className="highlight">Meilleurs Festivals</span> Électroniques
          </h1>
          {error && (
            <Alert 
              severity="warning" 
              sx={{ mt: 2, maxWidth: '500px', mx: 'auto' }}
              action={
                <Button color="inherit" size="small" onClick={reloadData}>
                  Réessayer
                </Button>
              }
            >
              {error}
            </Alert>
          )}

        </div>
      </section>

      {/* Filters Section */}
      <section className="filters-section">
        <Container maxWidth="lg">
          <div className="filters-container">
            {/* Search Bar */}
            <div className="search-container">
              <div className="search-bar">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Rechercher un festival, une ville, un pays..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <button 
                className="filter-toggle"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter /> Filtres
              </button>
            </div>

            {/* Filter Categories */}
            <div className={`filter-categories ${showFilters ? 'show' : ''}`}>
              {/* Genre Musical */}
              <div className="filter-group">
                <h3><FaMusic /> Genre Musical</h3>
                <div className="filter-buttons">
                  {filterOptions.genre.map(filter => (
                    <Chip
                      key={filter.id}
                      label={filter.label}
                      onClick={() => toggleFilter('genre', filter.id)}
                      sx={{
                        backgroundColor: activeFilters.genre.includes(filter.id) ? filter.color : 'rgba(255, 255, 255, 0.1)',
                        color: activeFilters.genre.includes(filter.id) ? '#fff' : filter.color,
                        '&:hover': {
                          backgroundColor: `${filter.color}22`,
                        },
                        margin: '4px',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Pays */}
              <div className="filter-group">
                <h3><FaGlobe /> Pays</h3>
                <div className="filter-buttons">
                  {filterOptions.pays.slice(0, 10).map(filter => (
                    <Chip
                      key={filter.id}
                      label={filter.label}
                      icon={<FaMapMarkerAlt />}
                      onClick={() => toggleFilter('pays', filter.id)}
                      sx={{
                        backgroundColor: activeFilters.pays.includes(filter.id) ? '#6e1f9d' : 'rgba(255, 255, 255, 0.1)',
                        color: activeFilters.pays.includes(filter.id) ? '#fff' : '#2c3e50',
                        '&:hover': {
                          backgroundColor: 'rgba(110, 31, 157, 0.2)',
                        },
                        margin: '4px',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <div className="filter-actions">
                <Button 
                  variant="outlined" 
                  onClick={clearFilters}
                  sx={{
                    color: '#fc6c34',
                    borderColor: '#fc6c34',
                    '&:hover': {
                      borderColor: '#c8501a',
                      backgroundColor: 'rgba(252, 108, 52, 0.1)',
                    },
                  }}
                >
                  Effacer tous les filtres
                </Button>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {filteredEvents.length} festival{filteredEvents.length !== 1 ? 's' : ''} trouvé{filteredEvents.length !== 1 ? 's' : ''}
                </Typography>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Events Grid */}
      <Container maxWidth="lg" sx={{ py: 8, flex: 1, paddingBottom: '120px' }}>
        {/* Onglets */}
        <Box sx={{ mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="onglets événements"
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '1rem',
                fontWeight: 600,
              },
              '& .MuiTab-root.Mui-selected': {
                color: '#fc6c34',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#fc6c34',
              },
            }}
          >
            <Tab 
              label="Tous les événements" 
              sx={{ 
                textTransform: 'none',
                minWidth: 'auto',
                mr: 2 
              }} 
            />
            <Tab 
              label={`Événements likés ${isAuthenticated && user ? `(${getLikedEvents().length})` : ''}`}
              sx={{ 
                textTransform: 'none',
                minWidth: 'auto',
                opacity: isAuthenticated ? 1 : 0.5
              }}
              disabled={!isAuthenticated}
            />
          </Tabs>
        </Box>

        {festivals.length === 0 && !loading ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            color: 'text.secondary'
          }}>
            <FaSearch style={{ fontSize: '3rem', marginBottom: '1rem' }} />
            <Typography variant="h5" gutterBottom>
              Aucun festival trouvé
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Aucun festival n'a été trouvé dans la base de données Airtable
            </Typography>
            <Button
              variant="contained"
              onClick={reloadData}
              sx={{
                backgroundColor: '#fc6c34',
                '&:hover': {
                  backgroundColor: '#c8501a',
                },
              }}
            >
              Recharger les données
            </Button>
          </Box>
        ) : activeTab === 1 && getLikedEvents().length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            color: 'text.secondary'
          }}>
            <FaHeart style={{ fontSize: '3rem', marginBottom: '1rem', color: '#fc6c34' }} />
            <Typography variant="h5" gutterBottom>
              Aucun événement liké
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {isAuthenticated ? 
                "Vous n'avez pas encore liké d'événements. Explorez les festivals et cliquez sur le cœur pour marquer vos préférés !" :
                "Connectez-vous pour voir vos événements likés"
              }
            </Typography>
            {isAuthenticated && (
              <Button
                variant="contained"
                onClick={() => setActiveTab(0)}
                sx={{
                  backgroundColor: '#fc6c34',
                  '&:hover': {
                    backgroundColor: '#c8501a',
                  },
                }}
              >
                Découvrir les événements
              </Button>
            )}
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {currentEvents.map(event => {
                // Récupérer les propriétés de l'événement comme variables
                const {
                  nomEvenement,
                  lieuEvenement,
                  datesEvenement,
                  villeEvenement,
                  paysEvenement,
                  styleEvenement,
                  nombreLikesEvenement,
                  imageEvenement,
                  prixEvenement,
                  descriptionEvenement
                } = getEventProperties(event);
                
                // Log pour déboguer l'affichage
                console.log(`🎪 Affichage festival ${nomEvenement}: nombreLikesEvenement = ${nombreLikesEvenement}, event.nombreLikes = ${event.nombreLikes}`);

                return (
                  <Grid item xs={12} sm={6} md={4} key={event.id}>
                    <Card
                      sx={{
                        maxWidth: 345,
                        mx: 'auto',
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        borderRadius: '30px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        boxShadow: '0 8px 32px 0 rgba(31,38,135,0.1)',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          background: 'rgba(255,255,255,0.15)',
                          boxShadow: '0 16px 40px 0 rgba(31,38,135,0.15)',
                          border: '1px solid rgba(255,255,255,0.3)',
                        },
                      }}
                    >
                      <CardActionArea component={Link} to={`/evenements/${event.id}`}>
                        <CardMedia
                          component="img"
                          height="200"
                          image={imageEvenement}
                          alt={nomEvenement}
                          sx={{
                            borderBottom: '1px solid rgba(255,255,255,0.1)'
                          }}
                          onError={(e) => {
                            e.target.src = '/fete_bg.png'; // Image de fallback
                          }}
                        />
                        <CardContent sx={{ 
                          background: 'rgba(255,255,255,0.05)',
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)',
                          padding: '1.5rem',
                        }}>
                          <Typography 
                            gutterBottom 
                            variant="h6" 
                            component="div"
                            sx={{ 
                              color: 'rgba(0,0,0,0.87)',
                              fontWeight: 600,
                              fontSize: '1.25rem',
                              marginBottom: '0.5rem'
                            }}
                          >
                            {nomEvenement}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: 'rgba(0,0,0,0.6)',
                              marginBottom: '0.75rem',
                              fontSize: '0.95rem'
                            }}
                          >
                            {lieuEvenement}
                          </Typography>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            mb: 1.5 
                          }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: 'rgba(0,0,0,0.6)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                fontSize: '0.9rem'
                              }}
                            >
                              <FaCalendarAlt className="icon-violet" />
                              {datesEvenement ? formatDateRangeShort(datesEvenement) : 'Dates à venir'}
                            </Typography>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                display: 'none'
                              }}
                            >
                              {prixEvenement && prixEvenement[0] ? `${prixEvenement[0]}€` : 'Prix à déterminer'}
                            </Typography>
                          </Box>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1, 
                            mb: 1.5,
                            color: 'rgba(0,0,0,0.6)'
                          }}>
                            <FaMapMarkerAlt className="icon-violet" />
                            <Typography variant="body2">
                              {villeEvenement}, {paysEvenement}
                            </Typography>
                          </Box>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center' 
                          }}>
                            <Chip
                              label={styleEvenement}
                              size="small"
                              sx={{
                                backgroundColor: 'rgba(110, 31, 157, 0.08)',
                                color: '#6e1f9d',
                                fontWeight: 500,
                                border: '1px solid rgba(110, 31, 157, 0.2)',
                                height: '24px',
                              }}
                            />
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: 'rgba(0,0,0,0.6)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                              }}
                            >
                              <FaHeart className="icon-orange" />
                              {nombreLikesEvenement || 0}
                            </Typography>
                          </Box>
                        </CardContent>
                      </CardActionArea>
                      <CardActions sx={{ 
                        padding: '0.75rem 1rem',
                        background: 'rgba(255,255,255,0.05)',
                        borderTop: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        <Button 
                          size="small" 
                          className="primary"
                          sx={{ 
                            fontSize: '0.9rem',
                            color: '#fc6c34',
                            '&:hover': {
                              color: '#6e1f9d',
                              background: 'rgba(255,255,255,0.1)'
                            }
                          }}
                        >
                          Partager
                        </Button>
                        <Button
                          size="small"
                          component={Link}
                          to={`/evenements/${event.id}`}
                          className="secondary"
                          sx={{ 
                            fontSize: '0.9rem',
                            color: '#6e1f9d',
                            marginLeft: 'auto',
                            '&:hover': {
                              color: '#fc6c34',
                              background: 'rgba(255,255,255,0.1)'
                            }
                          }}
                        >
                          Voir détails
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
            
            {/* Pagination */}
            {pageCount > 1 && (
              <Box sx={{ 
                mt: 4, 
                mb: 8,
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                position: 'relative',
                zIndex: 1
              }}>
                <Box sx={{
                  maxWidth: 'fit-content',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '-10px',
                    left: '-10px',
                    right: '-10px',
                    bottom: '-10px',
                    background: 'linear-gradient(135deg, rgba(252, 108, 52, 0.2), rgba(255, 255, 255, 0.05))',
                    borderRadius: '25px',
                    zIndex: -1,
                    filter: 'blur(8px)',
                  }
                }}>
                  <StyledPagination 
                    count={pageCount}
                    page={page}
                    onChange={handlePageChange}
                    size="large"
                    variant="outlined"
                    shape="rounded"
                    showFirstButton
                    showLastButton
                    sx={{
                      '& .MuiPagination-ul': {
                        gap: 1,
                        justifyContent: 'center',
                      }
                    }}
                  />
                </Box>
              </Box>
            )}
          </>
        )}

        {filteredEvents.length === 0 && festivals.length > 0 && (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            color: 'text.secondary'
          }}>
            <FaSearch style={{ fontSize: '3rem', marginBottom: '1rem' }} />
            <Typography variant="h5" gutterBottom>
              Aucun festival trouvé
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Essayez de modifier vos filtres ou votre recherche
            </Typography>
            <Button
              variant="contained"
              onClick={clearFilters}
              sx={{
                backgroundColor: '#fc6c34',
                '&:hover': {
                  backgroundColor: '#c8501a',
                },
              }}
            >
              Réinitialiser les filtres
            </Button>
          </Box>
        )}
      </Container>
      </Box>

      {/* Footer */}
      <GlassFooter component="footer">
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" gutterBottom>
                GrooveNomad
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Découvrez votre musique, explorez votre monde. Trouvez les meilleurs événements musicaux près de chez vous.
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" gutterBottom>
                Liens rapides
              </Typography>
              <Stack spacing={1}>
                {['Événements', 'Communauté', 'Chatbot'].map((link) => (
                  <Typography
                    key={link}
                    variant="body2"
                    component="a"
                    href="#"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      textDecoration: 'none',
                      '&:hover': { color: 'white' },
                    }}
                  >
                    {link}
                  </Typography>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" gutterBottom>
                Support
              </Typography>
              <Stack spacing={1}>
                {['Contact', 'Aide', 'FAQ', 'Conditions'].map((link) => (
                  <Typography
                    key={link}
                    variant="body2"
                    component="a"
                    href="#"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      textDecoration: 'none',
                      '&:hover': { color: 'white' },
                    }}
                  >
                    {link}
                  </Typography>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" gutterBottom>
                Suivez-nous
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                {[FaTwitter, FaInstagram, FaLinkedin, SiTiktok].map((Icon, index) => (
                  <IconButton
                    key={index}
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '&:hover': { backgroundColor: '#fc6c34' }, // Hover en orange
                    }}
                  >
                    <Icon />
                  </IconButton>
                ))}
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
                <IconButton
                  component="a"
                  href="https://wa.me/your-number"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': { backgroundColor: '#25D366' }, // Couleur verte de WhatsApp
                  }}
                >
                  <FaWhatsapp />
                </IconButton>
                <Typography 
                  variant="body2" 
                  component="a"
                  href="https://wa.me/your-number"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.8)',
                    textDecoration: 'none',
                    '&:hover': { color: '#25D366' },
                  }}
                >
                  Discutez avec nous sur WhatsApp
                </Typography>
              </Stack>
            </Grid>
          </Grid>
          <Box sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', mt: 4, pt: 2, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              © 2024 GrooveNomad. Tous droits réservés.
            </Typography>
          </Box>
        </Container>
      </GlassFooter>
    </Box>
  );
};

export default Evenements; 