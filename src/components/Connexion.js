import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Connexion.css';

// Import de l'image de background
const backgroundImage = `${process.env.PUBLIC_URL}/RUFUS+DU+SOL_Red+Rocks_20221016_FM_128.jpg`;

const Connexion = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Charger les identifiants sauvegardés au chargement du composant
  useEffect(() => {
    const savedCredentials = localStorage.getItem('grooveNomadRememberMe');
    if (savedCredentials) {
      const { email, password } = JSON.parse(savedCredentials);
      setFormData({ email, password });
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        // Sauvegarder les identifiants si "Se souvenir de moi" est coché
        if (rememberMe) {
          localStorage.setItem('grooveNomadRememberMe', JSON.stringify({
            email: formData.email,
            password: formData.password
          }));
        } else {
          // Supprimer les identifiants sauvegardés si l'option n'est pas cochée
          localStorage.removeItem('grooveNomadRememberMe');
        }
        
        navigate('/'); // Rediriger vers l'accueil
      } else {
        setError(result.error || 'Erreur de connexion');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="connexion-page"
      style={{
        backgroundImage: `url(${backgroundImage}), linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="connexion-container">
        <div className="back-to-home">
          <Link to="/" className="back-link">
            ← Retour à l'accueil
          </Link>
        </div>
        <div className="connexion-header">
          <div className="logo-gn">GN</div>
          <h1 className="connexion-title">Connexion</h1>
          <p className="connexion-subtitle">
            Connectez-vous à votre compte GrooveNomad
          </p>
        </div>

        <form className="connexion-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Adresse email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="votre@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-options">
            <div className="remember-me">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                className="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember" className="checkbox-label">
                Se souvenir de moi
              </label>
            </div>
            <a href="/mot-de-passe-oublie" className="forgot-password">
              Mot de passe oublié ?
            </a>
          </div>

          <button type="submit" className="connexion-btn" disabled={isLoading}>
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <div className="connexion-footer">
          <p>
            Vous n'avez pas de compte ?{' '}
            <Link to="/inscription" className="inscription-link">
              S'inscrire
            </Link>
          </p>
        </div>

        <div className="social-connexion">
          <div className="divider">
            <span>ou</span>
          </div>
          <div className="social-buttons">
            <button className="social-btn google-btn">
              <FaGoogle className="social-icon" />
              Continuer avec Google
            </button>
            <button className="social-btn facebook-btn">
              <FaFacebook className="social-icon" />
              Continuer avec Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connexion; 