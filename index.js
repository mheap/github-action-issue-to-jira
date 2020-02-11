const { Toolkit } = require('actions-toolkit');
const core = require('@actions/core');

// Run your GitHub Action!
Toolkit.run(async tools => {

  var jira = new JiraApi({
    protocol: 'https',
    host: core.getInput('jiraHost', { required: true }),
    username: core.getInput('jiraUsername', { required: true }),
    password: core.getInput('jiraPassword', { required: true }),
    apiVersion: '2',
    strictSSL: true
  });

  console.log(core.getInput('jiraHost', { required: true }));

  const payload = tools.context.payload;
  const title = payload.issue.title;
  const body = payload.issue.body;

  tools.exit.success('We did it!')
})
