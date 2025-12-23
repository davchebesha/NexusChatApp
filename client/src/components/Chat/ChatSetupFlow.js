import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import NavigationProgress from '../Navigation/NavigationProgress';
import { FiUsers, FiUser, FiSettings, FiCheck, FiX } from 'react-icons/fi';
import './ChatSetupFlow.css';

const ChatSetupFlow = ({ onComplete, onCancel }) => {
  const { 
    startFlow, 
    getCurrentFlowInfo, 
    nextStep,
    isLinearMode, 
    currentFlow,
    completeFlow,
    cancelFlow 
  } = useNavigation();

  const [chatData, setChatData] = useState({
    type: 'direct',
    name: '',
    description: '',
    participants: [],
    isPrivate: false,
    allowInvites: true
  });

  useEffect(() => {
    // Start chat setup flow if not already in linear mode
    if (!isLinearMode || currentFlow !== 'chatSetup') {
      startFlow('chatSetup');
    }
  }, [startFlow, isLinearMode, currentFlow]);

  const flowInfo = getCurrentFlowInfo();

  const handleNext = (stepData = {}) => {
    setChatData(prev => ({ ...prev, ...stepData }));
    nextStep(stepData);
  };

  const handleComplete = () => {
    completeFlow({ chatData });
    if (onComplete) {
      onComplete(chatData);
    }
  };

  const handleCancel = () => {
    cancelFlow();
    if (onCancel) {
      onCancel();
    }
  };

  const renderCurrentStep = () => {
    if (!flowInfo) return null;

    switch (flowInfo.currentStepInfo.id) {
      case 'type':
        return <ChatTypeStep chatData={chatData} onNext={handleNext} />;
      case 'participants':
        return <ParticipantsStep chatData={chatData} onNext={handleNext} />;
      case 'settings':
        return <ChatSettingsStep chatData={chatData} onNext={handleNext} />;
      case 'create':
        return <CreateChatStep chatData={chatData} onComplete={handleComplete} />;
      default:
        return null;
    }
  };

  if (!isLinearMode || currentFlow !== 'chatSetup') {
    return null;
  }

  return (
    <div className="chat-setup-flow">
      <div className="chat-setup-header">
        <h2>Create New Chat</h2>
        <button 
          className="cancel-setup-btn"
          onClick={handleCancel}
          title="Cancel"
        >
          <FiX />
        </button>
      </div>

      <div className="chat-setup-progress">
        <NavigationProgress 
          showControls={false}
          showProgress={true}
          showSteps={true}
          onCancel={handleCancel}
        />
      </div>

      <div className="chat-setup-content">
        {renderCurrentStep()}
      </div>
    </div>
  );
};

