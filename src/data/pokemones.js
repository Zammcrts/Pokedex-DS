import { filtrarPorNombre } from '../logic/pokemones'

const API = 'https://pokeapi.co/api/v2'

let nombresCache = null

// Busca un Pokémon por nombre o número y devuelve la respuesta cruda de PokéAPI
export async function obtenerPokemon(consulta) {
  const res = await fetch(
    `${API}/pokemon/${encodeURIComponent(consulta)}`
  )

  if (!res.ok) {
    throw new Error(
      `Pokémon no encontrado (${res.status})`
    )
  }

  return res.json()
}

// Trae los detalles crudos de cada { name, url } de una lista
async function obtenerDetalles(resultados) {
  return Promise.all(
    resultados.map(async (p) => {
      const respuesta = await fetch(p.url)

      if (!respuesta.ok) {
        throw new Error(
          `No se pudo cargar ${p.name}`
        )
      }

      return respuesta.json()
    })
  )
}

// Trae una página de Pokémon con sus detalles crudos
export async function obtenerPagina(limite, offset) {
  const res = await fetch(
    `${API}/pokemon?limit=${limite}&offset=${offset}`
  )

  if (!res.ok) {
    throw new Error(
      `Error al cargar la lista (${res.status})`
    )
  }

  const lista = await res.json()
  const detalles = await obtenerDetalles(lista.results)

  return { total: lista.count, detalles }
}

// Lista completa de nombres { name, url }; se pide una sola vez y queda en caché
function obtenerNombres() {
  if (!nombresCache) {
    nombresCache = fetch(`${API}/pokemon?limit=100000&offset=0`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            `Error al cargar los nombres (${res.status})`
          )
        }

        return res.json()
      })
      .then((data) => data.results)
      .catch((err) => {
        nombresCache = null // permitir reintentar
        throw err
      })
  }

  return nombresCache
}

// Busca por número exacto o por nombre parcial, paginando los resultados
export async function buscarPokemones(consulta, limite, offset) {
  if (/^\d+$/.test(consulta)) {
    const data = await obtenerPokemon(consulta)

    return { total: 1, detalles: [data] }
  }

  const coincidencias = filtrarPorNombre(await obtenerNombres(), consulta)

  if (coincidencias.length === 0) {
    throw new Error(
      `No se encontraron Pokémon con "${consulta}"`
    )
  }

  const detalles = await obtenerDetalles(
    coincidencias.slice(offset, offset + limite)
  )

  return { total: coincidencias.length, detalles }
}
