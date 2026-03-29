import { IpResult } from '../types';

/**
 * IP API 配置接口
 * 每个 API 都有自己的请求方式和响应格式，需要适配器转换
 */
export interface IpApiConfig {
  name: string;
  /** 获取本机 IP */
  getMyIpUrl: string;
  /** 获取指定 IP 信息，:ip 会被替换为实际 IP */
  getIpUrl: (ip: string) => string;
  /** 响应适配器：将 API 响应转换为统一格式 */
  adapter: (data: unknown, requestIp?: string) => IpResult | null;
  /** 是否支持查询指定 IP */
  supportsQueryIp?: boolean;
}

/**
 * ip-api.com 适配器
 * 响应格式：{"status":"success","countryCode":"CN",...}
 */
const ipApiAdapter: IpApiConfig['adapter'] = (data, requestIp) => {
  const d = data as Record<string, unknown>;
  if (!d || d.status !== 'success') return null;

  return {
    status: 'success',
    country: (d.country as string) || '',
    countryCode: (d.countryCode as string) || '',
    regionName: (d.regionName as string) || '',
    city: (d.city as string) || '',
    isp: (d.isp as string) || '',
    org: (d.org as string) || '',
    as: (d.as as string) || '',
    query: (d.query as string) || requestIp || '',
  };
};

/**
 * api.ip.sb 适配器
 * 响应格式：{"ip":"121.8.215.106","city":"Guangzhou","region":"Guangdong","country":"China",...}
 */
const ipSbAdapter: IpApiConfig['adapter'] = (data, requestIp) => {
  const d = data as Record<string, unknown>;
  if (!d || !d.ip) return null;

  return {
    status: 'success',
    country: (d.country as string) || '',
    countryCode: (d.country_code as string) || '',
    regionName: (d.region as string) || '',
    city: (d.city as string) || '',
    isp: (d.isp as string) || '',
    org: (d.organization as string) || '',
    as: (d.asn as string) || '',
    query: (d.ip as string) || requestIp || '',
  };
};

/**
 * API 配置列表，按优先级排序
 * 前面的 API 失败后会按顺序尝试后面的
 */
export const IP_APIS: IpApiConfig[] = [
  {
    name: 'ip-api.com',
    getMyIpUrl: 'https://ip-api.com/json/?fields=status,country,countryCode,region,regionName,city,isp,org,as,query',
    getIpUrl: (ip) => `https://ip-api.com/json/${ip}?fields=status,country,countryCode,region,regionName,city,isp,org,as,query`,
    adapter: ipApiAdapter,
    supportsQueryIp: true,
  },
  {
    name: 'api.ip.sb',
    getMyIpUrl: 'https://api.ip.sb/geoip/',
    getIpUrl: (ip) => `https://api.ip.sb/geoip/${ip}`,
    adapter: ipSbAdapter,
    supportsQueryIp: true,
  },
];

/**
 * 获取本机 IP 信息（多 API 降级）
 */
export async function fetchMyIpInfo(): Promise<IpResult> {
  const errors: string[] = [];

  for (const api of IP_APIS) {
    try {
      const start = performance.now();
      const response = await fetch(api.getMyIpUrl);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const latency = Math.round(performance.now() - start);
      const result = api.adapter(data);

      if (result) {
        return { ...result, latency };
      }
    } catch (err) {
      errors.push(`${api.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  throw new Error(`All APIs failed: ${errors.join('; ')}`);
}

/**
 * 获取指定 IP 的信息（多 API 降级）
 */
export async function fetchIpInfo(ip: string): Promise<IpResult> {
  const errors: string[] = [];

  for (const api of IP_APIS) {
    if (!api.supportsQueryIp) continue;

    try {
      const start = performance.now();
      const response = await fetch(api.getIpUrl(ip));

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const latency = Math.round(performance.now() - start);
      const result = api.adapter(data, ip);

      if (result) {
        return { ...result, latency };
      }
    } catch (err) {
      errors.push(`${api.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  throw new Error(`All APIs failed: ${errors.join('; ')}`);
}
