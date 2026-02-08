import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Scans API
export const scanAPI = {
  startScan: (targetUrl, scanType = 'Quick', scanMethod = 'Nmap') => 
    api.post('/scans', { targetUrl, scanType, scanMethod }),
  
  getAllScans: () => 
    api.get('/scans'),
  
  getScanById: (id) => 
    api.get(`/scans/${id}`),
  
  getScanStats: () => 
    api.get('/scans/stats/overview'),
};
// Vulnerabilities API
export const vulnerabilityAPI = {
  getAllVulnerabilities: (params = {}) => 
    api.get('/vulnerabilities', { params }),
  
  getVulnerabilityById: (id) => 
    api.get(`/vulnerabilities/${id}`),
  
  updateVulnerability: (id, status) => 
    api.patch(`/vulnerabilities/${id}`, { status }),
  
  getVulnerabilityStats: () => 
    api.get('/vulnerabilities/stats/summary'),
};

// Attacks API
export const attackAPI = {
  getAllAttacks: (params = {}) => 
    api.get('/attacks', { params }),
  
  getAttackById: (id) => 
    api.get(`/attacks/${id}`),
  
  getAttackStats: () => 
    api.get('/attacks/stats'),
};

export default api;
