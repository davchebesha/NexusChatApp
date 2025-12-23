import React, { useState, useEffect } from 'react';
import { useBranding } from '../../contexts/BrandingContext';
import './Logo.css';

// Import the new logo
import logoImage from '../../assets/nexus-logo.png';

const Logo = ({ size = 'md', showText = true, className = '', animateOnHover = false }) => {
  const { appName } = useBranding();
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const sizeClasses = {
    sm: { container: 'logo-sm', width: 32, height: 32 },
    md: { container: 'logo-md', width: 48, height: 48 },
    lg: { container: 'logo-lg', width: 64, height: 64 },
    xl: { container: 'logo-xl', width: 80, height: 80 }
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  // Add animation class when hovered
  useEffect(() => {
    if (!animateOnHover) return;
    
    const timer = setTimeout(() => {
      setIsHovered(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [isHovered, animateOnHover]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div 
      className={`nexus-logo ${currentSize.container} ${className} ${isHovered ? 'logo-hover' : ''} ${isLoaded ? 'logo-loaded' : 'logo-loading'}`}
      onMouseEnter={() => animateOnHover && setIsHovered(true)}
      aria-label={appName}
    >
      <div className="logo-icon">
        <img
          src={logoImage}
          alt=""
          className="logo-img"
          width={currentSize.width}
          height={currentSize.height}
          onLoad={handleLoad}
          onError={(e) => {
            console.error('Failed to load logo image');
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/logo.svg';
          }}
          aria-hidden="true"
          loading="eager"
        />
      </div>
      {showText && (
        <div className="logo-text">
          <span className="logo-nexus">NEXUS</span>
          <span className="logo-chat">CHATAPP</span>
        </div>
      )}
      {/* Add subtle animation elements */}
      {animateOnHover && <div className="logo-pulse" aria-hidden="true"></div>}
    </div>
  );
};

export default Logo;