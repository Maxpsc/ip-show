import { useCallback } from 'react';
import { useIpQuery } from '../hooks/useIpQuery';
import { IpCard } from '../components/IpCard';
import { fetchMyIpInfo } from '../services/ipApi';
import { IpResult } from '../types';

/**
 * 获取本机IP的查询函数（用于国内测试）
 */
async function queryDomestic(): Promise<{ data: IpResult; apiName: string }> {
  const data = await fetchMyIpInfo();
  return { data, apiName: 'ip-api.com' };
}

/**
 * 获取国外测试IP（这里暂时用相同逻辑，后续可扩展）
 */
async function queryOverseas(): Promise<{ data: IpResult; apiName: string }> {
  const data = await fetchMyIpInfo();
  return { data, apiName: 'ip-api.com' };
}

/**
 * 获取谷歌测试IP（暂时用相同逻辑）
 */
async function queryGoogle(): Promise<{ data: IpResult; apiName: string }> {
  const data = await fetchMyIpInfo();
  return { data, apiName: 'ip-api.com' };
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

      <div className="mt-3 text-xs text-gray-400 text-center">
        仅提供IP地址查询功能
      </div>
    </div>
  );
}
