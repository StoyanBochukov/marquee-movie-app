import { fireEvent, render, screen } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

import { ErrorBoundary, useErrorBoundary } from '../ErrorBoundary';

let shouldThrow = true;

function Flaky() {
  if (shouldThrow) throw new Error('render failed');
  return <Text>Recovered content</Text>;
}

function Fallback() {
  const { error, reset } = useErrorBoundary();
  return (
    <Pressable accessibilityRole="button" onPress={reset}>
      <Text>Fallback: {error.message}</Text>
    </Pressable>
  );
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    shouldThrow = true;
    // React logs caught render errors; keep the test output readable.
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it('renders the fallback with the caught error and reports it', () => {
    const onError = jest.fn();
    render(
      <ErrorBoundary onError={onError} fallback={<Fallback />}>
        <Flaky />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Fallback: render failed')).toBeTruthy();
    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.objectContaining({}));
  });

  it('remounts the children on reset', () => {
    render(
      <ErrorBoundary fallback={<Fallback />}>
        <Flaky />
      </ErrorBoundary>,
    );

    shouldThrow = false;
    fireEvent.press(screen.getByText('Fallback: render failed'));
    expect(screen.getByText('Recovered content')).toBeTruthy();
  });

  it('leaves siblings outside the boundary untouched', () => {
    render(
      <>
        <Text>Other row</Text>
        <ErrorBoundary fallback={<Text>Row failed</Text>}>
          <Flaky />
        </ErrorBoundary>
      </>,
    );

    expect(screen.getByText('Other row')).toBeTruthy();
    expect(screen.getByText('Row failed')).toBeTruthy();
  });
});
