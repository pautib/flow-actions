const crypto = require('crypto');
require('dotenv').config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32-char ASCII
const text = process.argv[2];
const ivHex = process.argv[3];

if (!text || !ivHex || !ENCRYPTION_KEY) {
    console.error('Missing input: text, iv, or ENCRYPTION_KEY');
    process.exit(1);
}

console.log("Before encryption",
    {
        "text": text,
        "ivHex": ivHex,
        "encryptionKey": ENCRYPTION_KEY
    }
);

const bufferedKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const bufferedIv = Buffer.from(ivHex, 'hex');

try {
    const cipher = crypto.createCipheriv(
        'aes-256-cbc',
        bufferedKey,
        bufferedIv
    );

    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    
    console.log("After encryption:",
        {
            iv: ivHex.toString('hex'),
            encryptedData: encrypted.toString('hex')
        }
    );
} catch (error) {
    console.error('Encryption error:', error);
    process.exit(1);
}