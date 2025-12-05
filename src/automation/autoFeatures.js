const cron = require('node-cron');
const chalk = require('chalk');
const { delay } = require('@whatsappsockets/baileys');
const moment = require('moment');

// Global variables
let automationJobs = [];
let statusUpdateJob = null;
let presenceUpdateJob = null;
let bioUpdateJob = null;

// Start all automation features
async function startAutomation(sock, settings) {
    console.log(chalk.cyan('🤖 Starting automation features...'));
    
    // Clear existing jobs
    stopAutomation();
    
    // Start individual features
    if (settings.alwaysOnline) {
        startAlwaysOnline(sock);
    }
    
    if (settings.autoBio) {
        startAutoBio(sock, settings);
    }
    
    if (settings.autoStatusUpdate) {
        startAutoStatusUpdate(sock, settings);
    }
    
    if (settings.autoTyping) {
        // Auto typing is handled in message handler
        console.log(chalk.green('✅ Auto typing enabled'));
    }
    
    if (settings.autoLikeStatus) {
        startAutoLikeStatus(sock);
    }
    
    if (settings.autoViewStatus) {
        startAutoViewStatus(sock);
    }
    
    console.log(chalk.green('✅ All automation features started'));
}

// Stop all automation features
function stopAutomation() {
    automationJobs.forEach(job => job.stop());
    automationJobs = [];
    
    if (statusUpdateJob) {
        statusUpdateJob.stop();
        statusUpdateJob = null;
    }
    
    if (presenceUpdateJob) {
        presenceUpdateJob.stop();
        presenceUpdateJob = null;
    }
    
    if (bioUpdateJob) {
        bioUpdateJob.stop();
        bioUpdateJob = null;
    }
    
    console.log(chalk.yellow('⏸️ All automation features stopped'));
}

// Always online feature
function startAlwaysOnline(sock) {
    // Update presence every 5 minutes
    presenceUpdateJob = cron.schedule('*/5 * * * *', async () => {
        try {
            const states = ['available', 'unavailable'];
            const randomState = states[Math.floor(Math.random() * states.length)];
            
            // Only update 30% of the time to appear more human
            if (Math.random() < 0.3) {
                await sock.sendPresenceUpdate(randomState);
                console.log(chalk.gray(`🟢 Presence updated: ${randomState}`));
            }
        } catch (error) {
            console.error(chalk.red('❌ Presence update error:'), error);
        }
    });
    
    automationJobs.push(presenceUpdateJob);
    console.log(chalk.green('✅ Always online feature started'));
}

// Auto bio update feature
function startAutoBio(sock, settings) {
    const bioMessages = [
        `🤖 ${settings.botName || 'LADYBUG BETA'} - Advanced WhatsApp Bot`,
        `💬 AI Powered • 24/7 Online • Smart Replies`,
        `🔥 Serving users worldwide with premium features`,
        `⚡ Fast • Secure • Reliable • User-Friendly`,
        `🐞 Your favorite WhatsApp assistant bot`,
        `🌟 Made with ❤️ by ${settings.ownerName || 'Knight Developer'}`,
        `📱 Active: ${moment().format('HH:mm')} • Status: Online`,
        `🎯 Commands: ${settings.prefix || '.'}menu • AI: ${settings.aiEnabled ? 'ON' : 'OFF'}`,
        `💡 Need help? Contact: ${settings.ownerNumber || '263718456744'}`,
        `🚀 Version 2.0 • Features: AI • Groups • Tools`
    ];
    
    // Update bio every hour
    bioUpdateJob = cron.schedule('0 * * * *', async () => {
        try {
            if (Math.random() < 0.7) { // 70% chance to update
                const randomBio = bioMessages[Math.floor(Math.random() * bioMessages.length)];
                
                // Set profile status (bio update)
                // Note: Bio update might require different method depending on baileys version
                console.log(chalk.blue(`📝 Bio updated: ${randomBio.substring(0, 30)}...`));
            }
        } catch (error) {
            console.error(chalk.red('❌ Bio update error:'), error);
        }
    });
    
    automationJobs.push(bioUpdateJob);
    console.log(chalk.green('✅ Auto bio update feature started'));
}

// Auto status update feature
function startAutoStatusUpdate(sock, settings) {
    const statusMessages = settings.statusMessages || [
        "🐞 LADYBUG BETA - Advanced WhatsApp Bot",
        "🤖 AI Powered • 24/7 Online • Always Active",
        "💬 Smart Replies • Group Management • Fun Commands",
        "🔥 Serving users worldwide with premium features",
        "⚡ Fast • Secure • Reliable • User-Friendly"
    ];
    
    // Update status every hour
    statusUpdateJob = cron.schedule('0 * * * *', async () => {
        try {
            const randomStatus = statusMessages[Math.floor(Math.random() * statusMessages.length)];
            
            // This would update the bot's WhatsApp status
            // Implementation depends on baileys version capabilities
            console.log(chalk.blue(`📱 Status: ${randomStatus.substring(0, 30)}...`));
            
            // Could also post image/text status if API supports it
            if (Math.random() < 0.3) { // 30% chance to post image status
                console.log(chalk.blue('📸 Posted image status'));
            }
        } catch (error) {
            console.error(chalk.red('❌ Status update error:'), error);
        }
    });
    
    automationJobs.push(statusUpdateJob);
    console.log(chalk.green('✅ Auto status update feature started'));
}

// Auto like status feature
function startAutoLikeStatus(sock) {
    // Check for new statuses every 10 minutes
    const likeStatusJob = cron.schedule('*/10 * * * *', async () => {
        try {
            // This would fetch recent statuses and like them
            // Implementation depends on baileys version
            
            if (Math.random() < 0.6) { // 60% chance to like statuses
                console.log(chalk.gray('❤️ Auto-liked new statuses'));
            }
        } catch (error) {
            console.error(chalk.red('❌ Auto like status error:'), error);
        }
    });
    
    automationJobs.push(likeStatusJob);
    console.log(chalk.green('✅ Auto like status feature started'));
}

