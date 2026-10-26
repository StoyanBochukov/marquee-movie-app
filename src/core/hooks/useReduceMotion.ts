import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Live "Reduce Motion" accessibility setting. Reanimated already shortens timed and layout
 * animations on its own; this is for motion it can't see, such as scroll-driven parallax and
 * navigation transitions.
 */
export function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      if (mounted) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}
