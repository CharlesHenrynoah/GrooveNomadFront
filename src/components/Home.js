import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTwitter, FaInstagram, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  Event as EventIcon,
  SmartToy as SmartToyIcon,
  Person as PersonIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';

// Styles glassmorphism
const GlassContainer = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
}));

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

const GlassNavItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  padding: '12px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  borderRadius: '30px',
  width: '40px',
  overflow: 'visible',
  background: 'transparent',
  color: '#fc6c34',
  textDecoration: 'none',
  '&:hover': {
    background: 'rgba(110, 31, 157, 0.1)',
    width: '140px',
    color: '#6e1f9d',
    '& span': {
      display: 'block',
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
    width: 'auto',
    padding: '8px 12px',
    '& span': {
      display: 'block',
      fontSize: '12px',
    },
    '& .MuiSvgIcon-root': {
      width: '22px',
      height: '22px',
    },
  },
  [theme.breakpoints.down('sm')]: {
    padding: '6px 8px',
    '& span': {
      fontSize: '10px',
    },
    '& .MuiSvgIcon-root': {
      width: '20px',
      height: '20px',
    },
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

const GlassSearchContainer = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(25px)',
  WebkitBackdropFilter: 'blur(25px)',
  borderRadius: '24px',
  padding: '4px',
  boxShadow: '0 2px 5px 1px rgba(64, 60, 67, 0.16)',
  transition: 'box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: '0 2px 8px 1px rgba(64, 60, 67, 0.24)',
  },
  [theme.breakpoints.down('md')]: {
    background: 'transparent',
    boxShadow: 'none',
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
}));

const GlassTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    background: 'transparent',
    border: 'none',
    borderRadius: '20px 0 0 20px',
    fontSize: '16px',
    fontFamily: 'arial, sans-serif',
    '& fieldset': {
      border: 'none',
    },
    '&:hover fieldset': {
      border: 'none',
    },
    '&.Mui-focused fieldset': {
      border: 'none',
    },
    [theme.breakpoints.down('md')]: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(25px)',
      WebkitBackdropFilter: 'blur(25px)',
      borderRadius: '36px',
      fontSize: '1.5rem',
      padding: '24px 28px',
      boxShadow: '0 2px 5px 1px rgba(64, 60, 67, 0.16)',
      textAlign: 'center',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    [theme.breakpoints.down('sm')]: {
      borderRadius: '32px',
      fontSize: '1.2rem',
      padding: '18px 18px',
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '16px 20px',
    textAlign: 'center',
    [theme.breakpoints.down('md')]: {
      padding: 0,
      color: '#3c4043',
    },
  },
  '& .MuiInputBase-input::placeholder': {
    color: '#9aa0a6',
    opacity: 1,
  },
}));

const GlassButton = styled(Button)(({ theme }) => ({
  background: '#ff6600',
  color: '#fff',
  fontWeight: 600,
  borderRadius: '0 20px 20px 0',
  minWidth: '120px',
  padding: '16px 24px',
  fontSize: '14px',
  '&:hover': {
    background: '#ff6600',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
  },
  [theme.breakpoints.down('md')]: {
    borderRadius: '50px',
    width: '100%',
    fontSize: '1.3rem',
    padding: '24px 32px',
    minWidth: '140px',
  },
  [theme.breakpoints.down('sm')]: {
    borderRadius: '50px',
    fontSize: '1.1rem',
    padding: '18px 24px',
    minWidth: '120px',
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
  mt: 0,
  position: 'relative',
  zIndex: 10,
}));

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = React.useState('');

  // Fonction pour remplir l'input avec une suggestion
  const handleSuggestionClick = (suggestion) => {
    // Remplir l'input avec la suggestion
    setInputValue(suggestion);
  };

  // Fonction pour gérer l'envoi du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      // Naviguer vers le chatbot avec le message saisi
      navigate('/chatbot', { state: { initialMessage: inputValue.trim() } });
    }
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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundImage: `url(${process.env.PUBLIC_URL}/0acb9d488888dab551223dba404a01c8.jpg)`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay glassmorphism - blur l'image de fond */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          zIndex: -1, // Passe derrière tout le contenu
          pointerEvents: 'none',
        }}
      />

      {/* Navigation */}
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
            href={item.href.startsWith('/') ? undefined : item.href}
          >
            {item.icon}
            <span>{item.text}</span>
          </GlassNavItemNew>
        ))}
      </GlassNavbar>

      {/* Hero Section */}
      <Container maxWidth="md" sx={{ pt: 8, pb: 15, position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: '120px' }}>
        <Box textAlign="center" sx={{ mb: 4 }}>
          <Typography
            variant="h1"
            sx={{
              fontFamily: 'Bungee, cursive',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
              fontWeight: 700,
              fontStyle: 'italic',
              color: '#FFFFFF',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              letterSpacing: '0.5px',
              mb: 2,
            }}
          >
            Venez Groovez !
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1rem', md: '1.2rem' },
              color: 'rgba(255, 255, 255, 0.9)',
              mb: 4,
              lineHeight: 1.6,
            }}
          >
            Trouvez les meilleurs Festivals partout dans le monde
          </Typography>

          {/* Suggestions panel horizontal scrollable au-dessus de l'input */}
          <Box sx={{ 
            mt: 2, 
            mb: 3, 
            display: 'flex', 
            gap: 1, 
            overflowX: 'auto', 
            whiteSpace: 'nowrap',
            maxWidth: '584px',
            mx: 'auto',
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
          }}>
            {[
              'A quel festival je peux aller avec un budget de 100 euros ?',
              'Donne-moi des festivals de House',
              'Est-ce qu\'il y a un festival au Canada ?'
            ].map((suggestion, index) => (
              <Button
                key={index}
                variant="contained"
                onClick={() => handleSuggestionClick(suggestion)}
                sx={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '20px',
                  fontSize: { xs: '0.95rem', sm: '1rem' },
                  padding: '10px 18px',
                  textTransform: 'none',
                  minWidth: 'auto',
                  whiteSpace: 'nowrap',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  boxShadow: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: '#6e1f9d',
                    color: 'white',
                    borderColor: '#6e1f9d',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(110, 31, 157, 0.3)',
                  },
                }}
              >
                {suggestion}
              </Button>
            ))}
          </Box>

          {/* Rounded input */}
          <Box 
            component="form" 
            onSubmit={handleSubmit}
            sx={{ 
              maxWidth: '584px', 
              mx: 'auto', 
              mb: 3,
              position: 'relative'
            }}
          >
            <Box sx={{ position: 'relative' }}>
              <TextField
                id="chat-input"
                placeholder="Tapez votre message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                multiline
                minRows={1}
                sx={{
                  width: '100%',
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    padding: '16px 140px 16px 50px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    '& fieldset': { border: 'none' },
                    '&:hover fieldset': { border: 'none' },
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: 0,
                    color: 'white',
                    '&::placeholder': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      opacity: 1,
                    },
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  right: 10,
                  background: '#fc6c34',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '8px 16px',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 500,
                  textTransform: 'none',
                  '&:hover': {
                    background: '#c8501a',
                  },
                }}
              >
                Envoyer
              </Button>
            </Box>
          </Box>


        </Box>
      </Container>



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

export default Home; 