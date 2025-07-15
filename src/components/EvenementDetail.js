import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaMapMarkerAlt, 
  FaHeart, 
  FaShare, 
  FaCalendarAlt, 
  FaUsers, 
  FaMusic, 
  FaEuroSign, 
  FaTicketAlt, 
  FaPlay, 
  FaChevronLeft, 
  FaChevronRight, 
  FaPlus, 
  FaMinus, 
  FaShoppingCart,
  FaGlobe,
  FaParking,
  FaInfoCircle,
  FaPlane,
  FaBed,
  FaUtensils,
  FaTwitter,
  FaInstagram,
  FaLinkedin
} from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';
import { useAuth } from '../context/AuthContext';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
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
import './EvenementDetail.css';

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

const EvenementDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [isInterested, setIsInterested] = useState(false);
  const [interestedCount, setInterestedCount] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [reservation, setReservation] = useState({
    nombrePersonnes: 1,
    passes: {}
  });

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

  const festivals = useMemo(() => [
    {
      id: 1,
      nom: "Les Nuits Secrètes",
      lieu: "Aulnoye-Aymeries, France",
      date: "Du ven 11 juil. à 15:00 / Au dim 13 juil. à 23:59",
      annee: "2025",
      media: [
        {
          type: "video",
          src: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          thumbnail: "/fete_bg.png",
          title: "Aftermovie Les Nuits Secrètes 2024"
        },
        {
          type: "image",
          src: "/fete_bg.png",
          title: "Scène principale"
        },
        {
          type: "image",
          src: "/wallpaper.png",
          title: "Ambiance festival"
        },
        {
          type: "image",
          src: "/background_image.png",
          title: "Vue aérienne"
        }
      ],
      capacite: "25000",
      genres: ["Électro", "Techno", "House"],
      prix: "89€",
      description: "Un festival unique dans un cadre magique au cœur de la Thiérache. Les Nuits Secrètes propose une programmation éclectique mêlant électro, rock et découvertes dans un environnement préservé et authentique.",
      billets: [
        // Passes Festival
        {
          id: "pass3j",
          nom: "Pass 3 jours",
          prix: 89,
          type: "pass",
          description: "Accès complet aux 3 jours du festival avec camping inclus",
          icon: <FaTicketAlt />
        },
        {
          id: "pass1j",
          nom: "Pass 1 jour",
          prix: 35,
          type: "pass",
          description: "Accès pour une journée au choix",
          icon: <FaTicketAlt />
        },
        {
          id: "passvip",
          nom: "Pass VIP",
          prix: 149,
          type: "pass",
          description: "Accès privilégié avec zone VIP et restauration",
          icon: <FaTicketAlt />
        },
        // Billets d'avion
        {
          id: "vol_paris",
          nom: "Vol Paris → Lille",
          prix: 120,
          type: "flight",
          description: "Vol aller-retour depuis Paris CDG vers Lille",
          icon: <FaPlane />
        },
        {
          id: "vol_lyon",
          nom: "Vol Lyon → Lille",
          prix: 180,
          type: "flight",
          description: "Vol aller-retour depuis Lyon vers Lille",
          icon: <FaPlane />
        },
        {
          id: "vol_marseille",
          nom: "Vol Marseille → Lille",
          prix: 200,
          type: "flight",
          description: "Vol aller-retour depuis Marseille vers Lille",
          icon: <FaPlane />
        },
        // Packages complets
        {
          id: "package_complet",
          nom: "Package Festival + Vol",
          prix: 299,
          type: "package",
          description: "Pass 3 jours + Vol Paris + Transferts inclus",
          icon: <FaGlobe />
        }
      ],
      lineup: [
        { nom: "Disclosure", photo: "/logo192.png" },
        { nom: "Moderat", photo: "/logo192.png" },
        { nom: "Bicep", photo: "/logo192.png" },
        { nom: "Bonobo", photo: "/logo192.png" },
        { nom: "Caribou", photo: "/logo192.png" },
        { nom: "Flume", photo: "/logo192.png" }
      ]
    },
    {
      id: 2,
      nom: "Tomorrowland",
      lieu: "Boom, Belgium",
      date: "Du ven 18 juil. à 14:00 / Au dim 27 juil. à 23:59",
      annee: "2025",
      media: [
        {
          type: "video",
          src: "https://www.youtube.com/embed/UWLIgjB9gGw",
          thumbnail: "/fete_bg.png",
          title: "Tomorrowland 2024 Official Aftermovie"
        },
        {
          type: "image",
          src: "/fete_bg.png",
          title: "Mainstage Tomorrowland"
        },
        {
          type: "image",
          src: "/wallpaper.png",
          title: "Dreamville Camping"
        },
        {
          type: "image",
          src: "/background_image.png",
          title: "Festival grounds"
        }
      ],
      capacite: "400000",
      genres: ["EDM", "House", "Trance"],
      prix: "350€",
      description: "Le plus grand festival de musique électronique au monde. Tomorrowland vous transporte dans un monde fantastique avec les plus grands DJs de la planète.",
      billets: [
        // Passes Festival
        {
          id: "weekend1",
          nom: "Weekend 1",
          prix: 350,
          type: "pass",
          description: "Accès complet au premier weekend",
          icon: <FaTicketAlt />
        },
        {
          id: "weekend2",
          nom: "Weekend 2",
          prix: 350,
          type: "pass",
          description: "Accès complet au deuxième weekend",
          icon: <FaTicketAlt />
        },
        {
          id: "fullmadness",
          nom: "Full Madness",
          prix: 650,
          type: "pass",
          description: "Accès aux deux weekends complets",
          icon: <FaTicketAlt />
        },
        // Billets d'avion
        {
          id: "vol_paris_bxl",
          nom: "Vol Paris → Bruxelles",
          prix: 150,
          type: "flight",
          description: "Vol aller-retour depuis Paris vers Bruxelles",
          icon: <FaPlane />
        },
        {
          id: "vol_lyon_bxl",
          nom: "Vol Lyon → Bruxelles",
          prix: 220,
          type: "flight",
          description: "Vol aller-retour depuis Lyon vers Bruxelles",
          icon: <FaPlane />
        },
        {
          id: "vol_madrid_bxl",
          nom: "Vol Madrid → Bruxelles",
          prix: 180,
          type: "flight",
          description: "Vol aller-retour depuis Madrid vers Bruxelles",
          icon: <FaPlane />
        },
        {
          id: "vol_london_bxl",
          nom: "Vol Londres → Bruxelles",
          prix: 160,
          type: "flight",
          description: "Vol aller-retour depuis Londres vers Bruxelles",
          icon: <FaPlane />
        },
        // Packages complets
        {
          id: "dreamville_package",
          nom: "Package Dreamville",
          prix: 899,
          type: "package",
          description: "Weekend 1 + Vol Paris + Camping Dreamville + Repas",
          icon: <FaGlobe />
        },
        {
          id: "premium_package",
          nom: "Package Premium",
          prix: 1299,
          type: "package",
          description: "Full Madness + Vol + Hôtel 4* + Transferts VIP",
          icon: <FaGlobe />
        }
      ],
      lineup: [
        { nom: "Martin Garrix", photo: "/logo192.png" },
        { nom: "Armin van Buuren", photo: "/logo192.png" },
        { nom: "Tiësto", photo: "/logo192.png" },
        { nom: "David Guetta", photo: "/logo192.png" },
        { nom: "Hardwell", photo: "/logo192.png" },
        { nom: "Afrojack", photo: "/logo192.png" }
      ]
    }
  ], []);

  const festival = festivals.find(f => f.id === parseInt(id)) || festivals[0];

  const handleInterest = () => {
    setIsInterested(!isInterested);
    setInterestedCount(prev => isInterested ? prev - 1 : prev + 1);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % festival.media.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + festival.media.length) % festival.media.length);
  };

  const handleQuantityChange = (ticketId, change) => {
    setReservation(prev => ({
      ...prev,
      passes: {
        ...prev.passes,
        [ticketId]: Math.max(0, (prev.passes[ticketId] || 0) + change)
      }
    }));
  };

  const getTotalPasses = () => {
    return Object.values(reservation.passes).reduce((total, quantity) => total + quantity, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(reservation.passes).reduce((total, [ticketId, quantity]) => {
      const ticket = festival.billets.find(b => b.id === ticketId);
      return total + (ticket ? ticket.prix * quantity : 0);
    }, 0);
  };

  // Grouper les billets par type
  const groupedTickets = useMemo(() => {
    const grouped = {
      pass: [],
      flight: [],
      package: []
    };
    
    festival.billets.forEach(ticket => {
      if (grouped[ticket.type]) {
        grouped[ticket.type].push(ticket);
      }
    });
    
    return grouped;
  }, [festival.billets]);

  const getTicketTypeLabel = (type) => {
    switch(type) {
      case 'pass': return 'Passes Festival';
      case 'flight': return 'Billets d\'Avion';
      case 'package': return 'Packages Complets';
      default: return 'Autres';
    }
  };

  const getTicketTypeIcon = (type) => {
    switch(type) {
      case 'pass': return <FaTicketAlt />;
      case 'flight': return <FaPlane />;
      case 'package': return <FaGlobe />;
      default: return <FaTicketAlt />;
    }
  };

  return (
    <Box 
      className="evenement-detail-page"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        margin: 0,
        padding: 0,
      }}
    >
      {/* Contenu principal */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '120px' }}>
      {/* Header moderne inspiré du chatbot */}
      <div className="detail-header">
        <Link to="/evenements" className="back-button">
          <FaArrowLeft /> Retour aux événements
        </Link>
        <div className="header-actions">
          <button className="action-btn" onClick={handleInterest}>
            <FaHeart className={isInterested ? 'interested' : ''} />
            {interestedCount}
          </button>
          <button className="action-btn">
            <FaShare />
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="detail-content">
        {/* Section hero avec image/vidéo */}
        <div className="hero-section">
          <div className="media-container">
            <div className="media-carousel">
              {festival.media[currentSlide].type === 'video' ? (
                <div className="video-wrapper">
                  <iframe
                    src={festival.media[currentSlide].src}
                    title={festival.media[currentSlide].title}
                    allowFullScreen
                  />
                </div>
              ) : (
                <img
                  src={festival.media[currentSlide].src}
                  alt={festival.media[currentSlide].title}
                  className="hero-image"
                />
              )}
              
              {festival.media.length > 1 && (
                <>
                  <button className="carousel-nav prev" onClick={prevSlide}>
                    <FaChevronLeft />
                  </button>
                  <button className="carousel-nav next" onClick={nextSlide}>
                    <FaChevronRight />
                  </button>
                </>
              )}
            </div>
            
            <div className="media-indicators">
              {festival.media.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>

          <div className="hero-info">
            <h1 className="event-title">{festival.nom}</h1>
            <div className="event-meta">
              <div className="meta-item">
                <FaCalendarAlt />
                <span>{festival.date}</span>
              </div>
              <div className="meta-item">
                <FaMapMarkerAlt />
                <span>{festival.lieu}</span>
              </div>
              <div className="meta-item">
                <FaUsers />
                <span>{festival.capacite} personnes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section principale avec disposition en colonnes */}
        <div className="main-sections">
          {/* Colonne de gauche - Informations */}
          <div className="info-column">
            {/* Description */}
            <div className="info-card">
              <h2><FaInfoCircle /> À propos</h2>
              <p>{festival.description}</p>
            </div>

            {/* Genres musicaux */}
            <div className="info-card">
              <h2><FaMusic /> Genres</h2>
              <div className="genres-list">
                {festival.genres.map((genre, index) => (
                  <span key={index} className="genre-chip">{genre}</span>
                ))}
              </div>
            </div>

            {/* Lineup */}
            <div className="info-card">
              <h2><FaUsers /> Lineup</h2>
              <div className="lineup-grid">
                {festival.lineup.map((artist, index) => (
                  <div key={index} className="artist-card">
                    <img src={artist.photo} alt={artist.nom} />
                    <span>{artist.nom}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Informations pratiques */}
            <div className="info-card">
              <h2><FaGlobe /> Informations pratiques</h2>
              <div className="practical-info">
                <div className="info-item">
                  <FaParking />
                  <span>Parking gratuit disponible</span>
                </div>
                <div className="info-item">
                  <FaTicketAlt />
                  <span>Billets remboursables jusqu'à 48h</span>
                </div>
                <div className="info-item">
                  <FaPlane />
                  <span>Transferts aéroport disponibles</span>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne de droite - Réservation */}
          <div className="booking-column">
            <div className="booking-card">
              <h2><FaShoppingCart /> Réservation</h2>
              
              {/* Affichage des billets par catégorie */}
              {Object.entries(groupedTickets).map(([type, tickets]) => (
                tickets.length > 0 && (
                  <div key={type} className="ticket-category">
                    <h3 className="category-title">
                      {getTicketTypeIcon(type)}
                      {getTicketTypeLabel(type)}
                    </h3>
                    
                    {tickets.map((ticket) => (
                      <div key={ticket.id} className={`ticket-option ${ticket.type}`}>
                        <div className="ticket-info">
                          <div className="ticket-header">
                            <span className="ticket-icon">{ticket.icon}</span>
                            <div className="ticket-name">{ticket.nom}</div>
                          </div>
                          <div className="ticket-description">{ticket.description}</div>
                          <div className="ticket-price">{ticket.prix}€</div>
                        </div>
                        <div className="ticket-controls">
                          <button 
                            className="qty-btn"
                            onClick={() => handleQuantityChange(ticket.id, -1)}
                            disabled={!reservation.passes[ticket.id]}
                          >
                            <FaMinus />
                          </button>
                          <span className="quantity">{reservation.passes[ticket.id] || 0}</span>
                          <button 
                            className="qty-btn"
                            onClick={() => handleQuantityChange(ticket.id, 1)}
                          >
                            <FaPlus />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ))}

              {/* Résumé de la commande */}
              {getTotalPasses() > 0 && (
                <div className="order-summary">
                  <div className="summary-line">
                    <span>Total articles: {getTotalPasses()}</span>
                  </div>
                  <div className="summary-line total">
                    <span>Total: {getTotalPrice()}€</span>
                  </div>
                  <button className="book-btn">
                    <FaShoppingCart />
                    Demander un devis
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation bottom */}
      <GlassNavbar>
        {navigationItems.map((item, index) => (
          <GlassNavItemNew
            key={index}
            component={item.href.startsWith('/') ? Link : 'a'}
            to={item.href.startsWith('/') ? item.href : undefined}
            href={item.href.startsWith('#') ? item.href : undefined}
          >
            {item.icon}
            <span>{item.text}</span>
          </GlassNavItemNew>
        ))}
      </GlassNavbar>
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

export default EvenementDetail; 