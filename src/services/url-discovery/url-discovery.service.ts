import {
  Injectable,
  HttpService,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';

@Injectable()
export class UrlDiscoveryService {

  constructor(private http: HttpService, private config: ConfigService) {}

  async getConnectorUrl() {
    const defaultUrl = this.config.get('url');
    const connectorName = this.config.get('name');

    if (process.env.K_SERVICE) {
      // deployed on cloud run
      return await this.getCloudRunConnectorUrl(connectorName);
    }

    return this.config.get('url');
  }

  async getCloudRunConnectorUrl(connectorName: string): Promise<string> {
    console.log(
      '### looking up connector url for connectorName',
      connectorName,
    );

    // TODO: put this default in a config file, with way to override
    const connectorFarmProjectId = 'connector-registry-poc';

    const run = google.run('v1');

    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const authClient = await auth.getClient();
    google.options({auth: authClient});

    const params = {
      parent: `namespaces/${connectorFarmProjectId}`,
      watch: false,
    };

    // NOTE: we use services.list instead of services.get here
    //  b/c the run api is coded to hit the global run.googleapis.com
    //  endpoint instead of the regional endpoints, and the global
    //  endpoint is restricted to list calls only
    //
    //  This is a security risk, since any connector would be able
    //  to retrieve other connectors registered in the same namespace.
    //
    //  TODO: replace this with a services.get call, or other method
    //  that fetches url for the specific connector only.

    const results = await run.namespaces.services.list(params);

    const connectorUrls = [];

    results.data.items.forEach((item) => {
      console.log('### found connector:', item.metadata.name);

      if (item.metadata.name === connectorName) {
        connectorUrls.push(item.status.url);
      }
    });

    console.log('### connectorUrls', connectorUrls);

    if (connectorUrls.length === 1) {
      console.log('### returning', connectorUrls[0]);
      return connectorUrls[0];
    } else {
      console.log('### errors', connectorUrls);
      return null;
    }
  }
}