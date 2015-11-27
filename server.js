const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const githubMiddleware = require('github-webhook-middleware')({
  secret: process.env.GITHUB_SECRET,
});

app.set('port', (process.env.PORT || 5000));

app.use(githubMiddleware);
app.use(bodyParser.json());

app.post('/', (req, res) => {
  if (req.get('X-Hub-Signature'))
  console.log(req.body);
  res.end();
});

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});
