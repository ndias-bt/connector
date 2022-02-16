import {
  Injectable,
  HttpService,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';
import { Endpoint } from '../../interfaces/endpoint.interface';
import { Connector } from '../../interfaces/connector.interface';
import { google } from 'googleapis';

@Injectable()
export class RegistrationService implements OnApplicationBootstrap {
  constructor(private http: HttpService, private config: ConfigService) {}

  onApplicationBootstrap(): any {
    console.log('### initiating connector registration');
    this.register().then((result) => {
      result.subscribe((data) => {
        console.log(data);
      });
    });
    console.log('### done registering');
  }

  async register() {
    const configEndpoint: Endpoint = {
      name: 'config',
      address: this.config.get<string>('ipAddress'),
      port: this.config.get<string>('port'),
      path: '/config',
    };

    const infoEndpoint: Endpoint = {
      name: 'info',
      address: this.config.get<string>('ipAddress'),
      port: this.config.get<string>('port'),
      path: '/info',
    };

    const connector: Connector = {
      name: this.config.get<string>('name'),
      base_url: await this.getBaseUrl(),
      displayName: this.config.get<string>('displayName'),
      description: this.config.get<string>('description'),
      company: this.config.get<string>('company'),
      endpoints: [infoEndpoint, configEndpoint],
      version: this.config.get<string>('version')
    };

    console.log('### connector.base_url', connector.base_url);

    return this.http
      .post(this.config.get<string>('registrationUrl'), connector)
      .pipe(map((response) => response.data));
  }

  /**
   * @return baseUrl - the base url of the connector to be registered
   * Use the google cloud run provided URL if detectable, otherwise

   */
  async getBaseUrl() {
    let cloudRunUrl = null;
    if (process.env.RUN_ENVIRONMENT === 'gcp') {
      cloudRunUrl = await this.getCloudRunConnectorUrl(process.env.NAME);
    }

    return cloudRunUrl || this.config.get<string>('url');
  }

  /**
   * Searches cloud run api for a connector
   * @param connectorName
   */
  async getCloudRunConnectorUrl(connectorName: string) {
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
    google.options({ auth: authClient });

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
    return connectorUrls.pop();
  }
}
