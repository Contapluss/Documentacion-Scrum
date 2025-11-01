// src/pages/Contratos/ListarContratos.jsx (ACTUALIZADO)

import React, { useState } from 'react'; // 💡 useEffect ya no es necesario
import { Container, Card, Table, Button, Spinner, Alert, Form, Row, Col } from 'react-bootstrap'; // 💡 Añadido Form, Row, Col
import { useNavigate } from 'react-router-dom';
import { listarContratos } from '../../services/api.contrato';

// Token de ejemplo
const FAKE_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

function ListarContratos() {
    // --- MODIFICADO: Estados ---
    const [contratos, setContratos] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // Inicia en false
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // --- NUEVO: Estado para búsqueda ---
    const [searchParams, setSearchParams] = useState({ rut: '', cargo: '' });
    const [hasSearched, setHasSearched] = useState(false); // Para saber si ya se buscó

    // --- ELIMINADO: useEffect de carga inicial ---
    // (El useEffect que llamaba a cargarContratos() se ha eliminado)

    // --- NUEVO: Manejador para inputs de búsqueda ---
    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({ ...prev, [name]: value }));
    };

    // --- NUEVO: Manejador para el submit de búsqueda ---
    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setContratos([]);
        setHasSearched(true); // Marcamos que se ha realizado una búsqueda
        try {
            // 💡 Llamamos a la API con los parámetros de búsqueda
            const data = await listarContratos(FAKE_TOKEN, searchParams);
            setContratos(data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // --- (Funciones handleCrearAnexo y handleVerContrato se mantienen igual) ---
    const handleCrearAnexo = (contratoId) => {
        navigate(`/contratos/crear-anexo/${contratoId}`);
    };
    const handleVerContrato = (contratoId) => {
        console.log("Navegar a ver contrato:", contratoId);
        navigate(`/contratos/ver/${contratoId}`);
    };

    // --- MODIFICADO: Lógica de renderizado ---
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="text-center my-5">
                    <Spinner animation="border" />
                    <p className="mt-2">Buscando contratos...</p>
                </div>
            );
        }

        if (error) {
            return (
                <Alert variant="danger">
                    <strong>Error:</strong> {error}
                </Alert>
            );
        }

        // MODIFICADO: Solo muestra "no encontrados" si ya se buscó
        if (contratos.length === 0 && hasSearched) {
            return (
                <Alert variant="info">
                    No se han encontrado contratos generados con esos criterios.
                </Alert>
            );
        }

        // Muestra la tabla si hay resultados
        if (contratos.length > 0) {
            return (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Trabajador</th>
                            <th>RUT</th>
                            <th>Cargo</th>
                            <th>Fecha Contrato</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contratos.map((contrato) => (
                            <tr key={contrato.id}>
                                <td>{contrato.nombreTrabajador}</td>
                                <td>{contrato.rutTrabajador}</td>
                                <td>{contrato.cargoTrabajador}</td>
                                <td>{new Date(contrato.fechaContrato).toLocaleDateString('es-CL')}</td>
                                <td>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => handleVerContrato(contrato.id)}
                                        title="Ver Contrato"
                                    >
                                        <i className="bi bi-eye-fill"></i> Ver
                                    </Button>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => handleCrearAnexo(contrato.id)}
                                        title="Crear Anexo"
                                    >
                                        <i className="bi bi-file-earmark-plus-fill"></i> Crear Anexo
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            );
        }

        // NUEVO: Mensaje inicial antes de buscar
        if (!hasSearched && !isLoading && !error) {
            return <Alert variant="secondary">Por favor, utilice los filtros para buscar contratos.</Alert>
        }

        return null; // No renderiza nada si no entra en ninguna condición
    };


    return (
        <Container fluid>
            <Card className="p-4">
                <Card.Title as="h1" className="h3 mb-4">
                    Historial de Contratos Generados
                </Card.Title>

                {/* --- NUEVO: Formulario de Búsqueda --- */}
                <Form className="mb-4 p-3 border rounded" style={{ backgroundColor: '#f8f9fa' }} onSubmit={handleSearchSubmit}>
                    <Row className="g-3 align-items-end">
                        <Col md={5}>
                            <Form.Group controlId="busquedaRut">
                                <Form.Label>RUT Trabajador</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="rut"
                                    value={searchParams.rut}
                                    onChange={handleSearchChange}
                                    placeholder="Ej: 12.345.678-9"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={5}>
                            <Form.Group controlId="busquedaCargo">
                                <Form.Label>Cargo</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="cargo"
                                    value={searchParams.cargo}
                                    onChange={handleSearchChange}
                                    placeholder="Ej: Desarrollador"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={2} className="d-grid">
                            <Button type="submit" variant="primary" disabled={isLoading}>
                                {isLoading ? <Spinner as="span" size="sm" /> : 'Buscar'}
                            </Button>
                        </Col>
                    </Row>
                </Form>

                {/* --- Renderizado de resultados --- */}
                {renderContent()}

            </Card>
        </Container>
    );
}

export default ListarContratos;