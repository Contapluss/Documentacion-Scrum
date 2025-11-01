// src/services/api.contrato.js

// ----------------------------------------------------------------------
// --- 🚨 INTERRUPTOR GLOBAL DE SIMULACIÓN (MOCK) 🚨 ---
// ---
// --- Pon esto en 'true' para simular la API y que la UI funcione.
// --- Pon esto en 'false' cuando tu backend esté listo.
// ----------------------------------------------------------------------
const MOCK_API_ENABLED = true;
//

// 🚨 Re-use or adjust the base URL as needed for contract endpoints
const API_BASE_URL = "https://back-end-fastapi-production.up.railway.app";

/**
 * Función genérica para manejar peticiones y errores.
 * (Copiada de api.trabajador.js)
 * @param {string} url - La URL completa del endpoint.
 * @param {object} options - Opciones de la petición fetch (método, headers, body).
 * @returns {Promise<object>} - Los datos de respuesta o lanza un error.
 */
async function fetchApi(url, options = {}) {
    console.log("Llamando a la API REAL:", url); // Log para saber si la API real se está usando
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: "Error desconocido" }));
            throw new Error(`HTTP error! Status: ${response.status} - Detail: ${errorData.detail || errorData.msg}`);
        }

        if (response.status === 204) {
            return { success: true, message: "Operación exitosa." };
        }

        const data = await response.json();
        console.log("Datos recibidos del backend (contrato API):", data); // Log específico
        return data;

    } catch (error) {
        console.error("Error en la llamada a la API (contrato):", error);
        throw error;
    }
}


// --- SIMULADOR DE DEMORA DE RED ---
// Esto ayuda a que los spinners de "Cargando..." aparezcan en la UI.
const simularRed = (delay = 500) => new Promise(res => setTimeout(res, delay));


/**
 * 1. Obtiene los datos básicos de la empresa para pre-rellenar el contrato.
 * Asume un endpoint GET específico para esto (ajusta la URL si es necesario).
 * @param {string} token - El token de autenticación.
 * @returns {Promise<object>} - Datos de la empresa (nombre, RUT, representante, etc.).
 */
export async function obtenerDatosEmpresaParaContrato(token) {

    // --- 🚨 MOCK API ---
    if (MOCK_API_ENABLED) {
        await simularRed(); // Simula 0.5 seg de carga
        console.warn("MOCK API: obtenerDatosEmpresaParaContrato()");
        // ¡Este return solucionará tu error 404 de inmediato!
        return {
            nombre: 'Andina Limitada',
            rut: '76.123.456-0',
            representanteLegal: 'Juan Pérez',
            rutRepresentante: '12.345.678-5',
            domicilioRepresentante: 'Av. Nueva Providencia 1881, Of. 1220',
            domicilioEmpresa: 'Calle Falsa 456, Santiago'
        };
    }
    // --- 🚨 FIN MOCK ---


    // 🚨 Verifica esta URL con tu backend. Podría ser /empresa/mi-empresa o similar.
    const url = `${API_BASE_URL}/api/v1/empresa/datos`;
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
 * 2. Guarda un nuevo contrato generado en el backend.
 * Asume un endpoint POST para la creación de contratos.
 * @param {object} datosContrato - Los datos completos del contrato a crear.
 * @param {string} token - El token de autenticación.
 * @returns {Promise<object>} - Respuesta del servidor (ej: el contrato creado con su ID).
 */
export async function guardarContratoGenerado(datosContrato, token) {

    // --- 🚨 MOCK API ---
    if (MOCK_API_ENABLED) {
        await simularRed(1000); // Simula 1 seg de guardado
        console.warn("MOCK API: guardarContratoGenerado()", datosContrato);
        return {
            success: true,
            message: "¡Contrato Generado y Guardado! (MOCK)",
            contratoId: 12345
        };
    }
    // --- 🚨 FIN MOCK ---


    // 🚨 Verifica esta URL con tu backend.
    const url = `${API_BASE_URL}/api/contratos`;
    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosContrato) // Envía los datos del contrato en el cuerpo
    };
    return fetchApi(url, options);
}

/**
 * 3. Guarda una nueva plantilla de contrato.
 * @param {object} plantillaData - { nombre, cuerpo }
 * @param {string} token - El token de autenticación.
 * @returns {Promise<object>} - Respuesta del servidor.
 */
export async function guardarPlantilla(plantillaData, token) {

    // --- 🚨 MOCK API ---
    if (MOCK_API_ENABLED) {
        await simularRed(700);
        console.warn("MOCK API: guardarPlantilla()", plantillaData);
        return { success: true, message: "Plantilla guardada (MOCK)" };
    }
    // --- 🚨 FIN MOCK ---


    // 🚨 Verifica esta URL con tu backend.
    const url = `${API_BASE_URL}/api/plantillas`;
    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(plantillaData)
    };
    return fetchApi(url, options);
}

