import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Inscription.css';

const Inscription = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    confirmerMotDePasse: '',
    dateNaissance: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value
    };
    
    setFormData(newFormData);
    
    // Validation en temps réel des mots de passe
    if (name === 'motDePasse') {
      // Vérifier la force du mot de passe
      if (value.length === 0) {
        setPasswordStrength('');
      } else if (value.length < 6) {
        setPasswordStrength('Trop court (minimum 6 caractères)');
      } else if (value.length < 8) {
        setPasswordStrength('Faible');
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        setPasswordStrength('Moyen (ajoutez majuscules, minuscules et chiffres)');
      } else {
        setPasswordStrength('Fort');
      }
      
      // Vérifier la correspondance avec la confirmation
      if (newFormData.confirmerMotDePasse) {
        setPasswordMatch(value === newFormData.confirmerMotDePasse);
      }
    }
    
    if (name === 'confirmerMotDePasse') {
      // Vérifier la correspondance
      if (value && newFormData.motDePasse) {
        setPasswordMatch(value === newFormData.motDePasse);
      } else {
        setPasswordMatch(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validations
    if (!formData.nom.trim()) {
      setError('Le nom est requis');
      return;
    }
    
    if (!formData.prenom.trim()) {
      setError('Le prénom est requis');
      return;
    }
    
    if (!formData.email.trim()) {
      setError('L\'email est requis');
      return;
    }
    
    if (formData.motDePasse.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    // Vérifier que les mots de passe correspondent
    if (formData.motDePasse !== formData.confirmerMotDePasse) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await register(formData);
      if (result.success) {
        navigate('/'); // Rediriger vers l'accueil
      } else {
        setError(result.error || 'Erreur d\'inscription');
      }
    } catch (err) {
      setError('Erreur d\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="inscription-page"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/Rufus-Du-Sol-Derek-Rickert-San-Diego-10-31-18-95.jpg)`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="inscription-container">
        <div className="back-to-home">
          <Link to="/" className="back-link">
            ← Retour à l'accueil
          </Link>
        </div>
        <div className="inscription-header">
          <div className="logo-gn">GN</div>
          <h1 className="inscription-title">Création de compte</h1>
          <p className="inscription-subtitle">
            Rejoignez la communauté GrooveNomad
          </p>
        </div>

        <form className="inscription-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nom" className="form-label">
                Nom
              </label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className="form-input"
                placeholder="Votre nom"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="prenom" className="form-label">
                Prénom
              </label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                className="form-input"
                placeholder="Votre prénom"
                required
              />
            </div>
          </div>

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

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="motDePasse" className="form-label">
                Mot de passe
              </label>
              <input
                type="password"
                id="motDePasse"
                name="motDePasse"
                value={formData.motDePasse}
                onChange={handleChange}
                className="form-input"
                placeholder="••••••••"
                required
              />
              {passwordStrength && (
                <div className={`password-strength ${passwordStrength.includes('Fort') ? 'strong' : passwordStrength.includes('Moyen') ? 'medium' : 'weak'}`}>
                  {passwordStrength}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmerMotDePasse" className="form-label">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                id="confirmerMotDePasse"
                name="confirmerMotDePasse"
                value={formData.confirmerMotDePasse}
                onChange={handleChange}
                className={`form-input ${passwordMatch === true ? 'password-match' : passwordMatch === false ? 'password-no-match' : ''}`}
                placeholder="••••••••"
                required
              />
              {passwordMatch !== null && (
                <div className={`password-match-indicator ${passwordMatch ? 'match' : 'no-match'}`}>
                  {passwordMatch ? '✓ Les mots de passe correspondent' : '✗ Les mots de passe ne correspondent pas'}
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="inscription-btn" disabled={isLoading}>
            {isLoading ? 'Création en cours...' : 'Créer un compte'}
          </button>
        </form>

        <div className="inscription-footer">
          <p>
            Vous avez déjà un compte ?{' '}
            <Link to="/connexion" className="connexion-link">
              Se connecter
            </Link>
          </p>
        </div>

        <div className="social-inscription">
          <div className="divider">
            <span>ou</span>
          </div>
          <div className="social-buttons">
            <button className="social-btn facebook-btn">
              <FaFacebook className="social-icon" />
              Facebook
            </button>
            <button className="social-btn google-btn">
              <FaGoogle className="social-icon" />
              Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inscription; 