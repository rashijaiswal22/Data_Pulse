import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  // --- States ---
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form Inputs for single prediction
  const [formData, setFormData] = useState({ tenure: '', MonthlyCharges: '', TotalCharges: '' });
  const [prediction, setPrediction] = useState(null);
  const [predictLoading, setPredictLoading] = useState(false);

  // Filters state (Sidebar/Top placement)
  const [selectedCluster, setSelectedCluster] = useState('All');
  const filteredClusterData = selectedCluster === 'All' ? analytics?.clusterData : analytics?.clusterData.filter(c => c.name.includes(selectedCluster));
  const getFilteredKPI = (key, originalValue) => {
    if (selectedCluster === 'All') return originalValue;
    if (selectedCluster === 'Budget') {
      if (key === 'totalCustomers') return 2500;
      if (key === 'avgMonthlyCharges') return 28.6;
      if (key === 'avgTenure') return '13.2 Mos';
      if (key === 'churnRate') return '40.2';
    }
    if (selectedCluster === 'VIP') {
      if (key === 'totalCharges') return 1800;
      if (key === 'avgMonthlyCharges') return 89.1;
      if (key === 'avgTenure') return '58.4 Mos';
      if (key === 'churnRate') return '7.5'
    }
    if (selectedCluster === 'Saver') {
    if (key === 'totalCustomers') return 2743;
    if (key === 'avgMonthlyCharges') return 26.5;
    if (key === 'avgTenure') return "29.1 Mos";
    if (key === 'churnRate') return "15.8";
  }
  return originalValue;
  };

  const COLORS = ['#982eb3', '#f36a34', '#45c549' ,'#ee49a9'];

  // --- Fetch Analytics Data on Load ---
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/analytics')
      .then((res) => res.json())
      .then((data) => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching analytics:", err);
        setLoading(false);
      });
  }, []);

  // --- Auto-Fill Total Charges Logic ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if ((name === 'tenure' || name === 'MonthlyCharges') && updated.tenure && updated.MonthlyCharges) {
        updated.TotalCharges = (parseFloat(updated.tenure) * parseFloat(updated.MonthlyCharges)).toFixed(2);
      }
      return updated;
    });
  };

  // --- Submit Single Prediction ---
  const handlePredict = async (e) => {
    e.preventDefault();
    setPredictLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenure: parseInt(formData.tenure), MonthlyCharges: parseFloat(formData.MonthlyCharges),TotalCharges: parseFloat(formData.TotalCharges),
        }),
      });
      const data = await response.json();
      setPrediction(data);
    } catch (error) {
      console.error("Prediction failed:", error);
    } finally {
      setPredictLoading(false);
    }
  };

  if (loading) return <div className="text-center my-5"><h3>Loading Corporate Dashboard Data...</h3></div>;

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
        
        {/* --- Filters Section --- */}
        <div className="d-flex align-items-center gap-2">
          <label className="fw-semibold text-secondary">Filter Segment:</label>
          <select 
            className="form-select w-auto shadow-sm" 
            value={selectedCluster} 
            onChange={(e) => setSelectedCluster(e.target.value)}
          >
            <option value="All">Overall Summary</option>
            <option value="Budget">New / Budget Customer</option>
            <option value="VIP">VIP / Loyal Customer</option>
            <option value="Saver">Low-Cost Saver</option>
          </select>
        </div>
      </div>

      {/* --- 1. KPI Cards (Top Summary) --- */}
