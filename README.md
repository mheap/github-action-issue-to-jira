# Issue To Jira

This GitHub Action will create a Jira ticket whenever a new GitHub Issue is raised. Any comments on the issue will be posted to the Jira ticket as comments and any labels applied/removed will be synced

Please check the [open issues](https://github.com/mheap/github-action-issue-to-jira/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc) and add a comment if any of the feature requests would be useful for you.

## Usage

Create a file containing the following at `.github/workflows/jira.yml`:

```yaml
name: Jira Sync
on:
  issues:
    types: [opened, labeled, unlabeled]
  issue_comment:
    types: [created]
jobs:
  sync:
    name: Sync Items
    runs-on: ubuntu-latest
    steps:
      - name: Sync
        uses: mheap/github-action-issue-to-jira@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          jiraHost: ${{ secrets.JIRA_HOST }}
          jiraUsername: ${{ secrets.JIRA_USERNAME }}
          jiraPassword: ${{ secrets.JIRA_PASSWORD }} # See https://id.atlassian.com/manage/api-tokens
          project: PROJECTKEY
          assignee: default_assignee
```
