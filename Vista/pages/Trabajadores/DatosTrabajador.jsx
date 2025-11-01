// src/components/views/DatosTrabajador.jsx

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Container, Row, Col, Form, Button, Card, Image, Alert, Modal, Table } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

// --- LIBRERÍAS ---
import Select from 'react-select';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { Spanish } from 'flatpickr/dist/l10n/es.js'; // Importar idioma español

// --- VARIABLES LOCALES ---
import {
  regionesComunas,
  opcionesSexo,
  opcionesNacionalidad,
  opcionesEstadoCivil,
  opcionesAfp,
  opcionesSalud,
  opcionesCargo,
  opcionesFormaPago,
  opcionesJefe
} from './Variable_Trabajador';

// --- API ---
import { obtenerTrabajador, crearTrabajador, actualizarTrabajador } from '../../services/api.trabajador';

const DEFAULT_FOTO_URL = '/fotoDefault.png'; // (O la ruta que elijas)

// --- FUNCIONES HELPERS (de tu view_trabajadores.js) ---
function formatearRut(rut) {
  rut = rut.replace(/[^\dkK]/g, '').toUpperCase();
  if (rut.length <= 1) return rut;
  let cuerpo = rut.slice(0, -1);
  let dv = rut.slice(-1);
  cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${cuerpo}-${dv}`;
}

function validarRut(rut) {
  rut = rut.replace(/[^\dkK]/g, '').toUpperCase();
  if (rut.length < 2) return false;
  let cuerpo = rut.slice(0, -1);
  let dv = rut.slice(-1);
  let suma = 0;
  let multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i)) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }
  let dvEsperado = 11 - (suma % 11);
  dvEsperado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();
  return dv === dvEsperado;
}
// --- FIN HELPERS ---

// DATOS FALSOS (como en tu ejemplo)
const FAKE_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

// Estado inicial basado en la estructura de tu JSON
const INITIAL_TRABAJADOR_STATE = {
  datos_generales: {
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    rut: '',
    fecha_nacimiento: null,
    sexo: null,
    nacionalidad: null,
    estado_civil: null,
    foto_url: DEFAULT_FOTO_URL
  },
  info_contacto: {
    telefono_personal: '',
    telefono_corporativo: '',
    correo_personal: '',
    correo_corporativo: ''
  },
  info_vivienda: {
    direccion: '',
    region: null,
    comuna: null,
    provincia: '' // Asumo que esto se autocompleta
  },
  info_seguros: {
    afp: null,
    instituto_salud: null,
    plan_uf: ''
  },
  info_laboral: {
    cargo: null,
    jefe_directo: null,
    sueldo_base: '',
    fecha_ingreso: null,
    fecha_contrato: null,
    forma_pago: null
  }
};

// Opciones para react-select de Regiones y Comunas
const optionsRegiones = Object.keys(regionesComunas).map(r => ({ value: r, label: r }));

function DatosTrabajador() {
  // --------------------------------------------------
  // ESTADO
  // --------------------------------------------------
  const [trabajador, setTrabajador] = useState(INITIAL_TRABAJADOR_STATE);
  const [contratosFiles, setContratosFiles] = useState([]); // Para Contratos
  const [eppFiles, setEppFiles] = useState([]); // Para EPP
  const [existingContratos, setExistingContratos] = useState([]); // Para Contratos YA GUARDADOS
  const [existingEpps, setExistingEpps] = useState([]); // Para EPP YA GUARDADOS
  const [odiFiles, setOdiFiles] = useState([]); // Para ODI
  const [existingOdis, setExistingOdis] = useState([]); // Para ODI YA GUARDADOS

  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Estados de validación
  const [rutEsValido, setRutEsValido] = useState(true);
  const [telPersonalValido, setTelPersonalValido] = useState(true);

  // Estados para previsualización de imágenes
  const [previewFoto, setPreviewFoto] = useState(DEFAULT_FOTO_URL);
  const [previewCarnetFrontal, setPreviewCarnetFrontal] = useState(null);
  const [previewCarnetReverso, setPreviewCarnetReverso] = useState(null);
  const [previewFotoTrabajador, setPreviewFotoTrabajador] = useState(null);
  const [fotoFile, setFotoFile] = useState(null); // Para la foto principal

  // Estados de Modales
  const [showModalDescarga, setShowModalDescarga] = useState(false);
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [showModalEliminarDoc, setShowModalEliminarDoc] = useState(false);
  const [docToDelete, setDocToDelete] = useState({ id: null, type: null, nombre: null });

  // Referencias
  const fotoInputRef = useRef(null); // Para el botón "Agregar Foto"

  //Id del trabajador
  const { id: trabajadorIdFromUrl } = useParams();

  // --------------------------------------------------
  // EFECTO DE CARGA INICIAL
  // --------------------------------------------------
  useEffect(() => {
    const fetchTrabajadorData = async (id) => {
      setIsInitialLoading(true);
      setMessage({ type: '', text: '' });
      try {
        const data = await obtenerTrabajador(id, FAKE_TOKEN);

        // Función para encontrar la opción de react-select
        const findOption = (options, value) => options.find(o => o.value === value) || null;

        // Transformar datos planos a objetos { value, label } para react-select
        const formattedData = {
          datos_generales: {
            ...data.datos_generales,
            sexo: findOption(opcionesSexo, data.datos_generales.sexo),
            nacionalidad: findOption(opcionesNacionalidad, data.datos_generales.nacionalidad),
            estado_civil: findOption(opcionesEstadoCivil, data.datos_generales.estado_civil),
            foto_url: data.datos_generales.foto_url || DEFAULT_FOTO_URL,
            fecha_nacimiento: data.datos_generales.fecha_nacimiento || null
          },
          info_contacto: {
            ...INITIAL_TRABAJADOR_STATE.info_contacto,
            ...data.info_contacto
          },
          info_vivienda: {
            ...data.info_vivienda,
            region: findOption(optionsRegiones, data.info_vivienda.region),
            // Opciones de comuna dependen de la región cargada
            comuna: data.info_vivienda.region
              ? findOption(regionesComunas[data.info_vivienda.region].map(c => ({ value: c, label: c })), data.info_vivienda.comuna)
              : null
          },
          info_seguros: {
            ...data.info_seguros,
            afp: findOption(opcionesAfp, data.info_seguros.afp),
            instituto_salud: findOption(opcionesSalud, data.info_seguros.instituto_salud),
          },
          info_laboral: {
            ...data.info_laboral,
            cargo: findOption(opcionesCargo, data.info_laboral.cargo),
            jefe_directo: findOption(opcionesJefe, data.info_laboral.jefe_directo),
            forma_pago: findOption(opcionesFormaPago, data.info_laboral.forma_pago),
            fecha_ingreso: data.info_laboral.fecha_ingreso || null,
            fecha_contrato: data.info_laboral.fecha_contrato || null,
          }
        };

        setTrabajador(formattedData);
        setPreviewFoto(formattedData.datos_generales.foto_url);

        // Cargar documentos existentes si vienen en la respuesta
        setExistingContratos(data.documentos_contrato_existentes || []);
        setExistingEpps(data.documentos_epp_existentes || []);
        setExistingOdis(data.documentos_odi_existentes || []); // Cargar ODIs existentes

        setMessage({ type: 'info', text: 'Datos del trabajador cargados.' });

      } catch (error) {
        if (error.message.includes('404')) {
          setMessage({ type: 'warning', text: '📝 No se encontró este trabajador. Puedes crear uno nuevo.' });
          setTrabajador(INITIAL_TRABAJADOR_STATE); // Dejar formulario vacío
        } else {
          setMessage({ type: 'danger', text: `❌ Error crítico al cargar: ${error.message}` });
        }
      } finally {
        setIsInitialLoading(false);
      }
    };

    if (trabajadorIdFromUrl) {
      fetchTrabajadorData(trabajadorIdFromUrl);
    } else {
      // No hay ID, es un formulario de creación
      setIsInitialLoading(false);
      setMessage({ type: 'info', text: '📝 Ingresa los datos para crear un nuevo trabajador.' });
      setTrabajador(INITIAL_TRABAJADOR_STATE);
    }
  }, []); // Se ejecuta solo una vez al montar

  // --------------------------------------------------
  // MANEJADORES DE CAMBIOS
  // --------------------------------------------------

  // Manejador genérico para actualizar el estado anidado
  const handleChange = useCallback((section, field, value) => {
    setTrabajador(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));

    // Lógica de validación específica
    if (section === 'datos_generales' && field === 'rut') {
      setRutEsValido(true); // Resetear al escribir
    }
    if (section === 'info_contacto' && field === 'telefono_personal') {
      setTelPersonalValido(value.length >= 8);
    }
  }, []);

  // Handlers específicos que llaman al genérico
  const handleInputChange = (e, section) => {
    handleChange(section, e.target.name, e.target.value);
  };

  const handleSelectChange = (option, action, section) => {
    handleChange(section, action.name, option);

    // Limpiar comuna si cambia la región
    if (section === 'info_vivienda' && action.name === 'region') {
      handleChange('info_vivienda', 'comuna', null);
    }
  };

  const handleDateChange = (date, name, section) => {
    // Flatpickr devuelve un array, tomamos el primer elemento
    handleChange(section, name, date.length > 0 ? date[0] : null);
  };

  // Handlers de validación
  const handleRutBlur = () => {
    setRutEsValido(validarRut(trabajador.datos_generales.rut));
  };

  const handleRutChange = (e) => {
    const valorFormateado = formatearRut(e.target.value);
    handleChange('datos_generales', 'rut', valorFormateado);
  };

  // Handlers para previsualización de imágenes
  const handleFilePreview = (e, setPreviewFn) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewFn(URL.createObjectURL(file));
    } else {
      setPreviewFn(null);
    }
  };

  // Handler para la foto principal (arriba a la derecha)
  const handleFotoPrincipalChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreviewFoto(previewUrl);
      setFotoFile(file); // 💡 GUARDAR el objeto File
    } else {
      // Si el usuario cancela, no borramos la foto existente, solo limpiamos el file state
      setFotoFile(null);
    }
  };

  // Handlers para Contratos
  const handleContratoUpload = (e) => {
    const files = Array.from(e.target.files);
    setContratosFiles(prev => [...prev, ...files.map(file => ({
      id: Date.now() + Math.random(),
      file: file, // 💡 Guarda el objeto File
      name: file.name,
      type: file.type,
      size: file.size,
      uploadDate: new Date().toLocaleDateString()
    }))]);
  };
  const handleContratoDelete = (id) => setContratosFiles(prev => prev.filter(doc => doc.id !== id));

  // Handlers para EPP
  const handleEppUpload = (e) => {
    const files = Array.from(e.target.files);
    setEppFiles(prev => [...prev, ...files.map(file => ({
      id: Date.now() + Math.random(),
      file: file, // 💡 Guarda el objeto File
      name: file.name,
      type: file.type,
      size: file.size,
      uploadDate: new Date().toLocaleDateString()
    }))]);
  };
  const handleEppDelete = (id) => setEppFiles(prev => prev.filter(doc => doc.id !== id));

  // Handler de descarga genérico (basado en DatosEmpresa)
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

  const handleOdiUpload = (e) => {
    const files = Array.from(e.target.files);
    setOdiFiles(prev => [...prev, ...files.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      type: file.type,
      size: file.size,
      uploadDate: new Date().toLocaleDateString()
    }))]);
  };
  const handleOdiDelete = (id) => setOdiFiles(prev => prev.filter(doc => doc.id !== id));

  // --------------------------------------------------
  // ACCIONES DE BOTONES Y MODALES
  // --------------------------------------------------

  const handleDescargarFoto = () => {
    const link = document.createElement('a');
    link.href = previewFoto;
    link.download = 'foto_trabajador.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowModalDescarga(false);
  };

  const handleEliminarFoto = () => {
    setPreviewFoto(DEFAULT_FOTO_URL);
    handleChange('datos_generales', 'foto_url', DEFAULT_FOTO_URL); // Usa DEFAULT_FOTO_URL
    setFotoFile(null); // 💡 LIMPIAR el estado del archivo
    if (fotoInputRef.current) fotoInputRef.current.value = null; // Limpiar input
    setShowModalEliminar(false);
  };

  const handleDeleteExistingDocument = async (docId, docType, docNombre) => {
    if (!trabajadorIdFromUrl) return; // No se puede eliminar si no existe el trabajador

    // Guarda los detalles del documento a eliminar y muestra el modal
    setDocToDelete({ id: docId, type: docType, nombre: docNombre });
    setShowModalEliminarDoc(true);

    setIsLoading(true); // Mostrar spinner
    setMessage({ type: '', text: '' });

    try {
      let apiFunction;
      let listSetter;
      let existingList;

      if (docType === 'contrato') {
        apiFunction = eliminarDocumentoContrato;
        listSetter = setExistingContratos;
        existingList = existingContratos;
      } else if (docType === 'epp') {
        apiFunction = eliminarDocumentoEpp;
        listSetter = setExistingEpps;
        existingList = existingEpps;
      } else if (docType === 'odi') { // Añadido caso ODI
        apiFunction = eliminarDocumentoOdi;
        listSetter = setExistingOdis;
        existingList = existingOdis;
      } else {
        throw new Error('Tipo de documento no válido');
      }

      // Llamar a la API
      await apiFunction(trabajadorIdFromUrl, docId, FAKE_TOKEN);

      // Actualizar estado local si la API tuvo éxito
      listSetter(existingList.filter(doc => doc.id !== docId));
      setMessage({ type: 'success', text: `Documento ${docType} eliminado correctamente.` });

    } catch (error) {
      setMessage({ type: 'danger', text: `Error al eliminar documento ${docType}: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------
  // SUBMIT
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarRut(trabajador.datos_generales.rut)) {
      setRutEsValido(false);
      setMessage({ type: 'danger', text: 'RUT inválido. Por favor, corrígelo.' });
      return;
    }
    if (trabajador.info_contacto.telefono_personal.length < 8) {
      setTelPersonalValido(false);
      setMessage({ type: 'danger', text: 'Teléfono personal debe tener al menos 8 dígitos.' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    // 1. Preparar los datos para el backend
    // Convertir objetos {value, label} y Dates a strings
    const prepararDatosParaEnvio = () => {
      const data = JSON.parse(JSON.stringify(trabajador)); // Copia profunda

      // Función para convertir fecha a 'YYYY-MM-DD'
      const formatDate = (date) => date ? new Date(date).toISOString().split('T')[0] : null;

      // Transformar datos_generales
      data.datos_generales.sexo = data.datos_generales.sexo?.value;
      data.datos_generales.nacionalidad = data.datos_generales.nacionalidad?.value;
      data.datos_generales.estado_civil = data.datos_generales.estado_civil?.value;
      data.datos_generales.fecha_nacimiento = formatDate(data.datos_generales.fecha_nacimiento);
      data.datos_generales.foto_url = previewFoto; // Envía la URL de la vista previa

      // Transformar info_vivienda
      data.info_vivienda.region = data.info_vivienda.region?.value;
      data.info_vivienda.comuna = data.info_vivienda.comuna?.value;

      // Transformar info_seguros
      data.info_seguros.afp = data.info_seguros.afp?.value;
      data.info_seguros.instituto_salud = data.info_seguros.instituto_salud?.value;
      data.info_seguros.plan_uf = parseFloat(data.info_seguros.plan_uf) || 0;

      // Transformar info_laboral
      data.info_laboral.cargo = data.info_laboral.cargo?.value;
      data.info_laboral.jefe_directo = data.info_laboral.jefe_directo?.value;
      data.info_laboral.forma_pago = data.info_laboral.forma_pago?.value;
      data.info_laboral.sueldo_base = parseFloat(data.info_laboral.sueldo_base) || 0;
      data.info_laboral.fecha_ingreso = formatDate(data.info_laboral.fecha_ingreso);
      data.info_laboral.fecha_contrato = formatDate(data.info_laboral.fecha_contrato);

      // 💡 Aquí faltaría adjuntar los ARCHIVOS (fotos, documentos)
      // Esto requeriría enviar 'multipart/form-data' en lugar de 'application/json'

      return data;
    };

    const datosAEnviar = prepararDatosParaEnvio();

    try {
      let resultado;

      // 💡 CREAR objeto 'files' para pasar a la API
      const filesToUpload = {
        fotoFile: fotoFile, // El estado que guarda el File de la foto principal
        contratosFiles: contratosFiles, // El array de objetos {id, file, name...}
        eppFiles: eppFiles, // El array de objetos {id, file, name...}
        odiFiles: odiFiles // Incluir archivos ODI
      };

      if (trabajadorIdFromUrl) {
        // Actualizar existente - pasa ID, datos JSON, y archivos
        resultado = await actualizarTrabajador(trabajadorIdFromUrl, datosAEnviar, filesToUpload, FAKE_TOKEN);
      } else {
        // Crear nuevo - pasa datos JSON y archivos
        resultado = await crearTrabajador(datosAEnviar, filesToUpload, FAKE_TOKEN);
        // Opcional: Redirigir después de crear (necesitarías importar useNavigate)
        // if (resultado.id) {
        //   navigate(`/Datos-Trabajador/${resultado.id}`);
        // }
      }
      setMessage({ type: 'success', text: '✅ ¡Datos del trabajador guardados correctamente!' });
      console.log('Respuesta API:', resultado);

      // 💡 Opcional: Limpiar estados de archivos después de guardar con éxito
      // setFotoFile(null);
      // setContratosFiles([]);
      // setEppFiles([]);
      // if (fotoInputRef.current) fotoInputRef.current.value = null; // Limpiar input visualmente

    } catch (error) {
      setMessage({ type: 'danger', text: `❌ Error al guardar: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  }; // End of handleSubmit

  // Función de debug
  const mostrarTrabajadorEnConsola = () => {
    console.log('Estado React:', trabajador);
    console.log('JSON para enviar:', prepararDatosParaEnvio());
  };

  // --------------------------------------------------
  // RENDERIZADO
  // --------------------------------------------------

  // Opciones de comunas que dependen de la región seleccionada
  const optionsComunas = useMemo(() => {
    if (!trabajador.info_vivienda.region) return [];
    return regionesComunas[trabajador.info_vivienda.region.value].map(c => ({ value: c, label: c }));
  }, [trabajador.info_vivienda.region]);

  // Lógica para Plan UF
  const esFonasa = trabajador.info_seguros.instituto_salud?.value?.toLowerCase() === 'fonasa';

  if (isInitialLoading) {
    return <Container className="my-5"><h3 className="text-center">Cargando datos del trabajador...</h3></Container>;
  }

  const confirmDeleteDocument = async () => {
    const { id: docId, type: docType } = docToDelete; // Get details from state

    if (!trabajadorIdFromUrl || !docId || !docType) return; // Safety check

    setIsLoading(true); // Mostrar spinner
    setMessage({ type: '', text: '' });
    setShowModalEliminarDoc(false); // Cierra el modal inmediatamente

    try {
      let apiFunction;
      let listSetter;
      let existingList;

      if (docType === 'contrato') {
        apiFunction = eliminarDocumentoContrato;
        listSetter = setExistingContratos;
        existingList = existingContratos;
      } else if (docType === 'epp') {
        apiFunction = eliminarDocumentoEpp;
        listSetter = setExistingEpps;
        existingList = existingEpps;
      } else if (docType === 'odi') {
        apiFunction = eliminarDocumentoOdi;
        listSetter = setExistingOdis;
        existingList = existingOdis;
      } else {
        throw new Error('Tipo de documento no válido');
      }

      // Llamar a la API
      await apiFunction(trabajadorIdFromUrl, docId, FAKE_TOKEN);

      // Actualizar estado local si la API tuvo éxito
      listSetter(prevList => prevList.filter(doc => doc.id !== docId)); // Forma segura de actualizar estado
      setMessage({ type: 'success', text: `Documento ${docType} "${docToDelete.nombre}" eliminado correctamente.` });

    } catch (error) {
      setMessage({ type: 'danger', text: `Error al eliminar documento ${docType}: ${error.message}` });
    } finally {
      setIsLoading(false);
      setDocToDelete({ id: null, type: null, nombre: null }); // Limpia el estado del documento a eliminar
    }
  };

  // Función simple para cerrar el modal de eliminación de documentos
  const handleCloseEliminarDocModal = () => {
    setShowModalEliminarDoc(false);
    setDocToDelete({ id: null, type: null, nombre: null });
  };










  return (
    <Container fluid className="my-4">
      <Card className="p-4">
        <Form onSubmit={handleSubmit}>

          {/* Mensaje de Alerta */}
          {message.text && (
            <Alert variant={message.type} onClose={() => setMessage({ type: '', text: '' })} dismissible>
              {message.text}
            </Alert>
          )}

          <h2 className="mb-4">Datos del trabajador</h2>

          {/* --- Sección Foto Principal --- */}
          <div className="d-flex justify-content-end mb-3">
            <div className="d-flex justify-content-end align-items-center gap-3">
              <Image id="fotoArribaDerecha" src={previewFoto} alt="Foto trabajador"
                style={{ width: '170px', height: '170px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #ccc', boxShadow: '0 2px 8px #0001' }}
              />
              <div className="d-flex flex-column gap-2">
                <Button variant="outline-primary" onClick={() => setShowModalDescarga(true)}>
                  <i className="bi bi-download"></i> Descargar
                </Button>
                <Button variant="outline-danger" onClick={() => setShowModalEliminar(true)}>
                  <i className="bi bi-trash"></i> Eliminar
                </Button>
                <Button variant="outline-success" onClick={() => fotoInputRef.current.click()}>
                  <i className="bi bi-upload"></i> Agregar Foto
                </Button>
                <Form.Control type="file" id="inputAgregarFoto" accept="image/*" style={{ display: 'none' }} ref={fotoInputRef} onChange={handleFotoPrincipalChange} />
              </div>
            </div>
          </div>

          {/* --- Sección 1: Datos Generales --- */}
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Nombres</Form.Label>
                <Form.Control type="text" name="nombres" value={trabajador.datos_generales.nombres} onChange={(e) => handleInputChange(e, 'datos_generales')} required />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Apellido Paterno</Form.Label>
                <Form.Control type="text" name="apellidoPaterno" value={trabajador.datos_generales.apellidoPaterno} onChange={(e) => handleInputChange(e, 'datos_generales')} required />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Apellido Materno</Form.Label>
                <Form.Control type="text" name="apellidoMaterno" value={trabajador.datos_generales.apellidoMaterno} onChange={(e) => handleInputChange(e, 'datos_generales')} required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Rut del trabajador</Form.Label>
                <Form.Control type="text" name="rut" value={trabajador.datos_generales.rut} onChange={handleRutChange} onBlur={handleRutBlur} isInvalid={!rutEsValido} required />
                <Form.Control.Feedback type="invalid">RUT inválido</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Fecha de nacimiento</Form.Label>
                <Flatpickr
                  className="form-control"
                  placeholder="Seleccione fecha..."
                  name="fecha_nacimiento"
                  value={trabajador.datos_generales.fecha_nacimiento}
                  options={{ dateFormat: "Y-m-d", locale: Spanish, maxDate: new Date().getFullYear() - 15 + "-12-31" }}
                  onChange={(date) => handleDateChange(date, 'fecha_nacimiento', 'datos_generales')}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Sexo</Form.Label>
                <Select name="sexo" options={opcionesSexo} value={trabajador.datos_generales.sexo} onChange={(opt, act) => handleSelectChange(opt, act, 'datos_generales')} placeholder="Seleccione" isClearable required />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Nacionalidad</Form.Label>
                <Select name="nacionalidad" options={opcionesNacionalidad} value={trabajador.datos_generales.nacionalidad} onChange={(opt, act) => handleSelectChange(opt, act, 'datos_generales')} placeholder="Nacionalidad" isClearable required />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Estado civil</Form.Label>
                <Select name="estado_civil" options={opcionesEstadoCivil} value={trabajador.datos_generales.estado_civil} onChange={(opt, act) => handleSelectChange(opt, act, 'datos_generales')} placeholder="Seleccione estado" isClearable required />
              </Form.Group>
            </Col>
          </Row>

          {/* --- Sección 2: Info de vivienda --- */}
          <hr className="my-4" />
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Dirección</Form.Label>
                <Form.Control type="text" name="direccion" value={trabajador.info_vivienda.direccion} onChange={(e) => handleInputChange(e, 'info_vivienda')} required />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Región</Form.Label>
                <Select name="region" options={optionsRegiones} value={trabajador.info_vivienda.region} onChange={(opt, act) => handleSelectChange(opt, act, 'info_vivienda')} placeholder="Seleccione" isClearable required />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Comuna</Form.Label>
                <Select name="comuna" options={optionsComunas} value={trabajador.info_vivienda.comuna} onChange={(opt, act) => handleSelectChange(opt, act, 'info_vivienda')} placeholder={trabajador.info_vivienda.region ? "Seleccione comuna" : "Seleccione región"} isDisabled={!trabajador.info_vivienda.region} isClearable required />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Provincia (Auto)</Form.Label>
                <Form.Control type="text" name="provincia" value={trabajador.info_vivienda.provincia} onChange={(e) => handleInputChange(e, 'info_vivienda')} readOnly />
              </Form.Group>
            </Col>
          </Row>

          {/* --- Sección 3: Info Seguros --- */}
          <hr className="my-4" />
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>AFP</Form.Label>
                <Select name="afp" options={opcionesAfp} value={trabajador.info_seguros.afp} onChange={(opt, act) => handleSelectChange(opt, act, 'info_seguros')} placeholder="Seleccione" isClearable required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Instituto de salud</Form.Label>
                <Select name="instituto_salud" options={opcionesSalud} value={trabajador.info_seguros.instituto_salud} onChange={(opt, act) => handleSelectChange(opt, act, 'info_seguros')} placeholder="Seleccione" isClearable required />
              </Form.Group>
            </Col>
            {/* Lógica condicional para Plan en UF */}
            {!esFonasa && (
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Plan en UF</Form.Label>
                  <Form.Control type="number" name="plan_uf" step="0.01" min="0" value={trabajador.info_seguros.plan_uf} onChange={(e) => handleInputChange(e, 'info_seguros')} required />
                </Form.Group>
              </Col>
            )}
          </Row>

          {/* --- Sección 4: Info Laboral y Contacto --- */}
          <hr className="my-4" />
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Cargo</Form.Label>
                <Select name="cargo" options={opcionesCargo} value={trabajador.info_laboral.cargo} onChange={(opt, act) => handleSelectChange(opt, act, 'info_laboral')} placeholder="Seleccione" isClearable required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Teléfono personal</Form.Label>
                <Form.Control type="number" name="telefono_personal" value={trabajador.info_contacto.telefono_personal} onChange={(e) => handleInputChange(e, 'info_contacto')} isInvalid={!telPersonalValido} required />
                <Form.Control.Feedback type="invalid">Debe tener al menos 8 dígitos</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Teléfono corporativo</Form.Label>
                <Form.Control type="number" name="telefono_corporativo" value={trabajador.info_contacto.telefono_corporativo} onChange={(e) => handleInputChange(e, 'info_contacto')} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Correo personal</Form.Label>
                <Form.Control type="email" name="correo_personal" value={trabajador.info_contacto.correo_personal} onChange={(e) => handleInputChange(e, 'info_contacto')} required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Correo corporativo</Form.Label>
                <Form.Control type="email" name="correo_corporativo" value={trabajador.info_contacto.correo_corporativo} onChange={(e) => handleInputChange(e, 'info_contacto')} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Label>Fotos carnet (frontal y reverso)</Form.Label>
              <Form.Group>
                <Form.Control type="file" className="mb-2" accept="image/*" onChange={(e) => handleFilePreview(e, setPreviewCarnetFrontal)} />
                {previewCarnetFrontal && <Image src={previewCarnetFrontal} alt="Frontal" style={{ maxWidth: '80px', maxHeight: '80px', marginRight: '10px' }} />}
              </Form.Group>
              <Form.Group>
                <Form.Control type="file" accept="image/*" onChange={(e) => handleFilePreview(e, setPreviewCarnetReverso)} />
                {previewCarnetReverso && <Image src={previewCarnetReverso} alt="Reverso" style={{ maxWidth: '80px', maxHeight: '80px', marginTop: '10px' }} />}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Forma de Pago</Form.Label>
                <Select name="forma_pago" options={opcionesFormaPago} value={trabajador.info_laboral.forma_pago} onChange={(opt, act) => handleSelectChange(opt, act, 'info_laboral')} placeholder="Seleccione" isClearable required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Fecha de ingreso</Form.Label>
                <Flatpickr
                  className="form-control"
                  placeholder="Seleccione fecha..."
                  name="fecha_ingreso"
                  value={trabajador.info_laboral.fecha_ingreso}
                  options={{ dateFormat: "Y-m-d", locale: Spanish, maxDate: "today" }}
                  onChange={(date) => handleDateChange(date, 'fecha_ingreso', 'info_laboral')}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Fecha de contrato</Form.Label>
                <Flatpickr
                  className="form-control"
                  placeholder="Seleccione fecha..."
                  name="fecha_contrato"
                  value={trabajador.info_laboral.fecha_contrato}
                  options={{ dateFormat: "Y-m-d", locale: Spanish, maxDate: "today" }}
                  onChange={(date) => handleDateChange(date, 'fecha_contrato', 'info_laboral')}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Jefe</Form.Label>
                <Select name="jefe_directo" options={opcionesJefe} value={trabajador.info_laboral.jefe_directo} onChange={(opt, act) => handleSelectChange(opt, act, 'info_laboral')} placeholder="Seleccione" isClearable required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Sueldo Base</Form.Label>
                <Form.Control type="number" name="sueldo_base" min="0" value={trabajador.info_laboral.sueldo_base} onChange={(e) => handleInputChange(e, 'info_laboral')} readOnly required />
              </Form.Group>
            </Col>
          </Row>

          {/* --- Sección 5: Documentos --- */}
          <hr className="my-4" />
          <h2 className="seccion-titulo">Documentos laborales y personales</h2>
          <Row className="g-3">

            {/* === Columna para Contratos === */}
            <Col md={4}>
              <h4>Contratos del Trabajador</h4>

              {/* Tabla de Contratos EXISTENTES */}
              <h5>Documentos Guardados</h5>
              <div className="table-responsive mb-3" style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #dee2e6' }}>
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {existingContratos.length === 0 ? (
                      <tr><td colSpan="2" className="text-center text-muted">No hay contratos guardados.</td></tr>
                    ) : (
                      existingContratos.map(doc => (
                        <tr key={doc.id}>
                          <td title={doc.nombre}>{doc.nombre}</td>
                          <td>
                            {/* 💡 Usa etiqueta 'a' para descarga directa desde URL */}
                            <Button as="a" variant="outline-success" size="sm" className="me-2" title="Descargar" href={doc.url} target="_blank" download={doc.nombre}>
                              <i className="bi bi-download"></i>
                            </Button>
                            <Button variant="outline-danger" size="sm" title="Eliminar Guardado" onClick={() => handleDeleteExistingDocument(doc.id, 'contrato')}> {/* 💡 NUEVA FUNCION */}
                              <i className="bi bi-trash"></i>
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>

              {/* Carga de Contratos NUEVOS */}
              <h5>Subir Nuevos Contratos</h5>
              <Form.Group className="mb-3">
                <Form.Control
                  type="file"
                  multiple
                  onChange={handleContratoUpload}
                  accept=".pdf,.doc,.docx"
                />
              </Form.Group>

              {/* Tabla de Contratos NUEVOS (a subir) */}
              <div className="table-responsive" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                <Table striped bordered hover size="sm">
                  {/* (El thead y tbody para contratosFiles se mantiene igual que antes) */}
                  <thead>
                    <tr>
                      <th>Nombre (Nuevo)</th>
                      <th>Tamaño</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contratosFiles.length === 0 ? (
                      <tr><td colSpan="3" className="text-center text-muted">No hay archivos nuevos para subir.</td></tr>
                    ) : (
                      contratosFiles.map(archivo => (
                        <tr key={archivo.id}>
                          <td title={archivo.name}>{archivo.name}</td>
                          <td>{Math.round(archivo.size / 1024)} KB</td>
                          <td>
                            {/* No hay descarga para archivos no subidos */}
                            <Button variant="outline-danger" size="sm" title="Eliminar Nuevo" onClick={() => handleContratoDelete(archivo.id)}>
                              <i className="bi bi-x-circle"></i> {/* Icono diferente */}
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Col>

            {/* === Columna para EPP === */}
            <Col md={4}>
              <h4>Registros de EPP</h4>

              {/* Tabla de EPP EXISTENTES */}
              <h5>Documentos Guardados</h5>
              <div className="table-responsive mb-3" style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #dee2e6' }}>
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {existingEpps.length === 0 ? (
                      <tr><td colSpan="2" className="text-center text-muted">No hay registros EPP guardados.</td></tr>
                    ) : (
                      existingEpps.map(doc => (
                        <tr key={doc.id}>
                          <td title={doc.nombre}>{doc.nombre}</td>
                          <td>
                            <Button as="a" variant="outline-success" size="sm" className="me-2" title="Descargar" href={doc.url} target="_blank" download={doc.nombre}>
                              <i className="bi bi-download"></i>
                            </Button>
                            <Button variant="outline-danger" size="sm" title="Eliminar Guardado" onClick={() => handleDeleteExistingDocument(doc.id, 'epp')}> {/* 💡 NUEVA FUNCION */}
                              <i className="bi bi-trash"></i>
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>

              {/* Carga de EPP NUEVOS */}
              <h5>Subir Nuevos Registros EPP</h5>
              <Form.Group className="mb-3">
                <Form.Control
                  type="file"
                  multiple
                  onChange={handleEppUpload}
                  accept=".pdf,.png,.jpg,.jpeg"
                />
              </Form.Group>

              {/* Tabla de EPP NUEVOS (a subir) */}
              <div className="table-responsive" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                <Table striped bordered hover size="sm">
                  {/* (El thead y tbody para eppFiles se mantiene igual que antes) */}
                  <thead>
                    <tr>
                      <th>Nombre (Nuevo)</th>
                      <th>Tamaño</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eppFiles.length === 0 ? (
                      <tr><td colSpan="3" className="text-center text-muted">No hay archivos nuevos para subir.</td></tr>
                    ) : (
                      eppFiles.map(archivo => (
                        <tr key={archivo.id}>
                          <td title={archivo.name}>{archivo.name}</td>
                          <td>{Math.round(archivo.size / 1024)} KB</td>
                          <td>
                            <Button variant="outline-danger" size="sm" title="Eliminar Nuevo" onClick={() => handleEppDelete(archivo.id)}>
                              <i className="bi bi-x-circle"></i>
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Col>

            {/* === 👇 NUEVA Columna para ODI 👇 === */}
            <Col md={4}> {/* Añadido md={4} */}
              <h4>Registros de ODI</h4>
              {/* Tabla ODI EXISTENTES */}
              <h5>Documentos Guardados</h5>
              <div className="table-responsive mb-3" style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #dee2e6' }}>
                <Table striped bordered hover size="sm">
                  <thead><tr><th>Nombre</th><th>Acciones</th></tr></thead>
                  <tbody>
                    {existingOdis.length === 0 ? (
                      <tr><td colSpan="2" className="text-center text-muted">No hay ODIs guardados.</td></tr>
                    ) : (
                      existingOdis.map(doc => (
                        <tr key={doc.id}>
                          <td title={doc.nombre}>{doc.nombre}</td>
                          <td>
                            <Button as="a" variant="outline-success" size="sm" className="me-2" title="Descargar" href={doc.url} target="_blank" download={doc.nombre}><i className="bi bi-download"></i></Button>
                            {/* Usa el handler genérico con tipo 'odi' */}
                            <Button variant="outline-danger" size="sm" title="Eliminar Guardado" onClick={() => handleDeleteExistingDocument(doc.id, 'odi')}><i className="bi bi-trash"></i></Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
              {/* Carga ODI NUEVOS */}
              <h5>Subir Nuevos Registros ODI</h5>
              <Form.Group className="mb-3">
                {/* Usa el handler handleOdiUpload */}
                <Form.Control type="file" multiple onChange={handleOdiUpload} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />
              </Form.Group>
              {/* Tabla ODI NUEVOS */}
              <div className="table-responsive" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                <Table striped bordered hover size="sm">
                  <thead><tr><th>Nombre (Nuevo)</th><th>Tamaño</th><th>Acciones</th></tr></thead>
                  <tbody>
                    {odiFiles.length === 0 ? (
                      <tr><td colSpan="3" className="text-center text-muted">No hay archivos nuevos.</td></tr>
                    ) : (
                      odiFiles.map(archivo => (
                        <tr key={archivo.id}>
                          <td title={archivo.name}>{archivo.name}</td>
                          <td>{Math.round(archivo.size / 1024)} KB</td>
                          <td>
                            {/* Usa el handler handleOdiDelete */}
                            <Button variant="outline-danger" size="sm" title="Eliminar Nuevo" onClick={() => handleOdiDelete(archivo.id)}><i className="bi bi-x-circle"></i></Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Col>

          </Row>

          {/* --- Botones --- */}
          <div className="mt-4 d-flex justify-content-end gap-2">
            <Button variant="secondary" type="button" onClick={mostrarTrabajadorEnConsola}>
              Ver JSON en consola
            </Button>
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : (trabajadorIdFromUrl ? 'Actualizar' : 'Guardar')}
            </Button>
          </div>

        </Form>
      </Card>

      {/* --- Modales --- */}
      <Modal show={showModalDescarga} onHide={() => setShowModalDescarga(false)} centered>
        <Modal.Header closeButton><Modal.Title>Confirmar Descarga</Modal.Title></Modal.Header>
        <Modal.Body>¿Desea descargar la imagen?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalDescarga(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleDescargarFoto}>Sí, descargar</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showModalEliminar} onHide={() => setShowModalEliminar(false)} centered>
        <Modal.Header closeButton><Modal.Title>Confirmar Eliminación</Modal.Title></Modal.Header>
        <Modal.Body>¿Está seguro que desea eliminar la foto?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalEliminar(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleEliminarFoto}>Sí, eliminar</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showModalEliminarDoc} onHide={handleCloseEliminarDocModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Está seguro que desea eliminar el documento guardado?
          {/* Muestra el nombre del archivo para confirmación */}
          {docToDelete.nombre && <p className="mt-2"><strong>Archivo:</strong> {docToDelete.nombre}</p>}
          <p className="text-danger small mt-2">Esta acción no se puede deshacer.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEliminarDocModal}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmDeleteDocument} disabled={isLoading}>
            {isLoading ? 'Eliminando...' : 'Sí, eliminar'}
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
}

export default DatosTrabajador;