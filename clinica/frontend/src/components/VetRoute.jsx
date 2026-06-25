import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function VetRoute({ children }) {
    const { user, loading, isAdmin, isVeterinario } = useAuth()

    if (loading) return <div style={{padding: 40, textAlign: "center"}}>Cargando...</div>
    if (!user) return <Navigate to="/login" replace />
    if (!isAdmin() && !isVeterinario()) return <Navigate to="/unauthorized?role=vet" replace />

    return children
}