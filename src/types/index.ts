export interface IpResult {
  status: 'success' | 'fail';
  country: string;
  countryCode: string;
  regionName: string;
  city: string;
  isp: string;
  org: string;
  as: string;
  query: string;
  latency?: number;
}

export interface NodeConfig {
  name: string;
  location: string;
  country?: string;
}

export interface NodeResult {
  node: string;
  location: string;
  result: IpResult | null;
  error?: string;
  isLoading?: boolean;
}

export const DOMESTIC_NODES: NodeConfig[] = [
  { name: '北京', location: 'BJ' },
  { name: '上海', location: 'SH' },
  { name: '广州', location: 'GZ' },
  { name: '深圳', location: 'SZ' },
];

export const OVERSEAS_NODES: NodeConfig[] = [
  { name: '美国', location: 'US' },
  { name: '日本', location: 'JP' },
  { name: '香港', location: 'HK' },
  { name: '新加坡', location: 'SG' },
];
