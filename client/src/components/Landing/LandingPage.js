import React from 'react';
import { Link } from 'react-router-dom';
import { FiMessageSquare, FiVideo, FiUsers, FiShield, FiZap, FiGlobe, FiLinkedin, FiYoutube, FiTwitter, FiMail, FiArrowRight, FiCheck } from 'react-icons/fi';
import { useBranding } from '../../contexts/BrandingContext';
import Logo from '../Common/Logo';
import './Landing.css';

const LandingPage = () => {
  const { appName, tagline, supportEmail } = useBranding();
  
  const features = [
    {
      icon: <FiMessageSquare />,
      title: "Real-time Messaging",
      description: "Instant messaging with typing indicators and read receipts"
    },
    {
      icon: <FiVideo />,
      title: "Video & Voice Calls",
      description: "High-quality video and voice calls with screen sharing"
    },
    {
      icon: <FiUsers />,
      title: "Group Chats",
      description: "Create groups and channels for team collaboration"
    },
    {
      icon: <FiShield />,
      title: "Secure & Private",
      description: "End-to-end encryption and advanced security features"
    },
    {
      icon: <FiZap />,
      title: "Lightning Fast",
      description: "Optimized for speed with real-time synchronization"
    },
    {
      icon: <FiGlobe />,
      title: "Cross-Platform",
      description: "Works seamlessly across all your devices"
    }
  ];

  const benefits = [
    "Unlimited messages and file sharing",
    "HD video and voice calls",
    "End-to-end encryption",
    "Cross-platform synchronization",
    "24/7 customer support",
    "No ads, ever"
  ];

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <nav className="navbar">
          <div className="nav-brand">
            <Logo size="md" showText={true} />
          </div>
          <div className="nav-links">
            <Link to="/login" className="btn btn-outline">Login</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Connect, Communicate, Collaborate</h1>
          <p>
            Experience the future of messaging with {appName}. 
            Real-time communication, crystal-clear calls, and seamless collaboration 
            all in one professional platform.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary btn-large">
              Start Chatting Now
              <FiArrowRight style={{ marginLeft: '0.5rem' }} />
            </Link>
            <Link to="/login" className="btn btn-outline btn-large">
              Sign In
            </Link>
          </div>
          
          {/* Benefits List */}
          <div className="hero-benefits">
            <div className="benefits-grid">
              {benefits.map((benefit, index) => (
                <div key={index} className="benefit-item">
                  <FiCheck className="benefit-check" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="hero-image">
          <div className="chat-preview">
            <div className="chat-header">
              <div className="chat-header-info">
                <div className="chat-avatar"></div>
                <div className="chat-details">
                  <span className="chat-name">Team Project</span>
                  <span className="chat-status">3 members online</span>
                </div>
              </div>
            </div>
            <div className="chat-messages">
              <div className="chat-bubble left">
                <p>Hey! How's the new project going?</p>
                <span className="message-time">2:30 PM</span>
              </div>
              <div className="chat-bubble right">
                <p>Great! The team is really productive with {appName} 🚀</p>
                <span className="message-time">2:31 PM</span>
              </div>
              <div className="chat-bubble left">
                <p>Awesome! Let's schedule a video call to discuss details.</p>
                <span className="message-time">2:32 PM</span>
              </div>
            </div>
            <div className="chat-input">
              <div className="typing-indicator">
                <span>Alex is typing...</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>Why Choose {appName}?</h2>
          <p className="features-subtitle">
            Everything you need for professional team communication in one powerful platform
          </p>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Transform Your Communication?</h2>
          <p>Join thousands of teams already using {appName}</p>
          <Link to="/register" className="btn btn-primary btn-large">
            Get Started Free
            <FiArrowRight style={{ marginLeft: '0.5rem' }} />
          </Link>
          <p className="cta-note">No credit card required • Free forever plan available</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-curve">
          <svg viewBox="0 0 1200 200" preserveAspectRatio="none">
            <path d="M0,200 C300,50 600,50 1200,200 L1200,200 L0,200 Z" fill="currentColor"></path>
          </svg>
        </div>
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Join us at</h4>
              <div className="social-icons">
                <a href="#" className="social-link linkedin" aria-label="LinkedIn">
                  <FiLinkedin />
                </a>
                <a href="#" className="social-link youtube" aria-label="YouTube">
                  <FiYoutube />
                </a>
                <a href="#" className="social-link twitter" aria-label="Twitter">
                  <FiTwitter />
                </a>
              </div>
            </div>
            
            <div className="footer-section">
              <h4>Legal Notice</h4>
              <ul>
                <li><a href="#privacy">Privacy statement</a></li>
                <li><a href="#terms">Terms and Conditions</a></li>
                <li><a href="#cookies">Cookies</a></li>
                <li><a href="#group">Group</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Want to talk?</h4>
              <div className="contact-info">
                <a href={`mailto:${supportEmail}`} className="contact-link">
                  <FiMail />
                  Contact us
                </a>
              </div>
              <div className="language-selector">
                <select className="language-select">
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;