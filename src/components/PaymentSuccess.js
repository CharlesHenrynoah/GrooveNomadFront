import React, { useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, Chip } from '@mui/material';
import { CheckCircle, Download, Home } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { transactionId, amount, festival } = location.state || {};

  useEffect(() => {
    // Redirection automatique après 10 secondes
    const timer = setTimeout(() => {
      navigate('/');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleDownloadReceipt = () => {
    // Logique pour télécharger le reçu
    console.log('Téléchargement du reçu...');
  };

  return (
    <Box className="payment-success-page">
      <Card className="success-card">
        <CardContent className="success-content">
          <Box className="success-icon">
            <CheckCircle />
          </Box>
          
          <Typography variant="h4" className="success-title">
            Paiement réussi !
          </Typography>
          
          <Typography variant="body1" className="success-message">
            Votre réservation pour <strong>{festival}</strong> a été confirmée.
          </Typography>

          <Box className="transaction-details">
            <Chip 
              label={`Transaction: ${transactionId}`}
              className="transaction-chip"
            />
            <Typography variant="h5" className="amount-paid">
              {amount} € payé
            </Typography>
          </Box>

          <Typography variant="body2" className="confirmation-info">
            Un email de confirmation a été envoyé à votre adresse email.
            Vous recevrez vos billets par email dans les prochaines minutes.
          </Typography>

          <Box className="action-buttons">
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleDownloadReceipt}
              className="download-button"
            >
              Télécharger le reçu
            </Button>
            
            <Button
              variant="contained"
              startIcon={<Home />}
              onClick={() => navigate('/')}
              className="home-button"
            >
              Retour à l'accueil
            </Button>
          </Box>

          <Typography variant="caption" className="redirect-info">
            Vous serez automatiquement redirigé vers l'accueil dans 10 secondes.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentSuccess; 