const express      = require("express");
const bodyParser   = require("body-parser");
const { setWorkflow } = require("./workflow");

const app = express();
app.use(bodyParser.json());

app.post("/register", async (req, res) => {
  const user = req.body;
  console.log(`Registering user: ${user.name}`);

  await setWorkflow("register", user);

  res.send({ success: true, message: "User registered and workflow executed." });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
}); 