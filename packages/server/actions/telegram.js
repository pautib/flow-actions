require("dotenv").config();
const { getActionObject } = require("../workflow");

module.exports = async function sendTelegram(flow, user) {

    console.log(`Sending a Telegram message to ${user.name}`);
    
    const telegramObj = getActionObject(flow, "telegram");

    if (telegramObj.message) {
        telegramObj.message = telegramObj.message.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return user[key] || match;
        });
    }

    try {
        const url = new URL(`https://api.telegram.org/bot${telegramObj.telegram_token_id}/sendMessage`);
        url.searchParams.set("chat_id", telegramObj.telegram_channel);
        url.searchParams.set("text", telegramObj.message);

        const result = await fetch(url, {
            "method": "GET"
        });

        if (!result.ok) {
            throw new Error(`Failed to send message: ${result.statusText}`);
        }
        
        console.log(`Message sent successfully to ${user.name}`);
        
    } catch (error) {
        console.error(`Error sending Telegram message: ${error}`);
        throw new Error(error);
    }
}
