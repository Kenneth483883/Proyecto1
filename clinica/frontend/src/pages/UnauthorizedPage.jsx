import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const MESSAGES = {
    admin: {
        title: 'Sección exclusiva para administradores',
        body: 'Solo los administradores tienen acceso a esta sección. Si creés que esto es un error, contactá al administrador del sistema.',
    },
    vet: {
        title: 'Sección exclusiva para veterinarios',
        body: 'Esta sección está disponible únicamente para veterinarios y administradores.',
    },
}

const DEFAULT_MESSAGE = {
    title: 'Acceso denegado',
    body: 'No tenés permisos para acceder a esta sección.',
}

export default function UnauthorizedPage() {
    const navigate = useNavigate()
    const { logout } = useAuth()
    const [searchParams] = useSearchParams()

    const role = searchParams.get('role')
    const { title, body } = MESSAGES[role] ?? DEFAULT_MESSAGE

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: '#f8f9fa'
        }}>
            <div style={{
                background: 'white',
                padding: '3rem',
                borderRadius: '12px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                maxWidth: '420px'
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>
                <h1 style={{ color: '#dc3545', marginBottom: '0.5rem', fontSize: '1.4rem' }}>
                    {title}
                </h1>
                <p style={{ color: '#6c757d', marginBottom: '2rem', lineHeight: '1.5' }}>
                    {body}
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{
                            padding: '10px 24px',
                            backgroundColor: '#2d6a4f',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        Volver al inicio
                    </button>
                    <button
                        onClick={() => { logout(); navigate('/login') }}
                        style={{
                            padding: '10px 24px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </div>
    )
}