const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs-extra');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const chalk = require('chalk');
const qrcode = require('qrcode');
const crypto = require('crypto');

// Import bot initialization
const { startBot } = require('./src/bot');
const { readSettings, updateSettings } = require('./src/settings');

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(helmet({
    contentSecurityPolicy: false
}));
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Global variables
let botInstance = null;
let connectionStatus = 'disconnected';
let qrCode = null;
let pairingCode = null;

// Routes
app.get('/', (req, res) => {
    res.render('index', {
        status: connectionStatus,
        qrCode: qrCode,
        pairingCode: pairingCode,
        settings: readSettings()
    });
});

app.get('/dashboard', (req, res) => {
    const settings = readSettings();
    res.render('dashboard', {
        settings: settings,
        botStatus: connectionStatus
    });
});

app.post('/api/settings', async (req, res) => {
    try {
        const newSettings = req.body;
        await updateSettings(newSettings);
        
        // Update bot settings if running
        if (botInstance && botInstance.user) {
            Object.assign(global, newSettings);
        }
        
        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/restart', async (req, res) => {
    try {
        if (botInstance) {
            await botInstance.logout();
            botInstance = null;
        }
        
        connectionStatus = 'restarting';
        io.emit('status', { status: connectionStatus });
        
        setTimeout(async () => {
            botInstance = await startBot(io);
        }, 2000);
        
        res.json({ success: true, message: 'Bot restarting...' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/status', (req, res) => {
    res.json({
        status: connectionStatus,
        connected: botInstance && botInstance.user ? true : false,
        user: botInstance?.user || null,
        qrCode: qrCode,
        pairingCode: pairingCode
    });
});

// Socket.IO events
io.on('connection', (socket) => {
    console.log(chalk.cyan('🌐 New dashboard connection'));
    
    socket.emit('status', {
        status: connectionStatus,
        qrCode: qrCode,
        pairingCode: pairingCode
    });
    
    socket.on('start-bot', async () => {
        if (connectionStatus === 'connected') {
            socket.emit('error', 'Bot is already connected');
            return;
        }
        
        try {
            connectionStatus = 'connecting';
            io.emit('status', { status: connectionStatus });
            
            botInstance = await startBot(io);
        } catch (error) {
            connectionStatus = 'error';
            io.emit('error', error.message);
        }
    });
    
    socket.on('stop-bot', async () => {
        if (botInstance) {
            try {
                await botInstance.logout();
                botInstance = null;
                connectionStatus = 'disconnected';
                qrCode = null;
                pairingCode = null;
                io.emit('status', { status: connectionStatus });
            } catch (error) {
                io.emit('error', error.message);
            }
        }
    });
    
    socket.on('disconnect', () => {
        console.log(chalk.yellow('📡 Dashboard disconnected'));
    });
});

// Function to update connection status
function updateStatus(status, data = {}) {
    connectionStatus = status;
    
    if (data.qr) {
        qrCode = data.qr;
    }
    
    if (data.pairingCode) {
        pairingCode = data.pairingCode;
    }
    
    io.emit('status', {
        status: connectionStatus,
        qrCode: qrCode,
        pairingCode: pairingCode,
        user: data.user || null
    });
}

// Initialize bot on server start
async function initializeServer() {
    console.log(chalk.magenta(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║        🐞 LADYBUG BETA WEB DASHBOARD 🐞              ║
║                                                       ║
║     Advanced WhatsApp Bot with Web Interface         ║
║                                                       ║
║  • Web Dashboard for Management                      ║
║  • QR & Pairing Code Support                         ║
║  • Real-time Status Monitoring                       ║
║  • Easy Settings Configuration                       ║
║  • Render.com Ready                                  ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `));
    
    // Auto-start bot if configured
    const settings = readSettings();
    if (settings.autoStart) {
        console.log(chalk.cyan('🚀 Auto-starting bot...'));
        setTimeout(async () => {
            try {
                botInstance = await startBot(io, updateStatus);
            } catch (error) {
                console.error(chalk.red('❌ Auto-start failed:'), error);
                connectionStatus = 'error';
                updateStatus('error');
            }
        }, 3000);
    }
    
    // Make updateStatus globally available
    global.updateWebStatus = updateStatus;
}

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(chalk.green(`🌐 Server running on port ${PORT}`));
    console.log(chalk.cyan(`📱 Dashboard: http://localhost:${PORT}`));
    console.log(chalk.yellow(`🔗 Public URL: https://knight-bot-paircode.onrender.com/`));
    
    initializeServer();
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log(chalk.yellow('\n👋 Shutting down gracefully...'));
    
    if (botInstance) {
        try {
            await botInstance.logout();
        } catch (error) {
            console.error('Error during shutdown:', error);
        }
    }
    
    process.exit(0);
});

module.exports = { app, server, io };