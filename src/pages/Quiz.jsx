import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from "react-router";
import Button from 'react-bootstrap/Button'
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

  if (loading) return <div className="container text-center mt-5">Loading Questions ...</div>;
  if (error) return <div className="container text-center mt-5 text-danger">{error}</div>;

  return (
    <div className="text-white">
      <div className="container my-5">
        <div className="d-flex flex-column justify-content-start align-items-start">
          <div className="d-flex flex-row justify-content-between align-items-center w-100 my-2">
            <div className="bg-info p-2 rounded-1">
              Category: {category.name}
            </div>
            <div className="bg-info p-2 rounded-1">
              Difficulty: {difficultyLabel}
            </div>
            <div className="bg-info p-2 rounded-1">
              Question Type: {typeLabel}
            </div>
            <div className="bg-info p-2 rounded-1">
              <span className="my-2">Page {page + 1}</span>
            </div>
          </div>
        </div>
        <div>
          {questions.results && questions.results.map((data) => (
            <Question key={`${data.category}-${data.question}-${data.difficulty}`} question={data} />
          ))}
        </div>
        <Button
          variant="primary"
          onClick={nextQuestions}
          disabled={isFetching}
          className="me-2"
        >
          {isFetching ? 'Loading...' : 'Next Questions'}
        </Button>
        <Button variant="secondary" onClick={returnToMenu}>
          Menu
        </Button>
      </div>
    </div>
  )
}
