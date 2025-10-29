// src/pages/Epp/CrearEppPage.jsx
import React, { useState } from 'react';
// import { createEppItems } from '../../services/api.epp'; <-- Original import reemplazar al conectar con API real
import { createEppItems } from '../../services/api.epp.mock'; // <-- Use mock

const CrearEppPage = () => {
    // Estado para las filas de la tabla
    const [rows, setRows] = useState([
        { id: 1, nombre: '', descripcion: '' }
    ]);
    const [isSaving, setIsSaving] = useState(false);

    // Añade una nueva fila
    const handleAddRow = () => {
        const newId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
        setRows([...rows, { id: newId, nombre: '', descripcion: '' }]);
    };

    // Elimina una fila por su id
    const handleDeleteRow = (id) => {
        if (rows.length <= 1) return; // No permitir eliminar la última fila
        setRows(rows.filter(row => row.id !== id));
    };

    // Maneja el cambio en un input de la fila
    const handleRowChange = (id, field, value) => {
        setRows(rows.map(row => 
            row.id === id ? { ...row, [field]: value } : row
        ));
    };

    // Guarda todos los EPPs
    const handleSave = async () => {
        // Validar que no haya campos vacíos
        for (const row of rows) {
            if (!row.nombre || !row.descripcion) {
                alert("Por favor, complete todos los campos antes de guardar.");
                return;
            }
        }
        setIsSaving(true);
        // Enviar solo nombre y desc (quitamos el 'id' temporal del frontend)
        const eppData = rows.map(({ id, ...data }) => data); 
        
        await createEppItems(eppData);
        
        setIsSaving(false);
        // Limpiar filas después de guardar
        setRows([{ id: 1, nombre: '', descripcion: '' }]);
    };

    return (
        <div className="content">
            <div className="card p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="card-title h3 m-0">Creación de Equipos de Protección Personal (EPP)</h1>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="h5 m-0">Agregar Nuevos EPP</h2>
                    <button id="addRowBtn" className="btn btn-primary" onClick={handleAddRow}>
                        <i className="bi bi-plus-lg"></i> Agregar fila
                    </button>
                </div>

                <div className="table-responsive">
                    <table id="eppCreationTable" className="table">
                        <thead>
                            <tr>
                                <th>Nombre del EPP</th>
                                <th>Descripción</th>
                                <th style={{ width: '50px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.id}>
                                    <td>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={row.nombre}
                                            onChange={(e) => handleRowChange(row.id, 'nombre', e.target.value)}
                                            required 
                                        />
                                    </td>
                                    <td>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={row.descripcion}
                                            onChange={(e) => handleRowChange(row.id, 'descripcion', e.target.value)}
                                            required 
                                        />
                                    </td>
                                    <td>
                                        <button 
                                            type="button" 
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDeleteRow(row.id)}
                                            disabled={rows.length <= 1} // Deshabilitar si es la última fila
                                        >
                                            <i className="bi bi-trash3-fill"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="text-end mt-4">
                    <button id="saveBtn" className="btn btn-success" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Guardando...
                            </>
                        ) : (
                            <><i className="bi bi-floppy-fill"></i> Guardar</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CrearEppPage;