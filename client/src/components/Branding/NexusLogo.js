/**
 * Nexus ChatApp Logo - Professional AI-Powered Design
 * Modern red-themed logo with distributed network elements
 */

import React from 'react';
import './NexusLogo.css';

// Main Logo Component
export const NexusLogo = ({ 
  size = 120, 
  variant = 'full', // 'full' | 'icon' | 'minimal'
  animated = true,
  className = '' 
}) => {
  const logoSize = size;
  const centerSize = size * 0.6;
  const nodeSize = size * 0.08;

  return (
    <div className={`nexus-logo ${variant} ${animated ? 'animated' : ''} ${className}`}>
      <svg 
        width={logoSize} 
        height={logoSize} 
        viewBox={`0 0 ${logoSize} ${logoSize}`}
        className="logo-svg"
      >
        {/* Gradient Definitions */}
        <defs>
          <radialGradient id="redGradient" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ff4757" />
            <stop offset="50%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </radialGradient>
          
          <linearGradient id="networkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ff4757" stopOpacity="0.4" />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/> 
            </feMerge>
          </filter>
        </defs>

        {/* Network Connections */}
        <g className="network-connections">
          {/* Main connection lines */}
          <line x1={logoSize * 0.2} y1={logoSize * 0.3} x2={logoSize * 0.8} y2={logoSize * 0.7} 
                stroke="url(#networkGradient)" strokeWidth="2" opacity="0.6" />
          <line x1={logoSize * 0.8} y1={logoSize * 0.3} x2={logoSize * 0.2} y2={logoSize * 0.7} 
                stroke="url(#networkGradient)" strokeWidth="2" opacity="0.6" />
          <line x1={logoSize * 0.5} y1={logoSize * 0.1} x2={logoSize * 0.5} y2={logoSize * 0.9} 
                stroke="url(#networkGradient)" strokeWidth="2" opacity="0.4" />
          <line x1={logoSize * 0.1} y1={logoSize * 0.5} x2={logoSize * 0.9} y2={logoSize * 0.5} 
                stroke="url(#networkGradient)" strokeWidth="2" opacity="0.4" />
          
          {/* Curved connections */}
          <path d={`M ${logoSize * 0.2} ${logoSize * 0.2} Q ${logoSize * 0.5} ${logoSize * 0.1} ${logoSize * 0.8} ${logoSize * 0.2}`}
                stroke="url(#networkGradient)" strokeWidth="1.5" fill="none" opacity="0.5" />
          <path d={`M ${logoSize * 0.2} ${logoSize * 0.8} Q ${logoSize * 0.5} ${logoSize * 0.9} ${logoSize * 0.8} ${logoSize * 0.8}`}
                stroke="url(#networkGradient)" strokeWidth="1.5" fill="none" opacity="0.5" />
        </g>

        {/* Network Nodes */}
        <g className="network-nodes">
          {/* Corner nodes */}
          <circle cx={logoSize * 0.15} cy={logoSize * 0.15} r={nodeSize} fill="#dc2626" opacity="0.8" />
          <circle cx={logoSize * 0.85} cy={logoSize * 0.15} r={nodeSize} fill="#dc2626" opacity="0.8" />
          <circle cx={logoSize * 0.15} cy={logoSize * 0.85} r={nodeSize} fill="#dc2626" opacity="0.8" />
          <circle cx={logoSize * 0.85} cy={logoSize * 0.85} r={nodeSize} fill="#dc2626" opacity="0.8" />
          
          {/* Side nodes */}
          <circle cx={logoSize * 0.5} cy={logoSize * 0.08} r={nodeSize * 0.8} fill="#ff4757" opacity="0.7" />
          <circle cx={logoSize * 0.5} cy={logoSize * 0.92} r={nodeSize * 0.8} fill="#ff4757" opacity="0.7" />
          <circle cx={logoSize * 0.08} cy={logoSize * 0.5} r={nodeSize * 0.8} fill="#ff4757" opacity="0.7" />
          <circle cx={logoSize * 0.92} cy={logoSize * 0.5} r={nodeSize * 0.8} fill="#ff4757" opacity="0.7" />
        </g>

        {/* Feature Icons (subtle) */}
        <g className="feature-icons" opacity="0.3">
          {/* Chat bubble */}
          <path d={`M ${logoSize * 0.2} ${logoSize * 0.25} 
                   Q ${logoSize * 0.15} ${logoSize * 0.2} ${logoSize * 0.2} ${logoSize * 0.15}
                   L ${logoSize * 0.3} ${logoSize * 0.15}
                   Q ${logoSize * 0.35} ${logoSize * 0.15} ${logoSize * 0.35} ${logoSize * 0.2}
                   L ${logoSize * 0.35} ${logoSize * 0.25}
                   Q ${logoSize * 0.35} ${logoSize * 0.3} ${logoSize * 0.3} ${logoSize * 0.3}
                   L ${logoSize * 0.25} ${logoSize * 0.3}
                   L ${logoSize * 0.2} ${logoSize * 0.35}
                   Z`}
                fill="#dc2626" />
          
          {/* Microphone */}
          <rect x={logoSize * 0.75} y={logoSize * 0.2} width={logoSize * 0.04} height={logoSize * 0.08} 
                rx={logoSize * 0.02} fill="#dc2626" />
          <rect x={logoSize * 0.74} y={logoSize * 0.29} width={logoSize * 0.06} height={logoSize * 0.02} 
                rx={logoSize * 0.01} fill="#dc2626" />
          
          {/* File icon */}
          <rect x={logoSize * 0.75} y={logoSize * 0.7} width={logoSize * 0.08} height={logoSize * 0.1} 
                fill="none" stroke="#dc2626" strokeWidth="1" />
          <line x1={logoSize * 0.77} y1={logoSize * 0.73} x2={logoSize * 0.81} y2={logoSize * 0.73} 
                stroke="#dc2626" strokeWidth="0.5" />
          <line x1={logoSize * 0.77} y1={logoSize * 0.76} x2={logoSize * 0.81} y2={logoSize * 0.76} 
                stroke="#dc2626" strokeWidth="0.5" />
          
          {/* Cloud */}
          <path d={`M ${logoSize * 0.18} ${logoSize * 0.75}
                   Q ${logoSize * 0.15} ${logoSize * 0.72} ${logoSize * 0.18} ${logoSize * 0.69}
                   Q ${logoSize * 0.22} ${logoSize * 0.67} ${logoSize * 0.26} ${logoSize * 0.69}
                   Q ${logoSize * 0.3} ${logoSize * 0.67} ${logoSize * 0.32} ${logoSize * 0.71}
                   Q ${logoSize * 0.34} ${logoSize * 0.73} ${logoSize * 0.32} ${logoSize * 0.75}
                   Z`}
                fill="#dc2626" />
        </g>

        {/* Central Circle */}
        <circle 
          cx={logoSize / 2} 
          cy={logoSize / 2} 
          r={centerSize / 2} 
          fill="url(#redGradient)"
          filter="url(#glow)"
          className="central-circle"
        />

        {/* Inner Circle Border */}
        <circle 
          cx={logoSize / 2} 
          cy={logoSize / 2} 
          r={centerSize / 2 - 2} 
          fill="none"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="1"
          className="inner-border"
        />

        {/* Central N Letter */}
        <text 
          x={logoSize / 2} 
          y={logoSize / 2 + centerSize * 0.15} 
          textAnchor="middle" 
          fontSize={centerSize * 0.5}
          fontFamily="'Inter', 'Segoe UI', sans-serif"
          fontWeight="700"
          fill="white"
          className="central-letter"
        >
          N
        </text>

        {/* AI Pulse Ring */}
        <circle 
          cx={logoSize / 2} 
          cy={logoSize / 2} 
          r={centerSize / 2 + 8} 
          fill="none"
          stroke="#ff4757"
          strokeWidth="2"
          opacity="0.6"
          className="pulse-ring"
        />
      </svg>
    </div>
  );
};

