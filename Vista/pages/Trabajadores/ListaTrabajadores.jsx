// src/pages/Trabajadores/ListaTrabajadores.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Container,
    Form,
    Row,
    Col,
    Button,
    Card,
    ListGroup,
    Spinner,
    Alert
} from 'react-bootstrap';

// 💡 Asumiré que agregarás la función 'buscarTrabajadores' al archivo api.trabajador.js
import { buscarTrabajadores } from '../../services/api.trabajador';

// DATOS FALSOS (Igual que en DatosTrabajador.jsx)
const FAKE_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

function ListaTrabajadores() {
    // --- ESTADOS ---
    // Estado para los campos del formulario de búsqueda
    const [searchParams, setSearchParams] = useState({
        nombre: '',
        rut: '',
        cargo: ''
    });
    // Estado para guardar los resultados de la API
    const [resultados, setResultados] = useState([]);
    // Estado para mostrar un spinner mientras busca
    const [isLoading, setIsLoading] = useState(false);
    // Estado para mensajes (ej: "No se encontraron resultados")
    const [message, setMessage] = useState({ type: '', text: '' });

    // --- MANEJADORES ---

    /**
     * Actualiza el estado de los parámetros de búsqueda cada vez
     * que el usuario escribe en un campo.
     */
    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({
            ...prev,
            [name]: value
        }));
    };

    /**
     * Se ejecuta al presionar el botón "Buscar".
     * Llama a la API con los parámetros de búsqueda.
     */
    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setResultados([]); // Limpia resultados anteriores

        try {
            // 1. Llama a la función de la API (que crearás en el paso 2)
            const data = await buscarTrabajadores(searchParams, FAKE_TOKEN);

            // 2. Procesa la respuesta
            if (data && data.length > 0) {
                setResultados(data);
            } else {
                setMessage({ type: 'info', text: 'No se encontraron trabajadores con esos criterios.' });
            }
        } catch (error) {
            setMessage({ type: 'danger', text: `Error al buscar: ${error.message}` });
        } finally {
            setIsLoading(false);
        }
    };

    // --- RENDERIZADO ---
    return (
        // 1. CAMBIO: Usa Container fluid y quita py-4
        <Container fluid> 
            {/* 2. Quita mt-4 del div si ya no es necesario */}
            {/* Si el div solo agrupa, puedes eliminarlo */}
            {/* <div id="busquedaTrabajador"> */} 
                
                {/* Título con margen inferior */}
                <h2 className="mb-4">Buscar Trabajador</h2> 

                {/* --- Formulario de Búsqueda --- */}
                {/* 3. Quita mt-4 del Form, añade margen inferior si es necesario */}
                <Form className="mb-4" onSubmit={handleSearchSubmit}> 
                    <Row className="g-3 align-items-end"> {/* g-3 para espaciado */}
                        <Col md={4}>
                            <Form.Group controlId="busquedaNombre">
                                <Form.Label>Nombre</Form.Label> {/* Quita mb-0 si usas g-3 */}
                                <Form.Control
                                    type="text"
                                    name="nombre"
                                    value={searchParams.nombre}
                                    onChange={handleSearchChange}
                                    placeholder="Nombre"
                                />
                            </Form.Group>
                        </Col>
                        {/* ... Col para RUT ... */}
                         <Col md={4}>
                            <Form.Group controlId="busquedaRut">
                                <Form.Label>RUT</Form.Label>
                                <Form.Control /* ... */ />
                            </Form.Group>
                        </Col>
                        {/* ... Col para Cargo ... */}
                         <Col md={4}>
                            <Form.Group controlId="busquedaCargo">
                                <Form.Label>Cargo</Form.Label>
                                <Form.Control /* ... */ />
                            </Form.Group>
                        </Col>
                        {/* Botón Buscar */}
                        {/* Ajuste responsivo y estilo */}
                        <Col xs={12} md="auto" className="mt-3 mt-md-0 d-grid"> 
                            <Button type="submit" variant="primary" disabled={isLoading}> 
                                {isLoading ? <Spinner as="span" size="sm" /> : <i className="bi bi-search"></i>}
                                {' '}Buscar
                            </Button>
                        </Col>
                    </Row>
                </Form>

                {/* --- Resultados de Búsqueda --- */}
                <h3 className="card-title h3 mt-4">Lista de trabajadores</h3>

                <Card className="p-4 card-solicitud mt-2">
                    <div id="resultadosBusqueda" className="mt-3">

                        {/* Muestra el spinner mientras carga */}
                        {isLoading && (
                            <div className="text-center">
                                <Spinner animation="border" />
                                <p>Buscando...</p>
                            </div>
                        )}

                        {/* Muestra mensajes de error o "no encontrado" */}
                        {message.text && !isLoading && (
                            <Alert variant={message.type}>{message.text}</Alert>
                        )}

                        {/* Muestra la lista de resultados */}
                        {!isLoading && resultados.length > 0 && (
                            <ListGroup>
                                {resultados.map(trabajador => (
                                    // 💡 AQUÍ ESTÁ LA MAGIA:
                                    // Cada item es un <Link> que redirige a la página de detalle
                                    // con el ID del trabajador en la URL.
                                    <ListGroup.Item
                                        action
                                        as={Link}
                                        to={`/Datos-Trabajador/${trabajador.id}`}
                                        key={trabajador.id}
                                    >
                                        {/* Asumo que tu API devuelve estos campos */}
                                        <strong>{trabajador.nombres} {trabajador.apellidoPaterno}</strong>
                                        <br />
                                        <small className="text-muted">RUT: {trabajador.rut} - Cargo: {trabajador.cargo}</small>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}

                    </div>
                </Card>
        </Container>
    );
}

export default ListaTrabajadores;