import { IpResult } from '../types';

// IpApiConfig 接口定义
export interface IpApiConfig {
  name: string;
  getMyIpUrl: string;
  getIpUrl: (ip: string) => string;
  adapter: (data: unknown, requestIp?: string) => IpResult | null;
  supportsQueryIp?: boolean;
}

/**
 * IP API 适配器 - 将不同 API 的响应格式统一转换为 IpResult
 */

// ip-api.com 适配器
// const ipApiComAdapter: IpApiConfig['adapter'] = (data, requestIp) => {
//   const d = data as Record<string, unknown>;
//   if (!d || d.status !== 'success') return null;
//   return {
//     status: 'success',
//     country: (d.country as string) || '',
//     countryCode: (d.countryCode as string) || '',
//     regionName: (d.regionName as string) || '',
//     city: (d.city as string) || '',
//     isp: (d.isp as string) || '',
//     org: (d.org as string) || '',
//     as: (d.as as string) || '',
//     query: (d.query as string) || requestIp || '',
//   };
// };

// api.ip.sb 适配器
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

// whois.pconline.com.cn 适配器 (国内API)
const pconlineAdapter: IpApiConfig['adapter'] = (data, requestIp) => {
  const d = data as Record<string, unknown>;
  if (!d || d.err) return null;
  return {
    status: 'success',
    country: '中国',
    countryCode: 'CN',
    regionName: (d.pro as string) || '',
    city: (d.city as string) || '',
    isp: '',
    org: '',
    as: '',
    query: (d.ip as string) || requestIp || '',
  };
};

// api.ip2location.io 适配器
const ip2locationAdapter: IpApiConfig['adapter'] = (data, requestIp) => {
  const d = data as Record<string, unknown>;
  if (!d || !d.ip) return null;
  return {
    status: 'success',
    country: (d.country_name as string) || '',
    countryCode: (d.country_code as string) || '',
    regionName: (d.region_name as string) || '',
    city: (d.city_name as string) || '',
    isp: (d.asn as string) || '',
    org: '',
    as: (d.asn as string) || '',
    query: (d.ip as string) || requestIp || '',
  };
};

// realip.cc 适配器
const realipCcAdapter: IpApiConfig['adapter'] = (data, requestIp) => {
  const d = data as Record<string, unknown>;
  if (!d || !d.ip) return null;
  return {
    status: 'success',
    country: (d.country as string) || '',
    countryCode: '',
    regionName: '',
    city: (d.city as string) || '',
    isp: (d.isp as string) || '',
    org: (d.network as string) || '',
    as: '',
    query: (d.ip as string) || requestIp || '',
  };
};

// ipapi.co 适配器
const ipapiCoAdapter: IpApiConfig['adapter'] = (data, requestIp) => {
  const d = data as Record<string, unknown>;
  if (!d || !d.ip || d.error) return null;
  return {
    status: 'success',
    country: (d.country as string) || '',
    countryCode: (d.country_code as string) || '',
    regionName: (d.region as string) || '',
    city: (d.city as string) || '',
    isp: '',
    org: (d.org as string) || '',
    as: (d.asn as string) || '',
    query: (d.ip as string) || requestIp || '',
  };
};

// api.ipapi.is 适配器
const ipapiIsAdapter: IpApiConfig['adapter'] = (data, requestIp) => {
  const d = data as Record<string, unknown>;
  if (!d || !d.ip) return null;
  const loc = d.location as Record<string, unknown> || {};
  const company = d.company as Record<string, unknown> || {};
  return {
    status: 'success',
    country: (loc.country as string) || '',
    countryCode: (loc.country_code as string) || '',
    regionName: (loc.region as string) || '',
    city: (loc.city as string) || '',
    isp: (company.isp as string) || '',
    org: (company.name as string) || '',
    as: ((d.asn as Record<string, unknown>)?.asn as string) || '',
    query: (d.ip as string) || requestIp || '',
  };
};

// freeipapi.com 适配器
const freeipapiAdapter: IpApiConfig['adapter'] = (data, requestIp) => {
  const d = data as Record<string, unknown>;
  if (!d || !d.ipAddress) return null;
  return {
    status: 'success',
    country: (d.countryName as string) || '',
    countryCode: (d.countryCode as string) || '',
    regionName: (d.regionName as string) || '',
    city: (d.cityName as string) || '',
    isp: '',
    org: '',
    as: '',
    query: (d.ipAddress as string) || requestIp || '',
  };
};

