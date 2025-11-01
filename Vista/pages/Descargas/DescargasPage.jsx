// src/pages/Descargas/DescargasPage.jsx
import React, { useState } from 'react';
import { buscarArchivos } from '../../services/api.descargas';
import '../../styles/DescargasPage.css';

// --- NUEVO: Importaciones ---
import Select from 'react-select';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css'; // Estilo base de Flatpickr
import { Spanish } from 'flatpickr/dist/l10n/es.js'; // Idioma español
import { Container, Row, Col, Form, Button, Card, Table, Spinner, Alert } from 'react-bootstrap'; // Usar componentes de react-bootstrap
// ----------------------------

// --- NUEVO: Opciones para react-select ---
const fileTypeOptions = [
    { value: '', label: 'Todos los tipos' },
    { value: 'ODI', label: 'ODI (Obligación de Informar)' },
    { value: 'EPP', label: 'EPP (Entrega de Equipo)' },
    { value: 'Contrato', label: 'Contrato' }
    // Agrega más tipos si es necesario
];
// -----------------------------------------

const DescargasPage = () => {
    // --- ESTADOS (sin cambios) ---
    const [filters, setFilters] = useState({
        fileType: '', // Guardará el 'value' (string)
        startDate: '', // Guardará 'YYYY-MM-DD' (string)
        endDate: '',   // Guardará 'YYYY-MM-DD' (string)
    });
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [dateRangeError, setDateRangeError] = useState('');

    // --- MANEJADORES ---

    // NUEVO: Handler específico para react-select
    const handleSelectChange = (selectedOption, actionMeta) => {
        // actionMeta.name nos dirá qué select cambió (en este caso, 'fileType')
        const value = selectedOption ? selectedOption.value : ''; // Si se limpia, el valor es ''
        setFilters(prev => ({ ...prev, [actionMeta.name]: value }));
    };

    // NUEVO: Handler específico para react-flatpickr
    const handleDateChange = (selectedDates, dateStr, instance, name) => {
        // selectedDates es un array, tomamos el primer elemento si existe
        // Usamos toLocaleDateString('en-CA') para obtener el formato 'YYYY-MM-DD' consistentemente
        const dateValue = selectedDates.length > 0
            ? selectedDates[0].toLocaleDateString('en-CA') // Formato YYYY-MM-DD
            : '';
        setFilters(prev => ({ ...prev, [name]: dateValue }));
    };

    // handleSearch (sin cambios en su lógica interna)
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!filters.startDate || !filters.endDate) {
            setDateRangeError('Por favor, seleccione una fecha de inicio y una fecha de fin para buscar.');
            return; // Detener la búsqueda
        }
        setIsLoading(true);
        setHasSearched(true);
        try {
            // 💡 Asumiendo que buscarArchivos necesita un token (añádelo si es necesario)
            // const token = 'tu-token-aqui';
            // const data = await buscarArchivos(filters, token);
            const data = await buscarArchivos(filters); // Usando la versión actual
            setResults(data || []); // Asegura que sea un array
        } catch (error) {
            // Manejo de errores (puedes mostrar un Alert aquí)
            console.error("Error buscando archivos:", error);
            setResults([]);
            // Opcional: setMessage({ type: 'danger', text: `Error: ${error.message}` });
        } finally {
            setIsLoading(false);
        }
    };

    // handleDownload (sin cambios)
    const handleDownload = (archivo) => {
        console.log("Descargando:", archivo.url);
        // En una implementación real, podrías necesitar llamar a otra función API
        // si la URL requiere autenticación o es temporal.
        window.open(archivo.url, '_blank');
    };

    // --- RENDERIZADO (adaptado a react-bootstrap y nuevas librerías) ---
    return (
        // Usamos Container fluid y Card para la estructura principal
        <Container fluid className="my-4">
            <Card className="p-4 card-page-container">
                <Card.Title as="h2" className="mb-4">Descarga de Archivos</Card.Title>

                {dateRangeError && (
                    <Alert variant="warning" onClose={() => setDateRangeError('')} dismissible>
                        {dateRangeError}
                    </Alert>
                )}

                {/* --- SECCIÓN DE FILTROS --- */}
                <Form className="filter-section mb-4 p-3 border rounded bg-light" onSubmit={handleSearch}>
                    <Row className="g-3 align-items-end"> {/* Usamos Row y Col de react-bootstrap */}
                        {/* Tipo de Archivo con react-select */}
                        <Col md={4}>
                            <Form.Group controlId="fileType">
                                <Form.Label>Tipo de Archivo</Form.Label>
                                <Select
                                    name="fileType" // Importante para handleSelectChange
                                    options={fileTypeOptions}
                                    value={fileTypeOptions.find(opt => opt.value === filters.fileType)} // Encuentra el objeto opción basado en el valor string del estado
                                    onChange={handleSelectChange}
                                    placeholder="Seleccione tipo..."
                                    isClearable={true} // Permite limpiar la selección
                                    inputId="fileType-select" // Para accesibilidad
                                />
                            </Form.Group>
                        </Col>

                        {/* Fecha Desde con react-flatpickr */}
                        <Col md={3}>
                            <Form.Group controlId="startDate">
                                <Form.Label>Desde</Form.Label>
                                <Flatpickr
                                    // Pasamos el nombre 'startDate' al handler
                                    onChange={(dates, str, inst) => handleDateChange(dates, str, inst, 'startDate')}
                                    value={filters.startDate} // Flatpickr maneja 'YYYY-MM-DD'
                                    options={{
                                        dateFormat: "Y-m-d", // Formato interno y de display
                                        locale: Spanish // Usar idioma español
                                    }}
                                    className="form-control" // Para que se vea como input de Bootstrap
                                    placeholder="YYYY-MM-DD"
                                />
                            </Form.Group>
                        </Col>

                        {/* Fecha Hasta con react-flatpickr */}
                        <Col md={3}>
                            <Form.Group controlId="endDate">
                                <Form.Label>Hasta</Form.Label>
                                <Flatpickr
                                    // Pasamos el nombre 'endDate' al handler
                                    onChange={(dates, str, inst) => handleDateChange(dates, str, inst, 'endDate')}
                                    value={filters.endDate}
                                    options={{
                                        dateFormat: "Y-m-d",
                                        locale: Spanish,
                                        // Opcional: Poner fecha mínima basada en startDate
                                        minDate: filters.startDate || null
                                    }}
                                    className="form-control"
                                    placeholder="YYYY-MM-DD"
                                />
                            </Form.Group>
                        </Col>

                        {/* Botón Buscar */}
                        <Col md={2} className="d-grid"> {/* d-grid para que ocupe todo el ancho en móvil */}
                            <Button type="submit" variant="primary" disabled={isLoading}>
                                {isLoading ? (
                                    <Spinner as="span" size="sm" animation="border" role="status" aria-hidden="true" />
                                ) : (
                                    <i className="bi bi-search"></i>
                                )}
                                {' '}Buscar
                            </Button>
                        </Col>
                    </Row>
                </Form>

                {/* --- SECCIÓN DE RESULTADOS --- */}
                <div className="mt-4">
                    <h5 className="mb-3">Resultados</h5>
                    <div className="table-responsive">
                        {/* Usamos Table de react-bootstrap */}
                        <Table striped bordered hover responsive>
                            <thead /* className="table-light" es opcional, depende del tema */ >
                                <tr>
                                    <th>Nombre del Archivo</th>
                                    <th>Tipo</th>
                                    <th>Fecha de Creación</th>
                                    <th className="text-end">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading && (
                                    <tr>
                                        <td colSpan="4" className="text-center">
                                            <Spinner animation="border" size="sm" role="status">
                                                <span className="visually-hidden">Buscando...</span>
                                            </Spinner>
                                        </td>
                                    </tr>
                                )}

                                {!isLoading && !hasSearched && (
                                    <tr>
                                        <td colSpan="4" className="text-center text-muted">
                                            Por favor, seleccione un rango de fechas para iniciar la búsqueda.
                                        </td>
                                    </tr>
                                )}

                                {!isLoading && hasSearched && results.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-center text-muted">
                                            No se encontraron archivos para los filtros seleccionados.
                                        </td>
                                    </tr>
                                )}

                                {!isLoading && results.length > 0 && results.map(archivo => (
                                    <tr key={archivo.id}>
                                        <td>{archivo.nombre}</td>
                                        <td>
                                            {/* Usamos badges de react-bootstrap */}
                                            <span className={`badge ${
                                                archivo.tipo === 'ODI' ? 'bg-primary' :
                                                archivo.tipo === 'EPP' ? 'bg-success' : 'bg-secondary'
                                            }`}>
                                                {archivo.tipo}
                                            </span>
                                        </td>
                                        {/* Formatear fecha si viene como string 'YYYY-MM-DD' */}
                                        <td>{archivo.fecha ? new Date(archivo.fecha + 'T00:00:00').toLocaleDateString('es-CL') : '-'}</td>
                                        <td className="text-end">
                                            <Button variant="outline-primary" size="sm" onClick={() => handleDownload(archivo)}>
                                                <i className="bi bi-download"></i> Descargar
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </div>
            </Card>
        </Container>
    );
};

export default DescargasPage;