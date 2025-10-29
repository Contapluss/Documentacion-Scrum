// src/pages/Clausulas/CrearClausula.jsx

import React, { useState, useRef } from 'react';
import { Container, Form, Button, Card, Alert, Spinner, Badge } from 'react-bootstrap';
import { guardarClausula } from '../../services/api.contrato'; // Ajusta la ruta
import { VARIABLES_CONTRATO } from '../Contratos/Variable_Contratos'; // Ajusta la ruta

// Token de ejemplo (debería venir de tu AuthContext)
const FAKE_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

function CrearClausula() {
    const [titulo, setTitulo] = useState('');
    const [contenido, setContenido] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const textareaRef = useRef(null); // Ref para el textarea

    /**
     * Inserta una variable en la posición actual del cursor en el textarea.
     */
    const handleInsertVariable = (variableKey) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        
        const newText = text.substring(0, start) + variableKey + text.substring(end);
        setContenido(newText);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + variableKey.length, start + variableKey.length);
        }, 0);
    };

    /**
     * Maneja el envío del formulario para guardar la cláusula.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!titulo || !contenido) {
            setMessage({ type: 'warning', text: 'Por favor, complete el título y el contenido de la cláusula.' });
            return;
        }

        setIsSubmitting(true);
        setMessage({ type: '', text: '' });
        try {
            const clausulaData = { titulo, contenido };
            const resultado = await guardarClausula(clausulaData, FAKE_TOKEN);
            setMessage({ type: 'success', text: resultado.message || '¡Cláusula guardada exitosamente!' });
            // Limpiar formulario
            setTitulo('');
            setContenido('');
        } catch (error) {
            setMessage({ type: 'danger', text: `Error al guardar cláusula: ${error.message}` });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container fluid>
            <Card className="p-4">
                <Card.Title as="h1" className="h3 mb-4">Crear Nueva Cláusula Reutilizable</Card.Title>

                {message.text && (
                    <Alert variant={message.type} onClose={() => setMessage({ type: '', text: '' })} dismissible>
                        {message.text}
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    {/* Título de la Cláusula */}
                    <Form.Group className="mb-3" controlId="tituloClausula">
                        <Form.Label>Título de la Cláusula:</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Ej: Cláusula de Confidencialidad"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            required
                        />
                    </Form.Group>

                    {/* Variables Disponibles (Botonera) */}
                    <Form.Group className="mb-3" controlId="variablesDisponibles">
                        <Form.Label>Variables Disponibles (clic para insertar):</Form.Label>
                        <div className="p-3 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
                            {VARIABLES_CONTRATO.map((variable) => (
                                <Badge
                                    key={variable.key}
                                    pill
                                    bg="secondary"
                                    as="button"
                                    type="button"
                                    className="me-2 mb-2"
                                    onClick={() => handleInsertVariable(variable.key)}
                                    title={`Insertar ${variable.key}`}
                                >
                                    {variable.label}
                                </Badge>
                            ))}
                        </div>
                    </Form.Group>

                    {/* Contenido de la Cláusula */}
                    <Form.Group className="mb-3" controlId="contenidoClausula">
                        <Form.Label>Contenido de la Cláusula:</Form.Label>
                        <Form.Control
                            as="textarea"
                            ref={textareaRef} // Asignamos la ref
                            rows={10}
                            placeholder="Escribe el contenido de la cláusula aquí..."
                            value={contenido}
                            onChange={(e) => setContenido(e.target.value)}
                            required
                        />
                    </Form.Group>

                    {/* Botón Guardar */}
                    <div className="text-end">
                        <Button type="submit" variant="primary" disabled={isSubmitting}>
                            {isSubmitting ? <Spinner as="span" size="sm" /> : 'Guardar Cláusula'}
                        </Button>
                    </div>
                </Form>
            </Card>
        </Container>
    );
}

export default CrearClausula;