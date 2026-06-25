import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function DashboardPage() {
    const { user, logout, isAdmin, isVeterinario } = useAuth()

    const roleLabel = isAdmin() ? 'Administrador' : isVeterinario() ? 'Veterinario' : 'Usuario'
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>

            {/* Navbar */}
            <nav style={{
                backgroundColor: '#2d6a4f',
                padding: '0 2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '60px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.5rem' }}>🐾</span>
                    <span style={{ color: 'white', fontWeight: '600', fontSize: '1.1rem' }}>
                        Clínica Veterinaria
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <span style={{ color: '#a8d5b5', fontSize: '0.9rem' }}>
                        {user?.username} — {roleLabel}
                    </span>
                    <button
                        onClick={handleLogout}
                        style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        Cerrar sesión
                    </button>
                </div>
            </nav>

            {/* Contenido */}
            <div style={{ padding: '2rem' }}>
                <h2 style={{ color: '#2d6a4f', marginBottom: '0.5rem' }}>
                    Bienvenido, {user?.username}
                </h2>

                {/* Tarjetas de módulos */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {[
                        { nombre: 'Propietarios', icono: '👤', ruta: '/propietarios' },
                        { nombre: 'Mascotas', icono: '🐶', ruta: '/mascotas' },
                        { nombre: 'Veterinarios', icono: '👨‍⚕️', ruta: '/veterinarios' },
                        { nombre: 'Consultas', icono: '📋', ruta: '/consultas' },
                        { nombre: 'Prescripciones', icono: '💉', ruta: '/prescripciones' },
                        { nombre: 'Especies', icono: '🦎', ruta: '/especies' },
                        { nombre: 'Medicamentos', icono: '💊', ruta: '/medicamentos' },
                    ].map((modulo) => (
                        <div
                            key={modulo.ruta}
                            onClick={() => navigate(modulo.ruta)}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                padding: '2rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                border: '1px solid #e9ecef'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-4px)'
                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
                            }}
                        >
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
                                {modulo.icono}
                            </div>
                            <div style={{ fontWeight: '600', color: '#2d6a4f', fontSize: '1rem' }}>
                                {modulo.nombre}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}