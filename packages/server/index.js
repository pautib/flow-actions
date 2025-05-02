const express      = require("express");
const bodyParser   = require("body-parser");
const { executeWorkflow, getActionsConfig, appendWorkflow, getWorkflows } = require("./workflow");
const yaml = require("js-yaml");
const path = require('path');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.text({type: 'text/yaml'}));
app.use('/icons', express.static(path.join(__dirname, 'actions/icons')));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.post("/workflows/:workflowName", async (req, res) => {
  const { workflowName } = req.params;
  const requestBody = req.body;
  console.log(`Executing workflow: ${workflowName}`);

  await executeWorkflow(workflowName, requestBody);

  res.send({ success: true, message: `Workflow ${ workflowName } executed with data ${requestBody.toString()}.` });
});

app.post('/workflows', async (req, res) => {
  
  try {
    console.log('Request body type:', typeof req.body);
    console.log('Request body:', req.body);
    const workflow = yaml.load(req.body);

    // Validate each action
    for (const action of workflow[Object.keys(workflow)[0]].actions) {
      
      const actionConfig = getActionsConfig().actions.find(a => a.name === Object.keys(action)[0]);
      // Validate required parameters
      for (const param of actionConfig.parameters) {
        if (param.required && !action[Object.keys(action)[0]][param.name]) {
          return res.status(400).json({ 
            error: `Missing required parameter: ${param.name} for action ${action.type}` 
          });
        }
      }
    }
    // Save workflow to or file
    appendWorkflow(req.body);

    res.status(201).json({ 
      success: true, 
      message: 'Workflow saved successfully',
      workflow 
    });

  } catch (error) {
    console.error('Error saving workflow:', error);
    res.status(500).json({ error: 'Failed to save workflow' });
  }

});

app.get("/actions", async (req, res) => {
  try {
    const actionsConfig = getActionsConfig();
    res.json(actionsConfig);
  } catch (error) {
    console.error('Error reading actions config:', error);
    res.status(500).json({ error: 'Failed to load actions configuration' });
  }
});

app.get("/workflows", async(req, res) => {
  try {
    const workflows = getWorkflows();
    res.json(workflows);
  } catch (error) {
    console.error('Error reading current workflows: ', error);
    res.status(500).json({error: 'Failed to load existing workflows'});
  }
});


app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
}); 