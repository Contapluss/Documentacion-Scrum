import React, { useState } from "react";
import { Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { authService } from "../../services/auth.service";
import { validarPassword } from "../../utils/validators";

function RegisterForm({ onSwitchToLogin }) { // Asegúrate de recibir onSwitchToLogin
    // NOTA: Aquí iría la lógica de estado para el registro
    // 1. Estado para manejar todos los inputs del formulario
    const [formData, setFormData] = useState({
        nombresRegister: '',
        ApellidoPaternoRegister: '',
        ApellidoMaternoRegister: '',
        email: '',
        passwordRegister: '',
        confirmPassword: '',
    });
    // Estado para la interfaz (carga y errores)
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Función para actualizar el estado cuando se escribe
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError(null); // Limpiar error al escribir
    };

    // 2. Función para manejar el envío y llamar al servicio
    const handleCreateAccount = async (e) => {
        e.preventDefault();

        if (isLoading) return;
        setIsLoading(true);
        setError(null);

        // **Validación de Contraseñas**
        if (formData.passwordRegister !== formData.confirmPassword) {
            setError("Las contraseñas no coinciden.");
            setIsLoading(false);
            return;
        }

        // **Validación 2: Fortaleza de Contraseña**
        // ¡Esta línea funciona exactamente igual que antes!
        if (!validarPassword(formData.passwordRegister)) {
            setError("La contraseña no es válida. Debe tener 8-20 caracteres, 1 mayúscula, 1 minúscula y 1 número.");
            setIsLoading(false);
            return;
        }

        try {
            // **Mapeo de datos para la API** (FastAPI espera estos nombres)
            const apiData = {
                name: formData.nombresRegister,
                paternal_surname: formData.ApellidoPaternoRegister,
                maternal_surname: formData.ApellidoMaternoRegister,
                email: formData.email,
                password: formData.passwordRegister,
            };

            console.log('Enviando datos al servidor:', apiData); // Debug

            // Llama al servicio de autenticación
            await authService.register(apiData);
            console.log('Respuesta del servidor:', response); // Debug

            // Éxito: Muestra alerta y cambia a la pestaña de Login
            alert("Cuenta creada correctamente. Ahora inicia sesión.");
            onSwitchToLogin(); // Llama a la función del padre para cambiar la pestaña

        } catch (err) {
            console.error("Error al registrar:", err.message);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form id="registerForm" className="tab-form form-section" onSubmit={handleCreateAccount}>

            {/* Mensaje de Error: Reemplazar div.alert con Alert */}
            {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

            {/* Campo Nombres */}
            <Form.Group className="mb-3" controlId="registerNombre">
                <Form.Label>Nombres</Form.Label>
                <InputGroup>
                    <InputGroup.Text><i className="bi bi-person"></i></InputGroup.Text>
                    <Form.Control
                        type="text"
                        name="nombresRegister"
                        value={formData.nombresRegister}
                        onChange={handleChange}
                        required
                    />
                </InputGroup>
            </Form.Group>

            {/* Campo Apellido Paterno */}
            <Form.Group className="mb-3" controlId="registerApellidoPaterno">
                <Form.Label>Apellido Paterno</Form.Label>
                <InputGroup>
                    <InputGroup.Text><i className="bi bi-person"></i></InputGroup.Text>
                    <Form.Control
                        type="text"
                        name="ApellidoPaternoRegister"
                        value={formData.ApellidoPaternoRegister}
                        onChange={handleChange}
                        required
                    />
                </InputGroup>
            </Form.Group>

            {/* Campo Apellido Materno */}
            <Form.Group className="mb-3" controlId="registerApellidoMaterno">
                <Form.Label>Apellido Materno</Form.Label>
                <InputGroup>
                    <InputGroup.Text><i className="bi bi-person"></i></InputGroup.Text>
                    <Form.Control
                        type="text"
                        name="ApellidoMaternoRegister"
                        value={formData.ApellidoMaternoRegister}
                        onChange={handleChange}
                    />
                </InputGroup>
            </Form.Group>

            {/* Campo Correo Electrónico */}
            <Form.Group className="mb-3" controlId="registerEmail">
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

            {/* Campo Contraseña */}
            <Form.Group className="mb-3" controlId="registerPassword">
                <Form.Label>Contraseña</Form.Label>
                <InputGroup>
                    <InputGroup.Text><i className="bi bi-lock"></i></InputGroup.Text>
                    <Form.Control
                        type="password"
                        name="passwordRegister"
                        value={formData.passwordRegister}
                        onChange={handleChange}
                        required
                    />
                </InputGroup>
            </Form.Group>
            
            {/* Campo Confirmar Contraseña */}
            <Form.Group className="mb-3" controlId="registerConfirmPassword">
                <Form.Label>Confirmar Contraseña</Form.Label>
                <InputGroup>
                    <InputGroup.Text><i className="bi bi-shield-lock"></i></InputGroup.Text>
                    <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </InputGroup>
            </Form.Group>

            {/* Botón: Reemplazar button con Button */}
            <Button
                variant="primary" // Reemplaza la clase btn-primary
                type="submit"
                className="w-100"
                disabled={isLoading}
            >
                {/* Indicador de Carga */}
                {isLoading ? (
                    <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Registrando...
                    </>
                ) : (
                    "Crear Cuenta"
                )}
            </Button>
        </Form>
    );
}

export default RegisterForm;