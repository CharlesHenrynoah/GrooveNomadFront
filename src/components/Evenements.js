import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaFilter, FaMapMarkerAlt, FaCalendarAlt, FaEye, FaHeart, FaMusic, FaGlobe, FaUsers, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';
import { useAuth } from '../context/AuthContext';
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
  IconButton
} from '@mui/material';
import {
  Event as EventIcon,
  People as PeopleIcon,
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

const Evenements = () => {
  const { isAuthenticated } = useAuth();
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

  // Données des festivals avec media, intéressés et images
  const festivals = useMemo(() => [
    {
      id: 1,
      nom: "Tomorrowland",
      dates: "2025-07-08 - 2025-07-10",
      genre: "Trance",
      ville: "West Evan",
      pays: "Canada",
      lieu: "West Evan Indoor Club",
      capacite: 5961,
      siteWeb: "https://www.tomorrowland.com",
      duree: 121,
      hebergement: ["Glamping"],
      aeroport: "West Evan International Airport",
      typeEvenement: "One-stage intimate",
      description: "Renowned for immersive experience and world-class DJs.",
      typeBillet: "Camping Pass",
      devise: "EUR",
      prix: [69, 193, 563],
      image: "/fete_bg.png",
      interessees: 2847
    },
    {
      id: 2,
      nom: "Awakenings Festival",
      dates: "2025-07-08 - 2025-07-14",
      genre: "Trance",
      ville: "Coleside",
      pays: "Germany",
      lieu: "Coleside Open Air",
      capacite: 50713,
      siteWeb: "https://www.awakeningsfestival.com",
      duree: 120,
      hebergement: ["Camping"],
      aeroport: "Coleside International Airport",
      typeEvenement: "Desert gathering",
      description: "Renowned for immersive experience and world-class DJs.",
      typeBillet: "General Admission",
      devise: "USD",
      prix: [51, 165, 583],
      image: "/wallpaper.png",
      interessees: 4281
    },
    {
      id: 3,
      nom: "Ultra Music Festival",
      dates: "2025-07-08 - 2025-07-14",
      genre: "Trance",
      ville: "Donaldstad",
      pays: "India",
      lieu: "Donaldstad Indoor Club",
      capacite: 41877,
      siteWeb: "https://www.ultramusicfestival.com",
      duree: 139,
      hebergement: ["Camping"],
      aeroport: "Donaldstad International Airport",
      typeEvenement: "One-stage intimate",
      description: "Renowned for immersive experience and world-class DJs.",
      typeBillet: "General Admission",
      devise: "USD",
      prix: [60, 174, 575],
      image: "/background_image.png",
      interessees: 3652
    },
    {
      id: 4,
      nom: "Time Warp",
      dates: "2025-07-08 - 2025-07-11",
      genre: "Trance",
      ville: "North Kimberlyshire",
      pays: "India",
      lieu: "North Kimberlyshire Open Air",
      capacite: 77080,
      siteWeb: "https://www.timewarp.de",
      duree: 180,
      hebergement: ["Camping"],
      aeroport: "North Kimberlyshire International Airport",
      typeEvenement: "One-stage intimate",
      description: "Renowned for immersive experience and world-class DJs.",
      typeBillet: "General Admission",
      devise: "EUR",
      prix: [58, 252, 531],
      image: "/background_chat.png",
      interessees: 1923
    },
    {
      id: 5,
      nom: "Creamfields",
      dates: "2025-07-08 - 2025-07-11",
      genre: "Trance",
      ville: "Sandrahaven",
      pays: "India",
      lieu: "Sandrahaven Open Air",
      capacite: 72871,
      siteWeb: "https://www.creamfields.com",
      duree: 88,
      hebergement: ["Camping"],
      aeroport: "Sandrahaven International Airport",
      typeEvenement: "One-stage intimate",
      description: "Renowned for immersive experience and world-class DJs.",
      typeBillet: "General Admission",
      devise: "GBP",
      prix: [75, 202, 572],
      image: "/fete_bg.png",
      interessees: 5647
    },
    {
      id: 6,
      nom: "Sónar",
      dates: "2025-07-08 - 2025-07-11",
      genre: "Trance",
      ville: "Petersbury",
      pays: "Germany",
      lieu: "Petersbury Open Air",
      capacite: 65584,
      siteWeb: "https://www.sonar.es",
      duree: 196,
      hebergement: ["Camping"],
      aeroport: "Petersbury International Airport",
      typeEvenement: "One-stage intimate",
      description: "Renowned for immersive experience and world-class DJs.",
      typeBillet: "General Admission",
      devise: "EUR",
      prix: [66, 178, 521],
      image: "/wallpaper.png",
      interessees: 2134
    },
    {
      id: 7,
      nom: "EXIT Festival",
      dates: "2025-07-08 - 2025-07-11",
      genre: "Trance",
      ville: "Bryantport",
      pays: "India",
      lieu: "Bryantport Open Air",
      capacite: 23928,
      siteWeb: "https://www.exitfest.org",
      duree: 213,
      hebergement: ["Camping"],
      aeroport: "Bryantport International Airport",
      typeEvenement: "One-stage intimate",
      description: "Renowned for immersive experience and world-class DJs.",
      typeBillet: "General Admission",
      devise: "EUR",
      prix: [50, 163, 556],
      image: "/background_image.png",
      interessees: 3456
    },
    {
      id: 8,
      nom: "Dekmantel",
      dates: "2025-07-08 - 2025-07-11",
      genre: "Trance",
      ville: "New Jamietown",
      pays: "India",
      lieu: "New Jamietown Open Air",
      capacite: 41952,
      siteWeb: "https://www.dekmantel.nl",
      duree: 244,
      hebergement: ["Camping"],
      aeroport: "New Jamietown International Airport",
      typeEvenement: "One-stage intimate",
      description: "Renowned for immersive experience and world-class DJs.",
      typeBillet: "General Admission",
      devise: "EUR",
      prix: [53, 196, 558],
      image: "/background_chat.png",
      interessees: 1789
    },
    {
      id: 9,
      nom: "Burning Man",
      dates: "2025-07-08 - 2025-07-15",
      genre: "Trance",
      ville: "Port Caseyland",
      pays: "India",
      lieu: "Port Caseyland Open Air",
      capacite: 6088,
      siteWeb: "https://www.burningman.org",
      duree: 206,
      hebergement: ["Camping"],
      aeroport: "Port Caseyland International Airport",
      typeEvenement: "Desert gathering",
      description: "Renowned for immersive experience and world-class DJs.",
      typeBillet: "General Admission",
      devise: "USD",
      prix: [68, 175, 546],
      image: "/fete_bg.png",
      interessees: 7823
    },
    {
      id: 10,
      nom: "Electric Daisy Carnival",
      dates: "2025-07-08 - 2025-07-11",
      genre: "Trance",
      ville: "Stephenshire",
      pays: "India",
      lieu: "Stephenshire Open Air",
      capacite: 18845,
      siteWeb: "https://www.electricdaisycarnival.com",
      duree: 221,
      hebergement: ["Camping"],
      aeroport: "Stephenshire International Airport",
      typeEvenement: "One-stage intimate",
      description: "Renowned for immersive experience and world-class DJs.",
      typeBillet: "General Admission",
      devise: "USD",
      prix: [59, 197, 524],
      image: "/wallpaper.png",
      interessees: 4567
    },
    {
      id: 11,
      nom: "Coachella",
      dates: "2025-07-08 - 2025-07-12",
      genre: "Trance",
      ville: "South Gerald",
      pays: "India",
      lieu: "South Gerald Open Air",
      capacite: 73731,
      siteWeb: "https://www.coachella.com",
      duree: 226,
      hebergement: ["Hotel", "Airbnb"],
      aeroport: "South Gerald International Airport",
      typeEvenement: "Desert gathering",
      description: "Renowned for immersive experience and world-class DJs.",
      typeBillet: "Camping Pass",
      devise: "EUR",
      prix: [69, 252, 538],
      image: "/background_image.png",
      interessees: 8912
    },
    {
      id: 12,
      nom: "Primavera Sound",
      dates: "2025-07-08 - 2025-07-14",
      genre: "Trance",
      ville: "South Gerald",
      pays: "India",
      lieu: "South Gerald Open Air",
      capacite: 73731,
      siteWeb: "https://www.primaverasound.com",
      duree: 226,
      hebergement: ["Hotel", "Airbnb"],
      aeroport: "South Gerald International Airport",
      typeEvenement: "Desert gathering",
      description: "Renowned for immersive experience and world-class DJs.",
      typeBillet: "Camping Pass",
      devise: "EUR",
      prix: [69, 252, 538],
      image: "/background_chat.png",
      interessees: 3241
    }
  ], []);

  // Options de filtres basées sur les données
  const filterOptions = {
    genre: [
      { id: 'Trance', label: 'Trance', color: '#3498db' },
      { id: 'Hardstyle', label: 'Hardstyle', color: '#e74c3c' },
      { id: 'EDM', label: 'EDM', color: '#f39c12' },
      { id: 'Techno', label: 'Techno', color: '#9b59b6' },
      { id: 'House', label: 'House', color: '#1abc9c' },
      { id: 'Psytrance', label: 'Psytrance', color: '#8e44ad' }
    ],
    pays: [
      { id: 'Canada', label: 'Canada' },
      { id: 'Germany', label: 'Allemagne' },
      { id: 'USA', label: 'États-Unis' },
      { id: 'Italy', label: 'Italie' },
      { id: 'Serbia', label: 'Serbie' },
      { id: 'Vietnam', label: 'Vietnam' },
      { id: 'Spain', label: 'Espagne' },
      { id: 'Thailand', label: 'Thaïlande' },
      { id: 'UK', label: 'Royaume-Uni' },
      { id: 'India', label: 'Inde' },
      { id: 'Belgium', label: 'Belgique' },
      { id: 'Portugal', label: 'Portugal' },
      { id: 'Hungary', label: 'Hongrie' },
      { id: 'Australia', label: 'Australie' },
      { id: 'Switzerland', label: 'Suisse' },
      { id: 'Iceland', label: 'Islande' },
      { id: 'Netherlands', label: 'Pays-Bas' },
      { id: 'Croatia', label: 'Croatie' },
      { id: 'France', label: 'France' }
    ],
    hebergement: [
      { id: 'Glamping', label: 'Glamping', icon: '🏕️' },
      { id: 'Camping', label: 'Camping', icon: '⛺' },
      { id: 'Hotel', label: 'Hôtel', icon: '🏨' },
      { id: 'Bungalow', label: 'Bungalow', icon: '🏠' },
      { id: 'Airbnb', label: 'Airbnb', icon: '🏡' }
    ],
    typeEvenement: [
      { id: 'One-stage intimate', label: 'Scène unique intime' },
      { id: 'Multi-stage', label: 'Multi-scènes' },
      { id: 'Desert gathering', label: 'Rassemblement désert' },
      { id: 'Forest rave', label: 'Rave forestière' }
    ],
    devise: [
      { id: 'EUR', label: 'Euro (€)' },
      { id: 'USD', label: 'Dollar ($)' },
      { id: 'GBP', label: 'Livre (£)' }
    ]
  };

  // Filtrer les événements
  useEffect(() => {
    let filtered = festivals;

    // Filtre par recherche textuelle
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.ville.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.pays.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par genre
    if (activeFilters.genre.length > 0) {
      filtered = filtered.filter(event => 
        activeFilters.genre.includes(event.genre)
      );
    }

    // Filtre par pays
    if (activeFilters.pays.length > 0) {
      filtered = filtered.filter(event => 
        activeFilters.pays.includes(event.pays)
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
        activeFilters.typeEvenement.includes(event.typeEvenement)
      );
    }

    // Filtre par devise
    if (activeFilters.devise.length > 0) {
      filtered = filtered.filter(event => 
        activeFilters.devise.includes(event.devise)
      );
    }

    setFilteredEvents(filtered);
  }, [searchTerm, activeFilters, festivals]);

  // Initialiser les événements filtrés
  useEffect(() => {
    setFilteredEvents(festivals);
  }, [festivals]);

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

  // Formater les dates en format court
  const formatDateRangeShort = (dateString) => {
    const [startDate, endDate] = dateString.split(' - ');
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const formatDateShort = (date) => {
      const day = date.getDate();
      const month = date.toLocaleDateString('fr-FR', { month: 'short' });
      return `${day} ${month}.`;
    };
    
    return `${formatDateShort(start)} - ${formatDateShort(end)}`;
  };

  // Gérer l'affichage des détails
  const handleViewDetails = (eventId) => {
    // Navigation handled by Link component
  };

  const navigationItems = [
    { icon: <HomeIcon />, text: 'HOME', href: '/' },
    { icon: <EventIcon />, text: 'ÉVÉNEMENTS', href: '/evenements' },
    { icon: <PeopleIcon />, text: 'COMMUNAUTÉ', href: '#communaute' },
    { icon: <SmartToyIcon />, text: 'CHATBOT', href: '/chatbot' },
    { 
      icon: <PersonIcon />, 
      text: isAuthenticated ? 'MON COMPTE' : 'SE CONNECTER', 
      href: isAuthenticated ? '/mon-compte' : '/connexion' 
    },
  ];

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
        <Grid container spacing={3}>
          {filteredEvents.map(event => (
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
                    image={event.image}
                    alt={event.nom}
                    sx={{
                      borderBottom: '1px solid rgba(255,255,255,0.1)'
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
                      {event.nom}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(0,0,0,0.6)',
                        marginBottom: '0.75rem',
                        fontSize: '0.95rem'
                      }}
                    >
                      {event.lieu}
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
                        {formatDateRangeShort(event.dates)}
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          display: 'none'
                        }}
                      >
                        {event.prix[0]}€
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
                        {event.ville}, {event.pays}
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      <Chip
                        label={event.genre}
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
                        {event.interessees}
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
          ))}
        </Grid>

        {filteredEvents.length === 0 && (
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
              <Stack direction="row" spacing={1}>
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