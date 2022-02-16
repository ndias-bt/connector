import { Endpoint } from './endpoint.interface';

export interface Connector {
  name: string;
  displayName: string;
  description: string;
  company: string;
  version: string;
  base_url: string;
  endpoints: Endpoint[];
}
