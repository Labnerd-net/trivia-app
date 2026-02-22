import { useState, useEffect } from 'react'
import { decodeHtml, shuffleAnswers } from '../utils';
import type { NormalizedQuestion } from '../types';

const LETTERS = ['A', 'B', 'C', 'D'];

interface QuestionProps {
  question: NormalizedQuestion;
  number?: number;
}

export default function Question({ question, number }: QuestionProps) {
  const [showAnswers, setShowAnswers] = useState(false);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);

  useEffect(() => {
    const answers = shuffleAnswers(question);
    setShuffledAnswers(answers);
    setShowAnswers(false);
  }, [question]);

  return (
    <div className="tq-question-wrap">
      {number && (
        <div className="tq-question-num">Question {number}</div>
      )}
      <div className="tq-question-text">
        {decodeHtml(question.question)}
      </div>
      <button
        className={`tq-reveal-btn ${showAnswers ? 'active' : ''}`}
        onClick={() => setShowAnswers(!showAnswers)}
      >
        {showAnswers ? 'Hide Answer' : 'Reveal Answer'}
      </button>
      <div className="tq-answers">
        {shuffledAnswers.map((opt, idx) => (
          <div
            key={opt}
            className={`tq-answer ${showAnswers ? (opt === question.correctAnswer ? 'correct' : 'revealed-wrong') : ''}`}
            aria-label={opt === question.correctAnswer ? 'Correct answer' : 'Answer option'}
          >
            <div className="tq-answer-letter">{LETTERS[idx] ?? idx + 1}</div>
            <div className="tq-answer-text">{decodeHtml(opt)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
