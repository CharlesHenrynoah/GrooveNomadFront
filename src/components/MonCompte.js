import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaCalendarAlt, FaSignOutAlt, FaKey, FaEdit, FaTwitter, FaInstagram, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Container,
  Typography,
  Grid,
  Stack,
  IconButton,
} from '@mui/material';
import {
  Event as EventIcon,
  SmartToy as SmartToyIcon,
  Person as PersonIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import './MonCompte.css';

// Import de l'image de background
const backgroundImage = `${process.env.PUBLIC_URL}/Belgaimage-70923023-1.jpg`;

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
}));

const MonCompte = () => {
  const { user, logout, isAuthenticated, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Rediriger vers la connexion si pas connecté
    if (!isAuthenticated) {
      navigate('/connexion');
      return;
    }
    
    // Charger la photo de profil existante
    if (user && user.photo) {
      setImagePreview(user.photo);
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Fonction pour compresser l'image
  const compressImage = (file, maxWidth = 200, quality = 0.7) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculer les nouvelles dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convertir en base64 avec compression
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille du fichier (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('La taille de l\'image ne doit pas dépasser 10MB');
        return;
      }
      
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image');
        return;
      }
      
      setProfileImage(file);
      
      try {
        // Compresser l'image
        const compressedImage = await compressImage(file);
        setImagePreview(compressedImage);
      } catch (error) {
        console.error('Erreur lors de la compression:', error);
        // Fallback vers la méthode originale
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleImageUpload = async () => {
    if (!profileImage) return;
    
    // Vérifier si l'utilisateur est connecté
    if (!isAuthenticated || !user) {
      alert('Vous devez être connecté pour modifier votre photo de profil');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Convertir l'image en base64 si ce n'est pas déjà fait
      const base64Image = imagePreview;
      
      // Vérifier la taille de l'image base64
      const sizeInBytes = (base64Image.length * 3) / 4;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      
      if (sizeInMB > 2) {
        alert('L\'image est trop volumineuse après compression. Veuillez choisir une image plus petite.');
        return;
      }
      
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token);
      console.log('User from context:', user);
      console.log('Is authenticated:', isAuthenticated);
      
      if (!token) {
        alert('Session expirée. Veuillez vous reconnecter.');
        logout();
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/utilisateur/photo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ photo: base64Image })
      });
      
      if (response.ok) {
        alert('Photo de profil mise à jour avec succès !');
        setProfileImage(null);
        
        // Rafraîchir les données utilisateur
        console.log('Refreshing user data after photo update...');
        await refreshUserData();
      } else {
        // Tenter de parser le JSON, sinon utiliser le status
        try {
          const errorData = await response.json();
          alert(`Erreur: ${errorData.error}`);
        } catch (parseError) {
          if (response.status === 413) {
            alert('Image trop volumineuse. Veuillez choisir une image plus petite.');
          } else {
            alert(`Erreur HTTP: ${response.status} - ${response.statusText}`);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      if (error.name === 'SyntaxError') {
        alert('Erreur de communication avec le serveur. Veuillez réessayer.');
      } else {
        alert('Erreur lors de la mise à jour de la photo');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/utilisateur/photo', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setProfileImage(null);
        setImagePreview(null);
        alert('Photo de profil supprimée avec succès !');
        
        // Rafraîchir les données utilisateur
        console.log('Refreshing user data after photo deletion...');
        await refreshUserData();
      } else {
        try {
          const errorData = await response.json();
          alert(`Erreur: ${errorData.error}`);
        } catch (parseError) {
          alert(`Erreur HTTP: ${response.status} - ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      if (error.name === 'SyntaxError') {
        alert('Erreur de communication avec le serveur. Veuillez réessayer.');
      } else {
        alert('Erreur lors de la suppression de la photo');
      }
    }
  };

  if (!isAuthenticated || !user) {
    return null; // Ou un loader
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Navigation items
  const navigationItems = [
    { icon: <HomeIcon />, text: 'HOME', href: '/' },
    { icon: <EventIcon />, text: 'ÉVÉNEMENTS', href: '/evenements' },
    { icon: <SmartToyIcon />, text: 'CHATBOT', href: '/chatbot' },
    { 
      icon: <PersonIcon />, 
      text: 'MON COMPTE', 
      href: '/mon-compte' 
    },
  ];

  return (
    <div 
      className="mon-compte-page"
      style={{
        backgroundImage: `url(${backgroundImage}), linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Contenu principal */}
      <div className="main-content" style={{ flex: 1 }}>
        <div className="mon-compte-container">
          {/* Header de la page */}
          <div className="compte-header">
            <div className="user-avatar-container">
              <div className="user-avatar">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profil utilisateur" className="profile-image" />
                ) : (
                  <FaUser />
                )}
              </div>
              <div className="avatar-actions">
                <input
                  type="file"
                  id="profile-image-input"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('profile-image-input').click()}
                  className="change-photo-btn"
                  title="Modifier la photo de profil"
                >
                  <FaEdit />
                </button>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="remove-photo-btn"
                    title="Supprimer la photo"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            
            {profileImage && (
              <div className="upload-actions">
                <button 
                  onClick={handleImageUpload} 
                  className="upload-btn"
                  disabled={isUploading}
                >
                  {isUploading ? 'Sauvegarde en cours...' : 'Sauvegarder la photo'}
                </button>
                <button 
                  onClick={() => setProfileImage(null)} 
                  className="cancel-upload-btn"
                  disabled={isUploading}
                >
                  Annuler
                </button>
              </div>
            )}
            
            <h1 className="compte-title">Mon Compte</h1>
            <p className="compte-subtitle">
              Gérez vos informations personnelles
            </p>
          </div>

          {/* Informations utilisateur */}
          <div className="compte-content">
            <div className="info-section">
              <div className="section-header">
                <h2 className="section-title">Informations personnelles</h2>
              </div>

              <div className="info-display">
                <div className="info-item">
                  <div className="info-label">
                    <FaUser /> Nom
                  </div>
                  <div className="info-value">
                    {user.nom}
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-label">
                    <FaUser /> Prénom
                  </div>
                  <div className="info-value">
                    {user.prenom}
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-label">
                    <FaEnvelope /> Adresse email
                  </div>
                  <div className="info-value">
                    {user.email}
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-label">
                    <FaCalendarAlt /> Membre depuis
                  </div>
                  <div className="info-value">
                    {formatDate(user.dateCreation)}
                  </div>
                </div>

                {user.dernierLogin && (
                  <div className="info-item">
                    <div className="info-label">
                      <FaCalendarAlt /> Dernière connexion
                    </div>
                    <div className="info-value">
                      {formatDate(user.dernierLogin)}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="info-note">
                <p>Les informations personnelles ne peuvent pas être modifiées. Pour toute modification, veuillez contacter le support.</p>
              </div>
            </div>

            {/* Section Sécurité */}
            <div className="security-section">
              <h2 className="section-title">Sécurité</h2>
              <div className="security-actions">
                <button className="security-btn">
                  <FaKey /> Changer le mot de passe
                </button>
              </div>
            </div>

            {/* Section Actions */}
            <div className="actions-section">
              <h2 className="section-title">Actions du compte</h2>
              <div className="account-actions">
                <button onClick={handleLogout} className="logout-btn">
                  <FaSignOutAlt /> Se déconnecter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                      '&:hover': { backgroundColor: '#fc6c34' },
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

      {/* Navbar flottante */}
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
          <GlassNavItem
            key={index}
            component={item.href.startsWith('/') ? Link : 'a'}
            to={item.href.startsWith('/') ? item.href : undefined}
            href={item.href.startsWith('/') ? undefined : item.href}
          >
            {item.icon}
            <span>{item.text}</span>
          </GlassNavItem>
        ))}
      </GlassNavbar>
    </div>
  );
};

export default MonCompte; 