import React, { useState, useEffect } from 'react';
import { submitReport, getReports } from '../services/salesRepService';
import './ReportSubmission.css';

const ReportSubmission = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    reportType: 'daily',
    description: '',
    period: ''
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await getReports();
      setReports(response.data);
    } catch (err) {
      console.error('Failed to load reports', err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('reportType', formData.reportType);
      submitData.append('description', formData.description);
      submitData.append('period', formData.period);
      if (selectedFile) {
        submitData.append('file', selectedFile);
      }

      await submitReport(submitData);
      setMessage('Report submitted successfully!');
      setFormData({
        title: '',
        reportType: 'daily',
        description: '',
        period: ''
      });
      setSelectedFile(null);
      document.getElementById('file-input').value = '';
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getReportTypeLabel = (type) => {
    const types = {
      daily: 'Daily Report',
      weekly: 'Weekly Report',
      monthly: 'Monthly Report',
      quarterly: 'Quarterly Report',
      special: 'Special Report'
    };
    return types[type] || type;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'pending': return 'status-pending';
      default: return '';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="report-submission">
      <div className="report-form-container">
        <h2>📄 Submit Report</h2>
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="report-form">
          <div className="form-group">
            <label htmlFor="title">Report Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter report title"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reportType">Report Type *</label>
              <select
                id="reportType"
                name="reportType"
                value={formData.reportType}
                onChange={handleChange}
                required
              >
                <option value="daily">Daily Report</option>
                <option value="weekly">Weekly Report</option>
                <option value="monthly">Monthly Report</option>
                <option value="quarterly">Quarterly Report</option>
                <option value="special">Special Report</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="period">Period *</label>
              <input
                type="text"
                id="period"
                name="period"
                value={formData.period}
                onChange={handleChange}
                placeholder="e.g., Week 50, Dec 2025"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide a summary of the report"
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="file-input">Attach File (Optional)</label>
            <div className="file-input-wrapper">
              <input
                type="file"
                id="file-input"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
              />
              {selectedFile && (
                <div className="selected-file">
                  <span>📎 {selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      document.getElementById('file-input').value = '';
                    }}
                    className="remove-file"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
            <small>Accepted formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT (Max: 10MB)</small>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>

      <div className="reports-history">
        <h2>📊 Report History</h2>
        {reports.length === 0 ? (
          <div className="no-reports">No reports submitted yet</div>
        ) : (
          <div className="reports-list">
            {reports.map((report) => (
              <div key={report.id} className="report-card">
                <div className="report-header">
                  <div>
                    <h3>{report.title}</h3>
                    <span className="report-type">{getReportTypeLabel(report.report_type)}</span>
                  </div>
                  <span className={`report-status ${getStatusClass(report.status)}`}>
                    {report.status}
                  </span>
                </div>
                <div className="report-body">
                  <p className="report-description">{report.description}</p>
                  <div className="report-meta">
                    <span>📅 Period: {report.period}</span>
                    {report.file_path && (
                      <span>📎 File attached</span>
                    )}
                  </div>
                  <div className="report-footer">
                    <small>Submitted: {formatDate(report.submitted_date)}</small>
                    {report.reviewed_by && (
                      <small>Reviewed by: {report.reviewed_by}</small>
                    )}
                  </div>
                  {report.feedback && (
                    <div className="report-feedback">
                      <strong>Feedback:</strong> {report.feedback}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportSubmission;
