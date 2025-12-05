const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason, delay } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const qrcode = require('qrcode');
const { readSettings } = require('./settings');
const { handleMessages, handleGroupUpdate, handleStatusUpdate } = require('./handlers/messageHandler');
const { startAutomation } = require('./automation/autoFeatures');

// Global variables
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// Enhanced Anti-Ban System
class AntiBanSystem {
    constructor() {
        this.messageRateLimiter = new Map();
        this.lastActivityTime = Date.now();
        this.messageCount = 0;
        this.behaviorMonitor = {
            lastMessageTime: Date.now(),
            messagePattern: [],
            suspiciousCount: 0
        };
    }

    canSendMessage(jid, settings) {
        const now = Date.now();
        const userLimits = this.messageRateLimiter.get(jid) || { 
            count: 0, 
            resetTime: now + 60000 
        };
        
        if (now > userLimits.resetTime) {
            this.messageRateLimiter.set(jid, { count: 1, resetTime: now + 60000 });
            return true;
        }
        
        if (userLimits.count >= settings.maxMessagesPerMinute) {
            console.log(chalk.yellow(`⏳ Rate limit for ${jid}`));
            return false;
        }
        
        userLimits.count++;
        this.messageRateLimiter.set(jid, userLimits);
        return true;
    }

    getRandomDelay(type = 'individual', settings) {
        const delays = {
            individual: settings.typingDelay,
            group: [settings.typingDelay[0] + 1000, settings.typingDelay[1] + 2000],
            reading: settings.readingDelay
        };
        
        const [min, max] = delays[type] || delays.individual;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    recordMessage() {
        const now = Date.now();
        this.behaviorMonitor.messagePattern.push(now);
        
        if (this.behaviorMonitor.messagePattern.length > 20) {
            this.behaviorMonitor.messagePattern.shift();
        }
        
        this.behaviorMonitor.lastMessageTime = now;
    }

    isSuspiciousBehavior() {
        if (this.behaviorMonitor.messagePattern.length < 5) return false;
        
        const intervals = [];
        for (let i = 1; i < this.behaviorMonitor.messagePattern.length; i++) {
            intervals.push(this.behaviorMonitor.messagePattern[i] - this.behaviorMonitor.messagePattern[i - 1]);
        }
        
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((sum, interval) => {
            return sum + Math.pow(interval - avgInterval, 2);
        }, 0) / intervals.length;
        
        if (avgInterval < 1500) {
            this.behaviorMonitor.suspiciousCount++;
            console.log(chalk.red('⚠️ Messages too fast!'));
            return true;
        }
        
        if (variance < 100000 && this.behaviorMonitor.messagePattern.length > 10) {
            this.behaviorMonitor.suspiciousCount++;
            console.log(chalk.red('⚠️ Bot-like pattern detected!'));
            return true;
        }
        
        return false;
    }

    async enforceBreak() {
        if (this.behaviorMonitor.suspiciousCount > 3) {
            console.log(chalk.red('🛑 Taking mandatory 5-minute break!'));
            this.behaviorMonitor.suspiciousCount = 0;
            this.behaviorMonitor.messagePattern = [];
            await delay(300000);
        } else if (this.behaviorMonitor.suspiciousCount > 0) {
            const breakTime = this.behaviorMonitor.suspiciousCount * 30000;
            console.log(chalk.yellow(`⏸️ Taking ${breakTime/1000}s break...`));
            await delay(breakTime);
        }
    }
}

// Main bot initialization function
async function startBot(io, updateStatus) {
    const settings = readSettings();
    const antiBan = new AntiBanSystem();
    
    try {
        console.log(chalk.blue('🔄 Initializing WhatsApp connection...'));
        
        const { version, isLatest } = await fetchLatestBaileysVersion();
        console.log(chalk.blue(`📱 Using WA version ${version}`));
        
        const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, '../session'));
        
