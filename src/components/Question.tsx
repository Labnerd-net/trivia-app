import { useState, useEffect, useMemo } from 'react'
import { decodeHtml, shuffleAnswers } from '../utils';
import type { NormalizedQuestion } from '../types';

const LETTERS = ['A', 'B', 'C', 'D'];

interface QuestionProps {
  question: NormalizedQuestion;
  number?: number;
  showCategory?: boolean;
}

export default function Question({ question, number, showCategory }: QuestionProps) {
  const [showAnswers, setShowAnswers] = useState(false);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);

  useEffect(() => {
    setShuffledAnswers(shuffleAnswers(question).map(decodeHtml));
    setShowAnswers(false);
  }, [question]);

  const decodedQuestion = useMemo(() => decodeHtml(question.question), [question.question]);
  const decodedCorrectAnswer = useMemo(() => decodeHtml(question.correctAnswer), [question.correctAnswer]);

  return (
    <div className="tq-question-wrap">
      <div className="tq-question-header">
        {number && (
          <div className="tq-question-num">Question {number}</div>
        )}
        {showCategory && <div className="tq-question-category">{question.category}</div>}
      </div>
      <div className="tq-question-text">
        {decodedQuestion}
      </div>
      <button
        className={`tq-reveal-btn ${showAnswers ? 'active' : ''}`}
        onClick={() => setShowAnswers(!showAnswers)}
      >
        {showAnswers ? 'Hide Answer' : 'Reveal Answer'}
      </button>
      {question.type === 'open' ? (
        <div className={`tq-open-answer ${showAnswers ? 'revealed' : ''}`}>
          {showAnswers && <div className="tq-open-answer-text">{decodedCorrectAnswer}</div>}
        </div>
      ) : (
        <div className="tq-answers">
          {shuffledAnswers.map((opt, idx) => (
            <div
              key={`${idx}-${opt}`}
              className={`tq-answer ${showAnswers ? (opt === decodedCorrectAnswer ? 'correct' : 'revealed-wrong') : ''}`}
              aria-label={showAnswers && opt === decodedCorrectAnswer ? `Correct: ${opt}` : opt}
            >
              <div className="tq-answer-letter">{LETTERS[idx] ?? idx + 1}</div>
              <div className="tq-answer-text">{opt}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
