// src/pages/Contratos/VerContrato.jsx

import React, { useState, useEffect } from 'react';
import { Container, Card, Spinner, Alert, Button, Form, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerContratoPorId } from '../../services/api.contrato';

// Token de ejemplo
const FAKE_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

function VerContrato() {
    const { contratoId } = useParams();
    const navigate = useNavigate();
    const [contrato, setContrato] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const cargarContrato = async () => {
            setIsLoading(true);
            setMessage({ type: '', text: '' });
            try {
                // Usamos la misma función que 'CrearAnexo' para cargar los datos
                const data = await obtenerContratoPorId(contratoId, FAKE_TOKEN);
                setContrato(data);
            } catch (error) {
                setMessage({ type: 'danger', text: `Error cargando contrato: ${error.message}` });
            } finally {
                setIsLoading(false);
            }
        };

        cargarContrato();
    }, [contratoId]);

    // --- Renderizado ---

    if (isLoading) {
        return <Container className="text-center my-5"><Spinner animation="border" /> Cargando contrato...</Container>;
    }

    if (message.text) {
        return <Container><Alert variant={message.type}>{message.text}</Alert></Container>;
    }

    if (!contrato) {
        return <Container><Alert variant="warning">No se encontró el contrato.</Alert></Container>;
    }

    // Si todo está bien, muestra los detalles
    return (
        <Container fluid>
            <Card className="p-4">
                <Card.Title as="h1" className="h3 mb-4">
                    Detalle del Contrato (ID: {contrato.id})
                </Card.Title>

                {/* --- Datos Principales --- */}
                <Card border="secondary" className="mb-4">
                    <Card.Header as="h5">Datos del Trabajador</Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Trabajador:</Form.Label>
                                    <Form.Control type="text" value={contrato.nombreTrabajador} readOnly disabled />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>RUT:</Form.Label>
                                    <Form.Control type="text" value={contrato.rutTrabajador} readOnly disabled />
                                </Form.Group>
                            </Col>
                            <Col md={6} className="mt-3">
                                <Form.Group>
                                    <Form.Label>Cargo:</Form.Label>
                                    <Form.Control type="text" value={contrato.cargoTrabajador} readOnly disabled />
                                </Form.Group>
                            </Col>
                             <Col md={6} className="mt-3">
                                <Form.Group>
                                    <Form.Label>Sueldo Base:</Form.Label>
                                    <Form.Control type="text" value={`$${(contrato.sueldo || 0).toLocaleString('es-CL')}`} readOnly disabled />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* --- Texto Final Generado --- */}
                <Card border="primary">
                     <Card.Header as="h5">Texto Final del Contrato</Card.Header>
                     <Card.Body>
                        <Form.Control
                            as="textarea"
                            rows={20}
                            value={contrato.textoGenerado}
                            readOnly
                            disabled
                            style={{fontSize: '0.8em', backgroundColor: '#f8f9fa'}}
                        />
                     </Card.Body>
                </Card>

                <div className="text-start mt-4">
                    <Button variant="secondary" onClick={() => navigate('/contratos')}>
                        <i className="bi bi-arrow-left-circle-fill"></i> Volver a la Lista
                    </Button>
                </div>
            </Card>
        </Container>
    );
}

export default VerContrato;