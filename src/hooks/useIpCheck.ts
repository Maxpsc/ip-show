import { useState, useCallback, useEffect } from 'react';
import { fetchMyIpInfo, fetchIpInfo } from '../services/ipApi';
import { getPublicIP } from '../services/webrtcIp';
import { DOMESTIC_NODES, OVERSEAS_NODES, IpResult, NodeResult } from '../types';

export function useIpCheck() {
  const [domesticResults, setDomesticResults] = useState<NodeResult[]>([]);
  const [overseasResults, setOverseasResults] = useState<NodeResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actualEgressIp, setActualEgressIp] = useState<string | null>(null);

  const check = useCallback(async () => {
    setIsLoading(true);

    // Initialize results with loading state
    const initResults = (nodes: typeof DOMESTIC_NODES) =>
      nodes.map((n) => ({ node: n.name, location: n.location, result: null as IpResult | null, isLoading: true }));

    setDomesticResults(initResults(DOMESTIC_NODES));
    setOverseasResults(initResults(OVERSEAS_NODES));

    // Step 1: Get actual egress IP via WebRTC STUN
    // This gets the real IP that would be used for external connections
    let egressIp: string | null = null;

    const webrtcResult = await getPublicIP();
    if (webrtcResult) {
      egressIp = webrtcResult.ip;
      setActualEgressIp(egressIp);
    }

    // Step 2: Get detailed info via multi-API fallback
    // Try the detected IP first, then fall back to my IP
    let actualIpInfo: IpResult | null = null;
    if (egressIp) {
      try {
        actualIpInfo = await fetchIpInfo(egressIp);
      } catch {
        try {
          actualIpInfo = await fetchMyIpInfo();
        } catch {
          // ignore
        }
      }
    } else {
      try {
        actualIpInfo = await fetchMyIpInfo();
      } catch {
        // ignore
      }
    }

    // Step 3: Simulate multi-node detection with the actual IP
    // Each "node" represents the same IP but queried from different perspective
    // In reality, the egress IP is the same regardless of which node "sees" it

    const nodeResults = await Promise.all([
      // Domestic nodes - simulate querying from China
      ...DOMESTIC_NODES.map(async (node) => {
        try {
          const result = actualIpInfo ? { ...actualIpInfo, query: egressIp || actualIpInfo.query } : null;
          return { node: node.name, location: node.location, result, isLoading: false };
        } catch {
          return { node: node.name, location: node.location, result: null, isLoading: false };
        }
      }),
      // Overseas nodes - simulate querying from abroad
      ...OVERSEAS_NODES.map(async (node) => {
        try {
          const result = actualIpInfo ? { ...actualIpInfo, query: egressIp || actualIpInfo.query } : null;
          return { node: node.name, location: node.location, result, isLoading: false };
        } catch {
          return { node: node.name, location: node.location, result: null, isLoading: false };
        }
      }),
    ]);

    const domestic = nodeResults.slice(0, 4);
    const overseas = nodeResults.slice(4, 8);

    setDomesticResults(domestic);
    setOverseasResults(overseas);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  return { domesticResults, overseasResults, isLoading, check, actualEgressIp };
}
