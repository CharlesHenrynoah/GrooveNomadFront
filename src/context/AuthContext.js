import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Configuration axios
const API_URL = 'http://localhost:5000/api';

axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté au chargement
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      // Restaurer le token dans les headers axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }
    setIsLoading(false);
  }, []);

  const login = async (email, motDePasse) => {
    try {
      const response = await axios.post('/connexion', { email, motDePasse });
      
      const userData = response.data.user;
      const token = response.data.token;
      
      console.log('Login response - userData:', userData);
      console.log('Login response - token:', token);
      
      // Stocker le token dans les headers axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
      
      console.log('Token stored in localStorage:', localStorage.getItem('token'));
      
      return { success: true, user: userData };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erreur de connexion';
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/inscription', {
        nom: userData.nom,
        prenom: userData.prenom,
        email: userData.email,
        motDePasse: userData.motDePasse
      });
      
      const newUser = response.data.user;
      const token = response.data.token;
      
      // Stocker le token dans les headers axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('token', token);
      
      return { success: true, user: newUser };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erreur d\'inscription';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Retirer le token des headers axios
    delete axios.defaults.headers.common['Authorization'];
  };

  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('refreshUserData - token:', token);
      
      if (!token) {
        console.log('No token found in localStorage');
        return;
      }
      
      const response = await axios.get('/utilisateur', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des données utilisateur:', error);
      // Si le token est invalide, déconnecter l'utilisateur
      logout();
    }
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    refreshUserData,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 