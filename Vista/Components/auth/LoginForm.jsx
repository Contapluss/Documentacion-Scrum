// src/Components/auth/LoginForm.jsx

import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

// 1. Importación del estado global de autenticación
import { useAuth } from '../../hooks/AuthContext'; 
// 2. Importación de la lógica de la API
import { authService } from '../../services/auth.service'; 

/**
 * Componente del formulario de inicio de sesión.
 */
function LoginForm() {
    // Estados del formulario
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Estados de UI y control
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Hooks de React Router y AuthContext
    const { login } = useAuth(); // Función para actualizar el estado global
    const navigate = useNavigate(); // Hook para la redirección

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // 🌟 1. Llamada al servicio que se comunica con FastAPI
            const result = await authService.login(email, password); 

            // Nota: Se asume que authService.login fue modificado para devolver
            // { access_token, userData } además de guardar en localStorage.

            // 🌟 2. Actualizar el estado global de la aplicación
            login(result.access_token, result.userData); 

            // 🌟 3. Redirigir al usuario a una ruta protegida
            // Usamos la ruta '/datos-empresa' que ya tienes definida.
            navigate('/datos-empresa', { replace: true }); 

        } catch (err) {
            // Manejar errores de credenciales o de la API
            const errorMessage = err.message || 'Error desconocido al intentar iniciar sesión.';
            setError(errorMessage);
            console.error("Error de Login:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            {/* Mostrar alerta de error si existe */}
            {error && <Alert variant="danger">{error}</Alert>}

            <Form.Group className="mb-3" controlId="loginEmail">
                <Form.Control
                    type="email"
                    placeholder="Correo Electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                />
            </Form.Group>

            <Form.Group className="mb-4" controlId="loginPassword">
                <Form.Control
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                />
            </Form.Group>
            {/* Link para recuperar contraseña */}
            <div className="text-center mt-3">
                <a href="/recuperar-contrasena" className="text-muted" style={{ fontSize: '0.9rem' }}>
                    ¿Olvidaste tu contraseña?
                </a>
            </div>
            <Button 
                variant="primary" 
                type="submit" 
                className="w-100 btn-primario"
                disabled={loading}
            >
                {/* Cambiar texto del botón si está cargando */}
                {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </Button>
        </Form>
    );
}

export default LoginForm;