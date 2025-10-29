// src/services/api.permisos.mock.js

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Sample data for pending requests (can be expanded if you load existing ones)
let mockPendingRequests = [];
let nextRequestId = 1;

/**
 * MOCK: Simula el envío de una nueva solicitud de permiso al backend.
 * @param {object} solicitudData - Datos de la solicitud (nombre, rut, fechas, tipo).
 * @returns {Promise<object|null>} La nueva solicitud con un ID y estado, o null si falla.
 */
export const enviarSolicitudPermiso = async (solicitudData) => {
    console.log("enviarSolicitudPermiso called with:", solicitudData);
    await delay(500); // Simulate network latency

    // Basic validation simulation
    if (!solicitudData.nombre || !solicitudData.rut || !solicitudData.fechaInicio || !solicitudData.fechaTermino || !solicitudData.tipo) {
        console.error("Error: Missing data in request.");
        alert("Error: Faltan datos en la solicitud.");
        return null;
    }

    const respuestaSimulada = {
        ...solicitudData,
        id: nextRequestId++, // Assign a unique mock ID
        estado: 'Pendiente'
    };

    // Add to our internal list (for potential display/testing)
    mockPendingRequests.push(respuestaSimulada);
    console.log("Solicitud simulada creada:", respuestaSimulada);
    console.log("Lista actual de solicitudes:", mockPendingRequests);

    return respuestaSimulada;
};

/**
 * MOCK: Simula la actualización del estado de un permiso a "Aceptado".
 * @param {number} solicitudId - El ID de la solicitud a aceptar.
 */
export const aceptarPermiso = async (solicitudId) => {
    console.log(`Aceptando permiso con ID ${solicitudId}.`);
    await delay(300);

    // Update the status in our mock list
    const requestIndex = mockPendingRequests.findIndex(req => req.id === solicitudId);
    if (requestIndex !== -1) {
        mockPendingRequests[requestIndex].estado = 'Aceptado';
        console.log("Estado actualizado:", mockPendingRequests[requestIndex]);
    } else {
        console.warn(`No se encontró la solicitud con ID ${solicitudId} para aceptar.`);
    }

    return true; // Simulate success
};

/**
 * MOCK: Simula la actualización del estado de un permiso a "Rechazado".
 * @param {number} solicitudId - El ID de la solicitud a rechazar.
 */
export const rechazarPermiso = async (solicitudId) => {
    console.log(`Rechazando permiso con ID ${solicitudId}.`);
    await delay(300);

    // Update the status in our mock list
    const requestIndex = mockPendingRequests.findIndex(req => req.id === solicitudId);
    if (requestIndex !== -1) {
        mockPendingRequests[requestIndex].estado = 'Rechazado';
         console.log("stado actualizado:", mockPendingRequests[requestIndex]);
    } else {
         console.warn(`No se encontró la solicitud con ID ${solicitudId} para rechazar.`);
    }

    return true; // Simulate success
};

/**
 * MOCK: (Optional) Function to get the current list of mock requests if needed elsewhere
 */
export const getMockPermisoRequests = () => {
    return [...mockPendingRequests];
};