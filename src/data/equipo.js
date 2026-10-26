import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc
} from 'firebase/firestore'

import { db } from '../firebase'

// Recuperar el equipo guardado en Firestore
export async function obtenerEquipo() {
  const snap = await getDocs(
    collection(db, 'equipo')
  )

  return snap.docs.map((d) => ({
    tipos: [],
    ...d.data(),
    id: Number(d.id)
  }))
}

export async function guardarEnEquipo(p) {
  await setDoc(
    doc(db, 'equipo', String(p.id)),
    p
  )
}

export async function quitarDeEquipo(id) {
  await deleteDoc(
    doc(db, 'equipo', String(id))
  )
}
