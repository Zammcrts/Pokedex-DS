
import { useState, useEffect } from 'react'

import { PokemonCard } from './components/PokemonCard'
import { buscarPokemones, obtenerPagina } from './data/pokemones'
import { obtenerEquipo, guardarEnEquipo, quitarDeEquipo } from './data/equipo'
import { normalizar, calcularRango, LIMITE } from './logic/pokemones'
import { validarAgregar } from './logic/equipo'
import './App.css'

function App() {
  const [pokemones, setPokemones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const [equipo, setEquipo] = useState([])
  const [errorEquipo, setErrorEquipo] = useState(null)

  const [offset, setOffset] = useState(0)
  const [total, setTotal] = useState(0)

  const [texto, setTexto] = useState('')
  const [consulta, setConsulta] = useState('')

  // Agregar un Pokémon al equipo
  async function agregar(p) {
    const mensaje = validarAgregar(equipo, p)

    if (mensaje) {
      setErrorEquipo(mensaje)
      return
    }

    try {
      setErrorEquipo(null)

      await guardarEnEquipo(p)

      setEquipo((actual) => [...actual, p])
    } catch (err) {
      setErrorEquipo(
        `No se pudo guardar en el equipo: ${err.message}`
      )
    }
  }

  // Quitar un Pokémon de Firestore y de la interfaz
  async function quitar(id) {
    try {
      setErrorEquipo(null)

      await quitarDeEquipo(id)

      setEquipo((actual) =>
        actual.filter((p) => p.id !== Number(id))
      )
    } catch (err) {
      setErrorEquipo(
        `No se pudo quitar del equipo: ${err.message}`
      )
    }
  }

  // Buscar un Pokémon
  function buscar(e) {
    e.preventDefault()

    setOffset(0)
    setConsulta(texto.trim().toLowerCase())
  }

  // Volver a mostrar todos los Pokémon
  function verTodos() {
    setTexto('')
    setConsulta('')
    setOffset(0)
  }

  // Cargar datos desde PokéAPI
  useEffect(() => {
    let cancelado = false

    async function cargar() {
      setCargando(true)
      setError(null)

      try {
        const { total, detalles } = consulta
          ? await buscarPokemones(consulta, LIMITE, offset)
          : await obtenerPagina(LIMITE, offset)

        if (!cancelado) {
          setTotal(total)
          setPokemones(detalles.map(normalizar))
        }
      } catch (err) {
        if (!cancelado) {
          setError(err.message)
        }
      } finally {
        if (!cancelado) {
          setCargando(false)
        }
      }
    }

    cargar()

    return () => {
      cancelado = true
    }
  }, [offset, consulta])

  // Recuperar el equipo guardado en Firestore
  useEffect(() => {
    async function cargarEquipo() {
      try {
        setEquipo(await obtenerEquipo())
      } catch (err) {
        setErrorEquipo(
          `No se pudo cargar el equipo: ${err.message}`
        )
      }
    }

    cargarEquipo()
  }, [])

  const { desde, hasta } = calcularRango(offset, total)

  return (
    <main>
      <h1>Pokédex</h1>

      <form onSubmit={buscar}>
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Nombre o número"
        />

        <button type="submit">Buscar</button>

        {consulta && (
          <button type="button" onClick={verTodos}>
            Ver todos
          </button>
        )}
      </form>

      {!error && (
        <div className="navegacion">
          <button
            disabled={cargando || offset === 0}
            onClick={() =>
              setOffset((actual) => actual - LIMITE)
            }
          >
            Anterior
          </button>

          <span>
            {total > 0 && `${desde}–${hasta} de ${total}`}
          </span>

          <button
            disabled={
              cargando || offset + LIMITE >= total
            }
            onClick={() =>
              setOffset((actual) => actual + LIMITE)
            }
          >
            Siguiente
          </button>
        </div>
      )}

      <h2>Mi equipo ({equipo.length} / 6)</h2>

      {errorEquipo && (
        <p className="error">{errorEquipo}</p>
      )}

      <section className="equipo">
        {equipo.map((p) => (
          <PokemonCard
            key={p.id}
            pokemon={p}
            onQuitar={quitar}
          />
        ))}
      </section>

      {cargando && <p>Cargando...</p>}

      {error && <p className="error">{error}</p>}

      {!cargando && !error && (
        <section className="grid">
          {pokemones.map((p) => (
            <PokemonCard
              key={p.id}
              pokemon={p}
              onAgregar={agregar}
            />
          ))}
        </section>
      )}
    </main>
  )
}

export default App
