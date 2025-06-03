import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

function TestComponent() {
  const [value, setValue] = useLocalStorage('key', 'init')
  return (
    <div>
      <span data-testid="value">{value}</span>
      <button onClick={() => setValue('new')}>set</button>
    </div>
  )
}

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('reads value from localStorage', () => {
    localStorage.setItem('key', JSON.stringify('stored'))
    render(<TestComponent />)
    expect(screen.getByTestId('value')).toHaveTextContent('stored')
  })

  it('updates localStorage on change', () => {
    render(<TestComponent />)
    fireEvent.click(screen.getByText('set'))
    expect(localStorage.getItem('key')).toBe(JSON.stringify('new'))
  })
})
