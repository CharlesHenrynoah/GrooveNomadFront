import { base, TABLE_NAME } from '../airtableConfig';

// Facteurs de conversion vers EUR (mis à jour régulièrement)
const CONVERSION_RATES = {
  EUR: 1,      // Pas de conversion
  USD: 0.85,   // 1 USD = 0.85 EUR (approximatif - à ajuster selon les taux réels)
  GBP: 1.15    // 1 GBP = 1.15 EUR (approximatif - à ajuster selon les taux réels)
};

// Fonction pour convertir les prix vers EUR
const convertPriceToEUR = (price, currency) => {
  if (!price || price === 0) return 0;
  
  const rate = CONVERSION_RATES[currency] || 1;
  const convertedPrice = Math.round(price * rate);
  
  console.log(`💱 Conversion ${price} ${currency} → ${convertedPrice} EUR (taux: ${rate})`);
  
  return convertedPrice;
};

// Fonction pour nettoyer les noms d'artistes dupliqués
const cleanArtistName = (name) => {
  if (!name) return '';
  
  // Diviser le nom en mots
  const words = name.split(' ');
  
  // Détecter si le nom est dupliqué (ex: "Martin GarrixMartin Garrix")
  const halfLength = Math.floor(words.length / 2);
  
  // Vérifier si la première moitié est identique à la seconde moitié
  if (words.length % 2 === 0) { // Nombre pair de mots
    const firstHalf = words.slice(0, halfLength).join(' ');
    const secondHalf = words.slice(halfLength).join(' ');
    
    if (firstHalf === secondHalf) {
      console.log(`🔄 Nom dupliqué détecté: "${name}" → "${firstHalf}"`);
      return firstHalf;
    }
  }
  
  // Vérifier si c'est une concaténation simple (ex: "Martin GarrixMartin Garrix")
  const originalName = name.trim();
  const possibleDuplicate = originalName.length > 2;
  
  if (possibleDuplicate) {
    // Essayer de trouver un motif répétitif
    for (let i = 1; i <= originalName.length / 2; i++) {
      const pattern = originalName.substring(0, i);
      const repeated = pattern.repeat(Math.floor(originalName.length / i));
      
      if (repeated === originalName && pattern.length > 2) {
        console.log(`🔄 Motif dupliqué détecté: "${name}" → "${pattern}"`);
        return pattern;
      }
    }
  }
  
  return name;
};

