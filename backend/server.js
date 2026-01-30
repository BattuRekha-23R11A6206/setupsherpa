const express = require('express');
const cors = require('cors');
const { scanRepository } = require('./scanner');

const app = express();
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'SetupSherpa API is running!',
    endpoints: {
      scan: 'POST /api/scan',
      health: 'GET /health'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Main scanning endpoint
app.post('/api/scan', async (req, res) => {
  try {
    const { repoUrl } = req.body;
    
    if (!repoUrl) {
      return res.status(400).json({ 
        error: 'Repository URL is required',
        example: 'https://github.com/expressjs/express'
      });
    }

    console.log(`Scanning: ${repoUrl}`);
    
    // Scan the repository
    const results = await scanRepository(repoUrl);
    
    res.json({
      success: true,
      repoUrl,
      timestamp: new Date().toISOString(),
      ...results
    });
    
  } catch (error) {
    console.error(' Scan error:', error.message);
    res.status(500).json({ 
      success: false,
      error: error.message,
      suggestion: 'Make sure the repository URL is correct and public'
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` SetupSherpa backend running on http://localhost:${PORT}`);
  console.log(` Test with: curl -X POST http://localhost:${PORT}/api/scan -H "Content-Type: application/json" -d '{"repoUrl":"https://github.com/expressjs/express"}'`);
});