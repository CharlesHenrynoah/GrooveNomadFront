import Airtable from 'airtable';

// Configuration Airtable
const AIRTABLE_API_KEY = process.env.REACT_APP_AIRTABLE_API_KEY || 'patOHF0agRYHNZ3Bn.a23281143706097d72cc5b8b63b56a8c3b92c96d49ddcc073c50e24cc32b9d88';
const BASE_ID = 'appdJC3RsnMtbbMzf';
const TABLE_NAME = 'festivals';

// Configuration du client Airtable
Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: AIRTABLE_API_KEY
});

const base = Airtable.base(BASE_ID);

export { base, TABLE_NAME };
export default base; 