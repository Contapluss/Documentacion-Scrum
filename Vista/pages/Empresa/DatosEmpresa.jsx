// src/components/views/DatosEmpresa.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Form, Button, Card, InputGroup, Alert } from 'react-bootstrap';
// 💡 Importación de librerías solicitadas
import Select from 'react-select';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { regionesComunas, detallesSociedades, TIPO_PROPIEDAD_OPTIONS, GENERO_OPTIONS, opcionesSociedad, opcionesRegimenTributario, opcionesMutual, opcionesGratificacionLegal } from './Variable_Empresa';
import SocioItem from '../../Components/common/SocioItem'
import UsuarioItem from '../../Components/common/UsuarioItem';
import { actualizarEmpresa, obtenerEmpresaCompleta } from '../../services/api.Empresa';
// Importa tus estilos locales si es necesario
import '../../styles/DatosEmpresa.css'

// DATOS FALSOS: REEMPLAZA ESTO con tu lógica real de autenticación/contexto
const FAKE_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
const FAKE_EMPRESA_ID = 1; // ID de la empresa a actualizar

const INITIAL_EMPRESA_STATE = {
    rut: '',
    nombre_real: '',
    nombre_fantasia: '',
    razon_social: "",
    fecha_constitucion: null,
    fecha_inicio_actividades: null,
    region: "",
    comuna: "",
    provincia: "",
    tipo_de_propiedad: "",
    direccion_fisica: '',
    telefono: '',
    correo: '',


    nombre_representante_legal: "",
    apellido_paterno_representante_legal: "",
    apellido_materno_representante_legal: "",
    rut_representante_legal: "",
    genero_represetante_legal: "",
    tipo_sociedad: "",


    giro: "",
    regimen_tributario: "",
    actividad_economica: "",

    mutual_de_seguridad: "",
    gratificacion_legal: "",
    tasa_actividad: "",

    nombre_de_la_obra: "",
    comuna_de_la_obra: "",
    descripcion_de_la_obra: "",

    capital_total: 0,
    acciones_totales: 0,
    valor_accion: 0,
    capital_pagado: 0,
    fecha_de_pago: null,
};

// --- Estado inicial para un usuario ---
const INITIAL_USUARIO_STATE = {
    nombres: '',
    primerApellido: '',
    segundoApellido: '',
    rut: '',
    correo: '',
    clave: '',
    rol: '' // Asigna un rol por defecto si lo tienes, ej: 'Usuario'
};

