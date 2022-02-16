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
      console.log('### result', result);
    });
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
      base_url: await this.getCloudRunConnectorUrl(process.env.NAME),
      displayName: this.config.get<string>('displayName'),
      description: this.config.get<string>('description'),
      endpoints: [infoEndpoint, configEndpoint],
      name: this.config.get<string>('name'),
      version: '1.0',
    };

    console.log('### connector.base_url', connector.base_url);

    return this.http
      .post(this.config.get<string>('registrationUrl'), connector)
      .pipe(map((response) => response.data));
  }

  // getConnectorUrl() {
  //   console.log('Detecting connector url...');
  //
  //   let connectorUrl = process.env.BASE_URL;
  //
  //   // let connectorUrl = 'http://' + process.env.IP_ADDRESS + ':' + process.env.PORT;
  //   console.log('Using default from environment setting:', connectorUrl);
  //
  //   if (process.env.RUN_ENVIRONMENT === 'gcp') {
  //     console.log(
  //       'GCP run environment detected. Searching for connector url using cloud run api.',
  //     );
  //     getCloudRunConnectorUrl(process.env.NAME).then((urls) => {
  //       if (urls.length === 1) {
  //         connectorUrl = urls.pop();
  //         console.log('Found url using cloud run api:', connectorUrl);
  //       }
  //     });
  //   }
  //
  //   console.log('final connector url: ', connectorUrl);
  //   return connectorUrl;
  // }

  async getCloudRunConnectorUrl(connectorName: string) {
    console.log(
      '### looking up connector url for connectorName',
      connectorName,
    );

    const connectorFarmProjectId = 'connector-registry-poc';

    const run = google.run('v1');

    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    console.log('### google auth', auth);

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
    return connectorUrls.pop();
  }
}
