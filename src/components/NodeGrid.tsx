import { NodeResult } from '../types';
import { IpCard } from './IpCard';

interface Props {
  title: string;
  results: NodeResult[];
  expanded?: boolean;
}

export function NodeGrid({ title, results, expanded }: Props) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>
      <div className="grid grid-cols-4 gap-2">
        {results.map((r) => (
          <IpCard key={r.location} name={r.node} result={r.result} expanded={expanded} />
        ))}
      </div>
    </div>
  );
}