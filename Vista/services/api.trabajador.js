// src/services/api.Trabajador.js
// ----------------------------------------------------------------------
// --- 🚨 INTERRUPTOR GLOBAL DE SIMULACIÓN (MOCK) 🚨 ---
// ---
// --- Pon esto en 'true' para simular la API.
// --- Pon esto en 'false' cuando tu backend esté listo.
// ----------------------------------------------------------------------
const MOCK_API_ENABLED = true;
// ----------------------------------------------------------------------
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
        // Simulamos un error genérico si esto llega a pasar
        throw new Error("MOCK API está activado, no se puede llamar a la API real.");
    }

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: "Error desconocido" }));
            throw new Error(`HTTP error! Status: ${response.status} - Detail: ${errorData.detail || errorData.msg}`);
        }

        // Maneja respuestas 204 No Content (comunes en PUT/DELETE)
        if (response.status === 204) {
            return { success: true, message: "Operación exitosa." };
        }
        //============================== 
        // 1. Guarda la respuesta en una variable
        const data = await response.json();

        // 2. Muestra los datos en la consola
        console.log("Datos recibidos del backend:", data);

        // 3. Devuelve los datos
        return data;
        //=====================================
        //Poner return await response.json(); cuando se termine el desarrollo
    } catch (error) {
        console.error("Error en la llamada a la API:", error);
        throw error;
    }
}

/**
 * 💡 NUEVA FUNCIÓN: Envía datos usando multipart/form-data (para archivos).
 * @param {string} url - La URL completa del endpoint.
 * @param {FormData} formData - El objeto FormData que contiene los datos y archivos.
 * @param {string} token - El token de autenticación.
 * @param {string} [method='POST'] - El método HTTP ('POST' o 'PUT').
 * @returns {Promise<object>} - Los datos de respuesta o lanza un error.
 */
async function fetchApiFormData(url, formData, token, method = 'POST') {

    // Si el mock está activado, no llames a la API real.
    if (MOCK_API_ENABLED) {
        console.warn("MOCK API está activado, pero se intentó llamar a fetchApiFormData. Bloqueando llamada a:", url);
        throw new Error("MOCK API está activado, no se puede llamar a la API real.");
    }


    console.log(`Llamando a la API REAL (${method} FormData):`, url);
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                // ❌ NO establecer 'Content-Type': 'multipart/form-data'.
                // El navegador lo hará automáticamente con el boundary correcto.
                'Authorization': `Bearer ${token}`
            },
            body: formData // Envía el objeto FormData directamente
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: "Error desconocido" }));
            if (response.status === 404) {
                console.warn("API 404: No encontrado", url);
                throw new Error(`HTTP 404 - Not Found - Detail: ${errorData.detail || 'No encontrado'}`);
            }
            throw new Error(`HTTP error! Status: ${response.status} - Detail: ${errorData.detail || errorData.msg}`);
        }

        if (response.status === 204) {
            return { success: true, message: "Operación exitosa." };
        }

        const data = await response.json();
        console.log("Datos recibidos del backend (FormData):", data);
        return data;

    } catch (error) {
        console.error("Error en la llamada a la API (FormData):", error);
        throw error;
    }
}

// --- SIMULADOR DE DEMORA DE RED (NUEVO) ---
const simularRed = (delay = 500) => new Promise(res => setTimeout(res, delay));

/**
 * 1. Obtiene los datos de un trabajador específico.
 * (Basado en tu antigua función `cargarTrabajador(id)`)
 * @param {number} trabajadorId - El ID del trabajador a obtener.
 * @param {string} token - El token de autenticación.
 * @returns {Promise<object>} - Los datos del trabajador.
 */
