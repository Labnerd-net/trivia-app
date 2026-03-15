import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from "react-router";
import axios from 'axios';
import Question from '../components/Question';
import { getProvider } from '../api/providers';
import { useFetch } from '../hooks/useFetch';
import type { Category, QuestionsResult } from '../types';

const NUMBER_OF_QUESTIONS = 10;

interface QuizProps {
  token: string | null;
  category: Category | null;
  provider: string;
}

export default function Quiz({ token, category, provider }: QuizProps) {
  const [questions, setQuestions] = useState<QuestionsResult | null>(null);
  const [page, setPage] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const paginationControllerRef = useRef<AbortController | null>(null);
  const navigate = useNavigate()

  const { categoryID, difficulty, type } = useParams();
  const currentProvider = getProvider(provider);

  const fetchQuestions = useCallback(
    (signal: AbortSignal) => getProvider(provider).getQuestions({
      amount: NUMBER_OF_QUESTIONS,
      categoryId: categoryID,
      difficulty,
      type,
      token,
      signal,
    }),
    [provider, categoryID, difficulty, type, token]
  );

  const { data: fetchedQuestions, loading, error, retry } = useFetch<QuestionsResult>(fetchQuestions, 'Failed to retrieve Questions');

  useEffect(() => {
    if (fetchedQuestions) setQuestions(fetchedQuestions);
  }, [fetchedQuestions]);

  const nextQuestions = async () => {
    if (!isFetching) {
      paginationControllerRef.current?.abort();
      const controller = new AbortController();
      paginationControllerRef.current = controller;
      try {
        setIsFetching(true);
        const data = await currentProvider.getQuestions({
          amount: NUMBER_OF_QUESTIONS,
          categoryId: categoryID,
          difficulty,
          type,
          token,
          signal: controller.signal,
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

  const difficultyLabel = currentProvider.difficulties.find(diff => diff.value === difficulty)?.label || difficulty;
  const typeLabel = currentProvider.types.find(t => t.value === type)?.label || type;

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
        {questions?.results.map((data, idx) => (
          <Question
            key={`${page}-${idx}`}
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
