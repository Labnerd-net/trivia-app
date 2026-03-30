import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router'
import { providerList, providerGroups } from '../api/providers';
import { useFetch } from '../hooks/useFetch';
import { useProvider } from '../context/ProviderContext';
import { useProviderCapabilities } from '../hooks/useProviderCapabilities';
import { ERROR_FETCH_CATEGORIES } from '../constants/errorMessages';
import type { Category } from '../types';

interface MenuFormData {
  category: string;
  difficulty: string;
  type: string;
}

export default function Menu() {
  const navigate = useNavigate();
  const { provider, setSelectedProvider, setCategory } = useProvider();
  const { hasMultipleDifficulties, hasMultipleTypes } = useProviderCapabilities(provider);
  const [formData, setFormData] = useState<MenuFormData>({
    category: 'all',
    difficulty: 'all',
    type: 'all',
  });

  const fetchCategories = useCallback(
    (signal: AbortSignal) => provider.getCategories({ signal }),
    [provider]
  );

  const { data, loading, error, retry } = useFetch<Category[]>(fetchCategories, ERROR_FETCH_CATEGORIES);
  const categories = data ?? [];

  useEffect(() => {
    if (data && data.length > 0) {
      setFormData(prev => ({
        ...prev,
        category: data[0].id,
        difficulty: provider.difficulties[0].value,
        type: provider.types[0].value,
      }));
    }
  }, [data, provider]);

  const handleChange = (key: keyof MenuFormData) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [key]: e.target.value }));
  };

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
        <div className="tq-form-section">
          <label className="tq-field-label" htmlFor="formProvider">Data Source</label>
          <select
            id="formProvider"
            className="tq-select"
            value={provider.id}
            onChange={(e) => setSelectedProvider(e.target.value)}
          >
            {providerGroups.map((group) => (
              <optgroup key={group} label={group}>
                {providerList.filter((p) => p.group === group).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <div className="tq-provider-desc">{provider.description}</div>
        </div>

        <hr className="tq-divider" />

        <div className="tq-fields-grid">
          <div>
            <label className="tq-field-label" htmlFor="formCategory">Category</label>
            <select
              id="formCategory"
              className="tq-select"
              name="category"
              onChange={handleChange('category')}
              value={formData.category}
            >
              {categories.map((cat) =>
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              )}
            </select>
          </div>
          {hasMultipleDifficulties && (
            <div>
              <label className="tq-field-label" htmlFor="formDifficulty">Difficulty</label>
              <select
                id="formDifficulty"
                className="tq-select"
                name="difficulty"
                onChange={handleChange('difficulty')}
                value={formData.difficulty}
              >
                {provider.difficulties.map((opt) =>
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                )}
              </select>
            </div>
          )}
          {hasMultipleTypes && (
            <div>
              <label className="tq-field-label" htmlFor="formType">Question Type</label>
              <select
                id="formType"
                className="tq-select"
                name="type"
                onChange={handleChange('type')}
                value={formData.type}
              >
                {provider.types.map((opt) =>
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                )}
              </select>
            </div>
          )}
        </div>

        <div className="tq-form-actions">
          <button type="submit" className="tq-btn tq-btn-primary">
            Start Quiz
          </button>
        </div>
      </form>
    </div>
  )
}
