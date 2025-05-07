import express from "express";
import { Client, GatewayIntentBits } from "discord.js";
import unorm from "unorm";
import { transliterate } from "transliteration";
import { franc } from "franc";

const app = express();
const PORT = process.env.PORT || 3000;

// Serve an HTML page when the bot is running
app.get("/", (req, res) => {
    res.send("<h1>Bot is active!</h1><p>Discord bot is running successfully.</p>");
});

// Start Express server so Replit detects it
app.listen(PORT, () => {
    console.log(`Web server running on http://localhost:${PORT}`);
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

function simplifyUsername(username) {
    let words = username.split(" ");

    if (username.length < 10) {
        return username; // Short names stay the same
    } else if (username.length <= 16) {
        return words[0]; // Multiword, 10-16 characters → First word
    } else {
        if (words.length === 1) { // Single-word, 17+ characters → Evenly spaced acronym
            let length = username.length;
            let numChars = Math.floor(Math.sqrt(length)); // Number of characters to pick
            let step = Math.floor(length / numChars); // Step size for spacing

            let selectedChars = [];
            for (let i = 0; i < numChars; i++) {
                selectedChars.push(username[i * step]); // Pick characters at evenly spaced intervals
            }

            return selectedChars.join("") + username[length - 1]; // First & Last included
        } else { // Multiword, 17+ characters → Acronymize
            return words.map(word => word[0].toUpperCase()).join("");
        }
    }
}

// Test cases
console.log(simplifyUsername("Bookcat")); // → "Bookcat"
console.log(simplifyUsername("Jolly Pikachu")); // → "Jolly"
console.log(simplifyUsername("Korean Translate Glitchy Emoji")); // → "KTGE"
console.log(simplifyUsername("Supercalifragilisticexpialidocious")); // → "Sclxi" (Example spaced acronym)

function normalizeText(text) {
    // Step 1: Normalize Unicode
    let normalizedText = unorm.nfd(text);

    // Step 2: Remove diacritics
    normalizedText = normalizedText.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Step 3: Detect language per character & apply transliteration
    normalizedText = normalizedText.split("").map(char => {
        const lang = franc(char);
        return lang !== "und" ? transliterate(char) : char; // Only transliterate if language is recognized
    }).join("");

    // Step 4: Convert fullwidth Latin to basic Latin
    normalizedText = normalizedText.replace(/[\uff01-\uff5e]/g, c =>
        String.fromCharCode(c.charCodeAt(0) - 0xFF00 + 0x20)
    );

    return normalizedText.replace(/[^A-Za-z0-9!@#%^&*()_+={}\[\]:;"'<>,.?/|\- ]/g, "");
}

// Test cases
console.log(normalizeText("ＡＩロボット！")); // → "AIrobotto!"
console.log(normalizeText("Привет")); // → "Privet"
console.log(normalizeText("こんにちは")); // → "Konnichiwa"
console.log(normalizeText("Pókemon Résumé")); // → "Pokemon Resume"


// Test cases
console.log(normalizeText("Café")); // → "Cafe"
console.log(normalizeText("ＡＩロボット！")); // → "AIロボット!"
console.log(normalizeText("Pókemon")); // → "Pokemon"
console.log(normalizeText("Résumé")); // → "Resume"

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('guildMemberAdd', member => {
    const generalChannel = member.guild.channels.cache.find(channel => channel.name === 'the-door');
    if (generalChannel) {
        generalChannel.send(`Hello ${simplifyUsername(normalizeText(member.user.displayName))}`);
    }
});

// Test cases
console.log(simplifyUsername("Bookcat")); // → "Bookcat"
console.log(simplifyUsername("Jolly Pikachu")); // → "Jolly"
console.log(simplifyUsername("Korean Translate Glitchy Emoji")); // → "KTGE"
console.log(simplifyUsername("Supercalifragilisticexpialidocious"));

client.on('messageCreate', message => {
    if (message.channel.name === 'the-door' && message.content.trim() === Buffer.from('ZDJWc1kyOXRaVlJsYzNRPQ==', 'base64').toString('utf8')) {
        message.channel.send(`Hello ${simplifyUsername(normalizeText(message.author.displayName))}`);
    }
});
/* Test d2VsY29tZVRlc3Q= username username username[0] +  */
client.login('MTM2OTUzNTI1MzQ5NjA3NDM1Mg.GGT_Gc.g1jqV-s4PNqmXQ45IseTZgjSw91eaXJJ-RLEAo');
