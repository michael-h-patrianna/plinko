/**
 * Border wall component with impact flash animation
 */

import { motion, AnimatePresence } from 'framer-motion';

interface BorderWallProps {
  side: 'left' | 'right' | 'top';
  width: number;
  hasImpact: boolean;
}

export function BorderWall({ side, width, hasImpact }: BorderWallProps) {
  const isVertical = side === 'left' || side === 'right';

  const baseStyle = {
    background: side === 'top'
      ? 'linear-gradient(180deg, #475569 0%, #334155 50%, #1e293b 100%)'
      : side === 'left'
      ? 'linear-gradient(90deg, #475569 0%, #334155 50%, #1e293b 100%)'
      : 'linear-gradient(270deg, #475569 0%, #334155 50%, #1e293b 100%)',
    boxShadow: side === 'top'
      ? 'inset 0 -2px 8px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1)'
      : side === 'left'
      ? 'inset -2px 0 8px rgba(0,0,0,0.5), inset 2px 0 4px rgba(255,255,255,0.1)'
      : 'inset 2px 0 8px rgba(0,0,0,0.5), inset -2px 0 4px rgba(255,255,255,0.1)',
    borderRadius: side === 'top'
      ? '12px 12px 0 0'
      : side === 'left'
      ? '12px 0 0 12px'
      : '0 12px 12px 0',
  };

  const positionStyle = side === 'top'
    ? { top: 0, left: 0, right: 0, height: `${width}px` }
    : side === 'left'
    ? { top: 0, left: 0, bottom: 0, width: `${width}px` }
    : { top: 0, right: 0, bottom: 0, width: `${width}px` };

  return (
    <div className="absolute" style={{ ...positionStyle, ...baseStyle }}>
      {/* Impact flash */}
      <AnimatePresence>
        {hasImpact && (
          <motion.div
            key={`impact-${Date.now()}`}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: isVertical
                ? `radial-gradient(ellipse at ${side}, rgba(255,255,255,0.8) 0%, rgba(255,200,100,0.6) 30%, transparent 70%)`
                : 'radial-gradient(ellipse at top, rgba(255,255,255,0.8) 0%, rgba(255,200,100,0.6) 30%, transparent 70%)',
              boxShadow: '0 0 20px rgba(255,255,255,0.6)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
