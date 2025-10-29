import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Button, Card, InputGroup, Alert, Spinner } from 'react-bootstrap';
import { authService } from '../../services/auth.service';

function RecoverPasswordPage() {
    const [formData, setFormData] = useState({
        email: '',
        nuevaPassword: '',
        confirmarPassword: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError(null);
        setSuccessMessage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isLoading) return;
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (formData.nuevaPassword !== formData.confirmarPassword) {
            setError("Las nuevas contraseñas no coinciden.");
            setIsLoading(false);
            return;
        }

        try {
            const apiData = {
                email: formData.email,
                password: formData.nuevaPassword, 
                confirm_password: formData.confirmarPassword,
            };

            // Llamada al servicio (Asegúrate de que esta función exista en auth.service.js)
            await authService.recoverPassword(apiData); 
            
            setSuccessMessage("¡Contraseña actualizada con éxito! Ahora puedes iniciar sesión.");
            setFormData({ email: '', nuevaPassword: '', confirmarPassword: '' });

        } catch (err) {
            console.error("Error al recuperar:", err.message);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // El contenedor principal mantiene el estilo de centrado de tu HTML original
        <div className="content d-flex justify-content-center align-items-center login-bg position-relative">
            <div className="login-bg-logo"></div>
            
            {/* Usamos el componente Card de React-Bootstrap */}
            <Card className="p-4 shadow-lg position-relative" style={{ maxWidth: '450px', width: '100%', borderRadius: '1rem', zIndex: 1 }}>
                
                <Card.Body>
                    <div className="text-center mb-4">
                        <h2 className="fw-bold" style={{ color: 'var(--color-primario)' }}>Recuperar Contraseña</h2>
                        <p className="text-muted mb-0">Ingresa tu correo y crea una nueva contraseña</p>
                    </div>

                    {/* Mensajes de Estado: Usando el componente Alert de React-Bootstrap */}
                    {error && <Alert variant="danger">{error}</Alert>}
                    {successMessage && <Alert variant="success">{successMessage}</Alert>}

                    {/* Usamos el componente Form de React-Bootstrap */}
                    <Form id="recuperarForm" onSubmit={handleSubmit}>
                        
                        {/* Campo de Correo Electrónico */}
                        <Form.Group className="mb-3">
                            <Form.Label>Correo Electrónico</Form.Label>
                            <InputGroup>
                                <InputGroup.Text><i className="bi bi-envelope"></i></InputGroup.Text>
                                <Form.Control 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required 
                                />
                            </InputGroup>
                        </Form.Group>

                        {/* Campo Nueva Contraseña */}
                        <Form.Group className="mb-3">
                            <Form.Label>Nueva Contraseña</Form.Label>
                            <InputGroup>
                                <InputGroup.Text><i className="bi bi-lock"></i></InputGroup.Text>
                                <Form.Control 
                                    type="password" 
                                    name="nuevaPassword"
                                    value={formData.nuevaPassword}
                                    onChange={handleChange}
                                    required 
                                />
                            </InputGroup>
                        </Form.Group>

                        {/* Campo Confirmar Nueva Contraseña */}
                        <Form.Group className="mb-3">
                            <Form.Label>Confirmar Nueva Contraseña</Form.Label>
                            <InputGroup>
                                <InputGroup.Text><i className="bi bi-shield-lock"></i></InputGroup.Text>
                                <Form.Control 
                                    type="password" 
                                    name="confirmarPassword"
                                    value={formData.confirmarPassword}
                                    onChange={handleChange}
                                    required 
                                />
                            </InputGroup>
                        </Form.Group>
                        
                        {/* Botón de Envío: Usando el componente Button de React-Bootstrap */}
                        <Button 
                            variant="primary" 
                            type="submit" 
                            className="w-100"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Actualizando...
                                </>
                            ) : (
                                "Actualizar Contraseña"
                            )}
                        </Button>
                        
                        {/* Enlace para volver al login (usando Link de React Router) */}
                        <Link to="/" className='btn btn-outline-secondary w-100 mt-2'>
                            Volver al Login
                        </Link>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
}

export default RecoverPasswordPage;