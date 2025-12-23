import React, { useState, useEffect } from 'react';
import { getAnnouncements } from '../services/salesRepService';
import './SalesAnnouncements.css';

const SalesAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await getAnnouncements();
      setAnnouncements(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'urgent': return 'priority-urgent';
      case 'important': return 'priority-important';
      default: return 'priority-normal';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      if (diffInHours < 1) return 'Just now';
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }

    return date.toLocaleDateString();
  };

  if (loading) {
    return <div className="loading">Loading announcements...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="sales-announcements">
      <div className="announcements-header">
        <h3>Team Announcements</h3>
      </div>

      {announcements.length === 0 ? (
        <div className="no-announcements">
          <div className="no-announcements-icon">📢</div>
          <h4>No announcements yet</h4>
          <p>Check back later for updates from your team</p>
        </div>
      ) : (
        <div className="announcements-list">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`announcement-card ${announcement.priority === 'urgent' ? 'urgent' : ''}`}
            >
              <div className="announcement-header">
                <div>
                  <h4 className="announcement-title">{announcement.title}</h4>
                  <div className="announcement-meta">
                    <span className="announcement-author">
                      👤 {announcement.first_name} {announcement.last_name}
                    </span>
                    <span className="announcement-date">
                      🕒 {formatDate(announcement.created_at)}
                    </span>
                  </div>
                </div>
                <span className={`priority-badge ${getPriorityClass(announcement.priority)}`}>
                  {announcement.priority || 'normal'}
                </span>
              </div>
              <div className="announcement-content">{announcement.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SalesAnnouncements;
