import { render, screen, waitFor } from '@testing-library/react'
import { Navbar } from '@/components/navbar/Navbar'
import '@testing-library/jest-dom'

jest.mock('next/navigation', () => ({
  usePathname: () => '/home',
  useRouter: () => ({ push: jest.fn() })
}))

jest.mock('next/link', () => (props: any) => <a {...props} />)
jest.mock('next-auth/react', () => ({ signOut: jest.fn() }))

describe('Navbar', () => {
  it('shows login links when no user', () => {
    render(<Navbar user={undefined} />)
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByText('Register')).toBeInTheDocument()
  })

  it('shows user name when logged in', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    ) as jest.Mock
    render(<Navbar user={{ name: 'Jane' } as any} />)
    await waitFor(() => expect(screen.getByText(/Signed in as/)).toBeInTheDocument())
    expect(screen.getByText('Jane')).toBeInTheDocument()
  })
})
