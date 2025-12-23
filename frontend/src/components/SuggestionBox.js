import React, { useState, useEffect } from 'react';
import { submitSuggestion, getSuggestions } from '../services/salesRepService';
import './SuggestionBox.css';

const SuggestionBox = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'process_improvement',
    visibility: 'anonymous'
  });

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await getSuggestions();
      setSuggestions(response.data);
    } catch (err) {
      console.error('Failed to load suggestions', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await submitSuggestion(formData);
      setMessage('Suggestion submitted successfully!');
      setFormData({
        title: '',
        description: '',
        category: 'process_improvement',
        visibility: 'anonymous'
      });
      fetchSuggestions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit suggestion');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="suggestion-box">
      <div className="suggestion-form">
        <h3>💡 Submit a Suggestion</h3>
        
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief title for your suggestion..."
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="process_improvement">Process Improvement</option>
              <option value="product">Product</option>
              <option value="customer_service">Customer Service</option>
              <option value="training">Training</option>
              <option value="tools">Tools & Technology</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your suggestion in detail..."
              required
            />
          </div>

          <div className="form-group">
            <label>Visibility</label>
            <div className="visibility-options">
              <label
                className={`visibility-option ${formData.visibility === 'anonymous' ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value="anonymous"
                  checked={formData.visibility === 'anonymous'}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                />
                <div className="visibility-icon">🕵️</div>
                <div className="visibility-label">Anonymous</div>
                <div className="visibility-description">Your identity will remain hidden</div>
              </label>

              <label
                className={`visibility-option ${formData.visibility === 'revealed' ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value="revealed"
                  checked={formData.visibility === 'revealed'}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                />
                <div className="visibility-icon">👤</div>
                <div className="visibility-label">Revealed</div>
                <div className="visibility-description">Your name will be shown</div>
              </label>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Suggestion'}
          </button>
        </form>
      </div>

      <div className="suggestions-list">
        <h3>My Suggestions</h3>
        
        {suggestions.length === 0 ? (
          <div className="no-suggestions">
            <p>You haven't submitted any suggestions yet</p>
          </div>
        ) : (
          suggestions.map((suggestion) => (
            <div key={suggestion.id} className="suggestion-card">
              <div className="suggestion-header">
                <div>
                  <h4 className="suggestion-title">{suggestion.title}</h4>
                  <div className="suggestion-meta">
                    Submitted on {formatDate(suggestion.created_at)} • 
                    Submitted by: {suggestion.submitted_by}
                  </div>
                </div>
                <div>
                  <span className="category-badge">{suggestion.category.replace('_', ' ')}</span>
                  {' '}
                  <span className={`visibility-badge visibility-${suggestion.visibility}`}>
                    {suggestion.visibility}
                  </span>
                </div>
              </div>
              <div className="suggestion-description">{suggestion.description}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SuggestionBox;
