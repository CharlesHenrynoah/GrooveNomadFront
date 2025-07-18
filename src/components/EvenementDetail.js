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
  FaTicketAlt, 
  FaChevronLeft, 
  FaChevronRight, 
  FaGlobe,
  FaParking,
  FaInfoCircle,
  FaPlane,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaWhatsapp
} from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';
import { useAuth } from '../context/AuthContext';
import { getFestivalsFromAirtable, updateInterestedCount, checkUserLike, saveUserLike, removeUserLike } from '../services/airtableService';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Stack, 
  IconButton,
  Alert
} from '@mui/material';
import {
  Event as EventIcon,
  SmartToy as SmartToyIcon,
  Person as PersonIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import ReservationForm from './ReservationForm';
import './EvenementDetail.css';

// Fonction pour détecter si une URL est une vidéo
const isVideoUrl = (url) => {
  if (!url) return false;
  
  const videoPatterns = [
    /youtube\.com\/watch/i,
    /youtube\.com\/embed/i,
    /youtu\.be\//i,
    /vimeo\.com/i,
    /dailymotion\.com/i,
    /twitch\.tv/i,
    /\.mp4$/i,
    /\.webm$/i,
    /\.ogg$/i,
    /\.mov$/i,
    /\.avi$/i
  ];
  
  return videoPatterns.some(pattern => pattern.test(url));
};

// Fonction pour convertir les URL YouTube en format embed
const convertToEmbedUrl = (url) => {
  if (!url) return url;
  
  // YouTube watch URL vers embed
  const youtubeWatchMatch = url.match(/youtube\.com\/watch\?v=([^&]+)/i);
  if (youtubeWatchMatch) {
    const embedUrl = `https://www.youtube.com/embed/${youtubeWatchMatch[1]}`;
    console.log(`🎥 Conversion YouTube: ${url} → ${embedUrl}`);
    return embedUrl;
  }
  
  // YouTube youtu.be URL vers embed
  const youtubeShortMatch = url.match(/youtu\.be\/([^?]+)/i);
  if (youtubeShortMatch) {
    const embedUrl = `https://www.youtube.com/embed/${youtubeShortMatch[1]}`;
    console.log(`🎥 Conversion YouTube court: ${url} → ${embedUrl}`);
    return embedUrl;
  }
  
  // Vimeo URL vers embed
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/i);
  if (vimeoMatch) {
    const embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    console.log(`🎥 Conversion Vimeo: ${url} → ${embedUrl}`);
    return embedUrl;
  }
  
  // Retourner l'URL originale si aucune conversion n'est nécessaire
  console.log(`🎥 URL vidéo inchangée: ${url}`);
  return url;
};

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
  minWidth: '600px',
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
  const { isAuthenticated, user } = useAuth();
  const [isInterested, setIsInterested] = useState(false);
  const [interestedCount, setInterestedCount] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isUpdatingLike, setIsUpdatingLike] = useState(false);

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
    { icon: <SmartToyIcon />, text: 'CHATBOT', href: '/chatbot' },
    { 
      icon: <PersonIcon />, 
      text: isAuthenticated ? 'MON COMPTE' : 'SE CONNECTER', 
      href: isAuthenticated ? '/mon-compte' : '/connexion' 
    },
  ];

  // Adapter les données d'Airtable pour l'affichage
  const festivals = useMemo(() => {
    return festivalsFromAirtable.map(event => {
      console.log(`🎪 Traitement du festival: ${event.nom}`);
      console.log(`📹 Médias disponibles:`, {
        media1: event.media1Festival,
        media2: event.media2Festival,
        media3: event.media3Festival
      });
      
      const festival = {
      id: event.id,
      nom: event.nom,
      lieu: `${event.ville}, ${event.pays}`,
      date: event.dates || `${event.dateDebut} - ${event.dateFin}`,
      annee: "2025",
      media: [
        // Media 1 Festival en premier (détection automatique vidéo/image)
        event.media1Festival ? (() => {
          const isVideo = isVideoUrl(event.media1Festival);
          const src = isVideo ? convertToEmbedUrl(event.media1Festival) : event.media1Festival;
          console.log(`🎪 Media 1 Festival - ${event.nom}:`, { isVideo, originalUrl: event.media1Festival, finalSrc: src });
          return {
            type: isVideo ? "video" : "image",
            src: src,
            title: `${event.nom} - Media 1`
          };
        })() : null,
        // Media 2 Festival en deuxième (détection automatique vidéo/image)
        event.media2Festival ? (() => {
          const isVideo = isVideoUrl(event.media2Festival);
          const src = isVideo ? convertToEmbedUrl(event.media2Festival) : event.media2Festival;
          console.log(`🎪 Media 2 Festival - ${event.nom}:`, { isVideo, originalUrl: event.media2Festival, finalSrc: src });
          return {
            type: isVideo ? "video" : "image",
            src: src,
            title: `${event.nom} - Media 2`
          };
        })() : null,
        // Media 3 Festival en troisième (détection automatique vidéo/image)
        event.media3Festival ? (() => {
          const isVideo = isVideoUrl(event.media3Festival);
          const src = isVideo ? convertToEmbedUrl(event.media3Festival) : event.media3Festival;
          console.log(`🎪 Media 3 Festival - ${event.nom}:`, { isVideo, originalUrl: event.media3Festival, finalSrc: src });
          return {
            type: isVideo ? "video" : "image",
            src: src,
            title: `${event.nom} - Media 3`
          };
        })() : null,
        // Image de fallback si aucun média n'est disponible
        !event.media1Festival && !event.media2Festival && !event.media3Festival ? {
          type: "image",
          src: "/fete_bg.png",
          title: `${event.nom} - Image par défaut`
        } : null
      ].filter(media => media),
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
    };
    
    console.log(`🎪 Festival traité: ${festival.nom}, médias: ${festival.media.length}`);
    festival.media.forEach((media, index) => {
      console.log(`📹 Media ${index + 1}: ${media.type} - ${media.src}`);
    });
    
    return festival;
  });
  }, [festivalsFromAirtable]);

  const festival = festivals.find(f => f.id === id) || (festivals.length > 0 ? festivals[0] : null);

  // Charger l'état initial du like depuis Airtable et localStorage
  useEffect(() => {
    if (festival && user) {
      // Vérifier si l'utilisateur a déjà liké ce festival
      const hasLiked = checkUserLike(user.id.toString(), festival.id);
      setIsInterested(hasLiked);
      
      // Charger le compteur depuis les données Airtable
      const currentCount = parseInt(festival.rawAirtableData?.['Nombre de personne interresse'] || 0);
      setInterestedCount(currentCount);
      
      console.log(`🎪 Festival ${festival.nom} - Utilisateur ${user.id} a déjà liké: ${hasLiked}, Compteur actuel: ${currentCount}`);
    }
  }, [festival, user]);

  const handleInterest = async () => {
    // Vérifier si l'utilisateur est connecté
    if (!isAuthenticated || !user) {
      alert('Vous devez être connecté pour marquer votre intérêt pour ce festival.');
      return;
    }

    if (!festival) {
      console.error('Aucun festival sélectionné');
      return;
    }

    // Éviter les clics multiples
    if (isUpdatingLike) {
      return;
    }

    setIsUpdatingLike(true);
    
    try {
      const userId = user.id.toString();
      const festivalId = festival.id;
      
      if (isInterested) {
        // L'utilisateur veut retirer son like
        console.log(`💔 L'utilisateur ${userId} retire son like pour le festival ${festivalId}`);
        
        // Supprimer le like de l'utilisateur
        const likeSaved = removeUserLike(userId, festivalId);
        
        if (likeSaved) {
          // Décrémenter le compteur dans Airtable
          const result = await updateInterestedCount(festivalId, -1);
          
          if (result.success) {
            setIsInterested(false);
            setInterestedCount(result.newCount);
            console.log(`✅ Like retiré avec succès, nouveau compteur: ${result.newCount}`);
          } else {
            console.error('Erreur lors de la mise à jour du compteur:', result.error);
            alert('Erreur lors de la mise à jour. Veuillez réessayer.');
          }
        }
      } else {
        // L'utilisateur veut ajouter son like
        console.log(`💝 L'utilisateur ${userId} ajoute son like pour le festival ${festivalId}`);
        
        // Sauvegarder le like de l'utilisateur
        const likeSaved = saveUserLike(userId, festivalId);
        
        if (likeSaved) {
          // Incrémenter le compteur dans Airtable
          const result = await updateInterestedCount(festivalId, 1);
          
          if (result.success) {
            setIsInterested(true);
            setInterestedCount(result.newCount);
            console.log(`✅ Like ajouté avec succès, nouveau compteur: ${result.newCount}`);
          } else {
            console.error('Erreur lors de la mise à jour du compteur:', result.error);
            alert('Erreur lors de la mise à jour. Veuillez réessayer.');
          }
        } else {
          console.log(`ℹ️ L'utilisateur ${userId} a déjà liké ce festival`);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la gestion du like:', error);
      alert('Erreur lors de la mise à jour. Veuillez réessayer.');
    } finally {
      setIsUpdatingLike(false);
    }
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



  // Afficher un message simple pendant le chargement
  if (loading) {
    return (
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundImage: `url(${process.env.PUBLIC_URL}/81681997_10157319674209177_5136362337158037504_o-1.jpg)`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          gap: 2
        }}
      >
        <Typography variant="h6" sx={{ color: 'white' }}>
          Chargement des détails du festival...
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
          backgroundImage: `url(${process.env.PUBLIC_URL}/81681997_10157319674209177_5136362337158037504_o-1.jpg)`,
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
          backgroundImage: `url(${process.env.PUBLIC_URL}/81681997_10157319674209177_5136362337158037504_o-1.jpg)`,
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

  // Afficher un message simple si les données ne sont pas encore prêtes
  if (loading || !festival) {
    return (
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundImage: `url(${process.env.PUBLIC_URL}/81681997_10157319674209177_5136362337158037504_o-1.jpg)`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          gap: 2
        }}
      >
        <Typography variant="h6" sx={{ color: 'white' }}>
          Chargement en cours...
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
        backgroundImage: `url(${process.env.PUBLIC_URL}/81681997_10157319674209177_5136362337158037504_o-1.jpg)`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Contenu principal */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        paddingBottom: '120px',
        justifyContent: { xs: 'center', md: 'flex-start' },
        alignItems: 'center',
        minHeight: { xs: '100vh', md: 'auto' }
      }}>
      {/* Header moderne inspiré du chatbot */}
      <div className="detail-header">
        <Link to="/evenements" className="back-button">
          <FaArrowLeft /> Retour aux événements
        </Link>
        <div className="header-actions">
          <button 
            className="action-btn" 
            onClick={handleInterest}
            disabled={isUpdatingLike}
            title={isAuthenticated ? 
              (isInterested ? 'Retirer votre intérêt' : 'Marquer votre intérêt') : 
              'Connectez-vous pour marquer votre intérêt'
            }
          >
            <FaHeart className={isInterested ? 'interested' : ''} />
            {isUpdatingLike ? '...' : interestedCount}
          </button>
          <button className="action-btn">
            <FaShare />
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="detail-content" style={{ 
        width: '100%', 
        maxWidth: { xs: '95%', md: '1200px' },
        margin: { xs: '0 auto', md: '0' }
      }}>
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
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    style={{ width: '100%', height: '100%' }}
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
                    <div className="artist-photo-bubble">
                      <img 
                        src={artist.photo || '/logo192.png'} 
                        alt={artist.nom}
                        onError={(e) => {
                          e.target.src = '/logo192.png';
                        }}
                      />
                      <div className="artist-photo-overlay"></div>
                    </div>
                    <span className="artist-name">{artist.nom}</span>
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
        {/* Logo GN */}
        <Box
          sx={{
            position: 'absolute',
            left: '30px',
            top: '40%',
            transform: 'translateY(-50%)',
            color: 'white',
            fontFamily: 'Bungee, cursive',
            fontSize: '1.8rem',
            fontWeight: 'bold',
            fontStyle: 'italic',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textDecoration: 'none',
            textShadow: `-1px 1px 0 #ccc, -2px 2px 0 #ccc, -3px 3px 0 #ccc, -4px 4px 0 #ccc, -5px 5px 0 #ccc, -6px 6px 0 #ccc, -7px 7px 0 #ccc, -8px 8px 0 #ccc, -9px 9px 0 #ccc, -10px 10px 0 #ccc, -11px 11px 0 #ccc, -12px 12px 0 #ccc`,
            '&::before': {
              content: '"GN"',
              position: 'absolute',
              left: '-20px',
              top: '20px',
              color: 'rgba(0, 0, 0, 0.2)',
              filter: 'blur(3px)',
              textShadow: 'none',
              zIndex: -1,
            },
            '&:hover': {
              color: 'white',
              transform: 'translateY(-50%) scale(1.15)',
              textDecoration: 'none',
            },
            display: { xs: 'none', md: 'block' }, // Caché sur mobile, visible sur desktop
          }}
          component={Link}
          to="/"
        >
          GN
        </Box>
        
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
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 4 } }}>
          <Grid container spacing={4} justifyContent={{ xs: 'center', md: 'space-between' }} alignItems="center" sx={{ mx: { xs: -1, md: -2 } }}>
            {/* Réseaux sociaux à gauche */}
            <Grid item xs={12} md={6} sx={{ pl: { xs: 0, md: 2 }, textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="h6" gutterBottom sx={{ textAlign: { xs: 'center', md: 'left' }, ml: { xs: 0, md: -1 } }}>
                Suivez-nous
              </Typography>
              <Stack direction="row" spacing={2} justifyContent={{ xs: 'center', md: 'flex-start' }} sx={{ mb: 2, ml: { xs: 0, md: -1 } }}>
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
            
            {/* WhatsApp à droite */}
            <Grid item xs={12} md={6} sx={{ pr: { xs: 0, md: 2 }, textAlign: { xs: 'center', md: 'right' } }}>
              <Typography variant="h6" gutterBottom sx={{ textAlign: { xs: 'center', md: 'right' }, mr: { xs: 0, md: -1 } }}>
                Contact
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent={{ xs: 'center', md: 'flex-end' }} sx={{ mt: 2, mr: { xs: 0, md: -1 } }}>
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