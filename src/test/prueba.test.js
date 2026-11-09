// src/test/prueba.test.js
// Se corre con:  npm test
// No necesita navegador, ni internet, ni Firebase: solo la lógica.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MAX_EQUIPO, validarAgregar } from '../logic/equipo.js'

const poke = (id) => ({ id, nombre: `poke${id}`, img: `${id}.png`, tipos: ['normal'] })

function equipoCon(n) {
  const e = []
  for (let id = 1; id <= n; id++) e.push(poke(id))
  return e
}

test('se puede agregar un Pokémon a un equipo vacío', () => {
  assert.equal(validarAgregar([], poke(25)), null)
})

test('con 6, el séptimo no entra', () => {
  const seis = equipoCon(MAX_EQUIPO)
  assert.equal(validarAgregar(seis, poke(150)), 'Tu equipo ya tiene 6 Pokémon.')
})

test('no se repite el mismo Pokémon', () => {
  assert.equal(validarAgregar([poke(25)], poke(25)), 'Este Pokémon ya está en tu equipo.')
})

test('no modifica el equipo que recibe', () => {
  const original = Object.freeze([poke(1)])
  validarAgregar(original, poke(2))
  assert.equal(original.length, 1)
})

test('con menos de 6 y sin repetir, sí se puede agregar', () => {
  assert.equal(validarAgregar(equipoCon(MAX_EQUIPO - 1), poke(150)), null)
})
