// src/services/api.epp.js

const API_BASE_URL = 'https://back-end-fastapi-production.up.railway.app';

// Función auxiliar para obtener el token
const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        console.error('No se encontró el token de autenticación');
        return null;
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

/**
 * Obtiene la lista de todos los EPPs disponibles.
 * (Función de Epp.js)
 */
export const getAvailableEpps = async () => {
    const headers = getAuthHeaders();
    if (!headers) return [];
    try {
        const response = await fetch(`${API_BASE_URL}/epp/list`, {
            method: 'GET',
            headers: { 'Authorization': headers.Authorization } // Solo token
        });
        if (!response.ok) throw new Error('Error al cargar EPPs');
        return await response.json();
    } catch (error) {
        console.error("Error en getAvailableEpps:", error);
        return [];
    }
};

/**
 * Genera el PDF de entrega de EPP.
 * (Función de Epp.js)
 * @param {object} payload - { rut, elementos }
 */
export const generateEppPdf = async (payload) => {
    const headers = getAuthHeaders();
    if (!headers) return null;
    try {
        const response = await fetch(`${API_BASE_URL}/epp/generate-pdf`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Error al generar el PDF');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `epp_entrega_${payload.rut}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return true;
    } catch (error) {
        console.error("Error en generateEppPdf:", error);
        alert(`Error al generar el PDF: ${error.message}`);
        return false;
    }
};

/**
 * Crea uno o más EPPs nuevos en la base de datos.
 * (Función de CrearEpp.js)
 * @param {Array<object>} eppData - Array de objetos ej: [{ nombre, descripcion }]
 */
export const createEppItems = async (eppData) => {
    const headers = getAuthHeaders();
    if (!headers) return null;

    // NOTA: Tu API /epp/create (basado en el de ODI) probablemente espera un objeto a la vez.
    // Si puede aceptar un array, genial. Si no, hay que hacer un bucle.
    // Asumiré que podemos enviarlos en lote o que la API lo maneja.
    // Si solo acepta uno, esta lógica debe cambiar a un Promise.all
    console.log("Datos de EPP a guardar:", eppData);

    // --- LÓGICA DE API COMENTADA (Ajustar a tu endpoint real) ---
    /*
    try {
        const response = await fetch(`${API_BASE_URL}/epp/create-batch`, { // O '/epp/create' si es uno por uno
            method: 'POST',
            headers: headers,
            body: JSON.stringify(eppData)
        });
        if (!response.ok) throw new Error('Error al guardar los EPP');
        
        alert('EPP guardados correctamente!');
        return await response.json();

    } catch (error) {
        console.error("Error en createEppItems:", error);
        alert(`Error al guardar: ${error.message}`);
        return null;
    }
    */
   
    // Simulación de éxito
    await new Promise(r => setTimeout(r, 500));
    alert('¡EPP guardados exitosamente! (Simulación)');
    return true;
};