// Client-side encryption utility
// Uses the same format as the server's encryption.js
import CryptoJS from "crypto-js";

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
    console.error('ENCRYPTION_KEY is not set in environment variables');
}

export function encrypt(text) {
    if (!text) return null;

    if (!ENCRYPTION_KEY) {
        console.error('Cannot encrypt: ENCRYPTION_KEY is not set');
        return null;
    }
    // AES-256-CBC algorithm
        // AES: Advanced Encryption Standard
        // 256 bits (32 bytes): The length of the encryption key
        // CBC: Cipher Block Chaining mode
    // Symmetric cryptography -> One key only. Ex: AES
    // Asymmetric cryptography -> Public/Private key pair. Ex: RSA, EdDSA
    try {
        const iv = CryptoJS.lib.WordArray.random(16); // Generate a random IV Word Array
        const key = CryptoJS.enc.Hex.parse(ENCRYPTION_KEY); // Convert key to WordArray. Ex: "abcd1234" → [0x61, 0x62, 0x63, 0x64, ...]
        // Encrypt the data. Input values:
            // Text: Data to encrypt
            // Key: 32 bytes secret
            // Mode: CBC
            // IV: Initialization vector (16 bytes)
            // Padding: Makes Text multiple of AES block size (16 bytes) by filling it with 0x0B (11 in decimal)
                // Example: "HELLO" (5 bytes) -> "HELLO\x0B\x0B\x0B\x0B\x0B\x0B\x0B\x0B\x0B\x0B\x0B" (adds 0x0B 16 - 5 times)
        const encrypted = CryptoJS.AES.encrypt(text, key,
            {
                mode: CryptoJS.mode.CBC,
                iv: iv,
                padding: CryptoJS.pad.Pkcs7
            }
        );
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

export function decrypt(encryptedObj) {
    if (!encryptedObj || !encryptedObj.iv || !encryptedObj.encryptedData) {
        console.log('Invalid encrypted object:', encryptedObj);
        return null;
    }

    try {
        // Convert key to WordArray
        const key = CryptoJS.enc.Hex.parse(ENCRYPTION_KEY);
        // Convert hex strings to WordArrays
        const iv = CryptoJS.enc.Hex.parse(encryptedObj.iv);
        const encryptedData = CryptoJS.enc.Hex.parse(encryptedObj.encryptedData);
        // Create a CipherParams object that matches the server's format
        const cipherParams = CryptoJS.lib.CipherParams.create({
            ciphertext: encryptedData
        });
        // Decrypt using the same parameters as the server
        const decrypted = CryptoJS.AES.decrypt(
            cipherParams,
            key,
            {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }
        );
        // Try to decode the result
        const result = decrypted.toString(CryptoJS.enc.Utf8);

        if (!result) {
            console.log('Decryption resulted in empty string');
            return null;
        }

        return result;
    } catch (error) {
        console.error('Decryption error:', error);
        console.log('Failed to decrypt object:', encryptedObj);
        return null;
    }
}