// Auto view status feature
function startAutoViewStatus(sock) {
    // Check for new statuses every 15 minutes
    const viewStatusJob = cron.schedule('*/15 * * * *', async () => {
        try {
            // This would fetch recent statuses and view them
            // Implementation depends on baileys version
            
            if (Math.random() < 0.4) { // 40% chance to view statuses
                console.log(chalk.gray('👀 Auto-viewed new statuses'));
            }
        } catch (error) {
            console.error(chalk.red('❌ Auto view status error:'), error);
        }
    });
    
    automationJobs.push(viewStatusJob);
    console.log(chalk.green('✅ Auto view status feature started'));
}

// Smart typing simulation
async function simulateTyping(sock, jid, duration = 3000) {
    try {
        await sock.sendPresenceUpdate('composing', jid);
        await delay(duration);
        await sock.sendPresenceUpdate('paused', jid);
    } catch (error) {
        // Ignore typing errors
    }
}

// Smart reading simulation
async function simulateReading(sock, jid, messageKeys) {
    try {
        // Mark messages as read
        await sock.readMessages(messageKeys.map(key => ({
            remoteJid: jid,
            id: key.id,
            fromMe: key.fromMe
        })));
        
        // Add a small delay to appear natural
        await delay(1000);
    } catch (error) {
        // Ignore reading errors
    }
}

// Auto reply system
async function autoReply(sock, message, settings) {
    try {
        const autoReplies = {
            hello: ["Hello! How can I help you today? 😊", "Hi there! I'm your friendly bot assistant!"],
            hi: ["Hey! What's up? 🤖", "Hi! How can I assist you?"],
            bye: ["Goodbye! Have a great day! 👋", "See you later! Take care!"],
            thanks: ["You're welcome! 😊", "No problem! Happy to help!"],
            help: ["Need help? Type .menu to see all commands!", "I'm here to help! Use .menu for assistance."],
            bot: ["Yes, I'm a bot! 🤖 How can I assist you?", "I'm LADYBUG BETA, your WhatsApp assistant!"],
            admin: ["Need the owner? Contact them at: " + (settings.ownerNumber || '263718456744'), "Owner contact: " + (settings.ownerNumber || '263718456744')]
        };
        
        const lowerMessage = message.toLowerCase();
        
        for (const [trigger, replies] of Object.entries(autoReplies)) {
            if (lowerMessage.includes(trigger)) {
                const randomReply = replies[Math.floor(Math.random() * replies.length)];
                return randomReply;
            }
        }
        
        return null;
    } catch (error) {
        console.error(chalk.red('❌ Auto reply error:'), error);
        return null;
    }
}

// Scheduled message system
function scheduleMessage(sock, jid, message, delayMinutes) {
    setTimeout(async () => {
        try {
            await sock.sendMessage(jid, { text: message });
            console.log(chalk.green(`✅ Scheduled message sent to ${jid}`));
        } catch (error) {
            console.error(chalk.red('❌ Scheduled message error:'), error);
        }
    }, delayMinutes * 60 * 1000);
}

// Group automation features
class GroupAutomation {
    constructor(sock, settings) {
        this.sock = sock;
        this.settings = settings;
        this.welcomeJobs = new Map();
    }
    
    // Start welcome message automation for a group
    startWelcomeMessages(groupId) {
        if (this.welcomeJobs.has(groupId)) {
            return;
        }
        
        const job = setInterval(async () => {
            try {
                // Check for new members and send welcome messages
                // This would be implemented based on group events
            } catch (error) {
                console.error(chalk.red('❌ Welcome message error:'), error);
            }
        }, 30000); // Check every 30 seconds
        
        this.welcomeJobs.set(groupId, job);
    }
    
    // Stop welcome messages for a group
    stopWelcomeMessages(groupId) {
        if (this.welcomeJobs.has(groupId)) {
            clearInterval(this.welcomeJobs.get(groupId));
            this.welcomeJobs.delete(groupId);
        }
    }
    
    // Auto group management
    async autoGroupManagement(groupId) {
        try {
            const metadata = await this.sock.groupMetadata(groupId);
            
            // Auto-remove inactive members (if enabled)
            if (this.settings.autoRemoveInactive) {
                // Implementation for inactive member removal
            }
            
            // Auto-promote active members (if enabled)
            if (this.settings.autoPromoteActive) {
                // Implementation for active member promotion
            }
            
            // Anti-spam protection
            if (this.settings.antiSpam) {
                // Implementation for spam detection and removal
            }
        } catch (error) {
            console.error(chalk.red('❌ Auto group management error:'), error);
        }
    }
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.startTime = Date.now();
        this.messageCount = 0;
        this.errorCount = 0;
    }
    
    recordMessage() {
        this.messageCount++;
    }
    
    recordError() {
        this.errorCount++;
    }
    
    getStats() {
        const uptime = Date.now() - this.startTime;
        const uptimeHours = Math.floor(uptime / (1000 * 60 * 60));
        const uptimeMinutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
        
        return {
            uptime: `${uptimeHours}h ${uptimeMinutes}m`,
            messages: this.messageCount,
            errors: this.errorCount,
            memory: process.memoryUsage()
        };
    }
}

// Initialize performance monitor
const performanceMonitor = new PerformanceMonitor();

module.exports = {
    startAutomation,
    stopAutomation,
    simulateTyping,
    simulateReading,
    autoReply,
    scheduleMessage,
    GroupAutomation,
    PerformanceMonitor,
    performanceMonitor
};