/**
 * Synchronous stand-in for the subset of Reanimated the app uses. The official
 * `react-native-reanimated/mock` cannot boot under the RN 0.88 Jest preset, and
 * component tests only need animations to settle instantly.
 */
import { useRef } from 'react';
import { FlatList, Image, ScrollView, Text, View } from 'react-native';

type Updater = () => Record<string, unknown>;

const identity = <T>(value: T) => value;

const layoutAnimation = {
  duration: () => layoutAnimation,
  delay: () => layoutAnimation,
  springify: () => layoutAnimation,
};

export const useSharedValue = <T>(initial: T) => useRef({ value: initial }).current;
export const useAnimatedStyle = (updater: Updater) => updater();
export const useAnimatedScrollHandler = () => () => {};
export const withTiming = identity;
export const withSpring = identity;
export const withRepeat = identity;
export const cancelAnimation = () => {};
export const interpolate = (_value: number, _input: number[], output: number[]) => output[0] ?? 0;
export const Extrapolation = { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' };

export const FadeIn = layoutAnimation;
export const FadeOutUp = layoutAnimation;
export const SlideInUp = layoutAnimation;

const createAnimatedComponent = identity;

export default {
  View,
  Text,
  Image,
  ScrollView,
  FlatList,
  createAnimatedComponent,
};
