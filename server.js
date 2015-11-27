const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.post('/', req => {
  console.log(req.body);
});

app.listen(3000);
