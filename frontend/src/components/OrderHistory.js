import React, { useState, useEffect } from 'react';
import { FaBox, FaEye, FaSearch } from 'react-icons/fa';
import './OrderHistory.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      // TODO: Call API to get orders
      // const response = await orderService.getOrders({ status: statusFilter });
      // setOrders(response.data.orders);

      // Mock data for demonstration
      const mockOrders = [
        {
          id: 1,
          order_number: 'ORD-2024-001',
          order_status: 'delivered',
          total_amount: 599.99,
          created_at: '2024-01-15T10:30:00Z',
          items: [
            { product_name: 'Product 1', quantity: 2, unit_price: 149.99 },
            { product_name: 'Product 2', quantity: 3, unit_price: 100.00 },
          ],
        },
        {
          id: 2,
          order_number: 'ORD-2024-002',
          order_status: 'processing',
          total_amount: 299.50,
          created_at: '2024-01-20T14:20:00Z',
          items: [
            { product_name: 'Product 3', quantity: 1, unit_price: 299.50 },
          ],
        },
      ];

      setOrders(mockOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.order_number
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || order.order_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusClass = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      processing: 'status-processing',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled',
    };
    return statusClasses[status] || 'status-pending';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="order-history">
      <h1>Order History</h1>

      <div className="order-controls">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by order number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading orders...</div>
      ) : filteredOrders.length > 0 ? (
        <div className="orders-list">
          {filteredOrders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>{order.order_number}</h3>
                  <span className="order-date">{formatDate(order.created_at)}</span>
                </div>
                <span className={`status-badge ${getStatusClass(order.order_status)}`}>
                  {order.order_status}
                </span>
              </div>

              <div className="order-body">
                <div className="order-details">
                  <p>
                    <strong>{order.items?.length || 0} items</strong>
                  </p>
                  <p className="order-total">${order.total_amount.toFixed(2)}</p>
                </div>

                <button
                  onClick={() => setSelectedOrder(order)}
                  className="btn btn-view"
                >
                  <FaEye /> View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <FaBox />
          <h2>No orders found</h2>
          <p>
            {search || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : "You haven't placed any orders yet"}
          </p>
        </div>
      )}

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="btn-close"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="order-detail-section">
                <h3>Order Information</h3>
                <p>
                  <strong>Order Number:</strong> {selectedOrder.order_number}
                </p>
                <p>
                  <strong>Date:</strong> {formatDate(selectedOrder.created_at)}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`status-badge ${getStatusClass(selectedOrder.order_status)}`}>
                    {selectedOrder.order_status}
                  </span>
                </p>
              </div>

              <div className="order-detail-section">
                <h3>Items</h3>
                <div className="order-items">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="item-details">
                        <span className="item-name">{item.product_name}</span>
                        <span className="item-quantity">Qty: {item.quantity}</span>
                      </div>
                      <span className="item-price">
                        ${(item.unit_price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-total-section">
                <strong>Total:</strong>
                <strong>${selectedOrder.total_amount.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
