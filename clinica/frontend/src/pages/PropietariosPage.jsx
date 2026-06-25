import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axiosConfig'

const EMPTY_FORM = { nombre: '', primerApellido: '', segundoApellido: '', telefono: '', email: '' }

export default function PropietariosPage() {
    const [propietarios, setPropietarios] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [busqueda, setBusqueda] = useState('')
    const [mostrarFormulario, setMostrarFormulario] = useState(false)
    const [editando, setEditando] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [guardando, setGuardando] = useState(false)
    const { isAdmin, isVeterinario, logout } = useAuth()
    const navigate = useNavigate()

    useEffect(() => { cargarPropietarios() }, [])

    const cargarPropietarios = async () => {
        try {
            const res = await api.get('/api/v1/propietarios')
            setPropietarios(res.data)
        } catch {
            setError('Error al cargar propietarios')
        } finally {
            setLoading(false)
        }
    }

    const abrirNuevo = () => {
        setForm(EMPTY_FORM)
        setEditando(null)
        setMostrarFormulario(true)
    }

    const abrirEditar = (p) => {
        setForm({
            nombre: p.nombre || '',
            primerApellido: p.primerApellido || '',
            segundoApellido: p.segundoApellido || '',
            telefono: p.telefono || '',
            email: p.email || '',
        })
        setEditando(p.id)
        setMostrarFormulario(true)
    }

    const cancelar = () => {
        setMostrarFormulario(false)
        setEditando(null)
        setForm(EMPTY_FORM)
    }

    const guardar = async () => {
        if (!form.nombre.trim() || !form.primerApellido.trim()) {
            alert('Nombre y primer apellido son obligatorios.')
            return
        }
        setGuardando(true)
        try {
            if (editando) {
                await api.put(`/api/v1/propietarios/${editando}`, form)
            } else {
                await api.post('/api/v1/propietarios', form)
            }
            cancelar()
            cargarPropietarios()
        } catch {
            alert('Error al guardar el propietario.')
        } finally {
            setGuardando(false)
        }
    }

    const eliminar = async (id) => {
        if (!window.confirm('¿Eliminar este propietario?')) return
        try {
            await api.delete(`/api/v1/propietarios/${id}`)
            cargarPropietarios()
        } catch {
            alert('Error al eliminar')
        }
    }

    const propietariosFiltrados = propietarios.filter(p =>
        p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.primerApellido?.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.email?.toLowerCase().includes(busqueda.toLowerCase())
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
                    <button onClick={() => navigate('/mascotas')} style={btnNav}>Mascotas</button>
                    <button onClick={() => navigate('/veterinarios')} style={btnNav}>Veterinarios</button>
                    <button onClick={() => navigate('/consultas')} style={btnNav}>Consultas</button>
                    <button onClick={handleLogout} style={{ ...btnNav, backgroundColor: '#dc3545' }}>Cerrar sesión</button>
                </div>
            </nav>

            <div style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ color: '#2d6a4f', margin: 0 }}>👤 Propietarios</h2>
                    {(isAdmin() || isVeterinario()) && (
                        <button onClick={abrirNuevo} style={btnPrimary}>+ Nuevo propietario</button>
                    )}
                </div>

                {/* Formulario inline */}
                {mostrarFormulario && (
                    <div style={formCard}>
                        <h3 style={{ color: '#2d6a4f', marginTop: 0, marginBottom: '1.25rem' }}>
                            {editando ? 'Editar propietario' : 'Nuevo propietario'}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Nombre *</label>
                                <input
                                    value={form.nombre}
                                    onChange={e => setForm({ ...form, nombre: e.target.value })}
                                    placeholder="Nombre"
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Primer apellido *</label>
                                <input
                                    value={form.primerApellido}
                                    onChange={e => setForm({ ...form, primerApellido: e.target.value })}
                                    placeholder="Primer apellido"
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Segundo apellido</label>
                                <input
                                    value={form.segundoApellido}
                                    onChange={e => setForm({ ...form, segundoApellido: e.target.value })}
                                    placeholder="Segundo apellido"
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Teléfono</label>
                                <input
                                    value={form.telefono}
                                    onChange={e => setForm({ ...form, telefono: e.target.value })}
                                    placeholder="Teléfono"
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Email</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    placeholder="correo@ejemplo.com"
                                    style={inputStyle}
                                />
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
                    placeholder="Buscar por nombre, apellido o email..."
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
                            <th style={th}>Primer apellido</th>
                            <th style={th}>Segundo apellido</th>
                            <th style={th}>Teléfono</th>
                            <th style={th}>Email</th>
                            {(isAdmin() || isVeterinario()) && <th style={th}>Acciones</th>}
                        </tr>
                        </thead>
                        <tbody>
                        {propietariosFiltrados.map((p, i) => (
                            <tr key={p.id} style={{ backgroundColor: i % 2 === 0 ? 'white' : '#f8f9fa' }}>
                                <td style={td}>{p.id}</td>
                                <td style={td}>{p.nombre}</td>
                                <td style={td}>{p.primerApellido}</td>
                                <td style={td}>{p.segundoApellido}</td>
                                <td style={td}>{p.telefono}</td>
                                <td style={td}>{p.email}</td>
                                {(isAdmin() || isVeterinario()) && (
                                    <td style={td}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => abrirEditar(p)} style={btnEdit}>Editar</button>
                                            {isAdmin() && (
                                                <button onClick={() => eliminar(p.id)} style={btnDelete}>Eliminar</button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {propietariosFiltrados.length === 0 && !loading && (
                        <p style={{ textAlign: 'center', color: '#6c757d', marginTop: '2rem' }}>
                            No se encontraron propietarios
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