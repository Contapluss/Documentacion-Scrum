import { Navigate, Outlet } from 'react-router-dom';
// Asegúrate de importar el hook useAuth si lo has creado
import { useAuth } from '../../hooks/AuthContext'; // Ajusta la ruta si es necesario

/**
 * Componente que protege rutas que requieren autenticación.
 */
const ProtectedRoute = () => {
    // 1. Usar el hook de autenticación
    const { user, isLoading } = useAuth();
    
    // Opcional: Mostrar un componente de carga mientras se verifica el token inicial
    if (isLoading) {
        return <div>Cargando sesión...</div>; 
    }

    // 2. Decisión de Acceso: 
    // Si NO hay usuario (o es null), redirigimos al login ("/")
    if (!user) {
        // Redirige al usuario al inicio de sesión y reemplaza la entrada en el historial.
        return <Navigate to="/" replace />;
    }

    // El usuario está autenticado. Renderiza el componente hijo de la ruta.
    return <Outlet />;
};

export default ProtectedRoute;