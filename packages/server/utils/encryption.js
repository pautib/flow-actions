require('dotenv').config();
const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 characters secure key

function decrypt(encryptedObj) {
    if (!encryptedObj || !encryptedObj.iv || !encryptedObj.encryptedData) {
        return null;
    }
    try {
        const iv = Buffer.from(encryptedObj.iv, 'hex');
        const encryptedText = Buffer.from(encryptedObj.encryptedData, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv); // Uses PKCS7 padding by default
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error('Decryption error', error);
        return null;
    }
}

/** 
function encrypt(text) {
    if (!text) return null;
    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return {
            iv: iv.toString('hex'),
            encryptedData: encrypted.toString('hex')
        };
    } catch (error) {
        console.error('Encryption error: ', error);
        return null;
    }
}
*/

module.exports = {
    decrypt
}