        const sock = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false,
            browser: ["LadyBug Beta", "Chrome", "4.0.0"],
            auth: {
                creds: state.creds,
                keys: state.keys
            },
            markOnlineOnConnect: false,
            generateHighQualityLinkPreview: true,
            syncFullHistory: false,
            retryRequestDelayMs: 10000,
            maxMsgRetryCount: 3,
            shouldSyncHistoryMessage: () => false,
            downloadHistory: false,
            getMessage: async (key) => {
                return { conversation: 'hello' };
            }
        });

        // Save credentials
        sock.ev.on('creds.update', saveCreds);

        // Connection events
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                console.log(chalk.yellow('📱 QR Code generated'));
                const qrDataUrl = await qrcode.toDataURL(qr);
                
                if (io && updateStatus) {
                    updateStatus('qr', { qr: qrDataUrl });
                }
            }
            
            if (connection === 'connecting') {
                console.log(chalk.yellow('🔄 Connecting to WhatsApp...'));
                if (io && updateStatus) {
                    updateStatus('connecting');
                }
            }
            
            if (connection === 'open') {
                reconnectAttempts = 0;
                console.log(chalk.green('✅ Connected to WhatsApp!'));
                console.log(chalk.magenta(`🤖 Bot: ${sock.user.name || sock.user.id}`));
                
                // Set global variables
                global.bot = sock;
                global.antiBan = antiBan;
                global.settings = settings;
                
                // Start automation features
                await startAutomation(sock, settings);
                
                if (io && updateStatus) {
                    updateStatus('connected', { user: sock.user });
                }
                
                // Gradually come online
                setTimeout(async () => {
                    try {
                        await sock.sendPresenceUpdate('available');
                        console.log(chalk.green('🟢 Bot is now online'));
                    } catch (e) {}
                }, 10000);
            }
            
            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                
                console.log(chalk.red(`❌ Connection closed: ${statusCode}`));
                
                if (statusCode === DisconnectReason.loggedOut) {
                    console.log(chalk.red('🔒 Session logged out'));
                    if (io && updateStatus) {
                        updateStatus('logged_out');
                    }
                    return;
                }
                
                if (shouldReconnect) {
                    reconnectAttempts++;
                    if (reconnectAttempts <= MAX_RECONNECT_ATTEMPTS) {
                        const waitTime = Math.min(10000 * reconnectAttempts, 60000);
                        console.log(chalk.yellow(`🔄 Reconnecting in ${waitTime/1000}s... (Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`));
                        await delay(waitTime);
                        startBot(io, updateStatus);
                    } else {
                        console.log(chalk.red('❌ Max reconnection attempts reached'));
                        if (io && updateStatus) {
                            updateStatus('error');
                        }
                    }
                }
            }
        });

        // Enhanced message handling
        sock.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                const mek = chatUpdate.messages[0];
                if (!mek.message) return;
                
                mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') 
                    ? mek.message.ephemeralMessage.message 
                    : mek.message;
                
                const chatId = mek.key.remoteJid;
                const isGroup = chatId?.endsWith('@g.us');
                
                // Anti-ban checks
                if (settings.antiBanEnabled) {
                    if (!antiBan.canSendMessage(chatId, settings)) {
                        return;
                    }
                    
                    antiBan.recordMessage();
                    
                    if (antiBan.isSuspiciousBehavior()) {
                        await antiBan.enforceBreak();
                    }
                    
                    // Simulate reading
                    await delay(antiBan.getRandomDelay('reading', settings));
                    
                    // Simulate typing
                    if (settings.autoTyping) {
                        try {
                            await sock.sendPresenceUpdate('composing', chatId);
                            await delay(antiBan.getRandomDelay('individual', settings));
                            await sock.sendPresenceUpdate('paused', chatId);
                        } catch (e) {}
                    }
                }
                
                // Handle message
                await handleMessages(sock, chatUpdate, mek, antiBan);
                
            } catch (error) {
                console.error('❌ Message handling error:', error);
            }
        });

        // Group participants update
        sock.ev.on('group-participants.update', async (update) => {
            await handleGroupUpdate(sock, update, settings);
        });

        // Status updates
        sock.ev.on('messages.reaction', async (reaction) => {
            if (settings.autoLikeStatus) {
                await handleStatusUpdate(sock, reaction);
            }
        });

        // Enhanced send message with anti-ban
        const originalSendMessage = sock.sendMessage.bind(sock);
        sock.sendMessage = async (jid, content, options = {}) => {
            try {
                if (settings.antiBanEnabled) {
                    await delay(antiBan.getRandomDelay(jid.endsWith('@g.us') ? 'group' : 'individual', settings));
                }
                
                return await originalSendMessage(jid, content, options);
            } catch (error) {
                console.error('❌ Send message error:', error);
                throw error;
            }
        };

        return sock;
        
    } catch (error) {
        console.error(chalk.red('❌ Bot initialization failed:'), error);
        if (io && updateStatus) {
            updateStatus('error', { error: error.message });
        }
        throw error;
    }
}

// Pairing code generation
async function generatePairingCode(phoneNumber) {
    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    
    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        auth: {
            creds: state.creds,
            keys: state.keys
        },
        mobile: true
    });

    if (!sock.authState.creds.registered) {
        const code = await sock.requestPairingCode(phoneNumber);
        return code?.match(/.{1,4}/g)?.join("-") || code;
    }
    
    throw new Error('Already registered');
}

module.exports = {
    startBot,
    generatePairingCode,
    AntiBanSystem
};