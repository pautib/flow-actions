const fs   = require("fs");
const yaml = require("js-yaml");
const { decrypt } = require("./utils/decryption");


// Public methods
async function executeWorkflow(req, res, next) {
  
  const { workflowName } = req.params;
  const requestBody = req.body;
  console.log(`Executing workflow: ${workflowName}`);
  
  const workflows = getWorkflowsYaml();

  const workflow = workflows[workflowName];
  if (!workflow || !workflow.actions) {
    console.log(`No workflow found for event: ${workflowName}`);
    return res.status(400).json({ "message": `No workflow found for event: ${workflowName}` });
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
      await action(workflowName, requestBody);
      next();
    } catch (err) {
      console.error(`Error in action '${actionName}':`, err.message);
      return res.status(400).json({ message: `Error executing action ${ actionName } in workflow ${ workflowName } `});
    }

  }
}

async function addWorkflow(req, res, next) {

  try {
    const workflow = yaml.load(req.body);
    const workflowName = Object.keys(workflow)[0];
    
    for (const action of workflow[workflowName].actions) { // Validate each action
      const actionName = Object.keys(action)[0];
      const actionConfig = getActionsYaml().actions.find(a => a.name === actionName);

      if (!actionConfig) {
        return res.status(400).json({
          error: `Invalid action type: ${actionName}`
        });
      }
      
      for (const param of actionConfig.parameters) { // Validate required parameters
        if (param.required && !action[actionName][param.name]) {
          return res.status(400).json({ 
            error: `Missing required parameter: ${param.name} for action ${action.type}` 
          });
        }
      }
    }
    
    appendWorkflowToYaml(req.body); // Save workflow to file
    next();
  } catch (error) {
    console.error('Error saving workflow:', error);
    return res.status(500).json({ error: 'Failed to save workflow' });
  }

}

function getActions(req, res, next) {
  try {
    const actionsConfig = getActionsYaml();
    res.json(actionsConfig);
  } catch (error) {
    console.error('Error reading actions config:', error);
    res.status(500).json({ error: 'Failed to load actions configuration' });
  }
}

function getWorkflows(req, res) {
  try {
    const workflows = getWorkflowsYaml();
    res.json(workflows ? workflows : {});
  } catch (error) {
    console.error('Error reading current workflows: ', error);
    res.status(500).json({error: 'Failed to load existing workflows'});
  }
}

function getActionObject(workflowName, actionName) {
  const actions = getWorkflow(workflowName).actions;
  const action = actions.find(action => Object.keys(action)[0] === actionName);
  const actionConfig = getActionsYaml().actions.find(a => a.name === actionName);

  if (!action || !actionConfig) {
    return null;
  }

  const actionObj = action[Object.keys(action)[0]];
  const result = { ...actionObj };

  // Decrypt encrypted values
  actionConfig.parameters.forEach(param => {
    if (param.encrypted && actionObj[param.name]) {
      const decrypted = decrypt(actionObj[param.name]);
      if (decrypted === null) {
        console.error(`Failed to decrypt ${param.name} for action ${actionName}`);
        return;
      }
      result[param.name] = decrypted;
    }
  });

  return result;
}

// Private methods

function appendWorkflowToYaml(newWorkflowString) {
   // We assume newWorkflowString is a yaml in string format
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

function getActionsYaml() {
  return yaml.load(fs.readFileSync('./actions/actions.yaml', 'utf8'));
}

function getWorkflowsYaml() {
  return yaml.load(fs.readFileSync('./workflows.yaml', 'utf-8'));
}

function getWorkflow(workflowName) {
  const workflows = getWorkflowsYaml();
  return workflows[workflowName];
}



module.exports = { 
  executeWorkflow, 
  getWorkflows, 
  addWorkflow,
  getActions,
  getActionObject
}; 