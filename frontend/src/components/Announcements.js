import React, { useState, useEffect } from 'react';
import { distributorService } from '../services/distributorService';
import { FaBullhorn, FaClock } from 'react-icons/fa';
import './Announcements.css';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await distributorService.getAnnouncements();
      setAnnouncements(response.data.announcements || []);
    } catch (error) {
      console.error('Error loading announcements:', error);
      // Mock data for demonstration
      const mockAnnouncements = [
        {
          id: 1,
          title: 'New Product Line Launch',
          content:
            'We are excited to announce the launch of our new eco-friendly product line. Check out the special offers section for exclusive discounts!',
          published_at: '2024-01-15T10:00:00Z',
          is_important: true,
        },
        {
          id: 2,
          title: 'Holiday Shipping Schedule',
          content:
            'Please note that our warehouse will be closed from December 24-26. Orders placed during this time will be processed starting December 27.',
          published_at: '2024-01-10T14:30:00Z',
          is_important: false,
        },
        {
          id: 3,
          title: 'Updated Distributor Terms',
          content:
            'We have updated our distributor agreement terms. Please review the new terms in your account settings.',
          published_at: '2024-01-05T09:00:00Z',
          is_important: true,
        },
      ];
      setAnnouncements(mockAnnouncements);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = announcements.filter((announcement) => {
    if (filter === 'important') return announcement.is_important;
    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="announcements-page">
      <div className="announcements-header">
        <h1>
          <FaBullhorn /> Announcements
        </h1>

        <div className="filter-buttons">
          <button
            onClick={() => setFilter('all')}
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('important')}
            className={`filter-btn ${filter === 'important' ? 'active' : ''}`}
          >
            Important
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading announcements...</div>
      ) : filteredAnnouncements.length > 0 ? (
        <div className="announcements-list">
          {filteredAnnouncements.map((announcement) => (
            <div
              key={announcement.id}
              className={`announcement-card ${
                announcement.is_important ? 'important' : ''
              }`}
            >
              {announcement.is_important && (
                <div className="important-badge">Important</div>
              )}

              <h2>{announcement.title}</h2>
              <p className="announcement-content">{announcement.content}</p>

              <div className="announcement-footer">
                <span className="announcement-date">
                  <FaClock /> {formatDate(announcement.published_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <FaBullhorn />
          <h2>No announcements</h2>
          <p>
            {filter === 'important'
              ? 'No important announcements at this time'
              : 'Check back later for updates'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Announcements;
