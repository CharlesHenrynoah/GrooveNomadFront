import { base, TABLE_NAME } from './airtableConfig';

// Test simple de la connexion Airtable
const testAirtableConnection = async () => {
  try {
    console.log('🧪 Test de connexion à Airtable...');
    console.log('📋 Base ID:', base._base.getId());
    console.log('🗂️ Table Name:', TABLE_NAME);
    
    // Test simple : récupérer les 5 premiers enregistrements
    const records = await base(TABLE_NAME).select({
      maxRecords: 5,
      view: 'Grid view'
    }).all();
    
    console.log('📊 Nombre de records récupérés:', records.length);
    
    if (records.length > 0) {
      console.log('🎭 Premier record:', records[0].fields);
      console.log('🎪 Champs disponibles:', Object.keys(records[0].fields));
      
      // Vérifier les champs requis
      const requiredFields = ['Festival Name', 'Genre', 'City', 'Country'];
      const missingFields = requiredFields.filter(field => !records[0].fields[field]);
      
      if (missingFields.length > 0) {
        console.warn('⚠️ Champs manquants:', missingFields);
      } else {
        console.log('✅ Tous les champs requis sont présents!');
      }
    } else {
      console.warn('⚠️ Aucun record trouvé dans la table!');
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion à Airtable:', error);
    console.error('🔍 Message d\'erreur:', error.message);
    
    if (error.statusCode) {
      console.error('🔢 Code d\'erreur HTTP:', error.statusCode);
    }
    
    if (error.error) {
      console.error('📋 Détails de l\'erreur:', error.error);
    }
  }
};

// Exporter pour utilisation
export default testAirtableConnection; 