// ipwhois.app 适配器
const ipwhoisAdapter: IpApiConfig['adapter'] = (data, requestIp) => {
  const d = data as Record<string, unknown>;
  if (!d || d.success === false) return null;
  return {
    status: 'success',
    country: (d.country as string) || '',
    countryCode: '',
    regionName: (d.region as string) || '',
    city: (d.city as string) || '',
    isp: (d.isp as string) || '',
    org: (d.org as string) || '',
    as: (d.asn as string) || '',
    query: (d.ip as string) || requestIp || '',
  };
};

// ip.nc.gy 适配器
const ipNcgAdapter: IpApiConfig['adapter'] = (data, requestIp) => {
  const d = data as Record<string, unknown>;
  if (!d || !d.ip) return null;
  return {
    status: 'success',
    country: (d.country as string) || '',
    countryCode: '',
    regionName: '',
    city: (d.city as string) || '',
    isp: (d.asn as string) || '',
    org: '',
    as: (d.asn as string) || '',
    query: (d.ip as string) || requestIp || '',
  };
};

/**
 * IP API 配置列表 - 按优先级排序
 * 前面的 API 失败后会按顺序尝试后面的
 */
export const IP_APIS: IpApiConfig[] = [
  // {
  //   name: 'ip-api.com',
  //   getMyIpUrl: 'https://ip-api.com/json/?fields=status,country,countryCode,region,regionName,city,isp,org,as,query',
  //   getIpUrl: (ip) => `https://ip-api.com/json/${ip}?fields=status,country,countryCode,region,regionName,city,isp,org,as,query`,
  //   adapter: ipApiComAdapter,
  //   supportsQueryIp: true,
  // },
  {
    name: 'api.ip.sb',
    getMyIpUrl: 'https://api.ip.sb/geoip/',
    getIpUrl: (ip) => `https://api.ip.sb/geoip/${ip}`,
    adapter: ipSbAdapter,
    supportsQueryIp: true,
  },
  {
    name: 'whois.pconline.com.cn',
    getMyIpUrl: 'https://whois.pconline.com.cn/ipJson.jsp?ip=&json=true',
    getIpUrl: (ip) => `https://whois.pconline.com.cn/ipJson.jsp?ip=${ip}&json=true`,
    adapter: pconlineAdapter,
    supportsQueryIp: true,
  },
  {
    name: 'api.ip2location.io',
    getMyIpUrl: 'https://api.ip2location.io/?key=demo',
    getIpUrl: (ip) => `https://api.ip2location.io/?ip=${ip}&key=demo`,
    adapter: ip2locationAdapter,
    supportsQueryIp: true,
  },
  {
    name: 'realip.cc',
    getMyIpUrl: 'https://realip.cc/',
    getIpUrl: (ip) => `https://realip.cc/?ip=${ip}`,
    adapter: realipCcAdapter,
    supportsQueryIp: true,
  },
  {
    name: 'ipapi.co',
    getMyIpUrl: 'https://ipapi.co/json/',
    getIpUrl: (ip) => `https://ipapi.co/${ip}/json/`,
    adapter: ipapiCoAdapter,
    supportsQueryIp: true,
  },
  {
    name: 'api.ipapi.is',
    getMyIpUrl: 'https://api.ipapi.is',
    getIpUrl: (ip) => `https://api.ipapi.is/?ip=${ip}`,
    adapter: ipapiIsAdapter,
    supportsQueryIp: true,
  },
  {
    name: 'freeipapi.com',
    getMyIpUrl: 'https://freeipapi.com/api/json',
    getIpUrl: (ip) => `https://freeipapi.com/api/json/${ip}`,
    adapter: freeipapiAdapter,
    supportsQueryIp: true,
  },
  {
    name: 'ipwhois.app',
    getMyIpUrl: 'https://ipwhois.app/json/?format=json',
    getIpUrl: (ip) => `https://ipwhois.app/json/${ip}?format=json`,
    adapter: ipwhoisAdapter,
    supportsQueryIp: true,
  },
  {
    name: 'ip.nc.gy',
    getMyIpUrl: 'https://ip.nc.gy/json',
    getIpUrl: (ip) => `https://ip.nc.gy/json?ip=${ip}`,
    adapter: ipNcgAdapter,
    supportsQueryIp: true,
  },
];
