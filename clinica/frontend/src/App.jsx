import { Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'
import VetRoute from './components/VetRoute'
import LoginPage from './pages/LoginPage'
import UnauthorizedPage from './pages/UnauthorizedPage'
import DashboardPage from './pages/DashboardPage'
import PropietariosPage from './pages/PropietariosPage'
import MascotasPage from './pages/MascotasPage'
import VeterinariosPage from './pages/VeterinariosPage'
import ConsultasPage from './pages/ConsultasPage'
import PrescripcionesPage from './pages/PrescripcionesPage'
import EspeciesPage from './pages/EspeciesPage'
import MedicamentosPage from './pages/MedicamentosPage'
import './index.css'
import './pages/LoginPage.css'

export default function App() {
    return (
        <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Rutas para todos los roles */}
            <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            <Route path="/propietarios" element={<PrivateRoute><PropietariosPage /></PrivateRoute>} />
            <Route path="/mascotas" element={<PrivateRoute><MascotasPage /></PrivateRoute>} />
            <Route path="/consultas" element={<PrivateRoute><ConsultasPage /></PrivateRoute>} />
            <Route path="/prescripciones" element={<PrivateRoute><PrescripcionesPage /></PrivateRoute>} />

            {/* Rutas para veterinario y admin */}
            <Route path="/especies" element={<VetRoute><EspeciesPage /></VetRoute>} />

            {/* Rutas solo para admin */}
            <Route path="/veterinarios" element={<AdminRoute><VeterinariosPage /></AdminRoute>} />
            <Route path="/medicamentos" element={<AdminRoute><MedicamentosPage /></AdminRoute>} />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    )
}