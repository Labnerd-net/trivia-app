import { Link } from 'react-router'

const Navbar = () => {
  return (
    <nav className="tq-navbar">
      <div className="container">
        <Link className="tq-brand" to="/">TRIVIA CHALLENGE</Link>
      </div>
    </nav>
  )
}

export default Navbar
