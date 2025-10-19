// @ts-nocheck
import StopRow from './StopRow.tsx';
import styles from './StopsList.module.css';
import type { ColorFormat, ColorStop } from './types';

interface StopsListProps {
  stops: ColorStop[];
  selectedStopId: string | null;
  onSelectStop: (id: string) => void;
  onUpdateStop: (id: string, updates: Partial<ColorStop>) => void;
  onDeleteStop: (id: string) => void;
  canDelete: boolean;
  colorFormat: ColorFormat;
}

export function StopsList({
  stops,
  selectedStopId,
  onSelectStop,
  onUpdateStop,
  onDeleteStop,
  canDelete,
  colorFormat,
}: StopsListProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span>Stops</span>
        <span className={styles.count}>{stops.length}</span>
      </div>

      <div className={styles.list}>
        {stops.map((stop) => (
          <StopRow
            key={stop.id}
            stop={stop}
            isSelected={stop.id === selectedStopId}
            onSelect={() => onSelectStop(stop.id)}
            onUpdate={(updates: Partial<ColorStop>) => onUpdateStop(stop.id, updates)}
            onDelete={() => onDeleteStop(stop.id)}
            canDelete={canDelete}
            colorFormat={colorFormat}
          />
        ))}
      </div>
    </div>
  );
}

export default StopsList;
