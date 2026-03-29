import { useIpCheck } from '../hooks/useIpCheck';
import { IpCard } from '../components/IpCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

export default function App() {
  const { domesticResults, overseasResults, isLoading, check } = useIpCheck();

  // 取第一个成功的结果作为代表
  const domesticResult = domesticResults.find(r => r.result?.status === 'success')?.result || null;
  const overseasResult = overseasResults.find(r => r.result?.status === 'success')?.result || null;

  return (
    <div className="w-[380px] p-4 bg-white">
      <div className="mb-3">
        <h1 className="text-base font-bold text-gray-800">🌐 IP Show</h1>
        <p className="text-xs text-gray-500">全方位查询您的IP地址</p>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <IpCard
            title="从国内测试"
            description="这是您访问国内网站所使用的IP"
            result={domesticResult}
          />
          <IpCard
            title="从国外测试"
            description="您访问没有被封的国外网站所使用的IP"
            result={overseasResult}
          />
          <IpCard
            title="从谷歌测试"
            description={overseasResult && overseasResult.countryCode !== 'CN'
              ? "这是您访问谷歌，Facebook，Twitter等网站所使用的IP"
              : "您无法访问谷歌网站"}
            result={overseasResult && overseasResult.countryCode !== 'CN' ? overseasResult : null}
          />

          {/* <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-400 mb-2">
              多节点检测 · {domesticResults.length}个国内节点 + {overseasResults.length}个海外节点
            </div>
            <div className="flex flex-wrap gap-1">
              {domesticResults.map(r => (
                <span key={r.location} className="text-xs px-1.5 py-0.5 bg-gray-100 rounded">
                  {r.node}: {r.result?.status === 'success' ? r.result.query : '×'}
                </span>
              ))}
              {overseasResults.map(r => (
                <span key={r.location} className="text-xs px-1.5 py-0.5 bg-gray-100 rounded">
                  {r.node}: {r.result?.status === 'success' ? r.result.query : '×'}
                </span>
              ))}
            </div>
          </div> */}

          <button
            onClick={check}
            className="w-full mt-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
          >
            重新测试
          </button>

          <div className="mt-3 text-xs text-gray-400 text-center">
            仅提供IP地址查询功能
          </div>
        </>
      )}
    </div>
  );
}
