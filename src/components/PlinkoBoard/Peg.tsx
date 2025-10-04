/**
 * Individual peg component
 */

interface PegProps {
  row: number;
  col: number;
  x: number;
  y: number;
  isActive?: boolean;
}

export function Peg({ row, col, x, y, isActive = false }: PegProps) {
  return (
    <div
      className="absolute w-3 h-3 rounded-full"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
        background: 'radial-gradient(circle at 35% 35%, #cbd5e1, #94a3b8, #64748b)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3), inset -0.5px -0.5px 1px rgba(0,0,0,0.3), inset 0.5px 0.5px 1px rgba(255,255,255,0.4)'
      }}
      data-testid={`peg-${row}-${col}`}
      data-peg-hit={isActive}
    />
  );
}
