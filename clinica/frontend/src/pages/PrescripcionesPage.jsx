import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axiosConfig'

const EMPTY_FORM = { consultaId: '', medicamentoId: '', dosis: '', duracionDias: '' }

export default function PrescripcionesPage() {
    const [prescripciones, setPrescripciones] = useState([])
    const [consultas, setConsultas] = useState([])
    const [medicamentos, setMedicamentos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [busqueda, setBusqueda] = useState('')
    const [mostrarFormulario, setMostrarFormulario] = useState(false)
    // editando stores the original {consultaId, medicamentoId} key so we can DELETE the old record
    const [editando, setEditando] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [guardando, setGuardando] = useState(false)
    const { isAdmin, isVeterinario, logout } = useAuth()
    const navigate = useNavigate()

    useEffect(() => { cargarTodo() }, [])

    const cargarTodo = async () => {
        try {
            const [prescripcionesRes, consultasRes] = await Promise.all([
                api.get('/api/v1/consulta-medicamentos'),
                api.get('/api/v1/consultas'),
            ])
            setPrescripciones(prescripcionesRes.data)
            setConsultas(consultasRes.data)

            // Medicamentos only needed to populate the form — skip for ROLE_USER
            if (isAdmin() || isVeterinario()) {
                const medicamentosRes = await api.get('/api/v1/medicamentos')
                setMedicamentos(medicamentosRes.data)
            }
        } catch {
            setError('Error al cargar los datos')
        } finally {
            setLoading(false)
        }
    }

    // Enrich each prescription with its consulta's details for display
    const enriquecer = (p) => {
        const consulta = consultas.find(c => c.id === p.consultaId)
        return {
            ...p,
            mascotaNombre: consulta?.mascotaNombre ?? '—',
            fechaConsulta: consulta?.fechaConsulta ?? '—',
            veterinarioNombre: consulta?.veterinarioNombre ?? '—',
        }
    }

    const prescripcionesFiltradas = prescripciones
        .map(enriquecer)
        .filter(p =>
            p.medicamentoNombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.mascotaNombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.dosis?.toLowerCase().includes(busqueda.toLowerCase())
        )

    const abrirNuevo = () => {
        setForm(EMPTY_FORM)
        setEditando(null)
        setMostrarFormulario(true)
    }

    const abrirEditar = (p) => {
        setEditando({ consultaId: p.consultaId, medicamentoId: p.medicamentoId })
        setForm({
            consultaId: p.consultaId,
            medicamentoId: p.medicamentoId,
            dosis: p.dosis || '',
            duracionDias: p.duracionDias || '',
        })
        setMostrarFormulario(true)
    }

    const cancelar = () => {
        setMostrarFormulario(false)
        setEditando(null)
        setForm(EMPTY_FORM)
    }

    const guardar = async () => {
        if (!form.consultaId) { alert('Debe seleccionar una consulta.'); return }
        if (!form.medicamentoId) { alert('Debe seleccionar un medicamento.'); return }
        if (!form.dosis.trim()) { alert('La dosis es obligatoria.'); return }
        if (!form.duracionDias || Number(form.duracionDias) < 1) {
            alert('La duración debe ser al menos 1 día.'); return
        }
        setGuardando(true)
        try {
            // Editing has no PUT endpoint — delete the old record, then create the new one
            if (editando) {
                await api.delete(
                    `/api/v1/consulta-medicamentos/${editando.consultaId}/${editando.medicamentoId}`
                )
            }
            await api.post('/api/v1/consulta-medicamentos', {
                consultaId: Number(form.consultaId),
                medicamentoId: Number(form.medicamentoId),
                dosis: form.dosis,
                duracionDias: Number(form.duracionDias),
            })
            cancelar()
            cargarTodo()
        } catch {
            alert('Error al guardar la prescripción.')
        } finally {
            setGuardando(false)
        }
    }

    const eliminar = async (consultaId, medicamentoId) => {
        if (!window.confirm('¿Eliminar esta prescripción?')) return
        try {
            await api.delete(`/api/v1/consulta-medicamentos/${consultaId}/${medicamentoId}`)
            cargarTodo()
        } catch {
            alert('Error al eliminar')
        }
    }

    const consultaLabel = (c) =>
        `#${c.id} — ${c.mascotaNombre ?? '?'} (${c.fechaConsulta ?? '?'})`

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
                    <button onClick={() => navigate('/consultas')} style={btnNav}>Consultas</button>
                    <button onClick={() => navigate('/mascotas')} style={btnNav}>Mascotas</button>
                    <button onClick={handleLogout} style={{ ...btnNav, backgroundColor: '#dc3545' }}>Cerrar sesión</button>
                </div>
            </nav>

            <div style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ color: '#2d6a4f', margin: 0 }}>💉 Prescripciones</h2>
                    {(isAdmin() || isVeterinario()) && (
                        <button onClick={abrirNuevo} style={btnPrimary}>+ Nueva prescripción</button>
                    )}
                </div>

                {/* Formulario inline */}
                {mostrarFormulario && (
                    <div style={formCard}>
                        <h3 style={{ color: '#2d6a4f', marginTop: 0, marginBottom: '1.25rem' }}>
                            {editando ? 'Editar prescripción' : 'Nueva prescripción'}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Consulta *</label>
                                <select
                                    value={form.consultaId}
                                    onChange={e => setForm({ ...form, consultaId: e.target.value })}
                                    style={inputStyle}
                                    disabled={!!editando}
                                >
                                    <option value="">-- Seleccionar consulta --</option>
                                    {consultas.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {consultaLabel(c)}
                                        </option>
                                    ))}
                                </select>
                                {editando && (
                                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#6c757d' }}>
                                        No se puede cambiar la consulta al editar
                                    </p>
                                )}
                            </div>
                            <div>
                                <label style={labelStyle}>Medicamento *</label>
                                <select
                                    value={form.medicamentoId}
                                    onChange={e => setForm({ ...form, medicamentoId: e.target.value })}
                                    style={inputStyle}
                                    disabled={!!editando}
                                >
                                    <option value="">-- Seleccionar medicamento --</option>
                                    {medicamentos.map(m => (
                                        <option key={m.id} value={m.id}>{m.nombre}</option>
                                    ))}
                                </select>
                                {editando && (
                                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#6c757d' }}>
                                        No se puede cambiar el medicamento al editar
                                    </p>
                                )}
                            </div>
                            <div>
                                <label style={labelStyle}>Dosis *</label>
                                <input
                                    value={form.dosis}
                                    onChange={e => setForm({ ...form, dosis: e.target.value })}
                                    placeholder="Ej. 500mg cada 8h"
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Duración (días) *</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={form.duracionDias}
                                    onChange={e => setForm({ ...form, duracionDias: e.target.value })}
                                    placeholder="Ej. 7"
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
                    placeholder="Buscar por medicamento, mascota o dosis..."
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
                            <th style={th}>Consulta</th>
                            <th style={th}>Mascota</th>
                            <th style={th}>Veterinario</th>
                            <th style={th}>Medicamento</th>
                            <th style={th}>Dosis</th>
                            <th style={th}>Duración</th>
                            {(isAdmin() || isVeterinario()) && <th style={th}>Acciones</th>}
                        </tr>
                        </thead>
                        <tbody>
                        {prescripcionesFiltradas.map((p, i) => (
                            <tr key={`${p.consultaId}-${p.medicamentoId}`}
                                style={{ backgroundColor: i % 2 === 0 ? 'white' : '#f8f9fa' }}>
                                <td style={td}>#{p.consultaId} · {p.fechaConsulta}</td>
                                <td style={td}>{p.mascotaNombre}</td>
                                <td style={td}>{p.veterinarioNombre}</td>
                                <td style={td}>{p.medicamentoNombre}</td>
                                <td style={td}>{p.dosis}</td>
                                <td style={td}>{p.duracionDias} día{p.duracionDias !== 1 ? 's' : ''}</td>
                                {(isAdmin() || isVeterinario()) && (
                                    <td style={td}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => abrirEditar(p)} style={btnEdit}>Editar</button>
                                            {isAdmin() && (
                                                <button
                                                    onClick={() => eliminar(p.consultaId, p.medicamentoId)}
                                                    style={btnDelete}
                                                >
                                                    Eliminar
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {prescripcionesFiltradas.length === 0 && !loading && (
                        <p style={{ textAlign: 'center', color: '#6c757d', marginTop: '2rem' }}>
                            No se encontraron prescripciones
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