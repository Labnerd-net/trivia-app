import { Link } from 'react-router'
import { useTheme } from '../hooks/useTheme'

const Navbar = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <nav className="tq-navbar">
      <div className="container tq-navbar-inner">
        <Link className="tq-brand" to="/">TRIVIA CHALLENGE</Link>
        <button
          className="tq-theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </nav>
  )
}

export default Navbar
