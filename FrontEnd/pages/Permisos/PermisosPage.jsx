// src/pages/Permisos/PermisosPage.jsx
import React, { useState, useEffect } from 'react';
// Ya no necesitamos useParams
import { jsPDF } from 'jspdf';
//import { enviarSolicitudPermiso, aceptarPermiso, rechazarPermiso } from '../../services/api.permisos'; <-- Original import reemplazar al conectar con API real
import { enviarSolicitudPermiso, aceptarPermiso, rechazarPermiso } from '../../services/api.permisos.mock'; // <-- Change to .mock.js
import '../../styles/PermisosPage.css';

// Objeto para mapear el tipo de permiso a un título legible
const permisoDetails = {
    'feriado': { title: 'Solicitud de Feriado' },
    'con-goce': { title: 'Solicitud de Permiso Con Goce de Sueldo' },
    'sin-goce': { title: 'Solicitud de Permiso Sin Goce de Sueldo' },
};

const PermisosPage = () => {
    // --- ESTADOS DEL COMPONENTE ---
    
    // NUEVO: Estado para guardar el tipo de permiso seleccionado en el dropdown
    const [selectedPermiso, setSelectedPermiso] = useState(''); 

    const [formData, setFormData] = useState({
        nombre: '',
        rut: '',
        fechaInicio: '',
        fechaTermino: '',
    });
    const [solicitudes, setSolicitudes] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- EFECTOS ---

    // Actualiza el título de la pestaña del navegador cuando cambia el permiso seleccionado
    useEffect(() => {
        const title = permisoDetails[selectedPermiso]?.title || 'Solicitud de Permiso';
        document.title = title;
    }, [selectedPermiso]);

    // --- MANEJADORES DE EVENTOS ---
    
    // NUEVO: Manejador para el cambio en el selector de tipo de permiso
    const handlePermisoChange = (e) => {
        setSelectedPermiso(e.target.value);
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        if (id === 'nombre' && /[0-9]/.test(value)) return;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validación para asegurarse de que se ha seleccionado un tipo de permiso
        if (!selectedPermiso) {
            alert('Por favor, seleccione un tipo de permiso.');
            return;
        }
        if (!formData.nombre || !formData.rut || !formData.fechaInicio || !formData.fechaTermino) {
            alert('Por favor, complete todos los campos del formulario.');
            return;
        }

        setIsSubmitting(true);
        const nuevaSolicitud = {
            ...formData,
            tipo: permisoDetails[selectedPermiso].title,
        };
        const respuesta = await enviarSolicitudPermiso(nuevaSolicitud);
        if (respuesta) {
            setSolicitudes(prev => [...prev, respuesta]);
            alert('Solicitud enviada correctamente.');
            setFormData({ nombre: '', rut: '', fechaInicio: '', fechaTermino: '' }); // Limpiar formulario
        }
        setIsSubmitting(false);
    };

    const handleDownloadPdf = () => {
        if (!selectedPermiso) {
            alert('Por favor, seleccione un tipo de permiso para descargar el PDF.');
            return;
        }
        const { nombre, rut, fechaInicio, fechaTermino } = formData;
        if (!nombre || !rut || !fechaInicio || !fechaTermino) {
            alert('Por favor, complete todos los campos para descargar el PDF.');
            return;
        }
        
        const doc = new jsPDF();
        const title = permisoDetails[selectedPermiso].title;
        doc.setFontSize(18);
        doc.text(title, 10, 20);
        // ... (resto de la lógica del PDF sin cambios) ...
        doc.setFontSize(12);
        doc.text(`Solicitante: ${nombre}`, 10, 40);
        doc.text(`RUT: ${rut}`, 10, 50);
        doc.text(`Período: ${fechaInicio} a ${fechaTermino}`, 10, 60);
        doc.text('_____________________________', 10, 200);
        doc.text('Firma del Solicitante', 10, 210);
        doc.save(`${title.replace(/\s/g, '_')}_${nombre}.pdf`);
    };
    
    // Las funciones handleAceptar y handleRechazar no necesitan cambios.
    const handleAceptar = async (id) => { /* ... sin cambios ... */ };
    const handleRechazar = async (id) => { /* ... sin cambios ... */ };


    // --- RENDERIZADO DEL COMPONENTE ---
    return (
        <div className="content">
            <div className="card p-4 card-solicitud">
                {/* El título ahora es dinámico según el estado del selector */}
                <h1 className="card-title h3 m-0">
                    {permisoDetails[selectedPermiso]?.title || 'Seleccione un Tipo de Permiso'}
                </h1>
                <hr />

                <form onSubmit={handleSubmit} className="row g-3">
                    {/* NUEVO: Selector de Tipo de Permiso */}
                    <div className="col-12">
                        <label htmlFor="tipoPermisoSelect" className="form-label">Tipo de Permiso</label>
                        <select 
                            id="tipoPermisoSelect" 
                            className="form-select" 
                            value={selectedPermiso} 
                            onChange={handlePermisoChange}
                        >
                            <option value="" disabled>-- Elija una opción --</option>
                            <option value="con-goce">Permiso Con Goce de Sueldo</option>
                            <option value="sin-goce">Permiso Sin Goce de Sueldo</option>
                            <option value="feriado">Feriado</option>
                        </select>
                    </div>

                    {/* El resto del formulario se deshabilita hasta que se elija un tipo */}
                    <fieldset disabled={!selectedPermiso} className="row g-3 m-0 p-0">
                        <div className="col-md-6">
                            <label htmlFor="nombre" className="form-label">Nombre</label>
                            <input type="text" className="form-control" id="nombre" value={formData.nombre} onChange={handleChange} />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="rut" className="form-label">RUT</label>
                            <input type="text" className="form-control" id="rut" value={formData.rut} onChange={handleChange} maxLength="12" />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="fechaInicio" className="form-label">Periodo Desde</label>
                            <input type="date" className="form-control" id="fechaInicio" value={formData.fechaInicio} onChange={handleChange} />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="fechaTermino" className="form-label">Periodo Hasta</label>
                            <input type="date" className="form-control" id="fechaTermino" value={formData.fechaTermino} onChange={handleChange} />
                        </div>
                    </fieldset>
                    
                    <div className="col-12 mt-4 text-end">
                        <button type="button" className="btn btn-primary me-2" onClick={handleDownloadPdf} disabled={!selectedPermiso}>
                            <i className="bi bi-file-earmark-arrow-down-fill"></i> Descargar PDF
                        </button>
                        <button type="submit" className="btn btn-success" disabled={isSubmitting || !selectedPermiso}>
                            {isSubmitting ? <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> : <i className="bi bi-send-fill"></i>}
                            {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
                        </button>
                    </div>
                </form>
            </div>

            {/* La tabla de solicitudes pendientes no necesita cambios */}
            <div className="card p-4">
                {/* ... (código de la tabla sin cambios) ... */}
            </div>
        </div>
    );
};

export default PermisosPage;