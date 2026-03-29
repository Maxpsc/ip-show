import { IpResult } from '../types';

interface Props {
  title: string;
  description: string;
  result: IpResult | null;
}

export function IpCard({ title, description, result }: Props) {
  if (!result || result.status === 'fail') {
    return (
      <div className="border-b border-gray-200 py-3">
        <div className="text-sm text-gray-600 mb-1">{title}</div>
        <div className="text-sm text-gray-500">{description}</div>
      </div>
    );
  }

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
    </div>
  );
}