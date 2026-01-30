import React, { useState, useEffect } from 'react';
import { FaShieldAlt, FaBug, FaExclamationTriangle, FaChartLine } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { scanAPI, vulnerabilityAPI, attackAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [scanStats, vulnStats, attackStats] = await Promise.all([
        scanAPI.getScanStats(),
        vulnerabilityAPI.getVulnerabilityStats(),
        attackAPI.getAttackStats()
      ]);

      setStats({
        scans: scanStats.data,
        vulnerabilities: vulnStats.data,
        attacks: attackStats.data
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const COLORS = ['#ff4757', '#ff7f50', '#ffc107', '#28a745', '#00d4ff'];

  const severityData = stats?.vulnerabilities?.bySeverity?.map(item => ({
    name: item._id,
    value: item.count
  })) || [];

  const attackTypeData = stats?.attacks?.byType?.map(item => ({
    name: item._id,
    count: item.count
  })) || [];

  return (
    <div className="container">
      <div className="page-header">
        <h1>Security Dashboard</h1>
        <p>Real-time security monitoring and vulnerability management</p>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="stat-value">{stats?.scans?.totalScans || 0}</div>
              <div className="stat-label">Total Scans</div>
            </div>
            <FaChartLine className="card-icon" style={{ color: '#00d4ff' }} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="stat-value">{stats?.vulnerabilities?.total || 0}</div>
              <div className="stat-label">Vulnerabilities Found</div>
            </div>
            <FaBug className="card-icon" style={{ color: '#ffc107' }} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="stat-value">{stats?.attacks?.totalAttacks || 0}</div>
              <div className="stat-label">Attacks Detected</div>
            </div>
            <FaExclamationTriangle className="card-icon" style={{ color: '#ff4757' }} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="stat-value">
                {((stats?.vulnerabilities?.bySeverity?.find(s => s._id === 'Critical')?.count || 0) +
                  (stats?.vulnerabilities?.bySeverity?.find(s => s._id === 'High')?.count || 0))}
              </div>
              <div className="stat-label">Critical & High Risk</div>
            </div>
            <FaShieldAlt className="card-icon" style={{ color: '#ff7f50' }} />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        {/* Vulnerability Severity Distribution */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', color: '#00d4ff' }}>Vulnerability Severity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Attack Types */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', color: '#00d4ff' }}>Attack Types Detected</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attackTypeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3561" />
              <XAxis dataKey="name" stroke="#8b92a8" />
              <YAxis stroke="#8b92a8" />
              <Tooltip 
                contentStyle={{ 
                  background: '#1a1f3a', 
                  border: '1px solid #2d3561',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="count" fill="#00d4ff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Scans */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#00d4ff' }}>Recent Scans</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Target URL</th>
                <th>Status</th>
                <th>Vulnerabilities</th>
                <th>Scan Time</th>
              </tr>
            </thead>
            <tbody>
              {stats?.scans?.recentScans?.map((scan) => (
                <tr key={scan._id}>
                  <td>{scan.targetUrl}</td>
                  <td>
                    <span className={`badge badge-${scan.status === 'Completed' ? 'info' : 'medium'}`}>
                      {scan.status}
                    </span>
                  </td>
                  <td>{scan.totalVulnerabilities || 0}</td>
                  <td>{new Date(scan.startTime).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Attacks */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#00d4ff' }}>Recent Attack Attempts</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Attack Type</th>
                <th>Source IP</th>
                <th>Target</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {stats?.attacks?.recentAttacks?.map((attack) => (
                <tr key={attack._id}>
                  <td>{new Date(attack.timestamp).toLocaleTimeString()}</td>
                  <td>{attack.attackType}</td>
                  <td>{attack.sourceIp}</td>
                  <td>{attack.targetEndpoint}</td>
                  <td>
                    <span className={`badge badge-${attack.severity.toLowerCase()}`}>
                      {attack.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
