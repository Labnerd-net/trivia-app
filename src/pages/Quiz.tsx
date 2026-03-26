import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from "react-router";
import axios from 'axios';
import Question from '../components/Question';
import { useFetch } from '../hooks/useFetch';
import { useProvider } from '../context/ProviderContext';
import { ERROR_FETCH_QUESTIONS } from '../constants/errorMessages';
import type { QuestionsResult } from '../types';

const NUMBER_OF_QUESTIONS = 10;

export default function Quiz() {
  const [questions, setQuestions] = useState<QuestionsResult | null>(null);
  const [page, setPage] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const navigate = useNavigate()

  const { categoryID, difficulty, type } = useParams();
  const { provider, token, category } = useProvider();

  const paramsValid =
    /^[a-z0-9_]*$/i.test(categoryID ?? '') &&
    (!difficulty || provider.difficulties.some(d => d.value === difficulty)) &&
    (!type || provider.types.some(t => t.value === type));

  const fetchQuestions = useCallback(
    (signal: AbortSignal) => {
      if (!paramsValid) return Promise.reject(new Error('Invalid quiz parameters.'));
      return provider.getQuestions({
        amount: NUMBER_OF_QUESTIONS,
        categoryId: categoryID,
        difficulty,
        type,
        token,
        signal,
      });
    },
    [provider, categoryID, difficulty, type, token, paramsValid]
  );

  const { data: fetchedQuestions, loading, error, retry } = useFetch<QuestionsResult>(fetchQuestions, ERROR_FETCH_QUESTIONS);

  useEffect(() => {
    if (fetchedQuestions) setQuestions(fetchedQuestions);
  }, [fetchedQuestions]);

  const nextQuestions = async () => {
    if (!isFetching) {
      try {
        setIsFetching(true);
        const data = await provider.getQuestions({
          amount: NUMBER_OF_QUESTIONS,
          categoryId: categoryID,
          difficulty,
          type,
          token,
        });
        setQuestions(data);
        window.scrollTo(0, 0);
        setPage((prev) => prev + 1);
      } catch (err) {
        if (!axios.isCancel(err)) {
          // pagination errors are silent — user can click again
        }
      } finally {
        setIsFetching(false);
      }
    }
  }

  const returnToMenu = () => {
    navigate('/');
  }

  const difficultyLabel = provider.difficulties.find(diff => diff.value === difficulty)?.label || difficulty;
  const typeLabel = provider.types.find(t => t.value === type)?.label || type;

  if (!paramsValid) return <div className="tq-status error">Invalid quiz parameters.</div>;
  if (loading) return <div className="tq-status">Loading questions...</div>;
  if (error) return (
    <div className="tq-status error">
      <div>{error}</div>
      <button className="tq-btn tq-btn-ghost" onClick={retry}>
        Retry
      </button>
    </div>
  );

  return (
    <div className="container tq-page">
      <div className="tq-stats-bar">
        <div className="tq-stat-chip">
          <span className="tq-chip-label">Category</span>
          <span className="tq-chip-value">{category?.name ?? '—'}</span>
        </div>
        {provider.difficulties.length > 1 && (
          <div className="tq-stat-chip">
            <span className="tq-chip-label">Difficulty</span>
            <span className="tq-chip-value">{difficultyLabel}</span>
          </div>
        )}
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
        {questions?.results.map((data, idx) => (
          <Question
            key={`${page}-${idx}`}
            question={data}
            number={idx + 1}
            showCategory={categoryID === 'all'}
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
