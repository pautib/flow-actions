const crypto = require('crypto');
require('dotenv').config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32-char ASCII
const text = process.argv[2];
const iv = process.argv[3];

if (!text || !iv || !ENCRYPTION_KEY) {
    console.error('Missing input: text, iv, or ENCRYPTION_KEY');
    process.exit(1);
}

console.log("Before encryption",
    {
        "text": text,
        "iv": iv,
        "encryptionKey": ENCRYPTION_KEY
    }
);

const bufferedKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const bufferedIv = Buffer.from(iv, 'hex');

try {
    const cipher = crypto.createCipheriv(
        'aes-256-cbc',
        bufferedKey,
        bufferedIv
    );

    encrypted = Buffer.concat([cipher.update(text, 'utf-8'), cipher.final()]);
    
    console.log("After encryption:",
        {
            iv: iv.toString('hex'),
            encryptedData: encrypted.toString('hex')
        }
    );
} catch (error) {
    console.error('Encryption error:', error);
    process.exit(1);
}