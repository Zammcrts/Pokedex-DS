export const MAX_EQUIPO = 6

// Devuelve el mensaje de error si no se puede agregar, o null si se puede
export function validarAgregar(equipo, p) {
  if (equipo.length >= MAX_EQUIPO) {
    return 'Tu equipo ya tiene 6 Pokémon.'
  }

  if (equipo.some((e) => e.id === p.id)) {
    return 'Este Pokémon ya está en tu equipo.'
  }

  return null
}
