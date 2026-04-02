import { useRef, useCallback, useEffect } from 'react';
import { useIpQuery } from '@/hooks/useIpQuery';
import { IpCard } from '@/components/IpCard';
import { fetchMyIpInfo, fetchPconlineIpInfo } from '@/services/ipApi';
import { IpResult } from '@/types';

async function queryOverseas(): Promise<{ data: IpResult; apiName: string }> {
  const data = await fetchMyIpInfo();
  return { data, apiName: 'api' };
}

async function queryCN(): Promise<{ data: IpResult; apiName: string }> {
  const data = await fetchPconlineIpInfo();
  return { data, apiName: 'pconline' };
}

function setBadge(countryCode: string) {
  const text = countryCode.slice(0, 4).toUpperCase();
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color: '#1a1a2e' });
  chrome.storage.local.set({ badgeText: text, badgeColor: '#1a1a2e' });
}

export default function App() {
  const overseas = useIpQuery({ type: 'overseas', queryFn: queryOverseas });
  const cn = useIpQuery({ type: 'cn', queryFn: queryCN });

  useEffect(() => {
    if (overseas.status === 'success' && overseas.data?.countryCode) {
      setBadge(overseas.data.countryCode);
    }
  }, [overseas.status, overseas.data?.countryCode]);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleRefreshAll = useCallback(() => {
    overseas.refetch(true);
    cn.refetch(true);
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  }, [overseas, cn]);

  return (
    <div className="w-[768px] h-[400px] bg-background overflow-hidden">
      <div className="relative w-full h-full">
        <div className="absolute top-0 left-0 right-0 p-2" style={{ zIndex: 1 }}>
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-foreground">
              🌐 IP Show
              <span className="text-xs text-muted-foreground ml-4">全方位检测您的IP地址</span>
            </h1>
            <button
              onClick={handleRefreshAll}
              className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              重新检测
            </button>
          </div>

          <div className="flex gap-2">
            <IpCard
              className="flex-1 border-b border-border py-3"
              description="境外访问"
              status={overseas.status}
              result={overseas.data}
              error={overseas.error}
              apiName={overseas.apiName}
              latency={overseas.latency}
              onRetry={() => overseas.refetch(true)}
            />
            <IpCard
              className="flex-1 border-b border-border py-3"
              description="大陆访问"
              status={cn.status}
              result={cn.data}
              error={cn.error}
              apiName={cn.apiName}
              latency={cn.latency}
              onRetry={() => cn.refetch(true)}
            />
          </div>
        </div>

        <iframe
          ref={iframeRef}
          src="https://www.ip111.cn/"
          className="absolute w-full h-[500px] border-none"
          title="ip111.cn Reference"
          sandbox="allow-scripts allow-same-origin"
        />
        <div className="absolute top-0 left-0 right-0 h-[150px] bg-background pointer-events-none"></div>
      </div>
    </div>
  );
}
