// src/services/api.epp.mock.js
import { jsPDF } from 'jspdf'; // <-- Import jsPDF

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Sample data for EPPs (remains the same)
let mockAvailableEpps = [
    { id_epp: 1, epp: 'Casco de Seguridad Blanco', descripcion: 'Protección craneal estándar' },
    { id_epp: 2, epp: 'Guantes de Nitrilo Desechables', descripcion: 'Protección química leve' },
    { id_epp: 3, epp: 'Lentes de Seguridad Claros', descripcion: 'Protección ocular contra impactos' },
    { id_epp: 4, epp: 'Zapatos de Seguridad Punta Acero', descripcion: 'Protección pies contra caídas objetos' },
];
let nextEppId = 5;

/**
 * MOCK: Obtiene la lista simulada de EPPs disponibles.
 */
export const getAvailableEpps = async () => {
    console.log('getAvailableEpps called'); // [MOCK] removed
    await delay(400); // Simulate network delay
    return [...mockAvailableEpps]; // Return a copy
};

/**
 * MOCK: Simula la creación de uno o más EPPs nuevos.
 * @param {Array<object>} eppData - Array de objetos ej: [{ nombre, descripcion }]
 */
export const createEppItems = async (eppData) => {
    console.log("createEppItems called with:", eppData); // [MOCK] removed
    await delay(700); // Simulate network delay

    let createdCount = 0;
    eppData.forEach(item => {
        // Basic validation
        if (!item.nombre || !item.descripcion) {
            console.warn('Skipping item due to missing data:', item); // [MOCK] removed
            return; // Skip this item
        }
        const newEpp = {
            id_epp: nextEppId++,
            epp: item.nombre, // Match the structure returned by getAvailableEpps
            descripcion: item.descripcion,
        };
        mockAvailableEpps.push(newEpp);
        createdCount++;
        console.log('New EPP added:', newEpp); // [MOCK] removed
    });

    if (createdCount > 0) {
        alert(`${createdCount} EPP(s) guardados exitosamente!`); // [MOCK] removed
        console.log('Current EPP list:', mockAvailableEpps); // [MOCK] removed
        return true; // Simulate success
    } else {
        alert('No se pudieron guardar los EPPs (datos incompletos).'); // [MOCK] removed
        return false; // Simulate failure if no items were valid
    }
};

/**
 * MOCK: Simula la generación del PDF de entrega de EPP Y GENERA UN PDF BÁSICO.
 * @param {object} payload - { rut, elementos }
 */
export const generateEppPdf = async (payload) => {
    console.log('generateEppPdf called with:', payload); // [MOCK] removed
    await delay(1000); // Simulate processing time

    try {
        // 1. Create a jsPDF instance
        const doc = new jsPDF();

        // 2. Add basic content
        doc.setFontSize(18);
        doc.text('Entrega de EPP (Simulado)', 10, 20); // Changed title slightly

        doc.setFontSize(12);
        const worker = mockWorkers.find(w => w.rut.startsWith(payload.rut)) // Find worker based on RUT prefix
        const workerName = worker ? `${worker.nombre} ${worker.apellido_paterno}` : `RUT: ${payload.rut}`;
        doc.text(`Trabajador: ${workerName}`, 10, 40);
        doc.text(`RUT (Base): ${payload.rut}`, 10, 50);
        doc.text('Elementos Entregados:', 10, 60);

        let yPos = 70;
        payload.elementos.forEach((el, index) => {
            const epp = mockAvailableEpps.find(e => e.id_epp === el.id_epp);
            const eppName = epp ? epp.epp : `ID Desconocido ${el.id_epp}`;
            const text = `${index + 1}. ${eppName} - Cantidad: ${el.cantidad || 'N/A'} - Fecha: ${el.fecha_entrega || 'N/A'}`;
            if (yPos > 270) { // Simple page break check
                 doc.addPage();
                 yPos = 20;
            }
            doc.text(text, 10, yPos);
            yPos += 10;
        });

        doc.text('Firma Trabajador: ________________', 10, yPos + 20);
        doc.text('Firma Entrega: ________________', 10, yPos + 40);


        // 3. Trigger the download
        const fileName = `SIMULADO_EPP_Entrega_${payload.rut}.pdf`; // Changed filename
        doc.save(fileName);

        console.log(`PDF "${fileName}" generado y descarga iniciada.`); // [MOCK] removed
        alert(`PDF generado: ${fileName}`); // [MOCK] removed
        return true; // Simulate success

    } catch (error) {
        console.error("Error generating PDF:", error); // [MOCK] removed
        alert("Ocurrió un error al generar el PDF simulado."); // [MOCK] removed
        return false; // Simulate failure
    }
};

// --- Add mock worker data needed for PDF generation ---
// You might already have this in your api.trabajador.mock.js,
// if so, you could import it instead of redefining it here.
const mockWorkers = [
    { id_trabajador: 101, rut: '12345678-9', nombre: 'Juan', apellido_paterno: 'Pérez', apellido_materno: 'Gómez', cargo: { id: 1, nombre: 'Bodeguero' } },
    { id_trabajador: 102, rut: '98765432-1', nombre: 'Maria', apellido_paterno: 'González', apellido_materno: 'López', cargo: { id: 2, nombre: 'Administrativa' } },
    { id_trabajador: 103, rut: '11223344-5', nombre: 'Pedro', apellido_paterno: 'Soto', apellido_materno: 'Martinez', cargo: { id: 1, nombre: 'Bodeguero' } },
    { id_trabajador: 104, rut: '55667788-K', nombre: 'Juana', apellido_paterno: 'Pérez', apellido_materno: 'Diaz', cargo: { id: 3, nombre: 'Jefe de Bodega' } },
];