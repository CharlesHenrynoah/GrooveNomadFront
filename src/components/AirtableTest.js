import React, { useState, useEffect } from 'react';
import { getFestivalsFromAirtable } from '../services/airtableService';
import testAirtableConnection from '../testAirtable';
import { Button, Typography, Box, Alert, CircularProgress } from '@mui/material';

const AirtableTest = () => {
  const [loading, setLoading] = useState(false);
  const [festivals, setFestivals] = useState([]);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setLogs([]);
    
    try {
      addLog('🧪 Début du test de connexion...');
      
      // Test de connexion basique
      await testAirtableConnection();
      addLog('✅ Test de connexion réussi');
      
      // Récupération des données
      addLog('📡 Récupération des festivals...');
      const data = await getFestivalsFromAirtable();
      
      setFestivals(data);
      addLog(`🎉 ${data.length} festivals récupérés`);
      
      if (data.length > 0) {
        addLog(`📋 Premier festival: ${data[0].nom}`);
        addLog(`📋 Champs du premier festival: ${Object.keys(data[0]).join(', ')}`);
      }
      
    } catch (err) {
      console.error('Erreur de test:', err);
      setError(err.message);
      addLog(`❌ Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Test automatique au chargement
  useEffect(() => {
    testConnection();
  }, []);

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Test de Connexion Airtable
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={testConnection}
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Tester la Connexion'}
      </Button>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {festivals.length > 0 && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {festivals.length} festivals récupérés avec succès !
        </Alert>
      )}
      
      {/* Logs */}
      <Box sx={{ 
        bgcolor: 'black', 
        color: 'white', 
        p: 2, 
        borderRadius: 1,
        fontFamily: 'monospace',
        fontSize: '14px',
        maxHeight: '300px',
        overflow: 'auto'
      }}>
        <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
          Logs de Debug:
        </Typography>
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </Box>
      
      {/* Données récupérées */}
      {festivals.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Festivals récupérés:
          </Typography>
          {festivals.slice(0, 3).map((festival, index) => (
            <Box key={index} sx={{ 
              border: '1px solid #ccc', 
              p: 2, 
              mb: 2, 
              borderRadius: 1 
            }}>
              <Typography variant="h6">{festival.nom}</Typography>
              <Typography>Genre: {festival.genre}</Typography>
              <Typography>Ville: {festival.ville}</Typography>
              <Typography>Pays: {festival.pays}</Typography>
              <Typography>Dates: {festival.dates}</Typography>
              <Typography>Lieu: {festival.lieu}</Typography>
              {festival.image && (
                <img 
                  src={festival.image} 
                  alt={festival.nom}
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                />
              )}
            </Box>
          ))}
          {festivals.length > 3 && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              ... et {festivals.length - 3} autres festivals
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default AirtableTest; 