// Service pour récupérer les festivals depuis Airtable
export const getFestivalsFromAirtable = async () => {
  try {
    console.log('🔍 Début de la récupération des festivals depuis Airtable...');
    console.log('📋 Base ID:', base._base.getId());
    console.log('🗂️ Table Name:', TABLE_NAME);
    
    const records = await base(TABLE_NAME).select({
      view: 'Grid view', // Utiliser la vue Grid view
      // Filtrer pour ne récupérer que les enregistrements avec les champs obligatoires
      filterByFormula: "AND(NOT({Festival Name} = ''), NOT({Genre} = ''), NOT({City} = ''), NOT({Country} = ''))"
    }).all();

    console.log('📊 Nombre de records récupérés:', records.length);
    
    if (records.length === 0) {
      console.warn('⚠️ Aucun record trouvé dans la table Airtable!');
      return [];
    }

    console.log('🎭 Premier record pour debug:', records[0].fields);

    const festivals = records.map((record, index) => {
      const fields = record.fields;
      
      console.log(`🎪 Mapping du festival ${index + 1}:`, fields['Festival Name']);
      
      // Vérifier si une conversion de devise est nécessaire
      const originalCurrency = fields['Currency'] || 'EUR';
      if (originalCurrency !== 'EUR') {
        console.log(`💱 Conversion nécessaire pour ${fields['Festival Name']}: ${originalCurrency} → EUR`);
      }
      
      // Mapper les champs Airtable vers notre structure
      const mappedEvent = {
        id: record.id,
        nom: fields['Festival Name'] || '',
        dateDebut: fields['Dates début'] || '',
        dateFin: fields['Dates fin'] || '',
        genre: fields['Genre'] || '',
        ville: fields['City'] || '',
        pays: fields['Country'] || '',
        lieu: fields['Venue'] || '',
        capacite: fields['Capacity'] || 0,
        siteWeb: fields['Website'] || '',
        duree: calculateDuration(fields['Dates début'], fields['Dates fin']),
        hebergement: parseAccommodationOptions(fields['Accommodation Options']),
        aeroport: fields['Nearest Airport'] || '',
        typeEvenement: fields['Atmosphere'] || '',
        description: fields['Description'] || '',
        typeBillet: fields['Ticket Type'] || '',
        devise: 'EUR', // Tous les prix sont maintenant en EUR après conversion
        deviseOriginale: fields['Currency'] || 'EUR', // Stocker la devise originale
        prix: [
          convertPriceToEUR(fields['Price Tier 1'] || 0, fields['Currency'] || 'EUR'),
          convertPriceToEUR(fields['Price Tier 2'] || 0, fields['Currency'] || 'EUR'),
          convertPriceToEUR(fields['Price Tier 3'] || 0, fields['Currency'] || 'EUR')
        ],
        // Utiliser Media 1 Festival comme image principale
        image: fields['Media 1 Festival'] ? fields['Media 1 Festival'][0]?.url : '/fete_bg.png',
        
        // Lineup des artistes
        lineup: [
          {
            nom: cleanArtistName(fields['Lineup artiste 1'] || ''),
            photo: fields['Photo Lineup artiste 1'] ? fields['Photo Lineup artiste 1'][0]?.url : null
          },
          {
            nom: cleanArtistName(fields['Lineup artiste 2'] || ''),
            photo: fields['Photo Lineup artiste 2'] ? fields['Photo Lineup artiste 2'][0]?.url : null
          },
          {
            nom: cleanArtistName(fields['Lineup artiste 3'] || ''),
            photo: fields['Photo Lineup artiste 3'] ? fields['Photo Lineup artiste 3'][0]?.url : null
          },
          {
            nom: cleanArtistName(fields['Lineup artiste 4'] || ''),
            photo: fields['Photo Lineup artiste 4'] ? fields['Photo Lineup artiste 4'][0]?.url : null
          }
        ].filter(artiste => artiste.nom), // Filtrer les artistes vides
        
        // Médias supplémentaires
        medias: [
          fields['Media 1 Festival'] ? fields['Media 1 Festival'][0]?.url : null,
          fields['Media 2 Festival'] ? fields['Media 2 Festival'][0]?.url : null,
          fields['Media 3 Festival'] ? fields['Media 3 Festival'][0]?.url : null
        ].filter(media => media), // Filtrer les médias vides
        
        // Générer un nombre de likes aléatoire pour l'instant
        nombreLikes: Math.floor(Math.random() * 9000) + 1000,
        
        // Notes
        notes: fields['Notes'] || '',

        // Champs pour le formulaire de réservation
        // Hébergements
        description_hebergement_petit_1: fields['Description Hébergement Petit Groupe 1'],
        url_hebergement_petit_1: fields['Copie de  URL Hébergement Petit Groupe 1'],
        distance_hebergement_petit_1: fields['Distance Hébergement Petit Groupe 1'],
        capacite_hebergement_petit_1: fields['Capacité Hebergement Petit Groupe 1'],
        prix_nuit_hebergement_petit_1: fields['Prix/nuit Hébergement Petit Groupe 1'],
        prix_total_hebergement_petit_1: fields['Prix total (3 nuits) Hébergement Petit Groupe 1'],
        equipements_hebergement_petit_1: fields['Équipements Hébergement Petit Groupe 1'],
        photo_hebergement_petit_1: fields['Photo Hébergement Petit Groupe 1']?.[0]?.url,
        temps_voiture_hebergement_petit_1: fields['Temps voiture Hébergement Petit Groupe 1'],

        description_hebergement_petit_2: fields['Description Hébergement Petit Groupe 2'],
        url_hebergement_petit_2: fields['URL Hébergement Petit Groupe 2'],
        distance_hebergement_petit_2: fields['Distance Hébergement Petit Groupe 2'],
        capacite_hebergement_petit_2: fields['Capacité Hébergement Petit Groupe 2'],
        prix_nuit_hebergement_petit_2: fields['Prix/nuit Hébergement Petit Groupe 2'],
        prix_total_hebergement_petit_2: fields['Prix total (3 nuits) Hébergement Petit Groupe 2'],
        equipements_hebergement_petit_2: fields['Équipements Hébergement Petit Groupe 2'],
        photo_hebergement_petit_2: fields['Photo Hébergement Petit Groupe 2']?.[0]?.url,
        temps_voiture_hebergement_petit_2: fields['Temps voiture Hébergement Petit Groupe 2'],

        description_hebergement_petit_3: fields['Description Hébergement Petit Groupe 3'],
        url_hebergement_petit_3: fields['URL Hébergement Petit Groupe 3'],
        distance_hebergement_petit_3: fields['Distance Hébergement Petit Groupe 3'],
        capacite_hebergement_petit_3: fields['Capacité Hébergement Petit Groupe 3'],
        prix_nuit_hebergement_petit_3: fields['Prix/nuit Hébergement Petit Groupe 3'],
        prix_total_hebergement_petit_3: fields['Prix total (3 nuits) Hébergement Petit Groupe 3'],
        equipements_hebergement_petit_3: fields['Équipements Hébergement Petit Groupe 3'],
        photo_hebergement_petit_3: fields['Photo Hébergement Petit Groupe 3']?.[0]?.url,
        temps_voiture_hebergement_petit_3: fields['Temps voiture Hébergement Petit Groupe 3'],

        description_hebergement_moyen_1: fields['Description Hébergement Groupe Moyen 1'],
        url_hebergement_moyen_1: fields['URL Hébergement Groupe Moyen 1'],
        distance_hebergement_moyen_1: fields['Distance Hébergement Groupe Moyen 1'],
        capacite_hebergement_moyen_1: fields['Capacité Hébergement Groupe Moyen 1'],
        prix_nuit_hebergement_moyen_1: fields['Prix/nuit Hébergement Groupe Moyen 1'],
        prix_total_hebergement_moyen_1: fields['Prix total (3 nuits) Hébergement Groupe Moyen 1'],
        equipements_hebergement_moyen_1: fields['Équipements Hébergement Groupe Moyen 1'],
        photo_hebergement_moyen_1: fields['Photo Hébergement Groupe Moyen 1']?.[0]?.url,
        temps_voiture_hebergement_moyen_1: fields['Temps voiture Hébergement Groupe Moyen 1'],

        description_hebergement_moyen_2: fields['Description Hébergement Groupe Moyen 2'],
        url_hebergement_moyen_2: fields['URL Hébergement Groupe Moyen 2'],
        distance_hebergement_moyen_2: fields['Distance Hébergement Groupe Moyen 2'],
        capacite_hebergement_moyen_2: fields['Capacité Hébergement Groupe Moyen 2'],
        prix_nuit_hebergement_moyen_2: fields['Prix/nuit Hébergement Groupe Moyen 2'],
        prix_total_hebergement_moyen_2: fields['Prix total (3 nuits) Hébergement Groupe Moyen 2'],
        equipements_hebergement_moyen_2: fields['Équipements Hébergement Groupe Moyen 2'],
        photo_hebergement_moyen_2: fields['Photo Hébergement Groupe Moyen 2']?.[0]?.url,
        temps_voiture_hebergement_moyen_2: fields['Temps voiture Hébergement Groupe Moyen 2'],

        description_hebergement_moyen_3: fields['Description Hébergement Groupe Moyen 3'],
        url_hebergement_moyen_3: fields['URL Hébergement Groupe Moyen 3'],
        distance_hebergement_moyen_3: fields['Distance Hébergement Groupe Moyen 3'],
        capacite_hebergement_moyen_3: fields['Capacité Hébergement Groupe Moyen 3'],
        prix_nuit_hebergement_moyen_3: fields['Prix/nuit Hébergement Groupe Moyen 3'],
        prix_total_hebergement_moyen_3: fields['Prix total (3 nuits) Hébergement Groupe Moyen 3'],
        equipements_hebergement_moyen_3: fields['Équipements Hébergement Groupe Moyen 3'],
        photo_hebergement_moyen_3: fields['Photo Hébergement Groupe Moyen 3']?.[0]?.url,
        temps_voiture_hebergement_moyen_3: fields['Temps voiture Hébergement Groupe Moyen 3'],

        description_hebergement_large_1: fields['Description Hébergement Groupe Large 1'],
        url_hebergement_large_1: fields['URL Hébergement Groupe Large 1'],
        distance_hebergement_large_1: fields['Distance Hébergement Groupe Large 1'],
        capacite_hebergement_large_1: fields['Capacité Hébergement Groupe Large 1'],
        prix_nuit_hebergement_large_1: fields['Prix/nuit Hébergement Groupe Large 1'],
        prix_total_hebergement_large_1: fields['Prix total (3 nuits) Hébergement Groupe Large 1'],
        equipements_hebergement_large_1: fields['Équipements Hébergement Groupe Large 1'],
        photo_hebergement_large_1: fields['Photo Hébergement Groupe Large 1']?.[0]?.url,
        temps_voiture_hebergement_large_1: fields['Temps voiture Hébergement Groupe Large 1'],
        
        description_hebergement_large_2: fields['Description Hébergement Groupe Large 2'],
        url_hebergement_large_2: fields['URL Hébergement Groupe Large 2'],
        distance_hebergement_large_2: fields['Distance Hébergement Groupe Large 2'],
        capacite_hebergement_large_2: fields['Capacité Hébergement Groupe Large 2'],
        prix_nuit_hebergement_large_2: fields['Prix/nuit Hébergement Groupe Large 2'],
        prix_total_hebergement_large_2: fields['Prix total (3 nuits) Hébergement Groupe Large 2'],
        equipements_hebergement_large_2: fields['Équipements Hébergement Groupe Large 2'],
        photo_hebergement_large_2: fields['Photo Hébergement Groupe Large 2']?.[0]?.url,
        temps_voiture_hebergement_large_2: fields['Temps voiture Hébergement Groupe Large 2'],

        description_hebergement_large_3: fields['Description Hébergement Groupe Large 3'],
        url_hebergement_large_3: fields['URL Hébergement Groupe Large 3'],
        distance_hebergement_large_3: fields['Distance Hébergement Groupe Large 3'],
        capacite_hebergement_large_3: fields['Capacité Hébergement Groupe Large 3'],
        prix_nuit_hebergement_large_3: fields['Prix/nuit Hébergement Groupe Large 3'],
        prix_total_hebergement_large_3: fields['Prix total (3 nuits) Hébergement Groupe Large 3'],
        equipements_hebergement_large_3: fields['Équipements Hébergement Groupe Large 3'],
        photo_hebergement_large_3: fields['Photo Hébergement Groupe Large 3']?.[0]?.url,
        temps_voiture_hebergement_large_3: fields['Temps voiture Hébergement Groupe Large 3'],

        description_hebergement_tresgrand_1: fields['Description Hébergement Très Grand Groupe 1'],
        url_hebergement_tresgrand_1: fields['URL Hébergement Très Grand Groupe 1'],
        distance_hebergement_tresgrand_1: fields['Distance Hébergement Très Grand Groupe 1'],
        capacite_hebergement_tresgrand_1: fields['Capacité Hébergement Très Grand Groupe 1'],
        prix_nuit_hebergement_tresgrand_1: fields['Prix/nuit Hébergement Très Grand Groupe 1'],
        prix_total_hebergement_tresgrand_1: fields['Prix total (3 nuits) Hébergement Très Grand Groupe 1'],
        equipements_hebergement_tresgrand_1: fields['Équipements Hébergement Très Grand Groupe 1'],
        photo_hebergement_tresgrand_1: fields['Photo Hébergement Très Grand Groupe 1']?.[0]?.url,
        temps_voiture_hebergement_tresgrand_1: fields['Temps voiture Hébergement Très Grand Groupe 1'],
        
        description_hebergement_tresgrand_2: fields['Description Hébergement Très Grand Groupe 2'],
        url_hebergement_tresgrand_2: fields['URL Hébergement Très Grand Groupe 2'],
        distance_hebergement_tresgrand_2: fields['Distance Hébergement Très Grand Groupe 2'],
        capacite_hebergement_tresgrand_2: fields['Capacité Hébergement Très Grand Groupe 2'],
        prix_nuit_hebergement_tresgrand_2: fields['Prix/nuit Hébergement Très Grand Groupe 2'],
        prix_total_hebergement_tresgrand_2: fields['Prix total (3 nuits) Hébergement Très Grand Groupe 2'],
        equipements_hebergement_tresgrand_2: fields['Équipements Hébergement Très Grand Groupe 2'],
        photo_hebergement_tresgrand_2: fields['Photo Hébergement Très Grand Groupe 2']?.[0]?.url,
        temps_voiture_hebergement_tresgrand_2: fields['Temps voiture Hébergement Très Grand Groupe 2'],
        
        // Vols
        description_vol_1: fields['Description Vol 1'],
        url_vol_1: fields['URL Vol 1'],
        aeroport_depart_1: fields['Aéroport de départ 1'],
        aeroport_arrivee_1: fields['Aéroport d’arrivée 1'],
        date_aller_1: fields['Date Aller 1'],
        date_retour_1: fields['Date Retour 1'],
        classe_1: fields['Classe 1'],
        prix_unitaire_1: fields['Prix indicatif unitaire 1'],
        compagnie_1: fields['Compagnie aérienne 1'],
        duree_vol_1: fields['Durée estimée du vol'],

        // Prix des billets
        price_tier_1: fields['Price Tier 1'],
        price_tier_2: fields['Price Tier 2'],
        price_tier_3: fields['Price Tier 3'],
      };

      // Formater les dates
      if (mappedEvent.dateDebut && mappedEvent.dateFin) {
        mappedEvent.dates = `${mappedEvent.dateDebut} - ${mappedEvent.dateFin}`;
      }

      // Compatibilité avec l'ancien format
      mappedEvent.interessees = mappedEvent.nombreLikes;

      console.log(`✅ Festival mappé:`, {
        nom: mappedEvent.nom,
        genre: mappedEvent.genre,
        ville: mappedEvent.ville,
        pays: mappedEvent.pays,
        dates: mappedEvent.dates,
        image: mappedEvent.image
      });

      return mappedEvent;
    });

    // Résumé des conversions effectuées
    const conversions = festivals.filter(f => f.deviseOriginale !== 'EUR');
    if (conversions.length > 0) {
      console.log(`💱 ${conversions.length} festival(s) avec conversion de devise:`);
      conversions.forEach(f => {
        console.log(`  - ${f.nom}: ${f.deviseOriginale} → EUR`);
      });
    }
    
    console.log('🎉 Festivals récupérés avec succès:', festivals.length);
    return festivals;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des festivals depuis Airtable:', error);
    console.error('🔍 Détails de l\'erreur:', error.message);
    console.error('📋 Stack trace:', error.stack);
    throw error;
  }
};

