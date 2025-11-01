// src/services/api.cargo.mock.js

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Sample data for Cargos
let mockCargos = [
    { id: '1', nombre: 'Administrativo', descripcion: 'Tareas generales de oficina.' },
    { id: '2', nombre: 'Bodeguero', descripcion: 'Gestión de inventario y despacho.' },
    { id: '3', nombre: 'Jefe de Bodega', descripcion: 'Supervisión de operaciones de bodega.' },
    { id: '4', nombre: 'Contador', descripcion: 'Manejo de contabilidad y finanzas.' },
];

let nextCargoId = 5; // To simulate creating new IDs (GraphQL might use strings)

/**
 * MOCK: Simula la obtención de todos los cargos.
 */
export const getCargos = async () => {
    console.log('getCargos called');
    await delay(500);
    return [...mockCargos]; // Return a copy
};

/**
 * MOCK: Simula la creación de un nuevo cargo.
 * @param {string} nombre
 * @param {string} descripcion
 */
export const createCargo = async (nombre, descripcion) => {
    console.log('createCargo called with:', { nombre, descripcion });
    await delay(700);

    // Simulate validation (duplicate name check)
    const nombreExistente = mockCargos.find(c => c.nombre.toLowerCase() === nombre.toLowerCase());
    if (nombreExistente) {
        console.error('Error: El nombre de este cargo ya existe.');
        // Simulate GraphQL error structure (optional, but good practice)
        throw new Error('El nombre de este cargo ya existe.');
    }

    const newCargo = {
        id: String(nextCargoId++), // Simulate GraphQL string ID
        nombre: nombre,
        descripcion: descripcion,
    };

    mockCargos.push(newCargo);
    console.log('New cargo added:', newCargo);
    console.log('Current cargos list:', mockCargos);
    return newCargo; // Simulate returning the created object
};

/**
 * MOCK: Simula la actualización de un cargo existente.
 * @param {string} id
 * @param {string} nombre
 * @param {string} descripcion
 */
export const updateCargo = async (id, nombre, descripcion) => {
    console.log('updateCargo called with:', { id, nombre, descripcion });
    await delay(600);

    // Simulate validation (duplicate name check, excluding self)
    const nombreExistente = mockCargos.find(c =>
        c.nombre.toLowerCase() === nombre.toLowerCase() && c.id !== id
    );
    if (nombreExistente) {
        console.error('Error: El nombre de este cargo ya existe.');
        throw new Error('El nombre de este cargo ya existe.');
    }

    const cargoIndex = mockCargos.findIndex(c => c.id === id);
    if (cargoIndex === -1) {
        console.error(`Error: Cargo with ID ${id} not found.`);
        throw new Error(`Cargo con ID ${id} no encontrado.`);
    }

    // Update the mock data
    mockCargos[cargoIndex] = { ...mockCargos[cargoIndex], nombre, descripcion };
    console.log('Cargo updated:', mockCargos[cargoIndex]);
    console.log('Current cargos list:', mockCargos);
    return mockCargos[cargoIndex]; // Simulate returning the updated object
};

/**
 * MOCK: Simula la eliminación de un cargo.
 * @param {string} id
 */
export const deleteCargo = async (id) => {
    console.log('deleteCargo called with ID:', id);
    await delay(400);

    const cargoIndex = mockCargos.findIndex(c => c.id === id);
    if (cargoIndex === -1) {
        console.warn(`Warning: Cargo with ID ${id} not found for deletion.`);
        // Simulate success even if not found, as GraphQL might do
        return true;
    }

    // Remove from the mock data
    const deletedCargo = mockCargos.splice(cargoIndex, 1);
    console.log('Cargo deleted:', deletedCargo[0]);
    console.log('Current cargos list:', mockCargos);
    return true; // Simulate success
};