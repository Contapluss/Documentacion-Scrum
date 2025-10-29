// src/pages/Odi/OdiPage.jsx
import React, { useState, useEffect } from 'react';
// import { getOdiActivities, createOdiActivity, generateOdiPdf } from '../../services/api.odi'; <-- Original import reemplazar al conectar con API real
import { getOdiActivities, createOdiActivity, generateOdiPdf } from '../../services/api.odi.mock'; 
import { Modal, Button } from 'react-bootstrap'; // Usaremos react-bootstrap para un manejo más simple del modal
import '../../styles/OdiPage.css'; // Importamos los estilos

// Para usar react-bootstrap, primero instálalo: npm install react-bootstrap bootstrap

const OdiPage = () => {
    // --- ESTADOS DEL COMPONENTE ---

    // Almacena la lista de actividades ODI que vienen de la API
    const [allActivities, setAllActivities] = useState([]);
    // Almacena los datos del trabajador del formulario superior
    const [workerData, setWorkerData] = useState({
        nombre: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        rut: '',
        cargo: '',
        fecha: new Date().toISOString().split('T')[0], // Fecha actual por defecto
    });
    // Almacena las filas de la tabla que el usuario va agregando
    const [tableRows, setTableRows] = useState([]);
    // Controla la visibilidad del modal para crear una nueva ODI
    const [showCreateModal, setShowCreateModal] = useState(false);
    // Almacena los datos del formulario dentro del modal
    const [newOdiData, setNewOdiData] = useState({
        actividad: '',
        peligros: '',
        consecuencias: '',
        medidas: '',
    });
    // Estados para controlar los spinners de carga en los botones
    const [isCreatingOdi, setIsCreatingOdi] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);


    // --- EFECTOS (LIFECYCLE) ---

    // Cargar las actividades ODI desde la API cuando el componente se monta por primera vez
    useEffect(() => {
        const loadActivities = async () => {
            const activities = await getOdiActivities();
            setAllActivities(activities);
        };
        loadActivities();
    }, []);


    // --- MANEJADORES DE EVENTOS ---

    // Maneja los cambios en los inputs del formulario del trabajador
    const handleWorkerDataChange = (e) => {
        const { id, value } = e.target;
        
        // Validación para permitir solo letras en campos de nombre/apellidos
        if (['nombre', 'apellidoPaterno', 'apellidoMaterno'].includes(id)) {
            if (/[0-9]/.test(value)) {
                return; // Si se detecta un número, no actualiza el estado
            }
        }
        
        setWorkerData(prevData => ({ ...prevData, [id]: value }));
    };

    // Agrega una nueva fila vacía a la tabla
    const handleAddRow = () => {
        const newRow = {
            id: Date.now(), // ID único para la fila
            selectedActivityId: '',
            peligros: '',
            consecuencias: '',
            medidas: '',
        };
        setTableRows(prevRows => [...prevRows, newRow]);
    };

    // Elimina una fila de la tabla por su ID
    const handleRemoveRow = (rowId) => {
        setTableRows(prevRows => prevRows.filter(row => row.id !== rowId));
    };

    // Maneja el cambio en el <select> de una fila específica
    const handleRowSelectChange = (e, rowId) => {
        const selectedId = e.target.value;
        const selectedActivity = allActivities.find(act => act.id === parseInt(selectedId));

        setTableRows(prevRows => prevRows.map(row => {
            if (row.id === rowId) {
                if (selectedActivity) {
                    return {
                        ...row,
                        selectedActivityId: selectedId,
                        peligros: selectedActivity.peligros,
                        consecuencias: selectedActivity.consecuencias,
                        medidas: selectedActivity.medidas,
                    };
                }
                // Si des-selecciona (vuelve a "Seleccione una actividad")
                return { ...row, selectedActivityId: '', peligros: '', consecuencias: '', medidas: '' };
            }
            return row;
        }));
    };

    // Maneja los cambios en los inputs del formulario del modal
    const handleNewOdiDataChange = (e) => {
        const { id, value } = e.target;
        setNewOdiData(prevData => ({ ...prevData, [id]: value.replace('modal', '').toLowerCase() }));
    };
    
    // Lógica para guardar una nueva actividad ODI desde el modal
    const handleSaveNewOdi = async () => {
        if (!newOdiData.actividad || !newOdiData.peligros || !newOdiData.consecuencias || !newOdiData.medidas) {
            alert('Por favor, complete todos los campos obligatorios.');
            return;
        }
        setIsCreatingOdi(true);
        const createdOdi = await createOdiActivity(newOdiData);
        if (createdOdi) {
            // Re-mapeamos la respuesta para que coincida con nuestro estado
            const newActivity = {
                id: createdOdi.id_odi,
                actividad: createdOdi.tarea,
                peligros: createdOdi.riesgo,
                consecuencias: createdOdi.consecuencias,
                medidas: createdOdi.precaucion
            };
            setAllActivities(prev => [...prev, newActivity]);
            setShowCreateModal(false);
            setNewOdiData({ actividad: '', peligros: '', consecuencias: '', medidas: '' });
        }
        setIsCreatingOdi(false);
    };

    // Lógica para generar y descargar el PDF
    const handleGeneratePdf = async () => {
        const { nombre, apellidoPaterno, apellidoMaterno, rut, cargo } = workerData;
        if (!nombre || !apellidoPaterno || !apellidoMaterno || !rut || !cargo) {
            alert('Por favor, complete todos los datos del trabajador antes de generar el PDF.');
            return;
        }

        const elementos = tableRows
            .map(row => parseInt(row.selectedActivityId))
            .filter(id => !isNaN(id));

        if (elementos.length === 0) {
            alert('Por favor, agregue y seleccione al menos una actividad.');
            return;
        }
        
        setIsGeneratingPdf(true);
        const pdfPayload = {
            nombre: `${nombre} ${apellidoPaterno} ${apellidoMaterno}`,
            rut: rut,
            cargo: cargo,
            empresa_nombre: "", // La API se encarga de esto
            empresa_rut: "",    // La API se encarga de esto
            elementos: elementos
        };
        await generateOdiPdf(pdfPayload);
        setIsGeneratingPdf(false);
    };


    // --- RENDERIZADO DEL COMPONENTE ---

    return (
        <div className="content">
            <div className="card p-4 card-odi">
                <div className="d-flex justify-content-between align-items-center">
                    <h1 className="card-title h3 m-0">Obligación de Informar (ODI) - Actividad a Realizar</h1>
                    <button className="btn btn-primary" onClick={handleGeneratePdf} disabled={isGeneratingPdf}>
                        {isGeneratingPdf ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Generando PDF...
                            </>
                        ) : 'Descargar PDF'}
                    </button>
                </div>
                <hr />
                
                {/* Formulario de datos del trabajador */}
                <div className="mb-4">
                    <div className="row g-3 mb-3">
                        <div className="col-md-6">
                            <label htmlFor="apellidoPaterno" className="form-label">Apellido Paterno:</label>
                            <input type="text" className="form-control" id="apellidoPaterno" value={workerData.apellidoPaterno} onChange={handleWorkerDataChange} />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="apellidoMaterno" className="form-label">Apellido Materno:</label>
                            <input type="text" className="form-control" id="apellidoMaterno" value={workerData.apellidoMaterno} onChange={handleWorkerDataChange} />
                        </div>
                    </div>
                    <div className="row g-3 mb-3">
                        <div className="col-md-6">
                            <label htmlFor="nombre" className="form-label">Nombres:</label>
                            <input type="text" className="form-control" id="nombre" value={workerData.nombre} onChange={handleWorkerDataChange} />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="rut" className="form-label">RUT:</label>
                            <input type="text" className="form-control" id="rut" value={workerData.rut} onChange={handleWorkerDataChange} placeholder="12345678-9"/>
                        </div>
                    </div>
                    <div className="row g-3 mb-3">
                        <div className="col-md-6">
                            <label htmlFor="cargo" className="form-label">Cargo:</label>
                            <input type="text" className="form-control" id="cargo" value={workerData.cargo} onChange={handleWorkerDataChange} />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="fecha" className="form-label">Fecha:</label>
                            <input type="date" className="form-control" id="fecha" value={workerData.fecha} onChange={handleWorkerDataChange} />
                        </div>
                    </div>
                </div>

                {/* Textos informativos */}
                <div className="card p-3 mb-4">
                     <p>De acuerdo a lo establecido en el artículo 8 del Decreto N° 18, de 23 de abril de 2020, &lt;Nombre de la Empresa&gt; procede a informar sobre el riesgo que entrañan las actividades asociadas a su trabajo, indicando las instrucciones, métodos de trabajo y medidas preventivas necesarias para evitar los potenciales accidentes del trabajo y/o enfermedades profesionales, las cuales se le solicita leer y cumplir con todo esmero en beneficio de su propia salud.</p>
                     <p>Los trabajadores tienen el derecho a desistir realizar un trabajo, si éste pone en peligro su vida, por falta de medidas de seguridad. A su vez los trabajadores se comprometen a informar toda acción o condición subestándar y cumplir todas las instrucciones recibidas para evitar accidentes en el trabajo y disminuir o evitar los impactos al medio ambiente.</p>
                </div>

                {/* Botones de acción de la tabla */}
                <div className="acciones-tabla">
                    <button className="btn btn-crear-odi" onClick={() => setShowCreateModal(true)}>
                        <i className="bi bi-plus-circle"></i> Crear ODI
                    </button>
                    <button className="btn btn-dark" onClick={handleAddRow}>
                        <i className="bi bi-plus"></i> Agregar fila
                    </button>
                </div>

                {/* Tabla de actividades */}
                <div className="table-responsive">
                    <table className="table table-bordered tabla-odi">
                        <thead>
                            <tr>
                                <th>Actividad/Tarea a Realizar</th>
                                <th>Peligros</th>
                                <th>Consecuencias</th>
                                <th>Medidas de Control</th>
                                <th style={{ width: '50px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableRows.map((row) => (
                                <tr key={row.id}>
                                    <td>
                                        <select 
                                            className="form-control" 
                                            value={row.selectedActivityId} 
                                            onChange={(e) => handleRowSelectChange(e, row.id)}
                                        >
                                            <option value="">Seleccione una actividad...</option>
                                            {allActivities.map(act => (
                                                <option key={act.id} value={act.id}>{act.actividad}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td><textarea className="form-control" rows="3" value={row.peligros} readOnly /></td>
                                    <td><textarea className="form-control" rows="3" value={row.consecuencias} readOnly /></td>
                                    <td><textarea className="form-control" rows="3" value={row.medidas} readOnly /></td>
                                    <td className="text-center">
                                        <button className="btn btn-danger btn-sm" onClick={() => handleRemoveRow(row.id)}>
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Declaración final */}
                <div className="card p-3 my-4">
                    <p>Declaro que he sido informado y he comprendido acerca de todos los riesgos asociados a mi área de trabajo, cómo también de las medidas preventivas y procedimientos de trabajo seguro que deberé aplicar y respetar en el desempeño de mis funciones.</p>
                </div>
                <div className="row mt-5">
                    <div className="col-md-6 text-center"><hr /><p>Firma y timbre empresa</p></div>
                    <div className="col-md-6 text-center"><hr /><p>Firma y Rut trabajador</p></div>
                </div>
            </div>

            {/* Modal para Crear Nueva Actividad ODI */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
                <Modal.Header closeButton className="modal-header-custom">
                    <Modal.Title>
                        <i className="bi bi-file-earmark-plus"></i> Crear Nueva Actividad ODI
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form>
                        <div className="mb-3">
                            <label htmlFor="modalActividad" className="form-label">Actividad/Tarea a Realizar <span className="text-danger">*</span></label>
                            <textarea className="form-control" id="actividad" rows="3" required value={newOdiData.actividad} onChange={handleNewOdiDataChange}></textarea>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="modalPeligros" className="form-label">Peligros <span className="text-danger">*</span></label>
                            <textarea className="form-control" id="peligros" rows="3" required value={newOdiData.peligros} onChange={handleNewOdiDataChange}></textarea>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="modalConsecuencias" className="form-label">Consecuencias <span className="text-danger">*</span></label>
                            <textarea className="form-control" id="consecuencias" rows="3" required value={newOdiData.consecuencias} onChange={handleNewOdiDataChange}></textarea>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="modalMedidas" className="form-label">Medidas de Control <span className="text-danger">*</span></label>
                            <textarea className="form-control" id="medidas" rows="3" required value={newOdiData.medidas} onChange={handleNewOdiDataChange}></textarea>
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={() => setShowCreateModal(false)}>
                        <i className="bi bi-x-circle"></i> Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleSaveNewOdi} disabled={isCreatingOdi}>
                        {isCreatingOdi ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Creando...
                            </>
                        ) : <><i className="bi bi-check-circle"></i> Crear</>}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default OdiPage;