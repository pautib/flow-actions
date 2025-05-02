const fs   = require("fs");
const yaml = require("js-yaml");

async function executeWorkflow(flow, user) {
  const file = fs.readFileSync("workflows.yaml", "utf8");
  const workflows = yaml.load(file);

  const workflow = workflows[flow];
  if (!workflow || !workflow.actions) {
    console.log(`No workflow found for event: ${flow}`);
    return;
  }

  for (const actionItem of workflow.actions) {

    let actionName;
    
    if (typeof actionItem === 'object') { // If actionItem is an object, get its key
      actionName = Object.keys(actionItem)[0];
    } else { // If it's a string, use it directly
      actionName = actionItem;
    }

    try {
      const action = require(`./actions/${actionName}`);
      await action(flow, user);
    } catch (err) {
      console.error(`Error in action '${actionName}':`, err.message);
    }

  }
}


function appendWorkflow(newWorkflowString) {
   // We assume workflow is a yaml in string format
  let existingContent = "";
  if (fs.existsSync("workflows.yaml")) {
    existingContent = fs.readFileSync("workflows.yaml", "utf8");
  }
  // Here check if the workflow already exists. If it does, then we overwrite its values
  const newWorkflow = yaml.load(newWorkflowString);
  const workflows = existingContent ? yaml.load(existingContent) : {};
  const newWorkflowName = Object.keys(newWorkflow)[0];

  workflows[newWorkflowName] = newWorkflow[newWorkflowName];

  fs.writeFileSync("workflows.yaml", yaml.dump(workflows));
}

function getActionsConfig() {
  return yaml.load(fs.readFileSync('./actions/actions.yaml', 'utf8'));
}

function getWorkflows() {
  return yaml.load(fs.readFileSync('./workflows.yaml', 'utf-8'));
}


module.exports = { executeWorkflow, getWorkflows, appendWorkflow, getActionsConfig }; 