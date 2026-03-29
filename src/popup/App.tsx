import { useState } from 'react';
import { useIpCheck } from '../hooks/useIpCheck';
import { NodeGrid } from '../components/NodeGrid';
import { ExpandButton } from '../components/ExpandButton';
import { LoadingSpinner } from '../components/LoadingSpinner';

export default function App() {
  const { domesticResults, overseasResults, isLoading, check } = useIpCheck();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-[420px] p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-800">🌐 IP Show</h1>
        <ExpandButton expanded={expanded} onClick={() => setExpanded(!expanded)} />
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <NodeGrid title="国内节点" results={domesticResults} expanded={expanded} />
          <NodeGrid title="海外节点" results={overseasResults} expanded={expanded} />
          <button
            onClick={check}
            className="w-full mt-2 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            重新测试
          </button>
        </>
      )}
    </div>
  );
}
