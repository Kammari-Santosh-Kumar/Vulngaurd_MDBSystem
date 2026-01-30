import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap, CircleMarker, Popup } from 'react-leaflet';
import { attackAPI } from '../services/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import leaflet.heat
let HeatmapOverlay;
try {
  require('leaflet.heat');
  HeatmapOverlay = L.heatLayer;
  console.log('✅ leaflet.heat loaded successfully');
} catch (e) {
  console.error('❌ leaflet.heat failed to load:', e);
}

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Demo data for India
const DEMO_ATTACKS = [
 
  { geolocation: { ll: [17.3850, 78.4867], city: 'Hyderabad', country: 'India' }, severity: 'Medium', attackType: 'Port Scan', sourceIp: '192.168.1.5' },
  
];

// Helper to validate coordinates
const isValidCoordinate = (lat, lng) => {
  return (
    lat !== undefined && 
    lng !== undefined && 
    lat !== null && 
    lng !== null &&
    !isNaN(lat) && 
    !isNaN(lng) &&
    lat >= -90 && 
    lat <= 90 && 
    lng >= -180 && 
    lng <= 180
  );
};

// Heatmap Layer Component
const HeatmapLayer = ({ attacks }) => {
  const map = useMap();
  const heatLayerRef = useRef(null);

  useEffect(() => {
    console.log('🔥 HeatmapLayer rendering with', attacks.length, 'attacks');
    
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (attacks.length > 0 && HeatmapOverlay) {
      const heatData = [];
      let invalidCount = 0;
      
      attacks.forEach(attack => {
        if (!attack.geolocation || !attack.geolocation.ll) {
          invalidCount++;
          return;
        }

        const lat = attack.geolocation.ll[0];
        const lng = attack.geolocation.ll[1];
        
        // Validate coordinates
        if (!isValidCoordinate(lat, lng)) {
          console.warn(`⚠️ Invalid coordinates: [${lat}, ${lng}] for ${attack.geolocation.city}`);
          invalidCount++;
          return;
        }
        
        // Add multiple points for stronger heat effect
        for (let i = 0; i < 5; i++) {
          heatData.push([lat, lng, 1.0]);
        }
      });

      if (invalidCount > 0) {
        console.warn(`⚠️ Skipped ${invalidCount} attacks with invalid coordinates`);
      }

      console.log(`🔥 Creating heatmap with ${heatData.length} heat points (from ${attacks.length - invalidCount} valid attacks)`);

      if (heatData.length > 0) {
        const heatLayer = HeatmapOverlay(heatData, {
          radius: 80,
          blur: 40,
          maxZoom: 17,
          max: 1.0,
          minOpacity: 0.7,
          gradient: {
            0.0: 'rgba(0, 0, 255, 0.8)',
            0.2: 'rgba(0, 255, 255, 0.85)',
            0.4: 'rgba(0, 255, 0, 0.9)',
            0.6: 'rgba(255, 255, 0, 0.95)',
            0.8: 'rgba(255, 128, 0, 0.98)',
            1.0: 'rgba(255, 0, 0, 1.0)'
          }
        });

        heatLayer.addTo(map);
        heatLayerRef.current = heatLayer;
        console.log('✅ Heatmap layer added to map');
      } else {
        console.error('❌ No valid coordinates to display');
      }
    }

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [attacks, map]);

  return null;
};

// Attack Markers Component
const AttackMarkers = ({ attacks }) => {
  // Filter to only valid coordinates
  const validAttacks = attacks.filter(attack => {
    if (!attack.geolocation || !attack.geolocation.ll) return false;
    const lat = attack.geolocation.ll[0];
    const lng = attack.geolocation.ll[1];
    return isValidCoordinate(lat, lng);
  });

  return (
    <>
      {validAttacks.map((attack, index) => (
        <CircleMarker
          key={index}
          center={[attack.geolocation.ll[0], attack.geolocation.ll[1]]}
          radius={15}
          fillColor="#ff0000"
          fillOpacity={0.8}
          color="#ff4757"
          weight={3}
        >
          <Popup>
            <div style={{ color: '#000' }}>
              <strong>{attack.attackType}</strong><br />
              <strong>Severity:</strong> {attack.severity}<br />
              <strong>IP:</strong> {attack.sourceIp}<br />
              <strong>Location:</strong> {attack.geolocation.city || 'Unknown'}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
};

const AttackMap = () => {
  const [attacks, setAttacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [useDemoData, setUseDemoData] = useState(false);
  const [filterCountry, setFilterCountry] = useState('India');
  const [availableCountries, setAvailableCountries] = useState([]);

  useEffect(() => {
    fetchAttacks();
    const interval = setInterval(fetchAttacks, 30000);
    return () => clearInterval(interval);
  }, [filterCountry, useDemoData]);

  const fetchAttacks = async () => {
    try {
      console.log('📡 Fetching attacks...');
      
      if (useDemoData) {
        console.log('📊 Using DEMO data with', DEMO_ATTACKS.length, 'attacks');
        setAttacks(DEMO_ATTACKS);
        setAvailableCountries(['India (Demo)']);
        setLoading(false);
        return;
      }

      const response = await attackAPI.getAllAttacks({ limit: 100 });
      console.log('📦 Total attacks fetched:', response.data.length);
      
      // Get all unique countries
      const countries = [...new Set(response.data
        .filter(a => a.geolocation && a.geolocation.country)
        .map(a => a.geolocation.country))];
      
      console.log('🌍 Available countries:', countries);
      setAvailableCountries(countries);
      
      let attacksWithGeo;
      
      if (filterCountry) {
        attacksWithGeo = response.data.filter(
          a => a.geolocation && 
          a.geolocation.ll && 
          Array.isArray(a.geolocation.ll) &&
          a.geolocation.ll.length === 2 &&
          isValidCoordinate(a.geolocation.ll[0], a.geolocation.ll[1]) &&
          a.geolocation.country === filterCountry
        );
        console.log(`📊 Found ${attacksWithGeo.length} valid attacks in ${filterCountry}`);
      } else {
        attacksWithGeo = response.data.filter(
          a => a.geolocation && 
          a.geolocation.ll &&
          Array.isArray(a.geolocation.ll) &&
          a.geolocation.ll.length === 2 &&
          isValidCoordinate(a.geolocation.ll[0], a.geolocation.ll[1])
        );
        console.log(`📊 Found ${attacksWithGeo.length} valid attacks globally`);
      }
      
      setAttacks(attacksWithGeo);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching attacks:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center', color: 'white' }}>Loading map...</div>;
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ height: '500px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #2d3561' }}>
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          {attacks.length > 0 && <HeatmapLayer attacks={attacks} />}
          {attacks.length > 0 && showMarkers && <AttackMarkers attacks={attacks} />}
        </MapContainer>
      </div>
      
      {/* Controls */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '14px 18px',
        borderRadius: '8px',
        zIndex: 1000,
        fontSize: '14px',
        border: attacks.length > 0 ? '2px solid #ff4757' : '2px solid #666',
        minWidth: '200px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: attacks.length > 0 ? '#ff4757' : '#666', fontSize: '16px' }}>
          {attacks.length > 0 ? '🚨' : '⚠️'} Attacks: {attacks.length}
        </div>
        
        <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '12px', borderBottom: '1px solid #444', paddingBottom: '8px' }}>
          📍 {useDemoData ? 'India (Demo)' : (filterCountry || 'Global View')}
        </div>
        
        {!useDemoData && availableCountries.length > 0 && (
          <div style={{ fontSize: '11px', marginBottom: '12px', opacity: 0.8, maxHeight: '60px', overflow: 'auto' }}>
            <strong>Countries in DB:</strong><br />
            {availableCountries.join(', ')}
          </div>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            onClick={() => setShowMarkers(!showMarkers)}
            style={{
              background: showMarkers ? '#ff4757' : '#2d3561',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            {showMarkers ? '🔴 Hide Markers' : '⚪ Show Markers'}
          </button>
          
          <button 
            onClick={() => {
              setUseDemoData(!useDemoData);
            }}
            style={{
              background: useDemoData ? '#ffa502' : '#2d3561',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            {useDemoData ? '📊 Demo Mode ON' : '📡 Use Demo Data'}
          </button>
          
          <button 
            onClick={() => {
              setFilterCountry(filterCountry === 'India' ? null : 'India');
            }}
            disabled={useDemoData}
            style={{
              background: filterCountry && !useDemoData ? '#2ed573' : '#2d3561',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: useDemoData ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              opacity: useDemoData ? 0.5 : 1
            }}
          >
            {filterCountry ? `🇮🇳 India Only` : '🌍 Show All'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttackMap;