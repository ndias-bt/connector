// configuration.ts

import * as os from 'os';
import { google } from 'googleapis';

function getConnectorUrl() {
  console.log("Detecting connector url...");
  let connectorUrl = '';
  if (process.env.RUN_ENVIRONMENT === 'gcp') {
    console.log('GCP run environment detected. Looking up connector url using cloud run api.');
    getCloudRunConnectorUrl('connector-with-form').then((urls) => {
      if (urls.length === 1) {
        connectorUrl = urls.pop();
      }
    });
  } else {
    console.log("Getting connector URL from environment");
    connectorUrl = 'http://' + process.env.IP_ADDRESS + ':' + process.env.PORT;
  }

  console.log('connector url: ', connectorUrl);
  return connectorUrl;
}

export const configuration = () => ({
  name: process.env.NAME,
  displayName: process.env.DISPLAY_NAME,
  description: process.env.DESCRIPTION,
  company: process.env.COMPANY,
  version: process.env.VERSION,
  ipAddress: process.env.IP_ADDRESS,
  hostname: os.hostname(),
  port: process.env.PORT,
  url: getConnectorUrl(),
  registrationUrl: process.env.REGISTRATION_URL,
});

async function getCloudRunConnectorUrl(connectorName) {
  console.log('### looking up connector url for connectorName', connectorName);

  const connectorFarmProjectId = 'connector-registry-poc';

  const run = google.run('v1');

  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const authClient = await auth.getClient();
  google.options({ auth: authClient });

  const params = {
    parent: `namespaces/${connectorFarmProjectId}`,
    watch: false,
  };

  const results = await run.namespaces.services.list(params);

  console.log('### results', results);

  const connectorUrls = [];

  results.data.items.forEach((item) => {
    console.log('### found connector:', item.metadata.name);

    if (item.metadata.name === connectorName) {
      connectorUrls.push(item.status.url);
    }
  });

  console.log('### connectorUrls', connectorUrls);
  return connectorUrls;
}