<div className="row g-3 mb-4">
  <div className="col-md-2">
    <div className="card shadow-sm border-0 bg-white p-3 text-center">
      <h6 className="text-muted text-uppercase mb-1" style={{ fontSize: '12px' }}>Total Customers</h6>
      <h3 className="fw-bold text-primary">{getFilteredKPI('totalCustomers', analytics?.kpis.totalCustomers)}</h3>
    </div>
  </div>
  <div className="col-md-2">
    <div className="card shadow-sm border-0 bg-white p-3 text-center">
      <h6 className="text-muted text-uppercase mb-1" style={{ fontSize: '12px' }}>Active Customers</h6>
      <h3 className="fw-bold text-success">
        {selectedCluster === 'All' ? analytics?.kpis.activeCustomers : Math.round(getFilteredKPI('totalCustomers', 7043) * (1 - getFilteredKPI('churnRate', 26)/100))}
      </h3>
    </div>
  </div>
  <div className="col-md-2">
    <div className="card shadow-sm border-0 bg-white p-3 text-center">
      <h6 className="text-muted text-uppercase mb-1" style={{ fontSize: '12px' }}>Churned Customers</h6>
      <h3 className="fw-bold text-danger">
        {selectedCluster === 'All' ? analytics?.kpis.churnCustomers : Math.round(getFilteredKPI('totalCustomers', 7043) * (getFilteredKPI('churnRate', 26)/100))}
      </h3>
    </div>
  </div>
  <div className="col-md-2">
    <div className="card shadow-sm border-0 bg-white p-3 text-center">
      <h6 className="text-muted text-uppercase mb-1" style={{ fontSize: '12px' }}>Churn Rate</h6>
      <h3 className="fw-bold text-warning">{getFilteredKPI('churnRate', analytics?.kpis.churnRate)}%</h3>
    </div>
  </div>
  <div className="col-md-2">
    <div className="card shadow-sm border-0 bg-white p-3 text-center">
      <h6 className="text-muted text-uppercase mb-1" style={{ fontSize: '12px' }}>Avg Monthly Charges</h6>
      <h3 className="fw-bold text-dark">${getFilteredKPI('avgMonthlyCharges', analytics?.kpis.avgMonthlyCharges)}</h3>
    </div>
  </div>
  <div className="col-md-2">
    <div className="card shadow-sm border-0 bg-white p-3 text-center">
      <h6 className="text-muted text-uppercase mb-1" style={{ fontSize: '12px' }}>Avg Tenure</h6>
      <h3 className="fw-bold text-info">
        {selectedCluster === 'All' ? `${analytics?.kpis.avgTenure} Mos` : getFilteredKPI('avgTenure', '')}
      </h3>
    </div>
  </div>
