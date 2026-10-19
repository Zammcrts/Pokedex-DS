
import { useState, useEffect } from 'react'
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc
} from 'firebase/firestore'

import { db } from './firebase'
import { PokemonCard } from './components/PokemonCard'
import { normalizar } from './pokemon'
import './App.css'

const API = 'https://pokeapi.co/api/v2'
const LIMITE = 25 // Pokémon por página

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
    if (equipo.length >= 6) {
      setErrorEquipo('Tu equipo ya tiene 6 Pokémon.')
      return
    }

    if (equipo.some((e) => e.id === p.id)) {
      setErrorEquipo('Este Pokémon ya está en tu equipo.')
      return
    }

    try {
      setErrorEquipo(null)

      await setDoc(
        doc(db, 'equipo', String(p.id)),
        p
      )

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

      await deleteDoc(
        doc(db, 'equipo', String(id))
      )

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
        if (consulta) {
          const res = await fetch(
            `${API}/pokemon/${encodeURIComponent(consulta)}`
          )

          if (!res.ok) {
            throw new Error(
              `Pokémon no encontrado (${res.status})`
            )
          }

          const data = await res.json()

          if (!cancelado) {
            setPokemones([normalizar(data)])
          }
        } else {
          const res = await fetch(
            `${API}/pokemon?limit=${LIMITE}&offset=${offset}`
          )

          if (!res.ok) {
            throw new Error(
              `Error al cargar la lista (${res.status})`
            )
          }

          const lista = await res.json()

          const detalles = await Promise.all(
            lista.results.map(async (p) => {
              const respuesta = await fetch(p.url)

              if (!respuesta.ok) {
                throw new Error(
                  `No se pudo cargar ${p.name}`
                )
              }

              return respuesta.json()
            })
          )

          if (!cancelado) {
            setTotal(lista.count)
            setPokemones(detalles.map(normalizar))
          }
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
        const snap = await getDocs(
          collection(db, 'equipo')
        )

        setEquipo(
          snap.docs.map((d) => ({
            tipos: [],
            ...d.data(),
            id: Number(d.id)
          }))
        )
      } catch (err) {
        setErrorEquipo(
          `No se pudo cargar el equipo: ${err.message}`
        )
      }
    }

    cargarEquipo()
  }, [])

  const desde = offset + 1
  const hasta = Math.min(offset + LIMITE, total)

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

      {!consulta && (
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
