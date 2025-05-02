require("dotenv").config();
const { WebClient } = require("@slack/web-api");


module.exports = async function sendSlack(flow, user) {
  console.log(`Sending Slack message for ${user.name}`);

  const webClient = new WebClient(process.env.SLACK_TOKEN);

  try {

    const result = await webClient.chat.postMessage({
      channel: process.env.SLACK_CHANNEL,
      text: `New user registered: ${user.name} (${user.email})`
    });

    console.log("Slack message sent successfully: ", result);

  } catch (error) {
    console.error("An error occurred while sending the Slack message:", error);
    return;
  }


};