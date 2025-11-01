// src/pages/Plantillas/CrearPlantilla.jsx

import React, { useState, useRef } from 'react';
import { Container, Form, Button, Card, Alert, Spinner, Badge } from 'react-bootstrap';
import { guardarPlantilla } from '../../services/api.contrato'; // Ajusta la ruta
import { VARIABLES_CONTRATO } from './Variable_Contratos'; // Ajusta la ruta

// Token de ejemplo (debería venir de tu AuthContext)
const FAKE_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

function CrearPlantilla() {
    const [nombre, setNombre] = useState('');
    const [cuerpo, setCuerpo] = useState('');
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

        // Inserta la variable y mueve el cursor al final de la variable insertada
        const newText = text.substring(0, start) + variableKey + text.substring(end);
        setCuerpo(newText);

        // Actualiza el foco y la posición del cursor
        // Usamos setTimeout para asegurar que el DOM se actualice antes de mover el cursor
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + variableKey.length, start + variableKey.length);
        }, 0);
    };

    /**
     * Maneja el envío del formulario para guardar la plantilla.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nombre || !cuerpo) {
            setMessage({ type: 'warning', text: 'Por favor, complete el nombre y el cuerpo de la plantilla.' });
            return;
        }

        setIsSubmitting(true);
        setMessage({ type: '', text: '' });
        try {
            const plantillaData = { nombre, cuerpo };
            const resultado = await guardarPlantilla(plantillaData, FAKE_TOKEN);
            setMessage({ type: 'success', text: resultado.message || '¡Plantilla guardada exitosamente!' });
            // Limpiar formulario
            setNombre('');
            setCuerpo('');
        } catch (error) {
            setMessage({ type: 'danger', text: `Error al guardar plantilla: ${error.message}` });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container fluid>
            <Card className="p-4">
                <Card.Title as="h1" className="h3 mb-4">Crear Nueva Plantilla de Contrato</Card.Title>

                {message.text && (
                    <Alert variant={message.type} onClose={() => setMessage({ type: '', text: '' })} dismissible>
                        {message.text}
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    {/* Nombre de la Plantilla */}
                    <Form.Group className="mb-3" controlId="nombrePlantilla">
                        <Form.Label>Nombre de la Plantilla:</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Ej: Contrato Plazo Fijo"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
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
                                    type="button" // Evita que envíe el formulario
                                    className="me-2 mb-2"
                                    onClick={() => handleInsertVariable(variable.key)}
                                    title={`Insertar ${variable.key}`}
                                >
                                    {variable.label}
                                </Badge>
                            ))}
                        </div>
                    </Form.Group>

                    {/* Cuerpo de la Plantilla */}
                    <Form.Group className="mb-3" controlId="cuerpoPlantilla">
                        <Form.Label>Cuerpo de la Plantilla:</Form.Label>
                        <Form.Control
                            as="textarea"
                            ref={textareaRef} // Asignamos la ref
                            rows={15}
                            placeholder="Escribe el contrato aquí... usa las variables."
                            value={cuerpo}
                            onChange={(e) => setCuerpo(e.target.value)}
                            required
                        />
                        <Form.Text>
                            Ej: "En {'{ciudadFirma}'}, a {'{fechaContrato}'}, entre {'{nombreEmpresa}'} RUT {'{rutEmpresa}'}..."
                        </Form.Text>
                    </Form.Group>

                    {/* Botón Guardar */}
                    <div className="text-end">
                        <Button type="submit" variant="primary" disabled={isSubmitting}>
                            {isSubmitting ? <Spinner as="span" size="sm" /> : 'Guardar Plantilla'}
                        </Button>
                    </div>
                </Form>
            </Card>
        </Container>
    );
}

export default CrearPlantilla;