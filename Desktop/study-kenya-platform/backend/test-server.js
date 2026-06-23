const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

// Log every request
app.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.url}`);
    next();
});

// Root route
app.get('/', (req, res) => {
    res.json({
        message: '✅ Test server is running!',
        status: 'online',
        timestamp: new Date().toISOString(),
        path: req.path
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// API test
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'API test endpoint is working!',
        timestamp: new Date().toISOString()
    });
});

// Ping
app.get('/api/ping', (req, res) => {
    res.json({
        success: true,
        message: 'pong',
        timestamp: new Date().toISOString()
    });
});

// Universities mock data
app.get('/api/universities', (req, res) => {
    res.json([
        { id: 1, name: 'University of Nairobi', location: 'Nairobi' },
        { id: 2, name: 'Kenyatta University', location: 'Nairobi' },
        { id: 3, name: 'Strathmore University', location: 'Nairobi' }
    ]);
});

// Catch-all for any other route
app.get('*', (req, res) => {
    res.json({
        message: 'Route not found but server is running',
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Test server running on port ${PORT}`);
    console.log(`📡 Routes available:`);
    console.log(`   GET /`);
    console.log(`   GET /health`);
    console.log(`   GET /api/test`);
    console.log(`   GET /api/ping`);
    console.log(`   GET /api/universities`);
    console.log(`   GET /* (catch-all)`);
});
