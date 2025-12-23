import React, { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiCamera, FiEdit3, FiSave, FiX } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import './ProfileSettings.css';

const ProfileSettings = () => {
  const { user, updateProfile } = useAuth();
  const { showNotification } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    status: user?.status || 'online'
  });
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [previewAvatar, setPreviewAvatar] = useState(null);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showNotification('Avatar file size must be less than 5MB', 'error');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewAvatar(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const updatedData = {
        ...profileData,
        avatar: previewAvatar || avatar
      };
      
      await updateProfile(updatedData);
      setAvatar(previewAvatar || avatar);
      setPreviewAvatar(null);
      setIsEditing(false);
      showNotification('Profile updated successfully!', 'success');
    } catch (error) {
      showNotification('Failed to update profile', 'error');
    }
  };

  const handleCancel = () => {
    setProfileData({
      username: user?.username || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      status: user?.status || 'online'
    });
    setPreviewAvatar(null);
    setIsEditing(false);
  };

  const statusOptions = [
    { value: 'online', label: 'Online', color: '#10b981' },
    { value: 'away', label: 'Away', color: '#f59e0b' },
    { value: 'busy', label: 'Busy', color: '#ef4444' },
    { value: 'invisible', label: 'Invisible', color: '#6b7280' }
  ];

  return (
    <div className="profile-settings">
      <div className="settings-header">
        <h2>Profile Settings</h2>
        <p>Manage your personal information and account details</p>
      </div>

      <div className="profile-content">
        {/* Avatar Section */}
        <div className="avatar-section">
          <div className="avatar-container">
            <div className="avatar-wrapper">
              <img 
                src={previewAvatar || avatar || '/default-avatar.png'} 
                alt="Profile Avatar"
                className="profile-avatar"
              />
              {isEditing && (
                <label className="avatar-upload-btn">
                  <FiCamera />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
            <div className="avatar-info">
              <h3>{profileData.username}</h3>
              <div className="status-indicator">
                <div 
                  className="status-dot"
                  style={{ 
                    backgroundColor: statusOptions.find(s => s.value === profileData.status)?.color 
                  }}
                ></div>
                <span className="status-text">
                  {statusOptions.find(s => s.value === profileData.status)?.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="profile-form">
          <div className="form-section">
            <h3>Personal Information</h3>
            
            <div className="form-group">
              <label>
                <FiUser className="form-icon" />
                Username
              </label>
              <input
                type="text"
                value={profileData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                disabled={!isEditing}
                className={!isEditing ? 'disabled' : ''}
              />
            </div>

            <div className="form-group">
              <label>
                <FiMail className="form-icon" />
                Email
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
                className={!isEditing ? 'disabled' : ''}
              />
            </div>

            <div className="form-group">
              <label>
                <FiPhone className="form-icon" />
                Phone Number
              </label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
                className={!isEditing ? 'disabled' : ''}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                disabled={!isEditing}
                className={!isEditing ? 'disabled' : ''}
                placeholder="Tell others about yourself..."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                value={profileData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                disabled={!isEditing}
                className={!isEditing ? 'disabled' : ''}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Account Statistics */}
          <div className="form-section">
            <h3>Account Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">127</div>
                <div className="stat-label">Messages Sent</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">15</div>
                <div className="stat-label">Active Chats</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">3.2GB</div>
                <div className="stat-label">Files Shared</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">45 days</div>
                <div className="stat-label">Member Since</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="profile-actions">
          {!isEditing ? (
            <button 
              className="edit-btn"
              onClick={() => setIsEditing(true)}
            >
              <FiEdit3 />
              Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button 
                className="save-btn"
                onClick={handleSave}
              >
                <FiSave />
                Save Changes
              </button>
              <button 
                className="cancel-btn"
                onClick={handleCancel}
              >
                <FiX />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;