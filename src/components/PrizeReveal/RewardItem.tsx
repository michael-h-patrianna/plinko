/**
 * Single reward item in grid
 * Shows icon and amount/label
 */

import { motion } from 'framer-motion';
import scIcon from '../../assets/sc.png';
import gcIcon from '../../assets/gc.png';
import freeSpinsIcon from '../../assets/free-spins.png';
import randomRewardIcon from '../../assets/random_reward.png';

interface RewardItemProps {
  type: 'gc' | 'sc' | 'spins' | 'xp' | 'randomReward';
  amount?: number;
  xpConfig?: { icon: string; name: string };
  delay?: number;
}

const REWARD_CONFIG = {
  gc: {
    icon: gcIcon,
    label: 'GC',
    color: '#34D399', // emerald-400
  },
  sc: {
    icon: scIcon,
    label: 'SC',
    color: '#F97316', // orange-500
  },
  spins: {
    icon: freeSpinsIcon,
    label: 'Free Spins',
    color: '#A78BFA', // violet-400
  },
  randomReward: {
    icon: randomRewardIcon,
    label: 'Bronze Wheel',
    color: '#F472B6', // pink-400
  },
};

export function RewardItem({ type, amount, xpConfig, delay = 0 }: RewardItemProps) {
  const config = type === 'xp' && xpConfig
    ? { icon: xpConfig.icon, label: xpConfig.name, color: '#818CF8' } // indigo-400
    : REWARD_CONFIG[type];

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
        background: `
          linear-gradient(135deg, ${config.color}22 0%, ${config.color}11 100%)
        `,
        boxShadow: `
          0 2px 8px rgba(0,0,0,0.2),
          inset 0 1px 2px rgba(255,255,255,0.1)
        `,
        border: `1px solid ${config.color}44`,
      }}
      initial={{ scale: 0, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
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
          duration: 0.5,
          delay: delay + 0.1,
          ease: [0.34, 1.56, 0.64, 1],
        }}
      />

      {/* Amount/Label */}
      <div
        className="text-center text-white font-bold text-sm leading-tight"
        style={{
          textShadow: '0 2px 4px rgba(0,0,0,0.7)',
        }}
      >
        {displayText}
      </div>
    </motion.div>
  );
}