function DatosEmpresa() {
    // --------------------------------------------------
    // ESTADO
    // --------------------------------------------------
    const [empresa, setEmpresa] = useState(INITIAL_EMPRESA_STATE);
    const [socios, setSocios] = useState([]);
    const [usuarios, setUsuarios] = useState([
        { ...INITIAL_USUARIO_STATE }, // Por defecto 1 usuario, puedes poner 3 como en tu HTML
        { ...INITIAL_USUARIO_STATE },
        { ...INITIAL_USUARIO_STATE }
    ]);
    const [metodosPago, setMetodosPago] = useState([]);
    const [archivos, setArchivos] = useState([]);
    // 💡 NUEVOS ESTADOS para manejar la respuesta y los errores de la API
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' }); // type: 'success' o 'danger'
    const [passwordVisibles, setPasswordVisibles] = useState({});


    // --------------------------------------------------
    // EFECTO para Cargar Datos de la Empresa (Manejo de Empresa Nueva)
    // --------------------------------------------------
    useEffect(() => {
        const fetchEmpresaData = async () => {
            setIsInitialLoading(true);
            setMessage({ type: '', text: '' }); // Limpiar mensajes

            try {
                const data = await obtenerEmpresaCompleta(FAKE_TOKEN);

                // Si la API devuelve un objeto, asumimos que tiene datos
                if (data && Object.keys(data).length > 0) {

                    const fetchedSocios = data.socios || [];
                    const fetchedMetodosPago = data.metodos_pago || [];

                    const fetchedUsuarios = data.usuarios || [ // Asume que la API devuelve 'usuarios'
                        { ...INITIAL_USUARIO_STATE },
                        { ...INITIAL_USUARIO_STATE },
                        { ...INITIAL_USUARIO_STATE }
                    ];

                    const empresaData = { ...data };
                    delete empresaData.socios;
                    delete empresaData.metodos_pago;
                    delete empresaData.usuarios;

                    // Usar los datos existentes, manteniendo las claves que no vinieron de la API con los valores iniciales
                    setEmpresa({ ...INITIAL_EMPRESA_STATE, ...empresaData });
                    setSocios(fetchedSocios);
                    setMetodosPago(fetchedMetodosPago);
                    setUsuarios(fetchedUsuarios);

                    setMessage({ type: 'info', text: 'Datos de la empresa cargados correctamente.' });
                } else {
                    // Caso: API devuelve 200 OK pero con datos vacíos (depende del backend)
                    setMessage({ type: 'warning', text: '📝 No se encontraron datos previos de la empresa. Rellena el formulario para crearlos.' });
                }

            } catch (error) {
                const errorMessage = error.message;

                // 💡 LÓGICA CLAVE: Si el error sugiere "No encontrado" o similar
                if (errorMessage.includes('404')) {
                    console.log("No existe empresa, cargando formulario vacío.");
                    // Dejamos el estado en INITIAL_EMPRESA_STATE y permitimos la edición
                    setMessage({ type: 'warning', text: '📝 No se encontraron datos de la empresa (404). Por favor, ingrésalos por primera vez.' });
                    setEmpresa(INITIAL_EMPRESA_STATE);
                    setSocios([]);
                    setMetodosPago([]);
                    setUsuarios([
                        { ...INITIAL_USUARIO_STATE },
                        { ...INITIAL_USUARIO_STATE },
                        { ...INITIAL_USUARIO_STATE }
                    ]);

                } else {
                    // Errores graves: fallo de red, token inválido (401), error del servidor (500)
                    console.error("Error crítico al cargar datos:", errorMessage);
                    setMessage({
                        type: 'danger',
                        text: `❌ Error crítico al cargar: ${errorMessage}`
                    });
                }
            } finally {
                setIsInitialLoading(false);
            }
        };

        fetchEmpresaData();
    }, []);


    // --------------------------------------------------
    // MANEJADORES DE CAMBIO
    // --------------------------------------------------

    // Manejador para campos de texto/número estándar
    const handleEmpresaChange = (e) => {
        const { name, value } = e.target;
        if (name === 'tipo_sociedad') {
            const reglas = detallesSociedades[value];
            if (reglas) {
                // Si la nueva regla tiene un máximo y ya nos pasamos, reseteamos
                if (reglas.sociosMax !== null && socios.length > reglas.sociosMax) {
                    setSocios([]); // Resetea los socios
                    setMessage({ type: 'info', text: `Se ha cambiado a ${value}. Se ha reseteado la lista de socios.` });
                }
                // Si no permite acciones, reseteamos las acciones globales
                if (reglas.acciones === false) {
                    setEmpresa(prev => ({ ...prev, acciones_totales: 0 }));
                }
            }
        }
        setEmpresa(prev => ({ ...prev, [name]: value }));
    };

    // Manejador para react-select
    const handleSelectChange = (selectedOption, action) => {
        setEmpresa(prev => ({ ...prev, [action.name]: selectedOption }));
    };

    // Manejador para react-flatpickr
    const handleDateChange = (date, name) => {
        const dateString = date.length > 0
            ? date[0].toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })
            : null;

        setEmpresa(prev => ({ ...prev, [name]: dateString }));
    };

    // Manejador genérico para listas dinámicas (socios y metodosPago)
    const handleDynamicListChange = (listName, index, e) => {
        const { name, value } = e.target;

        const listSetter = listName === 'socios' ? setSocios : setMetodosPago;
        const currentList = listName === 'socios' ? socios : metodosPago;

        const newList = currentList.map((item, i) => {
            if (i === index) {
                return { ...item, [name]: value };
            }
            return item;
        });
        listSetter(newList);
    };

    const handleUsuarioChange = (index, e) => {
        const { name, value } = e.target;
        const newUsuarios = usuarios.map((usuario, i) => {
            if (i === index) {
                return { ...usuario, [name]: value };
            }
            return usuario;
        });
        setUsuarios(newUsuarios);
    };

    const togglePasswordVisibility = (index) => {
        setPasswordVisibles(prev => ({
            ...prev,
            [index]: !prev[index] // Invierte la visibilidad para ese índice
        }));
    };

    // Manejador para los archivos
    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        setArchivos(prev => [...prev, ...files.map(file => ({
            id: Date.now() + Math.random(),
            file: file,
            name: file.name,
            type: file.type,
            size: file.size,
            uploadDate: new Date().toLocaleDateString()
        }))]);

    };

    const handleFileDelete = (id) => {
        setArchivos(prev => prev.filter(archivo => archivo.id !== id));
    };

    const handleFileDownload = (archivo) => {
        const url = URL.createObjectURL(archivo.file);
        const a = document.createElement('a');
        a.href = url;
        a.download = archivo.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // --------------------------------------------------
    // MANEJADORES DE ACCIÓN
    // --------------------------------------------------

    const handleAddSocio = () => {
        const tipo = empresa.tipo_sociedad;
        if (!tipo) {
            setMessage({ type: 'warning', text: 'Por favor, selecciona primero un Tipo de Sociedad.' });
            return;
        }

        const reglas = detallesSociedades[tipo];
        if (reglas && reglas.sociosMax !== null && socios.length >= reglas.sociosMax) {
            setMessage({ type: 'danger', text: `Límite alcanzado: El tipo de sociedad "${tipo}" solo permite ${reglas.sociosMax} socio(s).` });
            return; // No añadir
        }

        // Si pasa la validación, añade el socio
        setSocios([...socios, { rut_socio: '', nombre_socio: '', participacion_socio: '', acciones_socio: '' }]);
        setMessage({ type: '', text: '' }); // Limpiar mensaje
    };

    const handleRemoveSocio = (indexToRemove) => {
        setSocios(socios.filter((_, index) => index !== indexToRemove));
    };

    const handleAddUsuario = () => {
        setUsuarios([...usuarios, { ...INITIAL_USUARIO_STATE }]);
    };

    const handleRemoveUsuario = (indexToRemove) => {
        if (usuarios.length <= 1) {
            setMessage({ type: 'warning', text: 'Debe haber al menos un usuario.' });
            return;
        }
        setUsuarios(usuarios.filter((_, index) => index !== indexToRemove));
    };


    const handleSubmit = async (e) => { // 💡 Hacemos la función ASÍNCRONA
        e.preventDefault();
        setMessage({ type: '', text: '' }); // Limpiar mensajes anteriores
        setIsLoading(true);

        // 1. Preparar los datos que se enviarán al backend
        // **IMPORTANTE**: Ajusta esta estructura si tu backend espera algo diferente.
        const datosAEnviar = {
            ...empresa,
            socios: socios, // Incluir la lista de socios
            usuarios: usuarios,
            // Excluir claves que no quieras enviar o que no existan en el modelo de FastAPI
            valor_accion: undefined, // Se calcula en el frontend/backend
            // Otros ajustes necesarios...
        };

        try {
            // 2. Llamar a la función de la API
            // Usamos el ID de empresa y el token FALSO por ahora
            const resultado = await actualizarEmpresa(FAKE_EMPRESA_ID, datosAEnviar, FAKE_TOKEN);

            // 3. Manejar el éxito
            console.log('Actualización exitosa:', resultado);
            setMessage({ type: 'success', text: '✅ ¡Datos de la empresa guardados correctamente!' });
            // Aquí podrías querer recargar los datos de la empresa, o limpiar algún formulario.

        } catch (error) {
            // 4. Manejar el error
            console.error('Error al guardar datos:', error.message);
            // Mostrar un mensaje de error al usuario
            setMessage({
                type: 'danger',
                text: `❌ Error al guardar datos: ${error.message.includes('Status:') ? error.message.split(' - ')[1] : 'Verifica tu conexión y los datos.'}`
            });
        } finally {
            // Se ejecuta siempre, independientemente del éxito o error
            setIsLoading(false);
        }
    };



    // --------------------------------------------------
    // RENDERIZADO
    // --------------------------------------------------

    const reglasSociedad = useMemo(() => {
        return detallesSociedades[empresa.tipo_sociedad] || { sociosMax: null, acciones: true };
    }, [empresa.tipo_sociedad]);

    const isSocioAddDisabled = useMemo(() => {
        if (!empresa.tipo_sociedad) return true; // Deshabilitado si no hay tipo
        if (reglasSociedad.sociosMax !== null && socios.length >= reglasSociedad.sociosMax) {
            return true; // Deshabilitado si se alcanzó el límite
        }
        return false;
    }, [empresa.tipo_sociedad, socios.length, reglasSociedad]);

    // Si la carga inicial está activa, mostramos un mensaje de espera.
    if (isInitialLoading) {
        return <Container className="my-5"><h3 className="text-center">Cargando datos de la empresa...</h3></Container>;
    }


    return (
        <Container fluid className="my-4">
            <Card className="p-4 card-datos-empresa">
                <Form onSubmit={handleSubmit}>
                    <Card.Title as="h2" className="mb-4">Datos Empresa</Card.Title>

                    {/* ===================================== */}
                    {/* SECCIÓN 1: DATOS GENERALES */}
                    {/* ===================================== */}

                    <Row className="g-3">

                        {/* 💡 RAZÓN SOCIAL */}
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Razón Social</Form.Label>
                                <Form.Control type="text" name="razon_social" value={empresa.razon_social} onChange={handleEmpresaChange} maxLength={60} required />
                            </Form.Group>
                        </Col>

                        {/* Nombre Fantasía */}
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Nombre Fantasía</Form.Label>
                                <Form.Control type="text" name="nombre_fantasia" value={empresa.nombre_fantasia} onChange={handleEmpresaChange} />
                            </Form.Group>
                        </Col>

                        {/* RUT Empresa*/}
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>RUT Empresa</Form.Label>
                                <Form.Control type="text" name="rut" value={empresa.rut} onChange={handleEmpresaChange} />
                            </Form.Group>
                        </Col>

                        {/* Direccion*/}
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Direccion</Form.Label>
                                <Form.Control type="text" name="direccion" value={empresa.direccion_fisica} onChange={handleEmpresaChange} />
                            </Form.Group>
                        </Col>

                        {/* Region Select Local */}
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Región</Form.Label>
                                <Form.Select
                                    name="region"
                                    value={empresa.region}
                                    onChange={(e) => {
                                        // al cambiar región, limpiar comuna
                                        handleEmpresaChange(e);
                                        setEmpresa(prev => ({ ...prev, comuna: '' }));
                                    }}
                                >
                                    <option value="">Seleccione</option>
                                    {Object.keys(regionesComunas).map((reg) => (
                                        <option key={reg} value={reg}>{reg}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        {/* Comuna Select Local */}
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Comuna</Form.Label>
                                <Form.Select
                                    name="comuna"
                                    value={empresa.comuna}
                                    onChange={handleEmpresaChange}
                                    disabled={!empresa.region}
                                >
                                    <option value="">{empresa.region ? 'Seleccione comuna' : 'Seleccione región primero'}</option>
                                    {(empresa.region && regionesComunas[empresa.region] || []).map((comuna) => (
                                        <option key={comuna} value={comuna}>{comuna}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        {/* Provincia */}
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Provincia (Se supone que se pone solo por back)</Form.Label>
                                <Form.Control type="text" name="provincia" value={empresa.provincia} onChange={handleEmpresaChange} />
                            </Form.Group>
                        </Col>

                        {/* Tipo de Propiedad (select local) */}
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Tipo de Propiedad</Form.Label>
                                <Form.Select name="tipo_de_propiedad" value={empresa.tipo_de_propiedad} onChange={handleEmpresaChange}>
                                    {TIPO_PROPIEDAD_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        {/* Telefono */}
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Telefono</Form.Label>
                                <Form.Control type="number" name="telefono" value={empresa.telefono} onChange={handleEmpresaChange} />
                            </Form.Group>
                        </Col>

                        {/* Correo Electronico */}
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Correo Electronico</Form.Label>
                                <Form.Control type="text" name="correo" value={empresa.correo} onChange={handleEmpresaChange} />
                            </Form.Group>
                        </Col>
                    </Row>


                    {/* ===================================== */}
                    {/* SECCIÓN 2: DATOS Legales */}
                    {/* ===================================== */}
                    <hr className="my-4" />
                    <Card.Title as="h2" className="mb-4">Datos Legales</Card.Title>
                    <Row className="g-3">

                        {/* Fecha de Contitucion*/}
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Fecha de Contitucion</Form.Label>
                                <Flatpickr
                                    className="form-control"
                                    options={{
                                        dateFormat: "d-m-Y",
                                        locale: 'es',
                                        maxDate: "today"
                                    }}
                                    name="fecha_de_contitucion"
                                    value={empresa.fecha_constitucion || ''}
                                    onChange={(date) => handleDateChange(date, 'fecha_contitucion')}
                                />
                            </Form.Group>
                        </Col>

                        {/* 💡 FECHA INICIO ACTIVIDADES (REACT-FLATPICKR) */}
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Fecha de Inicio de Actividades</Form.Label>
                                <Flatpickr
                                    className="form-control"
                                    options={{
                                        dateFormat: "d-m-Y",
                                        locale: 'es',
                                        maxDate: "today"
                                    }}
                                    name="fecha_inicio_actividades"
                                    value={empresa.fecha_inicio_actividades || ''}
                                    onChange={(date) => handleDateChange(date, 'fecha_inicio_actividades')}
                                />
                            </Form.Group>
                        </Col>

                        {/* Nombre Representante Legal */}
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label> Nombre Representante Legal</Form.Label>
                                <Form.Control type="text" name="nombre_representante_legal" value={empresa.nombre_representante_legal} onChange={handleEmpresaChange} />
                            </Form.Group>
                        </Col>

                        {/* Apellido Paterno Representante Legal */}
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Apellido Paterno Representante Legal</Form.Label>
                                <Form.Control type="text" name="apellido_paterno_representante_legal" value={empresa.apellido_paterno_representante_legal} onChange={handleEmpresaChange} />
                            </Form.Group>
                        </Col>

                        {/* Apellido Paterno Representante Legal */}
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Apellido Materno Representante Legal</Form.Label>
                                <Form.Control type="text" name="apellido_materno_representante_legal" value={empresa.apellido_materno_representante_legal} onChange={handleEmpresaChange} />
                            </Form.Group>
                        </Col>

                        {/* RUT Representante Legal*/}
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>RUT Representante Legal</Form.Label>
                                <Form.Control type="text" name="rut_representante_legal" value={empresa.rut_representante_legal} onChange={handleEmpresaChange} />
                            </Form.Group>
                        </Col>

                        {/* Genero del Representante Legal (select) */}
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Genero del Representante Legal</Form.Label>
                                <Form.Select name="genero_represetante_legal" value={empresa.genero_represetante_legal} onChange={handleEmpresaChange}>
                                    {GENERO_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        {/* Tipo de Sociedad (usar opcionesSociedad) */}
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Tipo de Sociedad</Form.Label>
                                <Form.Select name="tipo_sociedad" value={empresa.tipo_sociedad} onChange={handleEmpresaChange}>
                                    {opcionesSociedad.map(opt => (
                                        <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                    </Row>

                    {/* =========================================== */}
                    {/* SECCIÓN 3: Actividad Economica y Tributaria */}
                    {/* =========================================== */}
                    <hr className="my-4" />
                    <Card.Title as="h2" className="mb-4">Actividad Economica y Tributaria</Card.Title>
                    <Row className='g-3'>

                        {/* 💡 RAZÓN SOCIAL */}
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Giro</Form.Label>
                                <Form.Control type="number" name="giro" value={empresa.giro} onChange={handleEmpresaChange} />
                            </Form.Group>
                        </Col>

                        {/* Regimen Tributario*/}
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Régimen Tributario</Form.Label>
                                <Form.Control type="text" name="regimen_tributario" value={empresa.regimen_tributario} onChange={handleEmpresaChange} />
                            </Form.Group>
                        </Col>

                        {/* Actividad Economica (max. 7) FALTA AGREGAR LOS SELECTS */}
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Actividad Economica (max 7) </Form.Label>
                                <Form.Control type="text" name="actividad_economica" value={empresa.actividad_economica} onChange={handleEmpresaChange} multiple required />
                            </Form.Group>
                        </Col>

                    </Row>

                    {/* ===================================== */}
                    {/* SECCION 4: Seguridad y Prevision */}
                    {/* ===================================== */}
                    <hr className="my-4" />
                    <Card.Title as="h2" className="mb-4">Seguridad y Previsión</Card.Title>
                    <Row className='g-3'>
                        {/* Mutual de Seguridad (usar opcionesMutual) */}
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Mutual de Seguridad</Form.Label>
                                <Form.Select name="mutual_de_seguridad" value={empresa.mutual_de_seguridad} onChange={handleEmpresaChange}>
                                    {opcionesMutual.map(opt => (
                                        <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        {/* Gratificación Legal (usar opcionesGratificacionLegal) */}
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Gratificacion Legal</Form.Label>
                                <Form.Select name="gratificacion_legal" value={empresa.gratificacion_legal} onChange={handleEmpresaChange}>
                                    {opcionesGratificacionLegal.map(opt => (
                                        <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        {/* Tasa segun actividad (%) */}
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Tasa según actividad (%)</Form.Label>
                                <Form.Control type="number" name="tasa_segun_actividad" value={empresa.tasa_actividad} onChange={handleEmpresaChange} />
                            </Form.Group>
                        </Col>

                    </Row>

                    {/* ===================================== */}
                    {/* SECCION 5: Direcciones de trabajo */}
                    {/* ===================================== */}
                    <hr className="my-4" />
                    <Card.Title as="h2" className='mb-4'>Direcciones de Trabajo</Card.Title>
                    <Row className='g-3'>
                        {/* Nombre de la Obra*/}
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Nombre de la Obra</Form.Label>
                                <Form.Control type="text" name="nombre_de_la_obra" value={empresa.nombre_de_la_obra} onChange={handleEmpresaChange} />
                            </Form.Group>
                        </Col>

                        {/* Comuna de la obra*/}
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Comuna</Form.Label>
                                <Form.Control type="text" name="comuna_de_la_obra" value={empresa.comuna_de_la_obra} onChange={handleEmpresaChange} />
                            </Form.Group>
                        </Col>

                        {/* Descripción*/}
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Descripción</Form.Label>
                                <Form.Control as="textarea" type="text" name="descripcion_de_la_obra" value={empresa.descripcion_de_la_obra} onChange={handleEmpresaChange} rows={3} />
                            </Form.Group>
                        </Col>

                    </Row>

                    {/* ===================================== */}
                    {/* SECCIÓN 6: SOCIOS Y PARTICIPACIÓN */}
                    {/* ===================================== */}
                    <hr className="my-4" />
                    <Card.Title as="h2" className='mb-4'>Acciones y Capital</Card.Title>
                    <Row className='g-3'>

                        {/* Cantidad de Acciones Totales*/}
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Cantidad de Acciones Totales</Form.Label>
                                <Form.Control type="number" name="acciones_totales" value={empresa.acciones_totales} readOnly={!reglasSociedad.acciones} onChange={handleEmpresaChange} />
                            </Form.Group>
                        </Col>

                        {/* Capital Total*/}
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Capital Total ($)</Form.Label>
                                <Form.Control type="number" name="capital_total" value={empresa.capital_total} onChange={handleEmpresaChange} />
                            </Form.Group>
                        </Col>

                        {/* Capital pagado*/}
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Capital Pagado ($)</Form.Label>
                                <Form.Control type="number" name="capital_pagado" value={empresa.capital_pagado} onChange={handleEmpresaChange} />
                            </Form.Group>
                        </Col>

                        {/* Capital pagado  Se calcula directamente*/}
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Capital por Pagar ($)</Form.Label>
                                <Form.Control type="number" name="capital_pagado" value={empresa.capital_total - empresa.capital_pagado} readOnly />
                            </Form.Group>
                        </Col>

                        {/* Fecha de Contitucion*/}
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Fecha de Pago</Form.Label>
                                <Flatpickr
                                    className="form-control"
                                    options={{
                                        dateFormat: "d-m-Y",
                                        locale: 'es',
                                        maxDate: "today"
                                    }}
                                    name="fecha_de_pago"
                                    value={empresa.fecha_de_pago || ''}
                                    onChange={(date) => handleDateChange(date, 'fecha_de_pago')}
                                />
                            </Form.Group>
                        </Col>

                        <Button variant="primary" onClick={handleAddSocio} className="btn-primario" disabled={isSocioAddDisabled}>
                            <i className="bi bi-plus me-1"></i> Agregar Socio
                        </Button>

                    </Row>


                    <div id="sociosContainer">
                        {socios.map((socio, index) => (
                            <SocioItem
                                key={index}
                                index={index}
                                titulo={`Socio ${index + 1}`}
                                socio={socio}
                                handleChange={handleDynamicListChange}
                                handleRemove={handleRemoveSocio}
                                reglas={reglasSociedad}
                            />
                        ))}
                    </div>


                    {/* ===================================== */}
                    {/* --- SECCIÓN 7: USUARIOS AUTORIZADOS --- */}
                    {/* (Basado en view_datos_empresa.html) */}
                    {/* ===================================== */}
                    <hr className="my-4" />
                    <Card.Title as="h2" className="mb-3">Usuarios Autorizados</Card.Title>
                    {/* --- CÓDIGO LIMPIO USANDO EL NUEVO COMPONENTE --- */}
                    {usuarios.map((usuario, index) => (
                        <UsuarioItem
                            key={index}
                            index={index}
                            usuario={usuario}
                            handleChange={handleUsuarioChange} // <-- Pasa la función correcta
                            handleRemove={handleRemoveUsuario}
                        />
                    ))}

                    <Button variant="outline-primary" onClick={handleAddUsuario} className="mt-2">
                        <i className="bi bi-plus me-1"></i> Agregar Usuario
                    </Button>
                    {/* ===================================== */}
                    {/* SECCIÓN 8: Datos (Dinámico) */}
                    {/* ===================================== */}
                    <hr className='my-4' />
                    <Card.Title as="h2" className='mb-4'>Datos Históricos</Card.Title>
                    <Row className='g-3'>
                        {/* Subida de archivos */}
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Subir Documentos</Form.Label>
                                <Form.Control
                                    type="file"
                                    multiple
                                    onChange={handleFileUpload}
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                                />
                                <Form.Text className="text-muted">
                                    Formatos permitidos: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG
                                </Form.Text>
                            </Form.Group>
                        </Col>


                        {/* Lista de archivos */}
                        {archivos.length > 0 && (
                            <Col md={12}>
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Nombre del archivo</th>
                                                <th>Tipo</th>
                                                <th>Tamaño</th>
                                                <th>Fecha de subida</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {archivos.map(archivo => (
                                                <tr key={archivo.id}>
                                                    <td>{archivo.name}</td>
                                                    <td>{archivo.type}</td>
                                                    <td>{Math.round(archivo.size / 1024)} KB</td>
                                                    <td>{archivo.uploadDate}</td>
                                                    <td>
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            className="me-2"
                                                            onClick={() => handleFileDownload(archivo)}
                                                        >
                                                            <i className="bi bi-download"></i>
                                                        </Button>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleFileDelete(archivo.id)}
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Col>
                        )}
                    </Row>


                    {/* ===================================== */}
                    {/* SECCIÓN 5: INFORMACIÓN DE CONTACTO */}
                    {/* ===================================== */}


                    {/* Botón de Guardar */}
                    <div className="mt-4 text-end">
                        <Button type="submit" variant="success" className="btn-lg" disabled={isLoading}>
                            {isLoading ? 'Guardando...' : 'Guardar Datos'}
                        </Button>
                    </div>

                </Form>
            </Card>
        </Container>
    );
}

export default DatosEmpresa;