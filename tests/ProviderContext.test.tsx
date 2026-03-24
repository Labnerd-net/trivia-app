import { render, screen, fireEvent, waitFor, renderHook, act } from '@testing-library/react'
import axiosInstance from '../src/api/axiosInstance'
import { ProviderProvider, useProvider } from '../src/context/ProviderContext'

vi.mock('../src/api/axiosInstance', () => ({
  default: { get: vi.fn() },
}))
const mockAxiosGet = vi.mocked(axiosInstance.get)

const mockGetProvider = vi.hoisted(() => vi.fn())

vi.mock('../src/api/providers', () => ({
  getProvider: mockGetProvider,
  providerList: [],
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

describe('useProvider', () => {
  it('throws when used outside ProviderProvider', () => {
    expect(() => renderHook(() => useProvider())).toThrow(
      'useProvider must be used within a ProviderProvider'
    )
  })
})

describe('ProviderProvider', () => {
  it('renders children after token fetch resolves', async () => {
    mockGetProvider.mockReturnValue(makeProvider())
    mockAxiosGet.mockResolvedValue({ data: { token: 'test-token' } })

    render(
      <ProviderProvider>
        <div>child content</div>
      </ProviderProvider>
    )

    await screen.findByText('child content')
  })

  it('shows loading state while token is fetching', () => {
    mockGetProvider.mockReturnValue(makeProvider())
    mockAxiosGet.mockReturnValue(new Promise(() => {}))

    render(
      <ProviderProvider>
        <div>child content</div>
      </ProviderProvider>
    )

    expect(screen.getByText('Loading...')).toBeDefined()
    expect(screen.queryByText('child content')).toBeNull()
  })

  it('exposes the resolved provider object with the correct id', async () => {
    mockGetProvider.mockReturnValue(makeProvider({ id: 'opentdb' }))
    mockAxiosGet.mockResolvedValue({ data: { token: 'test-token' } })

    const { result } = renderHook(() => useProvider(), {
      wrapper: ({ children }) => (
        <ProviderProvider>{children}</ProviderProvider>
      ),
    })

    await waitFor(() => {
      expect(result.current.provider.id).toBe('opentdb')
    })
  })

  it('switching provider triggers a new token fetch with the new provider id', async () => {
    mockGetProvider
      .mockReturnValueOnce(makeProvider({ id: 'opentdb' }))
      .mockReturnValue(makeProvider({ id: 'triviaapi' }))
    mockAxiosGet.mockResolvedValue({ data: { token: 'token-1' } })

    const SwitchButton = () => {
      const { setSelectedProvider } = useProvider()
      return (
        <button onClick={() => setSelectedProvider('triviaapi')}>
          Switch Provider
        </button>
      )
    }

    render(
      <ProviderProvider>
        <SwitchButton />
      </ProviderProvider>
    )

    await screen.findByRole('button', { name: 'Switch Provider' })

    mockAxiosGet.mockResolvedValue({ data: { token: 'token-2' } })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Switch Provider' }))
    })

    await waitFor(() => {
      expect(mockGetProvider).toHaveBeenCalledWith('triviaapi')
      expect(mockAxiosGet).toHaveBeenCalledTimes(2)
    })
  })

  it('does not update state after unmount during in-flight fetch', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockGetProvider.mockReturnValue(makeProvider())
    mockAxiosGet.mockReturnValue(new Promise(() => {}))

    const { unmount } = render(
      <ProviderProvider>
        <div>child content</div>
      </ProviderProvider>
    )

    unmount()
    await act(async () => {})

    expect(consoleSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('unmounted component')
    )
    consoleSpy.mockRestore()
  })

  it('retry increments retryCount and triggers a new token fetch', async () => {
    mockGetProvider.mockReturnValue(makeProvider())
    mockAxiosGet
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValue({ data: { token: 'recovered-token' } })

    render(
      <ProviderProvider>
        <div>child content</div>
      </ProviderProvider>
    )

    await screen.findByText('Failed to retrieve Token')
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))

    await waitFor(() => {
      expect(mockAxiosGet).toHaveBeenCalledTimes(2)
    })
  })

  it('shows error UI on failure then renders children after retry succeeds', async () => {
    mockGetProvider.mockReturnValue(makeProvider())
    mockAxiosGet
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValue({ data: { token: 'recovered-token' } })

    render(
      <ProviderProvider>
        <div>child content</div>
      </ProviderProvider>
    )

    await screen.findByText('Failed to retrieve Token')
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    await screen.findByText('child content')
  })
})
