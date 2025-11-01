// Este es el modulo base, es para no estar repitiendo la logica de obtener el token y manejar la URL base en cada archivo

// URL de tu backend FastAPI (puedes mover esto a un .env más tarde)
const BASE_URL = "https://back-end-fastapi-production.up.railway.app"; 

/**
 * Función auxiliar para obtener los headers con el token de autorización.
 * @returns {object} Los headers de la petición.
 * @throws {Error} Si no existe el token.
 */
function getAuthHeaders() {
    const accessToken = localStorage.getItem("access_token"); // Token guardado en el login
    if (!accessToken) {
        // Podrías forzar una redirección al login aquí si fuera necesario
        throw new Error("No autenticado. Por favor, inicie sesión."); 
    }
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`, // Formato estándar de JWT
    };
}

/**
 * Función genérica para hacer peticiones (GET, POST, PUT, DELETE) al API.
 * @param {string} endpoint - La ruta específica del API (ej: /company/data).
 * @param {object} options - Opciones de fetch (method, body, etc.).
 * @returns {Promise<object>} Los datos de respuesta.
 * @throws {Error} Si la respuesta no es OK.
 */
export async function apiFetch(endpoint, options = {}) {
    const defaultOptions = {
        method: 'GET',
        headers: getAuthHeaders(),
    };

    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers, // Permite sobrescribir Content-Type si es necesario (ej: subir archivos)
        }
    };
    
    const res = await fetch(`${BASE_URL}${endpoint}`, finalOptions);

    if (!res.ok) {
        const error = await res.json();
        // Lanza un error genérico o el detalle específico de FastAPI
        throw new Error(error.detail || `Error en la petición a ${endpoint}`);
    }

    return await res.json();
}