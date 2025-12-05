const axios = require('axios');

// Get random joke
async function getJoke() {
    try {
        const jokes = [
            "Why don't scientists trust atoms? Because they make up everything!",
            "Why did the scarecrow win an award? He was outstanding in his field!",
            "Why don't eggs tell jokes? They'd crack each other up!",
            "What do you call a fake noodle? An impasta!",
            "Why did the math book look so sad? Because it had too many problems!",
            "What do you call a bear with no teeth? A gummy bear!",
            "Why can't a bicycle stand up by itself? It's two tired!",
            "What do you call cheese that isn't yours? Nacho cheese!",
            "Why did the cookie go to the doctor? Because it felt crumbly!",
            "What do you call a dinosaur that crashes his car? Tyrannosaurus Wrecks!"
        ];
        
        return jokes[Math.floor(Math.random() * jokes.length)];
    } catch (error) {
        return "Why did the bot fail to tell a joke? Because its humor module was offline! 😄";
    }
}

// Get inspirational quote
async function getQuote() {
    try {
        const quotes = [
            { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
            { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
            { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
            { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
            { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
            { text: "The best and most beautiful things in the world cannot be seen or even touched - they must be felt with the heart.", author: "Helen Keller" },
            { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
            { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
            { text: "The only impossible thing is that which you don't attempt.", author: "Unknown" },
            { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" }
        ];
        
        return quotes[Math.floor(Math.random() * quotes.length)];
    } catch (error) {
        return { text: "Every day is a new beginning. Take a deep breath and start again.", author: "Unknown" };
    }
}

// Get random fact
async function getRandomFact() {
    try {
        const facts = [
            "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible!",
            "Octopuses have three hearts: two pump blood to the gills, and one pumps it to the rest of the body.",
            "A group of flamingos is called a 'flamboyance'.",
            "Bananas are berries, but strawberries aren't!",
            "There are more stars in the universe than grains of sand on all the Earth's beaches.",
            "A day on Venus is longer than its year - it takes 243 Earth days to rotate once, but only 225 Earth days to orbit the Sun.",
            "The human brain uses about 20% of the body's total energy, despite being only 2% of body weight.",
            "Butterflies taste with their feet.",
            "A bolt of lightning contains enough energy to toast 100,000 slices of bread.",
            "The shortest war in history was between Britain and Zanzibar in 1896. Zanzibar surrendered after 38 minutes.",
            "Sea otters hold hands when they sleep so they don't drift apart.",
            "There are more possible games of chess than atoms in the observable universe.",
            "A blue whale's heart is so big that a human could swim through its arteries.",
            "Cows have best friends and get stressed when they're separated.",
            "The Great Wall of China isn't visible from space without aid, contrary to popular belief."
        ];
        
        return facts[Math.floor(Math.random() * facts.length)];
    } catch (error) {
        return "Did you know? This bot runs on advanced algorithms and artificial intelligence to serve you better!";
    }
}

// Play Rock Paper Scissors
function playRPS(userChoice) {
    const choices = ['rock', 'paper', 'scissors'];
    const botChoice = choices[Math.floor(Math.random() * 3)];
    
    let result;
    if (userChoice === botChoice) {
        result = "It's a tie!";
    } else if (
        (userChoice === 'rock' && botChoice === 'scissors') ||
        (userChoice === 'paper' && botChoice === 'rock') ||
        (userChoice === 'scissors' && botChoice === 'paper')
    ) {
        result = "You win! 🎉";
    } else {
        result = "I win! 🤖";
    }
    
    return {
        user: userChoice,
        bot: botChoice,
        result: result,
        emoji: {
            rock: '🗿',
            paper: '📄',
            scissors: '✂️'
        }
    };
}

// Get random meme URL (placeholder)
async function getRandomMeme() {
    try {
        // This would integrate with meme APIs
        // For now, return placeholder URLs
        const memeUrls = [
            "https://i.imgflip.com/1ur9b0.jpg",
            "https://i.imgflip.com/30b1gx.jpg",
            "https://i.imgflip.com/26am.jpg",
            "https://i.imgflip.com/4t0m3j.jpg",
            "https://i.imgflip.com/3i7pck.jpg"
        ];
        
        return memeUrls[Math.floor(Math.random() * memeUrls.length)];
    } catch (error) {
        return "https://via.placeholder.com/500x500/FF1744/FFFFFF?text=Meme+Not+Available";
    }
}

// Get weather info (placeholder)
async function getWeather(city) {
    try {
        // This would integrate with weather APIs
        return {
            city: city,
            temperature: Math.floor(Math.random() * 30) + 10,
            condition: ["Sunny", "Cloudy", "Rainy", "Partly Cloudy"][Math.floor(Math.random() * 4)],
            humidity: Math.floor(Math.random() * 40) + 40,
            wind: Math.floor(Math.random() * 20) + 5
        };
    } catch (error) {
        return { error: "Weather service unavailable" };
    }
}

module.exports = {
    getJoke,
    getQuote,
    getRandomFact,
    playRPS,
    getRandomMeme,
    getWeather
};