// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ThreeIntro from './ThreeIntro';
import Overlay from './Overlay';
import Home from './Home';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Root route: displays ThreeIntro and Overlay */}
        <Route
          path="/"
          element={
            <div className="App">
              <ThreeIntro />
              <Overlay />
            </div>
          }
        />
        {/* New Home page route */}
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