// Fonction pour calculer la durée entre deux dates
const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Fonction pour parser les options d'hébergement
const parseAccommodationOptions = (accommodationString) => {
  if (!accommodationString) return [];
  
  // Séparer par virgules et nettoyer
  const options = accommodationString.split(',').map(option => option.trim());
  
  // Mapper vers nos valeurs standardisées
  const mappedOptions = options.map(option => {
    const lowerOption = option.toLowerCase();
    
    if (lowerOption.includes('camping')) return 'Camping';
    if (lowerOption.includes('glamping')) return 'Glamping';
    if (lowerOption.includes('hotel')) return 'Hotel';
    if (lowerOption.includes('bungalow')) return 'Bungalow';
    if (lowerOption.includes('airbnb')) return 'Airbnb';
    
    return option; // Retourner l'option originale si pas de correspondance
  });
  
  return mappedOptions;
};

// Fonction pour envoyer un devis à Airtable
export const sendDevisToAirtable = async (devisData) => {
  try {
    console.log('📋 Envoi du devis à Airtable...', devisData);
    
    // Générer un ID unique pour le devis
    const devisId = `GROOVE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Créer le lien de paiement unique avec les données encodées
    const paymentDataForUrl = {
      devisid: devisId,
      invoicenumber: devisId,
      amount: devisData.total_ttc.toFixed(2),
      festivalname: devisData.festival_nom || 'Festival',
      clientname: `${devisData.client_nom} ${devisData.client_prenom}`,
      clientemail: devisData.client_email,
      // Ajouter toutes les données du devis pour une utilisation complète
      devisdata: devisData
    };
    
    console.log('🎫 Nom du festival dans les données:', devisData.festival_nom);
    console.log('🎫 Nom du festival assigné:', paymentDataForUrl.festivalName);
    
    // Encoder les données dans l'URL avec gestion des caractères spéciaux
    const jsonString = JSON.stringify(paymentDataForUrl);
    console.log('📋 JSON string avant encodage:', jsonString);
    
    // Utiliser une approche plus simple avec encodeURIComponent
    const encodedData = encodeURIComponent(jsonString);
    const paymentLink = `${window.location.origin}/payment/${devisId}?data=${encodedData}`;
    
    console.log('🔗 Données encodées dans l\'URL:', paymentDataForUrl);
    console.log('📝 URL complète du lien de paiement:', paymentLink);
    
    // Préparer les données pour Airtable selon la structure du CSV
    const airtableData = {};
    
    // Champs texte - toujours inclus même si vides
    airtableData['Nom Prénom Réservant'] = `${devisData.client_nom || ''} ${devisData.client_prenom || ''}`.trim() || 'Non spécifié';
    airtableData['Email'] = devisData.client_email || 'Non spécifié';
    
    // Champs numériques - seulement si la valeur est > 0
    if (devisData.ticket_basic_quantity > 0) {
      airtableData['Nombre de Tickets Basic'] = Number(devisData.ticket_basic_quantity);
      airtableData['Prix Total Tickets Basic'] = Number(devisData.ticket_basic_prix_total);
    }
    
    if (devisData.ticket_premier_quantity > 0) {
      airtableData['Nombre de Tickets Premier'] = Number(devisData.ticket_premier_quantity);
      airtableData['Prix Total Tickets Premier'] = Number(devisData.ticket_premier_prix_total);
    }
    
    if (devisData.ticket_vip_quantity > 0) {
      airtableData['Nombre de Tickets VIP'] = Number(devisData.ticket_vip_quantity);
      airtableData['Prix Total Tickets VIP'] = Number(devisData.ticket_vip_prix_total);
    }
    
    if (devisData.cout_hebergement > 0) {
      airtableData['Coût Total Hébergement'] = Number(devisData.cout_hebergement);
    }
    
    if (devisData.flight_quantity > 0) {
      airtableData['Nombre Billets de Vol'] = Number(devisData.flight_quantity);
      airtableData['Coût Total Billets de Vol'] = Number(devisData.cout_vols);
    }
    
    // Totaux - toujours inclus même si 0
    if (devisData.sous_total > 0) {
      airtableData['Sous-Total'] = Number(devisData.sous_total);
    }
    
    if (devisData.commission_groovenomad > 0) {
      airtableData['Total Commission'] = Number(devisData.commission_groovenomad);
    }
    
    if (devisData.total_ttc > 0) {
      airtableData['Total'] = Number(devisData.total_ttc);
    }
    
    // Ajouter le lien de paiement
    airtableData['Page de paiement'] = paymentLink;

    console.log('📊 Données formatées pour Airtable:', airtableData);
    console.log('🔗 Lien de paiement généré:', paymentLink);

    // Envoyer à la table "Demande_de_devis"
    const record = await base('Demande_de_devis').create([
      {
        fields: airtableData
      }
    ]);

    console.log('✅ Devis envoyé avec succès à Airtable:', record[0].id);
    
    // Stocker les données du devis dans localStorage pour la page de paiement
    const paymentData = {
      devisid: devisId,
      invoicenumber: devisId,
      amount: devisData.total_ttc.toFixed(2),
      festivalname: devisData.festival_nom || 'Festival',
      clientname: `${devisData.client_nom} ${devisData.client_prenom}`,
      clientemail: devisData.client_email,
      devisdata: devisData
    };
    
    console.log('💾 Stockage des données de paiement:', {
      key: `payment_${devisId}`,
      data: paymentData
    });
    
    localStorage.setItem(`payment_${devisId}`, JSON.stringify(paymentData));
    
    // Vérifier que les données ont été stockées
    const storedData = localStorage.getItem(`payment_${devisId}`);
    console.log('✅ Vérification du stockage:', storedData ? 'Données stockées avec succès' : 'Erreur de stockage');

    return {
      success: true,
      recordId: record[0].id,
      paymentLink: paymentLink,
      devisId: devisId,
      message: 'Devis envoyé avec succès'
    };

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi du devis à Airtable:', error);
    return {
      success: false,
      error: error.message,
      message: 'Erreur lors de l\'envoi du devis'
    };
  }
};

const airtableService = { getFestivalsFromAirtable };
export default airtableService; 