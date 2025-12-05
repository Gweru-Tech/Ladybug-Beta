const axios = require('axios');
const chalk = require('chalk');

// AI Personalities
const personalities = {
    friendly: {
        name: "Friendly Assistant",
        prompt: "You are a friendly, helpful WhatsApp bot assistant. Be warm, conversational, and helpful. Use emojis occasionally to be more engaging. Keep responses concise but informative."
    },
    professional: {
        name: "Professional Assistant",
        prompt: "You are a professional WhatsApp bot assistant. Provide accurate, well-structured information. Be formal but approachable. Focus on being helpful and reliable."
    },
    funny: {
        name: "Funny Assistant",
        prompt: "You are a funny, witty WhatsApp bot assistant. Use humor, jokes, and clever responses. Be entertaining while still being helpful. Include funny comments and light-hearted remarks."
    },
    smart: {
        name: "Smart Assistant",
        prompt: "You are an intelligent, knowledgeable WhatsApp bot assistant. Provide detailed, accurate information. Be educational and insightful. Use proper terminology and explain complex topics clearly."
    },
    romantic: {
        name: "Romantic Assistant",
        prompt: "You are a romantic, charming WhatsApp bot assistant. Be sweet, caring, and supportive. Use romantic language and expressions. Focus on relationships, love, and emotional support."
    }
};

// AI Providers
const aiProviders = {
    openai: {
        name: "OpenAI GPT",
        endpoint: "https://api.openai.com/v1/chat/completions",
        model: "gpt-3.5-turbo",
        maxTokens: 500
    },
    gemini: {
        name: "Google Gemini",
        endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
        model: "gemini-pro",
        maxTokens: 500
    },
    custom: {
        name: "Custom API",
        endpoint: "",
        model: "custom",
        maxTokens: 500
    }
};

// Main AI chat function
async function aiChat(message, settings = {}) {
    try {
        const provider = settings.aiProvider || 'openai';
        const personality = personalities[settings.aiPersonality] || personalities.friendly;
        const apiKey = settings.aiApiKey || '';
        
        if (!apiKey && provider === 'openai') {
            return "❌ AI API key not configured! Please set up your OpenAI API key in the dashboard.\n\n📖 Get your key at: https://platform.openai.com/api-keys";
        }
        
        if (!apiKey && provider === 'gemini') {
            return "❌ AI API key not configured! Please set up your Gemini API key in the dashboard.\n\n📖 Get your key at: https://makersuite.google.com/app/apikey";
        }
        
        switch (provider) {
            case 'openai':
                return await chatWithOpenAI(message, personality.prompt, apiKey, settings);
            case 'gemini':
                return await chatWithGemini(message, personality.prompt, apiKey, settings);
            case 'custom':
                return await chatWithCustomAPI(message, personality.prompt, settings);
            default:
                return await getLocalAIResponse(message, personality);
        }
        
    } catch (error) {
        console.error(chalk.red('❌ AI Chat Error:'), error);
        return "❌ Sorry, I'm having trouble thinking right now. Please try again later! 🤖";
    }
}

// OpenAI GPT Chat
async function chatWithOpenAI(message, personalityPrompt, apiKey, settings) {
    try {
        const response = await axios.post(aiProviders.openai.endpoint, {
            model: settings.aiModel || "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: personalityPrompt + "\n\nYou are a WhatsApp bot, so keep responses relatively short and suitable for mobile messaging."
                },
                {
                    role: "user",
                    content: message
                }
            ],
            max_tokens: aiProviders.openai.maxTokens,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });
        
        return response.data.choices[0].message.content.trim();
        
    } catch (error) {
        if (error.response?.status === 401) {
            return "❌ Invalid OpenAI API key! Please check your configuration.";
        } else if (error.response?.status === 429) {
            return "❌ OpenAI API rate limit exceeded. Please try again in a moment.";
        }
        throw error;
    }
}

