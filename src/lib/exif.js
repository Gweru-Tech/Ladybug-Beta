const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');
const { fromBuffer } = require('file-type');
const crypto = require('crypto');

// Create webp sticker from image
async function createWebp(buffer) {
    try {
        const tmpDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }
        
        const filename = crypto.randomBytes(6).readUIntLE(0, 6).toString(36);
        const inputPath = path.join(tmpDir, `${filename}.in`);
        const outputPath = path.join(tmpDir, `${filename}.webp`);
        
        // Write input buffer
        fs.writeFileSync(inputPath, buffer);
        
        // Get file info
        const fileType = await fromBuffer(buffer);
        
        return new Promise((resolve, reject) => {
            let ffmpegCommand;
            
            if (fileType.ext === 'gif') {
                // For GIF files
                ffmpegCommand = spawn('ffmpeg', [
                    '-i', inputPath,
                    '-vcodec', 'libwebp',
                    '-filter:v', 'fps=15',
                    '-lossless', '0',
                    '-compression_level', '6',
                    '-preset', 'default',
                    '-an',
                    '-vsync', '0',
                    '-s', '512:512',
                    outputPath
                ]);
            } else {
                // For static images
                ffmpegCommand = spawn('ffmpeg', [
                    '-i', inputPath,
                    '-vcodec', 'libwebp',
                    '-lossless', '0',
                    '-compression_level', '6',
                    '-preset', 'default',
                    '-an',
                    '-vsync', '0',
                    '-s', '512:512',
                    outputPath
                ]);
            }
            
            ffmpegCommand.on('error', (error) => {
                console.error('FFmpeg error:', error);
                reject(error);
            });
            
            ffmpegCommand.on('close', (code) => {
                if (code === 0) {
                    const webpBuffer = fs.readFileSync(outputPath);
                    
                    // Cleanup temp files
                    try {
                        fs.unlinkSync(inputPath);
                        fs.unlinkSync(outputPath);
                    } catch (e) {}
                    
                    resolve(webpBuffer);
                } else {
                    reject(new Error(`FFmpeg exited with code ${code}`));
                }
            });
        });
    } catch (error) {
        console.error('Create webp error:', error);
        throw error;
    }
}

// Create webp sticker from video
async function createWebpVideo(buffer) {
    try {
        const tmpDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }
        
        const filename = crypto.randomBytes(6).readUIntLE(0, 6).toString(36);
        const inputPath = path.join(tmpDir, `${filename}.mp4`);
        const outputPath = path.join(tmpDir, `${filename}.webp`);
        
        // Write input buffer
        fs.writeFileSync(inputPath, buffer);
        
        return new Promise((resolve, reject) => {
            const ffmpegCommand = spawn('ffmpeg', [
                '-i', inputPath,
                '-vcodec', 'libwebp',
                '-filter:v', 'fps=15',
                '-lossless', '0',
                '-compression_level', '6',
                '-preset', 'default',
                '-an',
                '-vsync', '0',
                '-s', '512:512',
                outputPath
            ]);
            
            ffmpegCommand.on('error', (error) => {
                console.error('FFmpeg error:', error);
                reject(error);
            });
            
            ffmpegCommand.on('close', (code) => {
                if (code === 0) {
                    const webpBuffer = fs.readFileSync(outputPath);
                    
                    // Cleanup temp files
                    try {
                        fs.unlinkSync(inputPath);
                        fs.unlinkSync(outputPath);
                    } catch (e) {}
                    
                    resolve(webpBuffer);
                } else {
                    reject(new Error(`FFmpeg exited with code ${code}`));
                }
            });
        });
    } catch (error) {
        console.error('Create webp video error:', error);
        throw error;
    }
}

// Write EXIF data to sticker
async function writeExifImg(buffer, packName, authorName) {
    try {
        const tmpDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }
        
        const filename = crypto.randomBytes(6).readUIntLE(0, 6).toString(36);
        const inputPath = path.join(tmpDir, `${filename}.webp`);
        const outputPath = path.join(tmpDir, `${filename}_exif.webp`);
        
        // Create webp first if it's not already webp
        const webpBuffer = buffer.toString('hex').startsWith('52494646') ? buffer : await createWebp(buffer);
        fs.writeFileSync(inputPath, webpBuffer);
        
        // Create EXIF data
        const exifData = createExif(packName, authorName);
        
        return new Promise((resolve, reject) => {
            const exiftoolCommand = spawn('node', [path.join(__dirname, 'exifWriter.js'), inputPath, outputPath, exifData]);
            
            exiftoolCommand.on('error', (error) => {
                console.error('EXIF writer error:', error);
                reject(error);
            });
            
            exiftoolCommand.on('close', (code) => {
                if (code === 0) {
                    let resultBuffer;
                    
                    try {
                        resultBuffer = fs.readFileSync(outputPath);
                    } catch (e) {
                        // If EXIF writing fails, return original buffer
                        resultBuffer = webpBuffer;
                    }
                    
                    // Cleanup temp files
                    try {
                        fs.unlinkSync(inputPath);
                        fs.unlinkSync(outputPath);
                    } catch (e) {}
                    
                    resolve(resultBuffer);
                } else {
                    reject(new Error(`EXIF writer exited with code ${code}`));
                }
            });
        });
    } catch (error) {
        console.error('Write EXIF error:', error);
        throw error;
    }
}

// Write EXIF data to video sticker
async function writeExifVid(buffer, packName, authorName) {
    try {
        const webpBuffer = await createWebpVideo(buffer);
        return await writeExifImg(webpBuffer, packName, authorName);
    } catch (error) {
        console.error('Write EXIF video error:', error);
        throw error;
    }
}

// Create EXIF data
function createExif(packName, authorName) {
    const exif = {
        "sticker-pack-id": crypto.randomBytes(16).toString('hex'),
        "sticker-pack-name": packName || "LADYBUG BETA",
        "sticker-pack-publisher": authorName || "Knight Developer",
        "sticker-pack-publisher-email": "",
        "sticker-pack-publisher-website": "",
        "android-app-store-link": "",
        "ios-app-store-link": "",
        "privacy-policy-website": "",
        "license-agreement-website": "",
        "stickers": [
            {
                "identifier": crypto.randomBytes(8).toString('hex'),
                "emoji": "🐞"
            }
        ]
    };
    
    return JSON.stringify(exif);
}

// Simple EXIF writer without external dependencies
function writeExifSimple(buffer, packName, authorName) {
    try {
        // For now, just return the original buffer
        // In a real implementation, this would properly write EXIF data
        return buffer;
    } catch (error) {
        console.error('Simple EXIF error:', error);
        return buffer;
    }
}

module.exports = {
    writeExifImg,
    writeExifVid,
    createWebp,
    createWebpVideo,
    writeExifSimple
};