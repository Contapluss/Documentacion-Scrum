// src/pages/Contratos/CrearAnexo.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Modal, Spinner } from 'react-bootstrap';
// 💡 Hooks de React Router DOM para obtener el ID de la URL y para navegar
import { useParams, useNavigate } from 'react-router-dom';

// --- API ---
import {
    obtenerContratoPorId,
    obtenerClausulasDisponibles,
    guardarAnexo
} from '../../services/api.contrato';

// Token de ejemplo
const FAKE_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

// Estado inicial para los campos que SÍ se pueden editar
const INITIAL_EDITABLE_STATE = {
    motivoAnexo: '', // Un campo nuevo para describir el anexo
    lugarTrabajo: '',
    domicilioTrabajador: '',
    cargoTrabajador: '',
    sueldo: '0',
    gratificacionLegal: '0',
    asignaciones: '0',
    // (Puedes añadir 'descripcionJornada' si también se puede cambiar)
};

function CrearAnexo() {
    // --- Hooks ---
    const { contratoId } = useParams(); // Obtiene el '1' de la URL '/crear-anexo/1'
    const navigate = useNavigate();

    // --- Estados ---
    const [contratoOriginal, setContratoOriginal] = useState(null); // Datos del contrato viejo (solo lectura)
    const [camposEditables, setCamposEditables] = useState(INITIAL_EDITABLE_STATE); // Datos del anexo (editables)
    const [clausulasDisponiblesApi, setClausulasDisponiblesApi] = useState([]); // Para el modal
    const [clausulasNuevas, setClausulasNuevas] = useState([]); // Cláusulas solo de ESTE anexo
    const [textoFinalPreview, setTextoFinalPreview] = useState('');

    // Estados de UI
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showClausulaModal, setShowClausulaModal] = useState(false);
    const [selectedClausulaToAdd, setSelectedClausulaToAdd] = useState('');

    // --- EFECTO: Cargar el contrato original y las cláusulas disponibles ---
    useEffect(() => {
        const cargarDatos = async () => {
            setIsLoading(true);
            setMessage({ type: '', text: '' });
            try {
                // 1. Carga el contrato original que vamos a modificar
                const contratoData = await obtenerContratoPorId(contratoId, FAKE_TOKEN);
                setContratoOriginal(contratoData);

                // 2. Rellena los campos editables con los valores ACTUALES de ese contrato
                setCamposEditables({
                    motivoAnexo: '', // Este siempre empieza vacío
                    lugarTrabajo: contratoData.lugarTrabajo || '',
                    domicilioTrabajador: contratoData.domicilioTrabajador || '',
                    cargoTrabajador: contratoData.cargoTrabajador || '',
                    sueldo: contratoData.sueldo?.toString() || '0',
                    gratificacionLegal: contratoData.gratificacionLegal?.toString() || '0',
                    asignaciones: contratoData.asignaciones?.toString() || '0',
                });

                // 3. Carga las cláusulas disponibles para el modal
                const clausulasData = await obtenerClausulasDisponibles(FAKE_TOKEN);
                setClausulasDisponiblesApi(clausulasData || []);

            } catch (error) {
                setMessage({ type: 'danger', text: `Error cargando datos: ${error.message}` });
            } finally {
                setIsLoading(false);
            }
        };

        cargarDatos();
    }, [contratoId]); // Se vuelve a ejecutar si el ID del contrato cambia

    // --- MANEJADORES ---
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setCamposEditables(prev => ({ ...prev, [name]: value }));
    }, []);

    // --- MANEJADORES MODAL (Idénticos a CrearContrato.jsx, pero usan 'clausulasNuevas') ---
    const handleOpenModal = () => setShowClausulaModal(true);
    const handleCloseModal = () => {
        setShowClausulaModal(false);
        setSelectedClausulaToAdd('');
    };

    const handleAgregarClausula = () => {
        if (selectedClausulaToAdd) {
            const clausulaEncontrada = clausulasDisponiblesApi.find(c => c.id.toString() === selectedClausulaToAdd);
            if (clausulaEncontrada && !clausulasNuevas.some(c => c.id === clausulaEncontrada.id)) {
                setClausulasNuevas(prev => [...prev, {
                    id: clausulaEncontrada.id,
                    titulo: clausulaEncontrada.titulo,
                    contenido: clausulaEncontrada.contenido
                }]);
                handleCloseModal();
            } else {
                setMessage({ type: 'warning', text: 'Esta cláusula ya ha sido agregada o no es válida.' });
            }
        }
    };

    const handleEliminarClausula = (indexToRemove) => {
        setClausulasNuevas(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    // --- SUBMIT: Guardar el Anexo ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!camposEditables.motivoAnexo) {
            setMessage({ type: 'warning', text: 'Por favor, ingrese un motivo para el anexo (ej: "Modificación de sueldo").' });
            return;
        }

        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            // 1. Prepara los datos del anexo
            const datosAnexo = {
                ...camposEditables,
                // Convierte a números
                sueldo: parseFloat(camposEditables.sueldo) || 0,
                gratificacionLegal: parseFloat(camposEditables.gratificacionLegal) || 0,
                asignaciones: parseFloat(camposEditables.asignaciones) || 0,
                // Envía solo los IDs de las NUEVAS cláusulas
                clausulasAdicionalesIds: clausulasNuevas.map(c => c.id)
            };

            // 2. Llama a la API
            const resultado = await guardarAnexo(contratoId, datosAnexo, FAKE_TOKEN);

            setMessage({ type: 'success', text: resultado.message || '¡Anexo guardado!' });

            // 3. Envía al usuario de vuelta a la lista después de 2 segundos
            setTimeout(() => {
                navigate('/contratos');
            }, 2000);

        } catch (error) {
            setMessage({ type: 'danger', text: `Error al guardar anexo: ${error.message}` });
            setIsSubmitting(false);
        }
        // No ponemos 'finally' aquí para que el botón permanezca deshabilitado post-éxito
    };


    /**
     * 💡 (NUEVA FUNCIÓN)
     * Genera el texto del anexo comparando el contrato original
     * con los campos editables del formulario.
     */
    const generarTextoAnexo = useCallback((original, cambios, nuevasClausulas) => {
        // No genera nada si el original no se ha cargado
        if (!original) return "";

        let anexoTexto = `--- PREVISUALIZACIÓN DEL ANEXO DE CONTRATO ---\n\n`;
        anexoTexto += `ANEXO AL CONTRATO DE TRABAJO\n`;
        anexoTexto += `TRABAJADOR: ${original.nombreTrabajador} (RUT: ${original.rutTrabajador})\n`;
        anexoTexto += `EMPRESA: ${original.nombreEmpresa || 'Empresa Ficticia S.A. (MOCK)'}\n`; // (Añadido)
        anexoTexto += `FECHA DEL ANEXO: ${new Date().toLocaleDateString('es-CL')}\n\n`;
        anexoTexto += `MOTIVO DEL ANEXO: ${cambios.motivoAnexo || '(Por favor, complete el motivo)'}\n\n`;

        anexoTexto += `========================================\n`;
        anexoTexto += `1. MODIFICACIONES ACORDADAS\n`;
        anexoTexto += `========================================\n\n`;

        // 💡 Normalizamos los valores originales (undefined o null -> '' o '0')
        const cargoOriginal = original.cargoTrabajador || '';
        const lugarOriginal = original.lugarTrabajo || '';
        const domicilioOriginal = original.domicilioTrabajador || '';
        const sueldoOriginal = original.sueldo?.toString() || '0';
        const gratificacionOriginal = original.gratificacionLegal?.toString() || '0';
        const asignacionesOriginal = original.asignaciones?.toString() || '0';

        let modificaciones = [];

        // Comparamos los valores normalizados con los cambios del formulario
        if (cargoOriginal !== cambios.cargoTrabajador) {
            modificaciones.push(`- El Cargo del trabajador se modifica a: "${cambios.cargoTrabajador}" (anterior: "${cargoOriginal}")`);
        }
        if (lugarOriginal !== cambios.lugarTrabajo) {
            modificaciones.push(`- El Lugar de Trabajo se modifica a: "${cambios.lugarTrabajo}" (anterior: "${lugarOriginal}")`);
        }
        if (domicilioOriginal !== cambios.domicilioTrabajador) {
            modificaciones.push(`- El Domicilio del Trabajador se modifica a: "${cambios.domicilioTrabajador}" (anterior: "${domicilioOriginal}")`);
        }

        // Comparamos los sueldos
        if (sueldoOriginal !== cambios.sueldo) {
            modificaciones.push(`- El Sueldo Base se modifica a: $${parseFloat(cambios.sueldo || 0).toLocaleString('es-CL')} (anterior: $${parseFloat(sueldoOriginal).toLocaleString('es-CL')})`);
        }
        if (gratificacionOriginal !== cambios.gratificacionLegal) {
            modificaciones.push(`- La Gratificación Legal se modifica a: $${parseFloat(cambios.gratificacionLegal || 0).toLocaleString('es-CL')} (anterior: $${parseFloat(gratificacionOriginal).toLocaleString('es-CL')})`);
        }
        if (asignacionesOriginal !== cambios.asignaciones) {
            modificaciones.push(`- Las Asignaciones se modifica a: $${parseFloat(cambios.asignaciones || 0).toLocaleString('es-CL')} (anterior: $${parseFloat(asignacionesOriginal).toLocaleString('es-CL')})`);
        }

        if (modificaciones.length > 0) {
            anexoTexto += modificaciones.join('\n');
        } else {
            anexoTexto += "(No se han detectado modificaciones en los campos principales)\n";
        }

        anexoTexto += `\n\n========================================\n`;
        anexoTexto += `2. NUEVAS CLÁUSULAS AÑADIDAS\n`;
        anexoTexto += `========================================\n\n`;

        if (nuevasClausulas.length > 0) {
            const textoClausulas = nuevasClausulas
                .map(c => `${c.titulo.toUpperCase()}:\n${c.contenido}`)
                .join('\n\n');
            anexoTexto += textoClausulas;
        } else {
            anexoTexto += "(No se agregan cláusulas nuevas en este anexo)\n";
        }

        anexoTexto += `\n\n--- FIN DE LA PREVISUALIZACIÓN ---`;
        return anexoTexto;

    }, []);

    /**
     * 💡 (NUEVO EFECTO)
     * Actualiza el preview en tiempo real cuando cambian los datos.
     */
    useEffect(() => {
        // Llama a la función generadora con los estados actuales
        const textoGenerado = generarTextoAnexo(
            contratoOriginal,
            camposEditables,
            clausulasNuevas
        );

        setTextoFinalPreview(textoGenerado);

    }, [contratoOriginal, camposEditables, clausulasNuevas, generarTextoAnexo]);

    // --- RENDERIZADO ---
    if (isLoading) {
        return <Container className="text-center my-5"><Spinner animation="border" /> Cargando datos del contrato...</Container>;
    }

    if (message.type === 'danger' && !contratoOriginal) {
        return <Container><Alert variant="danger">{message.text}</Alert></Container>
    }

    if (!contratoOriginal) {
        return <Container><Alert variant="warning">No se encontró el contrato.</Alert></Container>
    }

    return (
        <Container fluid>
            <Form onSubmit={handleSubmit}>
                <Card className="p-4">
                    <Card.Title as="h1" className="h3 mb-4">
                        Crear Anexo de Contrato
                    </Card.Title>

                    {message.text && (
                        <Alert variant={message.type} onClose={() => setMessage({ type: '', text: '' })} dismissible>
                            {message.text}
                        </Alert>
                    )}

                    {/* --- 1. DATOS TRABAJADOR (SOLO LECTURA) --- */}
                    <Card border="secondary" className="mb-4">
                        <Card.Header as="h5">Datos del Contrato Original (Solo lectura)</Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Trabajador:</Form.Label>
                                        <Form.Control type="text" value={contratoOriginal.nombreTrabajador} readOnly disabled />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>RUT:</Form.Label>
                                        <Form.Control type="text" value={contratoOriginal.rutTrabajador} readOnly disabled />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* --- 2. CAMPOS MODIFICABLES (ANEXO) --- */}
                    <Card border="primary" className="mb-4">
                        <Card.Header as="h5">Campos a Modificar (Anexo)</Card.Header>
                        <Card.Body>
                            <Row className="g-3">
                                <Col md={12}>
                                    <Form.Group controlId="motivoAnexo">
                                        <Form.Label>Motivo del Anexo:</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="motivoAnexo"
                                            value={camposEditables.motivoAnexo}
                                            onChange={handleChange}
                                            placeholder="Ej: Modificación de sueldo y cargo"
                                            required
                                        />
                                        <Form.Text>Este campo es obligatorio.</Form.Text>
                                    </Form.Group>
                                </Col>
                                <hr className="my-3" />
                                <Col md={6}>
                                    <Form.Group controlId="cargoTrabajador">
                                        <Form.Label>Cargo:</Form.Label>
                                        <Form.Control type="text" name="cargoTrabajador" value={camposEditables.cargoTrabajador} onChange={handleChange} />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group controlId="lugarTrabajo">
                                        <Form.Label>Lugar de Trabajo:</Form.Label>
                                        <Form.Control type="text" name="lugarTrabajo" value={camposEditables.lugarTrabajo} onChange={handleChange} />
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group controlId="domicilioTrabajador">
                                        <Form.Label>Domicilio Trabajador:</Form.Label>
                                        <Form.Control type="text" name="domicilioTrabajador" value={camposEditables.domicilioTrabajador} onChange={handleChange} />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group controlId="sueldo">
                                        <Form.Label>Sueldo Base ($):</Form.Label>
                                        <Form.Control type="number" name="sueldo" value={camposEditables.sueldo} onChange={handleChange} min="0" />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group controlId="gratificacionLegal">
                                        <Form.Label>Gratificación Legal ($):</Form.Label>
                                        <Form.Control type="number" name="gratificacionLegal" value={camposEditables.gratificacionLegal} onChange={handleChange} min="0" />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group controlId="asignaciones">
                                        <Form.Label>Asignaciones ($):</Form.Label>
                                        <Form.Control type="number" name="asignaciones" value={camposEditables.asignaciones} onChange={handleChange} min="0" />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* --- 3. CLÁUSULAS ORIGINALES (SOLO LECTURA) --- */}
                    <div className="mb-4">
                        <h2 className="h5 mb-3">Cláusulas del Contrato Original (Solo lectura)</h2>
                        <div className="p-3 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
                            {contratoOriginal.clausulasAdicionales && contratoOriginal.clausulasAdicionales.length > 0 ? (
                                contratoOriginal.clausulasAdicionales.map((clausula, index) => (
                                    <Card key={clausula.id || index} className="mb-2 bg-light">
                                        <Card.Body className="py-2 px-3">
                                            <h6 className="card-title fw-bold mb-1">{clausula.titulo}</h6>
                                            <p className="card-text small mb-0">{clausula.contenido}</p>
                                        </Card.Body>
                                    </Card>
                                ))
                            ) : (
                                <Alert variant="secondary" className="mb-0">El contrato original no tiene cláusulas adicionales.</Alert>
                            )}
                        </div>
                    </div>

                    {/* --- 4. NUEVAS CLÁUSULAS (PARA ESTE ANEXO) --- */}
                    <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h2 className="h5 mb-0">Cláusulas Nuevas (para este Anexo)</h2>
                            <Button type="button" variant="secondary" onClick={handleOpenModal}>
                                <i className="bi bi-plus-circle-fill"></i> Agregar Cláusula
                            </Button>
                        </div>
                        <div className="p-3 border rounded">
                            {clausulasNuevas.length === 0 ? (
                                <Alert variant="info" className="mb-0">No se han agregado cláusulas nuevas a este anexo.</Alert>
                            ) : (
                                clausulasNuevas.map((clausula, index) => (
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

                    {/* --- 5. PREVIEW ANEXO (NUEVO) --- */}
                    <Card className="mt-4">
                        <Card.Header as="h5">Previsualización del Documento de Anexo</Card.Header>
                        <Card.Body>
                            <Form.Control
                                as="textarea"
                                rows={15}
                                value={textoFinalPreview}
                                readOnly
                                placeholder="Complete el motivo del anexo para generar la previsualización..."
                                // 💡 'pre-wrap' es importante para respetar los saltos de línea (\n)
                                style={{ fontSize: '0.8em', backgroundColor: '#f8f9fa', whiteSpace: 'pre-wrap' }}
                            />
                        </Card.Body>
                    </Card>

                    {/* --- Botón Guardar Anexo --- */}
                    <div className="text-end">
                        <Button type="submit" variant="primary" disabled={isSubmitting}>
                            {isSubmitting ? <Spinner as="span" size="sm" /> : <i className="bi bi-save-fill"></i>}
                            {' '}Guardar Anexo
                        </Button>
                    </div>

                </Card>
            </Form>

            {/* --- Modal Agregar Cláusula (Idéntico a CrearContrato) --- */}
            <Modal show={showClausulaModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Seleccionar Cláusula Nueva</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="selectClausulaModal">
                        <Form.Label>Cláusula Disponible:</Form.Label>
                        <Form.Select
                            value={selectedClausulaToAdd}
                            onChange={(e) => setSelectedClausulaToAdd(e.target.value)}
                        >
                            <option value="">Seleccione una cláusula...</option>
                            {clausulasDisponiblesApi.map((opt) => (
                                <option key={opt.id} value={opt.id}>
                                    {opt.titulo}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    {selectedClausulaToAdd && (
                        <Card className="mt-3">
                            <Card.Body>
                                <Card.Subtitle className="mb-2 text-muted">Contenido:</Card.Subtitle>
                                <Card.Text style={{ fontSize: '0.9em', whiteSpace: 'pre-wrap' }}>
                                    {clausulasDisponiblesApi.find(c => c.id.toString() === selectedClausulaToAdd)?.contenido}
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

export default CrearAnexo;