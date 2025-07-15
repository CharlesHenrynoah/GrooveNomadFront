import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPaperPlane, FaRobot, FaUser, FaArrowLeft } from 'react-icons/fa';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Salut ! Je suis GroovBot, votre assistant musical personnel ! 🎵 Comment puis-je vous aider aujourd'hui ?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Réponses prédéfinies du chatbot
  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('salut') || message.includes('bonjour') || message.includes('hello')) {
      return "Salut ! Comment allez-vous ? Je peux vous aider à découvrir de nouveaux événements musicaux ! 🎶";
    }
    
    if (message.includes('événement') || message.includes('concert') || message.includes('festival')) {
      return "Génial ! Je peux vous recommander des événements musicaux près de chez vous. Quel genre de musique préférez-vous ? Rock, Jazz, Électro, Pop ?";
    }
    
    if (message.includes('rock')) {
      return "Excellent choix ! 🤘 Le rock a tant à offrir. Je recommande le festival Rock en Seine qui aura lieu bientôt. Voulez-vous plus d'infos ?";
    }
    
    if (message.includes('jazz')) {
      return "Le jazz, quelle sophistication ! 🎺 Il y a un superbe festival de jazz à Montreux. La musique jazz crée une ambiance unique !";
    }
    
    if (message.includes('électro') || message.includes('electro')) {
      return "La musique électro, parfait pour danser ! 🎧 Je connais des clubs géniaux et des festivals techno. Plutôt house, techno ou dubstep ?";
    }
    
    if (message.includes('inscription') || message.includes('compte')) {
      return "Pour créer un compte, cliquez sur 'S'ABONNER' sur la page d'accueil ou 'SE CONNECTER' dans la navbar ! 📝";
    }
    
    if (message.includes('aide') || message.includes('help')) {
      return "Je suis là pour vous aider ! Je peux vous renseigner sur les événements musicaux, les inscriptions, et vous donner des recommandations. Que souhaitez-vous savoir ?";
    }
    
    if (message.includes('prix') || message.includes('tarif')) {
      return "Les prix varient selon l'événement ! La plupart des festivals proposent des pass journée (50-80€) ou des pass complets (150-300€). Voulez-vous des infos sur un événement spécifique ?";
    }
    
    if (message.includes('lieu') || message.includes('où')) {
      return "Nous couvrons de nombreuses villes ! Paris, Lyon, Marseille, Toulouse... Dites-moi votre ville et je vous trouverai les meilleurs événements près de chez vous ! 📍";
    }
    
    if (message.includes('merci')) {
      return "Avec plaisir ! N'hésitez pas si vous avez d'autres questions. Bon voyage musical ! 🎵✨";
    }
    
    // Réponse par défaut
    const defaultResponses = [
      "Intéressant ! Pouvez-vous me donner plus de détails ? 🤔",
      "Je vois ! Voulez-vous que je vous aide à trouver des événements musicaux ?",
      "C'est une bonne question ! Je peux vous recommander des concerts selon vos goûts musicaux.",
      "Hmm, je ne suis pas sûr de comprendre. Pouvez-vous reformuler ? Je suis spécialisé dans les événements musicaux ! 🎼"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Ajouter le message de l'utilisateur
    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simuler un délai de réponse du bot
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: getBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Délai entre 1-2 secondes
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const quickActions = [
    "Événements près de moi",
    "Genres musicaux",
    "Comment s'inscrire ?",
    "Tarifs des concerts"
  ];

  const handleQuickAction = (action) => {
    setInputValue(action);
  };

  return (
    <div className="chatbot-page">
      {/* Header */}
      <div className="chatbot-header">
        <Link to="/" className="back-btn">
          <FaArrowLeft /> Retour
        </Link>
        <div className="bot-info">
          <div className="bot-avatar">
            <img src="/teslabot.png" alt="GroovBot" className="bot-avatar-img" />
          </div>
          <div className="bot-details">
            <h1>GroovBot</h1>
            <span className="bot-status">En ligne</span>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="chat-container">
        <div className="messages-container">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.sender}`}>
              <div className="message-avatar">
                {message.sender === 'bot' ? <img src="/teslabot.png" alt="GroovBot" className="message-avatar-img" /> : <FaUser />}
              </div>
              <div className="message-content">
                <div className="message-bubble">
                  {message.text}
                </div>
                <div className="message-time">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message bot">
              <div className="message-avatar">
                <img src="/teslabot.png" alt="GroovBot" className="message-avatar-img" />
              </div>
              <div className="message-content">
                <div className="message-bubble typing">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Actions rapides */}
        <div className="quick-actions">
          {quickActions.map((action, index) => (
            <button 
              key={index}
              className="quick-action-btn"
              onClick={() => handleQuickAction(action)}
            >
              {action}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="message-form">
          <div className="input-container">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Tapez votre message..."
              className="message-input"
              disabled={isTyping}
            />
            <button 
              type="submit" 
              className="send-btn"
              disabled={!inputValue.trim() || isTyping}
            >
              <FaPaperPlane />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chatbot; 