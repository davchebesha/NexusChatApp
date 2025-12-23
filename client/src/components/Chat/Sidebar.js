import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { FiSearch, FiSettings, FiLogOut, FiMessageSquare, FiBell } from 'react-icons/fi';
import NewChatModal from './NewChatModal';
import SearchPage from '../Search/SearchPage';
import SettingsPage from '../Settings/SettingsPage';
import ProfilePage from '../Profile/ProfilePage';
import NotificationsPage from '../Notifications/NotificationsPage';
import './Chat.css';

const Sidebar = ({ show, isCollapsed = false, showIconsOnly = false }) => {
  const { user, logout } = useAuth();
  const { chats, selectChat, selectedChat, onlineUsers } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const filteredChats = chats.filter(chat => {
    const chatName = chat.type === 'private'
      ? chat.participants.find(p => p._id !== user.id)?.username || ''
      : chat.name || '';
    return chatName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getChatName = (chat) => {
    if (chat.type === 'private') {
      const otherUser = chat.participants.find(p => p._id !== user.id);
      return otherUser?.username || 'Unknown';
    }
    return chat.name || 'Group Chat';
  };

  const getChatAvatar = (chat) => {
    if (chat.type === 'private') {
      const otherUser = chat.participants.find(p => p._id !== user.id);
      return otherUser?.avatar || '/default-avatar.png';
    }
    return chat.avatar || '/default-group.png';
  };

  const isUserOnline = (chat) => {
    if (chat.type === 'private') {
      const otherUser = chat.participants.find(p => p._id !== user.id);
      return otherUser && onlineUsers.has(otherUser._id);
    }
    return false;
  };

  // Show different views based on state
  if (showSearch) {
    return (
      <div className={`sidebar ${show ? 'show' : 'hide'}`}>
        <SearchPage onClose={() => setShowSearch(false)} />
      </div>
    );
  }

  if (showSettings) {
    return (
      <div className={`sidebar ${show ? 'show' : 'hide'}`}>
        <SettingsPage onClose={() => setShowSettings(false)} />
      </div>
    );
  }

  if (showProfile) {
    return (
      <div className={`sidebar ${show ? 'show' : 'hide'}`}>
        <ProfilePage onClose={() => setShowProfile(false)} />
      </div>
    );
  }

  if (showNotifications) {
    return (
      <div className={`sidebar ${show ? 'show' : 'hide'}`}>
        <NotificationsPage onClose={() => setShowNotifications(false)} />
      </div>
    );
  }

  return (
    <div className={`sidebar ${show ? 'show' : 'hide'} ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="user-info" onClick={() => setShowProfile(true)} style={{ cursor: 'pointer' }}>
          <img src={user?.avatar || '/default-avatar.png'} alt="Avatar" className="avatar avatar-md" />
          {!showIconsOnly && (
            <div>
              <h3>{user?.username}</h3>
              <span className="status-text">{user?.status}</span>
            </div>
          )}
        </div>
        <div className="header-actions">
          <button className="icon-btn notification-btn" onClick={() => setShowNotifications(true)} title="Notifications">
            <FiBell />
            {!showIconsOnly && <span className="notification-badge">3</span>}
          </button>
          <button className="icon-btn" onClick={() => setShowSearch(true)} title="Search">
            <FiSearch />
          </button>
          <button className="icon-btn" onClick={() => setShowSettings(true)} title="Settings">
            <FiSettings />
          </button>
          <button className="icon-btn" onClick={logout} title="Logout">
            <FiLogOut />
          </button>
        </div>
      </div>

      {!showIconsOnly && (
        <>
          <div className="search-bar">
            <FiSearch />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button className="btn btn-primary new-chat-btn" onClick={() => setShowNewChat(true)}>
            <FiMessageSquare /> New Chat
          </button>
        </>
      )}

      {showIconsOnly && (
        <button className="icon-btn new-chat-icon" onClick={() => setShowNewChat(true)} title="New Chat">
          <FiMessageSquare />
        </button>
      )}

      <div className="chat-list">
        {filteredChats.map(chat => (
          <div
            key={chat._id}
            className={`chat-item ${selectedChat?._id === chat._id ? 'active' : ''} ${showIconsOnly ? 'icon-only' : ''}`}
            onClick={() => selectChat(chat)}
            title={showIconsOnly ? getChatName(chat) : ''}
          >
            <div className="chat-avatar-wrapper">
              <img src={getChatAvatar(chat)} alt="Avatar" className="avatar avatar-md" />
              {isUserOnline(chat) && <span className="status-indicator status-online"></span>}
            </div>
            {!showIconsOnly && (
              <div className="chat-info">
                <div className="chat-header">
                  <h4>{getChatName(chat)}</h4>
                  <span className="chat-time">
                    {chat.lastMessage ? new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <p className="chat-last-message">
                  {chat.lastMessage?.content || 'No messages yet'}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {showNewChat && <NewChatModal onClose={() => setShowNewChat(false)} />}
    </div>
  );
};

export default Sidebar;