</div>

      {/* --- 2. Main Charts Grid --- */}
      <div className="row g-4 mb-4">
        {/* Churn Analytics (Pie Chart) */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-white p-3 h-100">
            <h5 className="fw-bold text-secondary mb-3">❌ Churn Analytics</h5>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={analytics?.churnAnalytics} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                  {analytics?.churnAnalytics.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cluster Visualization (Bar Chart) */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-white p-3 h-100">
            <h5 className="fw-bold text-secondary mb-3">👥 Segment Distribution</h5>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={filteredClusterData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#038bfa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Analysis Summary (Pie Chart) */}
        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-white p-3 h-100">
            <h5 className="fw-bold text-secondary mb-3">🗣️ Sentiment Analysis</h5>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={analytics?.sentimentSummary} cx="50%" cy="50%" outerRadius={85} label dataKey="value">
                  {analytics?.sentimentSummary.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Feature Importance */}
        <div className="col-md-6">
          <div className="card shadow-sm border-0 bg-white p-3 h-100">
            <h5 className="fw-bold text-secondary mb-3">🌲 Feature Importance</h5>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart layout="vertical" data={analytics?.featureImportance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="feature" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="importance" fill="#e9f541" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Performance */}
        <div className="col-md-6">
          <div className="card shadow-sm border-0 bg-white p-3 h-100">
            <h5 className="fw-bold text-secondary mb-3">🎯 Model Evaluation Metrics</h5>
            <div className="row g-3 my-auto">
              {Object.entries(analytics?.modelPerformance || {}).map(([key, val]) => (
                <div className="col-6" key={key}>
                  <div className="p-3 border rounded bg-light text-center">
                    <span className="text-uppercase text-muted d-block small fw-semibold">{key.replace('_', ' ')}</span>
                    <h2 className="fw-bold text-dark m-0">{val}%</h2>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- 3. Interactive Prediction & Business Recommendation Section --- */}
      <div className="row g-4">
        <div className="col-md-5">
          <div className="card shadow-sm border-0 p-4 bg-white h-100">
            <h4 className="fw-bold text-primary mb-3">🔮 Live Churn Predictor</h4>
            <form onSubmit={handlePredict}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Tenure (Months)</label>
                <input type="number" className="form-control" name="tenure" value={formData.tenure} onChange={handleInputChange} placeholder="e.g. 12" required />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Monthly Charges ($)</label>
                <input type="number" step="0.01" className="form-control" name="MonthlyCharges" value={formData.MonthlyCharges} onChange={handleInputChange} placeholder="e.g. 65.50" required />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Total Charges ($) <span className="text-muted small">(Auto-Calculated)</span></label>
                <input type="number" step="0.01" className="form-control bg-light" name="TotalCharges" value={formData.TotalCharges} onChange={handleInputChange} placeholder="Auto-calculated from above" required />
              </div>
              <button type="submit" className="btn btn-primary w-100 fw-bold py-2 shadow-sm" disabled={predictLoading}>
                {predictLoading ? "Analyzing Data..." : " Predict Churn Risk "}
              </button>
            </form>
          </div>
        </div>

        {/* Dynamic Outputs, Sentiment and AI Recommendations */}
        <div className="col-md-7">
          <div className="card shadow-sm border-0 p-4 bg-white h-100">
            <h4 className="fw-bold text-secondary mb-3">📋 Risk Profile & Actionable Insights</h4>
            {prediction ? (
              <div>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <div className={`p-3 rounded border text-center ${prediction.churn === 'Yes' ? 'bg-danger-subtle border-danger text-danger' : 'bg-success-subtle border-success text-success'}`}>
                      <span className="small d-block text-uppercase fw-semibold">Churn Prediction</span>
                      <h4 className="fw-bold m-0">{prediction.churn === 'Yes' ? '⚠️ High Risk / Leaving' : '✅ Loyal / Staying'}</h4>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 rounded border text-center bg-light">
                      <span className="small d-block text-uppercase fw-semibold">Risk Probability Gauge</span>
                      {/* Probability Gauge Progress Bar */}
                      <div className="progress mt-2" style={{ height: '20px' }}>
                        <div 
                          className={`progress-bar progress-bar-striped progress-bar-animated ${prediction.churn === 'Yes' ? 'bg-danger' : 'bg-success'}`} 
                          style={{ width: `${prediction.churn_probability}%` }}
                        >
                          {prediction.churn_probability}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-3 border rounded p-3 bg-light">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold text-muted small text-uppercase">Segment Group:</span>
                    <span className="badge bg-primary px-3 py-2 fs-6">{prediction.customer_segment}</span>
                  </div>
                </div>

                {/* Sentiment Block */}
                <div className="mb-3 p-3 border rounded bg-white">
                  <span className="fw-bold text-muted small text-uppercase d-block mb-1">Customer Voice (NLP Sentiment):</span>
                  <p className="fst-italic text-dark mb-2">"{prediction.feedback_text}"</p>
                  <span className={`badge ${prediction.sentiment_label === 'Positive' ? 'bg-success' : 'bg-danger'}`}>
                    Sentiment Score: {prediction.sentiment_label}
                  </span>
                </div>

                {/* Business Recommendations */}
                <div className="p-3 rounded border" style={{ backgroundColor: '#fffde7', borderColor: '#fff59d' }}>
                  <h6 className="fw-bold text-warning-heading text-dark text-uppercase mb-2">💡 Recommended Retention Strategy:</h6>
                  <ul className="mb-0 ps-3 text-dark">
                    {prediction.recommendations.map((rec, i) => <li key={i} className="mb-1">{rec}</li>)}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-100 d-flex flex-column justify-content-center align-items-center text-muted">
                <p className="m-0">Enter values on the left and click 'Predict Churn Risk' to generate executive business reports and feedback summaries.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;