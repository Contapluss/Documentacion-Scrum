// src/services/api.odi.mock.js

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Sample data for ODI activities
let mockOdiActivities = [
    { id: 1, actividad: 'Uso de Herramientas Manuales', peligros: 'Cortes, golpes', consecuencias: 'Heridas leves', medidas: 'Usar guantes, revisar herramientas' },
    { id: 2, actividad: 'Trabajo en Altura', peligros: 'Caídas a distinto nivel', consecuencias: 'Fracturas, lesiones graves', medidas: 'Usar arnés, línea de vida, verificar andamios' },
    { id: 3, actividad: 'Manejo de Sustancias Químicas', peligros: 'Contacto dérmico, inhalación', consecuencias: 'Irritación, quemaduras, intoxicación', medidas: 'Usar EPP adecuado (guantes, mascarilla), FDS' },
];

let nextId = 4; // To simulate creating new IDs

/**
 * MOCK: Obtiene la lista simulada de actividades ODI.
 */
export const getOdiActivities = async () => {
    console.log('[MOCK] getOdiActivities called');
    await delay(500); // Simulate network delay
    // Return a copy to prevent accidental modification of the original mock data
    return [...mockOdiActivities];
};

/**
 * MOCK: Simula la creación de una nueva actividad ODI.
 * @param {object} odiData - { actividad, peligros, consecuencias, medidas }
 */
export const createOdiActivity = async (odiData) => {
    console.log('[MOCK] createOdiActivity called with:', odiData);
    await delay(800); // Simulate network delay

    // Simulate validation error (optional)
    if (!odiData.actividad || !odiData.peligros || !odiData.consecuencias || !odiData.medidas) {
        console.error('[MOCK] Error: Faltan datos obligatorios');
        alert('[MOCK] Error: Por favor, complete todos los campos.');
        return null; // Simulate API error response
    }

    const newActivity = {
        id_odi: nextId++, // Simulate database ID generation
        tarea: odiData.actividad,
        riesgo: odiData.peligros,
        consecuencias: odiData.consecuencias,
        precaucion: odiData.medidas,
    };

    // Add to our mock list (in a real app, the backend handles this)
    mockOdiActivities.push({
        id: newActivity.id_odi,
        actividad: newActivity.tarea,
        peligros: newActivity.riesgo,
        consecuencias: newActivity.consecuencias,
        medidas: newActivity.precaucion,
    });

    console.log('New activity created:', newActivity);
    return newActivity; // Return the structure the component expects
};

/**
 * MOCK: Simula la generación del PDF de ODI.
 * @param {object} pdfPayload - Datos para el cuerpo de la solicitud del PDF.
 */
export const generateOdiPdf = async (pdfPayload) => {
    console.log('generateOdiPdf called with:', pdfPayload);
    await delay(1200); // Simulate PDF generation time

    // Simulate success
    alert(`PDF generado exitosamente para ${pdfPayload.nombre} (RUT: ${pdfPayload.rut}) con ${pdfPayload.elementos.length} elementos.`);

    // --- Optional: Simulate Blob download (advanced) ---
    // You could create a dummy text file blob here if needed for testing download logic
    /*
    const dummyContent = `Mock PDF Content for ${pdfPayload.nombre}\nActivities: ${pdfPayload.elementos.join(', ')}`;
    const blob = new Blob([dummyContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MOCK_ODI_${pdfPayload.rut.replace('-', '')}_${Date.now()}.txt`; // Use .txt for easy inspection
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    */

    return; // Simulate void return or success indicator if needed
};