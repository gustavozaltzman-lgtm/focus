export function ContextChip({ name, colorHex }: { name: string; colorHex: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: `${colorHex}1A`, color: colorHex }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colorHex }} />
      {name}
    </span>
  );
}
