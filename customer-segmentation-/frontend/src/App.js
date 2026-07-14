import React from 'react';
import './App.css';
import DashBoard from './components/DashBoard'; 
import 'bootstrap/dist/css/bootstrap.min.css'; 

function App() {
  return (
    <div className="bg-light min-vh-100">
      {/* Navbar section */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow">
        <div className="container justify-content-center">
          <h2 className="text-white fw-bold text-center m-3">
            📈 DataPulse - Multi-Model Customer Segmentation & Predictive Churn Dashboard
          </h2>          
        </div>
      </nav>

      {/* Main Form and Insight Area */}
      <DashBoard />
    </div>
  );
}

export default App;