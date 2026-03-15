import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router'
import { getProvider, providerList } from '../api/providers';
import { useFetch } from '../hooks/useFetch';
import type { Category } from '../types';

interface MenuProps {
  setCategory: (cat: Category) => void;
  provider: string;
  onProviderChange: (id: string) => void;
}

interface MenuFormData {
  category: string;
  difficulty: string;
  type: string;
}

export default function Menu({ setCategory, provider, onProviderChange }: MenuProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<MenuFormData>({
    category: 'all',
    difficulty: 'all',
    type: 'all',
  });

  const currentProvider = getProvider(provider);

  const fetchCategories = useCallback(
    (signal: AbortSignal) => getProvider(provider).getCategories({ signal }),
    [provider]
  );

  const { data, loading, error, retry } = useFetch<Category[]>(fetchCategories, 'Failed to retrieve Categories');
  const categories = data ?? [];

  useEffect(() => {
    if (data && data.length > 0) {
      const prov = getProvider(provider);
      setFormData(prev => ({
        ...prev,
        category: data[0].id,
        difficulty: prov.difficulties[0].value,
        type: prov.types[0].value,
      }));
    }
  }, [data, provider]);

  const selectCategory = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, category: event.target.value }))
  }

  const selectDifficulty = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, difficulty: event.target.value }))
  }

  const selectType = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, type: event.target.value }))
  }

  const startQuiz = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const chosenCategory = categories.find((cat) => cat.id === formData.category);
    if (chosenCategory) setCategory(chosenCategory);
    navigate(`/quiz/${formData.category}/${formData.difficulty}/${formData.type}/`)
  }

  if (loading) return <div className="tq-status">Loading categories...</div>;
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
      <form onSubmit={startQuiz} className="tq-form-panel">
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="tq-field-label">Data Source</label>
          <div className="tq-provider-tabs">
            {providerList.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`tq-provider-tab ${provider === p.id ? 'active' : ''}`}
                onClick={() => onProviderChange(p.id)}
              >
                {p.name}
              </button>
            ))}
          </div>
          <div className="tq-provider-desc">{currentProvider.description}</div>
        </div>

        <hr className="tq-divider" />

        <div className="tq-fields-grid">
          <div>
            <label className="tq-field-label" htmlFor="formCategory">Category</label>
            <select
              id="formCategory"
              className="tq-select"
              name="category"
              onChange={selectCategory}
              value={formData.category}
            >
              {categories.map((data) =>
                <option key={data.id} value={data.id}>{data.name}</option>
              )}
            </select>
          </div>
          <div>
            <label className="tq-field-label" htmlFor="formDifficulty">Difficulty</label>
            <select
              id="formDifficulty"
              className="tq-select"
              name="difficulty"
              onChange={selectDifficulty}
              value={formData.difficulty}
            >
              {currentProvider.difficulties.map((data) =>
                <option key={data.value} value={data.value}>{data.label}</option>
              )}
            </select>
          </div>
          <div>
            <label className="tq-field-label" htmlFor="formType">Question Type</label>
            <select
              id="formType"
              className="tq-select"
              name="type"
              onChange={selectType}
              value={formData.type}
            >
              {currentProvider.types.map((data) =>
                <option key={data.value} value={data.value}>{data.label}</option>
              )}
            </select>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <button type="submit" className="tq-btn tq-btn-primary">
            Start Quiz
          </button>
        </div>
      </form>
    </div>
  )
}
