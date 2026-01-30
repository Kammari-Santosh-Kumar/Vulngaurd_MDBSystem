import React, { useState, useEffect } from 'react';
import { FaBug, FaShieldAlt } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { attackAPI } from '../services/api';
import AttackMap from '../components/AttackMap';

const Attacks = () => {
  const [attacks, setAttacks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchData();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [attacksRes, statsRes] = await Promise.all([
        attackAPI.getAllAttacks({ limit: 50 }),
        attackAPI.getAttackStats()
      ]);
      
      setAttacks(attacksRes.data);
      setStats(statsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching attack data:', error);
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

  const filteredAttacks = filter 
    ? attacks.filter(a => a.attackType === filter)
    : attacks;

  return (
    <div className="container">
      <div className="page-header">
        <h1>🍯 Honeypot & Attack Logs</h1>
        <p>Monitor and analyze attack attempts in real-time</p>
      </div>

      {/* Stats Overview */}
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="stat-value">{stats?.totalAttacks || 0}</div>
              <div className="stat-label">Total Attacks Detected</div>
            </div>
            <FaBug className="card-icon" style={{ color: '#ff4757' }} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="stat-value">{stats?.topAttackers?.length || 0}</div>
              <div className="stat-label">Unique Attackers</div>
            </div>
            <FaShieldAlt className="card-icon" style={{ color: '#ffc107' }} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="stat-value">{stats?.byType?.length || 0}</div>
              <div className="stat-label">Attack Types</div>
            </div>
            <FaBug className="card-icon" style={{ color: '#00d4ff' }} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="stat-value">
                {stats?.bySeverity?.find(s => s._id === 'Critical')?.count || 0}
              </div>
              <div className="stat-label">Critical Severity</div>
            </div>
            <FaShieldAlt className="card-icon" style={{ color: '#ff7f50' }} />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        {/* Attack Types Distribution */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', color: '#00d4ff' }}>Attack Types Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.byType || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3561" />
              <XAxis 
                dataKey="_id" 
                stroke="#8b92a8"
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis stroke="#8b92a8" />
              <Tooltip 
                contentStyle={{ 
                  background: '#1a1f3a', 
                  border: '1px solid #2d3561',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="#ff4757" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Attacks Over Time */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', color: '#00d4ff' }}>Attacks Over Time (24h)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats?.attacksOverTime || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3561" />
              <XAxis 
                dataKey="_id" 
                stroke="#8b92a8"
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis stroke="#8b92a8" />
              <Tooltip 
                contentStyle={{ 
                  background: '#1a1f3a', 
                  border: '1px solid #2d3561',
                  borderRadius: '8px'
                }}
              />
              <Line type="monotone" dataKey="count" stroke="#00d4ff" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Attack Geolocation Map */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#00d4ff' }}>🌍 Attack Geolocation Map</h3>
        <AttackMap />
      </div>

      {/* Top Attackers */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#00d4ff' }}>Top Attackers</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>IP Address</th>
                <th>Attack Count</th>
                <th>Last Attack</th>
              </tr>
            </thead>
            <tbody>
              {stats?.topAttackers?.map((attacker, index) => (
                <tr key={index}>
                  <td><code>{attacker._id}</code></td>
                  <td><strong style={{ color: '#ff4757' }}>{attacker.count}</strong></td>
                  <td>{new Date(attacker.lastAttack).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attack Logs */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#00d4ff' }}>Recent Attack Logs</h3>
          <select 
            className="form-control" 
            style={{ width: '200px' }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="SQL Injection">SQL Injection</option>
            <option value="XSS">XSS</option>
            <option value="Credential Stuffing">Credential Stuffing</option>
            <option value="Path Traversal">Path Traversal</option>
            <option value="Command Injection">Command Injection</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Attack Type</th>
                <th>Source IP</th>
                <th>Target Endpoint</th>
                <th>Method</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttacks.map((attack) => (
                <tr key={attack._id}>
                  <td>{new Date(attack.timestamp).toLocaleString()}</td>
                  <td>
                    <span className="badge badge-medium">{attack.attackType}</span>
                  </td>
                  <td><code>{attack.sourceIp}</code></td>
                  <td><code>{attack.targetEndpoint}</code></td>
                  <td><strong>{attack.httpMethod}</strong></td>
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

      {/* Honeypot Endpoints Info */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#00d4ff' }}>🍯 Active Honeypot Endpoints</h3>
        <p style={{ color: '#b0b8c9', marginBottom: '1rem' }}>
          These fake endpoints are designed to attract and log malicious activity:
        </p>
        <ul style={{ color: '#8b92a8', paddingLeft: '1.5rem' }}>
          <li><code>POST /api/honeypot/admin/login</code> - Fake admin login</li>
          <li><code>GET /api/honeypot/config/database</code> - Fake database config</li>
          <li><code>GET /api/honeypot/backup</code> - Fake backup directory</li>
          <li><code>POST /api/honeypot/upload</code> - Fake file upload</li>
        </ul>
        <p style={{ color: '#00d4ff', marginTop: '1rem', fontSize: '0.9rem' }}>
          💡 All requests to these endpoints are automatically logged and analyzed for attack patterns.
        </p>
      </div>
    </div>
  );
};

export default Attacks;
