import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [health, setHealth] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:8000/health')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        setHealth(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return (
    <div className="app">
      <h1>Swap</h1>
      <p className="subtitle">Skill-trading platform</p>

      <div className="card">
        <h2>Backend Connection</h2>
        {loading && <p className="status loading">Connecting to backend...</p>}
        {error && (
          <p className="status error">
            Failed to connect: {error}
          </p>
        )}
        {health && (
          <div className="status success">
            <p>Connected to backend!</p>
            <pre>{JSON.stringify(health, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
