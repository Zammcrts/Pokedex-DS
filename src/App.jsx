import { useState, useEffect } from 'react'
import { PokemonCard } from './components/PokemonCard'
import './App.css'

const API = "https://pokeapi.co/api/v2"

function App() {
  const [pokemones, setPokemones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      setCargando(true)
      setError(null)
      try {
        const ids = Array.from({ length: 30 }, (_, i) => i + 1)
        const respuestas = await Promise.all(
          ids.map(async (id) => {
            const res = await fetch(`${API}/pokemon/${id}`)
            if (!res.ok) throw new Error(`Pokemon no encontrado (${res.status})`)
            return res.json()
          })
        )
        setPokemones(respuestas)
      } catch (err) {
        setError(err.message)
      } finally {
        setCargando(false)
      }
    }
    fetchData()
  }, [])

  return (
    <>
      <h1>Pokedex</h1>
      {cargando && <p>Cargando...</p>}
      {error && <p className="error">{error}</p>}
      <section className="grid">
        {pokemones.map((p) => (
          <PokemonCard key={p.id} pokemon={p} />
        ))}
      </section>
    </>
  )
}

export default App