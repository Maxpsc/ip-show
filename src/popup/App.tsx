import { useRef, useCallback } from 'react';
import { useIpQuery } from '@/hooks/useIpQuery';
import { IpCard } from '@/components/IpCard';
import { getPublicIP } from '@/services/webrtcIp';
import { fetchIpInfo, fetchMyIpInfo } from '@/services/ipApi';
import { IpResult } from '@/types';

async function queryDomestic(): Promise<{ data: IpResult; apiName: string }> {
  const webrtcResult = await getPublicIP();
  const egressIp = webrtcResult?.ip;

  let data: IpResult;
  let apiName = 'WebRTC';

  if (egressIp) {
    try {
      data = await fetchIpInfo(egressIp);
      apiName = 'WebRTC + ' + (data.latency ? 'ip-api' : 'api');
    } catch {
      try {
        data = await fetchMyIpInfo();
        apiName = 'WebRTC + fallback';
      } catch {
        throw new Error('获取IP信息失败');
      }
    }
  } else {
    data = await fetchMyIpInfo();
    apiName = 'api';
  }

  return { data, apiName };
}

// async function queryOverseas(): Promise<{ data: IpResult; apiName: string }> {
//   return queryDomestic();
// }

// async function queryGoogle(): Promise<{ data: IpResult; apiName: string }> {
//   return queryDomestic();
// }

export default function App() {
  const domestic = useIpQuery({ type: 'domestic', queryFn: queryDomestic });

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleRefreshAll = useCallback(() => {
    domestic.refetch(true);
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  }, [domestic]);

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

          <IpCard
            status={domestic.status}
            result={domestic.data}
            error={domestic.error}
            apiName={domestic.apiName}
            latency={domestic.latency}
            onRetry={() => domestic.refetch(true)}
          />
        </div>

        <iframe
          ref={iframeRef}
          src="https://www.ip111.cn/"
          className="absolute w-full h-[500px] border-none"
          title="ip111.cn Reference"
          sandbox="allow-scripts allow-same-origin"
        />
        <div className="absolute top-0 left-0 right-0 h-[120px] bg-background pointer-events-none"></div>
      </div>

      {/* <div className="mt-4 flex justify-center">
        <a
          href={chrome.runtime.getURL('index.html')}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:text-blue-700"
        >
          在新标签页打开（方便调试）→
        </a>
      </div> */}

      {/* <div className="mt-2 text-xs text-muted-foreground text-center">
        仅提供IP地址查询功能
      </div> */}
    </div>
  );
}
