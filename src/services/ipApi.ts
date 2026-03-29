import { IpResult } from '../types';
import { IP_APIS } from '../config/ipApis';

// 重新导出 IpApiConfig 类型
export type { IpApiConfig } from '../config/ipApis';
export { IP_APIS };

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
