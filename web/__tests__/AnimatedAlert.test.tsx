import { render, screen, act, fireEvent } from '@testing-library/react'
import { AnimatedAlert } from '@/components/ui/AnimatedAlert'

jest.useFakeTimers()

describe('AnimatedAlert', () => {
  it('hides after timeout and calls onClose', () => {
    const onClose = jest.fn()
    render(<AnimatedAlert message="Hello" onClose={onClose} />)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Hello')

    act(() => {
      jest.advanceTimersByTime(3000)
    })

    fireEvent.transitionEnd(alert)
    expect(onClose).toHaveBeenCalled()
  })
})
