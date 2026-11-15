import{
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { auth } from "../firebase"

export async function registrar(email, password){
    const credenciales = await createUserWithEmailAndPassword(auth, email, password)
    return credenciales.user
}

export async function iniciarSesion(email, password){
    const credenciales = await signInWithEmailAndPassword(auth, email, password)
    return credenciales.user
}

export async function cerrarSesion(){
    await signOut(auth)
}

export function escucharSesion(callback){
    return onAuthStateChanged(auth, callback)
}