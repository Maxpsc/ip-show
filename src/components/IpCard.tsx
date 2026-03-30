import { IpResult } from '@/types';
import { QueryStatus } from '@/hooks/useIpQuery';

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
  if (status === 'loading') {
    return (
      <div className="border-b border-border py-3">
        <div className="text-sm text-muted-foreground mb-1">{title}</div>
        <div className="flex items-center gap-2">
          <div className="animate-pulse">
            <div className="h-5 w-32 bg-muted rounded"></div>
          </div>
          <span className="text-xs text-muted-foreground">查询中...</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">{description}</div>
      </div>
    );
  }

  if (status === 'error' || !result || result.status === 'fail') {
    return (
      <div className="border-b border-border py-3">
        <div className="text-sm text-muted-foreground mb-1">{title}</div>
        <div className="text-sm text-destructive">{error || '查询失败'}</div>
        <div className="flex items-center justify-between mt-1">
          <button onClick={onRetry} className="text-xs text-blue-500 hover:text-blue-700">
            重试
          </button>
        </div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    );
  }

  return (
    <div className="border-b border-border py-3">
      <div className="text-sm text-muted-foreground mb-1">{title}</div>
      <div className="flex items-center gap-2">
        <span className="text-lg font-mono text-foreground">{result.query}</span>
        <span className="text-sm text-muted-foreground">
          {result.countryCode} {result.regionName} {result.city}
        </span>
      </div>
      <div className="text-xs text-muted-foreground mt-1">{result.isp}</div>
      <div className="text-xs text-muted-foreground">{description}</div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
