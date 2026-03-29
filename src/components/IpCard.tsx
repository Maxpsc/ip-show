import { IpResult } from '../types';
import { QueryStatus } from '../hooks/useIpQuery';

interface Props {
  title: string;
  description: string;
  status: QueryStatus;
  result: IpResult | null;
  error: string | null;
  apiName: string | null;
  latency: number | null;
  onRetry: () => void;
}

export function IpCard({ title, description, status, result, error, apiName, latency, onRetry }: Props) {
  // Loading state
  if (status === 'loading') {
    return (
      <div className="border-b border-gray-200 py-3">
        <div className="text-sm text-gray-600 mb-1">{title}</div>
        <div className="flex items-center gap-2">
          <div className="animate-pulse">
            <div className="h-5 w-32 bg-gray-200 rounded"></div>
          </div>
          <span className="text-xs text-gray-400">查询中...</span>
        </div>
        <div className="text-xs text-gray-400 mt-1">{description}</div>
      </div>
    );
  }

  // Error state
  if (status === 'error' || !result || result.status === 'fail') {
    return (
      <div className="border-b border-gray-200 py-3">
        <div className="text-sm text-gray-600 mb-1">{title}</div>
        <div className="text-sm text-red-500">{error || '查询失败'}</div>
        <div className="flex items-center justify-between mt-1">
          <button onClick={onRetry} className="text-xs text-blue-500 hover:text-blue-700">
            重试
          </button>
        </div>
        <div className="text-xs text-gray-400">{description}</div>
      </div>
    );
  }

  // Success state
  return (
    <div className="border-b border-gray-200 py-3">
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className="flex items-center gap-2">
        <span className="text-lg font-mono text-gray-800">{result.query}</span>
        <span className="text-sm text-gray-500">
          {result.countryCode} {result.regionName} {result.city}
        </span>
      </div>
      <div className="text-xs text-gray-400 mt-1">{result.isp}</div>
      <div className="text-xs text-gray-400">{description}</div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {apiName && <span>via {apiName}</span>}
          {latency !== null && <span>{latency}ms</span>}
          <span className="text-green-500">✓</span>
        </div>
        <a
          href={`https://who.is/whois-ip/ip-address/${result.query}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:text-blue-700"
        >
          more →
        </a>
      </div>
    </div>
  );
}