export async function obtenerTrabajador(trabajadorId, token) {


    // --- 🚨 MOCK API ---
    if (MOCK_API_ENABLED) {
        await simularRed(600);
        console.warn("MOCK API: obtenerTrabajador()", trabajadorId);

        // Simulamos el ID 1 (Juan Pérez)
        const trabajadoresSimulados = {
            "1": { // ID 1: Carlos Rodríguez
                datos_generales: {
                    nombres: 'Carlos Alberto',
                    apellidoPaterno: 'Rodríguez',
                    apellidoMaterno: 'Fuentes',
                    rut: '15.789.123-4',
                    fecha_nacimiento: '1988-11-20', // YYYY-MM-DD
                    sexo: 'Masculino', // Valor exacto de opcionesSexo
                    nacionalidad: 'Chilena', // Valor exacto de opcionesNacionalidad
                    estado_civil: 'Casado', // Valor exacto de opcionesEstadoCivil
                    foto_url: 'https://randomuser.me/api/portraits/men/75.jpg' // Foto aleatoria
                },
                info_contacto: {
                    telefono_personal: '987654321',
                    telefono_corporativo: '229876543',
                    correo_personal: 'carlos.rodriguez.f@email.com',
                    correo_corporativo: 'c.rodriguez@andina.cl'
                },
                info_vivienda: {
                    direccion: 'Los Conquistadores 2345, Apt 501',
                    region: 'Metropolitana de Santiago', // Valor exacto de optionsRegiones
                    comuna: 'Providencia', // Valor exacto de la comuna para esa región
                    provincia: 'Santiago' // Campo del formulario
                },
                info_seguros: {
                    afp: 'Provida', // Valor exacto de opcionesAfp
                    instituto_salud: 'Isapre', // Valor exacto de opcionesSalud
                    plan_uf: '1.5' // Valor numérico para Isapre
                },
                info_laboral: {
                    cargo: 'jefe_proyecto', // Valor exacto de opcionesCargo
                    jefe_directo: 'jefe1', // Valor exacto de opcionesJefe
                    sueldo_base: '1850000', // Valor numérico
                    fecha_ingreso: '2021-06-15', // YYYY-MM-DD
                    fecha_contrato: '2021-06-15', // YYYY-MM-DD
                    forma_pago: 'Transferencia' // Valor exacto de opcionesFormaPago
                },
                documentos_contrato_existentes: [
                    { id: 101, nombre: "Contrato_Carlos_Rodriguez_Jun2021.pdf", url: "#simulado1" },
                    { id: 105, nombre: "Anexo_Aumento_Sueldo_2023.pdf", url: "#simulado2" }
                ],
                documentos_epp_existentes: [
                    { id: 201, nombre: "Entrega_Notebook_CRodriguez.pdf", url: "#simulado3" }
                ],
                documentos_odi_existentes: [
                  { id: 301, nombre: "ODI_JefeProyecto_CarlosR_2023.pdf", url: "#simOdi1"},
                  { id: 302, nombre: "Charla_Induccion_CR_2023.pdf", url: "#simOdi2"}
                ]
            },
            "2": { // ID 2: Javiera López
                datos_generales: {
                    nombres: 'Javiera Andrea',
                    apellidoPaterno: 'López',
                    apellidoMaterno: 'Soto',
                    rut: '18.123.456-7',
                    fecha_nacimiento: '1995-02-10',
                    sexo: 'Femenino',
                    nacionalidad: 'Chilena',
                    estado_civil: 'Soltero',
                    foto_url: 'https://randomuser.me/api/portraits/women/44.jpg'
                },
                info_contacto: {
                    telefono_personal: '911223344',
                    telefono_corporativo: '',
                    correo_personal: 'javilopez@email.com',
                    correo_corporativo: 'j.lopez@andina.cl'
                },
                info_vivienda: {
                    direccion: 'Av. Vicuña Mackenna 987',
                    region: 'Metropolitana de Santiago',
                    comuna: 'Ñuñoa',
                    provincia: 'Santiago'
                },
                info_seguros: {
                    afp: 'Modelo',
                    instituto_salud: 'fonasa',
                    plan_uf: '0' // 0 para Fonasa
                },
                info_laboral: {
                    cargo: 'disenador_grafico',
                    jefe_directo: 'jefe6',
                    sueldo_base: '950000',
                    fecha_ingreso: '2024-03-01',
                    fecha_contrato: '2024-03-01',
                    forma_pago: 'Transferencia'
                },
                documentos_contrato_existentes: [
                    { id: 110, nombre: "Contrato_Javiera_Lopez_Mar2024.pdf", url: "#simulado4" },
                ],
                documentos_epp_existentes: [], // Sin EPP registrados aún
                documentos_odi_existentes: [
                   { id: 305, nombre: "ODI_DisenadoraGrafica_JL_2024.pdf", url: "#simOdi3"}
                ]
            }
            // Puedes añadir más IDs aquí si necesitas
        };

        const trabajadorEncontrado = trabajadoresSimulados[trabajadorId.toString()];

        if (trabajadorEncontrado) {
            return trabajadorEncontrado;
        }

        // Si el ID no está en el objeto, simulamos 404
        console.warn("MOCK API: 404 - Trabajador no encontrado");
        throw new Error('HTTP 404 - Not Found - Detail: Trabajador no encontrado (Simulación)');
    }
    // --- 🚨 FIN MOCK ---


    const url = `${API_BASE_URL}/api/trabajador/${trabajadorId}`;
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
    return fetchApi(url, options);
}

/**
 * 2. Crea un nuevo trabajador (MODIFICADO para incluir archivos).
 * @param {object} data - Los datos JSON del nuevo trabajador (preparados por prepararDatosParaEnvio).
 * @param {object} files - Un objeto con los archivos { fotoFile, contratosFiles, eppFiles }.
 * @param {string} token - El token de autenticación.
 * @returns {Promise<object>} - El trabajador creado.
 */
export async function crearTrabajador(data, files, token) { // 💡 Acepta 'files'

    // --- 🚨 MOCK API (Se mantiene igual, ignora los archivos) ---
    if (MOCK_API_ENABLED) {
        await simularRed(1000);
        console.warn("MOCK API: crearTrabajador()", data, files);
        return {
            success: true,
            message: "Trabajador creado exitosamente (MOCK)",
            id: 999
        };
    }
    // --- 🚨 FIN MOCK ---

    // --- API REAL (Usa FormData) ---
    const url = `${API_BASE_URL}/api/trabajador`;

    // 1. Crear FormData
    const formData = new FormData();

    // 2. Adjuntar los datos JSON como un campo 'data' (o como campos individuales si tu backend prefiere)
    // El backend necesitará parsear este campo JSON.
    formData.append('data', JSON.stringify(data));

    // 3. Adjuntar archivos (si existen)
    // 🚨 IMPORTANTE: Los nombres 'foto_principal', 'contratos', 'epp' deben coincidir
    // con lo que espera tu backend de FastAPI (ej: File(...), UploadFile(...)).
    if (files.fotoFile) {
        formData.append('foto_principal', files.fotoFile, files.fotoFile.name);
    }
    if (files.contratosFiles && files.contratosFiles.length > 0) {
        files.contratosFiles.forEach((fileObj, index) => {
            formData.append(`contratos`, fileObj.file, fileObj.name); // Mismo nombre 'contratos' para todos
        });
    }
    if (files.eppFiles && files.eppFiles.length > 0) {
        files.eppFiles.forEach((fileObj, index) => {
            formData.append(`epp`, fileObj.file, fileObj.name); // Mismo nombre 'epp' para todos
        });
    }
    if (files.odiFiles?.length > 0) files.odiFiles.forEach(f => formData.append(`odi`, f.file, f.name)); // 🚨 Nombre 'odi' debe coincidir con backend

    // 4. Llamar a la nueva función fetchApiFormData
    return fetchApiFormData(url, formData, token, 'POST');
}

/**
 * 3. Actualiza un trabajador existente (MODIFICADO para incluir archivos).
 * @param {number} trabajadorId - El ID del trabajador a actualizar.
 * @param {object} data - Los datos JSON a actualizar.
 * @param {object} files - Un objeto con los archivos { fotoFile, contratosFiles, eppFiles }.
 * @param {string} token - El token de autenticación.
 * @returns {Promise<object>} - El trabajador actualizado.
 */
export async function actualizarTrabajador(trabajadorId, data, files, token) { // 💡 Acepta 'files'

    // --- 🚨 MOCK API (Se mantiene igual, ignora los archivos) ---
    if (MOCK_API_ENABLED) {
        await simularRed(1000);
        console.warn("MOCK API: actualizarTrabajador()", trabajadorId, data, files);
        return {
            success: true,
            message: "Trabajador actualizado exitosamente (MOCK)"
        };
    }
    // --- 🚨 FIN MOCK ---

    // --- API REAL (Usa FormData) ---
    const url = `${API_BASE_URL}/api/trabajador/${trabajadorId}`;

    // 1. Crear FormData
    const formData = new FormData();

    // 2. Adjuntar los datos JSON
    formData.append('data', JSON.stringify(data));

    // 3. Adjuntar archivos (si existen)
    // 🚨 Usa los mismos nombres de campo que en crearTrabajador
    if (files.fotoFile) {
        formData.append('foto_principal', files.fotoFile, files.fotoFile.name);
    }
    if (files.contratosFiles && files.contratosFiles.length > 0) {
        files.contratosFiles.forEach((fileObj, index) => {
            formData.append(`contratos`, fileObj.file, fileObj.name);
        });
    }
    if (files.eppFiles && files.eppFiles.length > 0) {
        files.eppFiles.forEach((fileObj, index) => {
            formData.append(`epp`, fileObj.file, fileObj.name);
        });
    }
    if (files.odiFiles?.length > 0) files.odiFiles.forEach(f => formData.append(`odi`, f.file, f.name)); // 🚨 Nombre 'odi' debe coincidir con backend

    // 4. Llamar a fetchApiFormData con método PUT
    // ⚠️ NOTA: Algunos backends (especialmente con ciertas librerías) pueden tener
    // problemas con PUT y FormData. Si falla, consulta con el backend si prefieren
    // usar POST (con algún método de override) o PATCH.
    return fetchApiFormData(url, formData, token, 'PUT');
}

/**
 * 4. Busca trabajadores según criterios.
 * (Asumiendo un endpoint GET /api/trabajadores/buscar)
 * @param {object} params - Objeto con { nombre, rut, cargo }.
 * @param {string} token - El token de autenticación.
 * @returns {Promise<Array>} - Un array de trabajadores.
 */
export async function buscarTrabajadores(params, token) {

    // --- 🚨 MOCK API ---
    if (MOCK_API_ENABLED) {
        await simularRed(800);
        console.warn("MOCK API: buscarTrabajadores()", params);

        // Lista base de trabajadores simulados
        const listaCompleta = [
            {
                id: 1, // Coincide con obtenerTrabajador
                nombres: 'Carlos Alberto',
                apellidoPaterno: 'Rodríguez',
                rut: '15.789.123-4',
                cargo: 'Jefe de Proyecto' // Texto legible para la lista
            },
            {
                id: 2, // Coincide con obtenerTrabajador
                nombres: 'Javiera Andrea',
                apellidoPaterno: 'López',
                rut: '18.123.456-7',
                cargo: 'Diseñadora Gráfica'
            },
        ];

        // Opcional: Simular filtro básico por nombre (ignora mayúsculas/minúsculas)
        const nombreBusqueda = params.nombre ? params.nombre.toLowerCase() : '';
        const rutBusqueda = params.rut || ''; // Simulación simple por ahora
        const cargoBusqueda = params.cargo || ''; // Simulación simple

        const resultadosFiltrados = listaCompleta.filter(trabajador => {
            const nombreCompleto = `${trabajador.nombres} ${trabajador.apellidoPaterno}`.toLowerCase();
            const cumpleNombre = !nombreBusqueda || nombreCompleto.includes(nombreBusqueda);
            // Podrías añadir lógica más compleja para RUT y Cargo si es necesario
            return cumpleNombre;
        });

        // Devolver la lista (filtrada o completa si no hay filtro de nombre)
        return resultadosFiltrados;
    }
    // --- 🚨 FIN MOCK ---

    // Filtra solo los parámetros que tienen valor
    const activeParams = {};
    if (params.nombre) activeParams.nombre = params.nombre;
    if (params.rut) activeParams.rut = params.rut;
    if (params.cargo) activeParams.cargo = params.cargo;

    // Construye los query parameters (ej: ?nombre=juan&rut=123)
    const query = new URLSearchParams(activeParams).toString();

    // 🚨 ¡IMPORTANTE! Asumo que tu endpoint es '/api/trabajadores/buscar'.
    // Debes verificar esta URL con tu backend.
    const url = `${API_BASE_URL}/api/trabajadores/buscar?${query}`;

    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

    // Usamos la misma función genérica 'fetchApi'
    return fetchApi(url, options);
}


/**
 * 7. Elimina un documento de ODI existente.
 * (Asumiendo endpoint DELETE /api/trabajador/{trabajadorId}/documento/odi/{documentoId})
 * @param {number} trabajadorId
 * @param {number} documentoId
 * @param {string} token
 * @returns {Promise<object>}
 */
export async function eliminarDocumentoOdi(trabajadorId, documentoId, token) {
     // --- 🚨 MOCK API ---
    if (MOCK_API_ENABLED) {
        await simularRed(400);
        console.warn("MOCK API: eliminarDocumentoOdi()", trabajadorId, documentoId);
        return { success: true, message: `Documento ODI ${documentoId} eliminado (Simulación).` };
    }
    // --- 🚨 FIN MOCK ---

    // 🚨 Verifica esta URL con tu backend
    const url = `${API_BASE_URL}/api/trabajador/${trabajadorId}/documento/odi/${documentoId}`;
    const options = {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    };
    return fetchApi(url, options); // Reutiliza fetchApi
}
