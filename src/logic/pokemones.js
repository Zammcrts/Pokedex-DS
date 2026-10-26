export const LIMITE = 25 // Pokémon por página

// Convierte la respuesta cruda de PokéAPI al formato que usan la tarjeta y Firestore
export function normalizar(raw) {
  return {
    id: raw.id,
    nombre: raw.name,
    img: raw.sprites.other['official-artwork'].front_default,
    tipos: raw.types.map(t => t.type.name),
    altura: raw.height / 10, // metros
    peso: raw.weight / 10,   // kg
  }
}

// Rango que se muestra en la navegación ("desde–hasta de total")
export function calcularRango(offset, total) {
  return {
    desde: offset + 1,
    hasta: Math.min(offset + LIMITE, total)
  }
}