/**
 * 4. Obtiene la lista de plantillas de contrato.
 * @param {string} token - El token de autenticación.
 * @returns {Promise<Array<object>>} - Lista de plantillas (ej: [{ id, nombre }]).
 */
export async function obtenerPlantillas(token) {

    // --- 🚨 MOCK API ---
    if (MOCK_API_ENABLED) {
        await simularRed(800);
        console.warn("MOCK API: obtenerPlantillas()");
        return [
            { id: 1, nombre: 'Contrato Plazo Fijo Estándar' },
            { id: 2, nombre: 'Contrato Indefinido General' },
            { id: 3, nombre: 'Contrato Part-Time (20 hrs)' },
            { id: 4, nombre: 'Contrato Por Obra o Faena Específica' },
            { id: 5, nombre: 'Anexo Modificación Sueldo Base' },
            { id: 6, nombre: 'Anexo Cambio de Cargo' },
            { id: 7, nombre: 'Plantilla Teletrabajo Mixto (3x2)' }
        ];
    }
    // --- 🚨 FIN MOCK ---


    // 🚨 Verifica esta URL con tu backend.
    const url = `${API_BASE_URL}/api/plantillas`;
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
    return fetchApi(url, options);
}

/**
 * 5. Guarda una nueva cláusula reutilizable.
 * @param {object} clausulaData - { titulo, contenido }
 * @param {string} token - El token de autenticación.
 * @returns {Promise<object>} - Respuesta del servidor.
 */
export async function guardarClausula(clausulaData, token) {

    // --- 🚨 MOCK API ---
    if (MOCK_API_ENABLED) {
        await simularRed(700);
        console.warn("MOCK API: guardarClausula()", clausulaData);
        return { success: true, message: "Cláusula guardada (MOCK)" };
    }
    // --- 🚨 FIN MOCK ---


    // 🚨 Verifica esta URL con tu backend.
    const url = `${API_BASE_URL}/api/clausulas`;
    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(clausulaData)
    };
    return fetchApi(url, options);
}

/**
 * 6. Obtiene la lista de cláusulas disponibles.
 * @param {string} token - El token de autenticación.
 * @returns {Promise<Array<object>>} - Lista de cláusulas (ej: [{ id, titulo, contenido }]).
 */
export async function obtenerClausulasDisponibles(token) {

    // --- 🚨 MOCK API ---
    if (MOCK_API_ENABLED) {
        await simularRed(600);
        console.warn("MOCK API: obtenerClausulasDisponibles()");
        return [
            { id: 101, titulo: 'Confidencialidad General', contenido: 'El trabajador se obliga a mantener estricta reserva y confidencialidad sobre toda información de la empresa, clientes o proveedores a la que tenga acceso...' },
            { id: 102, titulo: 'Propiedad Intelectual (Desarrollo)', contenido: 'Todas las invenciones, desarrollos de software, diseños o creaciones realizadas por el trabajador durante la vigencia del contrato y en relación a sus funciones, serán de propiedad exclusiva del empleador...' },
            { id: 103, titulo: 'Exclusividad Laboral', contenido: 'El trabajador se compromete a prestar servicios de manera exclusiva para el empleador, no pudiendo realizar actividades similares o que impliquen competencia durante la vigencia de este contrato...' },
            { id: 104, titulo: 'Uso de Herramientas y Equipos', contenido: 'Las herramientas, equipos (notebook, celular, etc.) y software proporcionados por el empleador son para uso exclusivamente laboral. El trabajador es responsable por su cuidado y correcta utilización...' },
            { id: 105, titulo: 'Bono Anual por Desempeño (Variable)', contenido: 'Adicionalmente a la remuneración pactada, el trabajador podrá optar a un bono anual variable, sujeto al cumplimiento de metas individuales y resultados de la empresa, según política interna que se informará oportunamente.' },
            { id: 106, titulo: 'Cláusula Teletrabajo (Total)', contenido: 'Las partes acuerdan que los servicios serán prestados bajo la modalidad de teletrabajo desde el domicilio del trabajador ubicado en {domicilioTrabajador}. El empleador proporcionará [especificar equipos/compensación]...' },
            { id: 107, titulo: 'Asignación Pérdida de Caja (Cajeros)', contenido: 'Se pagará una asignación mensual de {monto} por concepto de pérdida de caja, la cual compensará eventuales diferencias menores en el manejo de efectivo...' }
        ];
    }
    // --- 🚨 FIN MOCK ---


    // 🚨 Verifica esta URL con tu backend.
    const url = `${API_BASE_URL}/api/clausulas`;
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
    return fetchApi(url, options);
}

