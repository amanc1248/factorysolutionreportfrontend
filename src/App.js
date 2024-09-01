import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import necessary components from react-router-dom
import './App.css';
import HomePage from './screens/HomePage/HomePage'; // Import HomePage component
import Login from './screens/LoginPage'; // Import Login component

function App() {
  return (
    <div className="App">
      {/* Wrap the application in Router to enable routing */}
      <Router>
        {/* Define Routes for your application */}
        <Routes>
          <Route path="/" element={<Login />} /> {/* Login page as default route */}
          <Route path="/home" element={<HomePage />} /> {/* Home page route */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
