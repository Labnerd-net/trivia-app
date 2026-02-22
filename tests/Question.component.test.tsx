import { render, screen, fireEvent } from '@testing-library/react'
import Question from '../src/components/Question'
import type { NormalizedQuestion } from '../src/types'

const makeQuestion = (overrides: Partial<NormalizedQuestion> = {}): NormalizedQuestion => ({
  question: 'What is the capital of France?',
  correctAnswer: 'Paris',
  incorrectAnswers: ['London', 'Berlin', 'Madrid'],
  category: 'Geography',
  difficulty: 'easy',
  type: 'multiple',
  ...overrides,
})

describe('Question component', () => {
  it('renders question text', () => {
    render(<Question question={makeQuestion()} />)
    expect(screen.getByText('What is the capital of France?')).toBeDefined()
  })

  it('renders decoded HTML entities in question text', () => {
    render(<Question question={makeQuestion({ question: 'What is 1 &amp; 1?' })} />)
    expect(screen.getByText('What is 1 & 1?')).toBeDefined()
  })

  it('renders question number chip when number prop is provided', () => {
    render(<Question question={makeQuestion()} number={3} />)
    expect(screen.getByText('Question 3')).toBeDefined()
  })

  it('does not render number chip when number prop is omitted', () => {
    render(<Question question={makeQuestion()} />)
    expect(screen.queryByText(/^Question \d/)).toBeNull()
  })

  it('renders all 4 answer options for a multiple choice question', () => {
    const q = makeQuestion()
    render(<Question question={q} />)
    const allAnswers = [q.correctAnswer, ...q.incorrectAnswers]
    allAnswers.forEach(answer => {
      expect(screen.getByText(answer)).toBeDefined()
    })
  })

  it('button initially reads "Reveal Answer"', () => {
    render(<Question question={makeQuestion()} />)
    expect(screen.getByRole('button', { name: 'Reveal Answer' })).toBeDefined()
  })

  it('after clicking "Reveal Answer": button reads "Hide Answer", correct answer has class correct, wrong answers have class revealed-wrong', () => {
    const q = makeQuestion()
    render(<Question question={q} />)

    fireEvent.click(screen.getByRole('button', { name: 'Reveal Answer' }))

    expect(screen.getByRole('button', { name: 'Hide Answer' })).toBeDefined()

    const correctEl = screen.getByLabelText('Correct answer')
    expect(correctEl.classList.contains('correct')).toBe(true)

    const wrongEls = screen.getAllByLabelText('Answer option')
    wrongEls.forEach(el => {
      expect(el.classList.contains('revealed-wrong')).toBe(true)
    })
  })

  it('clicking "Hide Answer" removes reveal classes and restores button text', () => {
    const q = makeQuestion()
    render(<Question question={q} />)

    fireEvent.click(screen.getByRole('button', { name: 'Reveal Answer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Hide Answer' }))

    expect(screen.getByRole('button', { name: 'Reveal Answer' })).toBeDefined()

    const correctEl = screen.getByLabelText('Correct answer')
    expect(correctEl.classList.contains('correct')).toBe(false)

    const wrongEls = screen.getAllByLabelText('Answer option')
    wrongEls.forEach(el => {
      expect(el.classList.contains('revealed-wrong')).toBe(false)
    })
  })
})
