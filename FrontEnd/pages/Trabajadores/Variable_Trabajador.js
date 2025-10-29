// src/components/views/Variable_Trabajador.js

// Re-exportamos las variables que ya tenías en Variable_Empresa.js
export { regionesComunas, GENERO_OPTIONS as opcionesSexo } from '../Empresa/Variable_Empresa';

// --- NUEVAS OPCIONES PARA TRABAJADOR ---

export const opcionesNacionalidad = [
    { value: '', label: 'Seleccione Nacionalidad', disabled: true },
    { value: 'Chilena', label: 'Chilena' },
    { value: 'Extranjera', label: 'Extranjera' },
    // ... agrega más si es necesario
];

export const opcionesEstadoCivil = [
    { value: '', label: 'Seleccione estado civil', disabled: true },
    { value: 'Soltero', label: 'Soltero' },
    { value: 'Casado', label: 'Casado' },
    { value: 'Divorciado', label: 'Divorciado' },
    { value: 'Viudo', label: 'Viudo' },
];

export const opcionesAfp = [
    { value: '', label: 'Seleccione AFP', disabled: true },
    { value: 'Capital', label: 'Capital' },
    { value: 'Cuprum', label: 'Cuprum' },
    { value: 'Habitat', label: 'Habitat' },
    { value: 'Modelo', label: 'Modelo' },
    { value: 'Planvital', label: 'Planvital' },
    { value: 'Provida', label: 'Provida' },
    { value: 'Uno', label: 'Uno' },
];

export const opcionesSalud = [
    { value: '', label: 'Seleccione Institución', disabled: true },
    { value: 'fonasa', label: 'FONASA' },
    { value: 'Banmédica', label: 'Banmédica' },
    { value: 'Consalud', label: 'Consalud' },
    { value: 'Colmena', label: 'Colmena' },
    { value: 'CruzBlanca', label: 'CruzBlanca' },
    { value: 'Vida Tres', label: 'Vida Tres' },
    { value: 'Isalud', label: 'Isalud' },
    { value: 'Isapre', label: 'Isapre'},
];

export const opcionesCargo = [
    { value: '', label: 'Seleccione Cargo', disabled: true },
    { value: 'Gerente', label: 'Gerente' },
    { value: 'Subgerente', label: 'Subgerente' },
    { value: 'Jefe de Área', label: 'Jefe de Área' },
    { value: 'Analista', label: 'Analista' },
    { value: 'Operario', label: 'Operario' },
    { value: 'jefe_proyecto', label: 'Jefe de Proyecto'},
    { value: 'disenador_grafico', label: 'Disenador Grafico'}
];

export const opcionesFormaPago = [
    { value: '', label: 'Seleccione Forma de Pago', disabled: true },
    { value: 'Transferencia', label: 'Transferencia' },
    { value: 'Cheque', label: 'Cheque' },
    { value: 'Efectivo', label: 'Efectivo' },
    { value: 'Vale Vista', label: 'Vale Vista' },
];

export const opcionesJefe = [
    { value: '', label: 'Seleccione Jefe', disabled: true },
    { value: 'jefe1', label: 'Gerencia General' },
    { value: 'jefe2', label: 'Gerente de Área' },
    { value: 'jefe3', label: 'Subgerente' },
    { value: 'jefe4', label: 'Jefe de Departamento' },
    { value: 'jefe5', label: 'Supervisor' },
    { value: 'jefe6', label: 'Jefe Marketing'}
];