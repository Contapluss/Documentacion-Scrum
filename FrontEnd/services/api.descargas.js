// src/services/api.descargas.js

// ----------------------------------------------------------------------
// --- 🚨 INTERRUPTOR GLOBAL DE SIMULACIÓN (MOCK) 🚨 ---
// ---
// --- Pon esto en 'true' para simular la API.
// --- Pon esto en 'false' cuando tu backend esté listo.
// ----------------------------------------------------------------------
const MOCK_API_ENABLED = true;
// --- SIMULADOR DE DEMORA DE RED ---
const simularRed = (delay = 500) => new Promise(res => setTimeout(res, delay));
// ----------------------------------------------------------------------

// 🚨 Ajusta esta URL base si tus endpoints de descargas están en otra ruta
const API_BASE_URL = "https://back-end-fastapi-production.up.railway.app";

/**
 * Función genérica para manejar peticiones y errores.
 * (Copiada/Adaptada de api.Empresa.js)
 * @param {string} url - La URL completa del endpoint.
 * @param {object} options - Opciones de la petición fetch (método, headers, body).
 * @returns {Promise<object>} - Los datos de respuesta o lanza un error.
 */
async function fetchApi(url, options = {}) {
    // Si el mock está activado, no llames a la API real.
    if (MOCK_API_ENABLED) {
        console.warn("MOCK API (Descargas) está activado, pero se intentó llamar a fetchApi. Bloqueando llamada a:", url);
        throw new Error("MOCK API (Descargas) está activado, no se puede llamar a la API real.");
    }

    console.log("Llamando a la API REAL (Descargas):", url);
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: "Error desconocido" }));
            throw new Error(`HTTP error! Status: ${response.status} - Detail: ${errorData.detail || errorData.msg}`);
        }
        if (response.status === 204) {
            return { success: true, message: "Operación exitosa." };
        }
        const data = await response.json();
        console.log("Datos recibidos del backend (Descargas API):", data);
        return data;
    } catch (error) {
        console.error("Error en la llamada a la API (Descargas):", error);
        throw error;
    }
}

// 💡 Podrías necesitar una función fetchApiBlob si la descarga real se hace desde el frontend
// async function fetchApiBlob(url, options = {}) { ... }


/**
 * Busca archivos en el backend según los filtros.
 * @param {object} filters - { fileType, startDate, endDate }
 * @param {string} token - El token de autenticación.
 * @returns {Promise<Array<object>>} - Una lista de archivos.
 */
export const buscarArchivos = async (filters, token) => { // 💡 Añadido token como parámetro
    const { fileType, startDate, endDate } = filters;

    // --- 🚨 MOCK API ---
    if (MOCK_API_ENABLED) {
        await simularRed(700); // Simula espera
        console.warn("MOCK API (Descargas): buscarArchivos() con filtros:", filters);

        // Datos simulados más realistas
        const mockData = [
            { id: 1, nombre: 'ODI_Carlos_Rodriguez_2023-06-15.pdf', tipo: 'ODI', fecha: '2023-06-15', url: '#sim1' },
            { id: 2, nombre: 'EPP_Entrega_Notebook_Carlos_R.pdf', tipo: 'EPP', fecha: '2023-06-16', url: '#sim2' },
            { id: 3, nombre: 'Contrato_Javiera_Lopez_2024-03-01.pdf', tipo: 'Contrato', fecha: '2024-03-01', url: '#sim3' },
            { id: 4, nombre: 'ODI_Javiera_Lopez_2024-03-01.pdf', tipo: 'ODI', fecha: '2024-03-01', url: '#sim4' },
            { id: 5, nombre: 'Contrato_Miguel_Sanchez_2022-11-10.pdf', tipo: 'Contrato', fecha: '2022-11-10', url: '#sim5' },
            { id: 6, nombre: 'EPP_Entrega_Monitor_Adicional_MS.pdf', tipo: 'EPP', fecha: '2024-01-15', url: '#sim6' },
        ];

        // Filtra la data simulada (lógica sin cambios)
        return mockData.filter(archivo => {
            const esTipoCoincidente = !fileType || archivo.tipo === fileType;
            // Asegúrate que las fechas estén en formato YYYY-MM-DD para comparar strings
            const esFechaCoincidente = (!startDate || archivo.fecha >= startDate) && (!endDate || archivo.fecha <= endDate);
            return esTipoCoincidente && esFechaCoincidente;
        });
    }
    // --- 🚨 FIN MOCK ---

    // --- API REAL ---
    // 🚨 Verifica la URL y los nombres de los query params con tu backend
    const url = `${API_BASE_URL}/api/archivos/buscar`; // Ejemplo de URL
    
    const params = new URLSearchParams();
    if (fileType) params.append('tipo', fileType);
    if (startDate) params.append('fecha_inicio', startDate); // Ej: 'fecha_inicio'
    if (endDate) params.append('fecha_fin', endDate);       // Ej: 'fecha_fin'

    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`, // Usa el token
            'Content-Type': 'application/json' // GET usualmente no necesita Content-Type, pero no daña
        }
    };
    
    // Llama a la función genérica fetchApi
    return fetchApi(`${url}?${params.toString()}`, options);
};

// 💡 Aquí podrías añadir más funciones si las necesitas, por ejemplo:
// export const descargarArchivoPorId = async (archivoId, token) => { ... }