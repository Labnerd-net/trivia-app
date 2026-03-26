import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import Navbar from '../src/components/Navbar'

function renderNavbar() {
  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  )
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

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

  it('renders the theme toggle button', () => {
    renderNavbar()
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeDefined()
  })

  it('clicking toggle sets data-theme to light', () => {
    renderNavbar()
    fireEvent.click(screen.getByRole('button', { name: 'Switch to light mode' }))
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('clicking toggle writes tq-theme to localStorage', () => {
    renderNavbar()
    fireEvent.click(screen.getByRole('button', { name: 'Switch to light mode' }))
    expect(localStorage.getItem('tq-theme')).toBe('light')
  })

  it('clicking toggle twice removes data-theme', () => {
    renderNavbar()
    const btn = screen.getByRole('button', { name: 'Switch to light mode' })
    fireEvent.click(btn)
    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }))
    expect(document.documentElement.getAttribute('data-theme')).toBeNull()
  })

  it('respects pre-set light theme from localStorage init', () => {
    localStorage.setItem('tq-theme', 'light')
    renderNavbar()
    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeDefined()
  })

  it('handles localStorage failure silently', () => {
    const original = localStorage.setItem.bind(localStorage)
    localStorage.setItem = () => { throw new Error('storage full') }
    renderNavbar()
    expect(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Switch to light mode' }))
    }).not.toThrow()
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    localStorage.setItem = original
  })
})
