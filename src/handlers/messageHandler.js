const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const moment = require('moment');
const { aiChat } = require('../features/aiChat');
const { downloadMedia } = require('../utils/mediaDownloader');
const { getRandomFact, getQuote, getJoke } = require('../utils/fun');

// Command categories
const commandCategories = {
    main: ['menu', 'help', 'ping', 'status', 'owner'],
    owner: ['settings', 'broadcast', 'leaveall', 'join', 'block', 'unblock'],
    group: ['groupinfo', 'kick', 'promote', 'demote', 'tagall', 'hidetag', 'welcome', 'goodbye'],
    fun: ['meme', 'joke', 'quote', 'fact', 'roll', 'flip', 'rps'],
    tools: ['sticker', 'emoji', 'translate', 'weather', 'news', 'calculate'],
    media: ['play', 'ytmp3', 'ytmp4', 'img', 'wallpaper', 'gif'],
    ai: ['ai', 'chat', 'gpt', 'ask'],
    economy: ['balance', 'daily', 'work', 'gamble', 'shop', 'buy']
};

// Main message handler
async function handleMessages(sock, chatUpdate, mek, antiBan) {
    const settings = global.settings || {};
    const prefix = settings.prefix || '.';
    
    try {
        // Parse message
        const m = sock.serializeM ? sock.serializeM(mek) : mek;
        const body = m.body || '';
        const budy = (typeof m.text === 'string') ? m.text : '';
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(1).trim().split(' ')[0].toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(' ');
        
        const from = m.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const sender = m.key.fromMe ? sock.user.id.split(':')[0] : m.key.participant || from;
        const senderNumber = sender.replace('@s.whatsapp.net', '').replace('@s.whatsapp.net', '');
        
        // Check if command is disabled
        if (settings.disabledCommands && settings.disabledCommands.includes(command)) {
            return;
        }
        
        // Owner only commands
        const isOwner = settings.ownerNumber && settings.ownerNumber.includes(senderNumber);
        
        // Handle commands
        if (isCmd) {
            console.log(chalk.cyan(`📨 Command: ${command} from ${senderNumber}`));
            
            switch (command) {
                // Main Commands
                case 'menu':
                case 'help':
                    await sendMenu(sock, from, m, isOwner);
                    break;
                    
                case 'ping':
                    await sock.sendMessage(from, { text: '🏓 *Pong!* 🐞\n\n⚡ Bot is online and responsive!' }, { quoted: m });
                    break;
                    
                case 'status':
                    await sendStatus(sock, from, m);
                    break;
                    
                case 'owner':
                    await sock.sendMessage(from, { 
                        text: `👑 *Owner Information*\n\n📛 Name: ${settings.ownerName || 'Knight Developer'}\n📱 Number: ${settings.ownerNumber || '263718456744'}\n\n🐞 ${settings.botName || 'LADYBUG BETA'}` 
                    }, { quoted: m });
                    break;
                
                // AI Commands
                case 'ai':
                case 'chat':
                case 'gpt':
                case 'ask':
                    if (settings.aiEnabled && text) {
                        await handleAI(sock, from, text, m);
                    } else {
                        await sock.sendMessage(from, { text: '❌ AI is disabled or no text provided!' }, { quoted: m });
                    }
                    break;
                
                // Fun Commands
                case 'joke':
                    const joke = await getJoke();
                    await sock.sendMessage(from, { text: `😄 *Joke Time!*\n\n${joke}` }, { quoted: m });
                    break;
                    
                case 'quote':
                    const quote = await getQuote();
                    await sock.sendMessage(from, { text: `💭 *Daily Quote*\n\n"${quote.text}"\n\n— ${quote.author || 'Unknown'}` }, { quoted: m });
                    break;
                    
                case 'fact':
                    const fact = await getRandomFact();
                    await sock.sendMessage(from, { text: `🧠 *Did You Know?*\n\n${fact}` }, { quoted: m });
                    break;
                    
                case 'roll':
                    const dice = Math.floor(Math.random() * 6) + 1;
                    await sock.sendMessage(from, { text: `🎲 You rolled a ${dice}!` }, { quoted: m });
                    break;
                    
                case 'flip':
                    const coin = Math.random() < 0.5 ? 'Heads' : 'Tails';
                    await sock.sendMessage(from, { text: `🪙 Coin flip: ${coin}!` }, { quoted: m });
                    break;
                
                // Tools Commands
                case 'sticker':
                    if (m.type === 'imageMessage') {
                        await createSticker(sock, from, m);
                    } else {
                        await sock.sendMessage(from, { text: '❌ Please reply to an image to create a sticker!' }, { quoted: m });
                    }
                    break;
                    
                case 'translate':
                    if (args[1]) {
                        await translateText(sock, from, args.join(' '), m);
                    } else {
                        await sock.sendMessage(from, { text: '❌ Usage: .translate <text> to <language>' }, { quoted: m });
                    }
                    break;
                    
                case 'calculate':
                case 'calc':
                    if (text) {
                        try {
                            const result = eval(text.replace(/[^0-9+\-*/().\s]/g, ''));
                            await sock.sendMessage(from, { text: `🧮 *Calculation*\n\n${text} = ${result}` }, { quoted: m });
                        } catch {
                            await sock.sendMessage(from, { text: '❌ Invalid calculation!' }, { quoted: m });
                        }
                    } else {
                        await sock.sendMessage(from, { text: '❌ Usage: .calculate <expression>' }, { quoted: m });
                    }
                    break;
                
                // Group Commands
                case 'groupinfo':
                    if (isGroup) {
                        await sendGroupInfo(sock, from, m);
                    } else {
                        await sock.sendMessage(from, { text: '❌ This command only works in groups!' }, { quoted: m });
                    }
                    break;
                    
                case 'tagall':
                    if (isGroup) {
                        await tagAll(sock, from, text, m);
                    } else {
                        await sock.sendMessage(from, { text: '❌ This command only works in groups!' }, { quoted: m });
                    }
                    break;
                    
                case 'kick':
                    if (isGroup) {
                        await kickUser(sock, from, m.mentionedJid[0], m, isOwner);
                    } else {
                        await sock.sendMessage(from, { text: '❌ This command only works in groups!' }, { quoted: m });
                    }
                    break;
                
                // Owner Commands
                case 'settings':
                    if (isOwner) {
                        await sendSettingsMenu(sock, from, m);
                    } else {
                        await sock.sendMessage(from, { text: '❌ Owner only command!' }, { quoted: m });
                    }
                    break;
                    
                case 'broadcast':
                    if (isOwner && text) {
                        await broadcastMessage(sock, text, m);
                    } else {
                        await sock.sendMessage(from, { text: '❌ Owner only command or no text provided!' }, { quoted: m });
                    }
                    break;
                
                // Default response
                default:
                    if (isCmd) {
                        await sock.sendMessage(from, { text: `❌ Command "${command}" not found!\n\n📖 Use ${prefix}menu to see available commands.` }, { quoted: m });
                    }
            }
        } else {
            // Handle normal messages (AI chat if enabled)
            if (settings.aiEnabled && !m.key.fromMe && Math.random() < 0.3) { // 30% chance to respond
                await handleAI(sock, from, budy, m);
            }
        }
        
    } catch (error) {
        console.error('❌ Message handler error:', error);
    }
}

