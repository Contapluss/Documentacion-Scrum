// src/components/common/SocioItem.jsx
import React from 'react';
import { Row, Col, Form, Button, Card } from 'react-bootstrap';

// Este componente SÍ usa 'titulo' y 'reglas'
const SocioItem = ({ index, socio, handleChange, handleRemove, titulo, reglas }) => {
    
    // Lógica para deshabilitar acciones si no aplica (ej: EIRL, Limitada)
    const isAccionesDisabled = reglas && reglas.acciones === false;

    // Los nombres (name="") coinciden con el estado 'socios'
    // y el 'onChange' coincide con 'handleDynamicListChange'
    return (
        <Card className="socio-item mb-3 p-3 position-relative">
            <Button
                variant="danger"
                size="sm"
                onClick={() => handleRemove(index)}
                className="position-absolute top-0 end-0 m-2"
                title="Eliminar Socio"
            >
                <i className="bi bi-x-lg"></i>
            </Button>
            
            <h6 className="fw-bold border-bottom pb-2 mb-3">
                {titulo} {/* Muestra "Socio 1", "Socio 2"... */}
            </h6>

            <Row className="g-3">
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Nombre del Socio</Form.Label>
                        <Form.Control
                            type="text"
                            name="nombre_socio"
                            value={socio.nombre_socio || ''}
                            onChange={(e) => handleChange('socios', index, e)}
                            required
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>RUT del Socio</Form.Label>
                        <Form.Control
                            type="text"
                            name="rut_socio"
                            value={socio.rut_socio || ''}
                            onChange={(e) => handleChange('socios', index, e)}
                            required
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Participación (%)</Form.Label>
                        <Form.Control
                            type="number"
                            name="participacion_socio"
                            value={socio.participacion_socio || ''}
                            onChange={(e) => handleChange('socios', index, e)}
                            min="0" max="100" step="0.01" required
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Cantidad de Acciones</Form.Label>
                        <Form.Control
                            type="number"
                            name="acciones_socio"
                            value={socio.acciones_socio || ''}
                            onChange={(e) => handleChange('socios', index, e)}
                            min="0"
                            readOnly={isAccionesDisabled}
                            placeholder={isAccionesDisabled ? 'No aplica' : 'N° de acciones'}
                            className={isAccionesDisabled ? 'bg-light' : ''}
                        />
                    </Form.Group>
                </Col>
            </Row>
        </Card>
    );
};

export default SocioItem;