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

    const event = process.env.GITHUB_EVENT_NAME;
    if (event == 'issues') {
      await addJiraTicket(jira, tools);
  } else if (event == 'issue_comment') {
      await addJiraComment(jira, tools);
    } else {
      tools.exit.failure(`Unknown event: ${event}`)
    }

    tools.exit.success('We did it!')
  } catch(e) {
    console.log(e);
    tools.exit.failure(e.message)
  }
});

async function addJiraComment(jira, tools) {
  const payload = tools.context.payload;
  const comment = payload.comment;

  const re = new RegExp(/Issue: (\w+\-\d+)/);
  let issue = payload.issue.body.match(re);

  if (!issue || !issue[1]) {
    tools.exit.failure("Could not find ticket number in issue body");
  } else {
    issue = issue[1];
  }

  const body = `${comment.body}\n\nPosted by: ${comment.user.html_url}\n\n${comment.html_url}`;

  tools.log.pending("Creating Jira comment with the following parameters");
  tools.log.info(`Body: ${body}`);
  tools.log.info(`Issue: ${issue}`);

  const result = await jira.addComment(issue, body);
  tools.log.complete("Comment added to Jira");
  return result;
}

async function addJiraTicket(jira, tools) {
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

  const result = await jira.addNewIssue(request);
  tools.log.complete("Created Jira ticket");

  const jiraIssue = result.key;
  tools.log.pending("Creating Issue comment with Jira Issue number");
  const comment = await tools.github.issues.createComment({
    owner: tools.context.repo.owner,
    repo: tools.context.repo.repo,
    issue_number: tools.context.issue.number,
    body: `Issue: ${jiraIssue}`
  });
  tools.log.complete("Creating Issue comment with Jira Issue number");
  return result;
}
