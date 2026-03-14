import React, { useState } from 'react';
import { honeypotAPI } from '../services/api';
import '../styles/HoneypotWebsite.css';

const HoneypotWebsite = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [dbConfig, setDbConfig] = useState(null);
  const [backupData, setBackupData] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState({});

  // Handle navigation
  const navigateTo = (page) => {
    setCurrentPage(page);
    setMessages({});
  };

  // Admin Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading({ ...loading, login: true });
    setMessages({ ...messages, login: null });

    try {
      const response = await honeypotAPI.adminLogin(loginForm.username, loginForm.password);
      setMessages({ ...messages, login: { type: 'success', text: JSON.stringify(response.data) } });
      setLoginForm({ username: '', password: '' });
    } catch (error) {
      setMessages({ ...messages, login: { type: 'error', text: error.response?.data?.message || 'Login failed' } });
    } finally {
      setLoading({ ...loading, login: false });
    }
  };

  // Get Database Config
  const fetchDatabaseConfig = async () => {
    setLoading({ ...loading, db: true });
    setMessages({ ...messages, db: null });

    try {
      const response = await honeypotAPI.getDatabaseConfig();
      setDbConfig(response.data);
      setMessages({ ...messages, db: { type: 'success', text: 'Configuration loaded' } });
    } catch (error) {
      setMessages({ ...messages, db: { type: 'error', text: error.response?.data?.message || 'Failed to load' } });
    } finally {
      setLoading({ ...loading, db: false });
    }
  };

  // Get Backups
  const fetchBackups = async () => {
    setLoading({ ...loading, backup: true });
    setMessages({ ...messages, backup: null });

    try {
      const response = await honeypotAPI.getBackupDirectory();
      setBackupData(response.data);
      setMessages({ ...messages, backup: { type: 'success', text: 'Backups loaded' } });
    } catch (error) {
      setMessages({ ...messages, backup: { type: 'error', text: error.response?.data?.message || 'Failed to load' } });
    } finally {
      setLoading({ ...loading, backup: false });
    }
  };

  // File Upload
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setMessages({ ...messages, upload: { type: 'error', text: 'Please select a file' } });
      return;
    }

    setLoading({ ...loading, upload: true });
    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      const response = await honeypotAPI.uploadFile(formData);
      setMessages({ ...messages, upload: { type: 'success', text: JSON.stringify(response.data) } });
      setUploadFile(null);
    } catch (error) {
      setMessages({ ...messages, upload: { type: 'error', text: error.response?.data?.message || 'Upload failed' } });
    } finally {
      setLoading({ ...loading, upload: false });
    }
  };

  return (
    <div className="honeypot-website">
      {/* Website Header */}
      <header className="website-header">
        <div className="header-container">
          <div className="logo">
            <h1>DataVault</h1>
            <p>Enterprise Data Management</p>
          </div>
          <nav className="website-nav">
            <button 
              className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
              onClick={() => navigateTo('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`nav-link ${currentPage === 'login' ? 'active' : ''}`}
              onClick={() => navigateTo('login')}
            >
              Admin Login
            </button>
            <button 
              className={`nav-link ${currentPage === 'config' ? 'active' : ''}`}
              onClick={() => navigateTo('config')}
            >
              Database Config
            </button>
            <button 
              className={`nav-link ${currentPage === 'backups' ? 'active' : ''}`}
              onClick={() => navigateTo('backups')}
            >
              Backups
            </button>
            <button 
              className={`nav-link ${currentPage === 'upload' ? 'active' : ''}`}
              onClick={() => navigateTo('upload')}
            >
              Upload
            </button>
          </nav>
        </div>
      </header>

      {/* Website Content */}
      <main className="website-main">
        {/* Dashboard Page */}
        {currentPage === 'dashboard' && (
          <div className="page-content">
            <div className="hero-section">
              <h2>Welcome to DataVault Admin Panel</h2>
              <p>Manage your enterprise data securely</p>
            </div>
            <div className="dashboard-cards">
              <div className="info-card">
                <h3>📊 Total Users</h3>
                <p className="card-value">2,847</p>
              </div>
              <div className="info-card">
                <h3>🔄 Active Sessions</h3>
                <p className="card-value">324</p>
              </div>
              <div className="info-card">
                <h3>💾 Database Size</h3>
                <p className="card-value">847 GB</p>
              </div>
              <div className="info-card">
                <h3>⏱️ Last Backup</h3>
                <p className="card-value">2h ago</p>
              </div>
            </div>
          </div>
        )}

        {/* Admin Login Page */}
        {currentPage === 'login' && (
          <div className="page-content">
            <div className="form-wrapper">
              <div className="form-box">
                <h2>Admin Authentication</h2>
                <form onSubmit={handleLogin}>
                  <input
                    type="text"
                    placeholder="Username"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                  <button type="submit" disabled={loading.login}>
                    {loading.login ? 'Logging in...' : 'Login'}
                  </button>
                </form>
                {messages.login && (
                  <div className={`message ${messages.login.type}`}>
                    {messages.login.text}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Database Config Page */}
        {currentPage === 'config' && (
          <div className="page-content">
            <div className="section-header">
              <h2>Database Configuration</h2>
              <button 
                className="action-btn" 
                onClick={fetchDatabaseConfig}
                disabled={loading.db}
              >
                {loading.db ? 'Loading...' : 'Load Configuration'}
              </button>
            </div>
            {dbConfig && (
              <div className="config-display">
                <pre>{JSON.stringify(dbConfig, null, 2)}</pre>
              </div>
            )}
            {messages.db && (
              <div className={`message ${messages.db.type}`}>
                {messages.db.text}
              </div>
            )}
          </div>
        )}

        {/* Backups Page */}
        {currentPage === 'backups' && (
          <div className="page-content">
            <div className="section-header">
              <h2>Backup Directory</h2>
              <button 
                className="action-btn" 
                onClick={fetchBackups}
                disabled={loading.backup}
              >
                {loading.backup ? 'Loading...' : 'Load Backups'}
              </button>
            </div>
            {backupData && (
              <div className="backups-list">
                <pre>{JSON.stringify(backupData, null, 2)}</pre>
              </div>
            )}
            {messages.backup && (
              <div className={`message ${messages.backup.type}`}>
                {messages.backup.text}
              </div>
            )}
          </div>
        )}

        {/* File Upload Page */}
        {currentPage === 'upload' && (
          <div className="page-content">
            <div className="section-header">
              <h2>Upload Backup File</h2>
            </div>
            <form onSubmit={handleFileUpload} className="upload-form">
              <div className="file-input-wrapper">
                <label>Select File</label>
                <input
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                />
                {uploadFile && <p className="file-name">Selected: {uploadFile.name}</p>}
              </div>
              <button type="submit" className="action-btn" disabled={loading.upload}>
                {loading.upload ? 'Uploading...' : 'Upload File'}
              </button>
            </form>
            {messages.upload && (
              <div className={`message ${messages.upload.type}`}>
                {messages.upload.text}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Website Footer */}
      <footer className="website-footer">
        <p>&copy; 2026 DataVault. All rights reserved.</p>
        <p>Enterprise Data Management Solutions</p>
      </footer>
    </div>
  );
};

export default HoneypotWebsite;
