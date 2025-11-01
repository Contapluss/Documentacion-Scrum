import React, { useState } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { generarPdfDespido } from '../services/api.correo'; // 💡 Ajusta esta ruta si es necesario

// 💡 NOTA: Este componente asume que ya está "dentro" de tu layout
// (es decir, que el Header y el Sidebar ya existen en un componente padre)
// Por eso, solo renderiza el contenido principal.

function CorreoDespido() {
  // Estado para guardar los datos del formulario
  const [to, setTo] = useState('');
  const [message, setMessage] = useState('');

  // Estado para la UI (carga y errores)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue
    setIsLoading(true);
    setError(null);

    try {
      // 1. Obtener el token (debes implementar cómo obtienes el token)
      //    Ejemplo: const token = localStorage.getItem('userToken');
      //    Por ahora, usaré un token de ejemplo.
      const token = 'tu-token-de-autenticacion-aqui'; 
      
      const dataParaApi = {
        para: to,
        mensaje: message
        // 💡 Aquí podrías pasar más datos que necesite tu API,
        // como el ID del trabajador al que se despide, etc.
      };

      // 2. Llamar a la API para generar el PDF
      const blob = await generarPdfDespido(dataParaApi, token);

      // 3. Crear el enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "carta_despido.pdf"; // Nombre del archivo que se descargará
      
      // 4. Simular clic para descargar
      document.body.appendChild(a);
      a.click();
      
      // 5. Limpiar
      a.remove();
      window.URL.revokeObjectURL(url);

      // (Opcional) Limpiar formulario
      // setTo('');
      // setMessage('');

    } catch (err) {
      console.error("Error al generar PDF:", err);
      setError(err.message || 'Error desconocido al generar el documento.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Redactar Correo</h2>
      
      <Form onSubmit={handleSubmit} className="email-form">
        <Form.Group className="mb-3" controlId="formTo">
          <Form.Label>Para:</Form.Label>
          <Form.Control
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            required
            placeholder="ejemplo@correo.com"
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formMessage">
          <Form.Label>Mensaje:</Form.Label>
          <Form.Control
            as="textarea"
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            placeholder="Escribe aquí el cuerpo del mensaje..."
          />
        </Form.Group>

        {/* Mostrar mensaje de error si existe */}
        {error && (
          <Alert variant="danger">
            <strong>Error:</strong> {error}
          </Alert>
        )}

        <Button variant="primary" type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
              Generando...
            </>
          ) : (
            <>
              <i className="bi bi-download"></i> descargar PDF
            </>
          )}
        </Button>
      </Form>
    </Container>
  );
}

export default CorreoDespido;