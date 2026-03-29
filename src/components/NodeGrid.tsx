import { NodeResult } from '../types';

interface Props {
  title: string;
  results: NodeResult[];
}

export function NodeGrid({ title, results }: Props) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>
      <div className="grid grid-cols-4 gap-2">
        {results.map((r) => (
          <div key={r.location} className="bg-gray-100 rounded p-2 text-xs">
            <div className="font-medium">{r.node}</div>
            <div className="font-mono text-gray-800">
              {r.result?.status === 'success' ? r.result.query : '—'}
            </div>
            <div className="text-gray-500">
              {r.result?.status === 'success' ? `${r.result.countryCode} ${r.result.regionName}` : '查询失败'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}