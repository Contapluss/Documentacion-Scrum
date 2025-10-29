// src/api/api.correo.js

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

// 🚨 IMPORTANTE: Reemplaza esta URL base con la dirección real de tu servidor FastAPI
const API_BASE_URL = "https://back-end-fastapi-production.up.railway.app";

/**
 * Función genérica para manejar peticiones que DEVUELVEN UN ARCHIVO (BLOB).
 * Útil para descargar PDFs, Excels, etc.
 * @param {string} url - La URL completa del endpoint.
 * @param {object} options - Opciones de la petición fetch (método, headers, body).
 * @returns {Promise<Blob>} - El archivo como un objeto Blob.
 */
async function fetchApiBlob(url, options = {}) {

    // Si el mock está activado, no llames a la API real.
    if (MOCK_API_ENABLED) {
        console.warn("MOCK API está activado, pero se intentó llamar a fetchApiBlob. Bloqueando llamada a:", url);
        throw new Error("MOCK API está activado, no se puede llamar a la API real.");
    }

    console.log("Llamando a la API REAL (Correo/PDF):", url);

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            // Si falla, la respuesta de error probablemente SÍ es JSON
            const errorData = await response.json().catch(() => ({ detail: "Error desconocido" }));
            throw new Error(`HTTP error! Status: ${response.status} - Detail: ${errorData.detail || errorData.msg}`);
        }

        // Si la respuesta es exitosa, la devolvemos como un Blob
        return await response.blob();
    } catch (error) {
        console.error("Error en la llamada a la API (Blob):", error);
        throw error;
    }
}

/**
 * 1. Genera y descarga un PDF de despido.
 * Envía los datos (destinatario, mensaje) al backend.
 * El backend genera el PDF y lo devuelve.
 * @param {object} data - Objeto con { para, mensaje, idTrabajador, etc. }
 * @param {string} token - El token de autenticación del usuario.
 * @returns {Promise<Blob>} - El archivo PDF como un Blob.
 */
export async function generarPdfDespido(data, token) {

    // --- 🚨 MOCK API ---
    if (MOCK_API_ENABLED) {
        await simularRed(1000); // Simula 1 segundo de generación de PDF
        console.warn("MOCK API: generarPdfDespido()", data);

        // Creamos un "Blob" de mentira (un PDF falso) para simular la descarga
        const fakePdfContent = 'Contenido del PDF de prueba (MOCK)';
        const blob = new Blob([fakePdfContent], { type: 'application/pdf' });
        return blob;
    }
    // --- 🚨 FIN MOCK ---

    // 💡 Ajusta este endpoint al que definas en tu FastAPI
    //    Ejemplo: /documentos/despido/generar
    const url = `${API_BASE_URL}/documentos/despido/generar`; 

    const options = {
        method: 'POST', // Usualmente la generación de un doc. es un POST
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    return fetchApiBlob(url, options);
}