// Icon-only version
export const NexusIcon = ({ size = 64, animated = true, className = '' }) => {
  return (
    <NexusLogo 
      size={size} 
      variant="icon" 
      animated={animated} 
      className={className}
    />
  );
};

// Minimal version
export const NexusMinimal = ({ size = 48, className = '' }) => {
  const logoSize = size;
  const centerSize = size * 0.8;

  return (
    <div className={`nexus-logo minimal ${className}`}>
      <svg width={logoSize} height={logoSize} viewBox={`0 0 ${logoSize} ${logoSize}`}>
        <defs>
          <radialGradient id="minimalGradient" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ff4757" />
            <stop offset="100%" stopColor="#dc2626" />
          </radialGradient>
        </defs>
        
        <circle 
          cx={logoSize / 2} 
          cy={logoSize / 2} 
          r={centerSize / 2} 
          fill="url(#minimalGradient)"
        />
        
        <text 
          x={logoSize / 2} 
          y={logoSize / 2 + centerSize * 0.12} 
          textAnchor="middle" 
          fontSize={centerSize * 0.45}
          fontFamily="'Inter', 'Segoe UI', sans-serif"
          fontWeight="700"
          fill="white"
        >
          N
        </text>
      </svg>
    </div>
  );
};

// App Icon version (square with rounded corners)
export const NexusAppIcon = ({ size = 64, className = '' }) => {
  const iconSize = size;
  const centerSize = size * 0.6;
  const cornerRadius = size * 0.15;

  return (
    <div className={`nexus-logo app-icon ${className}`}>
      <svg width={iconSize} height={iconSize} viewBox={`0 0 ${iconSize} ${iconSize}`}>
        <defs>
          <radialGradient id="appGradient" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ff4757" />
            <stop offset="50%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </radialGradient>
        </defs>
        
        {/* Rounded square background */}
        <rect 
          x="0" y="0" 
          width={iconSize} 
          height={iconSize} 
          rx={cornerRadius} 
          fill="url(#appGradient)"
        />
        
        {/* Minimal network lines */}
        <line x1={iconSize * 0.2} y1={iconSize * 0.2} x2={iconSize * 0.8} y2={iconSize * 0.8} 
              stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <line x1={iconSize * 0.8} y1={iconSize * 0.2} x2={iconSize * 0.2} y2={iconSize * 0.8} 
              stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        
        {/* Central N */}
        <text 
          x={iconSize / 2} 
          y={iconSize / 2 + centerSize * 0.15} 
          textAnchor="middle" 
          fontSize={centerSize * 0.6}
          fontFamily="'Inter', 'Segoe UI', sans-serif"
          fontWeight="700"
          fill="white"
        >
          N
        </text>
      </svg>
    </div>
  );
};

export default NexusLogo;