require('dotenv').config();
const crypto = require('crypto');

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // Convert hex string to 32-byte buffer

function decrypt(encryptedObj) {
    if (!encryptedObj || !encryptedObj.iv || !encryptedObj.encryptedData) {
        return null;
    }
    try {
        const iv = Buffer.from(encryptedObj.iv, 'hex');
        const encryptedText = Buffer.from(encryptedObj.encryptedData, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv); // Uses PKCS7 padding by default
        
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error('Decryption error', error);
        return null;
    }
}


module.exports = {
    decrypt,
}