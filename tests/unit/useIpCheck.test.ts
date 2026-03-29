import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useIpCheck } from '../../src/hooks/useIpCheck';
import { fetchIpInfo } from '../../src/services/ipApi';

vi.mock('../../src/services/ipApi');

describe('useIpCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty results', async () => {
    const { result } = renderHook(() => useIpCheck());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.domesticResults).toHaveLength(4);
    expect(result.current.overseasResults).toHaveLength(4);
  });

  it('should fetch IP info for all nodes', async () => {
    const mockResult = {
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
    };

    vi.mocked(fetchIpInfo).mockResolvedValue(mockResult);

    const { result } = renderHook(() => useIpCheck());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.domesticResults).toHaveLength(4);
    expect(result.current.overseasResults).toHaveLength(4);
  });
});