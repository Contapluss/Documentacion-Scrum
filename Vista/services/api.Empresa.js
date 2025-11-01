// api.Empresa.js

// ----------------------------------------------------------------------
// --- 🚨 INTERRUPTOR GLOBAL DE SIMULACIÓN (MOCK) 🚨 ---
// ---
// --- Pon esto en 'true' para simular la API.
// --- Pon esto en 'false' cuando tu backend esté listo.
// ----------------------------------------------------------------------
const MOCK_API_ENABLED = true;
// --- SIMULADOR DE DEMORA DE RED (NUEVO) ---
const simularRed = (delay = 500) => new Promise(res => setTimeout(res, delay));
// ----------------------------------------------------------------------

// 🚨 IMPORTANTE: Reemplaza esta URL base con la dirección real de tu servidor FastAPI
const API_BASE_URL = "https://back-end-fastapi-production.up.railway.app";

/**
 * Función genérica para manejar peticiones y errores.
 * @param {string} url - La URL completa del endpoint.
 * @param {object} options - Opciones de la petición fetch (método, headers, body).
 * @returns {Promise<object>} - Los datos de respuesta o lanza un error.
 */
async function fetchApi(url, options = {}) {

    // Si el mock está activado, no llames a la API real.
    if (MOCK_API_ENABLED) {
        console.warn("MOCK API está activado, pero se intentó llamar a fetchApi. Bloqueando llamada a:", url);
        throw new Error("MOCK API está activado, no se puede llamar a la API real.");
    }

    console.log("Llamando a la API REAL (Empresa):", url);

    try {
        const response = await fetch(url, options);

        // Si la respuesta no es OK (ej: 404, 500, 401), lanzamos un error
        if (!response.ok) {
            // Intenta obtener el mensaje de error del cuerpo de la respuesta, si existe
            const errorData = await response.json().catch(() => ({ detail: "Error desconocido" }));

            // Lanza una excepción con el estado y el mensaje de error
            throw new Error(`HTTP error! Status: ${response.status} - Detail: ${errorData.detail || errorData.msg}`);
        }

        // Si la respuesta es exitosa (200, 201, etc.), retorna el cuerpo JSON
        return await response.json();
    } catch (error) {
        console.error("Error en la llamada a la API:", error);
        // Propaga el error para que el componente de la UI pueda manejarlo
        throw error;
    }
}

/**
 * 1. Obtiene la información completa de la empresa.
 * El ID de la empresa se obtiene desde el token en el backend (FastAPI).
 * @param {string} token - El token de autenticación del usuario.
 * @returns {Promise<object>} - Un objeto EmpresaFullResponse.
 */
export async function obtenerEmpresaCompleta(token) {

    // --- 🚨 MOCK API ---
    if (MOCK_API_ENABLED) {
        await simularRed(700);
        console.warn("MOCK API: obtenerEmpresaCompleta()");

        // 💡 Para probar el caso de "Empresa Nueva",
        //    descomenta la siguiente línea y comenta el 'return':
        // throw new Error("HTTP 404 - Not Found"); 

        return {
            // --- SECCIÓN 1: DATOS GENERALES ---
            rut: '76.123.456-K',
            razon_social: "Servicios Integrales Andinos Ltda.",
            nombre_fantasia: 'Andina Limitada',
            fecha_constitucion: '2019-03-15', // Formato YYYY-MM-DD
            fecha_inicio_actividades: '2019-04-01', // Formato YYYY-MM-DD
            region: "Metropolitana de Santiago", // Coincide con Variable_Empresa.js
            comuna: "Providencia", // Coincide con la región
            provincia: "Santiago", // Campo del formulario
            tipo_de_propiedad: "arrendada", // Coincide con TIPO_PROPIEDAD_OPTIONS
            direccion_fisica: 'Av. Nueva Providencia 1881, Of. 1220',
            telefono: '221234567',
            correo: 'contacto@andina.cl',

            // --- SECCIÓN 2: DATOS LEGALES ---
            nombre_representante_legal: "Ricardo Andrés",
            apellido_paterno_representante_legal: "González",
            apellido_materno_representante_legal: "Pérez",
            rut_representante_legal: "12.345.678-9",
            genero_represetante_legal: "masculino", // Coincide con GENERO_OPTIONS

            // 💡 IMPORTANTE: 'ltda' (minúscula) coincide con la clave en 'detallesSociedades'
            // Esto hará que se apliquen las reglas (Max 50 socios, acciones=false)
            tipo_sociedad: "ltda",

            // --- SECCIÓN 3: ACTIVIDAD ECONÓMICA Y TRIBUTARIA ---
            giro: "702000", // "ACTIVIDADES DE CONSULTORÍA DE GESTIÓN"
            // El campo 'actividad_economica' en tu JSX es un Form.Control de texto,
            // pero tu HTML original sugería un multi-select. 
            // Por ahora, el MOCK devuelve un string que coincide con el estado.
            actividad_economica: "Actividades de consultoría de gestión",
            regimen_tributario: "propyrme", // Coincide con opcionesRegimenTributario

            // --- SECCIÓN 4: SEGURIDAD Y PREVISIÓN ---
            mutual_de_seguridad: "achs", // Coincide con opcionesMutual
            gratificacion_legal: "art_50", // Coincide con opcionesGratificacionLegal
            tasa_actividad: "0.95", // Tasa de ejemplo

            // --- SECCIÓN 5: DIRECCIONES DE TRABAJO ---
            nombre_de_la_obra: "Oficinas Centrales",
            comuna_de_la_obra: "Providencia",
            descripcion_de_la_obra: "Administración y gestión de contratos.",

            // --- SECCIÓN 6: ACCIONES Y CAPITAL ---
            capital_total: 50000000,
            // Como es 'ltda', las acciones_totales son 0.
            // Tu componente SocioItem deshabilitará las acciones por socio.
            acciones_totales: 0,
            capital_pagado: 25000000, // La mitad pagada
            fecha_de_pago: '2025-12-31', // Formato YYYY-MM-DD

            // --- DATOS ANIDADOS (LISTAS) ---

            // Socios (2 socios, ya que 'ltda' requiere mín. 2)
            socios: [
                {
                    rut_socio: '11.111.111-1',
                    nombre_socio: 'Ana María Torres',
                    participacion_socio: '60', // 60%
                    acciones_socio: '0' // 0 porque es 'ltda'
                },
                {
                    rut_socio: '22.222.222-2',
                    nombre_socio: 'Carlos Silva Rojas',
                    participacion_socio: '40', // 40%
                    acciones_socio: '0' // 0 porque es 'ltda'
                }
            ],

            // Usuarios Autorizados (3 usuarios, como en tu JSX)
            usuarios: [
                {
                    nombres: "Ricardo Andrés", // Admin, mismo Rep. Legal
                    primerApellido: "González",
                    segundoApellido: "Pérez",
                    rut: "12.345.678-9",
                    correo: "rgonzalez@andina.cl",
                    clave: "PasswordAdmin123", // El form no la mostrará
                    rol: "Admin" // Coincide con opciones en UsuarioItem.jsx
                },
                {
                    nombres: "Marcela Paz",
                    primerApellido: "Fuentes",
                    segundoApellido: "Gómez",
                    rut: "14.555.666-7",
                    correo: "mfuentes@andina.cl",
                    clave: "PasswordConta456",
                    rol: "Contador" // Coincide con opciones en UsuarioItem.jsx
                },
            ],

            // Métodos de pago (vacío por ahora, tu UI no lo maneja a nivel de empresa)
            metodos_pago: []
        };
    }
    // --- 🚨 FIN MOCK ---


    const url = `${API_BASE_URL}/empresa/full`;

    // Configura la cabecera 'Authorization' con el token
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`, // Asumiendo esquema Bearer Token
            'Content-Type': 'application/json'
        }
    };

    return fetchApi(url, options);
}

/**
 * 2. Actualiza los datos de una empresa específica.
 * Corresponde al endpoint PUT /empresa/{empresa_id}.
 * @param {number} empresaId - El ID de la empresa a actualizar.
 * @param {object} data - Los datos de la empresa a actualizar (EmpresaUpdateRequest).
 * @param {string} token - El token de autenticación del usuario.
 * @returns {Promise<object>} - Un objeto con un mensaje de éxito.
 */
export async function actualizarEmpresa(empresaId, data, token) {

    // --- 🚨 MOCK API ---
    if (MOCK_API_ENABLED) {
        await simularRed(1200); // Simula 1.2 seg de guardado
        console.warn("MOCK API: actualizarEmpresa()", empresaId, data);
        // Devuelve un objeto que tu handleSubmit espera
        return {
            success: true,
            message: "¡Datos de la empresa guardados correctamente! (MOCK)"
        };
    }
    // --- 🚨 FIN MOCK ---

    const url = `${API_BASE_URL}/empresa/${empresaId}`;

    const options = {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        // Los datos del cuerpo se envían como una cadena JSON
        body: JSON.stringify(data)
    };

    return fetchApi(url, options);
}