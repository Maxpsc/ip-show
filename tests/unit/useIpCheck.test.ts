import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useIpCheck } from '../../src/hooks/useIpCheck';
import { fetchIpInfo } from '../../src/services/ipApi';

// Mock WebRTC module before importing hook
vi.mock('../../src/services/webrtcIp', () => ({
  getPublicIP: vi.fn().mockResolvedValue({ ip: '1.2.3.4', type: 'prflx' }),
  getAllIPs: vi.fn().mockResolvedValue([]),
}));

// Mock ip-api
vi.mock('../../src/services/ipApi', () => ({
  fetchIpInfo: vi.fn().mockResolvedValue({
    status: 'success',
    country: 'China',
    countryCode: 'CN',
    regionName: 'Beijing',
    city: 'Beijing',
    isp: 'China Telecom',
    org: '',
    as: 'AS23724',
    query: '1.2.3.4',
    latency: 50,
  }),
}));

describe('useIpCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch IP info for all nodes', async () => {
    const { result } = renderHook(() => useIpCheck());

    // Wait for loading to complete
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 3000 });

    expect(result.current.domesticResults).toHaveLength(4);
    expect(result.current.overseasResults).toHaveLength(4);
    expect(result.current.actualEgressIp).toBe('1.2.3.4');
  });
});
