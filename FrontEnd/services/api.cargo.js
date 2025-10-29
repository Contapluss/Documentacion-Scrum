// src/services/api.cargo.js

const API_URL = 'http://localhost:4000/graphql';

/**
 * Función auxiliar para ejecutar consultas/mutaciones de GraphQL
 * @param {string} query - La consulta o mutación de GraphQL.
 * @param {object} variables - Las variables para la consulta.
 * @returns {Promise<object>} - Los datos de la respuesta.
 */
async function fetchGraphQL(query, variables = {}) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables }),
        });

        const json = await response.json();

        if (json.errors) {
            console.error("❌ Error GraphQL:", json.errors);
            throw new Error(json.errors.map(e => e.message).join('\n'));
        }

        return json.data;
    } catch (error) {
        console.error("❌ Error de conexión:", error);
        throw error;
    }
}

/**
 * Obtiene todos los cargos
 */
export const getCargos = async () => {
    const query = `
        query {
            cargos {
                id
                nombre
                descripcion
            }
        }
    `;
    const data = await fetchGraphQL(query);
    return data.cargos || [];
};

/**
 * Crea un nuevo cargo
 * @param {string} nombre
 * @param {string} descripcion
 */
export const createCargo = async (nombre, descripcion) => {
    const mutation = `
        mutation CreateCargo($nombre: String!, $descripcion: String) {
            createCargo(input: {
                nombre: $nombre,
                descripcion: $descripcion
            }) {
                id
                nombre
                descripcion
            }
        }
    `;
    const data = await fetchGraphQL(mutation, { nombre, descripcion });
    return data.createCargo;
};

/**
 * ¡MEJORA! Esta función faltaba en tu JS original.
 * Actualiza un cargo existente.
 * (Asumiendo la firma de la mutación)
 * @param {string} id
 * @param {string} nombre
 * @param {string} descripcion
 */
export const updateCargo = async (id, nombre, descripcion) => {
    const mutation = `
        mutation UpdateCargo($id: ID!, $nombre: String!, $descripcion: String) {
            updateCargo(id: $id, input: {
                nombre: $nombre,
                descripcion: $descripcion
            }) {
                id
                nombre
                descripcion
            }
        }
    `;
    // Asegúrate de que el tipo de ID coincida (ej: ID! o String!)
    const data = await fetchGraphQL(mutation, { id, nombre, descripcion });
    return data.updateCargo;
};

/**
 * ¡MEJORA! Esta función faltaba en tu JS original.
 * Elimina un cargo.
 * (Asumiendo la firma de la mutación)
 * @param {string} id
 */
export const deleteCargo = async (id) => {
    const mutation = `
        mutation DeleteCargo($id: ID!) {
            deleteCargo(id: $id) {
                id
            }
        }
    `;
    await fetchGraphQL(mutation, { id });
    return true; // Retorna true si tuvo éxito
};