// Chat Type Selection Step
const ChatTypeStep = ({ chatData, onNext }) => {
  const [selectedType, setSelectedType] = useState(chatData.type || 'direct');

  const chatTypes = [
    {
      id: 'direct',
      name: 'Direct Message',
      description: 'Private conversation with one person',
      icon: <FiUser />,
      features: ['End-to-end encrypted', 'Private', 'Real-time messaging']
    },
    {
      id: 'group',
      name: 'Group Chat',
      description: 'Conversation with multiple people',
      icon: <FiUsers />,
      features: ['Up to 1000 members', 'Admin controls', 'File sharing']
    }
  ];

  const handleNext = () => {
    onNext({ type: selectedType });
  };

  return (
    <div className="chat-type-step">
      <div className="step-header">
        <h3>Choose Chat Type</h3>
        <p>What type of conversation would you like to create?</p>
      </div>

      <div className="chat-type-options">
        {chatTypes.map((type) => (
          <button
            key={type.id}
            className={`chat-type-option ${selectedType === type.id ? 'selected' : ''}`}
            onClick={() => setSelectedType(type.id)}
          >
            <div className="type-icon">
              {type.icon}
            </div>
            <div className="type-content">
              <h4>{type.name}</h4>
              <p>{type.description}</p>
              <ul className="type-features">
                {type.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          </button>
        ))}
      </div>

      <div className="step-actions">
        <button 
          className="btn btn-primary"
          onClick={handleNext}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

// Participants Selection Step
const ParticipantsStep = ({ chatData, onNext }) => {
  const [participants, setParticipants] = useState(chatData.participants || []);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock users for demonstration
  const mockUsers = [
    { id: 1, username: 'alice_smith', name: 'Alice Smith', avatar: '/default-avatar.png', online: true },
    { id: 2, username: 'bob_jones', name: 'Bob Jones', avatar: '/default-avatar.png', online: false },
    { id: 3, username: 'carol_white', name: 'Carol White', avatar: '/default-avatar.png', online: true },
    { id: 4, username: 'david_brown', name: 'David Brown', avatar: '/default-avatar.png', online: true }
  ];

  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleParticipant = (user) => {
    setParticipants(prev => {
      const exists = prev.find(p => p.id === user.id);
      if (exists) {
        return prev.filter(p => p.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleNext = () => {
    onNext({ participants });
  };

  const canContinue = chatData.type === 'direct' ? participants.length === 1 : participants.length > 0;

  return (
    <div className="participants-step">
      <div className="step-header">
        <h3>
          {chatData.type === 'direct' ? 'Select Contact' : 'Add Participants'}
        </h3>
        <p>
          {chatData.type === 'direct' 
            ? 'Choose who you want to message'
            : 'Add people to your group chat'
          }
        </p>
      </div>

      <div className="participants-search">
        <input
          type="text"
          placeholder="Search for people..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="participants-list">
        {filteredUsers.map((user) => (
          <button
            key={user.id}
            className={`participant-item ${participants.find(p => p.id === user.id) ? 'selected' : ''}`}
            onClick={() => toggleParticipant(user)}
          >
            <img src={user.avatar} alt={user.name} className="avatar avatar-sm" />
            <div className="participant-info">
              <span className="participant-name">{user.name}</span>
              <span className="participant-username">@{user.username}</span>
            </div>
            <div className={`participant-status ${user.online ? 'online' : 'offline'}`} />
          </button>
        ))}
      </div>

      {participants.length > 0 && (
        <div className="selected-participants">
          <h4>Selected ({participants.length})</h4>
          <div className="selected-list">
            {participants.map((participant) => (
              <div key={participant.id} className="selected-participant">
                <img src={participant.avatar} alt={participant.name} className="avatar avatar-xs" />
                <span>{participant.name}</span>
                <button 
                  className="remove-participant"
                  onClick={() => toggleParticipant(participant)}
                >
                  <FiX />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="step-actions">
        <button 
          className="btn btn-primary"
          onClick={handleNext}
          disabled={!canContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

// Chat Settings Step
const ChatSettingsStep = ({ chatData, onNext }) => {
  const [settings, setSettings] = useState({
    name: chatData.name || '',
    description: chatData.description || '',
    isPrivate: chatData.isPrivate || false,
    allowInvites: chatData.allowInvites !== false
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    onNext(settings);
  };

  const isDirectChat = chatData.type === 'direct';

  return (
    <div className="chat-settings-step">
      <div className="step-header">
        <h3>Chat Settings</h3>
        <p>Configure your {isDirectChat ? 'direct message' : 'group chat'} preferences</p>
      </div>

      <div className="settings-form">
        {!isDirectChat && (
          <>
            <div className="form-group">
              <label>Group Name</label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => handleSettingChange('name', e.target.value)}
                placeholder="Enter group name"
              />
            </div>

            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                value={settings.description}
                onChange={(e) => handleSettingChange('description', e.target.value)}
                placeholder="Describe what this group is about"
                rows="3"
              />
            </div>
          </>
        )}

        <div className="settings-options">
          <div className="setting-option">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={settings.isPrivate}
                onChange={(e) => handleSettingChange('isPrivate', e.target.checked)}
              />
              <span className="toggle-slider"></span>
              Private {isDirectChat ? 'conversation' : 'group'}
            </label>
            <p className="setting-description">
              {isDirectChat 
                ? 'Only you and the other person can see this conversation'
                : 'Only invited members can join this group'
              }
            </p>
          </div>

          {!isDirectChat && (
            <div className="setting-option">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={settings.allowInvites}
                  onChange={(e) => handleSettingChange('allowInvites', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                Allow members to invite others
              </label>
              <p className="setting-description">
                Members can invite new people to join the group
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="step-actions">
        <button 
          className="btn btn-primary"
          onClick={handleNext}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

// Create Chat Step
const CreateChatStep = ({ chatData, onComplete }) => {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    
    // Simulate chat creation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsCreating(false);
    onComplete();
  };

  return (
    <div className="create-chat-step">
      <div className="step-header">
        <h3>Review & Create</h3>
        <p>Review your {chatData.type === 'direct' ? 'direct message' : 'group chat'} settings</p>
      </div>

      <div className="chat-summary">
        <div className="summary-section">
          <h4>Type</h4>
          <p>{chatData.type === 'direct' ? 'Direct Message' : 'Group Chat'}</p>
        </div>

        {chatData.type === 'group' && chatData.name && (
          <div className="summary-section">
            <h4>Name</h4>
            <p>{chatData.name}</p>
          </div>
        )}

        <div className="summary-section">
          <h4>Participants</h4>
          <div className="participants-summary">
            {chatData.participants?.map((participant) => (
              <div key={participant.id} className="participant-summary">
                <img src={participant.avatar} alt={participant.name} className="avatar avatar-xs" />
                <span>{participant.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="summary-section">
          <h4>Privacy</h4>
          <p>{chatData.isPrivate ? 'Private' : 'Public'}</p>
        </div>
      </div>

      <div className="step-actions">
        <button 
          className="btn btn-primary btn-large"
          onClick={handleCreate}
          disabled={isCreating}
        >
          {isCreating ? (
            <>
              <div className="spinner" />
              Creating...
            </>
          ) : (
            <>
              <FiCheck />
              Create Chat
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatSetupFlow;