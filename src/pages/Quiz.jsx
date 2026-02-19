import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from "react-router";
import Question from '../components/Question';
import { getProvider } from '../api/providers';

const NUMBER_OF_QUESTIONS = 10;

export default function Quiz({ token, category, provider }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const navigate = useNavigate()

  const { categoryID, difficulty, type } = useParams();
  const currentProvider = getProvider(provider);

  const retrieveQuestions = useCallback(async (signal) => {
    try {
      setIsFetching(true);
      const data = await currentProvider.getQuestions({
        amount: NUMBER_OF_QUESTIONS,
        categoryId: categoryID,
        difficulty,
        type,
        token,
        signal
      });
      setQuestions(data);
      setError(null);
    } catch (err) {
      if (err.name !== 'CanceledError') {
        setError('Failed to retrieve Questions');
      }
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [categoryID, difficulty, type, token, currentProvider]);

  useEffect(() => {
    const controller = new AbortController();
    retrieveQuestions(controller.signal);
    return () => controller.abort();
  }, [retrieveQuestions]);

  const nextQuestions = () => {
    if (!isFetching) {
      retrieveQuestions();
      window.scrollTo(0, 0);
      setPage((prev) => prev + 1);
    }
  }

  const returnToMenu = () => {
    navigate('/');
  }

  const difficultyLabel = useMemo(() =>
    currentProvider.difficulties.find(diff => diff.value === difficulty)?.label || difficulty,
    [difficulty, currentProvider]
  );

  const typeLabel = useMemo(() =>
    currentProvider.types.find(t => t.value === type)?.label || type,
    [type, currentProvider]
  );

  if (loading) return <div className="tq-status">Loading questions...</div>;
  if (error) return <div className="tq-status error">{error}</div>;

  return (
    <div className="container py-5">
      <div className="tq-stats-bar">
        <div className="tq-stat-chip">
          <span className="tq-chip-label">Category</span>
          <span className="tq-chip-value">{category.name}</span>
        </div>
        <div className="tq-stat-chip">
          <span className="tq-chip-label">Difficulty</span>
          <span className="tq-chip-value">{difficultyLabel}</span>
        </div>
        <div className="tq-stat-chip">
          <span className="tq-chip-label">Type</span>
          <span className="tq-chip-value">{typeLabel}</span>
        </div>
        <div className="tq-stat-chip">
          <span className="tq-chip-label">Page</span>
          <span className="tq-chip-value">{page + 1}</span>
        </div>
      </div>

      <div>
        {questions.results && questions.results.map((data, idx) => (
          <Question
            key={`${data.category}-${data.question}-${data.difficulty}`}
            question={data}
            number={idx + 1}
          />
        ))}
      </div>

      <div className="tq-page-actions">
        <button
          className="tq-btn tq-btn-primary"
          onClick={nextQuestions}
          disabled={isFetching}
        >
          {isFetching ? 'Loading...' : 'Next Questions'}
        </button>
        <button className="tq-btn tq-btn-ghost" onClick={returnToMenu}>
          Menu
        </button>
      </div>
    </div>
  )
}
