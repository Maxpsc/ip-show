import { describe, it, expect, vi } from 'vitest';
import { fetchIpInfo } from '../../src/services/ipApi';

global.fetch = vi.fn();

describe('fetchIpInfo', () => {
  it('should return IP info with latency', async () => {
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

  it('should handle error response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: 'fail', query: '192.168.1.1' }),
    } as Response);

    const result = await fetchIpInfo('192.168.1.1');

    expect(result.status).toBe('fail');
  });
});
