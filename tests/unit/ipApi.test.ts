import { describe, it, expect, vi } from 'vitest';
import { fetchMyIpInfo, fetchIpInfo } from '../../src/services/ipApi';

global.fetch = vi.fn();

describe('fetchMyIpInfo', () => {
  it('should return IP info with latency from ip-api', async () => {
    const mockData = {
      status: 'success',
      country: 'China',
      countryCode: 'CN',
      regionName: 'Guangdong',
      city: 'Guangzhou',
      isp: 'China Telecom',
      org: '',
      as: 'AS23724',
      query: '1.2.3.4',
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    } as Response);

    const result = await fetchMyIpInfo();

    expect(result.status).toBe('success');
    expect(result.country).toBe('China');
    expect(result.query).toBe('1.2.3.4');
    expect(result.latency).toBeGreaterThanOrEqual(0);
  });

  it('should fallback to second API on first failure', async () => {
    // First API fails
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response)
      // Second API succeeds (ip.sb format)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          ip: '5.6.7.8',
          country: 'Japan',
          country_code: 'JP',
          region: 'Tokyo',
          city: 'Tokyo',
          isp: 'Example ISP',
          organization: 'Example Org',
          asn: 'AS12345',
        }),
      } as Response);

    const result = await fetchMyIpInfo();

    expect(result.status).toBe('success');
    expect(result.country).toBe('Japan');
    expect(result.query).toBe('5.6.7.8');
  });
});

describe('fetchIpInfo', () => {
  it('should return IP info for given IP from ip-api', async () => {
    const mockData = {
      status: 'success',
      country: 'Japan',
      countryCode: 'JP',
      regionName: 'Tokyo',
      city: 'Tokyo',
      isp: 'IDC Cube',
      org: '',
      as: 'AS36530',
      query: '82.26.72.132',
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    } as Response);

    const result = await fetchIpInfo('82.26.72.132');

    expect(result.status).toBe('success');
    expect(result.country).toBe('Japan');
    expect(result.query).toBe('82.26.72.132');
    expect(result.latency).toBeGreaterThanOrEqual(0);
  });

  it('should handle ip.sb format', async () => {
    // First API (ip-api.com) fails, second (ip.sb) succeeds
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          ip: '121.8.215.106',
          country: 'China',
          country_code: 'CN',
          region: 'Guangdong',
          city: 'Guangzhou',
          isp: 'China Telecom',
          organization: 'China Telecom',
          asn: 'AS23724',
        }),
      } as Response);

    const result = await fetchIpInfo('121.8.215.106');

    expect(result.status).toBe('success');
    expect(result.country).toBe('China');
    expect(result.countryCode).toBe('CN');
    expect(result.query).toBe('121.8.215.106');
  });
});
