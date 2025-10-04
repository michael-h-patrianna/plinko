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
    background: 'rgba(71,85,105,0.4)',
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
