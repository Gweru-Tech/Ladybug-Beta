const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// Download media from message
async function downloadMedia(m) {
    try {
        const messageType = Object.keys(m.message)[0];
        let stream;
        
        if (messageType === 'imageMessage') {
            stream = await downloadContentFromMessage(m.message.imageMessage, 'image');
        } else if (messageType === 'videoMessage') {
            stream = await downloadContentFromMessage(m.message.videoMessage, 'video');
        } else if (messageType === 'audioMessage') {
            stream = await downloadContentFromMessage(m.message.audioMessage, 'audio');
        } else if (messageType === 'stickerMessage') {
            stream = await downloadContentFromMessage(m.message.stickerMessage, 'sticker');
        } else {
            throw new Error('Unsupported media type');
        }
        
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        
        return buffer;
    } catch (error) {
        console.error('Media download error:', error);
        throw error;
    }
}

// Save media to file
async function saveMedia(buffer, filename, folder = 'temp') {
    try {
        const tempDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        const filePath = path.join(tempDir, filename);
        fs.writeFileSync(filePath, buffer);
        
        return filePath;
    } catch (error) {
        console.error('Media save error:', error);
        throw error;
    }
}

// Get media info
function getMediaInfo(m) {
    try {
        const messageType = Object.keys(m.message)[0];
        const message = m.message[messageType];
        
        return {
            type: messageType.replace('Message', ''),
            caption: message.caption || '',
            mimetype: message.mimetype,
            filesize: message.fileLength,
            width: message.width,
            height: message.height,
            duration: message.seconds
        };
    } catch (error) {
        console.error('Media info error:', error);
        return null;
    }
}

// Convert media to different format
async function convertMedia(inputPath, outputPath, format) {
    try {
        // This would implement media conversion
        // For now, just copy the file
        fs.copyFileSync(inputPath, outputPath);
        return outputPath;
    } catch (error) {
        console.error('Media conversion error:', error);
        throw error;
    }
}

// Clean up temporary files
function cleanupTempFiles() {
    try {
        const tempDir = path.join(__dirname, '../../temp');
        if (fs.existsSync(tempDir)) {
            const files = fs.readdirSync(tempDir);
            files.forEach(file => {
                const filePath = path.join(tempDir, file);
                const stats = fs.statSync(filePath);
                
                // Delete files older than 1 hour
                if (Date.now() - stats.mtime.getTime() > 3600000) {
                    fs.unlinkSync(filePath);
                }
            });
        }
    } catch (error) {
        console.error('Cleanup error:', error);
    }
}

// Auto cleanup every hour
setInterval(cleanupTempFiles, 3600000);

module.exports = {
    downloadMedia,
    saveMedia,
    getMediaInfo,
    convertMedia,
    cleanupTempFiles
};