// Google Gemini Chat
async function chatWithGemini(message, personalityPrompt, apiKey, settings) {
    try {
        const response = await axios.post(`${aiProviders.gemini.endpoint}?key=${apiKey}`, {
            contents: [
                {
                    parts: [
                        {
                            text: `${personalityPrompt}\n\nYou are a WhatsApp bot, so keep responses relatively short and suitable for mobile messaging.\n\nUser: ${message}`
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: aiProviders.gemini.maxTokens,
            }
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });
        
        return response.data.candidates[0].content.parts[0].text.trim();
        
    } catch (error) {
        if (error.response?.status === 403) {
            return "❌ Invalid Gemini API key! Please check your configuration.";
        } else if (error.response?.status === 429) {
            return "❌ Gemini API rate limit exceeded. Please try again in a moment.";
        }
        throw error;
    }
}

// Custom API Chat
async function chatWithCustomAPI(message, personalityPrompt, settings) {
    if (!settings.customAPIEndpoint) {
        return "❌ Custom API endpoint not configured!";
    }
    
    try {
        const response = await axios.post(settings.customAPIEndpoint, {
            message: message,
            personality: personalityPrompt,
            max_tokens: aiProviders.custom.maxTokens
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${settings.customAPIKey || ''}`
            },
            timeout: 30000
        });
        
        return response.data.response || response.data.message || "❌ Invalid response from custom API.";
        
    } catch (error) {
        console.error('Custom API Error:', error);
        throw error;
    }
}

// Local fallback AI responses
async function getLocalAIResponse(message, personality) {
    const responses = {
        friendly: [
            "Hey there! I'm here to help! 😊 What can I do for you?",
            "Hi! I'm your friendly bot assistant! How can I assist you today?",
            "Hello! 👋 I'm ready to help with whatever you need!"
        ],
        professional: [
            "Good day. I am your professional assistant. How may I assist you?",
            "I am here to provide professional assistance. What do you require help with?",
            "Greetings. I am available to help with professional inquiries."
        ],
        funny: [
            "Well hello there! 🎉 I'm your comedy bot assistant! What hilarious task can I help you with today?",
            "Hey! I'm here to help... and maybe tell a joke or two! 😄 What's up?",
            "Greetings, human! I'm your witty assistant! Ready for some fun help?"
        ],
        smart: [
            "Greetings. I am an intelligent assistant prepared to provide detailed information on various subjects. What knowledge do you seek?",
            "Hello. I am equipped to assist with complex inquiries and provide comprehensive explanations. How may I help?",
            "Welcome. I am ready to engage in intelligent discourse and provide detailed assistance. What is your query?"
        ],
        romantic: {
            friendly: [
                "Hello, darling! 💕 I'm here to sweep you off your feet with helpful assistance! What can I do for you, my dear?",
                "Oh, hello there! 🌹 I'm your charming assistant, ready to help with love in my heart! What do you need, sweetheart?",
                "Greetings, my love! 💖 I'm here to help with romance and care! How can I assist you today?"
            ]
        }
    };
    
    // Check for common questions
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        const personalityResponses = responses[personality.name.split(' ')[0].toLowerCase()] || responses.friendly;
        return personalityResponses[Math.floor(Math.random() * personalityResponses.length)];
    }
    
    if (lowerMessage.includes('how are you')) {
        return "I'm doing wonderful, thank you for asking! 😊 Ready to help you with anything you need!";
    }
    
    if (lowerMessage.includes('what can you do')) {
        return `🤖 I can do many things! Here are some of my features:\n\n💬 Chat with you using AI\n🎮 Play games and tell jokes\n🛠️ Convert media files\n📊 Help with calculations\n🌍 Translate text\n👥 Manage groups\n🎵 Play music\n📸 Create stickers\n\nJust ask me anything! I'm here to help! 🐞`;
    }
    
    if (lowerMessage.includes('who made you')) {
        return `I was created by ${global.settings?.ownerName || 'Knight Developer'} with lots of love and code! 🐞 I'm a LADYBUG BETA bot designed to be helpful and friendly!`;
    }
    
    // Default response
    return `That's interesting! 🤔 I'd love to help you with that. Could you tell me more about what you'd like to know or do? I'm here to assist! 😊`;
}

// AI Image Generation (placeholder for future implementation)
async function generateImage(prompt, settings = {}) {
    try {
        // This would integrate with DALL-E, Midjourney, or Stable Diffusion
        return "🎨 Image generation coming soon! Stay tuned for this exciting feature!";
    } catch (error) {
        console.error('Image generation error:', error);
        return "❌ Sorry, I couldn't generate that image right now. Please try again later!";
    }
}

// AI Voice Generation (placeholder for future implementation)
async function generateVoice(text, settings = {}) {
    try {
        // This would integrate with text-to-speech APIs
        return "🗣️ Voice generation coming soon! Stay tuned for this exciting feature!";
    } catch (error) {
        console.error('Voice generation error:', error);
        return "❌ Sorry, I couldn't generate that voice message right now. Please try again later!";
    }
}

// Get available AI providers
function getAvailableProviders() {
    return Object.keys(aiProviders).map(key => ({
        id: key,
        name: aiProviders[key].name,
        model: aiProviders[key].model,
        requiresApiKey: key !== 'custom'
    }));
}

// Get available personalities
function getAvailablePersonalities() {
    return Object.keys(personalities).map(key => ({
        id: key,
        name: personalities[key].name,
        description: personalities[key].prompt.split('.')[0]
    }));
}

// Test AI connection
async function testAIConnection(settings) {
    try {
        const testMessage = "Hello! This is a test message.";
        const response = await aiChat(testMessage, settings);
        return {
            success: true,
            response: response,
            latency: Date.now()
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {
    aiChat,
    generateImage,
    generateVoice,
    getAvailableProviders,
    getAvailablePersonalities,
    testAIConnection,
    personalities,
    aiProviders
};