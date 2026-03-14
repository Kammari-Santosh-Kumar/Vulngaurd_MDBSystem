import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import Attacks from './pages/Attacks';
import HoneypotWebsite from './pages/HoneypotWebsite';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/attacks" element={<Attacks />} />
            <Route path="/honeypot" element={<HoneypotWebsite />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