/**
 * 7. Obtiene una plantilla específica por su ID.
 * @param {string | number} plantillaId - El ID de la plantilla a cargar.
 * @param {string} token - El token de autenticación.
 * @returns {Promise<object>} - Los datos de la plantilla (ej: { id, nombre, cuerpo }).
 */
export async function obtenerPlantillaPorId(plantillaId, token) {

    // --- 🚨 MOCK API ---
    if (MOCK_API_ENABLED) {
        await simularRed(400);
        console.warn("MOCK API: obtenerPlantillaPorId()", plantillaId);

        // Base de datos de plantillas simuladas
        const plantillasDB = {
            "1": { // Contrato Plazo Fijo Estándar
                id: 1,
                nombre: 'Contrato Plazo Fijo Estándar',
                cuerpo:
`CONTRATO DE TRABAJO A PLAZO FIJO (Plantilla Estándar)
=====================================================

En {ciudadFirma}, a {fechaContrato}, entre **{nombreEmpresa}**, RUT **{rutEmpresa}**, representada por **{representanteLegal}**, RUT **{rutRepresentante}**, ambos domiciliados en **{domicilioEmpresa}**, en adelante "el empleador"; y don(a) **{nombreTrabajador}**, RUT **{rutTrabajador}**, domiciliado en **{domicilioTrabajador}**, de nacionalidad {nacionalidadTrabajador}, nacido el {fechaNacimientoTrabajador}, estado civil {estadoCivilTrabajador}, en adelante "el trabajador", se ha convenido el siguiente contrato de trabajo a plazo fijo:

**PRIMERO: De los Servicios.**
El trabajador se desempeñará como **{cargoTrabajador}**. Sus funciones serán [DESCRIBIR BREVEMENTE LAS FUNCIONES PRINCIPALES O HACER REFERENCIA A ANEXO DE DESCRIPCIÓN DE CARGO].

**SEGUNDO: Lugar y Jornada.**
Los servicios se prestarán en {lugarPrestacionServicios}. La jornada será de {jornadaHoras} horas semanales, distribuidas de la siguiente forma: {descripcionJornada}, con {tiempoColacion} de descanso para colación.

**TERCERO: Remuneración.**
La remuneración mensual bruta será de **${'{sueldo}'} ({sueldoEnPalabras} pesos)**, compuesta por:
   a) Sueldo Base: ${'{sueldo}'}
   b) Gratificación Legal: {gratificacionLegal}
   {asignaciones}

El pago se realizará el último día hábil de cada mes mediante {formaPago}.

**CUARTO: Duración del Contrato.**
El presente contrato regirá a contar del {fechaInicioContrato} y tendrá una duración de **{duracionPlazoFijo}**, expirando el día {fechaTerminoPlazoFijo}, fecha en la cual terminará sin más trámite, conforme al N°4 del Artículo 159 del Código del Trabajo.

**QUINTO: Previsión y Salud.**
El trabajador cotizará en AFP {afpTrabajador} y en el sistema de salud {saludTrabajador}.

**SEXTO: Cláusulas Adicionales.**
{clausulasAdicionales}

Firman las partes...
[ESPACIO PARA FIRMAS]`
            },
            "2": { // Contrato Indefinido General
                id: 2,
                nombre: 'Contrato Indefinido General',
                cuerpo:
`CONTRATO DE TRABAJO INDEFINIDO (Plantilla General)
==================================================

En {ciudadFirma}, a {fechaContrato}, entre **{nombreEmpresa}**, RUT **{rutEmpresa}**, representada por **{representanteLegal}**, RUT **{rutRepresentante}**, y don(a) **{nombreTrabajador}**, RUT **{rutTrabajador}**, domiciliado en **{domicilioTrabajador}**, se acuerda:

**PRIMERO: Cargo y Funciones.**
El trabajador prestará servicios como **{cargoTrabajador}**, realizando principalmente las siguientes funciones: [DESCRIBIR FUNCIONES].

**SEGUNDO: Lugar y Jornada.**
Lugar: {lugarPrestacionServicios}. Jornada: {jornadaHoras} horas semanales, distribuidas {descripcionJornada}.

**TERCERO: Remuneración.**
Sueldo bruto mensual: **${'{sueldo}'} ({sueldoEnPalabras} pesos)**. Incluye Sueldo Base (${'{sueldo}'}) y Gratificación Legal ({gratificacionLegal}). {asignaciones}. Forma de pago: {formaPago}.

**CUARTO: Duración.**
El presente contrato tendrá **duración indefinida** a contar del {fechaInicioContrato}.

**QUINTO: Previsión y Salud.**
AFP: {afpTrabajador}. Salud: {saludTrabajador}.

**SEXTO: Otros.**
{clausulasAdicionales}

Firman...
[FIRMAS]`
            },
            "3": { // Contrato Part-Time (20 hrs)
                id: 3,
                nombre: 'Contrato Part-Time (20 hrs)',
                cuerpo:
`CONTRATO DE TRABAJO A JORNADA PARCIAL (Plantilla 20 hrs)
=======================================================

En {ciudadFirma}, a {fechaContrato}, entre **{nombreEmpresa}** RUT {rutEmpresa} y **{nombreTrabajador}** RUT {rutTrabajador}, se conviene:

**PRIMERO: Cargo.**
El trabajador será **{cargoTrabajador}**.

**SEGUNDO: Jornada Parcial.**
La jornada de trabajo será de **20 horas semanales**, distribuidas de la siguiente forma:
   - Lunes a Viernes: [ESPECIFICAR HORARIO DIARIO, EJ: 14:00 a 18:00 hrs].
   [O ESPECIFICAR DÍAS Y HORAS SI NO ES L-V]

**TERCERO: Remuneración Proporcional.**
La remuneración mensual bruta será de **${'{sueldo}'} ({sueldoEnPalabras} pesos)**, calculada proporcionalmente a la jornada pactada. Incluye Sueldo Base y Gratificación Legal ({gratificacionLegal}).

**CUARTO: Duración.**
{tipoDuracion: Indefinido / Plazo Fijo por {duracionPlazoFijo} hasta {fechaTerminoPlazoFijo}}.

**QUINTO: Demás Estipulaciones.**
Rigen las demás cláusulas del contrato [Indefinido/Plazo Fijo] base, en lo que no se oponga a la jornada parcial.
{clausulasAdicionales}

Firman...
[FIRMAS]`
            },
            "4": {
                id: 4,
                nombre: 'Contrato Por Obra o Faena Específica',
                cuerpo: `CONTRATO POR OBRA O FAENA

...La obra específica es: {nombreObraFaena}. Su duración estimada es de {duracionEstimadaObra}...

Remuneración: ${'{sueldo}'}...

El contrato terminará al concluir la obra...
{clausulasAdicionales}`
            },
            "5": {
                id: 5,
                nombre: 'Anexo Modificación Sueldo Base',
                cuerpo: `ANEXO DE CONTRATO

Comparecen: {nombreEmpresa} y {nombreTrabajador}.

Las partes acuerdan modificar la cláusula TERCERO del contrato de fecha {fechaContratoOriginal}, relativa a la remuneración, la cual quedará como sigue a contar del {fechaEfectivaAnexo}:

TERCERO: La remuneración mensual bruta será de ${'{nuevoSueldo}'} ({nuevoSueldoEnPalabras} pesos), compuesta por:
   a) Nuevo Sueldo Base: ${'{nuevoSueldo}'}
   b) Gratificación Legal...

Las demás estipulaciones del contrato original permanecen vigentes...

Firman...`
            },
            "6": {
                id: 6,
                nombre: 'Anexo Cambio de Cargo',
                cuerpo: `ANEXO DE CONTRATO - CAMBIO DE CARGO

Entre {nombreEmpresa} y {nombreTrabajador}, RUT {rutTrabajador}, se acuerda modificar, a contar del {fechaEfectivaAnexo}, la cláusula PRIMERO del contrato original de fecha {fechaContratoOriginal}, la cual quedará redactada como sigue:

PRIMERO: El trabajador se desempeñará en el nuevo cargo de **{nuevoCargo}**. Sus funciones principales serán [DESCRIBIR NUEVAS FUNCIONES]...

[OPCIONAL: Mencionar si hay cambio de remuneración, lugar o jornada asociado al cambio de cargo]

En todo lo no modificado, rige el contrato original...

Firman...`
            },
            "7": {
                id: 7,
                nombre: 'Plantilla Teletrabajo Mixto (3x2)',
                cuerpo: `CONTRATO DE TRABAJO CON MODALIDAD MIXTA (TELETRABAJO)

...**SEGUNDO: Lugar y Jornada Mixta.**
El trabajador prestará servicios bajo una modalidad mixta:
   a) Trabajo Presencial: Los días Lunes, Miércoles y Viernes en {lugarPrestacionServicios}.
   b) Teletrabajo: Los días Martes y Jueves desde el domicilio del trabajador ubicado en {domicilioTrabajador}.
La jornada total será de {jornadaHoras} horas semanales...

[AÑADIR CLÁUSULAS ESPECÍFICAS DE TELETRABAJO: Equipos, Costos, Seguridad, Reversibilidad]...

Remuneración: ${'{sueldo}'}...
Duración: {tipoDuracion}...
{clausulasAdicionales}

Firman...`
            }
        };

        // Devuelve la plantilla encontrada o un error simulado
        return plantillasDB[plantillaId] || { id: 0, nombre: 'Error', cuerpo: 'PLANTILLA NO ENCONTRADA (Simulación)' };
    }
    // --- 🚨 FIN MOCK ---


    // 🚨 Verifica esta URL con tu backend.
    const url = `${API_BASE_URL}/api/plantillas/${plantillaId}`;
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
    return fetchApi(url, options);
}


/**
 * 8. Obtiene la lista de todos los contratos generados.
 * (MODIFICADO para aceptar filtros)
 * @param {string} token - El token de autenticación.
 * @param {object} params - Objeto con { rut, cargo }.
 * @returns {Promise<Array<object>>} - Lista de contratos.
 */
export async function listarContratos(token, params = {}) { // 💡 MODIFICADO

    // --- 🚨 MOCK API (CON LÓGICA DE FILTRADO) ---
    if (MOCK_API_ENABLED) {
        await simularRed(700);
        console.warn("MOCK API: listarContratos() con filtros:", params);

        // 1. "Base de datos" simulada más grande y realista
        const baseDeDatosSimulada = [
            {
                id: 101, // ID realista
                nombreTrabajador: 'Carlos Alberto Rodríguez Fuentes',
                rutTrabajador: '15.789.123-4',
                cargoTrabajador: 'Jefe de Proyecto',
                fechaContrato: '2023-06-15T10:00:00Z', // Fecha ISO para facilitar ordenación
                plantillaUsada: 'Plantilla Plazo Fijo Empresa X' // Nombre más específico
            },
            {
                id: 102,
                nombreTrabajador: 'Javiera Andrea López Soto',
                rutTrabajador: '18.123.456-7',
                cargoTrabajador: 'Diseñadora Gráfica Senior',
                fechaContrato: '2024-03-01T09:00:00Z',
                plantillaUsada: 'Plantilla Indefinido Área Creativa'
            }
            // Puedes añadir más contratos aquí
        ];

        // 2. Normalizar filtros (ignorar puntos/guiones en RUT, case-insensitive)
        const rutBusqueda = (params.rut || '').replace(/[.-]/g, '').toLowerCase().trim();
        const cargoBusqueda = (params.cargo || '').toLowerCase().trim();

        // 3. Filtrar
        const resultados = baseDeDatosSimulada.filter(contrato => {
            const rutNormalizado = contrato.rutTrabajador.replace(/[.-]/g, '').toLowerCase();
            // Filtrar por RUT exacto o parcial (si se ingresa K, buscarla)
            const matchRut = rutBusqueda ? rutNormalizado.startsWith(rutBusqueda) : true;
            const matchCargo = cargoBusqueda ? contrato.cargoTrabajador.toLowerCase().includes(cargoBusqueda) : true;
            return matchRut && matchCargo;
        });

        // 4. Opcional: Ordenar por fecha descendente (más recientes primero)
        resultados.sort((a, b) => new Date(b.fechaContrato) - new Date(a.fechaContrato));

        return resultados;
    }
    // --- 🚨 FIN MOCK ---

    // --- API REAL (MODIFICADA para enviar filtros) ---
    const activeParams = {};
    if (params.rut) activeParams.rut = params.rut;
    if (params.cargo) activeParams.cargo = params.cargo;
    
    const query = new URLSearchParams(activeParams).toString();
    
    // 💡 URL actualizada con query params
    const url = `${API_BASE_URL}/api/contratos?${query}`; 
    const options = {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    };
    return fetchApi(url, options);
}

/**
 * 9. Obtiene un contrato específico por su ID.
 * (Se usará en la página 'CrearAnexo.jsx')
 * @param {string | number} contratoId - El ID del contrato a cargar.
 * @param {string} token - El token de autenticación.
 * @returns {Promise<object>} - Los datos completos del contrato.
 */
export async function obtenerContratoPorId(contratoId, token) {

    // --- 🚨 MOCK API ---
    if (MOCK_API_ENABLED) {
        await simularRed(500);
        console.warn("MOCK API: obtenerContratoPorId()", contratoId);

        // Base de datos simulada para detalles (debe coincidir con IDs de listarContratos)
        const contratosDetalleDB = {
            "101": { // Carlos Rodríguez - Contrato inicial
                id: 101,
                nombreTrabajador: 'Carlos Alberto Rodríguez Fuentes',
                rutTrabajador: '15.789.123-4',
                domicilioTrabajador: 'Los Conquistadores 2345, Apt 501, Providencia',
                cargoTrabajador: 'Jefe de Proyecto',
                sueldo: 1850000,
                gratificacionLegal: 462500, // Ejemplo calculado (25% del sueldo base)
                asignaciones: 50000, // Colación/Movilización ejemplo
                fechaContrato: '2023-06-15T10:00:00Z',
                clausulasAdicionalesIds: [101, 104], // IDs de cláusulas ejemplo
                clausulasAdicionales: [
                    { id: 101, titulo: 'Confidencialidad Empresa X', contenido: 'El trabajador se obliga a mantener estricta reserva...' },
                    { id: 104, titulo: 'Uso Herramientas Empresa', contenido: 'El notebook y celular son propiedad de la empresa...' }
                ],
                // Texto generado más completo
                textoGenerado: `CONTRATO DE TRABAJO A PLAZO FIJO
==============================================

En SANTIAGO, a **15 de JUNIO de 2023**, entre **Servicios Integrales Andinos Ltda.**, Rol Único Tributario N° **76.123.456-K**, representada legalmente por don **Ricardo Andrés González Pérez**, cédula de identidad N° **12.345.678-9**, ambos domiciliados para estos efectos en **Av. Nueva Providencia 1881, Oficina 1220, Providencia**, Santiago, en adelante "el empleador"; y don **Carlos Alberto Rodríguez Fuentes**, cédula de identidad N° **15.789.123-4**, de nacionalidad Chilena, nacido el 20 de Noviembre de 1988, domiciliado en **Los Conquistadores 2345, Apt 501, Providencia**, Santiago, de estado civil Casado, en adelante "el trabajador", se ha convenido el siguiente contrato individual de trabajo a plazo fijo:

**PRIMERO: Naturaleza de los Servicios.**
El trabajador se desempeñará en el cargo de **Jefe de Proyecto**. Sus funciones principales consistirán en la planificación, ejecución, seguimiento y cierre de los proyectos tecnológicos que le sean asignados por la Gerencia; la coordinación de los equipos de trabajo involucrados; la gestión de recursos y control presupuestario de los proyectos; la elaboración de informes periódicos de avance, riesgos y resultados; y la comunicación efectiva con stakeholders internos y externos. Asimismo, deberá realizar cualquier otra labor anexa o relacionada con su cargo que el empleador le encomiende, dentro del giro de la empresa.

**SEGUNDO: Lugar de Prestación de Servicios.**
Los servicios serán prestados, por regla general, en las oficinas del empleador ubicadas en **Av. Nueva Providencia 1881, Oficina 1220, Providencia**, Santiago. Sin embargo, en atención a la naturaleza de sus funciones, el trabajador podrá ser requerido para desempeñar labores en dependencias de clientes o en otros lugares dentro o fuera de la Región Metropolitana, según lo requieran los proyectos a su cargo, sin que ello signifique menoscabo. Los gastos de traslado y alojamiento fuera de Santiago, si aplicasen, serán cubiertos por el empleador según la política interna de la empresa.

**TERCERO: Remuneración.**
El empleador remunerará al trabajador con un sueldo mensual bruto de **$1.850.000 (UN MILLÓN OCHOCIENTOS CINCUENTA MIL pesos)**. Dicha remuneración se pagará por períodos mensuales vencidos, a más tardar el último día hábil de cada mes, mediante transferencia electrónica a la cuenta bancaria que el trabajador indique. La remuneración se descompone de la siguiente manera:
   a) Sueldo Base: $1.850.000
   b) Gratificación Legal: Conforme al Artículo 50 del Código del Trabajo, equivalente al 25% de lo devengado en el respectivo ejercicio comercial por remuneraciones mensuales, con tope legal de 4,75 Ingresos Mínimos Mensuales. Dicha gratificación se pagará conjuntamente con la remuneración mensual.
   c) Asignación de Movilización: $25.000 mensuales, de carácter no imponible.
   d) Asignación de Colación: $25.000 mensuales, de carácter no imponible.

De la remuneración bruta se efectuarán las deducciones por cotizaciones de seguridad social (AFP, Salud), impuestos y cualquier otra que legalmente corresponda.

**CUARTO: Jornada de Trabajo.**
La jornada ordinaria de trabajo será de **40 horas semanales**, distribuidas de **Lunes a Viernes, en horario de 09:00 a 18:00 horas**, con un descanso intermedio de **una hora** destinado a colación, el cual no será imputable a la jornada laboral y será de cargo del trabajador.

**QUINTO: Duración del Contrato.**
El presente contrato de trabajo se pacta a **plazo fijo**, con una duración de **3 (tres) meses**, contados desde el **15 de Junio de 2023**, fecha de ingreso del trabajador. En consecuencia, el contrato expirará de pleno derecho el día **14 de Septiembre de 2023**, sin necesidad de aviso previo ni formalidad alguna, en virtud de lo dispuesto en el artículo 159 N° 4 del Código del Trabajo. La eventual renovación de este contrato deberá constar por escrito.

**SEXTO: Previsión y Salud.**
El trabajador declara estar afiliado a la Administradora de Fondos de Pensiones **AFP Provida** y al sistema de salud **Isapre Colmena**. El empleador realizará las cotizaciones previsionales y de salud correspondientes, de acuerdo a la normativa vigente, descontándolas de la remuneración del trabajador.

**SÉPTIMO: Obligaciones del Trabajador.**
Son obligaciones esenciales del trabajador, cuyo incumplimiento grave facultará al empleador para poner término al contrato, entre otras: cumplir la jornada de trabajo; desempeñar sus funciones con diligencia y cuidado; acatar las instrucciones de sus superiores; observar el Reglamento Interno de Orden, Higiene y Seguridad; guardar reserva de la información confidencial; y cuidar las herramientas y bienes de la empresa.

**OCTAVO: Propiedad Intelectual.**
Toda creación, invención, software, diseño, informe o material desarrollado por el trabajador en el ejercicio de sus funciones y con recursos proporcionados por el empleador, pertenecerá en propiedad exclusiva a este último, quien podrá registrarlo y utilizarlo libremente.

**NOVENO: Modificaciones.**
Cualquier modificación a las estipulaciones de este contrato deberá constar por escrito y ser firmada por ambas partes.

**DÉCIMO: Domicilio y Jurisdicción.**
Para todos los efectos legales derivados del presente contrato, las partes fijan domicilio en la ciudad de Santiago y se someten a la competencia de sus Tribunales de Justicia.

Se deja constancia que el trabajador ha recibido copia del presente contrato y del Reglamento Interno de Orden, Higiene y Seguridad.

Firman las partes en dos ejemplares de igual tenor y fecha.

-----------------------------           
**EMPLEADOR**                           
Servicios Integrales Andinos Ltda.      
RUT 76.123.456-K                        

-----------------------------
**TRABAJADOR**
Carlos Alberto Rodríguez Fuentes
RUT 15.789.123-4

========================================
CLÁUSULAS ADICIONALES ANEXAS:
========================================

**CONFIDENCIALIDAD EMPRESA X:**
El trabajador se obliga a mantener estricta reserva y confidencialidad sobre toda información técnica, comercial, financiera o de cualquier otra índole relativa a la empresa, sus clientes, proveedores o negocios, a la que tenga acceso con motivo de sus funciones. Esta obligación subsistirá aún después de terminado el contrato de trabajo.

**USO HERRAMIENTAS EMPRESA:**
El notebook, teléfono celular y demás herramientas tecnológicas entregadas al trabajador para el desempeño de sus funciones son de propiedad exclusiva del empleador y deberán ser utilizadas principalmente para fines laborales. El trabajador se obliga a cuidarlas diligentemente y a restituirlas al término del contrato o cuando le sean requeridas.

`
            },
            "102": { // Javiera López
                id: 102,
                nombreTrabajador: 'Javiera Andrea López Soto',
                rutTrabajador: '18.123.456-7',
                domicilioTrabajador: 'Av. Vicuña Mackenna 987, Ñuñoa',
                cargoTrabajador: 'Diseñadora Gráfica Senior',
                sueldo: 950000,
                gratificacionLegal: 237500, // Ejemplo
                asignaciones: 0,
                fechaContrato: '2024-03-01T09:00:00Z',
                clausulasAdicionalesIds: [],
                clausulasAdicionales: [],
                textoGenerado: `CONTRATO DE TRABAJO INDEFINIDO – ÁREA CREATIVA
=========================================================

En SANTIAGO, a 01 de MARZO de 2024, entre **Servicios Integrales Andinos Ltda.**, Rol Único Tributario N° **76.123.456-K**, representada legalmente por don **Ricardo Andrés González Pérez**, cédula de identidad N° **12.345.678-9**, ambos domiciliados para estos efectos en **Av. Nueva Providencia 1881, Oficina 1220, Providencia**, Santiago, en adelante "el empleador"; y doña **Javiera Andrea López Soto**, cédula de identidad N° **18.123.456-7**, de nacionalidad Chilena, nacida el 10 de Febrero de 1995, domiciliada en **Av. Vicuña Mackenna 987, Ñuñoa**, Santiago, de estado civil Soltera, en adelante "la trabajadora", se ha convenido el siguiente contrato de trabajo:

**PRIMERO: Naturaleza de los Servicios.**
La trabajadora prestará servicios como **Diseñadora Gráfica Senior**. Sus funciones principales comprenderán, sin que esta enumeración sea taxativa, la creación y desarrollo de material gráfico para campañas de marketing, diseño de interfaces de usuario (UI), elaboración de presentaciones corporativas, adaptación de material gráfico para distintos formatos (digital e impreso), y colaboración con el equipo de marketing y desarrollo en la conceptualización de proyectos visuales.

**SEGUNDO: Lugar de Prestación de Servicios.**
Los servicios serán prestados en las oficinas del empleador, ubicadas en **Av. Nueva Providencia 1881, Oficina 1220, Providencia**, Santiago. Sin perjuicio de lo anterior, la trabajadora podrá ser destinada temporalmente a otras dependencias o lugares dentro de la misma ciudad, en la medida que ello no le genere menoscabo. Eventualmente, y de mutuo acuerdo, se podrá pactar la modalidad de teletrabajo en los términos que establece la ley.

**TERCERO: Remuneración.**
La remuneración mensual bruta de la trabajadora será la suma de **$950.000 (NOVECIENTOS CINCUENTA MIL pesos)**, que se pagará por períodos vencidos, el último día hábil de cada mes. Esta suma se descompone de la siguiente forma:
   a) Sueldo Base: $950.000
   b) Gratificación Legal: Se pagará la gratificación legal garantizada de acuerdo a lo dispuesto en el artículo 50 del Código del Trabajo, esto es, el 25% de lo devengado en el respectivo ejercicio comercial por concepto de remuneraciones mensuales, con un tope máximo de 4,75 Ingresos Mínimos Mensuales.

Las deducciones legales correspondientes a previsión, salud y otros que la ley establezca, serán de cargo de la trabajadora.

**CUARTO: Jornada de Trabajo.**
La jornada ordinaria de trabajo será de **40 horas semanales**, distribuidas de **Lunes a Viernes, de 09:00 a 18:00 horas**, con un descanso de **una hora** destinado a colación, el cual no será imputable a la jornada.

**QUINTO: Duración del Contrato.**
El presente contrato tendrá **duración indefinida** a contar de esta fecha (01 de MARZO de 2024). Podrá ponérsele término en cualquier momento, de acuerdo con las causales legales establecidas en los artículos 159, 160 y 161 del Código del Trabajo.

**SEXTO: Previsión y Salud.**
La trabajadora se encuentra afiliada a la Administradora de Fondos de Pensiones **AFP Modelo** y al sistema de salud **FONASA**. El empleador efectuará las cotizaciones y aportes correspondientes conforme a la ley.

**SÉPTIMO: Confidencialidad.**
La trabajadora se obliga a guardar la más estricta reserva y confidencialidad respecto de toda la información, datos, procesos, metodologías y conocimientos a los que tenga acceso con motivo de la prestación de sus servicios, tanto durante la vigencia del contrato como después de su término.

**OCTAVO: Domicilio.**
Para todos los efectos legales derivados del presente contrato, las partes fijan su domicilio en la ciudad de Santiago y se someten a la jurisdicción de sus Tribunales de Justicia.

**NOVENO: Otros Pactos.**
[...] (Aquí podrían ir cláusulas adicionales específicas si las hubiera, como propiedad intelectual, bonos, etc.)

El presente contrato se firma en dos ejemplares de igual tenor y fecha, quedando uno en poder de cada parte.

-----------------------------        -----------------------------
**EMPLEADOR** **TRABAJADORA**
Servicios Integrales Andinos Ltda.   Javiera Andrea López Soto
RUT 76.123.456-K                     RUT 18.123.456-7

`
            },
            // Puedes añadir detalles para los otros IDs (103, 104, 105) si los necesitas
        };

        const contratoEncontrado = contratosDetalleDB[contratoId];

        if (contratoEncontrado) {
            return contratoEncontrado;
        } else {
            // Si el ID no existe en los detalles, simula 404
            console.warn("MOCK API: 404 - Contrato no encontrado para ver detalle");
            throw new Error('HTTP 404 - Not Found - Detail: Contrato no encontrado (Simulación)');
        }
    }
    // --- 🚨 FIN MOCK ---

    const url = `${API_BASE_URL}/api/contratos/${contratoId}`;
    const options = {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    };
    return fetchApi(url, options);
}

/**
 * 10. Guarda un nuevo anexo para un contrato existente.
 * @param {string | number} contratoId - ID del contrato original.
 * @param {object} datosAnexo - Datos del anexo (ej: nuevas cláusulas, cambios de sueldo).
 * @param {string} token - El token de autenticación.
 * @returns {Promise<object>} - Respuesta del servidor.
 */
export async function guardarAnexo(contratoId, datosAnexo, token) {

    // --- 🚨 MOCK API ---
    if (MOCK_API_ENABLED) {
        await simularRed(1000);
        console.warn("MOCK API: guardarAnexo()", contratoId, datosAnexo);
        return {
            success: true,
            message: 'Anexo guardado exitosamente (MOCK)',
            anexoId: 501
        };
    }
    // --- 🚨 FIN MOCK ---

    const url = `${API_BASE_URL}/api/contratos/${contratoId}/anexos`;
    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosAnexo)
    };
    return fetchApi(url, options);
}

// Puedes añadir más funciones aquí si las necesitas, por ejemplo:
// - obtenerClausulasDisponibles(token) -> para cargar cláusulas desde la API
// - obtenerContratoPorId(contratoId, token) -> para ver un contrato existente
// - listarContratos(token, filtros) -> para la página de "Listar Contratos"