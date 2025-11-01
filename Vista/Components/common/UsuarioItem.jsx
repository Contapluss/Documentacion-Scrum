// src/components/common/UsuarioItem.jsx
import React, { useState } from 'react';
import { Row, Col, Form, Button, Card, InputGroup } from 'react-bootstrap';
// 💡 NOTA: No necesitas 'Select' aquí, se manejará en DatosEmpresa

const UsuarioItem = ({ index, usuario, handleChange, handleRemove }) => {
    const [showPassword, setShowPassword] = useState(false);

    // Los nombres de los campos (name="") ahora coinciden 
    // con el estado 'usuarios' en DatosEmpresa.jsx
    // y el 'onChange' coincide con la firma de 'handleUsuarioChange'

    return (
        <Card className="usuario-item border rounded p-3 mb-3 position-relative">
            <h6 className="fw-bold border-bottom pb-2">
                Usuario {index + 1}
                <Button
                    variant="outline-danger"
                    size="sm"
                    className="btn-close position-absolute top-0 end-0 m-2"
                    aria-label="Eliminar Usuario"
                    onClick={() => handleRemove(index)}
                />
            </h6>
            <Row className="g-3">
                <Col md={4}>
                    <Form.Label>Nombres</Form.Label>
                    <Form.Control 
                        type="text" 
                        name="nombres" // Corregido
                        value={usuario.nombres} 
                        onChange={(e) => handleChange(index, e)} // Corregido
                        required 
                    />
                </Col>
                <Col md={4}>
                    <Form.Label>Primer Apellido</Form.Label>
                    <Form.Control 
                        type="text" 
                        name="primerApellido" // Corregido
                        value={usuario.primerApellido} 
                        onChange={(e) => handleChange(index, e)} // Corregido
                        required 
                    />
                </Col>
                <Col md={4}>
                    <Form.Label>Segundo Apellido</Form.Label>
                    <Form.Control 
                        type="text" 
                        name="segundoApellido" // Corregido
                        value={usuario.segundoApellido} 
                        onChange={(e) => handleChange(index, e)} // Corregido
                    />
                </Col>
                <Col md={6}>
                    <Form.Label>RUT</Form.Label>
                    <Form.Control 
                        type="text" 
                        name="rut" 
                        value={usuario.rut} 
                        onChange={(e) => handleChange(index, e)} // Corregido
                        required 
                    />
                </Col>
                <Col md={6}>
                    <Form.Label>Correo Electrónico</Form.Label>
                    <Form.Control 
                        type="email" 
                        name="correo" // Corregido
                        value={usuario.correo} 
                        onChange={(e) => handleChange(index, e)} // Corregido
                        required 
                    />
                </Col>
                <Col md={6}>
                    <Form.Label>Contraseña</Form.Label>
                    <InputGroup>
                        <Form.Control
                            type={showPassword ? 'text' : 'password'}
                            name="clave" // Corregido
                            value={usuario.clave}
                            onChange={(e) => handleChange(index, e)} // Corregido
                            required
                        />
                        <Button
                            variant="outline-secondary"
                            onClick={() => setShowPassword(s => !s)}
                        >
                            <i className={showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'}></i>
                        </Button>
                    </InputGroup>
                </Col>
                <Col md={6}>
                    <Form.Label>Rol</Form.Label>
                    <Form.Select 
                        name="rol" // Corregido
                        value={usuario.rol} 
                        onChange={(e) => handleChange(index, e)} // Corregido
                        required
                    >
                        <option value="">Seleccione un rol</option>
                        <option value="Admin">Administrador</option>
                        <option value="Usuario">Usuario</option>
                        <option value="Contador">Contador</option>
                    </Form.Select>
                </Col>
            </Row>
        </Card>
    );
};

export default UsuarioItem;