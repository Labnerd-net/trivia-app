import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../src/App'

const mockGetToken = vi.hoisted(() => vi.fn())
const mockGetProvider = vi.hoisted(() => vi.fn())

vi.mock('../src/api/providers', () => ({
  getProvider: mockGetProvider,
  providerList: [
    { id: 'opentdb', name: 'Open Trivia Database', icon: '📚' },
    { id: 'triviaapi', name: 'The Trivia API', icon: '🎯' },
  ],
}))

vi.mock('../src/pages/Menu', () => ({
  default: ({ onProviderChange }: { onProviderChange: (id: string) => void }) => (
    <div>
      <span>Menu page</span>
      <button onClick={() => onProviderChange('triviaapi')}>Switch Provider</button>
    </div>
  ),
}))

vi.mock('../src/pages/Quiz', () => ({
  default: () => <div>Quiz page</div>,
}))

vi.mock('../src/components/Navbar', () => ({
  default: () => <nav>Navbar</nav>,
}))

vi.mock('../src/components/ErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const makeProvider = (overrides = {}) => ({
  id: 'opentdb',
  name: 'Open Trivia Database',
  description: 'Test',
  requiresToken: true,
  difficulties: [],
  types: [],
  getCategories: vi.fn(),
  getQuestions: vi.fn(),
  getToken: mockGetToken,
  ...overrides,
})

beforeEach(() => {
  vi.clearAllMocks()
})

const renderApp = () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  )
}

describe('App', () => {
  it('shows "Loading..." immediately on render', () => {
    mockGetProvider.mockReturnValue(makeProvider())
    mockGetToken.mockReturnValue(new Promise(() => {}))
    renderApp()
    expect(screen.getByText('Loading...')).toBeDefined()
  })

  it('renders Menu after token fetch resolves for a provider that requires a token', async () => {
    mockGetProvider.mockReturnValue(makeProvider())
    mockGetToken.mockResolvedValue('test-token')
    renderApp()
    await screen.findByText('Menu page')
  })

  it('renders Menu without calling getToken for a provider that does not require one', async () => {
    mockGetProvider.mockReturnValue(makeProvider({ requiresToken: false }))
    renderApp()
    await screen.findByText('Menu page')
    expect(mockGetToken).not.toHaveBeenCalled()
  })

  it('shows error message and Retry button when token fetch fails', async () => {
    mockGetProvider.mockReturnValue(makeProvider())
    mockGetToken.mockRejectedValue(new Error('network error'))
    renderApp()
    await screen.findByText('Failed to retrieve Token')
    expect(screen.getByRole('button', { name: 'Retry' })).toBeDefined()
  })

  it('clicking Retry triggers a second token fetch', async () => {
    mockGetProvider.mockReturnValue(makeProvider())
    mockGetToken.mockRejectedValue(new Error('network error'))
    renderApp()
    await screen.findByText('Failed to retrieve Token')

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))

    await waitFor(() => {
      expect(mockGetToken).toHaveBeenCalledTimes(2)
    })
  })

  it('switching provider triggers a new token fetch', async () => {
    mockGetProvider.mockReturnValue(makeProvider())
    mockGetToken.mockResolvedValue('token-1')
    renderApp()
    await screen.findByText('Menu page')

    mockGetToken.mockResolvedValue('token-2')
    fireEvent.click(screen.getByRole('button', { name: 'Switch Provider' }))

    await waitFor(() => {
      expect(mockGetToken).toHaveBeenCalledTimes(2)
    })
  })
})
