# EP Deployment Preview Action
Given an EP application version ID and event broker ID, write the diff to `diff.txt`. 

## Example Usage
Adding the diff as a PR comment:
```
- name: Calculate diff
  uses: j-setiawan/ep-deployment-preview-action@v1
  with:
    application_version_id: 'my-app-version-id'
    event_broker_id: 'my-event-broker-id'
    solace_cloud_token: ${{ secrets.SOLACE_CLOUD_TOKEN }}

- name: Create PR comment
  uses: actions/github-script@v5
  with:
    script: |
      const fs = require('fs');
      const diff = fs.readFileSync('diff.txt', 'utf8');
      github.rest.issues.createComment({
          issue_number: context.issue.number,
          owner: context.repo.owner,
          repo: context.repo.repo,
          body: `\`\`\`\n${diff}\n\`\`\``
      });
```
