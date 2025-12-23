import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { distributorService } from '../services/distributorService';
import { FaBox, FaDollarSign, FaClock, FaCheckCircle } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect sales reps to their dashboard
    if (user?.userType === 'sales_representative') {
      navigate('/sales-rep-dashboard', { replace: true });
      return;
    }
    loadDashboardData();
  }, [user, navigate]);

  const loadDashboardData = async () => {
    try {
      const [statusRes, statsRes, ordersRes, announcementsRes] = await Promise.all([
        distributorService.getStatus(),
        distributorService.getDashboardStats(),
        distributorService.getRecentOrders(),
        distributorService.getAnnouncements(),
      ]);

      setStatus(statusRes.data);
      setStats(statsRes.data);
      setRecentOrders(ordersRes.data.orders || []);
      setAnnouncements(announcementsRes.data.announcements || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  const getStatusBadge = () => {
    if (!status) return null;

    const statusConfig = {
      pending: { className: 'status-pending', text: 'Pending Approval', icon: <FaClock /> },
      approved: { className: 'status-approved', text: 'Approved', icon: <FaCheckCircle /> },
      rejected: { className: 'status-rejected', text: 'Rejected', icon: null },
    };

    const config = statusConfig[status.approvalStatus] || statusConfig.pending;

    return (
      <div className={`account-status ${config.className}`}>
        {config.icon}
        <span>{config.text}</span>
      </div>
    );
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.firstName}!</h1>
          <p>Here's what's happening with your account today</p>
        </div>
        {getStatusBadge()}
      </div>

      {status?.approvalStatus === 'pending' && (
        <div className="alert alert-info">
          <FaClock />
          <div>
            <strong>Account Pending Approval</strong>
            <p>Your distributor account is currently pending approval. You'll receive an email once it's been reviewed.</p>
          </div>
        </div>
      )}

      {status?.approvalStatus === 'rejected' && (
        <div className="alert alert-danger">
          <div>
            <strong>Account Rejected</strong>
            <p>{status.rejectionReason || 'Your account application was not approved.'}</p>
          </div>
        </div>
      )}

      {status?.approvalStatus === 'approved' && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">
                <FaBox />
              </div>
              <div className="stat-details">
                <h3>{stats?.totalOrders || 0}</h3>
                <p>Total Orders</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange">
                <FaClock />
              </div>
              <div className="stat-details">
                <h3>{stats?.pendingOrders || 0}</h3>
                <p>Pending Orders</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">
                <FaDollarSign />
              </div>
              <div className="stat-details">
                <h3>${stats?.totalSpent?.toFixed(2) || '0.00'}</h3>
                <p>Total Spent</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon purple">
                <FaBox />
              </div>
              <div className="stat-details">
                <h3>{stats?.activeProducts || 0}</h3>
                <p>Active Products</p>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-section">
              <h2>Recent Orders</h2>
              {recentOrders.length > 0 ? (
                <div className="orders-list">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="order-item">
                      <div className="order-info">
                        <span className="order-number">#{order.order_number}</span>
                        <span className="order-date">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="order-status">
                        <span className={`badge badge-${order.order_status}`}>
                          {order.order_status}
                        </span>
                        <span className="order-amount">${order.total_amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FaBox />
                  <p>No orders yet</p>
                  <p className="empty-subtitle">Start shopping to place your first order</p>
                </div>
              )}
            </div>

            <div className="dashboard-section">
              <h2>Announcements</h2>
              {announcements.length > 0 ? (
                <div className="announcements-list">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="announcement-item">
                      <h4>{announcement.title}</h4>
                      <p>{announcement.content}</p>
                      <span className="announcement-date">
                        {new Date(announcement.published_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No announcements</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
