const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const qrcode = require('qrcode');
require('dotenv').config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(require('helmet')({ contentSecurityPolicy: false }));
app.use(require('compression')());
app.use(require('cors')());
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

// Routes
app.get('/', (req, res) => {
    res.render('index', {
        status: connectionStatus,
        qrCode: qrCode,
        settings: {
            botName: process.env.BOT_NAME || 'LADYBUG BETA',
            ownerName: process.env.OWNER_NAME || 'Knight Developer',
            ownerNumber: process.env.OWNER_NUMBER || '263718456744',
            aiEnabled: process.env.AI_ENABLED === 'true'
        }
    });
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard', {
        settings: {
            botName: process.env.BOT_NAME || 'LADYBUG BETA',
            ownerName: process.env.OWNER_NAME || 'Knight Developer',
            ownerNumber: process.env.OWNER_NUMBER || '263718456744',
            aiEnabled: process.env.AI_ENABLED === 'true',
            autoTyping: process.env.AUTO_TYPING === 'true',
            alwaysOnline: process.env.ALWAYS_ONLINE === 'true',
            autoBio: process.env.AUTO_BIO === 'true',
            autoStatusUpdate: process.env.AUTO_STATUS_UPDATE === 'true',
            autoLikeStatus: process.env.AUTO_LIKE_STATUS === 'true',
            autoViewStatus: process.env.AUTO_VIEW_STATUS === 'true'
        },
        botStatus: connectionStatus
    });
});

app.post('/api/settings', async (req, res) => {
    try {
        // In production, save to database
        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/restart', async (req, res) => {
    try {
        connectionStatus = 'restarting';
        io.emit('status', { status: connectionStatus });
        
        // Restart bot (simplified)
        setTimeout(() => {
            connectionStatus = 'connected';
            io.emit('status', { status: connectionStatus });
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
        qrCode: qrCode
    });
});

// Socket.IO events
io.on('connection', (socket) => {
    console.log(chalk.cyan('🌐 New dashboard connection'));
    
    socket.emit('status', {
        status: connectionStatus,
        qrCode: qrCode
    });
    
    socket.on('start-bot', async () => {
        if (connectionStatus === 'connected') {
            socket.emit('error', 'Bot is already connected');
            return;
        }
        
        try {
            connectionStatus = 'connecting';
            io.emit('status', { status: connectionStatus });
            
            // Simulate bot connection
            setTimeout(() => {
                connectionStatus = 'connected';
                botInstance = { user: { name: 'LADYBUG BETA' } };
                io.emit('status', { status: connectionStatus, user: botInstance.user });
            }, 3000);
            
        } catch (error) {
            connectionStatus = 'error';
            io.emit('error', error.message);
        }
    });
    
    socket.on('stop-bot', async () => {
        botInstance = null;
        connectionStatus = 'disconnected';
        qrCode = null;
        io.emit('status', { status: connectionStatus });
    });
    
    socket.on('disconnect', () => {
        console.log(chalk.yellow('📡 Dashboard disconnected'));
    });
});

// Initialize server
function initializeServer() {
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
    
    // Auto-start if configured
    if (process.env.AUTO_START === 'true') {
        console.log(chalk.cyan('🚀 Auto-starting bot simulation...'));
        setTimeout(() => {
            connectionStatus = 'connected';
            botInstance = { user: { name: 'LADYBUG BETA' } };
            io.emit('status', { status: connectionStatus, user: botInstance.user });
        }, 3000);
    }
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
    process.exit(0);
});

module.exports = { app, server, io };