// Send menu
async function sendMenu(sock, from, m, isOwner) {
    const settings = global.settings || {};
    const menuText = `
🐞 ${settings.botName || 'LADYBUG BETA'} MENU 🐞

📅 *Date:* ${moment().format('DD/MM/YYYY')}
🕐 *Time:* ${moment().format('HH:mm:ss')}
👤 *User:* ${m.key.fromMe ? 'Owner' : m.pushName}

🏠 *Main Commands*
${settings.prefix}menu - Show this menu
${settings.prefix}ping - Test bot speed
${settings.prefix}status - Bot status
${settings.prefix}owner - Owner info

🤖 *AI Commands*
${settings.prefix}ai <text> - Chat with AI
${settings.prefix}ask <question> - Ask AI anything

🎮 *Fun Commands*
${settings.prefix}joke - Get a random joke
${settings.prefix}quote - Daily inspiration
${settings.prefix}fact - Random fact
${settings.prefix}roll - Roll a dice
${settings.prefix}flip - Flip a coin

🛠️ *Tools*
${settings.prefix}sticker - Create sticker from image
${settings.prefix}translate <text> - Translate text
${settings.prefix}calculate <expr> - Calculator

👥 *Group Commands*
${settings.prefix}groupinfo - Group information
${settings.prefix}tagall <text> - Tag all members
${settings.prefix}kick @user - Remove member

${isOwner ? `
👑 *Owner Commands*
${settings.prefix}settings - Bot settings
${settings.prefix}broadcast <text> - Broadcast message
` : ''}

🔥 *Features Enabled*
${settings.aiEnabled ? '✅ AI Chat' : '❌ AI Chat'}
${settings.autoTyping ? '✅ Auto Typing' : '❌ Auto Typing'}
${settings.alwaysOnline ? '✅ Always Online' : '❌ Always Online'}
${settings.autoLikeStatus ? '✅ Auto Like Status' : '❌ Auto Like Status'}

💬 *Need help?* Contact owner: ${settings.ownerNumber || '263718456744'}
    `;
    
    await sock.sendMessage(from, { text: menuText }, { quoted: m });
}

