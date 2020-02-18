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
  })

  it('exits successfully', async () => {
    process.env.INPUT_JIRAHOST = "example.com";
    process.env.INPUT_JIRAUSERNAME = "adminlogin";
    process.env.INPUT_JIRAPASSWORD = "notmyrealpassword";
    process.env.INPUT_PROJECT = "SP";
    process.env.INPUT_ASSIGNEE = "admin";

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
      .post('/rest/api/2/issue')
      .reply(200, {})

    await action(tools)
    expect(tools.exit.success).toHaveBeenCalled()
    expect(tools.exit.success).toHaveBeenCalledWith('We did it!')
  })
})
