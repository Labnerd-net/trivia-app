import { useState, useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import { decodeHtml } from '../requests';

function shuffleAnswers(question) {
  let answers = []

  // Jeopardy format - just show the answer
  if (question.type === 'jeopardy') {
    return [question.correctAnswer];
  }

  if (question.type === 'multiple') {
    answers = [
      question.correctAnswer,
      ...question.incorrectAnswers,
    ];

    // Fisher-Yates shuffle
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [answers[i], answers[j]] = [answers[j], answers[i]];
    }
  } else {
    answers = ['True', 'False'];
  }

  return answers;
}

export default function Question({ question }) {
  const [showAnswers, setShowAnswers] = useState(false);
  const [shuffledAnswers, setShuffledAnswers] = useState([]);
  const isJeopardy = question.type === 'jeopardy';

  useEffect(() => {
    const answers = shuffleAnswers(question);
    setShuffledAnswers(answers);
    setShowAnswers(false);
  }, [question]);

  const toggleShowAnswer = () => {
    setShowAnswers(!showAnswers)
  };

  return (
    <div className="mb-4">
      <div className="fs-4 fw-bold lead">
        {decodeHtml(question.question)}
      </div>
      {question.value && (
        <div className="text-info mb-2">
          Value: ${question.value}
        </div>
      )}
      <Button variant="primary" onClick={toggleShowAnswer} className="my-2">
        {showAnswers ? 'Hide Answer' : 'Show Answer'}
      </Button>
      {isJeopardy ? (
        <div className="my-3">
          {showAnswers && (
            <div className="alert alert-success">
              <strong>Answer:</strong> {decodeHtml(question.correctAnswer)}
            </div>
          )}
        </div>
      ) : (
        <ul className="list-group my-3">
          {shuffledAnswers.map((opt) => (
            <li
              key={opt}
              className={`list-group-item list-group-item-action my-1 rounded-pill
              ${opt === question.correctAnswer && showAnswers ? 'bg-success border border-success text-white' : 'bg-secondary'}`}
              aria-label={opt === question.correctAnswer ? 'Correct answer' : 'Answer option'}
            >
              {decodeHtml(opt)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
