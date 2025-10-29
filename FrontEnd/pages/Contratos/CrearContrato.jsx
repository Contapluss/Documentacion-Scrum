// src/pages/Contratos/CrearContrato.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Modal, Spinner } from 'react-bootstrap';

// --- LIBRERÍAS ---
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { Spanish } from 'flatpickr/dist/l10n/es.js';

// --- VARIABLES Y API ---
import { clausulasDisponibles, obtenerContenidoClausula } from './Variable_Contratos';
import {
    obtenerDatosEmpresaParaContrato,
    guardarContratoGenerado,
    obtenerPlantillas,
    obtenerPlantillaPorId,
    obtenerClausulasDisponibles
} from '../../services/api.contrato'; // Ajusta la ruta si es necesario

// --- HELPERS --- (Puedes moverlos a un archivo utils si los usas en más sitios)
function formatearRut(rut) {
    rut = String(rut).replace(/[^\dkK]/g, '').toUpperCase();
    if (rut.length <= 1) return rut;
    let cuerpo = rut.slice(0, -1);
    let dv = rut.slice(-1);
    cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${cuerpo}-${dv}`;
}

function validarRut(rut) {
    rut = String(rut).replace(/[^\dkK]/g, '').toUpperCase();
    if (rut.length < 2) return false;
    let cuerpo = rut.slice(0, -1);
    let dv = rut.slice(-1);
    let suma = 0;
    let multiplo = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo.charAt(i)) * multiplo;
        multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }
    let dvEsperado = 11 - (suma % 11);
    dvEsperado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();
    return dv === dvEsperado;
}

// Token de ejemplo (debería venir de tu AuthContext)
const FAKE_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

// Estado inicial del formulario
const INITIAL_CONTRATO_STATE = {
    ciudadFirma: '',
    fechaContrato: null,
    nombreEmpresa: '',
    rutEmpresa: '',
    representanteLegal: '',
    rutRepresentante: '',
    domicilioRepresentante: '',
    nombreTrabajador: '',
    nacionalidadTrabajador: '',
    rutTrabajador: '',
    estadoCivilTrabajador: '',
    fechaNacimientoTrabajador: null,
    domicilioTrabajador: '',
    cargoTrabajador: '',
    lugarTrabajo: '',
    sueldo: '',
    jornada: '',
    descripcionJornada: '',
    domicilioEmpresa: '', // (Asegúrate de cargarlo en 'cargarDatosEmpresa' si lo tienes)
    fechaIngresoTrabajador: null,
    gratificacionLegal: '0',
    asignaciones: '0',
};

function CrearContrato() {
    // --- ESTADOS ---
    const [contratoData, setContratoData] = useState(INITIAL_CONTRATO_STATE);
    const [clausulasSeleccionadas, setClausulasSeleccionadas] = useState([]);
    const [showClausulaModal, setShowClausulaModal] = useState(false);
    const [selectedClausulaToAdd, setSelectedClausulaToAdd] = useState('');
    const [isLoadingEmpresa, setIsLoadingEmpresa] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [rutEmpresaValido, setRutEmpresaValido] = useState(true);
    const [rutRepresentanteValido, setRutRepresentanteValido] = useState(true);
    const [rutTrabajadorValido, setRutTrabajadorValido] = useState(true);
    const [plantillas, setPlantillas] = useState([]); // Lista para el dropdown
    const [clausulasApi, setClausulasApi] = useState([]); // Lista para el modal
    const [plantillaSeleccionadaId, setPlantillaSeleccionadaId] = useState('');
    const [cuerpoPlantilla, setCuerpoPlantilla] = useState(''); // El texto de la plantilla cargada
    const [isLoadingPlantillas, setIsLoadingPlantillas] = useState(false);
    const [textoFinalPreview, setTextoFinalPreview] = useState(''); // (Opcional) Para previsualizar

    // --- EFECTO PARA CARGAR DATOS EMPRESA ---
    useEffect(() => {
        const cargarDatosEmpresa = async () => {
            setIsLoadingEmpresa(true);
            try {
                const data = await obtenerDatosEmpresaParaContrato(FAKE_TOKEN);
                // Actualiza solo los campos de empresa en el estado
                setContratoData(prev => ({
                    ...prev,
                    nombreEmpresa: data.nombre || '',
                    rutEmpresa: data.rut ? formatearRut(data.rut) : '',
                    representanteLegal: data.representanteLegal || '',
                    rutRepresentante: data.rutRepresentante ? formatearRut(data.rutRepresentante) : '',
                    domicilioRepresentante: data.domicilioRepresentante || ''
                }));
                // Valida los RUTs cargados
                setRutEmpresaValido(data.rut ? validarRut(data.rut) : true);
                setRutRepresentanteValido(data.rutRepresentante ? validarRut(data.rutRepresentante) : true);

            } catch (error) {
                setMessage({ type: 'danger', text: `Error cargando datos de empresa: ${error.message}` });
            } finally {
                setIsLoadingEmpresa(false);
            }
        };
        cargarDatosEmpresa();
    }, []); // Se ejecuta solo al montar

    // --- NUEVO EFECTO para cargar Listas (Plantillas y Cláusulas) ---
    useEffect(() => {
        const cargarListas = async () => {
            setIsLoadingPlantillas(true);
            try {
                const [plantillasRes, clausulasRes] = await Promise.all([
                    obtenerPlantillas(FAKE_TOKEN),
                    obtenerClausulasDisponibles(FAKE_TOKEN)
                ]);
                setPlantillas(plantillasRes || []);
                setClausulasApi(clausulasRes || []);
            } catch (error) {
                setMessage({ type: 'danger', text: `Error cargando plantillas o cláusulas: ${error.message}` });
            } finally {
                setIsLoadingPlantillas(false);
            }
        };
        cargarListas();
    }, []);

    // --- MANEJADORES ---
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setContratoData(prev => ({ ...prev, [name]: value }));

        // Resetea validación RUT al escribir
        if (name === 'rutEmpresa') setRutEmpresaValido(true);
        if (name === 'rutRepresentante') setRutRepresentanteValido(true);
        if (name === 'rutTrabajador') setRutTrabajadorValido(true);

    }, []);

    const handleDateChange = useCallback((date, name) => {
        setContratoData(prev => ({ ...prev, [name]: date[0] || null }));
    }, []);

    const handleRutChange = useCallback((e) => {
        const { name, value } = e.target;
        const rutFormateado = formatearRut(value);
        setContratoData(prev => ({ ...prev, [name]: rutFormateado }));
        // Resetea validación
        if (name === 'rutEmpresa') setRutEmpresaValido(true);
        if (name === 'rutRepresentante') setRutRepresentanteValido(true);
        if (name === 'rutTrabajador') setRutTrabajadorValido(true);
    }, []);

    const handleRutBlur = useCallback((e) => {
        const { name, value } = e.target;
        const esValido = validarRut(value);
        if (name === 'rutEmpresa') setRutEmpresaValido(esValido);
        if (name === 'rutRepresentante') setRutRepresentanteValido(esValido);
        if (name === 'rutTrabajador') setRutTrabajadorValido(esValido);
    }, []);

    // --- NUEVO MANEJADOR: Cargar Plantilla seleccionada ---
    const handlePlantillaChange = async (e) => {
        const id = e.target.value;
        setPlantillaSeleccionadaId(id);

        if (id) {
            setIsLoadingPlantillas(true);
            setMessage({ type: '', text: '' });
            try {
                const plantilla = await obtenerPlantillaPorId(id, FAKE_TOKEN);
                setCuerpoPlantilla(plantilla.cuerpo || '');
                // Limpia cláusulas anteriores al cambiar de plantilla
                setClausulasSeleccionadas([]);
                setTextoFinalPreview(''); // Limpia preview
            } catch (error) {
                setMessage({ type: 'danger', text: `Error cargando plantilla: ${error.message}` });
                setCuerpoPlantilla('');
            } finally {
                setIsLoadingPlantillas(false);
            }
        } else {
            setCuerpoPlantilla('');
            setClausulasSeleccionadas([]);
        }
    };

    // --- MANEJADORES MODAL (Actualizados) ---
    const handleOpenModal = () => setShowClausulaModal(true);
    const handleCloseModal = () => {
        setShowClausulaModal(false);
        setSelectedClausulaToAdd('');
    };

    const handleAgregarClausula = () => {
        if (selectedClausulaToAdd) {
            // 👇 Lógica actualizada: busca en 'clausulasApi'
            const clausulaEncontrada = clausulasApi.find(c => c.id.toString() === selectedClausulaToAdd);

            if (clausulaEncontrada && !clausulasSeleccionadas.some(c => c.id === clausulaEncontrada.id)) {
                // Guardamos el objeto entero (o solo id, titulo y contenido)
                setClausulasSeleccionadas(prev => [...prev, {
                    id: clausulaEncontrada.id,
                    titulo: clausulaEncontrada.titulo,
                    contenido: clausulaEncontrada.contenido
                }]);
                handleCloseModal();
            } else if (!clausulaEncontrada) {
                setMessage({ type: 'warning', text: 'Error: No se encontró contenido para la cláusula seleccionada.' });
            } else {
                setMessage({ type: 'warning', text: 'Esta cláusula ya ha sido agregada.' });
            }
        } else {
            setMessage({ type: 'warning', text: 'Por favor, seleccione una cláusula para agregar.' });
        }
    };

    const handleEliminarClausula = (indexToRemove) => {
        setClausulasSeleccionadas(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    /**
     * Función auxiliar para reemplazar variables en un texto.
     */
    const reemplazarVariables = useCallback((texto, datos) => {
        let textoProcesado = texto;

        // Formateo de fechas (Mantenemos la lógica de tu 'generarTextoContrato' original)
        const formatDate = (date, options) => date ? new Date(date).toLocaleDateString('es-ES', options).toUpperCase() : 'FECHA INVÁLIDA';

        const fechaContratoFmt = formatDate(datos.fechaContrato, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const fechaIngresoFmt = formatDate(datos.fechaIngresoTrabajador, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const fechaNacimientoFmt = formatDate(datos.fechaNacimientoTrabajador, { day: 'numeric', month: 'long', year: 'numeric' });

        // Conversión de sueldo (Mantenemos la lógica)
        const numeroSueldo = parseFloat(datos.sueldo) || 0;
        const sueldoEnPalabras = numToWords(numeroSueldo);

        // Objeto de reemplazos
        const reemplazos = {
            '{ciudadFirma}': datos.ciudadFirma.toUpperCase(),
            '{fechaContrato}': fechaContratoFmt,
            '{fechaIngresoTrabajador}': fechaIngresoFmt,

            '{nombreEmpresa}': datos.nombreEmpresa,
            '{rutEmpresa}': datos.rutEmpresa,
            '{representanteLegal}': datos.representanteLegal,
            '{rutRepresentante}': datos.rutRepresentante,
            '{domicilioRepresentante}': datos.domicilioRepresentante,
            '{domicilioEmpresa}': datos.domicilioEmpresa,

            '{nombreTrabajador}': datos.nombreTrabajador,
            '{nacionalidadTrabajador}': datos.nacionalidadTrabajador,
            '{rutTrabajador}': datos.rutTrabajador,
            '{estadoCivilTrabajador}': datos.estadoCivilTrabajador,
            '{fechaNacimientoTrabajador}': fechaNacimientoFmt,
            '{domicilioTrabajador}': datos.domicilioTrabajador,
            '{cargoTrabajador}': datos.cargoTrabajador,
            '{lugarTrabajo}': datos.lugarTrabajo,

            '{sueldo}': numeroSueldo.toLocaleString('es-CL'),
            '{sueldoEnPalabras}': sueldoEnPalabras.toUpperCase(),
            '{gratificacionLegal}': parseFloat(datos.gratificacionLegal).toLocaleString('es-CL'),
            '{asignaciones}': parseFloat(datos.asignaciones).toLocaleString('es-CL'),

            '{jornada}': datos.jornada,
            '{descripcionJornada}': datos.descripcionJornada,
        };

        // Realizar reemplazos
        for (const [key, value] of Object.entries(reemplazos)) {
            // Usamos new RegExp con 'g' (global) para reemplazar todas las ocurrencias
            textoProcesado = textoProcesado.replace(new RegExp(key, 'g'), value || '');
        }

        return textoProcesado;
    }, []);

    // --- NUEVO EFECTO para Previsualización en Vivo ---
    useEffect(() => {
        // Solo genera preview si hay una plantilla cargada
        if (!cuerpoPlantilla) {
            setTextoFinalPreview(''); // Limpia el preview si no hay plantilla
            return;
        }

        // 1. Une el cuerpo de la plantilla con las cláusulas adicionales
        let textoCompleto = cuerpoPlantilla;

        if (clausulasSeleccionadas.length > 0) {
            const textoClausulas = clausulasSeleccionadas
                .map(c => `\n\n${c.titulo.toUpperCase()}:\n${c.contenido}`)
                .join('');
            textoCompleto += textoClausulas;
        }

        // 2. Reemplaza todas las variables con los datos actuales del formulario
        const textoFinalGenerado = reemplazarVariables(textoCompleto, contratoData);

        // 3. Actualiza el estado del preview
        setTextoFinalPreview(textoFinalGenerado);

    }, [contratoData, cuerpoPlantilla, clausulasSeleccionadas, reemplazarVariables]); // 💡 Se ejecuta si CUALQUIERA de estos cambia

    // --- SUBMIT (Actualizado) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setTextoFinalPreview(''); // Limpia preview antigua

        // --- Validaciones ---
        if (!plantillaSeleccionadaId || !cuerpoPlantilla) {
            setMessage({ type: 'warning', text: 'Por favor, seleccione una plantilla de contrato.' });
            return;
        }

        const camposObligatorios = [
            'ciudadFirma', 'fechaContrato', 'fechaIngresoTrabajador',
            'nombreTrabajador', 'nacionalidadTrabajador', 'rutTrabajador',
            'estadoCivilTrabajador', 'fechaNacimientoTrabajador', 'domicilioTrabajador',
            'cargoTrabajador', 'lugarTrabajo', 'sueldo', 'jornada', 'descripcionJornada'
        ];
        const campoFaltante = camposObligatorios.find(campo => !contratoData[campo]);
        if (campoFaltante) {
            setMessage({ type: 'warning', text: `Por favor, complete el campo: ${campoFaltante}` });
            return;
        }
        if (!rutEmpresaValido || !rutRepresentanteValido || !rutTrabajadorValido) {
            setMessage({ type: 'danger', text: 'Hay RUTs inválidos. Por favor, corrígelos.' });
            return;
        }
        if (new Date(contratoData.fechaIngresoTrabajador) < new Date(contratoData.fechaContrato)) {
            setMessage({ type: 'danger', text: 'La fecha de ingreso no puede ser anterior a la fecha de celebración del contrato.' });
            return;
        }

        setIsSubmitting(true);
        try {
            // --- 1. Generar el Texto Final ---

            // Une el cuerpo de la plantilla con las cláusulas adicionales
            let textoCompleto = cuerpoPlantilla;

            if (clausulasSeleccionadas.length > 0) {
                const textoClausulas = clausulasSeleccionadas
                    .map(c => `\n\n${c.titulo.toUpperCase()}:\n${c.contenido}`)
                    .join('');
                textoCompleto += textoClausulas;
            }

            // Reemplaza todas las variables
            const textoFinalGenerado = reemplazarVariables(textoCompleto, contratoData);

            // (Opcional) Mostrar el preview en la UI
            setTextoFinalPreview(textoFinalGenerado);

            // --- 2. Preparar Datos para la API ---
            const contratoFinal = {
                ...contratoData,
                // Formatea fechas y números para el JSON
                fechaContrato: contratoData.fechaContrato ? new Date(contratoData.fechaContrato).toISOString().split('T')[0] : null,
                fechaIngresoTrabajador: contratoData.fechaIngresoTrabajador ? new Date(contratoData.fechaIngresoTrabajador).toISOString().split('T')[0] : null,
                fechaNacimientoTrabajador: contratoData.fechaNacimientoTrabajador ? new Date(contratoData.fechaNacimientoTrabajador).toISOString().split('T')[0] : null,
                sueldo: parseFloat(contratoData.sueldo) || 0,
                gratificacionLegal: parseFloat(contratoData.gratificacionLegal) || 0,
                asignaciones: parseFloat(contratoData.asignaciones) || 0,

                // Envía los IDs de las cláusulas seleccionadas
                clausulasAdicionalesIds: clausulasSeleccionadas.map(c => c.id),

                // Envía el texto final generado
                textoGenerado: textoFinalGenerado,

                // Envía el ID de la plantilla usada
                plantillaId: plantillaSeleccionadaId
            };

            // --- 3. Llama a la API para guardar ---
            const resultado = await guardarContratoGenerado(contratoFinal, FAKE_TOKEN);
            setMessage({ type: 'success', text: resultado.message || '¡Contrato generado y guardado!' });

            // Limpiar formulario (opcional)
            // setContratoData(INITIAL_CONTRATO_STATE);
            // setClausulasSeleccionadas([]);
            // setPlantillaSeleccionadaId('');
            // setCuerpoPlantilla('');

        } catch (error) {
            setMessage({ type: 'danger', text: `Error al generar/guardar contrato: ${error.message}` });
        } finally {
            setIsSubmitting(false);
        }
    };


    // --- RENDERIZADO ---
    if (isLoadingEmpresa) {
        return <Container className="text-center my-5"><Spinner animation="border" /> Cargando datos...</Container>;
    }

    return (
        <Container fluid>
            <Card className="p-4">
                <Card.Title as="h1" className="h3 mb-4">Creación de Contrato de Trabajo</Card.Title>

                {message.text && (
                    <Alert variant={message.type} onClose={() => setMessage({ type: '', text: '' })} dismissible>
                        {message.text}
                    </Alert>
                )}

                <Form id="contratoForm" onSubmit={handleSubmit}>

                    {/* --- NUEVO: Selección de Plantilla --- */}
                    <Card border="primary" className="mb-4 p-2">
                        <Card.Header as="h5">1. Seleccionar Plantilla</Card.Header>
                        <Card.Body>
                            <Form.Group controlId="selectPlantilla">
                                <Form.Label>Plantilla de Contrato:</Form.Label>
                                <Form.Select
                                    value={plantillaSeleccionadaId}
                                    onChange={handlePlantillaChange}
                                    disabled={isLoadingPlantillas}
                                    required
                                >
                                    <option value="">{isLoadingPlantillas ? "Cargando plantillas..." : "Seleccione una plantilla"}</option>
                                    {plantillas.map(p => (
                                        <option key={p.id} value={p.id}>{p.nombre}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Card.Body>
                    </Card>

                    {/* El resto del formulario se deshabilita si no hay plantilla */}
                    <fieldset disabled={!plantillaSeleccionadaId || isLoadingPlantillas}>
                        {/* --- Sección 2: Datos del Contrato --- */}
                        <div className="mb-4">
                            <h2 className="h5">2. Completar Datos</h2>
                            <Row className="g-3">
                                {/* --- Datos Generales Contrato --- */}
                                <Col md={6}>
                                    <Form.Group controlId="ciudadFirma">
                                        <Form.Label>Ciudad de Firma:</Form.Label>
                                        <Form.Control type="text" name="ciudadFirma" value={contratoData.ciudadFirma} onChange={handleChange} placeholder="Ej: SANTIAGO" required />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group controlId="fechaContrato">
                                        <Form.Label>Fecha Celebración Contrato:</Form.Label>
                                        <Flatpickr
                                            className="form-control"
                                            name="fechaContrato"
                                            value={contratoData.fechaContrato}
                                            options={{ dateFormat: "Y-m-d", locale: Spanish, maxDate: "today" }}
                                            onChange={(date) => handleDateChange(date, 'fechaContrato')}
                                            placeholder="Seleccione fecha..."
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group controlId="fechaIngresoTrabajador">
                                        <Form.Label>Fecha Ingreso Trabajador:</Form.Label>
                                        <Flatpickr
                                            className="form-control"
                                            name="fechaIngresoTrabajador"
                                            value={contratoData.fechaIngresoTrabajador}
                                            options={{ dateFormat: "Y-m-d", locale: Spanish }}
                                            onChange={(date) => handleDateChange(date, 'fechaIngresoTrabajador')}
                                            placeholder="Seleccione fecha..."
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}></Col> {/* Espacio */}

                                {/* --- Campos Empresa (Read Only) --- */}
                                <Col md={6}><Form.Group><Form.Label>Nombre Empresa:</Form.Label><Form.Control type="text" name="nombreEmpresa" value={contratoData.nombreEmpresa} readOnly /></Form.Group></Col>
                                <Col md={6}><Form.Group><Form.Label>RUT Empresa:</Form.Label><Form.Control type="text" name="rutEmpresa" value={contratoData.rutEmpresa} isInvalid={!rutEmpresaValido} readOnly /></Form.Group></Col>
                                <Col md={6}><Form.Group><Form.Label>Representante Legal:</Form.Label><Form.Control type="text" name="representanteLegal" value={contratoData.representanteLegal} readOnly /></Form.Group></Col>
                                <Col md={6}><Form.Group><Form.Label>RUT Representante:</Form.Label><Form.Control type="text" name="rutRepresentante" value={contratoData.rutRepresentante} isInvalid={!rutRepresentanteValido} readOnly /></Form.Group></Col>
                                <Col md={12}><Form.Group><Form.Label>Domicilio Representante:</Form.Label><Form.Control type="text" name="domicilioRepresentante" value={contratoData.domicilioRepresentante} readOnly /></Form.Group></Col>
                                {/* <Col md={12}><Form.Group><Form.Label>Domicilio Empresa:</Form.Label><Form.Control type="text" name="domicilioEmpresa" value={contratoData.domicilioEmpresa} readOnly /></Form.Group></Col> */}

                                {/* --- Campos Trabajador (Editables) --- */}
                                <Col md={6}><Form.Group><Form.Label>Nombre Trabajador:</Form.Label><Form.Control type="text" name="nombreTrabajador" value={contratoData.nombreTrabajador} onChange={handleChange} required /></Form.Group></Col>
                                <Col md={6}><Form.Group><Form.Label>Nacionalidad:</Form.Label><Form.Control type="text" name="nacionalidadTrabajador" value={contratoData.nacionalidadTrabajador} onChange={handleChange} required /></Form.Group></Col>
                                <Col md={6}><Form.Group><Form.Label>RUT Trabajador:</Form.Label><Form.Control type="text" name="rutTrabajador" value={contratoData.rutTrabajador} onChange={handleRutChange} onBlur={handleRutBlur} isInvalid={!rutTrabajadorValido} required /><Form.Control.Feedback type="invalid">RUT inválido</Form.Control.Feedback></Form.Group></Col>
                                <Col md={6}><Form.Group><Form.Label>Estado Civil:</Form.Label><Form.Control type="text" name="estadoCivilTrabajador" value={contratoData.estadoCivilTrabajador} onChange={handleChange} required /></Form.Group></Col>
                                <Col md={6}><Form.Group><Form.Label>Fecha Nacimiento:</Form.Label><Flatpickr className="form-control" name="fechaNacimientoTrabajador" value={contratoData.fechaNacimientoTrabajador} options={{ dateFormat: "Y-m-d", locale: Spanish, maxDate: new Date().getFullYear() - 15 + "-12-31" }} onChange={(date) => handleDateChange(date, 'fechaNacimientoTrabajador')} required /></Form.Group></Col>
                                <Col md={6}><Form.Group><Form.Label>Domicilio Trabajador:</Form.Label><Form.Control type="text" name="domicilioTrabajador" value={contratoData.domicilioTrabajador} onChange={handleChange} required /></Form.Group></Col>
                                <Col md={6}><Form.Group><Form.Label>Cargo:</Form.Label><Form.Control type="text" name="cargoTrabajador" value={contratoData.cargoTrabajador} onChange={handleChange} required /></Form.Group></Col>
                                <Col md={6}><Form.Group><Form.Label>Lugar de Trabajo:</Form.Label><Form.Control type="text" name="lugarTrabajo" value={contratoData.lugarTrabajo} onChange={handleChange} required /></Form.Group></Col>

                                {/* --- Remuneración y Jornada --- */}
                                <Col md={6}><Form.Group><Form.Label>Sueldo Base:</Form.Label><Form.Control type="number" name="sueldo" value={contratoData.sueldo} onChange={handleChange} min="0" required /></Form.Group></Col>
                                <Col md={6}><Form.Group><Form.Label>Gratificación Legal ($):</Form.Label><Form.Control type="number" name="gratificacionLegal" value={contratoData.gratificacionLegal} onChange={handleChange} min="0" /></Form.Group></Col>
                                <Col md={6}><Form.Group><Form.Label>Asignaciones ($):</Form.Label><Form.Control type="number" name="asignaciones" value={contratoData.asignaciones} onChange={handleChange} min="0" /></Form.Group></Col>
                                <Col md={6}><Form.Group><Form.Label>Jornada (Horas Semanales):</Form.Label><Form.Control type="number" name="jornada" value={contratoData.jornada} onChange={handleChange} min="1" max="45" required /></Form.Group></Col>
                                <Col md={12}><Form.Group><Form.Label>Descripción Jornada:</Form.Label><Form.Control type="text" name="descripcionJornada" value={contratoData.descripcionJornada} onChange={handleChange} placeholder="Ej: LUNES A VIERNES de 08:00 a 18:00 horas." required /></Form.Group></Col>
                            </Row>
                        </div>

                        <hr />

                        {/* --- Sección 3: Cláusulas --- */}
                        <div className="mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h2 className="h5 mb-0">3. Cláusulas Adicionales</h2>
                                <Button type="button" variant="secondary" onClick={handleOpenModal}>
                                    <i className="bi bi-plus-circle-fill"></i> Agregar Cláusula
                                </Button>
                            </div>
                            <div id="clausulasContainer" className="p-3 border rounded">
                                {clausulasSeleccionadas.length === 0 ? (
                                    <Alert variant="info" className="mb-0">No se han agregado cláusulas adicionales.</Alert>
                                ) : (
                                    clausulasSeleccionadas.map((clausula, index) => (
                                        <Card key={clausula.id || index} className="mb-2">
                                            <Card.Body>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <h6 className="card-title fw-bold mb-0">{clausula.titulo}</h6>
                                                    <Button type="button" variant="danger" size="sm" onClick={() => handleEliminarClausula(index)}>
                                                        <i className="bi bi-x-circle-fill"></i>
                                                    </Button>
                                                </div>
                                                <p className="card-text mt-2 mb-0" style={{ whiteSpace: 'pre-wrap' }}>{clausula.contenido}</p>
                                            </Card.Body>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* --- Botón Generar --- */}
                        <div className="text-end">
                            <Button type="submit" variant="primary" disabled={isSubmitting}>
                                {isSubmitting ? <Spinner as="span" size="sm" /> : <i className="bi bi-file-earmark-text-fill"></i>}
                                {' '}Generar y Guardar Contrato
                            </Button>
                        </div>
                    </fieldset>

                    {/* --- Preview del Contrato Generado --- */}
                    {/* 💡 Cambiado para mostrarse en cuanto se selecciona una plantilla */}
                    {plantillaSeleccionadaId && (
                        <Card className="mt-4">
                            <Card.Header as="h5">Preview del Contrato</Card.Header>
                            <Card.Body>
                                <Form.Control
                                    as="textarea"
                                    rows={15}
                                    value={textoFinalPreview}
                                    readOnly
                                    placeholder="Completando previsualización..." // 💡 Añadido
                                    style={{ fontSize: '0.8em', backgroundColor: '#f8f9fa' }}
                                />
                            </Card.Body>
                        </Card>
                    )}

                </Form>
            </Card>

            {/* --- Modal Agregar Cláusula (Actualizado) --- */}
            <Modal show={showClausulaModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Seleccionar Cláusula</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="selectClausulaModal">
                        <Form.Label>Cláusula Disponible:</Form.Label>
                        <Form.Select
                            value={selectedClausulaToAdd}
                            onChange={(e) => setSelectedClausulaToAdd(e.target.value)}
                        >
                            {/* 👇 Lógica actualizada: mapea 'clausulasApi' */}
                            <option value="">Seleccione una cláusula...</option>
                            {clausulasApi.map((opt) => (
                                <option key={opt.id} value={opt.id}>
                                    {opt.titulo}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    {/* Muestra el contenido de la cláusula seleccionada */}
                    {selectedClausulaToAdd && (
                        <Card className="mt-3">
                            <Card.Body>
                                <Card.Subtitle className="mb-2 text-muted">Contenido:</Card.Subtitle>
                                <Card.Text style={{ fontSize: '0.9em', whiteSpace: 'pre-wrap' }}>
                                    {clausulasApi.find(c => c.id.toString() === selectedClausulaToAdd)?.contenido}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>Cerrar</Button>
                    <Button variant="primary" onClick={handleAgregarClausula} disabled={!selectedClausulaToAdd}>Agregar</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

// 💡 Función numToWords (se mantiene igual)
function numToWords(num) {
    // ... (código de numToWords que ya tenías)
    const a = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
    const b = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    const g = ['', 'mil', 'millón', 'billón'];

    if (isNaN(num) || num >= 1000000000) return "un número grande";
    if (num === 0) return 'cero';

    if (num < 20) return a[num];
    if (num < 100) return b[Math.floor(num / 10)] + (num % 10 !== 0 ? ' y ' + a[num % 10] : '');
    if (num < 1000) {
        let hundreds = num === 100 ? 'cien' : num < 200 ? 'ciento' : a[Math.floor(num / 100)] + 'cientos';
        return hundreds + (num % 100 !== 0 ? ' ' + numToWords(num % 100) : '');
    }
    // ... (añadir lógica para miles, etc. si es necesario)
    return num.toString(); // Fallback
}


export default CrearContrato;