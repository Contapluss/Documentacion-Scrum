// src/services/api.descargas.mock.js

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Sample data for downloadable files
const mockDownloadableFiles = [
    { id: 1, nombre: 'ODI_Juan_Perez_20251020.pdf', tipo: 'ODI', fecha: '2025-10-20', url: '/files/odi_jp.pdf' }, // Example URL
    { id: 2, nombre: 'EPP_Maria_Gonzalez_20251021.pdf', tipo: 'EPP', fecha: '2025-10-21', url: '/files/epp_mg.pdf' },
    { id: 3, nombre: 'Contrato_Pedro_Lopez_20251022.pdf', tipo: 'Contrato', fecha: '2025-10-22', url: '/files/cont_pl.pdf' },
    { id: 4, nombre: 'ODI_Ana_Torres_20251023.pdf', tipo: 'ODI', fecha: '2025-10-23', url: '/files/odi_at.pdf' },
    { id: 5, nombre: 'EPP_Juan_Perez_20251024.pdf', tipo: 'EPP', fecha: '2025-10-24', url: '/files/epp_jp.pdf' },
    { id: 6, nombre: 'Contrato_Maria_Gonzalez_20251025.pdf', tipo: 'Contrato', fecha: '2025-10-25', url: '/files/cont_mg.pdf' },
];

/**
 * MOCK: Simula la búsqueda de archivos según los filtros.
 * @param {object} filters - { fileType, startDate, endDate }
 * @returns {Promise<Array<object>>} - Una lista de archivos simulada.
 */
export const buscarArchivos = async (filters) => {
    const { fileType, startDate, endDate } = filters;

    console.log("BuscarArchivos called with filters:", filters);
    await delay(700); // Simulate network latency

    // Basic validation (should be handled in component, but good to have here too)
    if (!startDate || !endDate) {
        console.warn("Search attempted without start or end date.");
        return []; // Return empty if dates are missing
    }

    // Filter the mock data
    const results = mockDownloadableFiles.filter(archivo => {
        const typeMatch = !fileType || archivo.tipo === fileType;
        // Ensure date comparison works correctly (string comparison YYYY-MM-DD is safe)
        const dateMatch = (archivo.fecha >= startDate) && (archivo.fecha <= endDate);
        return typeMatch && dateMatch;
    });

    console.log("Search results (mock):", results);
    return results;
};