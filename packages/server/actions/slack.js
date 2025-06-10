const { WebClient } = require("@slack/web-api");
const { getActionObject } = require("../workflow");

module.exports = async function sendSlack(workflowName, requestBody) {
  console.log(`Sending Slack message for ${requestBody.toString()}`);

  const slackObj = getActionObject(workflowName, "slack");
  
  if (!slackObj) {
    throw new Error(`Slack action does not exist inside flow ${workflowName}`)
  }
  
  const webClient = new WebClient(slackObj.slack_token_id);

  if (slackObj.message) {
    slackObj.message = slackObj.message.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return requestBody[key] || match;
    }); 
  }

  try {
    const result = await webClient.chat.postMessage({
      channel: slackObj.slack_channel,
      text: slackObj.message
    });

    console.log("Slack message sent successfully: ", result);
    return result;

  } catch (error) {
    console.error("An error occurred while sending the Slack message:", error);
    throw new Error(error);
  }

};