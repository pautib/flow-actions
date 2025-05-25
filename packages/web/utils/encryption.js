import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
const ALGORITHM = process.env.NEXT_PUBLIC_ENCRYPTION_ALGORITHM || 'aes-256-cbc';

// Debug logging (remove in production)
console.log('Encryption configuration:', {
    hasKey: !!ENCRYPTION_KEY,
    algorithm: ALGORITHM
});

if (!ENCRYPTION_KEY) {
    console.error('NEXT_PUBLIC_ENCRYPTION_KEY is not set in environment variables');
}

if (!ALGORITHM) {
    console.error('NEXT_PUBLIC_ENCRYPTION_ALGORITHM is not set in environment variables');
}

export function encrypt(text) {
    if (!text) return null;
    if (!ENCRYPTION_KEY) {
        console.error('Cannot encrypt: ENCRYPTION_KEY is not set');
        return null;
    }
    
    try {
        // Generate a random IV
        const iv = CryptoJS.lib.WordArray.random(16);
        
        // Encrypt the data
        const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        
        // Convert to the same format as the server
        return {
            iv: iv.toString(CryptoJS.enc.Hex),
            encryptedData: encrypted.ciphertext.toString(CryptoJS.enc.Hex)
        };
    } catch (error) {
        console.error('Encryption error:', error);
        return null;
    }
} 