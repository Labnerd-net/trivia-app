import { useState } from 'react'

type Theme = 'dark' | 'light'

function getInitialTheme(): Theme {
  try {
    return localStorage.getItem('tq-theme') === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

function applyTheme(theme: Theme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
  try {
    localStorage.setItem('tq-theme', theme)
  } catch {
    // localStorage unavailable — proceed silently
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    applyTheme(next)
  }

  return { theme, toggleTheme }
}
