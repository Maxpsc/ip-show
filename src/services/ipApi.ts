import { IpResult } from '../types';

const API_BASE = 'http://ip-api.com/json';
const FIELDS = 'status,country,countryCode,region,regionName,city,isp,org,as,query';

export async function fetchIpInfo(ip?: string): Promise<IpResult> {
  const url = ip
    ? `${API_BASE}/${ip}?fields=${FIELDS}`
    : `${API_BASE}?fields=${FIELDS}`;

  const start = performance.now();
  const response = await fetch(url);
  const data = await response.json();
  const latency = Math.round(performance.now() - start);

  return {
    ...data,
    query: ip || data.query,
    latency,
  } as IpResult;
}
