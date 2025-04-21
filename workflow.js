const fs   = require("fs");
const yaml = require("js-yaml");

async function setWorkflow(event, user) {
  const file = fs.readFileSync("workflows.yaml", "utf8");
  const workflows = yaml.load(file);

  const workflow = workflows[event];
  if (!workflow || !workflow.actions) {
    console.log(`No workflow found for event: ${event}`);
    return;
  }

  for (const actionName of workflow.actions) {
    try {
      const action = require(`./actions/${actionName}`);
      await action(user);
    } catch (err) {
      console.error(`Error in action '${actionName}':`, err.message);
    }
  }
}

module.exports = { setWorkflow }; 