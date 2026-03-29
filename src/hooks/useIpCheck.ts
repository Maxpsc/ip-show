import { useState, useCallback, useEffect } from 'react';
import { fetchIpInfo } from '../services/ipApi';
import { DOMESTIC_NODES, OVERSEAS_NODES, NodeResult } from '../types';

export function useIpCheck() {
  const [domesticResults, setDomesticResults] = useState<NodeResult[]>([]);
  const [overseasResults, setOverseasResults] = useState<NodeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const check = useCallback(async () => {
    setIsLoading(true);

    const initResults = (nodes: typeof DOMESTIC_NODES) =>
      nodes.map((n) => ({ node: n.name, location: n.location, result: null, isLoading: true }));

    setDomesticResults(initResults(DOMESTIC_NODES));
    setOverseasResults(initResults(OVERSEAS_NODES));

    const allNodes = [...DOMESTIC_NODES.map(n => ({ ...n, isDomestic: true })),
                       ...OVERSEAS_NODES.map(n => ({ ...n, isDomestic: false }))];

    const promises = allNodes.map(async (node) => {
      try {
        const result = await fetchIpInfo();
        return { node: node.name, location: node.location, result, isDomestic: node.isDomestic };
      } catch {
        return { node: node.name, location: node.location, result: null, error: 'Network error', isDomestic: node.isDomestic };
      }
    });

    const results = await Promise.all(promises);

    const domestic = results.filter(r => r.isDomestic);
    const overseas = results.filter(r => !r.isDomestic);

    setDomesticResults(domestic.map(({ isDomestic, ...r }) => r));
    setOverseasResults(overseas.map(({ isDomestic, ...r }) => r));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  return { domesticResults, overseasResults, isLoading, check };
}