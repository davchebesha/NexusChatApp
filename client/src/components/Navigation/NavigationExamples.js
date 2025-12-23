/**
 * NavigationExamples - Demonstration of Linear Navigation System
 * Shows various use cases and implementations
 */

import React, { useState } from 'react';
import { 
  FiUser, 
  FiMail, 
  FiLock, 
  FiSettings, 
  FiCheck,
  FiMessageSquare,
  FiUsers,
  FiShield
} from 'react-icons/fi';
import LinearNavigation from './LinearNavigation';
import NavigationWizard from './NavigationWizard';
import { createStep, createValidator, validationPatterns } from './navigationUtils';
import './NavigationExamples.css';

// Example Step Components
const PersonalInfoStep = ({ stepData, onUpdateData, onComplete }) => {
  const [formData, setFormData] = useState(stepData || {
    firstName: '',
    lastName: '',
    email: ''
  });

  const [errors, setErrors] = useState({});

  const validator = createValidator({
    firstName: { required: true, minLength: 2 },
    lastName: { required: true, minLength: 2 },
    email: { required: true, pattern: validationPatterns.email }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validator(formData);
    
    if (validation.isValid) {
      onUpdateData(formData);
      onComplete(formData);
    } else {
      setErrors(validation.errors);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    onUpdateData({ ...formData, [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <div className="step-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className={errors.firstName ? 'error' : ''}
            placeholder="Enter your first name"
          />
          {errors.firstName && <span className="error-text">{errors.firstName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className={errors.lastName ? 'error' : ''}
            placeholder="Enter your last name"
          />
          {errors.lastName && <span className="error-text">{errors.lastName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={errors.email ? 'error' : ''}
            placeholder="Enter your email address"
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <button type="submit" className="btn btn-primary">
          Continue
        </button>
      </form>
    </div>
  );
};

const AccountSetupStep = ({ stepData, onUpdateData, onComplete }) => {
  const [formData, setFormData] = useState(stepData || {
    username: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  const validator = createValidator({
    username: { 
      required: true, 
      minLength: 3, 
      pattern: validationPatterns.username,
      message: 'Username must be 3-20 characters, letters, numbers, underscore, or dash only'
    },
    password: { 
      required: true, 
      pattern: validationPatterns.strongPassword,
      message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
    },
    confirmPassword: { 
      required: true,
      custom: (value, data) => value === data.password,
      message: 'Passwords do not match'
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validator(formData);
    
    if (validation.isValid) {
      onUpdateData(formData);
      onComplete(formData);
    } else {
      setErrors(validation.errors);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    onUpdateData({ ...formData, [field]: value });
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <div className="step-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={formData.username}
            onChange={(e) => handleChange('username', e.target.value)}
            className={errors.username ? 'error' : ''}
            placeholder="Choose a username"
          />
          {errors.username && <span className="error-text">{errors.username}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            className={errors.password ? 'error' : ''}
            placeholder="Create a strong password"
          />
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            className={errors.confirmPassword ? 'error' : ''}
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
        </div>

        <button type="submit" className="btn btn-primary">
          Continue
        </button>
      </form>
    </div>
  );
};

const PreferencesStep = ({ stepData, onUpdateData, onComplete }) => {
  const [formData, setFormData] = useState(stepData || {
    notifications: true,
    newsletter: false,
    theme: 'light'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateData(formData);
    onComplete(formData);
  };

  const handleChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdateData(newData);
  };

  return (
    <div className="step-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.notifications}
              onChange={(e) => handleChange('notifications', e.target.checked)}
            />
            <span>Enable notifications</span>
          </label>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.newsletter}
              onChange={(e) => handleChange('newsletter', e.target.checked)}
            />
            <span>Subscribe to newsletter</span>
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="theme">Theme Preference</label>
          <select
            id="theme"
            value={formData.theme}
            onChange={(e) => handleChange('theme', e.target.value)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary">
          Complete Setup
        </button>
      </form>
    </div>
  );
};

const NavigationExamples = () => {
  const [activeExample, setActiveExample] = useState('wizard');

  // Wizard Example Steps
  const wizardSteps = [
    createStep({
      id: 'personal-info',
      title: 'Personal Information',
      description: 'Tell us about yourself',
      component: PersonalInfoStep,
      icon: FiUser,
      validation: createValidator({
        firstName: { required: true, minLength: 2 },
        lastName: { required: true, minLength: 2 },
        email: { required: true, pattern: validationPatterns.email }
      })
    }),
    createStep({
      id: 'account-setup',
      title: 'Account Setup',
      description: 'Create your account credentials',
      component: AccountSetupStep,
      icon: FiLock,
      validation: createValidator({
        username: { required: true, minLength: 3 },
        password: { required: true, pattern: validationPatterns.strongPassword }
      })
    }),
    createStep({
      id: 'preferences',
      title: 'Preferences',
      description: 'Customize your experience',
      component: PreferencesStep,
      icon: FiSettings,
      isOptional: true
    })
  ];

  // Linear Navigation Example Steps
  const linearSteps = [
    {
      id: 'welcome',
      title: 'Welcome',
      subtitle: 'Getting Started',
      icon: FiMessageSquare,
      component: () => (
        <div className="step-content">
          <h3>Welcome to Nexus ChatApp</h3>
          <p>Let's get you set up with our professional chat platform.</p>
        </div>
      )
    },
    {
      id: 'features',
      title: 'Features',
      subtitle: 'What you can do',
      icon: FiUsers,
      component: () => (
        <div className="step-content">
          <h3>Powerful Features</h3>
          <ul>
            <li>Real-time messaging</li>
            <li>File sharing</li>
            <li>Voice & video calls</li>
            <li>Group conversations</li>
          </ul>
        </div>
      )
    },
    {
      id: 'security',
      title: 'Security',
      subtitle: 'Your privacy matters',
      icon: FiShield,
      component: () => (
        <div className="step-content">
          <h3>Enterprise Security</h3>
          <p>End-to-end encryption ensures your conversations stay private.</p>
        </div>
      )
    },
    {
      id: 'complete',
      title: 'Complete',
      subtitle: 'You\'re all set!',
      icon: FiCheck,
      component: () => (
        <div className="step-content">
          <h3>Setup Complete!</h3>
          <p>You're ready to start using Nexus ChatApp.</p>
        </div>
      )
    }
  ];

  const handleWizardComplete = (data) => {
    console.log('Wizard completed with data:', data);
    alert('Setup completed successfully!');
  };

  const handleLinearStepChange = (step, previousStep, info) => {
    console.log('Step changed:', { step, previousStep, info });
  };

  return (
    <div className="navigation-examples">
      <div className="examples-header">
        <h1>Linear Navigation Examples</h1>
        <p>Professional navigation patterns for modern applications</p>
        
        <div className="example-tabs">
          <button
            className={`tab ${activeExample === 'wizard' ? 'active' : ''}`}
            onClick={() => setActiveExample('wizard')}
          >
            Setup Wizard
          </button>
          <button
            className={`tab ${activeExample === 'linear' ? 'active' : ''}`}
            onClick={() => setActiveExample('linear')}
          >
            Linear Navigation
          </button>
          <button
            className={`tab ${activeExample === 'variants' ? 'active' : ''}`}
            onClick={() => setActiveExample('variants')}
          >
            Style Variants
          </button>
        </div>
      </div>

      <div className="examples-content">
        {activeExample === 'wizard' && (
          <div className="example-section">
            <h2>Setup Wizard Example</h2>
            <p>A complete multi-step wizard with validation and form handling.</p>
            
            <NavigationWizard
              steps={wizardSteps}
              title="Account Setup Wizard"
              subtitle="Create your Nexus ChatApp account in just a few steps"
              onComplete={handleWizardComplete}
              onCancel={() => alert('Setup cancelled')}
              allowSkip={true}
              showProgress={true}
              autoSave={true}
            />
          </div>
        )}

        {activeExample === 'linear' && (
          <div className="example-section">
            <h2>Linear Navigation Example</h2>
            <p>Simple step-by-step navigation with custom components.</p>
            
            <LinearNavigation
              items={linearSteps}
              onStepChange={handleLinearStepChange}
              showProgress={true}
              showBreadcrumbs={true}
              allowSkip={true}
              orientation="horizontal"
              variant="default"
            />
          </div>
        )}

        {activeExample === 'variants' && (
          <div className="example-section">
            <h2>Style Variants</h2>
            <p>Different visual styles for various use cases.</p>
            
            <div className="variants-grid">
              <div className="variant-item">
                <h3>Minimal Style</h3>
                <LinearNavigation
                  items={linearSteps.slice(0, 3)}
                  variant="minimal"
                  showProgress={false}
                />
              </div>
              
              <div className="variant-item">
                <h3>Cards Style</h3>
                <LinearNavigation
                  items={linearSteps.slice(0, 3)}
                  variant="cards"
                  orientation="horizontal"
                />
              </div>
              
              <div className="variant-item">
                <h3>Timeline Style</h3>
                <LinearNavigation
                  items={linearSteps.slice(0, 3)}
                  variant="timeline"
                  orientation="vertical"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavigationExamples;