import { IpResult } from '../types';

interface Props {
  name: string;
  result: IpResult | null;
  expanded?: boolean;
}

export function IpCard({ name, result, expanded }: Props) {
  if (!result) {
    return (
      <div className="bg-gray-100 rounded p-3 min-w-[80px]">
        <div className="text-xs text-gray-500">{name}</div>
        <div className="text-xs text-gray-400">加载中...</div>
      </div>
    );
  }

  if (result.status === 'fail') {
    return (
      <div className="bg-red-50 rounded p-3 min-w-[80px] border border-red-200">
        <div className="text-xs font-medium">{name}</div>
        <div className="text-xs text-red-500">查询失败</div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 rounded p-3 min-w-[80px] border border-blue-200">
      <div className="text-xs font-medium text-blue-700">{name}</div>
      <div className="text-sm font-mono text-gray-800">{result.query}</div>
      <div className="text-xs text-gray-600">{result.countryCode} {result.regionName}</div>
      {expanded && (
        <>
          <div className="text-xs text-gray-500 mt-1">{result.isp}</div>
          <div className="text-xs text-gray-400">{result.as}</div>
          <div className="text-xs text-gray-400">{result.latency}ms</div>
        </>
      )}
    </div>
  );
}