// src/services/auth.service.js

// URL de tu backend FastAPI (se recomienda guardarla en un archivo .env)
const API_URL = "https://back-end-fastapi-production.up.railway.app/auth";

/**
 * Función para iniciar sesión.
 * @param {string} email - Correo electrónico del usuario.
 * @param {string} password - Contraseña del usuario.
 * @returns {Promise<object>} Los datos de respuesta del servidor (tokens, ids, etc.).
 * @throws {Error} Si la respuesta del servidor no es exitosa.
 */
async function login(email, password) {
    const res = await fetch(`${API_URL}/login_api`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    // Manejo de errores de la API (por ejemplo, credenciales incorrectas)
    if (!res.ok) {
        const error = await res.json();
        // Lanza un error con el detalle proporcionado por FastAPI
        throw new Error(error.detail || "Error al iniciar sesión en el servidor");
    }

    const data = await res.json();
    console.log("Login correcto:", data);

    // 🌟 Paso Clave 1: Define los datos que necesita el AuthContext
    const userData = {
        // Tu AuthContext espera el token, así que lo manejamos aparte:
        token: data.access_token, 
        
        // Datos específicos del usuario que usarás en la aplicación:
        id: data.usuario_id, 
        empresaId: data.empresa_id, 
        rol: data.rol,
        rolNombre: data.rol_nombre, // Asumiendo que tu backend devuelve rol_nombre
    };

    // 🌟 Paso Clave 2: Guarda el token y los datos del usuario en localStorage 
    //                 para que el AuthProvider pueda cargarlos al inicio.
    localStorage.setItem("access_token", data.access_token);
    // Para simplificar, guarda solo la información que necesita el AuthContext
    localStorage.setItem("user_data", JSON.stringify(userData)); 

    // Retorna los datos para que el componente los use (ej. para la redirección)
    return {
        // Devuelve el token y los datos del usuario para el AuthContext
        access_token: data.access_token, 
        userData: userData,
        // Mantén el redirect_url si quieres usar la lógica de tu backend (aunque en React, la navegación es mejor manejarla con `Maps`).
        redirect_url: data.redirect_url || '/datos-empresa'
    };
}


/**
 * Función para registrar un nuevo usuario.
 * @param {object} userData - Objeto con todos los campos de registro.
 * @returns {Promise<object>} Los datos de respuesta del servidor.
 * @throws {Error} Si la respuesta del servidor no es exitosa.
 */
async function register(userData) {
    // La userData ya contiene: name, paternal_surname, maternal_surname, email, password, confirm_password
    const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Error al registrar usuario en el servidor");
    }

    const data = await res.json();
    return data;
}

/**
 * Función para recuperar/cambiar la contraseña.
 * Nota: Asumimos que el endpoint es /reset_password
 * @param {object} userData - Objeto con email, password, confirm_password.
 * @returns {Promise<object>} Los datos de respuesta del servidor.
 * @throws {Error} Si la respuesta del servidor no es exitosa.
 */
async function recoverPassword(userData) {
    const res = await fetch(`${API_URL}/reset_password`, { // Ajusta el endpoint si es diferente
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Error al actualizar la contraseña en el servidor");
    }

    const data = await res.json();
    return data;
}

// Exporta las funciones para poder usarlas en tus componentes
export const authService = {
    login,
    register,
    recoverPassword
};