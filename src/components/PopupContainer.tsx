/**
 * Container component for the popup/modal style
 * Animated reveal on mount for polished appearance
 */

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface PopupContainerProps {
  children: ReactNode;
  isMobileOverlay?: boolean;
}

export function PopupContainer({ children, isMobileOverlay = false }: PopupContainerProps) {
  return (
    <motion.div
      className="relative w-full"
      style={{
        minHeight: isMobileOverlay ? '100vh' : '650px',
        overflow: 'hidden',
      }}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1], // Ease-out cubic for smooth, natural entrance
      }}
      data-testid="popup-container"
    >
      {children}
    </motion.div>
  );
}
