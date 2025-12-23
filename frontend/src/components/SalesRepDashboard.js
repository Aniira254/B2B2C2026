import React, { useState, useEffect } from 'react';
import { getMetrics } from '../services/salesRepService';
import LeaveManagement from './LeaveManagement';
import SalesAnnouncements from './SalesAnnouncements';
import SuggestionBox from './SuggestionBox';
import ReportSubmission from './ReportSubmission';
import TaskManagement from './TaskManagement';
import InternalMessaging from './InternalMessaging';
import './SalesRepDashboard.css';

const SalesRepDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await getMetrics();
      setMetrics(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load metrics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'leave', label: 'Leave Management', icon: '🏖️' },
    { id: 'announcements', label: 'Announcements', icon: '📢' },
    { id: 'suggestions', label: 'Suggestion Box', icon: '💡' },
    { id: 'reports', label: 'Reports', icon: '📄' },
    { id: 'tasks', label: 'Tasks', icon: '✅' },
    { id: 'messages', label: 'Messages', icon: '💬' }
  ];

  const renderMetricsCard = (label, value, className = '') => (
    <div className={`metric-card ${className}`}>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value || '0'}</div>
    </div>
  );

  const renderOverview = () => {
    if (loading) return <div className="loading">Loading metrics...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
      <div>
        <h2>Performance Metrics</h2>
        <div className="dashboard-metrics">
          {renderMetricsCard(
            'Total Orders',
            metrics?.sales?.total_orders,
            'blue'
          )}
          {renderMetricsCard(
            'Total Revenue',
            `$${parseFloat(metrics?.sales?.total_revenue || 0).toFixed(2)}`,
            'green'
          )}
          {renderMetricsCard(
            'Unique Customers',
            metrics?.sales?.unique_customers,
            'orange'
          )}
          {renderMetricsCard(
            'Avg Order Value',
            `$${parseFloat(metrics?.sales?.average_order_value || 0).toFixed(2)}`
          )}
        </div>

        <h2>Leave Statistics</h2>
        <div className="dashboard-metrics">
          {renderMetricsCard(
            'Total Leaves',
            metrics?.leaves?.total_leaves,
            'blue'
          )}
          {renderMetricsCard(
            'Approved',
            metrics?.leaves?.approved_leaves,
            'green'
          )}
          {renderMetricsCard(
            'Pending',
            metrics?.leaves?.pending_leaves,
            'orange'
          )}
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'leave':
        return <LeaveManagement />;
      case 'announcements':
        return <SalesAnnouncements />;
      case 'suggestions':
        return <SuggestionBox />;
      case 'reports':
        return <ReportSubmission />;
      case 'tasks':
        return <TaskManagement />;
      case 'messages':
        return <InternalMessaging />;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="sales-rep-dashboard">
      <div className="dashboard-header">
        <h1>Sales Representative Dashboard</h1>
        <p>Manage your work, track performance, and stay updated</p>
      </div>

      <div className="dashboard-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`dashboard-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      <div className="dashboard-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default SalesRepDashboard;
