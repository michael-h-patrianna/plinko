/**
 * Motion Feature Bundle for Lazy Loading
 *
 * This file exports the domAnimation feature bundle which includes:
 * - Animations and variants
 * - Exit animations
 * - Tap/hover/focus gestures
 *
 * Excludes (not needed for this project):
 * - Pan/drag gestures (we don't use drag)
 * - Layout animations (we don't use layout prop)
 *
 * Bundle size: ~15kb (vs 25kb with domMax)
 *
 * Used with LazyMotion for bundle size optimization.
 * See: https://motion.dev/docs/react-reduce-bundle-size
 */

import { domAnimation } from 'motion/react';

export default domAnimation;
