import { useState, useCallback, useEffect } from 'react';
import { fetchMyIpInfo } from '../services/ipApi';
import { DOMESTIC_NODES, OVERSEAS_NODES, IpResult, NodeResult } from '../types';

export function useIpCheck() {
  const [domesticResults, setDomesticResults] = useState<NodeResult[]>([]);
  const [overseasResults, setOverseasResults] = useState<NodeResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const check = useCallback(async () => {
    setIsLoading(true);

    const initResults = (nodes: typeof DOMESTIC_NODES) =>
      nodes.map((n) => ({ node: n.name, location: n.location, result: null as IpResult | null, isLoading: true }));

    setDomesticResults(initResults(DOMESTIC_NODES));
    setOverseasResults(initResults(OVERSEAS_NODES));

    let ipInfo: IpResult | null = null;
    try {
      ipInfo = await fetchMyIpInfo();
    } catch {
      // ignore
    }

    const nodeResults = [
      ...DOMESTIC_NODES.map((node) => ({
        node: node.name,
        location: node.location,
        result: ipInfo,
        isLoading: false,
      })),
      ...OVERSEAS_NODES.map((node) => ({
        node: node.name,
        location: node.location,
        result: ipInfo,
        isLoading: false,
      })),
    ];

    setDomesticResults(nodeResults.slice(0, DOMESTIC_NODES.length));
    setOverseasResults(nodeResults.slice(DOMESTIC_NODES.length));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  return { domesticResults, overseasResults, isLoading, check, actualEgressIp: null };
}
