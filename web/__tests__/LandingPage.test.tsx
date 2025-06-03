import { render, screen } from '@testing-library/react'
import LandingPage from '@/app/page'

jest.mock('@/lib/auth/server', () => ({
  getServerSessionUser: async () => null,
}))
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() })
}))

describe('LandingPage', () => {
  it('renders hero headline', async () => {
    const page = await LandingPage()
    render(page)
    expect(
      screen.getByRole('heading', { name: /Ace Your Actuarial Exams/i })
    ).toBeInTheDocument()
  })

  it('shows open source section', async () => {
    const page = await LandingPage()
    render(page)
    expect(screen.getByText(/open-source platform/i)).toBeInTheDocument()
  })
})
