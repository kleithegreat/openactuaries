import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { useTemporaryState } from '@/hooks/useTemporaryState';

jest.useFakeTimers();

function TestComponent() {
  const [value, setValue] = useTemporaryState('');
  return (
    <div>
      <span data-testid="value">{value}</span>
      <button onClick={() => setValue('hello')}>set</button>
    </div>
  );
}

describe('useTemporaryState', () => {
  it('resets state after duration', () => {
    render(<TestComponent />);
    fireEvent.click(screen.getByText('set'));
    expect(screen.getByTestId('value')).toHaveTextContent('hello');

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(screen.getByTestId('value')).toHaveTextContent('');
  });
});
