import { useState } from 'react';
import './App.css';

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleScan = async () => {
    if (!repoUrl) return;
    
    setLoading(true);
    setError('');
    setResults(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Scan failed');
      
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header>
        <h1>SetupSherpa</h1>
        <p>GitHub Repository Setup Scanner</p>
      </header>

      <div className="scanner">
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter GitHub URL (https://github.com/username/repo)"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleScan()}
          />
          <button onClick={handleScan} disabled={loading || !repoUrl}>
            {loading ? 'Scanning...' : 'Scan'}
          </button>
        </div>
      </div>

      <div className="results">
        {loading && (
          <div className="loader">
            <div className="spinner"></div>
            <p>Analyzing repository...</p>
          </div>
        )}
        
        {error && (
          <div className="error">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {results && (
          <div className="results-container">
            <h2>Scan Results</h2>
            <p><strong>Repository:</strong> {results.repoUrl}</p>
            
            <div className="results-grid">
              {results.stack && results.stack.length > 0 && results.stack[0] !== 'None detected' && (
                <div className="result-card">
                  <h3>Tech Stack</h3>
                  <ul>
                    {results.stack.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {results.services && results.services.length > 0 && results.services[0] !== 'None detected' && (
                <div className="result-card">
                  <h3>Services Detected</h3>
                  <ul>
                    {results.services.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {results.envVars && results.envVars.length > 0 && results.envVars[0] !== 'None detected' && (
                <div className="result-card">
                  <h3>Environment Variables</h3>
                  <ul>
                    {results.envVars.map((item, idx) => (
                      <li key={idx}><code>{item}=your_value</code></li>
                    ))}
                  </ul>
                </div>
              )}
              
              {results.commands && results.commands.length > 0 && results.commands[0] !== 'None detected' && (
                <div className="result-card">
                  <h3>Setup Commands</h3>
                  <ul>
                    {results.commands.map((item, idx) => (
                      <li key={idx}><code>{item}</code></li>
                    ))}
                  </ul>
                </div>
              )}
              
              {results.missingFiles && results.missingFiles.length > 0 && results.missingFiles[0] !== 'None detected' && (
                <div className="result-card">
                  <h3>Consider Adding</h3>
                  <ul>
                    {results.missingFiles.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="timestamp">
              <small>Scanned at: {new Date(results.timestamp).toLocaleTimeString()}</small>
            </div>
          </div>
        )}
      </div>

      <footer>
        <p>Built for Vivitsu 2026 Hackathon | Uses Open Source Software</p>
      </footer>
    </div>
  );
}

export default App;