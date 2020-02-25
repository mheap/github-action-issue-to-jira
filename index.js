const { Toolkit } = require('actions-toolkit');
const core = require('@actions/core');
var JiraApi = require('jira-client');

// Run your GitHub Action!
Toolkit.run(async tools => {
  try {
    var jira = new JiraApi({
      protocol: 'https',
      host: core.getInput('jiraHost', { required: true }),
      username: core.getInput('jiraUsername', { required: true }),
      password: core.getInput('jiraPassword', { required: true }),
      apiVersion: '2',
      strictSSL: true
    });

    await addJiraTicket(jira, tools);

    tools.exit.success('We did it!')
  } catch(e) {
    tools.exit.failure(e.message)
  }
});

function addJiraTicket(jira, tools) {
  const payload = tools.context.payload;
  const title = payload.issue.title;
  const body = `${payload.issue.body}\n\nRaised by: ${payload.issue.user.html_url}\n\n${payload.issue.html_url}`;

  const project = core.getInput('project', { required: true });
  const assignee = core.getInput('assignee', { required: true });

  tools.log.pending("Creating Jira ticket with the following parameters");
  tools.log.info(`Title: ${title}`);
  tools.log.info(`Body: ${body}`);
  tools.log.info(`Project: ${project}`);
  tools.log.info(`Assignee: ${assignee}`);
  tools.log.complete("Created Jira ticket");

  let request = {
    fields: {
      assignee: {
        name: assignee,
      },
      project: {
        key: project
      },
      summary: title,
      description: body,
      issuetype: {
        name: "Task"
      }
    }
  };

  return jira.addNewIssue(request);
}
