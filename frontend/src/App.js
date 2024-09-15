
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import Navigation from './components/Navigation';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;