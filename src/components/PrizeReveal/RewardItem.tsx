/**
 * Single reward item in grid
 * Shows icon and amount/label
 */

import { motion } from 'framer-motion';
import scIcon from '../../assets/sc.png';
import gcIcon from '../../assets/gc.png';
import freeSpinsIcon from '../../assets/free-spins.png';
import randomRewardIcon from '../../assets/random_reward.png';
import { useTheme } from '../../theme';

interface RewardItemProps {
  type: 'gc' | 'sc' | 'spins' | 'xp' | 'randomReward';
  amount?: number;
  xpConfig?: { icon: string; name: string };
  delay?: number;
}

// Moved inside component to access theme
interface RewardConfigItem {
  icon: string;
  label: string;
  getColor: (theme: any) => string;
}

const getRewardConfig = (theme: any): Record<string, RewardConfigItem> => ({
  gc: {
    icon: gcIcon,
    label: 'GC',
    getColor: (t) => t.colors.status.success,
  },
  sc: {
    icon: scIcon,
    label: 'SC',
    getColor: (t) => t.colors.status.warning,
  },
  spins: {
    icon: freeSpinsIcon,
    label: 'Free Spins',
    getColor: (t) => t.colors.accent.light,
  },
  randomReward: {
    icon: randomRewardIcon,
    label: 'Bronze Wheel',
    getColor: (t) => t.colors.prizes.violet.light,
  },
});

export function RewardItem({ type, amount, xpConfig, delay = 0 }: RewardItemProps) {
  const { theme } = useTheme();
  const rewardConfig = getRewardConfig(theme);
  const config = type === 'xp' && xpConfig
    ? { icon: xpConfig.icon, label: xpConfig.name, getColor: (t: any) => t.colors.prizes.blue.light }
    : rewardConfig[type];

  const color = config.getColor(theme);
  const displayAmount = amount ?? 1;
  const displayText = type === 'spins'
    ? `${displayAmount} ${config.label}`
    : type === 'randomReward'
    ? config.label
    : type === 'xp'
    ? `${displayAmount} ${config.label}`
    : `${config.label} ${displayAmount.toLocaleString()}`;

  return (
    <motion.div
      className="flex flex-col items-center justify-center p-3 rounded-lg min-w-[80px]"
      style={{
        background: `linear-gradient(135deg, ${color}22 0%, ${color}11 100%)`,
        boxShadow: `0 2px 8px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.1)`,
        border: `1px solid ${color}44`,
      }}
      initial={{ scale: 0, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{
        duration: 0.25,
        delay,
        ease: [0.34, 1.56, 0.64, 1],
      }}
    >
      {/* Icon */}
      <motion.img
        src={config.icon}
        alt={config.label}
        className="mb-2 drop-shadow-lg"
        style={{
          width: '48px',
          height: '48px',
          objectFit: 'contain',
        }}
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          duration: 0.25,
          delay: delay + 0.1,
          ease: [0.34, 1.56, 0.64, 1],
        }}
      />

      {/* Amount/Label */}
      <div
        className="text-center font-bold text-sm leading-tight"
        style={{
          color: theme.colors.text.primary,
          textShadow: `0 2px 4px ${theme.colors.shadows.default}b3`,
        }}
      >
        {displayText}
      </div>
    </motion.div>
  );
}