// Send status
async function sendStatus(sock, from, m) {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    const statusText = `
📊 *BOT STATUS* 📊

🤖 *Bot Name:* ${global.settings?.botName || 'LADYBUG BETA'}
⏱️ *Uptime:* ${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m
🧠 *Memory:* ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB / ${Math.round(memUsage.rss / 1024 / 1024)}MB
🟢 *Status:* Connected
📱 *WhatsApp:* Version ${process.version}

🔥 *Features:* AI Chat | Groups | Tools | Auto-Response
🐞 *Version:* 2.0.0
    `;
    
    await sock.sendMessage(from, { text: statusText }, { quoted: m });
}

// Handle AI chat
async function handleAI(sock, from, text, m) {
    try {
        await sock.sendMessage(from, { text: '🤔 Thinking...' }, { quoted: m });
        
        const response = await aiChat(text, global.settings);
        await sock.sendMessage(from, { text: `🤖 *AI Response*\n\n${response}` }, { quoted: m });
    } catch (error) {
        console.error('AI Error:', error);
        await sock.sendMessage(from, { text: '❌ AI service is currently unavailable!' }, { quoted: m });
    }
}

// Create sticker
async function createSticker(sock, from, m) {
    try {
        const media = await downloadMedia(m);
        const { writeExifImg } = require('../lib/exif');
        
        const sticker = await writeExifImg(media, {
            packName: global.settings?.botName || 'LADYBUG',
            authorName: global.settings?.ownerName || 'Knight'
        });
        
        await sock.sendMessage(from, { sticker }, { quoted: m });
    } catch (error) {
        console.error('Sticker error:', error);
        await sock.sendMessage(from, { text: '❌ Failed to create sticker!' }, { quoted: m });
    }
}

// Send group info
async function sendGroupInfo(sock, from, m) {
    try {
        const metadata = await sock.groupMetadata(from);
        const admins = metadata.participants.filter(p => p.admin).length;
        const members = metadata.participants.length;
        
        const infoText = `
📋 *GROUP INFORMATION* 📋

📛 *Name:* ${metadata.subject}
👑 *Owner:* ${metadata.owner?.split('@')[0] || 'Unknown'}
👥 *Members:* ${members} (${admins} admins)
📅 *Created:* ${metadata.creation ? moment(metadata.creation * 1000).format('DD/MM/YYYY') : 'Unknown'}
📝 *Description:* ${metadata.desc || 'No description'}

🔥 *Features:* Welcome messages, Anti-spam, Games
        `;
        
        await sock.sendMessage(from, { text: infoText }, { quoted: m });
    } catch (error) {
        console.error('Group info error:', error);
        await sock.sendMessage(from, { text: '❌ Failed to get group info!' }, { quoted: m });
    }
}

