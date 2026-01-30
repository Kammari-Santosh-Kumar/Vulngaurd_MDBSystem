import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaBug } from 'react-icons/fa';
import websocket from '../services/websocket';
import './LiveAttackFeed.css';

const LiveAttackFeed = () => {
  const [attacks, setAttacks] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newAttackCount, setNewAttackCount] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket
    websocket.connect();

    // Listen for new attacks
    const handleNewAttack = (attack) => {
      setAttacks(prev => [attack, ...prev].slice(0, 50)); // Keep last 50
      setNewAttackCount(prev => prev + 1);
      
      // Play sound notification
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }

      // Reset count after 3 seconds
      setTimeout(() => setNewAttackCount(0), 3000);
    };

    websocket.on('new-attack', handleNewAttack);

    return () => {
      websocket.off('new-attack', handleNewAttack);
    };
  }, []);

  const getSeverityColor = (severity) => {
    const colors = {
      'Critical': '#ff4757',
      'High': '#ff7f50',
      'Medium': '#ffc107',
      'Low': '#28a745'
    };
    return colors[severity] || '#8b92a8';
  };

  return (
    <>
      {/* Hidden audio element for notifications */}
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSsFJHfH8N2QQAoUXrTp66hVFA==" />

      {/* Floating Attack Feed Button */}
      <div className="live-feed-button" onClick={() => setIsExpanded(!isExpanded)}>
        <FaBell />
        {newAttackCount > 0 && (
          <span className="notification-badge pulse">{newAttackCount}</span>
        )}
      </div>

      {/* Expanded Feed Panel */}
      {isExpanded && (
        <div className="live-feed-panel">
          <div className="live-feed-header">
            <h3>🔴 Live Attack Feed</h3>
            <button onClick={() => setIsExpanded(false)}>×</button>
          </div>
          
          <div className="live-feed-content">
            {attacks.length === 0 ? (
              <div className="no-attacks">
                <FaBug />
                <p>No recent attacks</p>
              </div>
            ) : (
              attacks.map((attack, index) => (
                <div 
                  key={attack._id || index} 
                  className="attack-item"
                  style={{ borderLeftColor: getSeverityColor(attack.severity) }}
                >
                  <div className="attack-header">
                    <span className="attack-type">{attack.attackType}</span>
                    <span 
                      className="attack-severity"
                      style={{ color: getSeverityColor(attack.severity) }}
                    >
                      {attack.severity}
                    </span>
                  </div>
                  <div className="attack-details">
                    <span>IP: {attack.sourceIp}</span>
                    <span>{new Date(attack.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="attack-target">{attack.targetEndpoint}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default LiveAttackFeed;
