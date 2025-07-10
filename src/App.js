import React from 'react';
import './App.css';
import AirtableData from './components/AirtableData';
import ConnectionTest from './components/ConnectionTest';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>BloomNomad - Intégration Airtable</h1>
        <p>Gestion des données avec Airtable API</p>
      </header>
      <main>
        <ConnectionTest />
        <AirtableData />
      </main>
    </div>
  );
}

export default App;
