import { render, screen, fireEvent, waitFor, renderHook, act } from '@testing-library/react'
import { ProviderProvider, useProvider } from '../src/context/ProviderContext'

const mockGetToken = vi.hoisted(() => vi.fn())
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
    mockGetToken.mockResolvedValue('test-token')

    render(
      <ProviderProvider>
        <div>child content</div>
      </ProviderProvider>
    )

    await screen.findByText('child content')
  })

  it('shows loading state while token is fetching', () => {
    mockGetProvider.mockReturnValue(makeProvider())
    mockGetToken.mockReturnValue(new Promise(() => {}))

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
    mockGetToken.mockResolvedValue('test-token')

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
    mockGetToken.mockResolvedValue('token-1')

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

    mockGetToken.mockResolvedValue('token-2')
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Switch Provider' }))
    })

    await waitFor(() => {
      expect(mockGetProvider).toHaveBeenCalledWith('triviaapi')
      expect(mockGetToken).toHaveBeenCalledTimes(2)
    })
  })

  it('does not update state after unmount during in-flight fetch', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockGetProvider.mockReturnValue(makeProvider())
    mockGetToken.mockReturnValue(new Promise(() => {}))

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
    mockGetToken
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValue('recovered-token')

    render(
      <ProviderProvider>
        <div>child content</div>
      </ProviderProvider>
    )

    await screen.findByText('Failed to retrieve Token')
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))

    await waitFor(() => {
      expect(mockGetToken).toHaveBeenCalledTimes(2)
    })
  })

  it('shows error UI on failure then renders children after retry succeeds', async () => {
    mockGetProvider.mockReturnValue(makeProvider())
    mockGetToken
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValue('recovered-token')

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
