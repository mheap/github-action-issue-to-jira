const { Toolkit } = require('actions-toolkit')

// Run your GitHub Action!
Toolkit.run(async tools => {

  const payload = tools.context.payload;
  tools.log.info(payload.issue.title);
  tools.log.info(payload.issue.body);

  tools.exit.success('We did it!')
})
