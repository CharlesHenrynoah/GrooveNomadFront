import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import Connexion from './components/Connexion';
import Inscription from './components/Inscription';
import MonCompte from './components/MonCompte';
import Chatbot from './components/Chatbot';
import Evenements from './components/Evenements';
import EvenementDetail from './components/EvenementDetail';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/connexion" element={<Connexion />} />
            <Route path="/inscription" element={<Inscription />} />
            <Route path="/mon-compte" element={<MonCompte />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/evenements" element={<Evenements />} />
            <Route path="/evenements/:id" element={<EvenementDetail />} />
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
