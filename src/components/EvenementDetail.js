import React, { useState, useMemo, useEffect } from 'react';
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
  FaGlobe,
  FaParking,
  FaInfoCircle,
  FaPlane,
  FaBed,
  FaUtensils,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaWhatsapp
} from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';
import { useAuth } from '../context/AuthContext';
import { getFestivalsFromAirtable } from '../services/airtableService';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Stack, 
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Event as EventIcon,
  People as PeopleIcon,
  SmartToy as SmartToyIcon,
  Person as PersonIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import ReservationForm from './ReservationForm';
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

  const [festivalsFromAirtable, setFestivalsFromAirtable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupérer les données depuis Airtable
  useEffect(() => {
    const loadFestivalsFromAirtable = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Récupération des festivals depuis Airtable...');
        
        const airtableData = await getFestivalsFromAirtable();
        setFestivalsFromAirtable(airtableData);
        
        console.log('✅ Festivals récupérés:', airtableData.length);
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des festivals:', error);
        setError('Impossible de récupérer les données des festivals depuis Airtable');
      } finally {
        setLoading(false);
      }
    };

    loadFestivalsFromAirtable();
  }, []);

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

  // Adapter les données d'Airtable pour l'affichage
  const festivals = useMemo(() => {
    return festivalsFromAirtable.map(event => ({
      id: event.id,
      nom: event.nom,
      lieu: `${event.ville}, ${event.pays}`,
      date: event.dates || `${event.dateDebut} - ${event.dateFin}`,
      annee: "2025",
      media: [
        {
          type: "image",
          src: event.image || "/fete_bg.png",
          title: `${event.nom} - Image principale`
        },
        ...event.medias.map((media, index) => ({
          type: "image",
          src: media,
          title: `${event.nom} - Image ${index + 1}`
        }))
      ],
      capacite: event.capacite?.toString() || "0",
      genres: [event.genre],
             prix: event.prix && event.prix[0] ? `${event.prix[0]}€` : "Prix à déterminer",
      description: event.description || `Découvrez le festival ${event.nom} à ${event.ville}, ${event.pays}. Un événement unique dans le genre ${event.genre}.`,
      billets: [
        // Passes Festival basiques
        {
          id: "pass_standard",
          nom: "Pass Standard",
          prix: event.prix?.[0] || 99,
          type: "pass",
          description: `Accès complet au festival ${event.nom}`,
          icon: <FaTicketAlt />
        },
        {
          id: "pass_vip",
          nom: "Pass VIP",
          prix: event.prix?.[1] || 149,
          type: "pass",
          description: "Accès privilégié avec zone VIP",
          icon: <FaTicketAlt />
        },
        {
          id: "pass_premium",
          nom: "Pass Premium",
          prix: event.prix?.[2] || 199,
          type: "pass",
          description: "Accès premium avec tous les avantages",
          icon: <FaTicketAlt />
        }
      ],
      lineup: event.lineup || [
        { nom: "Artiste 1", photo: "/logo192.png" },
        { nom: "Artiste 2", photo: "/logo192.png" },
        { nom: "Artiste 3", photo: "/logo192.png" }
      ],
      // Passer toutes les données brutes pour le formulaire
      rawAirtableData: event
    }));
  }, [festivalsFromAirtable]);

  const festival = festivals.find(f => f.id === id) || (festivals.length > 0 ? festivals[0] : null);

  const handleInterest = () => {
    setIsInterested(!isInterested);
    setInterestedCount(prev => isInterested ? prev - 1 : prev + 1);
  };

  const nextSlide = () => {
    if (festival && festival.media && festival.media.length > 0) {
    setCurrentSlide((prev) => (prev + 1) % festival.media.length);
    }
  };

  const prevSlide = () => {
    if (festival && festival.media && festival.media.length > 0) {
    setCurrentSlide((prev) => (prev - 1 + festival.media.length) % festival.media.length);
    }
  };



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
        <Typography variant="h6" sx={{ color: 'white' }}>
          Chargement des détails du festival depuis Airtable...
        </Typography>
      </Box>
    );
  }

  // Afficher une erreur si les données n'ont pas pu être chargées
  if (error) {
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
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Link to="/evenements" className="back-button">
          <FaArrowLeft /> Retour aux événements
        </Link>
      </Box>
    );
  }

  // Afficher un message si aucun festival n'est trouvé
  if (!loading && (!festival || !festival.nom)) {
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
        <Typography variant="h6" sx={{ color: 'white' }}>
          Festival non trouvé
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          ID recherché: {id}
        </Typography>
        <Link to="/evenements" className="back-button">
          <FaArrowLeft /> Retour aux événements
        </Link>
      </Box>
    );
  }

  // Afficher un loader si les données ne sont pas encore prêtes
  if (loading || !festival) {
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
        <Typography variant="h6" sx={{ color: 'white' }}>
          Chargement des détails du festival...
        </Typography>
      </Box>
    );
  }

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
        </div>

        {/* Section de réservation en bas */}
        <div className="reservation-section">
          <h2><FaTicketAlt /> Réserver votre place</h2>
          <ReservationForm festival={festival ? festival.rawAirtableData : null} />
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

export default EvenementDetail; 