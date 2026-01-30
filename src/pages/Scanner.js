import React, { useState, useEffect } from 'react';
import { FaSearch, FaSpinner } from 'react-icons/fa';
import { scanAPI } from '../services/api';

const Scanner = () => {
  const [targetUrl, setTargetUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scans, setScans] = useState([]);
  const [selectedScan, setSelectedScan] = useState(null);

  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    try {
      const response = await scanAPI.getAllScans();
      setScans(response.data);
    } catch (error) {
      console.error('Error fetching scans:', error);
    }
  };

  const handleStartScan = async (e) => {
    e.preventDefault();
    
    if (!targetUrl) {
      alert('Please enter a target URL');
      return;
    }

    setScanning(true);
    try {
      await scanAPI.startScan(targetUrl);
      alert('Scan started successfully! Check the scan history below.');
      setTargetUrl('');
      
      // Refresh scan list after a delay
      setTimeout(() => {
        fetchScans();
        setScanning(false);
      }, 2000);
    } catch (error) {
      console.error('Error starting scan:', error);
      alert('Error starting scan: ' + (error.response?.data?.message || error.message));
      setScanning(false);
    }
  };

  const viewScanDetails = async (scanId) => {
    try {
      const response = await scanAPI.getScanById(scanId);
      setSelectedScan(response.data);
    } catch (error) {
      console.error('Error fetching scan details:', error);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'Critical': '#ff4757',
      'High': '#ff7f50',
      'Medium': '#ffc107',
      'Low': '#28a745',
      'Info': '#00d4ff'
    };
    return colors[severity] || '#8b92a8';
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Vulnerability Scanner</h1>
        <p>Scan websites for security vulnerabilities</p>
      </div>

      {/* Scan Form */}
      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', color: '#00d4ff' }}>Start New Scan</h3>
        <form onSubmit={handleStartScan}>
          <div className="form-group">
            <label>Target URL</label>
            <input
              type="url"
              className="form-control"
              placeholder="https://example.com"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              disabled={scanning}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={scanning}>
            {scanning ? (
              <>
                <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                Scanning...
              </>
            ) : (
              <>
                <FaSearch />
                Start Scan
              </>
            )}
          </button>
        </form>
      </div>

      {/* Scan History */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', color: '#00d4ff' }}>Scan History</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Target URL</th>
                <th>Status</th>
                <th>Vulnerabilities</th>
                <th>Critical</th>
                <th>High</th>
                <th>Medium</th>
                <th>Low</th>
                <th>Scan Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {scans.map((scan) => (
                <tr key={scan._id}>
                  <td>{scan.targetUrl}</td>
                  <td>
                    <span className={`badge badge-${scan.status === 'Completed' ? 'info' : scan.status === 'Running' ? 'medium' : 'low'}`}>
                      {scan.status}
                    </span>
                  </td>
                  <td><strong>{scan.totalVulnerabilities || 0}</strong></td>
                  <td style={{ color: '#ff4757' }}>{scan.criticalCount || 0}</td>
                  <td style={{ color: '#ff7f50' }}>{scan.highCount || 0}</td>
                  <td style={{ color: '#ffc107' }}>{scan.mediumCount || 0}</td>
                  <td style={{ color: '#28a745' }}>{scan.lowCount || 0}</td>
                  <td>{new Date(scan.startTime).toLocaleString()}</td>
                  <td>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', marginRight: '0.5rem' }}
                      onClick={() => viewScanDetails(scan._id)}
                    >
                      View Details
                    </button>
                    {scan.status === 'Completed' && (
                      <a
                        href={`http://localhost:5000/api/reports/scan/${scan._id}`}
                        className="btn btn-primary"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', textDecoration: 'none' }}
                        download
                      >
                        📄 PDF
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scan Details Modal */}
      {selectedScan && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}
        onClick={() => setSelectedScan(null)}
        >
          <div className="card" style={{
            maxWidth: '900px',
            maxHeight: '80vh',
            overflow: 'auto',
            width: '100%'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#00d4ff' }}>Scan Details</h3>
              <button 
                className="btn btn-secondary" 
                onClick={() => setSelectedScan(null)}
                style={{ padding: '0.5rem 1rem' }}
              >
                Close
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <p><strong>Target:</strong> {selectedScan.scan.targetUrl}</p>
              <p><strong>Status:</strong> {selectedScan.scan.status}</p>
              <p><strong>Total Vulnerabilities:</strong> {selectedScan.scan.totalVulnerabilities}</p>
            </div>

            <h4 style={{ color: '#00d4ff', marginBottom: '1rem' }}>Vulnerabilities Found</h4>
            {selectedScan.vulnerabilities.length === 0 ? (
              <p style={{ color: '#28a745' }}>✓ No vulnerabilities found!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {selectedScan.vulnerabilities.map((vuln, index) => (
                  <div key={index} className="card" style={{
                    borderLeft: `4px solid ${getSeverityColor(vuln.severity)}`,
                    padding: '1rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <h5 style={{ color: '#e0e0e0' }}>{vuln.vulnerabilityType}</h5>
                      <span className={`badge badge-${vuln.severity.toLowerCase()}`}>
                        {vuln.severity}
                      </span>
                    </div>
                    <p style={{ color: '#b0b8c9', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      {vuln.description}
                    </p>
                    {vuln.location && (
                      <p style={{ color: '#8b92a8', fontSize: '0.85rem' }}>
                        <strong>Location:</strong> {vuln.location}
                      </p>
                    )}
                    {vuln.payload && (
                      <p style={{ color: '#8b92a8', fontSize: '0.85rem' }}>
                        <strong>Payload:</strong> <code>{vuln.payload}</code>
                      </p>
                    )}
                    {vuln.recommendation && (
                      <p style={{ color: '#00d4ff', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                        <strong>💡 Recommendation:</strong> {vuln.recommendation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Scanner;
