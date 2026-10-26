const API = 'https://pokeapi.co/api/v2'

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

  return { total: lista.count, detalles }
}
