import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router'
import Quiz from '../src/pages/Quiz'

const mockNavigate = vi.hoisted(() => vi.fn())
const mockGetQuestions = vi.hoisted(() => vi.fn())

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../src/api/providers', () => ({
  getProvider: vi.fn(),
  providerList: [],
}))

const makeQuestion = (i: number) => ({
  question: `Test question ${i}`,
  correctAnswer: `Correct answer ${i}`,
  incorrectAnswers: ['Wrong A', 'Wrong B', 'Wrong C'],
  category: 'General',
  difficulty: 'easy',
  type: 'multiple' as const,
})

const MOCK_QUESTIONS = { results: Array.from({ length: 10 }, (_, i) => makeQuestion(i + 1)) }

const mockProvider = {
  id: 'opentdb',
  name: 'Open Trivia Database',
  description: 'Test',
  requiresToken: true,
  difficulties: [
    { value: 'easy', label: 'Easy' },
    { value: 'all', label: 'Any difficulty' },
  ],
  types: [{ value: 'multiple', label: 'Multiple Choice' }],
  getCategories: vi.fn(),
  getQuestions: mockGetQuestions,
}

vi.mock('../src/context/ProviderContext', () => ({
  useProvider: () => ({ provider: mockProvider, token: null, setSelectedProvider: vi.fn() }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

const renderQuiz = (path = '/quiz/9/easy/multiple/') => {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/quiz/:categoryID/:difficulty/:type/"
          element={<Quiz category={null} />}
        />
      </Routes>
    </MemoryRouter>
  )
}

describe('Quiz page', () => {
  it('shows "Loading questions..." immediately on render', () => {
    mockGetQuestions.mockReturnValue(new Promise(() => {}))
    renderQuiz()
    expect(screen.getByText('Loading questions...')).toBeDefined()
  })

  it('renders 10 Question components after fetch resolves', async () => {
    mockGetQuestions.mockResolvedValue(MOCK_QUESTIONS)
    renderQuiz()
    await screen.findByText('Test question 1')
    for (let i = 1; i <= 10; i++) {
      expect(screen.getByText(`Test question ${i}`)).toBeDefined()
    }
  })

  it('shows error message and Retry button when fetch rejects', async () => {
    mockGetQuestions.mockRejectedValue(new Error('network error'))
    renderQuiz()
    await screen.findByText('Failed to retrieve Questions')
    expect(screen.getByRole('button', { name: 'Retry' })).toBeDefined()
  })

  it('clicking Retry triggers a second call to getQuestions', async () => {
    mockGetQuestions.mockRejectedValue(new Error('network error'))
    renderQuiz()
    await screen.findByText('Failed to retrieve Questions')

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))

    await waitFor(() => {
      expect(mockGetQuestions).toHaveBeenCalledTimes(2)
    })
  })

  describe('param validation', () => {
    it('rejects injected categoryId and never calls getQuestions', async () => {
      renderQuiz('/quiz/9%26token%3Dinjected/easy/multiple/')
      await screen.findByText('Invalid quiz parameters.')
      expect(mockGetQuestions).not.toHaveBeenCalled()
    })

    it('rejects an unknown difficulty value and never calls getQuestions', async () => {
      renderQuiz('/quiz/9/legendary/multiple/')
      await screen.findByText('Invalid quiz parameters.')
      expect(mockGetQuestions).not.toHaveBeenCalled()
    })

    it('rejects an unknown type value and never calls getQuestions', async () => {
      renderQuiz('/quiz/9/easy/essay/')
      await screen.findByText('Invalid quiz parameters.')
      expect(mockGetQuestions).not.toHaveBeenCalled()
    })

    it('accepts "all" for categoryId, difficulty, and type', async () => {
      mockGetQuestions.mockResolvedValue(MOCK_QUESTIONS)
      renderQuiz('/quiz/all/all/multiple/')
      await screen.findByText('Test question 1')
      expect(mockGetQuestions).toHaveBeenCalled()
    })
  })

  it('"Next Questions" button is disabled while fetching', async () => {
    let resolveSecond!: (val: typeof MOCK_QUESTIONS) => void
    const secondPromise = new Promise<typeof MOCK_QUESTIONS>(resolve => {
      resolveSecond = resolve
    })

    mockGetQuestions
      .mockResolvedValueOnce(MOCK_QUESTIONS)
      .mockReturnValueOnce(secondPromise)

    renderQuiz()
    await screen.findByText('Test question 1')

    expect((screen.getByRole('button', { name: 'Next Questions' }) as HTMLButtonElement).disabled).toBe(false)

    fireEvent.click(screen.getByRole('button', { name: 'Next Questions' }))

    await waitFor(() => {
      const btn = screen.getByRole('button', { name: 'Loading...' }) as HTMLButtonElement
      expect(btn.disabled).toBe(true)
    })

    await act(async () => {
      resolveSecond(MOCK_QUESTIONS)
    })
  })
})
