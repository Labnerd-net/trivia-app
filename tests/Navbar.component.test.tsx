import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import Navbar from '../src/components/Navbar'

const renderNavbar = () => {
  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  )
}

describe('Navbar', () => {
  it('renders the brand text', () => {
    renderNavbar()
    expect(screen.getByText('TRIVIA CHALLENGE')).toBeDefined()
  })

  it('brand link points to /', () => {
    renderNavbar()
    const link = screen.getByRole('link', { name: 'TRIVIA CHALLENGE' })
    expect(link.getAttribute('href')).toBe('/')
  })
})
