import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaShieldAlt } from 'react-icons/fa';

const Navbar = () => {
  const location = useLocation();

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
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
