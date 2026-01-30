import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaShieldAlt, FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          <FaShieldAlt />
          VulnGuard Platform
        </Link>
        <ul className="navbar-links">
          <li>
            <Link 
              to="/" 
              className={location.pathname === '/' ? 'active' : ''}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link 
              to="/scanner" 
              className={location.pathname === '/scanner' ? 'active' : ''}
            >
              Scanner
            </Link>
          </li>
          <li>
            <Link 
              to="/attacks" 
              className={location.pathname === '/attacks' ? 'active' : ''}
            >
              Honeypot & Attacks
            </Link>
          </li>
          <li>
            <button 
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <FaSun /> : <FaMoon />}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
