const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const githubMiddleware = require('github-webhook-middleware')({
  secret: process.env.GITHUB_SECRET,
});
const fetch = require('node-fetch');
const { FILES_REGEXP, REPO } = require('./config');
const port = process.env.PORT || 5000;

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

function createGetFilesContentFunction(ref) {
  return filename => {
    console.error(`https://api.github.com/repos/${REPO}/contents/${filename}?ref=${ref}`);
    fetch(`https://api.github.com/repos/${REPO}/contents/${filename}?ref=${ref}`)
      .then(res => res.json());
  };
}

app.use(githubMiddleware);
app.use(bodyParser.json());

app.post('/', ({ headers, body }, res) => {
  if (headers['x-github-event'] !== 'push') return res.status(200).end();
  const { id: ref } = body.head_commit;
  const getFilesContent = createGetFilesContentFunction(ref);
  const files = getChangedFiles(body.commits, FILES_REGEXP).map(getFilesContent);
  Promise.all(files).then(fs => console.log(fs));
  return res.status(200).end();
});

app.listen(port, () => {
  console.log('Node app is running on port', port);
});
