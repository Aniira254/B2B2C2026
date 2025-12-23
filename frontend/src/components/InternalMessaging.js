import React, { useState, useEffect, useRef } from 'react';
import { getMessages, sendMessage, getConversations } from '../services/salesRepService';
import { useAuth } from '../context/AuthContext';
import './InternalMessaging.css';

const InternalMessaging = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await getConversations();
      setConversations(response.data);
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      setLoading(true);
      const response = await getMessages(conversationId);
      setMessages(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    try {
      await sendMessage(selectedConversation.id, { message: messageText });
      setMessageText('');
      fetchMessages(selectedConversation.id);
    } catch (err) {
      setError('Failed to send message');
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="internal-messaging">
      <div className="messaging-container">
        {/* Conversations Sidebar */}
        <div className="conversations-sidebar">
          <div className="sidebar-header">
            <h2>💬 Messages</h2>
            <button className="new-message-btn" title="New Message">
              ✏️
            </button>
          </div>

          <div className="search-box">
            <input 
              type="text" 
              placeholder="Search conversations..." 
            />
          </div>

          <div className="conversations-list">
            {conversations.length === 0 ? (
              <div className="no-conversations">
                No conversations yet
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`conversation-item ${selectedConversation?.id === conversation.id ? 'active' : ''}`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="conversation-avatar">
                    {getInitials(conversation.participant_name || conversation.name)}
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-header">
                      <span className="conversation-name">
                        {conversation.participant_name || conversation.name || 'Unknown'}
                      </span>
                      <span className="conversation-time">
                        {conversation.last_message_time && formatTime(conversation.last_message_time)}
                      </span>
                    </div>
                    <div className="conversation-preview">
                      {conversation.last_message || 'No messages yet'}
                    </div>
                  </div>
                  {conversation.unread_count > 0 && (
                    <div className="unread-badge">{conversation.unread_count}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="messages-area">
          {selectedConversation ? (
            <>
              <div className="messages-header">
                <div className="header-left">
                  <div className="participant-avatar">
                    {getInitials(selectedConversation.participant_name || selectedConversation.name)}
                  </div>
                  <div className="participant-info">
                    <h3>{selectedConversation.participant_name || selectedConversation.name || 'Unknown'}</h3>
                    <span className="participant-role">
                      {selectedConversation.participant_role || 'Team Member'}
                    </span>
                  </div>
                </div>
                <div className="header-actions">
                  <button className="action-btn" title="Call">📞</button>
                  <button className="action-btn" title="Video">📹</button>
                  <button className="action-btn" title="More">⋮</button>
                </div>
              </div>

              <div className="messages-content">
                {loading ? (
                  <div className="messages-loading">Loading messages...</div>
                ) : error ? (
                  <div className="messages-error">{error}</div>
                ) : messages.length === 0 ? (
                  <div className="no-messages">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  <div className="messages-list">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`message ${message.sender_id === user?.id ? 'sent' : 'received'}`}
                      >
                        {message.sender_id !== user?.id && (
                          <div className="message-avatar">
                            {getInitials(message.sender_name)}
                          </div>
                        )}
                        <div className="message-content">
                          <div className="message-bubble">
                            {message.message}
                          </div>
                          <div className="message-time">
                            {formatTime(message.sent_at)}
                            {message.sender_id === user?.id && (
                              <span className="message-status">
                                {message.is_read ? '✓✓' : '✓'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <form onSubmit={handleSendMessage} className="message-input-area">
                <button type="button" className="attach-btn" title="Attach file">
                  📎
                </button>
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="message-input"
                />
                <button 
                  type="submit" 
                  className="send-btn"
                  disabled={!messageText.trim()}
                >
                  📤
                </button>
              </form>
            </>
          ) : (
            <div className="no-conversation-selected">
              <div className="empty-state">
                <div className="empty-icon">💬</div>
                <h3>Select a conversation</h3>
                <p>Choose a conversation from the left to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InternalMessaging;
