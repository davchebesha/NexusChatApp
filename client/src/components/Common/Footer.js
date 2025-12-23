import React from 'react';
import { Link } from 'react-router-dom';
import { FiLinkedin, FiYoutube, FiTwitter, FiMail, FiGithub } from 'react-icons/fi';
import { useBranding } from '../../contexts/BrandingContext';
import Logo from './Logo';
import './Footer.css';

const Footer = ({ variant = 'default' }) => {
  const { 
    appName, 
    companyName, 
    supportEmail, 
    website, 
    socialMedia 
  } = useBranding();

  const currentYear = new Date().getFullYear();

  // Different footer variants for different pages
  const isMinimal = variant === 'minimal';
  const isLanding = variant === 'landing';

  if (isMinimal) {
    return (
      <footer className="nexus-footer nexus-footer-minimal">
        <div className="footer-container">
          <div className="footer-minimal-content">
            <div className="footer-brand">
              <Logo size="sm" showText={true} />
            </div>
            <div className="footer-copyright">
              <p>&copy; {currentYear} {companyName}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={`nexus-footer ${isLanding ? 'nexus-footer-landing' : 'nexus-footer-default'}`}>
      {isLanding && (
        <div className="footer-curve">
          <svg viewBox="0 0 1200 200" preserveAspectRatio="none">
            <path d="M0,200 C300,50 600,50 1200,200 L1200,200 L0,200 Z" fill="currentColor"></path>
          </svg>
        </div>
      )}
      
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section footer-brand-section">
            <Logo size="md" showText={true} />
            <p className="footer-description">
              Professional messaging platform with real-time communication, 
              crystal-clear calls, and seamless collaboration.
            </p>
            <div className="footer-social">
              <h4>Connect with us</h4>
              <div className="social-icons">
                <a 
                  href={socialMedia?.linkedin || "#"} 
                  className="social-link linkedin" 
                  aria-label="LinkedIn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FiLinkedin />
                </a>
                <a 
                  href={socialMedia?.twitter || "#"} 
                  className="social-link twitter" 
                  aria-label="Twitter"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FiTwitter />
                </a>
                <a 
                  href={socialMedia?.github || "#"} 
                  className="social-link github" 
                  aria-label="GitHub"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FiGithub />
                </a>
                <a 
                  href="#" 
                  className="social-link youtube" 
                  aria-label="YouTube"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FiYoutube />
                </a>
              </div>
            </div>
          </div>
          
          <div className="footer-section">
            <h4>Product</h4>
            <ul>
              <li><Link to="/features">Features</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
              <li><Link to="/security">Security</Link></li>
              <li><Link to="/integrations">Integrations</Link></li>
              <li><Link to="/api">API</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/press">Press</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/cookies">Cookie Policy</Link></li>
              <li><Link to="/gdpr">GDPR</Link></li>
              <li><Link to="/compliance">Compliance</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/documentation">Documentation</Link></li>
              <li><Link to="/status">System Status</Link></li>
              <li>
                <a href={`mailto:${supportEmail}`}>
                  <FiMail style={{ marginRight: '0.5rem' }} />
                  Contact Support
                </a>
              </li>
            </ul>
            
            <div className="footer-language">
              <label htmlFor="language-select">Language:</label>
              <select id="language-select" className="language-select">
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>&copy; {currentYear} {companyName}. All rights reserved.</p>
          </div>
          <div className="footer-links">
            <Link to="/sitemap">Sitemap</Link>
            <span className="separator">•</span>
            <Link to="/accessibility">Accessibility</Link>
            <span className="separator">•</span>
            <a href={website} target="_blank" rel="noopener noreferrer">
              {website?.replace('https://', '')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;