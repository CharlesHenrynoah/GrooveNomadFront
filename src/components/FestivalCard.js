import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Chip, Button } from '@mui/material';
import { FaCalendarAlt, FaMapMarkerAlt, FaHeart, FaEuroSign } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const FestivalCard = ({ festival, compact = false }) => {
  // Formatage des dates
  const formatDateRangeShort = (dateRange) => {
    if (!dateRange) return 'Dates à venir';
    
    const dates = dateRange.split(' - ');
    if (dates.length === 2) {
      const debut = new Date(dates[0]);
      const fin = new Date(dates[1]);
      
      if (debut.toDateString() === fin.toDateString()) {
        return `${debut.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}`;
      }
      
      return `${debut.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} - ${fin.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}`;
    }
    
    return dateRange;
  };

  const nomEvenement = festival.nom || 'Festival sans nom';
  const styleEvenement = festival.genre || 'Musique';
  const villeEvenement = festival.ville || 'Ville inconnue';
  const paysEvenement = festival.pays || 'Pays inconnu';
  const datesEvenement = festival.dateDebut && festival.dateFin ? `${festival.dateDebut} - ${festival.dateFin}` : null;
  const prixEvenement = festival.prix || [];
  const nombreLikesEvenement = festival.nombreLikes;
  const imageEvenement = festival.image || festival.medias?.[0] || '/fete_bg.png';

  return (
    <Card 
      sx={{ 
        maxWidth: compact ? 280 : 345, 
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        border: '1px solid rgba(255,255,255,0.2)',
        margin: '8px',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          background: 'rgba(255,255,255,0.98)'
        }
      }}
    >
      <CardMedia
        component="img"
        height={compact ? "120" : "140"}
        image={imageEvenement}
        alt={nomEvenement}
        sx={{
          objectFit: 'cover',
          backgroundColor: 'rgba(110, 31, 157, 0.1)'
        }}
      />
      <CardContent sx={{ 
        padding: compact ? '0.75rem' : '1rem',
        paddingBottom: '0.75rem !important'
      }}>
          <Typography 
            gutterBottom 
            variant={compact ? "body1" : "h6"} 
            component="div"
            sx={{ 
              fontWeight: 'bold',
              color: '#6e1f9d',
              marginBottom: '0.5rem',
              lineHeight: 1.2,
              fontSize: compact ? '0.95rem' : '1.1rem'
            }}
          >
            {nomEvenement}
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            mb: 1,
            color: 'rgba(0,0,0,0.6)'
          }}>
            <FaCalendarAlt style={{ color: '#6e1f9d', fontSize: '0.85rem' }} />
            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
              {datesEvenement ? formatDateRangeShort(datesEvenement) : 'Dates à venir'}
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            mb: 1,
            color: 'rgba(0,0,0,0.6)'
          }}>
            <FaMapMarkerAlt style={{ color: '#6e1f9d', fontSize: '0.85rem' }} />
            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
              {villeEvenement}, {paysEvenement}
            </Typography>
          </Box>

          {prixEvenement.length > 0 && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              mb: 1,
              color: 'rgba(0,0,0,0.6)'
            }}>
              <FaEuroSign style={{ color: '#fc6c34', fontSize: '0.85rem' }} />
              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                {Math.min(...prixEvenement.filter(p => p > 0))}€ - {Math.max(...prixEvenement.filter(p => p > 0))}€
              </Typography>
            </Box>
          )}
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mt: 1
          }}>
            <Chip
              label={styleEvenement}
              size="small"
              sx={{
                backgroundColor: 'rgba(110, 31, 157, 0.08)',
                color: '#6e1f9d',
                fontWeight: 500,
                border: '1px solid rgba(110, 31, 157, 0.2)',
                height: '22px',
                fontSize: '0.75rem'
              }}
            />
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontSize: '0.8rem'
              }}
            >
              <FaHeart style={{ color: '#fc6c34', fontSize: '0.8rem' }} />
              {nombreLikesEvenement === null ? 'null' : nombreLikesEvenement}
            </Typography>
          </Box>
          
          <Button
            component={Link}
            to={`/evenements/${festival.id}`}
            variant="contained"
            fullWidth
            sx={{
              mt: 2,
              backgroundColor: '#6e1f9d',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.85rem',
              textTransform: 'none',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(110, 31, 157, 0.3)',
              '&:hover': {
                backgroundColor: '#5a1a7d',
                boxShadow: '0 4px 12px rgba(110, 31, 157, 0.4)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Voir Festival
          </Button>
        </CardContent>
    </Card>
  );
};

export default FestivalCard; 