// src/pages/Cargos/CargosPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
// import { getCargos, createCargo, updateCargo, deleteCargo } from '../../services/api.cargo'; <-- Original import reemplazar al conectar con API real
import { getCargos, createCargo, updateCargo, deleteCargo } from '../../services/api.cargo.mock'; // <-- Change to .mock.js
import '../../styles/CargosPage.css'; // Importamos los estilos que nos diste

const CargosPage = () => {
    // --- ESTADOS ---
    const [cargos, setCargos] = useState([]);
    const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
    const [editId, setEditId] = useState(null); // ID del cargo que estamos editando
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Para spinners/deshabilitar botones

    // --- EFECTOS ---
    // Carga inicial de cargos
    useEffect(() => {
        loadCargos();
    }, []);

    // --- FUNCIONES DE DATOS ---
    const loadCargos = async () => {
        setIsLoading(true);
        try {
            const data = await getCargos();
            setCargos(data);
        } catch (error) {
            alert(`Error al cargar cargos: ${error.message}`);
        }
        setIsLoading(false);
    };

    // --- MANEJADORES DE EVENTOS ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleDownloadPdf = () => {
        // Replicamos la funcionalidad original
        alert("Su PDF se descargó correctamente.");
    };

    // Maneja la creación o actualización de un cargo
    const handleSubmit = async (e) => {
        e.preventDefault();
        const { nombre, descripcion } = formData;

        if (!nombre) {
            alert('El nombre del cargo es obligatorio.');
            return;
        }

        // Validar si el nombre ya existe (excepto si estamos editando el mismo cargo)
        const nombreExistente = cargos.find(c => 
            c.nombre.toLowerCase() === nombre.toLowerCase() && c.id !== editId
        );
        if (nombreExistente) {
            alert('El nombre de este cargo ya existe.');
            return;
        }

        setIsLoading(true);
        try {
            if (editId) {
                // --- Lógica de Actualización (Usando la nueva API) ---
                await updateCargo(editId, nombre, descripcion);
                alert('Cargo actualizado correctamente.');
            } else {
                // --- Lógica de Creación (Usando la API) ---
                await createCargo(nombre, descripcion);
                alert('Cargo guardado correctamente.');
            }
            
            // Limpiar y recargar la lista
            setFormData({ nombre: '', descripcion: '' });
            setEditId(null);
            await loadCargos();

        } catch (error) {
            alert(`Error al guardar el cargo: ${error.message}`);
        }
        setIsLoading(false);
    };

    // Prepara el formulario para editar un cargo
    const handleEdit = (cargo) => {
        setFormData({ nombre: cargo.nombre, descripcion: cargo.descripcion });
        setEditId(cargo.id);
        window.scrollTo(0, 0); // Sube al inicio de la página para ver el form
    };

    // Elimina un cargo (Usando la nueva API)
    const handleDelete = async (cargo) => {
        if (confirm(`¿Está seguro de que quiere eliminar el cargo "${cargo.nombre}"?`)) {
            setIsLoading(true);
            try {
                await deleteCargo(cargo.id);
                alert('Cargo eliminado.');
                // Si estamos editando el cargo que se eliminó, limpiar el form
                if (editId === cargo.id) {
                    setEditId(null);
                    setFormData({ nombre: '', descripcion: '' });
                }
                await loadCargos();
            } catch (error) {
                alert(`Error al eliminar el cargo: ${error.message}`);
            }
            setIsLoading(false);
        }
    };

    // --- RENDERIZADO ---
    // Usamos useMemo para que la lista no se recalcule si no cambian los cargos o el filtro
    const cargosFiltrados = useMemo(() => {
        return cargos.filter(c =>
            c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [cargos, searchTerm]);

    return (
        // El div "content" fue removido. El "card" es ahora el elemento raíz.
        <div className="card py-4 px-4">
            <h2 className="mb-4">Gestión de Cargos</h2>

            {/* Formulario para agregar/editar cargos */}
            <form id="formCargo" className="mb-4" onSubmit={handleSubmit}>
                <h5 className="mb-3">{editId ? 'Editando Cargo' : 'Agregar Nuevo Cargo'}</h5>
                <div className="mb-3">
                    <label htmlFor="nombreCargo" className="form-label">Nombre del Cargo</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        id="nombreCargo" 
                        name="nombre" // 'name' debe coincidir con el estado
                        value={formData.nombre}
                        onChange={handleInputChange}
                        required 
                        maxLength="60"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="descripcionCargo" className="form-label">Descripción</label>
                    <textarea 
                        className="form-control" 
                        id="descripcionCargo" 
                        name="descripcion" // 'name' debe coincidir con el estado
                        value={formData.descripcion}
                        onChange={handleInputChange}
                        rows="5" 
                        maxLength="300"
                    ></textarea>
                </div>
                <div className="mt-4 d-flex justify-content-end gap-2">
                    {editId && (
                        <button type="button" className="btn btn-secondary" onClick={() => { setEditId(null); setFormData({ nombre: '', descripcion: '' }); }}>
                            Cancelar Edición
                        </button>
                    )}
                    <button type="submit" className="btn btn-guardar-cargo" disabled={isLoading}>
                        {isLoading ? 'Guardando...' : (editId ? 'Actualizar Cargo' : 'Guardar Cargo')}
                    </button>
                </div>
            </form>

            {/* Lista de cargos */}
            <div className="card shadow-sm">
                <div className="card-body">
                    <h5 className="card-title mb-3">Cargos Registrados</h5>

                    <div className="d-flex justify-content-between mb-3 flex-wrap gap-2">
                        <input 
                            type="text" 
                            id="buscadorCargo" 
                            className="form-control" 
                            placeholder="Buscar por nombre de cargo..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            style={{ maxWidth: '400px' }}
                        />
                        <button type="button" className="btn btn-outline-primary" id="btnDescargarPDF" onClick={handleDownloadPdf}>
                            <i className="bi bi-file-earmark-arrow-down"></i> Descargar en PDF
                        </button>
                    </div>

                    <div className="scrollable-list">
                        <ul className="list-group" id="listaCargos">
                            {isLoading && cargosFiltrados.length === 0 && (
                                <li className="list-group-item text-center text-muted">Cargando...</li>
                            )}
                            {!isLoading && cargosFiltrados.length === 0 && (
                                <li className="list-group-item text-center text-muted">
                                    {searchTerm ? 'No se encontraron coincidencias.' : 'No hay cargos registrados.'}
                                </li>
                            )}
                            {cargosFiltrados.map(cargo => (
                                <li key={cargo.id} className="list-group-item fade-in">
                                    <span>
                                        <strong>{cargo.nombre}</strong><br />
                                        <small>{cargo.descripcion}</small>
                                    </span>
                                    <div className="d-flex">
                                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(cargo)} disabled={isLoading}>
                                            <i className="bi bi-pencil"></i>
                                        </button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(cargo)} disabled={isLoading}>
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CargosPage;