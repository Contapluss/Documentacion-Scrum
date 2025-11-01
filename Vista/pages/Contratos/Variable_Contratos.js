// src/pages/Contratos/Variable_Contrato.js

// Opciones de cláusulas para el modal
// Podrías cargarlas desde una API si fueran muchas o cambiaran a menudo
export const clausulasDisponibles = [
    { value: '', label: 'Seleccione una cláusula...', isDisabled: true },
    {
        value: 'Cláusula de Confidencialidad',
        label: 'Cláusula de Confidencialidad',
        contenido: 'El trabajador se compromete a mantener la más estricta confidencialidad sobre toda la información comercial, técnica y operativa de la empresa.'
    },
    {
        value: 'Cláusula de No Competencia',
        label: 'Cláusula de No Competencia',
        contenido: 'Durante la vigencia del contrato, el trabajador no podrá prestar servicios a ninguna empresa que compita directamente con el empleador.'
    },
    {
        value: 'Cláusula de Propiedad Intelectual',
        label: 'Cláusula de Propiedad Intelectual',
        contenido: 'Toda obra o invención creada por el trabajador en el desempeño de sus funciones será de propiedad exclusiva de la empresa.'
    },
    // Agrega más cláusulas aquí si es necesario
];

// Función helper para buscar el contenido de una cláusula por su título/valor
export const obtenerContenidoClausula = (valor) => {
    const clausula = clausulasDisponibles.find(c => c.value === valor);
    return clausula ? clausula.contenido : '';
};

/**
 * Define todas las variables que se pueden usar en plantillas y cláusulas.
 * 'key' es el texto que se insertará (ej: {nombreTrabajador})
 * 'label' es el texto que verá el usuario en el botón.
 */
export const VARIABLES_CONTRATO = [
    // Datos Generales
    { key: '{@ciudadFirma}', label: 'Ciudad Firma' },
    { key: '{@fechaContrato}', label: 'Fecha Contrato' },
    { key: '{@fechaIngresoTrabajador}', label: 'Fecha Ingreso' },

    // Empleador
    { key: '{@nombreEmpresa}', label: 'Nombre Empresa' },
    { key: '{@rutEmpresa}', label: 'RUT Empresa' },
    { key: '{@representanteLegal}', label: 'Representante Legal' },
    { key: '{@rutRepresentante}', label: 'RUT Representante' },
    { key: '{@domicilioRepresentante}', label: 'Domicilio Representante' },
    { key: '{@domicilioEmpresa}', label: 'Domicilio Empresa' }, // Agregada según tu lista

    // Trabajador
    { key: '{@nombreTrabajador}', label: 'Nombre Trabajador' },
    { key: '{@nacionalidadTrabajador}', label: 'Nacionalidad' },
    { key: '{@rutTrabajador}', label: 'RUT Trabajador' },
    { key: '{@estadoCivilTrabajador}', label: 'Estado Civil' },
    { key: '{@fechaNacimientoTrabajador}', label: 'Fecha Nacimiento' },
    { key: '{@domicilioTrabajador}', label: 'Domicilio Trabajador' },
    { key: '{@cargoTrabajador}', label: 'Cargo' },
    { key: '{@lugarTrabajo}', label: 'Lugar de Trabajo' },

    // Remuneración
    { key: '{@sueldo}', label: 'Sueldo (Número)' },
    { key: '{@sueldoEnPalabras}', label: 'Sueldo (Palabras)' },
    { key: '{@gratificacionLegal}', label: 'Gratificación Legal' }, // Agregada según tu lista
    { key: '{@asignaciones}', label: 'Asignaciones' }, // Agregada según tu lista

    // Jornada
    { key: '{@jornada}', label: 'Jornada (Horas)' },
    { key: '{@descripcionJornada}', label: 'Descripción Jornada' },
];