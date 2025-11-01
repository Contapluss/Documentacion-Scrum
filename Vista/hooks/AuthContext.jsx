// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';

// 1. Crear el Contexto
export const AuthContext = createContext();

/**
 * Proveedor de Autenticación para envolver toda la aplicación.
 * @param {object} children - Componentes hijos.
 */
export const AuthProvider = ({ children }) => {
    // 2. Estado para el usuario (incluye token, nombre, etc.)
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Para manejar el tiempo de carga inicial

    // 3. Efecto para Cargar el Estado Persistente (al iniciar la app)
    useEffect(() => {
        // Verifica si hay un token o datos de usuario guardados en localStorage
        const storedToken = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user_data');
        
        if (storedToken && storedUser) {
            try {
                // Si existe, restauramos el estado
                const userData = JSON.parse(storedUser);
                console.log('AuthContext restore from localStorage ->', { token: storedToken, userData }); // <-- LOG
                setUser({
                    token: storedToken,
                    ...userData
                });
            } catch (error) {
                console.error("Error parsing user data:", error);
                // Si hay error, limpiamos para forzar el login
                localStorage.clear();
            }
        }
        setIsLoading(false);
    }, []);

    // 4. Función de Login
    const login = (token, userData) => {
        // Guardar el token y los datos del usuario en el estado
        setUser({ token, ...userData });
        
        // Persistencia: Guardar en localStorage para que persista al refrescar la página
        localStorage.setItem('access_token', token);
        localStorage.setItem('user_data', JSON.stringify(userData));
    };

    // 5. Función de Logout
    const logout = () => {
        // Limpiar el estado y la persistencia
        setUser(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
    };

    // 6. Proveedor del Contexto
    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {/* Solo renderizamos los hijos una vez que el estado inicial se ha cargado */}
            {!isLoading && children} 
        </AuthContext.Provider>
    );
};

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => useContext(AuthContext);