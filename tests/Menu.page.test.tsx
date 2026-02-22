import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import Menu from '../src/pages/Menu'

const mockNavigate = vi.hoisted(() => vi.fn())
const mockGetCategories = vi.hoisted(() => vi.fn())
const mockGetProvider = vi.hoisted(() => vi.fn())

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../src/api/providers', () => ({
  getProvider: mockGetProvider,
  providerList: [{ id: 'opentdb', name: 'Open Trivia Database', icon: '📚' }],
}))

const MOCK_CATEGORIES = [
  { id: '9', name: 'General Knowledge' },
  { id: '10', name: 'Books' },
]

const mockProvider = {
  id: 'opentdb',
  name: 'Open Trivia Database',
  description: 'Test description',
  requiresToken: true,
  difficulties: [{ value: 'all', label: 'Any difficulty' }],
  types: [{ value: 'all', label: 'Any type' }],
  getCategories: mockGetCategories,
  getQuestions: vi.fn(),
  getToken: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetProvider.mockReturnValue(mockProvider)
})

const renderMenu = () => {
  const setCategory = vi.fn()
  const onProviderChange = vi.fn()
  render(
    <MemoryRouter>
      <Menu setCategory={setCategory} provider="opentdb" onProviderChange={onProviderChange} />
    </MemoryRouter>
  )
  return { setCategory, onProviderChange }
}

describe('Menu page', () => {
  it('shows "Loading categories..." immediately on render', () => {
    mockGetCategories.mockReturnValue(new Promise(() => {}))
    renderMenu()
    expect(screen.getByText('Loading categories...')).toBeDefined()
  })

  it('populates category select with mock categories after fetch resolves', async () => {
    mockGetCategories.mockResolvedValue(MOCK_CATEGORIES)
    renderMenu()
    await screen.findByText('General Knowledge')
    expect(screen.getByText('Books')).toBeDefined()
  })

  it('renders category, difficulty, and type selects after fetch resolves', async () => {
    mockGetCategories.mockResolvedValue(MOCK_CATEGORIES)
    renderMenu()
    await screen.findByText('General Knowledge')
    expect(screen.getByRole('combobox', { name: 'Category' })).toBeDefined()
    expect(screen.getByRole('combobox', { name: 'Difficulty' })).toBeDefined()
    expect(screen.getByRole('combobox', { name: 'Question Type' })).toBeDefined()
  })

  it('shows error message when fetch rejects', async () => {
    mockGetCategories.mockRejectedValue(new Error('network error'))
    renderMenu()
    await screen.findByText('Failed to retrieve Categories')
  })

  it('navigates to the correct quiz URL on form submit', async () => {
    mockGetCategories.mockResolvedValue(MOCK_CATEGORIES)
    renderMenu()
    await screen.findByText('General Knowledge')

    fireEvent.click(screen.getByRole('button', { name: 'Start Quiz' }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/quiz/9/all/all/')
    })
  })
})
