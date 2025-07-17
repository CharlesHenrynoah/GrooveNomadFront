import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendDevisToAirtable } from '../services/airtableService';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  Button, 
  Grid, 
  Chip,
  TextField,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Stack,
  IconButton,
  Collapse
} from '@mui/material';
import { 
  ExpandMore, 
  Home, 
  Flight, 
  People, 
  Euro, 
  Star,
  Bed,
  LocationOn,
  Timer,
  CheckCircle,
  Calculate,
  Download
} from '@mui/icons-material';
import { 
  FaHome, 
  FaPlane, 
  FaUsers, 
  FaEuroSign, 
  FaBed, 
  FaMapMarkerAlt, 
  FaClock, 
  FaCheck, 
  FaCalculator,
  FaWifi,
  FaCar,
  FaUtensils,
  FaSwimmingPool,
  FaDownload
} from 'react-icons/fa';
import { Payment } from '@mui/icons-material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './ReservationForm.css';

const ReservationForm = ({ festival }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedGroupSize, setSelectedGroupSize] = useState('');
  const [selectedAccommodation, setSelectedAccommodation] = useState('');
  const [ticketQuantities, setTicketQuantities] = useState({
    basic: 0,
    premier: 0,
    vip: 0,
  });
  const [flightQuantity, setFlightQuantity] = useState(0);
  const [showQuoteResult, setShowQuoteResult] = useState(false);
  const [quote, setQuote] = useState(null);
  const [expandedSection, setExpandedSection] = useState('groupSize');
  const [clientInfo, setClientInfo] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    telephone: ''
  });
  const [isSendingToAirtable, setIsSendingToAirtable] = useState(false);
  const [airtableStatus, setAirtableStatus] = useState(null);
  const [paymentLink, setPaymentLink] = useState(null);

  // Mettre à jour les informations client quand l'utilisateur change
  useEffect(() => {
    if (user) {
      setClientInfo(prev => ({
        ...prev,
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  // Définition des types de groupes
  const groupTypes = {
    'petit': {
      name: 'Hébergement Petit Groupe',
      icon: <FaHome />,
      size: '2-4 personnes',
      description: 'Couples, amis proches, petites familles',
      capacity: { min: 2, max: 4 }
    },
    'moyen': {
      name: 'Hébergement Groupe Moyen',
      icon: <FaUsers />,
      size: '5-8 personnes',
      description: 'Groupes d\'amis, familles nombreuses',
      capacity: { min: 5, max: 8 }
    },
    'large': {
      name: 'Hébergement Groupe Large',
      icon: <FaUsers />,
      size: '9-12 personnes',
      description: 'Grands groupes d\'amis, 2-3 familles',
      capacity: { min: 9, max: 12 }
    },
    'tresgrand': {
      name: 'Hébergement Très Grand Groupe',
      icon: <FaUsers />,
      size: '16+ personnes',
      description: 'Groupes XXL, retraites, anniversaires',
      capacity: { min: 16, max: 999 }
    }
  };

  // Types de billets
  const ticketTypes = {
    'basic': {
      name: 'Basic',
      tier: 1,
      description: 'Accès standard au festival',
      color: '#27ae60'
    },
    'premier': {
      name: 'Premier',
      tier: 2,
      description: 'Accès privilégié avec avantages',
      color: '#f39c12'
    },
    'vip': {
      name: 'VIP',
      tier: 3,
      description: 'Accès premium avec tous les avantages',
      color: '#e74c3c'
    }
  };

  // Récupérer les données d'hébergement depuis le festival
  const getAccommodationOptions = (groupType) => {
    if (!festival) return [];
    
    const options = [];
    for (let i = 1; i <= 3; i++) {
      const option = {
        id: `${groupType}_${i}`,
        name: `Option ${i}`,
        description: festival[`description_hebergement_${groupType}_${i}`] || 'Description non disponible',
        url: festival[`url_hebergement_${groupType}_${i}`] || '',
        distance: festival[`distance_hebergement_${groupType}_${i}`] || 'Distance non spécifiée',
        capacity: festival[`capacite_hebergement_${groupType}_${i}`] || 'Capacité non spécifiée',
        pricePerNight: parseFloat(festival[`prix_nuit_hebergement_${groupType}_${i}`]) || 0,
        totalPrice: parseFloat(festival[`prix_total_hebergement_${groupType}_${i}`]) || 0,
        amenities: festival[`equipements_hebergement_${groupType}_${i}`] || 'Équipements non spécifiés',
        photo: festival[`photo_hebergement_${groupType}_${i}`] || '/fete_bg.png',
        carTime: festival[`temps_voiture_hebergement_${groupType}_${i}`] || 'Temps non spécifié'
      };
      
      if (option.description !== 'Description non disponible') {
        options.push(option);
      }
    }
    
    return options;
  };

  // Récupérer les informations de vol
  const getFlightInfo = () => {
    if (!festival) return null;
    
    return {
      description: festival.description_vol_1 || 'Vol non disponible',
      url: festival.url_vol_1 || '',
      departure: festival.aeroport_depart_1 || 'Aéroport de départ non spécifié',
      arrival: festival.aeroport_arrivee_1 || 'Aéroport d\'arrivée non spécifié',
      departureDate: festival.date_aller_1 || 'Date non spécifiée',
      returnDate: festival.date_retour_1 || 'Date non spécifiée',
      class: festival.classe_1 || 'Classe non spécifiée',
      price: parseFloat(festival.prix_unitaire_1) || 0,
      airline: festival.compagnie_1 || 'Compagnie non spécifiée',
      duration: festival.duree_vol_1 || 'Durée non spécifiée'
    };
  };

  // Récupérer les prix des billets
  const getTicketPrices = () => {
    if (!festival) return {};
    
    return {
      basic: parseFloat(festival.price_tier_1) || 0,
      premier: parseFloat(festival.price_tier_2) || 0,
      vip: parseFloat(festival.price_tier_3) || 0
    };
  };

  // Fonction pour formater les équipements
  const formatAmenities = (amenities) => {
    if (!amenities) return [];
    
    const amenityIcons = {
      'Wi‑Fi': <FaWifi />,
      'WiFi': <FaWifi />,
      'Wi-Fi': <FaWifi />,
      'Parking': <FaCar />,
      'Cuisine': <FaUtensils />,
      'Piscine': <FaSwimmingPool />,
      'Machine à laver': <FaCheck />
    };
    
    return amenities.split(',').map(amenity => ({
      name: amenity.trim(),
      icon: amenityIcons[amenity.trim()] || <FaCheck />
    }));
  };

  // Générer le devis
  const generateQuote = async () => {
    const totalTickets = Object.values(ticketQuantities).reduce((sum, qty) => sum + qty, 0);

    if (!selectedGroupSize || !selectedAccommodation || totalTickets === 0) {
      alert('Veuillez sélectionner un hébergement et au moins un billet de festival.');
      return;
    }

    const accommodationOptions = getAccommodationOptions(selectedGroupSize);
    const selectedAccommodationData = accommodationOptions.find(acc => acc.id === selectedAccommodation);
    const ticketPrices = getTicketPrices();
    const flightInfo = getFlightInfo();

    const accommodationCost = selectedAccommodationData?.totalPrice || 0;
    
    const ticketCost = Object.entries(ticketQuantities).reduce((total, [type, qty]) => {
      return total + (ticketPrices[type] * qty);
    }, 0);

    const flightCost = flightInfo?.price * flightQuantity || 0;
    const subtotal = accommodationCost + ticketCost + flightCost;
    
    // Commission GrooveNomad (5%)
    const commissionGrooveNomad = subtotal * 0.05;
    const totalCost = subtotal + commissionGrooveNomad;

    const newQuote = {
      festival: festival.nom || 'Festival',
      groupSize: groupTypes[selectedGroupSize].name,
      accommodation: selectedAccommodationData,
      ticketDetails: Object.entries(ticketQuantities)
        .filter(([, qty]) => qty > 0)
        .map(([type, qty]) => ({
          type: ticketTypes[type].name,
          quantity: qty,
          price: ticketPrices[type],
        })),
      numberOfPeople: totalTickets,
      costs: {
        accommodation: accommodationCost,
        tickets: ticketCost,
        flights: flightCost,
        subtotal: subtotal,
        commissionGrooveNomad: commissionGrooveNomad,
        total: totalCost
      },
      flight: flightInfo,
      flightQuantity: flightQuantity,
    };

    setQuote(newQuote);
    setShowQuoteResult(true);

    // Envoyer automatiquement le devis à Airtable
    setIsSendingToAirtable(true);
    setAirtableStatus(null);
    
    try {
      // Structure des données optimisée pour Airtable
      console.log('🎫 Festival object:', festival);
      console.log('🎫 Festival.nom:', festival?.nom);
      
      const devisData = {
        // Informations client
        client_nom: clientInfo.nom || '',
        client_prenom: clientInfo.prenom || '',
        client_email: clientInfo.email || '',
        client_telephone: clientInfo.telephone || '',
        
        // Informations festival
        festival_nom: festival?.nom || 'Festival',
        type_groupe: selectedGroupSize || '',
        
        // Billets de festival
        ticket_basic_quantity: parseInt(ticketQuantities.basic) || 0,
        ticket_basic_prix_unitaire: parseFloat(ticketPrices.basic) || 0,
        ticket_basic_prix_total: (parseInt(ticketQuantities.basic) || 0) * (parseFloat(ticketPrices.basic) || 0),
        
        ticket_premier_quantity: parseInt(ticketQuantities.premier) || 0,
        ticket_premier_prix_unitaire: parseFloat(ticketPrices.premier) || 0,
        ticket_premier_prix_total: (parseInt(ticketQuantities.premier) || 0) * (parseFloat(ticketPrices.premier) || 0),
        
        ticket_vip_quantity: parseInt(ticketQuantities.vip) || 0,
        ticket_vip_prix_unitaire: parseFloat(ticketPrices.vip) || 0,
        ticket_vip_prix_total: (parseInt(ticketQuantities.vip) || 0) * (parseFloat(ticketPrices.vip) || 0),
        
        // Hébergement
        hebergement_nom: selectedAccommodationData?.name || '',
        cout_hebergement: parseFloat(accommodationCost) || 0,
        
        // Vol
        flight_quantity: parseInt(flightQuantity) || 0,
        flight_prix_unitaire: parseFloat(flightInfo?.price) || 0,
        cout_vols: parseFloat(flightCost) || 0,
        
        // Totaux
        sous_total: parseFloat(subtotal) || 0,
        commission_groovenomad: parseFloat(commissionGrooveNomad) || 0,
        total_ttc: parseFloat(totalCost) || 0,
        
        // Métadonnées
        date_creation: new Date().toISOString(),
        nombre_personnes: totalTickets
      };

      console.log('📋 Données structurées pour Airtable:', devisData);

      const result = await sendDevisToAirtable(devisData);
      
      if (result.success) {
        console.log('✅ Devis envoyé avec succès à Airtable');
        setAirtableStatus({ 
          type: 'success', 
          message: 'Devis envoyé avec succès ! Un lien de paiement a été envoyé par email.' 
        });
        setPaymentLink(result.paymentLink);
      } else {
        console.error('❌ Erreur lors de l\'envoi du devis:', result.message);
        setAirtableStatus({ type: 'error', message: 'Erreur lors de l\'envoi du devis' });
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du devis à Airtable:', error);
      setAirtableStatus({ type: 'error', message: 'Erreur de connexion' });
    } finally {
      setIsSendingToAirtable(false);
    }
  };

  // Générer le PDF du devis
  const generatePDF = () => {
    if (!quote) return;

    const doc = new jsPDF();
    
    // En-tête
    doc.setFontSize(20);
    doc.setTextColor(252, 108, 52); // Orange GrooveNomad
    doc.text('GrooveNomad', 20, 30);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('DEVIS POUR RÉSERVATION', 20, 50);
    
    // Informations du client
    doc.setFontSize(12);
    doc.text('Informations client:', 20, 70);
    doc.setFontSize(10);
    doc.text(`Nom: ${clientInfo.nom} ${clientInfo.prenom}`, 20, 80);
    doc.text(`Email: ${clientInfo.email}`, 20, 90);
    doc.text(`Téléphone: ${clientInfo.telephone}`, 20, 100);
    
    // Informations du festival
    doc.setFontSize(12);
    doc.text('Festival:', 20, 120);
    doc.setFontSize(10);
    doc.text(`Nom: ${quote.festival}`, 20, 130);
    doc.text(`Type de groupe: ${quote.groupSize}`, 20, 140);
    
    // Tableau des prestations
    const tableData = [];
    
    // Billets de festival
    quote.ticketDetails.forEach(ticket => {
      tableData.push([
        `Billet ${ticket.type}`,
        ticket.quantity,
        `${ticket.price} €`,
        `${ticket.quantity * ticket.price} €`
      ]);
    });
    
    // Hébergement
    if (quote.accommodation) {
      tableData.push([
        'Hébergement',
        1,
        `${quote.costs.accommodation} €`,
        `${quote.costs.accommodation} €`
      ]);
    }
    
    // Vol
    if (quote.flight && quote.flightQuantity > 0) {
      tableData.push([
        'Billets d\'avion',
        quote.flightQuantity,
        `${quote.flight.price} €`,
        `${quote.costs.flights} €`
      ]);
    }
    
    // Commission GrooveNomad
    tableData.push([
      'Commission GrooveNomad (5%)',
      1,
      `${quote.costs.commissionGrooveNomad.toFixed(2)} €`,
      `${quote.costs.commissionGrooveNomad.toFixed(2)} €`
    ]);
    
    // Génération du tableau
    autoTable(doc, {
      startY: 160,
      head: [['Prestation', 'Quantité', 'Prix unitaire', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [252, 108, 52],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10
      }
    });
    
    // Total
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Total TTC: ${quote.costs.total.toFixed(2)} €`, 20, finalY);
    
    // Conditions
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Conditions:', 20, finalY + 20);
    doc.setFontSize(8);
    doc.text('• Ce devis est valable 30 jours', 20, finalY + 30);
    doc.text('• Paiement à effectuer avant la date limite', 20, finalY + 40);
    doc.text('• Commission GrooveNomad incluse dans le total', 20, finalY + 50);
    
    // Pied de page
    doc.setFontSize(8);
    doc.text('GrooveNomad - Votre partenaire pour les festivals', 20, 280);
    doc.text('Email: contact@groovenomad.com | Tél: +33 1 23 45 67 89', 20, 285);
    
    // Sauvegarde du PDF
    doc.save(`devis-${quote.festival}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setSelectedGroupSize('');
    setSelectedAccommodation('');
    setTicketQuantities({ basic: 0, premier: 0, vip: 0 });
    setFlightQuantity(0);
    setShowQuoteResult(false);
    setQuote(null);
    // Garder les informations de l'utilisateur connecté
    setClientInfo({
      nom: user?.nom || '',
      prenom: user?.prenom || '',
      email: user?.email || '',
      telephone: ''
    });
  };

  const handleSectionChange = (section) => {
    setExpandedSection(expandedSection === section ? '' : section);
  };

  if (!festival) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Alert severity="warning">
            Les données du festival ne sont pas disponibles pour la réservation.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="reservation-form-card">
      <CardContent>
        <Typography variant="h4" sx={{ mb: 3, color: 'white', fontWeight: 'bold' }}>
            Réservation & Devis
          </Typography>

        {/* Section 1: Informations client */}
        <Accordion 
          expanded={expandedSection === 'client'} 
          onChange={() => handleSectionChange('client')}
          className="reservation-accordion"
        >
          <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'white' }} />}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                1. Vos informations
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {user ? (
              <Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Vos informations de profil sont automatiquement utilisées pour ce devis.
                </Alert>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Prénom"
                      value={clientInfo.prenom}
                      disabled
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nom"
                      value={clientInfo.nom}
                      disabled
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={clientInfo.email}
                      disabled
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Téléphone"
                      value={clientInfo.telephone}
                      onChange={(e) => setClientInfo({...clientInfo, telephone: e.target.value})}
                      variant="outlined"
                      sx={{ mb: 2 }}
                      placeholder="Votre numéro de téléphone"
                    />
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <Alert severity="warning">
                Vous devez être connecté pour générer un devis. Veuillez vous connecter ou créer un compte.
          </Alert>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Section 2: Taille du groupe */}
        <Accordion 
          expanded={expandedSection === 'groupSize'} 
          onChange={() => handleSectionChange('groupSize')}
          className="reservation-accordion"
        >
          <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'white' }} />}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                2. Taille de votre groupe
              </Typography>
              {selectedGroupSize && (
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
                  {groupTypes[selectedGroupSize].name}
                </Typography>
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
                <Grid container spacing={2}>
                  {Object.entries(groupTypes).map(([key, group]) => (
                <Grid item xs={12} md={6} lg={3} key={key}>
                  <Card 
                    className={`option-card ${selectedGroupSize === key ? 'selected' : ''}`}
                    onClick={() => setSelectedGroupSize(key)}
                    sx={{
                      cursor: 'pointer',
                      border: selectedGroupSize === key ? '2px solid #fc6c34' : '1px solid rgba(255,255,255,0.1)',
                      transition: 'all 0.3s ease',
                      height: '100%',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ textAlign: 'center' }}>
                        <Box sx={{ color: '#fc6c34', fontSize: '2rem', mb: 1 }}>
                              {group.icon}
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                {group.name}
                              </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                          {group.size}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                          {group.description}
                            </Typography>
                          </Box>
                    </CardContent>
                  </Card>
                    </Grid>
                  ))}
                </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Section 3: Hébergement */}
        {selectedGroupSize && (
          <Accordion 
            expanded={expandedSection === 'accommodation'} 
            onChange={() => handleSectionChange('accommodation')}
            className="reservation-accordion"
          >
            <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'white' }} />}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  3. Choisir votre hébergement
                </Typography>
                {selectedAccommodation && (
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
                    Option sélectionnée: {selectedAccommodation}
                  </Typography>
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {getAccommodationOptions(selectedGroupSize).map((option) => (
                  <Grid item xs={12} md={6} lg={4} key={option.id}>
                    <Card 
                      className={`accommodation-card ${selectedAccommodation === option.id ? 'selected' : ''}`}
                      onClick={() => setSelectedAccommodation(option.id)}
                      sx={{
                        cursor: 'pointer',
                        border: selectedAccommodation === option.id ? '2px solid #fc6c34' : '1px solid rgba(255,255,255,0.1)',
                        transition: 'all 0.3s ease',
                        height: '100%',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                        }
                      }}
                    >
                      <CardContent>
                  <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <img 
                              src={option.photo || '/fete_bg.png'} 
                              alt={option.name}
                              style={{ 
                                width: '100%',
                                height: '200px',
                                objectFit: 'cover',
                                borderRadius: '8px'
                              }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="h6" sx={{ color: '#fc6c34', fontWeight: 'bold', mb: 1 }}>
                              {option.name}
                              </Typography>
                            <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.8)' }}>
                              {option.description}
                              </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <FaMapMarkerAlt style={{ color: '#fc6c34' }} />
                                Distance: {option.distance}
                                </Typography>
                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <FaClock style={{ color: '#fc6c34' }} />
                                {option.carTime}
                                </Typography>
                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FaUsers style={{ color: '#fc6c34' }} />
                                Capacité: {option.capacity}
                                </Typography>
                              </Box>
                            <Typography variant="h6" sx={{ color: '#fc6c34', mb: 2, fontWeight: 'bold' }}>
                              {option.pricePerNight} € / nuit
                                </Typography>
                            {option.url && (
                              <Button
                                variant="outlined"
                                href={option.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                startIcon={<FaBed />}
                                onClick={(e) => e.stopPropagation()}
                                sx={{ 
                                  color: 'white',
                                  borderColor: 'rgba(255,255,255,0.3)',
                                  '&:hover': {
                                    borderColor: '#fc6c34',
                                    backgroundColor: 'rgba(252, 108, 52, 0.1)'
                                  }
                                }}
                              >
                                Voir l'hébergement
                              </Button>
                            )}
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                              <Button
                                variant={selectedAccommodation === option.id ? "contained" : "outlined"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAccommodation(option.id);
                                }}
                                      sx={{ 
                                  backgroundColor: selectedAccommodation === option.id ? '#fc6c34' : 'transparent',
                                  color: 'white',
                                  borderColor: selectedAccommodation === option.id ? '#fc6c34' : 'rgba(255,255,255,0.3)',
                                  '&:hover': {
                                    backgroundColor: selectedAccommodation === option.id ? '#e55a29' : 'rgba(252, 108, 52, 0.1)',
                                    borderColor: '#fc6c34'
                                  }
                                }}
                              >
                                {selectedAccommodation === option.id ? 'Sélectionné' : 'Sélectionner'}
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                      </Grid>
                    ))}
                  </Grid>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Section 4: Billets de festival */}
        <Accordion 
          expanded={expandedSection === 'tickets'} 
          onChange={() => handleSectionChange('tickets')}
          className="reservation-accordion"
        >
          <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'white' }} />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Star sx={{ color: '#fc6c34' }} />
              <Typography variant="h6">
                4. Choisissez votre type de billet
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
                <Grid container spacing={2}>
                  {Object.entries(ticketTypes).map(([key, ticket]) => (
                    <Grid item xs={12} md={4} key={key}>
                  <Card 
                    className="ticket-card"
                    sx={{ 
                      border: ticketQuantities[key] > 0 ? `2px solid ${ticket.color}` : '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" sx={{ color: ticket.color, fontWeight: 'bold' }}>
                              {ticket.name}
                            </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                              {ticket.description}
                            </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {getTicketPrices()[key]} €
                            </Typography>
                      <TextField
                        type="number"
                        label="Quantité"
                        value={ticketQuantities[key]}
                        onChange={(e) => {
                          const newQuantities = {
                            ...ticketQuantities,
                            [key]: parseInt(e.target.value) >= 0 ? parseInt(e.target.value) : 0,
                          };
                          setTicketQuantities(newQuantities);
                        }}
                        inputProps={{ min: 0 }}
                        variant="standard"
                        sx={{ mt: 1, width: '100px' }}
                      />
                    </CardContent>
                  </Card>
                    </Grid>
                  ))}
                </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Section 5: Vol (si disponible) */}
        {getFlightInfo() && getFlightInfo().description !== 'Vol non disponible' && (
          <Accordion 
            expanded={expandedSection === 'flight'} 
            onChange={() => handleSectionChange('flight')}
            className="reservation-accordion"
          >
            <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'white' }} />}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  5. Réserver un vol
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {getFlightInfo().description}
                </Typography>
                <Typography variant="body2">
                  <strong>Trajet:</strong> {getFlightInfo().departure} → {getFlightInfo().arrival}
                </Typography>
                <Typography variant="body2">
                  <strong>Prix:</strong> {getFlightInfo().price} € par personne
                </Typography>
                {getFlightInfo().url && (
                  <Button
                    variant="outlined"
                    href={getFlightInfo().url}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<FaPlane />}
                    sx={{ 
                      mt: 2,
                      mb: 2,
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.3)',
                      '&:hover': {
                        borderColor: '#fc6c34',
                        backgroundColor: 'rgba(252, 108, 52, 0.1)'
                      }
                    }}
                  >
                    Voir le vol
                  </Button>
                )}
                <TextField
                  type="number"
                  label="Nombre de voyageurs"
                  value={flightQuantity}
                  onChange={(e) => setFlightQuantity(parseInt(e.target.value) >= 0 ? parseInt(e.target.value) : 0)}
                  inputProps={{ min: 0 }}
                  variant="standard"
                  sx={{ mt: 2, width: '200px' }}
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Résumé du devis */}
        {showQuoteResult && quote && (
          <Card sx={{ mt: 3, background: 'rgba(255, 255, 255, 0.1)' }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2, color: '#fc6c34' }}>
                Résumé de votre devis
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Festival: {quote.festival}
                </Typography>
                
                {quote.ticketDetails.map((ticket, index) => (
                  <Typography key={index} variant="body2">
                    {ticket.quantity}x {ticket.type} - {ticket.quantity * ticket.price} €
                  </Typography>
                ))}
              </Box>

              {quote.accommodation && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Hébergement: {quote.accommodation.name}
                  </Typography>
                  <Typography variant="body2">
                    Prix total: {quote.costs.accommodation} €
                  </Typography>
                </Box>
              )}

              {quote.flight && quote.flightQuantity > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Vol
                  </Typography>
                  <Typography variant="body2">
                    {quote.flightQuantity}x billet(s) à {quote.flight.price} € - Total: {quote.costs.flights} €
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

              <Typography variant="body2" sx={{ mb: 1 }}>
                Sous-total: {quote.costs.subtotal} €
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, color: '#fc6c34' }}>
                Commission GrooveNomad (5%): {quote.costs.commissionGrooveNomad.toFixed(2)} €
              </Typography>
              <Typography variant="h6" sx={{ color: '#fc6c34', fontWeight: 'bold' }}>
                Total: {quote.costs.total.toFixed(2)} €
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Statut de l'envoi à Airtable */}
        {airtableStatus && (
          <Alert 
            severity={airtableStatus.type} 
            sx={{ mb: 2, width: '100%' }}
            onClose={() => setAirtableStatus(null)}
          >
            {airtableStatus.message}
          </Alert>
        )}

        {/* Boutons d'action */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={generateQuote}
            disabled={!user || !selectedGroupSize || !selectedAccommodation || Object.values(ticketQuantities).every(qty => qty === 0) || isSendingToAirtable}
            startIcon={<Calculate />}
            sx={{
              backgroundColor: '#fc6c34',
              '&:hover': {
                backgroundColor: '#e85a20'
              }
            }}
          >
            {!user ? 'Connectez-vous pour générer un devis' : 
             isSendingToAirtable ? 'Envoi en cours...' : 'Générer le devis'}
          </Button>
          
          {showQuoteResult && quote && (
            <>
              <Button
                variant="contained"
                onClick={generatePDF}
                startIcon={<FaDownload />}
                sx={{
                  backgroundColor: '#27ae60',
                  '&:hover': {
                    backgroundColor: '#229954'
                  }
                }}
              >
                Télécharger PDF
              </Button>
            </>
          )}
          

          
          <Button
            variant="outlined"
            onClick={resetForm}
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.3)',
              '&:hover': { 
                borderColor: '#fc6c34',
                backgroundColor: 'rgba(252, 108, 52, 0.1)'
              }
            }}
          >
            Réinitialiser
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ReservationForm; 