// Tag all members
async function tagAll(sock, from, text, m) {
    try {
        const metadata = await sock.groupMetadata(from);
        const members = metadata.participants.map(p => p.id);
        
        let message = text || '📢 Attention everyone!';
        message += '\n\n' + members.map((id, i) => `@${id.split('@')[0]}`).join(' ');
        
        await sock.sendMessage(from, { text: message, mentions: members }, { quoted: m });
    } catch (error) {
        console.error('Tag all error:', error);
        await sock.sendMessage(from, { text: '❌ Failed to tag all members!' }, { quoted: m });
    }
}

// Kick user
async function kickUser(sock, from, userToKick, m, isOwner) {
    try {
        if (!isOwner) {
            await sock.sendMessage(from, { text: '❌ Only admins can use this command!' }, { quoted: m });
            return;
        }
        
        if (!userToKick) {
            await sock.sendMessage(from, { text: '❌ Please mention a user to kick!' }, { quoted: m });
            return;
        }
        
        await sock.groupParticipantsUpdate(from, [userToKick], 'remove');
        await sock.sendMessage(from, { text: '✅ User kicked successfully!' }, { quoted: m });
    } catch (error) {
        console.error('Kick error:', error);
        await sock.sendMessage(from, { text: '❌ Failed to kick user!' }, { quoted: m });
    }
}

// Group participants update handler
async function handleGroupUpdate(sock, update, settings) {
    try {
        const { id, participants, action } = update;
        
        if (action === 'add' && settings.groupWelcome) {
            for (const participant of participants) {
                const welcomeMessage = settings.welcomeMessage
                    .replace('@user', `@${participant.split('@')[0]}`)
                    .replace('@groupName', (await sock.groupMetadata(id)).subject);
                
                await delay(3000);
                await sock.sendMessage(id, { 
                    text: welcomeMessage, 
                    mentions: [participant] 
                });
            }
        }
        
        if (action === 'remove' && settings.goodbyeMessage) {
            for (const participant of participants) {
                const goodbyeMessage = settings.goodbyeMessage
                    .replace('@user', `@${participant.split('@')[0]}`);
                
                await delay(3000);
                await sock.sendMessage(id, { text: goodbyeMessage });
            }
        }
    } catch (error) {
        console.error('Group update error:', error);
    }
}

// Status update handler
async function handleStatusUpdate(sock, reaction) {
    try {
        // Auto-like status with random delay
        if (Math.random() < 0.7) { // 70% chance to like
            await delay(Math.random() * 5000 + 2000);
            // Implementation depends on baileys version
        }
    } catch (error) {
        console.error('Status update error:', error);
    }
}

// Broadcast message (owner only)
async function broadcastMessage(sock, text, m) {
    try {
        // This would get all chats and broadcast
        // Implementation would depend on your needs
        await sock.sendMessage(m.key.remoteJid, { text: '✅ Broadcasting message...' }, { quoted: m });
    } catch (error) {
        console.error('Broadcast error:', error);
        await sock.sendMessage(m.key.remoteJid, { text: '❌ Broadcast failed!' }, { quoted: m });
    }
}

// Send settings menu
async function sendSettingsMenu(sock, from, m) {
    const settingsText = `
⚙️ *BOT SETTINGS* ⚙️

📝 *Current Settings:*
🤖 Bot Name: ${global.settings?.botName}
👤 Owner: ${global.settings?.ownerName}
🔓 Public Mode: ${global.settings?.publicMode ? 'ON' : 'OFF'}
🤖 AI Chat: ${global.settings?.aiEnabled ? 'ON' : 'OFF'}
⌨️ Auto Typing: ${global.settings?.autoTyping ? 'ON' : 'OFF'}
🟢 Always Online: ${global.settings?.alwaysOnline ? 'ON' : 'OFF'}

📖 *To change settings, use the web dashboard:*
https://knight-bot-paircode.onrender.com/dashboard
    `;
    
    await sock.sendMessage(from, { text: settingsText }, { quoted: m });
}

// Translate text (simple implementation)
async function translateText(sock, from, text, m) {
    // Simple placeholder - would integrate with translation API
    await sock.sendMessage(from, { text: '🌐 Translation feature coming soon!' }, { quoted: m });
}

module.exports = {
    handleMessages,
    handleGroupUpdate,
    handleStatusUpdate
};