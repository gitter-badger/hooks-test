const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const githubMiddleware = require('github-webhook-middleware')({
  secret: process.env.GITHUB_SECRET,
});
const { FILES_REGEXP } = require('./config');

function getChangedFiles(commits, matchRegex) {
  return commits
    .reduce((previousCommit, { modified, added, removed }) => {
      return previousCommit
        .concat(modified)
        .concat(added)
        .filter(value => !removed.includes(value));
    }, [])
    .filter((value, i, arr) => arr.indexOf(value) >= i && matchRegex.test(value));
}

app.set('port', (process.env.PORT || 5000));

app.use(githubMiddleware);
app.use(bodyParser.json());

app.post('/', (req, res) => {
  if (req.headers['x-github-event'] !== 'push') return res.status(200).end();
  const files = getChangedFiles(req.body.commits, FILES_REGEXP);
  console.error(files);
  return res.status(200).end();
});

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});
