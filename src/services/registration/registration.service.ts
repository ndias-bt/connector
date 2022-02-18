import {
  Injectable,
  HttpService,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Endpoint } from '../../interfaces/endpoint.interface';
import { Connector } from '../../interfaces/connector.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RegistrationService {
  private urlToRegister: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  // onApplicationBootstrap(): any {
  //   console.log('### initiating connector registration');
  //   this.register().subscribe((data) => {
  //     console.log(data);
  //   });
  //   console.log('### done registering');
  // }

  getUrlToRegister() {
    return this.urlToRegister;
  }

  setUrlToRegister(url: string) {
    this.urlToRegister = url;
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
      base_url: this.urlToRegister,
      displayName: this.config.get<string>('displayName'),
      description: this.config.get<string>('description'),
      company: this.config.get<string>('company'),
      endpoints: [infoEndpoint, configEndpoint],
      version: this.config.get<string>('version'),
    };

    return this.http.post(
      this.config.get<string>('registrationUrl'),
      connector,
    ).toPromise();

    // .pipe(map((response) => response.data));
  }
}
