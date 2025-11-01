// src/pages/Epp/GestionEppPage.jsx
import React, { useState, useEffect } from 'react';
// import { getAvailableEpps, generateEppPdf } from '../../services/api.epp'; <-- Original import reemplazar al conectar con API real
import { getAvailableEpps, generateEppPdf } from '../../services/api.epp.mock';
// IMPORTAMOS LA FUNCIÓN DE TU SERVICIO
import { buscarTrabajadores } from '../../services/api.trabajador'; 
import '../../styles/EppPage.css'; // Importamos el estilo


const GestionEppPage = () => {
    // --- ESTADOS ---
    const [searchType, setSearchType] = useState('rut');
    
    // Adaptamos los parámetros de búsqueda a lo que acepta tu función
    const [searchParams, setSearchParams] = useState({ 
        rut: '', 
        nombre: '' 
    });

    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);

    const [selectedWorker, setSelectedWorker] = useState(null);
    const [availableEpps, setAvailableEpps] = useState([]);
    const [eppRows, setEppRows] = useState([]);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    // --- EFECTOS ---
    useEffect(() => {
        // Cargar los EPPs disponibles al montar el componente
        const loadEpps = async () => {
            const epps = await getAvailableEpps();
            setAvailableEpps(epps);
        };
        loadEpps();
    }, []);

    // --- MANEJADORES DE BÚSQUEDA ---
    const handleSearchTypeChange = (e) => {
        setSearchType(e.target.id === 'searchByRut' ? 'rut' : 'data');
        setSearchParams({ rut: '', nombre: '' });
        setShowResults(false);
    };

    const handleSearchParamChange = (e) => {
        setSearchParams({ ...searchParams, [e.target.id]: e.target.value });
    };

    // FUNCIÓN handleSearch ACTUALIZADA
    const handleSearch = async () => {
        setIsLoadingSearch(true);
        setShowResults(true);
        setSearchResults([]);
        
        let paramsToSearch = {};
        
        if (searchType === 'rut') {
            if (!searchParams.rut) {
                alert('Ingrese un RUT para buscar');
                setIsLoadingSearch(false);
                return;
            }
            paramsToSearch = { rut: searchParams.rut };
        } else {
            if (!searchParams.nombre) {
                alert('Ingrese un nombre para buscar');
                setIsLoadingSearch(false);
                return;
            }
            paramsToSearch = { nombre: searchParams.nombre };
        }

        // Usamos tu función buscarTrabajadores
        const token = localStorage.getItem('access_token'); 
        
        try {
            const data = await buscarTrabajadores(paramsToSearch, token);
            // Asumimos que 'data' puede ser un objeto {trabajadores: []} o un array []
            const workers = data.trabajadores || (Array.isArray(data) ? data : []); 
            setSearchResults(workers);
        } catch (error) {
            console.error("Error al buscar trabajadores:", error);
            alert("Error al buscar trabajadores.");
            setSearchResults([]);
        } finally {
            setIsLoadingSearch(false);
        }
    };

    const handleSelectWorker = (worker) => {
        setSelectedWorker(worker);
        setShowResults(false);
        // Inicializa la tabla con una fila vacía
        setEppRows([{ id: 1, eppId: '', quantity: 1, date: new Date().toISOString().split('T')[0] }]);
    };

    // --- MANEJADORES DE TABLA EPP ---
    const handleAddEppRow = () => {
        const newId = eppRows.length > 0 ? Math.max(...eppRows.map(r => r.id)) + 1 : 1;
        setEppRows([...eppRows, { id: newId, eppId: '', quantity: 1, date: new Date().toISOString().split('T')[0] }]);
    };

    const handleRemoveEppRow = (id) => {
        setEppRows(eppRows.filter(row => row.id !== id));
    };

    const handleEppRowChange = (id, field, value) => {
        setEppRows(eppRows.map(row =>
            row.id === id ? { ...row, [field]: value } : row
        ));
    };

    // --- LÓGICA DE PDF ---
    const handleGeneratePdf = async () => {
        if (!selectedWorker) return;

        const elementos = eppRows
            .filter(row => row.eppId) // Solo filas con un EPP seleccionado
            .map(row => ({
                id_epp: parseInt(row.eppId),
                cantidad: row.quantity ? parseInt(row.quantity) : 1,
                fecha_entrega: row.date || null
            }));

        if (elementos.length === 0) {
            alert('Debe seleccionar al menos un EPP');
            return;
        }

        setIsGeneratingPdf(true);
        const rutSinFormato = selectedWorker.rut.split('-')[0];
        const payload = {
            rut: rutSinFormato,
            elementos: elementos
        };
        
        await generateEppPdf(payload);
        setIsGeneratingPdf(false);
    };

    // --- LÓGICA DE RENDERIZADO ---
    
    // Filtra EPPs para que no se puedan seleccionar duplicados
    const getEppOptionsForRow = (currentRowId) => {
        // IDs de EPP ya seleccionados en OTRAS filas
        const selectedEppIds = eppRows
            .filter(row => row.id !== currentRowId) 
            .map(row => row.eppId);
        
        return availableEpps.filter(epp => !selectedEppIds.includes(String(epp.id_epp)));
    };

    return (
        <div className="content">
            <div className="card p-4">
                <h1 className="card-title h3 m-0 mb-4">Gestión de Equipo de Protección Personal (EPP)</h1>

                {/* --- SECCIÓN DE BÚSQUEDA --- */}
                <div className="search-section">
                    <h2 className="h5 mb-3">Buscar Trabajador</h2>
                    <div className="btn-group w-100 mb-3" role="group">
                        <input type="radio" className="btn-check" name="searchType" id="searchByRut" checked={searchType === 'rut'} onChange={handleSearchTypeChange} />
                        <label className="btn btn-outline-primary" htmlFor="searchByRut">Búsqueda por RUT</label>
                        <input type="radio" className="btn-check" name="searchType" id="searchByData" checked={searchType === 'data'} onChange={handleSearchTypeChange} />
                        <label className="btn btn-outline-primary" htmlFor="searchByData">Búsqueda por Nombre</label>
                    </div>

                    {searchType === 'rut' ? (
                        <div className="row g-3 mb-3">
                            <div className="col-md-8">
                                <label htmlFor="rut" className="form-label">RUT:</label>
                                <input type="text" className="form-control" id="rut" value={searchParams.rut} onChange={handleSearchParamChange} placeholder="Ej: 12345678-9"/>
                            </div>
                            <div className="col-md-4 d-flex align-items-end">
                                <button className="btn btn-primary w-100" onClick={handleSearch} disabled={isLoadingSearch}>
                                    {isLoadingSearch ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-search"></i>} Buscar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="row g-3 mb-3">
                            <div className="col-md-8">
                                <label htmlFor="nombre" className="form-label">Nombre:</label>
                                <input type="text" className="form-control" id="nombre" value={searchParams.nombre} onChange={handleSearchParamChange} />
                            </div>
                            <div className="col-md-4 d-flex align-items-end">
                                <button className="btn btn-primary w-100" onClick={handleSearch} disabled={isLoadingSearch}>
                                    {isLoadingSearch ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-search"></i>} Buscar
                                </button>
                            </div>
                        </div>
                    )}

                    {showResults && (
                        <div>
                            <h3 className="h6 mb-2">Resultados:</h3>
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead><tr><th>RUT</th><th>Nombre</th><th>Apellido Paterno</th><th>Apellido Materno</th><th>Acción</th></tr></thead>
                                    <tbody>
                                        {isLoadingSearch && <tr><td colSpan="5" className="text-center"><span className="spinner-border spinner-border-sm"></span></td></tr>}
                                        {!isLoadingSearch && searchResults.length === 0 && <tr><td colSpan="5" className="text-center">No se encontraron trabajadores</td></tr>}
                                        {!isLoadingSearch && searchResults.map(worker => (
                                            <tr key={worker.id_trabajador}>
                                                <td>{worker.rut}</td>
                                                <td>{worker.nombre}</td>
                                                <td>{worker.apellido_paterno}</td>
                                                <td>{worker.apellido_materno}</td>
                                                <td><button className="btn btn-sm btn-primary" onClick={() => handleSelectWorker(worker)}>Seleccionar</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- SECCIÓN DATOS TRABAJADOR --- */}
                {selectedWorker && (
                    <div id="workerDataSection">
                        <div className="row g-3 mb-4">
                            <div className="col-md-6"><label className="form-label">RUT:</label><p className="form-control-plaintext">{selectedWorker.rut}</p></div>
                            <div className="col-md-6"><label className="form-label">Nombre:</label><p className="form-control-plaintext">{selectedWorker.nombre}</p></div>
                            <div className="col-md-6"><label className="form-label">Apellido Paterno:</label><p className="form-control-plaintext">{selectedWorker.apellido_paterno}</p></div>
                            <div className="col-md-6"><label className="form-label">Apellido Materno:</label><p className="form-control-plaintext">{selectedWorker.apellido_materno}</p></div>
                            <div className="col-md-6"><label className="form-label">Cargo:</label><p className="form-control-plaintext">{selectedWorker.cargo ? selectedWorker.cargo.nombre : 'Sin cargo'}</p></div>
                        </div>

                        <div className="mb-4"><p>Con el propósito de promover y mantener el nivel de seguridad y cumplimiento en lo establecido en la Ley Nº 16.744...</p></div>

                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h2 className="h5 m-0">Elementos de Protección Personal</h2>
                            <button className="btn btn-primary" onClick={handleAddEppRow}><i className="bi bi-plus-lg"></i> Agregar fila</button>
</div>

                        <div className="table-responsive">
                            <table id="eppTable" className="table">
                                <thead><tr><th>Nombre del EPP</th><th>Cantidad</th><th>Fecha de Entrega</th><th style={{width: '50px'}}></th></tr></thead>
                                <tbody>
                                    {eppRows.map(row => (
                                        <tr key={row.id}>
                                            <td>
                                                <select 
                                                    className="form-control" 
                                                    value={row.eppId} 
                                                    onChange={(e) => handleEppRowChange(row.id, 'eppId', e.target.value)}
                                                >
                                                    <option value="">Seleccione un EPP</option>
                                                    {getEppOptionsForRow(row.id).map(epp => (
                                                        <option key={epp.id_epp} value={epp.id_epp}>{epp.epp}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td><input type="number" min="1" className="form-control" value={row.quantity} onChange={(e) => handleEppRowChange(row.id, 'quantity', e.target.value)} /></td>
                                            <td><input type="date" className="form-control" value={row.date} onChange={(e) => handleEppRowChange(row.id, 'date', e.target.value)} /></td>
                                            <td><button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveEppRow(row.id)}><i className="bi bi-trash3-fill"></i></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 mb-4"><p>Certifico haber recibido los elementos de protección personal, como así también instrucciones para su correcto uso y reconozco la OBLIGACION DE USAR...</p></div>

                        <div className="d-flex justify-content-end mt-5 gap-2">
                            <button className="btn btn-primary" onClick={handleGeneratePdf} disabled={isGeneratingPdf}>
                                {isGeneratingPdf ? (
                                    <><span className="spinner-border spinner-border-sm me-2"></span>Generando...</>
                                ) : (
                                    <><i className="bi bi-file-earmark-pdf-fill"></i> Generar PDF</>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GestionEppPage;