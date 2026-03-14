import React, { useState } from 'react';
import { honeypotAPI } from '../services/api';
import '../styles/Honeypot.css';
import { FaLock, FaDatabase, FaHdd, FaCloudUploadAlt } from 'react-icons/fa';

const Honeypot = () => {
  // Admin Login State
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginResult, setLoginResult] = useState(null);
  const [loginError, setLoginError] = useState(null);

  // Database Config State
  const [dbLoading, setDbLoading] = useState(false);
  const [dbConfig, setDbConfig] = useState(null);
  const [dbError, setDbError] = useState(null);

  // Backup Directory State
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupData, setBackupData] = useState(null);
  const [backupError, setBackupError] = useState(null);

  // File Upload State
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  // Handler functions
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    setLoginResult(null);
    
    try {
      const response = await honeypotAPI.adminLogin(loginForm.username, loginForm.password);
      setLoginResult(response.data);
      setLoginForm({ username: '', password: '' });
    } catch (error) {
      setLoginError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleGetDatabaseConfig = async () => {
    setDbLoading(true);
    setDbError(null);
    setDbConfig(null);
    
    try {
      const response = await honeypotAPI.getDatabaseConfig();
      setDbConfig(response.data);
    } catch (error) {
      setDbError(error.response?.data?.message || 'Failed to fetch database config');
    } finally {
      setDbLoading(false);
    }
  };

  const handleGetBackupDirectory = async () => {
    setBackupLoading(true);
    setBackupError(null);
    setBackupData(null);
    
    try {
      const response = await honeypotAPI.getBackupDirectory();
      setBackupData(response.data);
    } catch (error) {
      setBackupError(error.response?.data?.message || 'Failed to fetch backup directory');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setUploadFile(e.target.files[0]);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select a file first');
      return;
    }

    setUploadLoading(true);
    setUploadError(null);
    setUploadResult(null);
    
    const formData = new FormData();
    formData.append('file', uploadFile);
    
    try {
      const response = await honeypotAPI.uploadFile(formData);
      setUploadResult(response.data);
      setUploadFile(null);
      document.getElementById('file-input').value = '';
    } catch (error) {
      setUploadError(error.response?.data?.message || 'File upload failed');
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="honeypot-container">
      <div className="honeypot-header">
        <h1>🍯 Honeypot Admin Panel</h1>
        <p>Test fake login credentials, access fake configs, and upload test files</p>
      </div>

      <div className="honeypot-grid">
        {/* Admin Login Card */}
        <div className="honeypot-card">
          <div className="card-header">
            <FaLock className="card-icon" />
            <h2>Admin Login</h2>
          </div>
          <form onSubmit={handleAdminLogin}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={loginForm.username}
                onChange={handleLoginChange}
                placeholder="Enter fake username"
                disabled={loginLoading}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                placeholder="Enter fake password"
                disabled={loginLoading}
              />
            </div>
            <button type="submit" disabled={loginLoading} className="btn btn-primary">
              {loginLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {loginError && <div className="alert alert-danger">{loginError}</div>}
          {loginResult && (
            <div className="alert alert-success">
              <p><strong>Response:</strong> {JSON.stringify(loginResult)}</p>
            </div>
          )}
        </div>

        {/* Database Config Card */}
        <div className="honeypot-card">
          <div className="card-header">
            <FaDatabase className="card-icon" />
            <h2>Database Config</h2>
          </div>
          <p className="card-description">Fetch fake database configuration</p>
          <button
            onClick={handleGetDatabaseConfig}
            disabled={dbLoading}
            className="btn btn-primary"
          >
            {dbLoading ? 'Loading...' : 'Get Database Config'}
          </button>

          {dbError && <div className="alert alert-danger">{dbError}</div>}
          {dbConfig && (
            <div className="alert alert-success">
              <pre>{JSON.stringify(dbConfig, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* Backup Directory Card */}
        <div className="honeypot-card">
          <div className="card-header">
            <FaHdd className="card-icon" />
            <h2>Backup Directory</h2>
          </div>
          <p className="card-description">Retrieve fake backup directory structure</p>
          <button
            onClick={handleGetBackupDirectory}
            disabled={backupLoading}
            className="btn btn-primary"
          >
            {backupLoading ? 'Loading...' : 'Get Backup Directory'}
          </button>

          {backupError && <div className="alert alert-danger">{backupError}</div>}
          {backupData && (
            <div className="alert alert-success">
              <pre>{JSON.stringify(backupData, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* File Upload Card */}
        <div className="honeypot-card">
          <div className="card-header">
            <FaCloudUploadAlt className="card-icon" />
            <h2>File Upload</h2>
          </div>
          <form onSubmit={handleFileUpload}>
            <div className="form-group">
              <label>Select File</label>
              <input
                id="file-input"
                type="file"
                onChange={handleFileChange}
                disabled={uploadLoading}
                className="file-input"
              />
              {uploadFile && <p className="file-name">📄 {uploadFile.name}</p>}
            </div>
            <button type="submit" disabled={uploadLoading} className="btn btn-primary">
              {uploadLoading ? 'Uploading...' : 'Upload File'}
            </button>
          </form>

          {uploadError && <div className="alert alert-danger">{uploadError}</div>}
          {uploadResult && (
            <div className="alert alert-success">
              <p><strong>Upload Response:</strong></p>
              <pre>{JSON.stringify(uploadResult, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Honeypot;
