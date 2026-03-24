import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../src/App'
import axiosInstance from '../src/api/axiosInstance'

vi.mock('../src/api/axiosInstance', () => ({
  default: { get: vi.fn() },
}))
const mockAxiosGet = vi.mocked(axiosInstance.get)

const mockGetProvider = vi.hoisted(() => vi.fn())

vi.mock('../src/api/providers', () => ({
  getProvider: mockGetProvider,
  providerList: [
    { id: 'opentdb', name: 'Open Trivia Database', icon: '📚' },
    { id: 'triviaapi', name: 'The Trivia API', icon: '🎯' },
  ],
}))

vi.mock('../src/pages/Menu', () => ({
  default: () => <div>Menu page</div>,
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
  tokenUrl: 'https://opentdb.com/api_token.php?command=request',
  difficulties: [],
  types: [],
  getCategories: vi.fn(),
  getQuestions: vi.fn(),
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
    mockAxiosGet.mockReturnValue(new Promise(() => {}))
    renderApp()
    expect(screen.getByText('Loading...')).toBeDefined()
  })

  it('renders Menu after token fetch resolves for a provider that requires a token', async () => {
    mockGetProvider.mockReturnValue(makeProvider())
    mockAxiosGet.mockResolvedValue({ data: { token: 'test-token' } })
    renderApp()
    await screen.findByText('Menu page')
  })

  it('renders Menu without calling axiosInstance for a provider that does not require one', async () => {
    mockGetProvider.mockReturnValue(makeProvider({ requiresToken: false }))
    renderApp()
    await screen.findByText('Menu page')
    expect(mockAxiosGet).not.toHaveBeenCalled()
  })

  it('shows error message and Retry button when token fetch fails', async () => {
    mockGetProvider.mockReturnValue(makeProvider())
    mockAxiosGet.mockRejectedValue(new Error('network error'))
    renderApp()
    await screen.findByText('Failed to retrieve Token')
    expect(screen.getByRole('button', { name: 'Retry' })).toBeDefined()
  })

  it('clicking Retry triggers a second token fetch', async () => {
    mockGetProvider.mockReturnValue(makeProvider())
    mockAxiosGet.mockRejectedValue(new Error('network error'))
    renderApp()
    await screen.findByText('Failed to retrieve Token')

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))

    await waitFor(() => {
      expect(mockAxiosGet).toHaveBeenCalledTimes(2)
    })
  })
})
