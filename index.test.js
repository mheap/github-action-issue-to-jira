const { Toolkit } = require('actions-toolkit')
const nock = require('nock')
nock.disableNetConnect()

describe('Issue to Jira', () => {
  let action, tools

  // Mock Toolkit.run to define `action` so we can call it
  Toolkit.run = jest.fn((actionFn) => { action = actionFn })
  // Load up our entrypoint file
  require('.')

  beforeEach(() => {
    // Create a new Toolkit instance
    tools = new Toolkit()
    // Mock methods on it!
    tools.exit.success = jest.fn()
    tools.exit.failure = jest.fn()
    tools.log.info = jest.fn()
  })

  describe('Failure cases', () => {
    afterEach(() => {
      expect(tools.exit.failure).toHaveBeenCalled()
    })

    it('fails gracefully on missing input (Jira Host)', async () => {
      await action(tools)
      expect(tools.exit.failure).toHaveBeenCalledWith('Input required and not supplied: jiraHost')
    });

    it('fails gracefully on missing input (Jira Username)', async () => {
    process.env.INPUT_JIRAHOST = "example.com";
      await action(tools)
      expect(tools.exit.failure).toHaveBeenCalledWith('Input required and not supplied: jiraUsername')
    });

    it('fails gracefully on missing input (Jira Password)', async () => {
      process.env.INPUT_JIRAHOST = "example.com";
      process.env.INPUT_JIRAUSERNAME = "adminlogin";
      await action(tools)
      expect(tools.exit.failure).toHaveBeenCalledWith('Input required and not supplied: jiraPassword')
    });
  });

  it('exits successfully', async () => {
    process.env.INPUT_JIRAHOST = "example.com";
    process.env.INPUT_JIRAUSERNAME = "adminlogin";
    process.env.INPUT_JIRAPASSWORD = "notmyrealpassword";
    process.env.INPUT_PROJECT = "SP";
    process.env.INPUT_ASSIGNEE = "admin";

    tools.log.pending = jest.fn()
    tools.log.complete = jest.fn()

    tools.context.payload = {
      "issue": {
        "title": "Hello World",
        "body": "This is an example",
        "html_url": "https://github.com/mheap/action-test/issues/123",
        "user": {
            "html_url": "https://github.com/mheap"
        }
      }
    }

    nock('https://example.com')
      .post('/rest/api/2/issue', {"fields":{"assignee":{"name":"admin"},"project":{"key":"SP"},"summary":"Hello World","description":"This is an example\n\nRaised by: https://github.com/mheap\n\nhttps://github.com/mheap/action-test/issues/123","issuetype":{"name":"Task"}}})
      .reply(200, {})

    await action(tools)
    expect(tools.exit.success).toHaveBeenCalled()
    expect(tools.exit.success).toHaveBeenCalledWith('We did it!')
    expect(tools.log.pending).toHaveBeenCalledWith("Creating Jira ticket with the following parameters");
    expect(tools.log.complete).toHaveBeenCalledWith("Created Jira ticket");
  })
})
