import { IpResult } from '@/types';
import { QueryStatus } from '@/hooks/useIpQuery';

interface Props {
  className?: string;
  description: string;
  status: QueryStatus;
  result: IpResult | null;
  error: string | null;
  apiName: string | null;
  latency: number | null;
  onRetry: () => void;
}

export function IpCard({ className, description, status, result, error, apiName, latency, onRetry }: Props) {
  const isLoading = status === 'loading';
  const isError = status === 'error' || !result || result.status === 'fail';
  const isSuccess = status === 'success' && result && result.status !== 'fail';

  return (
    <div className={className || "border-b border-border py-3"}>
      <div className="flex flex-col items-center justify-center text-center gap-1">
        {/* IP and location row */}
        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="h-5 w-32 bg-muted rounded animate-pulse" />
          ) : isError ? (
            <span className="text-sm text-destructive">{error || '查询失败'}</span>
          ) : (
            <>
              <span className="text-lg font-mono text-foreground">{result.query}</span>
              <span className="text-sm text-muted-foreground">
                {result.countryCode} {result.regionName} {result.city}
              </span>
            </>
          )}
        </div>

        {/* Status row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {isLoading && <span>查询中...</span>}
          {isError && (
            <button onClick={onRetry} className="text-blue-500 hover:text-blue-700">
              重试
            </button>
          )}
          {isSuccess && (
            <>
              {apiName && <span>via {apiName}</span>}
              {latency !== null && <span>{latency}ms</span>}
              <span className="text-green-500">✓</span>
            </>
          )}
          <span>{description}</span>
        </div>
      </div>
    </div>
  );
}
