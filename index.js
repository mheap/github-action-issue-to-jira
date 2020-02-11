const { Toolkit } = require('actions-toolkit');
const core = require('@actions/core');
var JiraApi = require('jira-client');

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

  const payload = tools.context.payload;
  const title = payload.issue.title;
  const body = payload.issue.body;

  const project = core.getInput('project', { required: true });
  const assignee = core.getInput('assignee', { required: true });

  addJiraTicket(project, title, body, assignee);

  tools.exit.success('We did it!')
});

function addJiraTicket(project, title, body, assignee) {
  console.log(`Creating ticket in ${project} with ${title}`);
}
