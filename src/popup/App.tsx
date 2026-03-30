import { useCallback, useRef, useState } from 'react';
import { useIpQuery } from '@/hooks/useIpQuery';
import { IpCard } from '@/components/IpCard';
import { getPublicIP } from '@/services/webrtcIp';
import { fetchIpInfo, fetchMyIpInfo } from '@/services/ipApi';
import { IpResult } from '@/types';
import html2canvas from 'html2canvas';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

async function queryDomestic(): Promise<{ data: IpResult; apiName: string }> {
  const webrtcResult = await getPublicIP();
  const egressIp = webrtcResult?.ip;

  let data: IpResult;
  let apiName = 'WebRTC';

  if (egressIp) {
    try {
      data = await fetchIpInfo(egressIp);
      apiName = 'WebRTC + ' + (data.latency ? 'ip-api' : 'fallback');
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
    apiName = 'fallback';
  }

  return { data, apiName };
}

async function queryOverseas(): Promise<{ data: IpResult; apiName: string }> {
  return queryDomestic();
}

async function queryGoogle(): Promise<{ data: IpResult; apiName: string }> {
  return queryDomestic();
}

export default function App() {
  const domestic = useIpQuery({ type: 'domestic', queryFn: queryDomestic });
  const overseas = useIpQuery({ type: 'overseas', queryFn: queryOverseas });
  const google = useIpQuery({ type: 'google', queryFn: queryGoogle });

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const googleDescription = overseas.data && overseas.data.countryCode !== 'CN'
    ? '这是您访问谷歌，Facebook，Twitter等网站所使用的IP'
    : '您无法访问谷歌网站';

  const handleRetryAll = useCallback(() => {
    domestic.refetch(true);
    overseas.refetch(true);
    google.refetch(true);
  }, [domestic, overseas, google]);

  const handleScreenshot = useCallback(async () => {
    if (!iframeRef.current) return;

    setIsCapturing(true);
    try {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) {
        throw new Error('Cannot access iframe document');
      }
      const canvas = await html2canvas(doc.body, {
        backgroundColor: '#ffffff',
        scale: 1,
      });
      const dataUrl = canvas.toDataURL('image/png');
      setScreenshotUrl(dataUrl);
      console.log('[Screenshot] Captured successfully');
    } catch (err) {
      console.error('[Screenshot] Failed:', err);
    } finally {
      setIsCapturing(false);
    }
  }, []);

  return (
    <div className="w-[820px] h-[600px] p-4 bg-background">
      <div className="mb-3">
        <h1 className="text-lg font-bold text-foreground">🌐 IP Show</h1>
        <p className="text-xs text-muted-foreground">全方位查询您的IP地址</p>
      </div>

      <Tabs defaultValue="api" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="api" className="flex-1">API检测</TabsTrigger>
          <TabsTrigger value="ip111" className="flex-1">ip111</TabsTrigger>
        </TabsList>

        <TabsContent value="api">
          <div className="w-full">
            <IpCard
              title="从国内测试"
              description="这是您访问国内网站所使用的IP"
              status={domestic.status}
              result={domestic.data}
              error={domestic.error}
              apiName={domestic.apiName}
              latency={domestic.latency}
              onRetry={() => domestic.refetch(true)}
            />

            <IpCard
              title="从国外测试"
              description="您访问没有被封的国外网站所使用的IP"
              status={overseas.status}
              result={overseas.data}
              error={overseas.error}
              apiName={overseas.apiName}
              latency={overseas.latency}
              onRetry={() => overseas.refetch(true)}
            />

            <IpCard
              title="从谷歌测试"
              description={googleDescription}
              status={google.status}
              result={google.status === 'success' && overseas.data?.countryCode !== 'CN' ? google.data : null}
              error={google.error}
              apiName={google.apiName}
              latency={google.latency}
              onRetry={() => google.refetch(true)}
            />

            <div className="mt-4 flex justify-center">
              <button
                onClick={handleRetryAll}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                重新查询
              </button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ip111">
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-muted-foreground">参考：ip111.cn</div>
              <button
                onClick={handleScreenshot}
                disabled={isCapturing}
                className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:opacity-50"
              >
                {isCapturing ? '截图...' : '📸 截图'}
              </button>
            </div>
            <iframe
              ref={iframeRef}
              src="https://www.ip111.cn/"
              className="w-full h-[480px] border border-border rounded"
              title="ip111.cn Reference"
              sandbox="allow-scripts allow-same-origin"
            />

            {screenshotUrl && (
              <div className="mt-4">
                <div className="text-xs text-muted-foreground mb-2">截图预览：</div>
                <img src={screenshotUrl} alt="Screenshot" className="max-w-full border border-border rounded" />
                <a
                  href={screenshotUrl}
                  download="ip-screenshot.png"
                  className="mt-2 inline-block px-3 py-1 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/90"
                >
                  下载截图
                </a>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-4 flex justify-center">
        <a
          href={chrome.runtime.getURL('index.html')}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:text-blue-700"
        >
          在新标签页打开（方便调试）→
        </a>
      </div>

      <div className="mt-2 text-xs text-muted-foreground text-center">
        仅提供IP地址查询功能
      </div>
    </div>
  );
}
