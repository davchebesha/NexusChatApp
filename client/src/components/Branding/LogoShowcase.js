/**
 * Logo Showcase - Display all Nexus logo variations
 */

import React, { useState } from 'react';
import { 
  NexusLogo, 
  NexusIcon, 
  NexusMinimal, 
  NexusAppIcon 
} from './NexusLogo';
import './LogoShowcase.css';

const LogoShowcase = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [animated, setAnimated] = useState(true);

  return (
    <div className={`logo-showcase ${darkMode ? 'dark' : 'light'}`}>
      <div className="showcase-header">
        <h1>🎯 NEXUS CHATAPP LOGO DESIGNS</h1>
        <p>Professional AI-Powered Logo Collection</p>
        
        <div className="controls">
          <label className="control">
            <input 
              type="checkbox" 
              checked={animated} 
              onChange={(e) => setAnimated(e.target.checked)}
            />
            <span>Animations</span>
          </label>
          <label className="control">
            <input 
              type="checkbox" 
              checked={darkMode} 
              onChange={(e) => setDarkMode(e.target.checked)}
            />
            <span>Dark Mode</span>
          </label>
        </div>
      </div>

      <div className="logo-grid">
        {/* Main Logo - Full Version */}
        <div className="logo-card featured">
          <div className="logo-display">
            <NexusLogo size={200} animated={animated} />
          </div>
          <div className="logo-info">
            <h3>🏆 Main Logo (Full Version)</h3>
            <p>Complete logo with network connections, feature icons, and AI elements</p>
            <div className="specs">
              <span>✅ Central red gradient circle</span>
              <span>✅ Bold futuristic "N"</span>
              <span>✅ Distributed network nodes</span>
              <span>✅ Feature icons (chat, mic, file, cloud)</span>
              <span>✅ AI pulse ring</span>
              <span>✅ Professional animations</span>
            </div>
          </div>
        </div>

        {/* Icon Version */}
        <div className="logo-card">
          <div className="logo-display">
            <NexusIcon size={120} animated={animated} />
          </div>
          <div className="logo-info">
            <h3>🎯 Icon Version</h3>
            <p>Simplified version for smaller spaces</p>
            <div className="specs">
              <span>Perfect for: Toolbars, buttons, small UI elements</span>
            </div>
          </div>
        </div>

        {/* Minimal Version */}
        <div className="logo-card">
          <div className="logo-display">
            <NexusMinimal size={80} />
          </div>
          <div className="logo-info">
            <h3>⚡ Minimal Version</h3>
            <p>Ultra-clean for tight spaces</p>
            <div className="specs">
              <span>Perfect for: Loading screens, favicons</span>
            </div>
          </div>
        </div>

        {/* App Icon Version */}
        <div className="logo-card">
          <div className="logo-display">
            <NexusAppIcon size={100} />
          </div>
          <div className="logo-info">
            <h3>📱 App Icon</h3>
            <p>Square format with rounded corners</p>
            <div className="specs">
              <span>Perfect for: Desktop app icon, mobile app</span>
            </div>
          </div>
        </div>

        {/* Size Variations */}
        <div className="logo-card sizes">
          <div className="logo-display">
            <div className="size-row">
              <NexusLogo size={60} animated={animated} />
              <NexusLogo size={80} animated={animated} />
              <NexusLogo size={120} animated={animated} />
              <NexusLogo size={160} animated={animated} />
            </div>
          </div>
          <div className="logo-info">
            <h3>📏 Size Variations</h3>
            <p>Scalable from 32px to 512px+</p>
            <div className="specs">
              <span>Small (60px) • Medium (80px) • Large (120px) • XL (160px)</span>
            </div>
          </div>
        </div>

        {/* Color Variations */}
        <div className="logo-card colors">
          <div className="logo-display">
            <div className="color-row">
              <div className="color-demo" style={{background: '#ffffff', padding: '20px', borderRadius: '8px'}}>
                <NexusLogo size={80} animated={animated} />
              </div>
              <div className="color-demo" style={{background: '#f8f9fa', padding: '20px', borderRadius: '8px'}}>
                <NexusLogo size={80} animated={animated} />
              </div>
              <div className="color-demo" style={{background: '#1a1a1a', padding: '20px', borderRadius: '8px'}}>
                <NexusLogo size={80} animated={animated} />
              </div>
              <div className="color-demo" style={{background: 'linear-gradient(135deg, #667eea, #764ba2)', padding: '20px', borderRadius: '8px'}}>
                <NexusLogo size={80} animated={animated} />
              </div>
            </div>
          </div>
          <div className="logo-info">
            <h3>🎨 Background Compatibility</h3>
            <p>Works on any background</p>
            <div className="specs">
              <span>White • Light Gray • Dark • Gradient</span>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Specifications */}
      <div className="tech-specs">
        <h2>🔧 Technical Specifications</h2>
        <div className="specs-grid">
          <div className="spec-card">
            <h4>🎨 Design Elements</h4>
            <ul>
              <li>Central red gradient circle (#ff4757 → #dc2626 → #991b1b)</li>
              <li>Bold futuristic "N" in white</li>
              <li>Distributed network connections</li>
              <li>8 network nodes with staggered animations</li>
              <li>Subtle feature icons (chat, mic, file, cloud)</li>
              <li>AI pulse ring with breathing effect</li>
            </ul>
          </div>
          
          <div className="spec-card">
            <h4>⚙️ Technical Features</h4>
            <ul>
              <li>SVG format - infinitely scalable</li>
              <li>CSS animations with reduced motion support</li>
              <li>Dark mode compatible</li>
              <li>Responsive design</li>
              <li>React component with props</li>
              <li>Optimized for performance</li>
            </ul>
          </div>
          
          <div className="spec-card">
            <h4>📐 Usage Guidelines</h4>
            <ul>
              <li>Minimum size: 32px</li>
              <li>Recommended: 64px - 200px</li>
              <li>Clear space: 25% of logo width</li>
              <li>High contrast backgrounds preferred</li>
              <li>Maintain aspect ratio</li>
              <li>Use animated version sparingly</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Implementation Code */}
      <div className="implementation">
        <h2>💻 Implementation</h2>
        <div className="code-block">
          <pre>{`// Import the logo components
import { NexusLogo, NexusIcon, NexusAppIcon } from './components/Branding/NexusLogo';

// Use in your app
<NexusLogo size={120} animated={true} />
<NexusIcon size={64} />
<NexusAppIcon size={48} />`}</pre>
        </div>
      </div>
    </div>
  );
};

export default LogoShowcase;