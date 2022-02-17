// configuration.ts

import * as os from 'os';

import { google } from 'googleapis';

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

function getConnectorUrl() {
  let base_url = process.env.BASE_URL ?? os.hostname();

  const connectorName = process.env?.K_SERVICE;

  if (connectorName) {
    getCloudRunConnectorUrl(connectorName).then((url: string) => {
      if (url) {
        base_url = url;
      }
    });
  }
  return base_url;
}

async function getCloudRunConnectorUrl(connectorName: string) {
  console.log(`### looking up connector ${connectorName} via cloud run api`);

  const connectorsCloudProjectId = 'connector-registry-poc';

  const run = google.run('v1');

  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const authClient = await auth.getClient();
  google.options({ auth: authClient });

  const params = {
    parent: `namespaces/${connectorsCloudProjectId}`,
    watch: false,
  };

  const results = await run.namespaces.services.list(params);

  const connectorUrls = [];

  results.data.items.forEach((item) => {
    console.log(`### found connector ${item.metadata.name}`);
    connectorUrls.push(item.status.url);
  });

  if (connectorUrls.length === 1) {
    return connectorUrls[0];
  } else {
    return null;
  }
}
