import { IpResult } from '../types';
import { IP_APIS } from '../config/ipApis';

// 重新导出 IpApiConfig 类型
export type { IpApiConfig } from '../config/ipApis';
export { IP_APIS };

const DEBUG = false;

function debug(...args: unknown[]) {
  if (DEBUG) console.log('[API]', ...args);
}

/**
 * 获取本机 IP 信息（多 API 降级）
 */
export async function fetchMyIpInfo(): Promise<IpResult> {
  const errors: string[] = [];

  for (const api of IP_APIS) {
    try {
      const start = performance.now();
      debug(`Trying ${api.name} for my IP...`);
      const response = await fetch(api.getMyIpUrl);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = api.encoding
        ? JSON.parse(new TextDecoder(api.encoding).decode(await response.arrayBuffer()))
        : await response.json();
      const latency = Math.round(performance.now() - start);
      const result = api.adapter(data);

      if (result) {
        debug(`${api.name} returned:`, result);
        return { ...result, latency };
      } else {
        debug(`${api.name} adapter returned null`);
      }
    } catch (err) {
      debug(`${api.name} failed:`, err);
      errors.push(`${api.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  debug('All APIs failed:', errors);
  throw new Error(`All APIs failed: ${errors.join('; ')}`);
}

/**
 * 通过 pconline 获取大陆 IP 信息（GBK 编码）
 */
export async function fetchPconlineIpInfo(): Promise<IpResult> {
  const api = IP_APIS.find((a) => a.name === 'whois.pconline.com.cn');
  if (!api) throw new Error('pconline API not configured');

  const start = performance.now();
  const response = await fetch(api.getMyIpUrl);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const data = JSON.parse(new TextDecoder('gbk').decode(await response.arrayBuffer()));
  const latency = Math.round(performance.now() - start);
  const result = api.adapter(data);
  if (!result) throw new Error('pconline adapter returned null');
  return { ...result, latency };
}

/**
 * 获取指定 IP 的信息（多 API 降级）
 */
export async function fetchIpInfo(ip: string): Promise<IpResult> {
  const errors: string[] = [];

  debug(`Fetching info for IP: ${ip}`);

  for (const api of IP_APIS) {
    if (!api.supportsQueryIp) continue;

    try {
      const start = performance.now();
      debug(`Trying ${api.name} for ${ip}...`);
      const response = await fetch(api.getIpUrl(ip));

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = api.encoding
        ? JSON.parse(new TextDecoder(api.encoding).decode(await response.arrayBuffer()))
        : await response.json();
      const latency = Math.round(performance.now() - start);
      const result = api.adapter(data, ip);

      if (result) {
        debug(`${api.name} returned:`, result);
        return { ...result, latency };
      } else {
        debug(`${api.name} adapter returned null`);
      }
    } catch (err) {
      debug(`${api.name} failed:`, err);
      errors.push(`${api.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  debug('All APIs failed for', ip, errors);
  throw new Error(`All APIs failed: ${errors.join('; ')}`);
}
