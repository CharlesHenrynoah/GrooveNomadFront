import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Card,
  CardContent
} from '@mui/material';
import {
  ArrowBack,
  Email,
  CreditCard,
  Info,
  AccountCircle
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import './PaymentPage.css';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { devisId } = useParams();
  const location = useLocation();
  
  // Récupérer les données du devis depuis l'URL ou localStorage
  const getDevisData = () => {
    try {
      // D'abord, essayer de récupérer depuis l'URL
      const urlParams = new URLSearchParams(location.search);
      const encodedData = urlParams.get('data');
      
      if (encodedData) {
        console.log('🔍 Données trouvées dans l\'URL');
        console.log('📝 Données encodées:', encodedData);
        
        try {
          // Utiliser decodeURIComponent directement
          const decodedString = decodeURIComponent(encodedData);
          console.log('🔓 Données décodées (string):', decodedString);
          
          const decodedData = JSON.parse(decodedString);
          console.log('✅ Données décodées depuis l\'URL:', decodedData);
          console.log('🎫 Festival name dans les données décodées:', decodedData.festivalName);
          console.log('🎫 Structure complète des données:', JSON.stringify(decodedData, null, 2));
          return decodedData;
        } catch (decodeError) {
          console.error('❌ Erreur lors du décodage:', decodeError);
          console.error('📝 Données encodées problématiques:', encodedData);
          throw decodeError;
        }
      }
      
      // Sinon, essayer localStorage (pour compatibilité)
      if (devisId) {
        console.log('🔍 Recherche des données dans localStorage pour devisId:', devisId);
        const storedData = localStorage.getItem(`payment_${devisId}`);
        console.log('📦 Données stockées trouvées:', storedData);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          console.log('✅ Données parsées depuis localStorage:', parsedData);
          return parsedData;
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des données de paiement:', error);
    }
    
    console.log('⚠️ Aucune donnée trouvée');
    // Retourner null si aucune donnée n'est trouvée
    return null;
  };

  const devisData = getDevisData();
  
            const [paymentData, setPaymentData] = useState({
            email: devisData?.clientEmail || devisData?.clientemail || '',
            cardNumber: '',
            expiryDate: '',
            cvc: '',
            cardholderName: devisData?.clientName || devisData?.clientname || '',
            country: 'France'
          });
  
  const [savePaymentInfo, setSavePaymentInfo] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Debug: afficher les données récupérées
  console.log('🔍 Données du devis récupérées:', devisData);
  console.log('💰 Montant du devis:', devisData?.amount);
  console.log('🎫 Festival (festivalName):', devisData?.festivalName);
  console.log('🎫 Festival (festivalname):', devisData?.festivalname);
  console.log('🎫 Festival (type):', typeof devisData?.festivalName);
  console.log('👤 Client:', devisData?.clientName);
  
  // Si aucune donnée n'est trouvée, afficher un message d'erreur
  if (!devisData) {
    return (
      <Box className="payment-page">
        <Box sx={{ 
          textAlign: 'center', 
          padding: 4, 
          background: 'white', 
          borderRadius: 2, 
          boxShadow: '0 4px 20px rgba(252, 108, 52, 0.1)',
          maxWidth: 600,
          margin: 'auto'
        }}>
          <Typography variant="h5" sx={{ color: '#fc6c34', mb: 2 }}>
            Erreur : Données de devis non trouvées
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Impossible de récupérer les informations du devis. Veuillez vérifier que le lien de paiement est correct.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
            sx={{ backgroundColor: '#fc6c34', '&:hover': { backgroundColor: '#e55a29' } }}
          >
            Retour à l'accueil
          </Button>
        </Box>
      </Box>
    );
  }

  const countries = [
    'France', 'Belgique', 'Suisse', 'Canada', 'États-Unis', 'Royaume-Uni', 
    'Allemagne', 'Espagne', 'Italie', 'Pays-Bas', 'Portugal'
  ];

  const handleInputChange = (field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + ' / ' + v.substring(2, 4);
    }
    return v;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!paymentData.email) {
      newErrors.email = 'Email requis';
    } else if (!/\S+@\S+\.\S+/.test(paymentData.email)) {
      newErrors.email = 'Email invalide';
    }
    
    if (!paymentData.cardNumber) {
      newErrors.cardNumber = 'Numéro de carte requis';
    } else if (paymentData.cardNumber.replace(/\s/g, '').length < 13) {
      newErrors.cardNumber = 'Numéro de carte invalide';
    }
    
    if (!paymentData.expiryDate) {
      newErrors.expiryDate = 'Date d\'expiration requise';
    } else if (paymentData.expiryDate.replace(/\D/g, '').length < 4) {
      newErrors.expiryDate = 'Date d\'expiration invalide';
    }
    
    if (!paymentData.cvc) {
      newErrors.cvc = 'CVC requis';
    } else if (paymentData.cvc.length < 3) {
      newErrors.cvc = 'CVC invalide';
    }
    
    if (!paymentData.cardholderName) {
      newErrors.cardholderName = 'Nom du titulaire requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);
    
    // Simuler un traitement de paiement
    setTimeout(() => {
      setIsProcessing(false);
      // Rediriger vers une page de confirmation
      navigate('/payment-success', { 
        state: { 
          transactionId: 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          amount: devisData.amount,
          festival: devisData.festivalName
        }
      });
    }, 2000);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Box className="payment-page">
      <Grid container className="payment-container">
        {/* Panneau gauche - Informations du devis */}
        <Grid item xs={12} md={6} className="payment-info-section">
          <Box className="info-header">
            <IconButton 
              onClick={handleBack}
              className="back-button"
            >
              <ArrowBack />
            </IconButton>
            
            <Box className="company-info">
              <Box className="company-logo">
                <AccountCircle />
              </Box>
              <Typography variant="h6" className="company-name">
                GROOVE NOMAD
              </Typography>
            </Box>
          </Box>

          <Box className="invoice-details">
            <Typography variant="body2" className="invoice-label">
              Numéro de devis
            </Typography>
            <Typography variant="h5" className="invoice-number">
              {devisData.invoiceNumber || devisData.invoicenumber}
            </Typography>
          </Box>

          <Box className="festival-info">
            <Typography variant="body2" className="festival-label">
              Festival
            </Typography>
            <Typography variant="h6" className="festival-name">
              {devisData.festivalName || devisData.festivalname || 'Festival non spécifié'}
            </Typography>
          </Box>

          <Box className="amount-section">
            <Typography variant="h2" className="amount-display">
              {(devisData.amount || '0,00').replace('.', ',')} €
            </Typography>
          </Box>

          <Box className="payment-footer">
            <Typography variant="caption" className="powered-by">
              Propulsé par <strong>Stripe</strong>
            </Typography>
            <Box className="footer-links">
              <Typography variant="caption" className="footer-link">
                Conditions d'utilisation
              </Typography>
              <Typography variant="caption" className="footer-link">
                Confidentialité
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Panneau droit - Formulaire de paiement */}
        <Grid item xs={12} md={6} className="payment-form-section">
          <Box className="form-container">
            <Typography variant="h4" className="form-title">
              Payer par carte
            </Typography>

            <form onSubmit={handleSubmit} className="payment-form">
              {/* Email */}
              <Box className="form-group">
                <Typography variant="body2" className="field-label">
                  E-mail
                </Typography>
                <TextField
                  fullWidth
                  type="email"
                  value={paymentData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                  className="form-field"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Email className="field-icon" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Informations de la carte */}
              <Box className="form-group">
                <Typography variant="body2" className="field-label">
                  Informations de la carte
                </Typography>
                
                <TextField
                  fullWidth
                  placeholder="1234 1234 1234 1234"
                  value={paymentData.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                  error={!!errors.cardNumber}
                  helperText={errors.cardNumber}
                  className="form-field card-number-field"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Box className="card-icons">
                          <Box className="card-icon visa">VISA</Box>
                          <Box className="card-icon mastercard">MC</Box>
                          <Box className="card-icon amex">AMEX</Box>
                          <Box className="card-icon discover">DISC</Box>
                        </Box>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box className="card-details-row">
                  <TextField
                    placeholder="MM / AA"
                    value={paymentData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                    error={!!errors.expiryDate}
                    helperText={errors.expiryDate}
                    className="form-field expiry-field"
                    inputProps={{ maxLength: 7 }}
                  />
                  
                  <TextField
                    placeholder="CVC"
                    value={paymentData.cvc}
                    onChange={(e) => handleInputChange('cvc', e.target.value.replace(/\D/g, '').slice(0, 4))}
                    error={!!errors.cvc}
                    helperText={errors.cvc}
                    className="form-field cvc-field"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small">
                            <Info className="info-icon" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Box>

              {/* Nom du titulaire */}
              <Box className="form-group">
                <Typography variant="body2" className="field-label">
                  Nom du titulaire de la carte
                </Typography>
                <TextField
                  fullWidth
                  value={paymentData.cardholderName}
                  onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                  error={!!errors.cardholderName}
                  helperText={errors.cardholderName}
                  className="form-field"
                />
              </Box>

              {/* Pays */}
              <Box className="form-group">
                <Typography variant="body2" className="field-label">
                  Pays ou région
                </Typography>
                <FormControl fullWidth className="form-field">
                  <Select
                    value={paymentData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                  >
                    {countries.map((country) => (
                      <MenuItem key={country} value={country}>
                        {country}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Checkbox sauvegarde */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={savePaymentInfo}
                    onChange={(e) => setSavePaymentInfo(e.target.checked)}
                    className="save-checkbox"
                  />
                }
                label="Enregistrer mes informations pour le paiement sécurisé en 1 clic"
                className="save-payment-label"
              />

              <Typography variant="body2" className="save-description">
                Réglez plus rapidement sur GROOVE NOMAD et des milliers d'autres sites.
              </Typography>

              {/* Bouton de paiement */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isProcessing}
                className="pay-button"
              >
                {isProcessing ? 'Traitement en cours...' : 'Payer'}
              </Button>

              {/* Texte de confirmation */}
              <Typography variant="caption" className="confirmation-text">
                En confirmant votre paiement, vous autorisez GROOVE NOMAD à débiter votre carte 
                pour ce paiement, ainsi qu'à enregistrer les informations de paiement conformément 
                à ses conditions.
              </Typography>
            </form>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PaymentPage; 