// src/components/Navigation.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Navigation() {
  const { token } = useSelector((state) => state.auth);

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold">Friend Finder</Link>
        <div>
          {token ? (
            <Link to="/" className="text-white hover:text-gray-300">Home</Link>
          ) : (
            <>
              <Link to="/login" className="text-white hover:text-gray-300 mr-4">Login</Link>
              <Link to="/signup" className="text-white hover:text-gray-300">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;