const express      = require("express");
const bodyParser   = require("body-parser");
const { executeWorkflow, addWorkflow, getWorkflows, getActions } = require("./workflow");
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

app.post("/workflows/:workflowName", executeWorkflow, (req, res) => {
  res.send(
    { 
      success: true, 
      message: `Workflow executed with data ${req.body.toString()}.` 
    }
  );
});

app.post('/workflows', addWorkflow, (req, res) => {
  res.status(201).json({ 
    success: true, 
    message: 'Workflow saved successfully',
  });

});

app.get("/actions", getActions, (req, res) => { });

app.get("/workflows", getWorkflows, (req, res) => { });


app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
}); 