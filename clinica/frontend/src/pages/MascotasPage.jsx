import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axiosConfig'

const EMPTY_FORM = { nombre: '', fechaNacimiento: '', sexo: 'MACHO', propietarioId: '', razaId: '' }

export default function MascotasPage() {
    const [mascotas, setMascotas] = useState([])
    const [propietarios, setPropietarios] = useState([])
    const [razas, setRazas] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [busqueda, setBusqueda] = useState('')
    const [mostrarFormulario, setMostrarFormulario] = useState(false)
    const [editando, setEditando] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [guardando, setGuardando] = useState(false)
    const { isAdmin, isVeterinario, logout } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        cargarTodo()
    }, [])

    const cargarTodo = async () => {
        try {
            const [mascotasRes, propietariosRes, razasRes] = await Promise.all([
                api.get('/api/v1/mascotas'),
                api.get('/api/v1/propietarios'),
                api.get('/api/v1/razas'),
            ])
            setMascotas(mascotasRes.data)
            setPropietarios(propietariosRes.data)
            setRazas(razasRes.data)
        } catch {
            setError('Error al cargar los datos')
        } finally {
            setLoading(false)
        }
    }

    const abrirNuevo = () => {
        setForm(EMPTY_FORM)
        setEditando(null)
        setMostrarFormulario(true)
    }

    const abrirEditar = (m) => {
        setForm({
            nombre: m.nombre || '',
            fechaNacimiento: m.fechaNacimiento || '',
            sexo: m.sexo || 'MACHO',
            propietarioId: m.propietarioId || '',
            razaId: m.razaId || '',
        })
        setEditando(m.id)
        setMostrarFormulario(true)
    }

    const cancelar = () => {
        setMostrarFormulario(false)
        setEditando(null)
        setForm(EMPTY_FORM)
    }

    const guardar = async () => {
        if (!form.nombre.trim()) { alert('El nombre es obligatorio.'); return }
        if (!form.propietarioId) { alert('Debe seleccionar un propietario.'); return }
        if (!form.razaId) { alert('Debe seleccionar una raza.'); return }
        setGuardando(true)
        try {
            const payload = {
                ...form,
                propietarioId: Number(form.propietarioId),
                razaId: Number(form.razaId),
                fechaNacimiento: form.fechaNacimiento || null,
            }
            if (editando) {
                await api.put(`/api/v1/mascotas/${editando}`, payload)
            } else {
                await api.post('/api/v1/mascotas', payload)
            }
            cancelar()
            cargarTodo()
        } catch {
            alert('Error al guardar la mascota.')
        } finally {
            setGuardando(false)
        }
    }

    const eliminar = async (id) => {
        if (!window.confirm('¿Eliminar esta mascota?')) return
        try {
            await api.delete(`/api/v1/mascotas/${id}`)
            cargarTodo()
        } catch {
            alert('Error al eliminar')
        }
    }

    const mascotasFiltradas = mascotas.filter(m =>
        m.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.razaNombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.propietarioNombre?.toLowerCase().includes(busqueda.toLowerCase())
    )

    const handleLogout = () => { logout(); navigate('/login') }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <nav style={navStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                     onClick={() => navigate('/dashboard')}>
                    <span style={{ fontSize: '1.5rem' }}>🐾</span>
                    <span style={{ color: 'white', fontWeight: '600', fontSize: '1.1rem' }}>Clínica Veterinaria</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => navigate('/dashboard')} style={btnNav}>Dashboard</button>
                    <button onClick={() => navigate('/propietarios')} style={btnNav}>Propietarios</button>
                    <button onClick={() => navigate('/veterinarios')} style={btnNav}>Veterinarios</button>
                    <button onClick={() => navigate('/consultas')} style={btnNav}>Consultas</button>
                    <button onClick={handleLogout} style={{ ...btnNav, backgroundColor: '#dc3545' }}>Cerrar sesión</button>
                </div>
            </nav>

            <div style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ color: '#2d6a4f', margin: 0 }}>🐶 Mascotas</h2>
                    {(isAdmin() || isVeterinario()) && (
                        <button onClick={abrirNuevo} style={btnPrimary}>+ Nueva mascota</button>
                    )}
                </div>

                {/* Formulario inline */}
                {mostrarFormulario && (
                    <div style={formCard}>
                        <h3 style={{ color: '#2d6a4f', marginTop: 0, marginBottom: '1.25rem' }}>
                            {editando ? 'Editar mascota' : 'Nueva mascota'}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Nombre *</label>
                                <input
                                    value={form.nombre}
                                    onChange={e => setForm({ ...form, nombre: e.target.value })}
                                    placeholder="Nombre de la mascota"
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Fecha de nacimiento</label>
                                <input
                                    type="date"
                                    value={form.fechaNacimiento}
                                    onChange={e => setForm({ ...form, fechaNacimiento: e.target.value })}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Sexo</label>
                                <select
                                    value={form.sexo}
                                    onChange={e => setForm({ ...form, sexo: e.target.value })}
                                    style={inputStyle}
                                >
                                    <option value="MACHO">Macho</option>
                                    <option value="HEMBRA">Hembra</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Propietario *</label>
                                <select
                                    value={form.propietarioId}
                                    onChange={e => setForm({ ...form, propietarioId: e.target.value })}
                                    style={inputStyle}
                                >
                                    <option value="">-- Seleccionar propietario --</option>
                                    {propietarios.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.nombre} {p.primerApellido}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Raza *</label>
                                <select
                                    value={form.razaId}
                                    onChange={e => setForm({ ...form, razaId: e.target.value })}
                                    style={inputStyle}
                                >
                                    <option value="">-- Seleccionar raza --</option>
                                    {razas.map(r => (
                                        <option key={r.id} value={r.id}>
                                            {r.nombre} {r.especieNombre ? `(${r.especieNombre})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
                            <button onClick={guardar} disabled={guardando} style={btnPrimary}>
                                {guardando ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button onClick={cancelar} style={btnCancel}>Cancelar</button>
                        </div>
                    </div>
                )}

                <input
                    placeholder="Buscar por nombre, raza o propietario..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    style={searchStyle}
                />

                {loading && <p>Cargando...</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}

                <div style={{ overflowX: 'auto' }}>
                    <table style={tableStyle}>
                        <thead>
                        <tr style={{ backgroundColor: '#2d6a4f', color: 'white' }}>
                            <th style={th}>ID</th>
                            <th style={th}>Nombre</th>
                            <th style={th}>Raza</th>
                            <th style={th}>Propietario</th>
                            <th style={th}>Sexo</th>
                            <th style={th}>Fecha nac.</th>
                            {(isAdmin() || isVeterinario()) && <th style={th}>Acciones</th>}
                        </tr>
                        </thead>
                        <tbody>
                        {mascotasFiltradas.map((m, i) => (
                            <tr key={m.id} style={{ backgroundColor: i % 2 === 0 ? 'white' : '#f8f9fa' }}>
                                <td style={td}>{m.id}</td>
                                <td style={td}>{m.nombre}</td>
                                <td style={td}>{m.razaNombre}</td>
                                <td style={td}>{m.propietarioNombre}</td>
                                <td style={td}>{m.sexo}</td>
                                <td style={td}>{m.fechaNacimiento}</td>
                                {(isAdmin() || isVeterinario()) && (
                                    <td style={td}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => abrirEditar(m)} style={btnEdit}>Editar</button>
                                            {isAdmin() && (
                                                <button onClick={() => eliminar(m.id)} style={btnDelete}>Eliminar</button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {mascotasFiltradas.length === 0 && !loading && (
                        <p style={{ textAlign: 'center', color: '#6c757d', marginTop: '2rem' }}>
                            No se encontraron mascotas
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

const navStyle = { backgroundColor: '#2d6a4f', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }
const btnNav = { background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }
const btnPrimary = { backgroundColor: '#2d6a4f', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }
const btnCancel = { backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }
const btnEdit = { backgroundColor: '#f0ad4e', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }
const btnDelete = { backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }
const formCard = { backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #dee2e6' }
const labelStyle = { display: 'block', marginBottom: '4px', fontSize: '0.9rem', color: '#495057', fontWeight: '500' }
const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #dee2e6', fontSize: '0.95rem', boxSizing: 'border-box' }
const searchStyle = { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #dee2e6', marginBottom: '1rem', fontSize: '0.95rem', boxSizing: 'border-box' }
const tableStyle = { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
const th = { padding: '12px 16px', textAlign: 'left', fontWeight: '500' }
const td = { padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }