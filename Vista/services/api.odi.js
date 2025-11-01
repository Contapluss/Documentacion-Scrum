// src/services/api.odi.js

const API_BASE_URL = 'https://back-end-fastapi-production.up.railway.app';

// Función auxiliar para obtener el token y construir los headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        console.error('No se encontró el token de autenticación');
        // En una app real, aquí podríamos redirigir al login
        return null;
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

/**
 * Obtiene la lista de todas las actividades ODI desde la API.
 */
export const getOdiActivities = async () => {
    const headers = getAuthHeaders();
    if (!headers) return []; // Retorna un array vacío si no hay token

    try {
        const response = await fetch(`${API_BASE_URL}/odi/list`, {
            method: 'GET',
            headers: headers
        });
        if (!response.ok) {
            throw new Error('Error al cargar las actividades ODI');
        }
        const data = await response.json();
        // Mapeamos los datos para que coincidan con lo que usaremos en el frontend
        return data.map(odi => ({
            id: odi.id_odi,
            actividad: odi.tarea,
            peligros: odi.riesgo,
            consecuencias: odi.consecuencias,
            medidas: odi.precaucion
        }));
    } catch (error) {
        console.error("Error en getOdiActivities:", error);
        alert('Hubo un problema al cargar las actividades.');
        return [];
    }
};

/**
 * Crea una nueva actividad ODI en la API.
 * @param {object} odiData - Datos de la nueva actividad.
 */
export const createOdiActivity = async (odiData) => {
    const headers = getAuthHeaders();
    if (!headers) return null;

    try {
        const response = await fetch(`${API_BASE_URL}/odi/create`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                tarea: odiData.actividad,
                riesgo: odiData.peligros,
                consecuencias: odiData.consecuencias,
                precaucion: odiData.medidas
            })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Error al crear la actividad');
        }
        return await response.json();
    } catch (error) {
        console.error("Error en createOdiActivity:", error);
        alert(`Error al crear la actividad: ${error.message}`);
        return null;
    }
};

/**
 * Genera el PDF de ODI llamando a la API.
 * @param {object} pdfPayload - Datos para el cuerpo de la solicitud del PDF.
 */
export const generateOdiPdf = async (pdfPayload) => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
        const response = await fetch(`${API_BASE_URL}/odi/generate-pdf`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(pdfPayload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Error al generar el PDF');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ODI_${pdfPayload.rut.replace('-', '')}_${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        alert('PDF generado exitosamente.');

    } catch (error) {
        console.error("Error en generateOdiPdf:", error);
        alert(`Error al generar el PDF: ${error.message}`);
    }
};