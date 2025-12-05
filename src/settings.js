const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

const SETTINGS_FILE = path.join(__dirname, '../data/settings.json');

// Default settings
const defaultSettings = {
    // Bot Information
    botName: "🐞 LADYBUG BETA",
    ownerName: "Knight Developer",
    ownerNumber: "263718456744",
    
    // Web Dashboard
    autoStart: true,
    port: 3000,
    
    // Bot Features
    publicMode: true,
    autoRead: false,
    autoTyping: true,
    alwaysOnline: true,
    autoBio: true,
    autoLikeStatus: true,
    autoViewStatus: true,
    
    // Anti-Ban Protection
    antiBanEnabled: true,
    maxMessagesPerMinute: 10,
    maxMessagesPerHour: 60,
    typingDelay: [2000, 5000],
    readingDelay: [500, 2000],
    
    // Welcome Messages
    groupWelcome: true,
    welcomeMessage: "👋 Welcome @user to @groupName! 🎉\n\n📜 *Group Rules:*\n• Be respectful to all members\n• No spamming or flooding\n• No inappropriate content\n• Enjoy your stay! 🐞",
    goodbyeMessage: "👋 Goodbye @user! We'll miss you! 💔",
    
    // Customization
    themeEmoji: "🐞",
    prefix: ".",
    themeColor: "#FF1744",
    
    // AI Settings
    aiEnabled: true,
    aiProvider: "openai", // openai, gemini, local
    aiApiKey: "",
    aiModel: "gpt-3.5-turbo",
    aiPersonality: "friendly",
    
    // Status Updates
    autoStatusUpdate: true,
    statusInterval: 3600000, // 1 hour in ms
    statusMessages: [
        "🐞 LADYBUG BETA - Advanced WhatsApp Bot",
        "🤖 AI Powered • 24/7 Online • Always Active",
        "💬 Smart Replies • Group Management • Fun Commands",
        "🔥 Serving users worldwide with premium features",
        "⚡ Fast • Secure • Reliable • User-Friendly"
    ],
    
    // Security
    allowedUsers: [],
    blockedUsers: [],
    
    // Commands
    disabledCommands: [],
    
    // Performance
    maxFileSize: 100, // MB
    enableCache: true,
    cacheDuration: 3600000, // 1 hour
    
    // Notifications
    errorNotifications: true,
    updateNotifications: true,
    
    // API Keys (encrypted)
    apis: {
        youtube: "",
        spotify: "",
        github: "",
        weather: ""
    }
};

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Read settings
function readSettings() {
    try {
        if (fs.existsSync(SETTINGS_FILE)) {
            const settings = fs.readJsonSync(SETTINGS_FILE);
            // Merge with defaults to ensure all properties exist
            return { ...defaultSettings, ...settings };
        } else {
            // Create default settings file
            fs.writeJsonSync(SETTINGS_FILE, defaultSettings, { spaces: 2 });
            return defaultSettings;
        }
    } catch (error) {
        console.error(chalk.red('❌ Error reading settings:'), error);
        return defaultSettings;
    }
}

// Update settings
function updateSettings(newSettings) {
    return new Promise((resolve, reject) => {
        try {
            const currentSettings = readSettings();
            const updatedSettings = { ...currentSettings, ...newSettings };
            
            fs.writeJsonSync(SETTINGS_FILE, updatedSettings, { spaces: 2 });
            
            // Update global variables
            Object.assign(global, updatedSettings);
            
            console.log(chalk.green('✅ Settings updated successfully'));
            resolve(updatedSettings);
        } catch (error) {
            console.error(chalk.red('❌ Error updating settings:'), error);
            reject(error);
        }
    });
}

// Reset settings to default
function resetSettings() {
    return new Promise((resolve, reject) => {
        try {
            fs.writeJsonSync(SETTINGS_FILE, defaultSettings, { spaces: 2 });
            console.log(chalk.green('✅ Settings reset to default'));
            resolve(defaultSettings);
        } catch (error) {
            console.error(chalk.red('❌ Error resetting settings:'), error);
            reject(error);
        }
    });
}

// Get specific setting
function getSetting(key) {
    const settings = readSettings();
    return settings[key];
}

// Set specific setting
function setSetting(key, value) {
    return new Promise((resolve, reject) => {
        try {
            const settings = readSettings();
            settings[key] = value;
            updateSettings(settings).then(resolve).catch(reject);
        } catch (error) {
            console.error(chalk.red('❌ Error setting value:'), error);
            reject(error);
        }
    });
}

// Export functions
module.exports = {
    readSettings,
    updateSettings,
    resetSettings,
    getSetting,
    setSetting,
    defaultSettings
};