import {useState, useEffect} from 'react'
import {registrar, iniciarSesion, cerrarSesion, escucharSesion} from './data/auth'
import {guardarNota, cargarNotas} from './data/notas'

function LoginDemo() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [usuario, setUsuario] = useState(null)
    const [revisando, setRevisando] = useState(true)
    const [texto, setTexto] = useState('')
    const [notas, setNotas] = useState([])

    useEffect(() => {
        if (!usuario) return
        cargarNotas(usuario.uid)
            .then(setNotas)
            .catch((err) => setError(`No se pudieron cargar las notas: ${err.message}`))
    }, [usuario])

    useEffect(() => {
        const cancelar = escucharSesion((user) => {
            setUsuario(user)
            setRevisando(false)
        })
        return cancelar
    }, [])

    async function guardar(e) {
        e.preventDefault()
        if (!usuario) return
        setError('')
        try {
            await guardarNota(usuario.uid, texto)
            setTexto('')
            setNotas(await cargarNotas(usuario.uid))
        } catch (err) {
            setError(`No se pudo guardar la nota: ${err.message}`)
        }
    }

    async function entrar(e) {
        e.preventDefault()
        setError('')
        try {
            await iniciarSesion(email, password)
        } catch (err) {
            setError(`No se pudo iniciar sesión: ${err.message}`)
        }
    }

    async function crearCuenta() {
        setError('')
        try {
            await registrar(email, password)
        } catch (err) {
            setError(`No se pudo crear la cuenta: ${err.message}`)
        }
    }

    async function salir() {
        setError('')
        try {
            await cerrarSesion()
            setNotas([])
        } catch (err) {
            setError(`No se pudo cerrar sesión: ${err.message}`)
        }
    }

    if (revisando) return <p>Revisando sesión...</p>

    if (!usuario) {
        return (
            <main>
                <h1>Login Demo</h1>
                <form onSubmit={entrar}>
                    <input type="email" name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                    <input type="password" name="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
                    <button type="submit">Entrar</button>
                    <button type="button" onClick={crearCuenta}>Crear cuenta</button>
                </form>
                {error && <p className="error">{error}</p>}
            </main>
        )
    }

    return (
        <main>
            <h1>Bienvenido {usuario.email}</h1>
            <p>UID: {usuario.uid}</p>
            <button onClick={salir}>Cerrar sesión</button>
            {error && <p className="error">{error}</p>}
            <h2>Mis notas</h2>
            <form onSubmit={guardar}>
                <input type="text" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribe una nota" />
                <button type="submit" disabled={!texto.trim()}>Guardar nota</button>
            </form>
            <ul>
                {notas.map((nota) => <li key={nota.id}>{nota.texto}</li>)}
            </ul>
        </main>
    )
}

export default LoginDemo
