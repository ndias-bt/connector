import { Endpoint } from './endpoint.interface';

export interface Connector {
  name: string;
  displayName: string;
  description: string;
  version: string;
  base_url: string;
  endpoints: Endpoint[];
}
