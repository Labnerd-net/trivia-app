import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router'
import { getProvider, providerList } from '../api/providers';

export default function Menu({ setCategory, provider, onProviderChange }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    category: 'all',
    difficulty: 'all',
    type: 'all',
  });

  const currentProvider = getProvider(provider);

  useEffect(() => {
    const controller = new AbortController();

    const retrieveCategories = async () => {
      try {
        setLoading(true);
        const cats = await currentProvider.getCategories();
        setCategories(cats);
        setFormData(prev => ({
          ...prev,
          category: cats[0]?.id || 'all'
        }));
      } catch (err) {
        if (err.name !== 'CanceledError') {
          setError('Failed to retrieve Categories');
        }
      } finally {
        setLoading(false);
      }
    };

    retrieveCategories();

    return () => controller.abort();
  }, [provider, currentProvider]);

  const selectCategory = (event) => {
    setFormData((prev) => ({ ...prev, category: event.target.value }))
  }

  const selectDifficulty = (event) => {
    setFormData((prev) => ({ ...prev, difficulty: event.target.value }))
  }

  const selectType = (event) => {
    setFormData((prev) => ({ ...prev, type: event.target.value }))
  }

  const startQuiz = (event) => {
    event.preventDefault()
    const chosenCategory = categories.find((cat) => cat.id === formData.category);
    setCategory(chosenCategory);
    navigate(`/quiz/${formData.category}/${formData.difficulty}/${formData.type}/`)
  }

  if (loading) return <div className="tq-status">Loading categories...</div>;
  if (error) return <div className="tq-status error">{error}</div>;

  return (
    <div className="container tq-page">
      <div className="tq-menu-eyebrow">Configure Your Quiz</div>
      <div className="tq-menu-title">Knowledge<br />Challenge</div>

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
