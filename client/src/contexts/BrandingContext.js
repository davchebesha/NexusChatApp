import React, { createContext, useContext, useState, useEffect } from 'react';

const BrandingContext = createContext();

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
};

const defaultBrandingConfig = {
  appName: 'Nexus ChatApp',
  tagline: 'Professional messaging platform with real-time communication',
  logo: '/logo.svg',
  favicon: '/favicon.ico',
  primaryColor: '#b71c1c',
  secondaryColor: '#8b0000',
  accentColor: '#e53935',
  backgroundColor: '#ffffff',
  textColor: '#2d3748',
  borderColor: '#e2e8f0',
  successColor: '#10b981',
  warningColor: '#f59e0b',
  errorColor: '#ef4444',
  infoColor: '#3b82f6',
  
  // Typography
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  headingFontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  
  // Layout
  borderRadius: '8px',
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  
  // Company Information
  companyName: 'Nexus Technologies',
  supportEmail: 'support@nexuschatapp.com',
  website: 'https://nexuschatapp.com',
  
  // Social Media
  socialMedia: {
    twitter: 'https://twitter.com/nexuschatapp',
    linkedin: 'https://linkedin.com/company/nexuschatapp',
    github: 'https://github.com/nexuschatapp'
  }
};

export const BrandingProvider = ({ children }) => {
  const [brandingConfig, setBrandingConfig] = useState(defaultBrandingConfig);

  // Apply CSS custom properties for theming
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply color variables
    root.style.setProperty('--nexus-primary-color', brandingConfig.primaryColor);
    root.style.setProperty('--nexus-secondary-color', brandingConfig.secondaryColor);
    root.style.setProperty('--nexus-accent-color', brandingConfig.accentColor);
    root.style.setProperty('--nexus-background-color', brandingConfig.backgroundColor);
    root.style.setProperty('--nexus-text-color', brandingConfig.textColor);
    root.style.setProperty('--nexus-border-color', brandingConfig.borderColor);
    root.style.setProperty('--nexus-success-color', brandingConfig.successColor);
    root.style.setProperty('--nexus-warning-color', brandingConfig.warningColor);
    root.style.setProperty('--nexus-error-color', brandingConfig.errorColor);
    root.style.setProperty('--nexus-info-color', brandingConfig.infoColor);
    
    // Apply typography variables
    root.style.setProperty('--nexus-font-family', brandingConfig.fontFamily);
    root.style.setProperty('--nexus-heading-font-family', brandingConfig.headingFontFamily);
    
    // Apply layout variables
    root.style.setProperty('--nexus-border-radius', brandingConfig.borderRadius);
    root.style.setProperty('--nexus-shadow-color', brandingConfig.shadowColor);
    
    // Update document title and meta tags
    document.title = brandingConfig.appName;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', brandingConfig.tagline);
    }
    
    // Update theme color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', brandingConfig.primaryColor);
    }
    
  }, [brandingConfig]);

  const updateBranding = (newConfig) => {
    setBrandingConfig(prevConfig => ({
      ...prevConfig,
      ...newConfig
    }));
  };

  const getBrandingCSS = () => {
    return {
      '--nexus-primary-color': brandingConfig.primaryColor,
      '--nexus-secondary-color': brandingConfig.secondaryColor,
      '--nexus-accent-color': brandingConfig.accentColor,
      '--nexus-background-color': brandingConfig.backgroundColor,
      '--nexus-text-color': brandingConfig.textColor,
      '--nexus-border-color': brandingConfig.borderColor,
      '--nexus-success-color': brandingConfig.successColor,
      '--nexus-warning-color': brandingConfig.warningColor,
      '--nexus-error-color': brandingConfig.errorColor,
      '--nexus-info-color': brandingConfig.infoColor,
      '--nexus-font-family': brandingConfig.fontFamily,
      '--nexus-heading-font-family': brandingConfig.headingFontFamily,
      '--nexus-border-radius': brandingConfig.borderRadius,
      '--nexus-shadow-color': brandingConfig.shadowColor
    };
  };

  const contextValue = {
    ...brandingConfig,
    updateBranding,
    getBrandingCSS
  };

  return (
    <BrandingContext.Provider value={contextValue}>
      {children}
    </BrandingContext.Provider>
  );
};

export default BrandingProvider;