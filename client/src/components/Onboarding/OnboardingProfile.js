import React, { useState } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useAuth } from '../../contexts/AuthContext';
import { FiCamera, FiUser, FiMail, FiPhone } from 'react-icons/fi';
import './Onboarding.css';

const OnboardingProfile = () => {
  const { nextStep, previousStep } = useNavigation();
  const { user } = useAuth();
  
  const [profileData, setProfileData] = useState({
    displayName: user?.username || '',
    bio: '',
    phone: '',
    avatar: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({
          ...prev,
          avatar: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    nextStep({ profileData });
  };

  const handleBack = () => {
    previousStep();
  };

  return (
    <div className="onboarding-profile">
      <div className="onboarding-container">
        <div className="onboarding-header">
          <h2>Setup Your Profile</h2>
          <p>Tell us a bit about yourself</p>
        </div>

        <div className="profile-form">
          <div className="avatar-upload">
            <div className="avatar-preview">
              {profileData.avatar ? (
                <img src={profileData.avatar} alt="Avatar" />
              ) : (
                <div className="avatar-placeholder">
                  <FiUser />
                </div>
              )}
            </div>
            <label className="avatar-upload-btn">
              <FiCamera />
              Upload Photo
              <input 
                type="file" 
                accept="image/*"
                onChange={handleAvatarChange}
                hidden
              />
            </label>
          </div>

          <div className="form-group">
            <label>
              <FiUser />
              Display Name
            </label>
            <input
              type="text"
              name="displayName"
              value={profileData.displayName}
              onChange={handleInputChange}
              placeholder="Enter your display name"
            />
          </div>

          <div className="form-group">
            <label>
              <FiMail />
              Bio
            </label>
            <textarea
              name="bio"
              value={profileData.bio}
              onChange={handleInputChange}
              placeholder="Tell us about yourself (optional)"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>
              <FiPhone />
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              name="phone"
              value={profileData.phone}
              onChange={handleInputChange}
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>

        <div className="onboarding-actions">
          <button 
            className="btn btn-outline"
            onClick={handleBack}
          >
            Back
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleNext}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingProfile;