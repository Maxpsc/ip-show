interface Props {
  expanded: boolean;
  onClick: () => void;
}

export function ExpandButton({ expanded, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="text-sm text-blue-600 hover:text-blue-800"
    >
      {expanded ? '收起▲' : '展开▼'}
    </button>
  );
}