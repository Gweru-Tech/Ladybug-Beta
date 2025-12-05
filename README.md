# 🐞 LADYBUG BETA - Advanced WhatsApp Bot

![LADYBUG BETA](https://img.shields.io/badge/LADYBUG-BETA-red?style=for-the-badge&logo=whatsapp)
![Version](https://img.shields.io/badge/version-2.0.0-blue?style=for-the-badge)
![Node.js](https://img.shields.io/badge/node.js-18+-green?style=for-the-badge&logo=node.js)
![License](https://img.shields.io/badge/license-MIT-purple?style=for-the-badge)

An advanced WhatsApp bot with AI capabilities, automation features, and a beautiful web dashboard. Deployable on Render.com with just one click!

## ✨ Features

### 🤖 AI Chat & Intelligence
- **Multiple AI Providers**: OpenAI GPT, Google Gemini, Custom APIs
- **5 AI Personalities**: Friendly, Professional, Funny, Smart, Romantic
- **Smart Conversations**: Context-aware responses with memory
- **Auto Chat**: 30% chance to respond to normal messages

### 🛡️ Advanced Anti-Ban Protection
- **Human-like Delays**: 2-10 seconds between messages
- **Rate Limiting**: 10 messages/minute, 60 messages/hour
- **Behavior Monitoring**: Detects and prevents bot-like patterns
- **Auto-breaks**: Takes breaks when suspicious activity detected
- **Gradual Online Presence**: 10-second delay before appearing online

### 🎮 50+ Commands
- **Main Commands**: menu, ping, status, owner
- **AI Commands**: ai, chat, gpt, ask
- **Fun Commands**: joke, quote, fact, roll, flip, rps, meme
- **Tools**: sticker, translate, weather, calculate, emoji
- **Group Commands**: groupinfo, kick, promote, tagall, welcome
- **Owner Commands**: settings, broadcast, leaveall, block/unblock

### 🤖 Automation Features
- **Auto Typing**: Simulates typing before responding
- **Auto Bio**: Updates bot bio every hour
- **Auto Status**: Posts status updates automatically
- **Auto Like Status**: Likes contacts' statuses (70% chance)
- **Auto View Status**: Views contacts' statuses (40% chance)
- **Group Welcome/Goodbye**: Automatic member greetings

### 🌐 Web Dashboard
- **Real-time Status**: Monitor bot connection and performance
- **Settings Management**: Easy configuration through web interface
- **AI Configuration**: Switch providers and personalities
- **Automation Controls**: Enable/disable features
- **Analytics**: Track usage statistics and performance
- **QR & Pairing Code**: Multiple connection methods

### 🎨 Customization
- **Dynamic Bot Name**: Change bot name anytime
- **Custom Themes**: Choose colors and emojis
- **Welcome Messages**: Customize group greetings
- **Command Prefix**: Set your preferred prefix
- **Owner Settings**: Configure owner information

## 🚀 Quick Start

### 🌐 One-Click Deploy (Recommended)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

1. Click the "Deploy to Render" button above
2. Connect your GitHub account
3. Configure environment variables
4. Deploy and visit your bot's URL
5. Start your bot through the web dashboard!

### 📱 Manual Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ladybug-beta-bot.git
   cd ladybug-beta-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Start the bot**
   ```bash
   npm start
   ```

5. **Visit the dashboard**
   ```
   http://localhost:3000
   ```

## ⚙️ Configuration

### Environment Variables

```env
# Bot Configuration
BOT_NAME=LADYBUG BETA
OWNER_NAME=Your Name
OWNER_NUMBER=your-phone-number

# AI Configuration
AI_ENABLED=true
AI_PROVIDER=openai
AI_API_KEY=your_openai_api_key
AI_PERSONALITY=friendly

# Automation
AUTO_TYPING=true
ALWAYS_ONLINE=true
AUTO_BIO=true
AUTO_STATUS_UPDATE=true
AUTO_LIKE_STATUS=true
AUTO_VIEW_STATUS=true

# Anti-Ban
ANTI_BAN_ENABLED=true
MAX_MESSAGES_PER_MINUTE=10
MAX_MESSAGES_PER_HOUR=60
```

### Web Dashboard Settings

Access your dashboard at `https://your-app.onrender.com/dashboard`:

- **General Settings**: Bot name, owner info, command prefix
- **AI Configuration**: Choose provider, personality, API key
- **Automation**: Toggle auto features on/off
- **Group Management**: Customize welcome messages
- **Analytics**: View bot statistics

## 📋 Commands List

### 🏠 Main Commands
```
.menu     - Show all available commands
.ping     - Test bot response time
.status   - Display bot statistics
.owner    - Show owner information
```

### 🤖 AI Commands
```
.ai <text>     - Chat with AI
.ask <question> - Ask AI anything
.chat <text>   - Start AI conversation
.gpt <prompt>  - Use GPT model
```

### 🎮 Fun Commands
```
.joke      - Get a random joke
.quote     - Get inspirational quote
.fact      - Get interesting fact
.roll      - Roll a dice (1-6)
.flip      - Flip a coin
.rps       - Play rock paper scissors
.meme      - Get random meme
```

### 🛠️ Tools
```
.sticker       - Create sticker from image
.translate <text> to <lang> - Translate text
.weather <city> - Get weather info
.calculate <expr> - Calculator
.emoji <text>   - Text to emoji
```

### 👥 Group Commands
```
.groupinfo     - Show group information
.tagall <text> - Tag all members
.kick @user    - Remove member (admin)
.promote @user - Promote to admin (admin)
.demote @user  - Demote from admin (admin)
```

### 👑 Owner Commands
```
.settings      - Show settings menu
.broadcast <text> - Send to all chats
.restart       - Restart bot
.leaveall      - Leave all groups
.block @user   - Block user
.unblock @user - Unblock user
```

## 🛡️ Anti-Ban Features

LADYBUG BETA includes advanced anti-ban protection:

### Rate Limiting
- **10 messages per minute** per chat
- **60 messages per hour** total
- Automatic cooldowns when limits reached

### Human-like Behavior
- **2-5 second delays** for individual chats
- **3-7 second delays** for group chats
- **Typing simulation** before responses
- **Reading delays** after receiving messages

### Pattern Detection
- Monitors message timing patterns
- Detects bot-like uniform intervals
- Enforces mandatory breaks for suspicious activity
- Gradual online presence (10-second delay)

### Safety Tips
- Don't send more than 50-60 messages/hour
- Take breaks if you see warnings
- Use a separate number for bot (not personal)
- Let bot rest 6-8 hours daily

## 🔧 API Integration

### OpenAI GPT Setup
1. Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add to environment: `AI_API_KEY=your_key_here`
3. Set `AI_PROVIDER=openai`
4. Choose model: `AI_MODEL=gpt-3.5-turbo`

### Google Gemini Setup
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to environment: `AI_API_KEY=your_gemini_key`
3. Set `AI_PROVIDER=gemini`
4. Model: `AI_MODEL=gemini-pro`

### Custom API
1. Set `AI_PROVIDER=custom`
2. Configure `CUSTOM_API_ENDPOINT`
3. Add `CUSTOM_API_KEY` if required

## 🌍 Deployment Options

### Render.com (Recommended)
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Built-in CI/CD
- ✅ Easy environment variables
- ✅ One-click deployment

### Heroku
```bash
# Install Heroku CLI
heroku create your-app-name
heroku config:set NODE_ENV=production
git push heroku main
```

### VPS/Dedicated Server
```bash
# Using PM2
npm install -g pm2
pm2 start server.js --name "ladybug-bot"
pm2 startup
pm2 save
```

### Docker
```bash
# Build image
docker build -t ladybug-beta .

# Run container
docker run -p 3000:3000 -e AI_API_KEY=your_key ladybug-beta
```

## 📊 Monitoring & Analytics

### Dashboard Stats
- **Bot Status**: Online/offline monitoring
- **Message Count**: Track daily messages
- **Active Users**: See user engagement
- **System Performance**: Memory and CPU usage
- **Uptime**: Bot running time

### Performance Optimization
- **Memory Management**: Automatic cleanup every minute
- **Cache System**: Improve response times
- **Rate Limiting**: Prevent API abuse
- **Health Checks**: Monitor bot health

## 🔒 Security Features

### Authentication
- **Owner-only commands**: Protected admin features
- **Allowed users**: Restrict bot access
- **Blocked users**: Prevent abuse
- **Session management**: Secure WhatsApp connection

### Data Protection
- **Environment variables**: Secure API keys
- **No data logging**: Privacy-first approach
- **Encrypted settings**: Protect configuration
- **Rate limiting**: Prevent spam attacks

## 🐛 Troubleshooting

### Common Issues

**Bot won't connect**
- Check internet connection
- Delete `./session` folder and re-authenticate
- Verify phone number format

**AI not working**
- Check API key is correct
- Verify API provider is set
- Check if API quota is exceeded

**Dashboard not loading**
- Check if PORT is set correctly
- Verify environment variables
- Check Render.com logs

**Rate limiting errors**
- Wait for cooldown period
- Reduce message frequency
- Check anti-ban settings

### Getting Help

1. **Check Logs**: View console output for errors
2. **Documentation**: Read this README thoroughly
3. **Community**: Join our support group
4. **Issues**: Report bugs on GitHub

## 🤝 Contributing

We welcome contributions! Here's how to help:

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

### Development Setup
```bash
git clone https://github.com/your-username/ladybug-beta-bot.git
cd ladybug-beta-bot
npm install
npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits & Thanks

- **[@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys)** - WhatsApp Web API
- **[OpenAI](https://openai.com/)** - AI technology provider
- **[Google Gemini](https://ai.google.dev/)** - AI technology provider
- **[Render.com](https://render.com/)** - Deployment platform
- **Our Community** - For amazing support and feedback

## 📞 Support

- **WhatsApp**: +263718456744
- **GitHub**: [Create an issue](https://github.com/your-username/ladybug-beta-bot/issues)
- **Email**: support@ladybugbot.com

## 🌟 Show Your Support

If you like this project, please give it a ⭐ on GitHub and consider:

- [☕ Buy me a coffee](https://buymeacoffee.com/ladybug)
- [🐛 Report bugs](https://github.com/your-username/ladybug-beta-bot/issues)
- [💡 Suggest features](https://github.com/your-username/ladybug-beta-bot/discussions)
- [📢 Share with friends](https://wa.me/?text=Check+out+this+amazing+WhatsApp+bot!)

---

<div align="center">
  <p>Made with ❤️ by Knight Developer</p>
  <p>© 2024 LADYBUG BETA. All rights reserved.</p>
</div>