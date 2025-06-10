const { getActionObject } = require("../workflow");
const { Client, GatewayIntentBits } = require('discord.js');

module.exports = async function sendDiscordMessage(workflowName, requestBody) {
    
    console.log(`Sending Discord message for workflow: ${workflowName}`);

    const discordObj = getActionObject(workflowName, "discord");
    const client = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
      });

    if (discordObj.message) {
        discordObj.message = discordObj.message.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return requestBody[key] || match;
        });
    }

    try {
        
        client.once('ready', async () => {
            console.log(`Bot iniciado como ${client.user.tag}`);
          
            const channel = await client.channels.fetch(discordObj.channel_id);
            channel.send(discordObj.message);
     
        });
          
        const result = client.login(discordObj.discord_token_id);

        console.log('Message sent successfully to Discord');

        return result;

    } catch (error) {
        console.error("Error sending Discord message", error);
        throw new Error(error);
    }

}

// Steps to create and use a Discord bot
// 1. Go to https://discord.com/developers/applications
// 2. Create an app, activate bot and copy its token
// 3. Copy also the client id available in your current path or the OAuth section
//      Example: 1382075118921973861
// 4. Invite the bot to your server with the following url:
//      Example: https://discord.com/oauth2/authorize?client_id=1382075118921973861&scope=bot&permissions=2048