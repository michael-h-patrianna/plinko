/**
 * Individual reward item displayed in reward grid
 * Shows icon and formatted amount/label with entrance animation
 * @param type - Type of reward (gc, sc, spins, xp, randomReward)
 * @param amount - Amount of the reward
 * @param xpConfig - Configuration for XP rewards (icon and name)
 * @param delay - Animation delay in seconds
 */

import scIcon from '../../../assets/sc.png';
import gcIcon from '../../../assets/gc.png';
import freeSpinsIcon from '../../../assets/free-spins.png';
import randomRewardIcon from '../../../assets/random_reward.png';
import { useTheme } from '../../../theme';
import type { Theme } from '@theme/types';
import { useAnimation } from '@theme/animationDrivers/useAnimation';
import { hexToRgba } from '@utils/formatting/colorUtils';

interface RewardItemProps {
  type: 'gc' | 'sc' | 'spins' | 'xp' | 'randomReward';
  amount?: number;
  xpConfig?: { icon: string; name: string };
  delay?: number;
  index?: number;
  totalCount?: number;
}

// Moved inside component to access theme
interface RewardConfigItem {
  icon: string;
  label: string;
  getColor: (theme: Theme) => string;
}

const getRewardConfig = (): Record<string, RewardConfigItem> => ({
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

export function RewardItem({
  type,
  amount,
  xpConfig,
  delay = 0,
  index = 0,
  totalCount: _totalCount = 1,
}: RewardItemProps) {
  const { AnimatedDiv, AnimatedImg } = useAnimation();
  const { theme } = useTheme();
  const rewardConfig = getRewardConfig();
  const config =
    type === 'xp' && xpConfig
      ? {
          icon: xpConfig.icon,
          label: xpConfig.name,
          getColor: (t: Theme) => t.colors.prizes.blue.light,
        }
      : rewardConfig[type];

  if (!config) {
    return null;
  }

  const color = config.getColor(theme);
  const displayAmount = amount ?? 1;
  const displayText =
    type === 'spins'
      ? `${displayAmount} ${config.label}`
      : type === 'randomReward'
        ? config.label
        : type === 'xp'
          ? `${displayAmount} ${config.label}`
          : `${config.label} ${displayAmount.toLocaleString()}`;

  // Arc in from alternating corners - creates dynamic entrance
  // Even indices from top-left, odd indices from top-right
  const arcFromLeft = index % 2 === 0;
  const initialX = arcFromLeft ? -100 : 100;
  const initialY = -60;

  // Create gradient-aware background and border
  const lightColor = hexToRgba(color, 0.22);
  const lighterColor = hexToRgba(color, 0.11);
  const borderColor = hexToRgba(color, 0.44);

  return (
    <AnimatedDiv
      className="flex flex-col items-center justify-center p-3 rounded-lg min-w-[80px]"
      style={{
        background: `linear-gradient(135deg, ${lightColor} 0%, ${lighterColor} 100%)`,
        /* RN-compatible: removed boxShadow, using border for definition */
        border: `1px solid ${borderColor}`,
      }}
      initial={{ scale: 0, opacity: 0, x: initialX, y: initialY, rotate: arcFromLeft ? -20 : 20 }}
      animate={{ scale: 1, opacity: 1, x: 0, y: 0, rotate: 0 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.34, 1.56, 0.64, 1],
      }}
    >
      {/* Icon */}
      <AnimatedImg
        src={config.icon}
        alt={config.label}
        className="mb-2"
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
          color: color,
          /* RN-compatible: removed textShadow */
        }}
      >
        {displayText}
      </div>
    </AnimatedDiv>
  );
}
