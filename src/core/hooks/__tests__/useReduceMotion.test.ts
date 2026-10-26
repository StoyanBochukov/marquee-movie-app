import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { useReduceMotion } from '../useReduceMotion';

describe('useReduceMotion', () => {
  let listener: ((enabled: boolean) => void) | undefined;
  const remove = jest.fn();

  beforeEach(() => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation((_event, handler) => {
      listener = handler as (enabled: boolean) => void;
      return { remove } as unknown as ReturnType<typeof AccessibilityInfo.addEventListener>;
    });
  });
  afterEach(() => jest.restoreAllMocks());

  it('reads the setting on mount and follows live changes', async () => {
    const { result, unmount } = renderHook(() => useReduceMotion());

    await waitFor(() => expect(result.current).toBe(true));

    act(() => listener?.(false));
    expect(result.current).toBe(false);

    unmount();
    expect(remove).toHaveBeenCalled();
  });
});
