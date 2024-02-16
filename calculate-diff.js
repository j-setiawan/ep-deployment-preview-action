const core = require('@actions/core');
const diff = require('json-diff');
const fs = require('fs');
const https = require('https');

const applicationVersionId = core.getInput('application_version_id');
const eventBrokerId = core.getInput('event_broker_id');
const solaceCloudToken = core.getInput('solace_cloud_token');

const data = JSON.stringify({
  "applicationVersionId": `${applicationVersionId}`,
  "action": "deploy",
  "eventBrokerId": `${eventBrokerId}`
});

const options = {
  hostname: 'api.solace.cloud',
  port: 443,
  path: '/api/v2/architecture/runtimeManagement/applicationDeploymentPreviews',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${solaceCloudToken}`,
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  let response = '';

  res.on('data', d => {
    response += d;
  });

  res.on('end', () => {
    core.debug(response);
    const parsedResponse = JSON.parse(response);
    const requested = parsedResponse.data.requested;
    const existing = parsedResponse.data.existing;
    let diffResult = '';

    for (let i = 0; i < requested.length; i++) {
      const requestedItem = JSON.parse(requested[i].value);
      const existingItem = existing[i] === undefined ? {} : JSON.parse(existing[i].value);

      diffResult += `${requested[i].type}: ${requested[i].identifier}\n`;
      diffResult += `${diff.diffString(existingItem, requestedItem)}\n`;
    }

    core.debug(diffResult);
    fs.writeFileSync('diff.txt', diffResult);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
