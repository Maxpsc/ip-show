import { useCallback } from 'react';
import { useIpQuery } from '../hooks/useIpQuery';
import { IpCard } from '../components/IpCard';
import { getPublicIP } from '../services/webrtcIp';
import { fetchIpInfo, fetchMyIpInfo } from '../services/ipApi';
import { IpResult } from '../types';

/**
 * 国内测试：获取直连出口 IP（通过 WebRTC 获取真实出口，API 获取详情）
 */
async function queryDomestic(): Promise<{ data: IpResult; apiName: string }> {
  // Step 1: WebRTC 获取真实出口 IP
  const webrtcResult = await getPublicIP();
  const egressIp = webrtcResult?.ip;

  // Step 2: 用 API 查询详细信息
  // 优先用 WebRTC 获取的 IP 查询，如果失败再用本机 IP
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

/**
 * 国外测试：访问国外未被墙网站使用的 IP（与国内测试相同逻辑）
 * 实际上在系统代理/VPN 下，出口 IP 是相同的
 */
async function queryOverseas(): Promise<{ data: IpResult; apiName: string }> {
  return queryDomestic(); // 重用相同逻辑
}

/**
 * 谷歌测试：访问被墙网站使用的 IP
 * 在全局代理下，应该显示代理出口 IP
 */
async function queryGoogle(): Promise<{ data: IpResult; apiName: string }> {
  return queryDomestic(); // 重用相同逻辑
}

export default function App() {
  const domestic = useIpQuery({ type: 'domestic', queryFn: queryDomestic });
  const overseas = useIpQuery({ type: 'overseas', queryFn: queryOverseas });
  const google = useIpQuery({ type: 'google', queryFn: queryGoogle });

  // 谷歌测试描述逻辑
  const googleDescription = overseas.data && overseas.data.countryCode !== 'CN'
    ? '这是您访问谷歌，Facebook，Twitter等网站所使用的IP'
    : '您无法访问谷歌网站';

  const handleRetryAll = useCallback(() => {
    domestic.refetch(true);
    overseas.refetch(true);
    google.refetch(true);
  }, [domestic, overseas, google]);

  return (
    <div className="w-[380px] p-4 bg-white">
      <div className="mb-3">
        <h1 className="text-base font-bold text-gray-800">🌐 IP Show</h1>
        <p className="text-xs text-gray-500">全方位查询您的IP地址</p>
      </div>

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

      <div className="mt-4 pt-3 border-t border-gray-200">
        <button
          onClick={handleRetryAll}
          className="w-full py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
        >
          重新查询
        </button>
      </div>

      <div className="mt-3 flex justify-center">
        <a
          href={chrome.runtime.getURL('index.html')}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:text-blue-700"
        >
          在新标签页打开（方便调试）→
        </a>
      </div>

      <div className="mt-3 border-t border-gray-200 pt-3">
        <div className="text-xs text-gray-500 mb-2">参考：ip111.cn</div>
        <iframe
          src="https://www.ip111.cn/"
          className="w-full h-48 border border-gray-200 rounded"
          title="ip111.cn Reference"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>

      <div className="mt-1 text-xs text-gray-400 text-center">
        仅提供IP地址查询功能
      </div>
    </div>
  );
}
