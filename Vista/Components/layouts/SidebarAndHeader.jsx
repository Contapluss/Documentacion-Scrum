// src/Components/layout/SidebarAndHeader.jsx (CORREGIDO)

import React, { useState, useEffect } from 'react';
import { Link, Outlet , useNavigate} from 'react-router-dom';
import { Navbar, Button, Offcanvas, Dropdown, Nav, Accordion } from 'react-bootstrap';
import '../../styles/SidebarAndHeader.css';
import { useAuth } from '../../hooks/AuthContext';

function SidebarAndHeader() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // optener los datos y la funcion de cierre de sesion
    const {user, logout} = useAuth();
    const navigate = useNavigate();

    // 2. Variables Dinámicas: Calcular datos del usuario
    // Usamos valores por defecto seguros si algunas propiedades vienen undefined
    const roleName = user && user.rolNombre ? String(user.rolNombre) : 'ROL';
    const userName = user ? `ID: ${user.id ?? '—'} (${roleName})` : 'Cargando...';
    const userRole = roleName.toUpperCase();
    // Obtener la inicial del nombre o ID
    const userInitial = user ? (user.id ? String(user.id).trim().charAt(0).toUpperCase() : 'U') : '?';

    const handleToggleSidebar = () => setIsSidebarOpen(true);
    const handleCloseSidebar = () => setIsSidebarOpen(false);

    // Lógica para el efecto de "empujar" (body.sidebar-open)
    useEffect(() => {
        if (isSidebarOpen) {
            document.body.classList.add('sidebar-open');
        } else {
            document.body.classList.remove('sidebar-open');
        }
        return () => {
            document.body.classList.remove('sidebar-open');
        };
    }, [isSidebarOpen]);

    // 3. Implementación del Logout
    const handleLogout = () => {
        logout(); // Limpia el estado global y localStorage
        navigate('/', { replace: true }); // Redirige al login y limpia el historial de navegación
    };

    return (
        <>
            {/* ========================================================= */}
            {/* 1. HEADER (NAVBAR) */}
            {/* ========================================================= */}
            <Navbar className="header" fixed="top">

                {/* Botón hamburguesa */}
                <Button
                    id="toggleSidebar"
                    className={`btn-toggle ${isSidebarOpen ? 'hide' : ''}`}
                    onClick={handleToggleSidebar}
                >
                    <i className="bi bi-list"></i>
                </Button>

                <div className="header-brand">
                    <img src="\logo-crop.png" alt="Logo Contaplus" className="header-logo" />
                    <span className="header-title">CONTAPLUS</span>
                </div>

                {/* Contenedor derecho para iconos/perfil */}
                <Nav className="ms-auto me-3 align-items-center">

                    {/* Menú de Perfil (Dropdown) */}
                    {/* Se usa align="end" para que se alinee a la derecha */}
                    <Dropdown align="end" className="custom-dropdown-container">
                        {/* Se usa as="span" para evitar que Dropdown.Toggle use estilos de botón por defecto. */}
                        <Dropdown.Toggle
                            as="span"
                            id="profileIcon"
                            className="profile-icon" // Aplica tu clase CSS directa
                        >
                            {userInitial}
                        </Dropdown.Toggle>

                        {/* Dropdown Menu - Necesita estilos CSS específicos para el Header y el botón de Logout */}
                        <Dropdown.Menu className="dropdown-menu-custom">
                            <Dropdown.Header className="text-center">
                                <h6 className="user-name mt-2 mb-0">{userName}</h6>
                                <small className="text-muted">{userRole}</small>
                            </Dropdown.Header>
                            <Dropdown.Divider />
                            <Dropdown.Item as={Link} to="/perfil">Mi Perfil</Dropdown.Item>

                            {/* Ajuste importante: Wrap el botón en un div para centrarlo y darle el margen */}
                            <div className="p-2 pt-0">
                                <Button onClick={handleLogout} id="logoutBtn" className="w-100">
                                    <i className="bi bi-box-arrow-right me-2"></i> Cerrar Sesión
                                </Button>
                            </div>
                        </Dropdown.Menu>
                    </Dropdown>
                </Nav>
            </Navbar>


            {/* ========================================================= */}
            {/* 2. SIDEBAR (OFFCANVAS) - Ajuste de Contenedor */}
            {/* ========================================================= */}
            <Offcanvas
                show={isSidebarOpen}
                onHide={handleCloseSidebar}
                placement="start"
                id="sidebar"
                className="sidebar" // Aplica tu clase CSS .sidebar
                scroll={true} // Permite el scroll del body
                backdrop={true} // Deshabilita el fondo oscuro por defecto
            >
                <div className="sidebar-header">
                    <div className="logo-title">
                        <img src="/logo-crop.png" alt="Logo Contaplus" className="logo-sidebar" />
                        <h5 className="brand-title">CONTAPLUS</h5>
                    </div>
                    <Button
                        variant="link"
                        onClick={handleCloseSidebar}
                        className="custom-close"
                        id="closeSidebar"
                    >
                        <i className="bi bi-x-lg"></i>
                    </Button>
                </div>

                {/* Cuerpo del Sidebar con el Acordeón */}
                <Offcanvas.Body className="sidebar-body p-0">
                    {/* El Accordion necesita un estilo de fondo transparente para que se vea el fondo de .sidebar */}
                    <Accordion defaultActiveKey="0" className="sidebar-accordion">


                        {/* ITEM 1: Empresa */}
                        <Accordion.Item eventKey="0" className="border-0">

                            <Accordion.Header className="ps-3">
                                <i className="bi bi-building icon"></i> Empresa
                            </Accordion.Header>

                            <Accordion.Body className="p-0" id="subAccordionRRHH">

                                <Link to="/datos-empresa" onClick={handleCloseSidebar} className="d-block sidebar-link ps-4">
                                    Datos Empresa
                                </Link>
                            </Accordion.Body>
                        </Accordion.Item>


                        {/* ITEM 2: Recursos Humanos (RRHH) */}
                        <Accordion.Item eventKey="1" className="border-0">
                            <Accordion.Header className="ps-3">
                                <i className="bi bi-people me-2 icon"></i> Recursos Humanos
                            </Accordion.Header>
                            <Accordion.Body className="p-0" id="subAccordionRRHH">

                                {/* SUBITEM 1: Aqui esta la carpeta de los trabajadores */}
                                <Accordion>
                                    <Accordion.Item eventKey="Trabajadores" className="border-0">

                                        <Accordion.Header className="ps-4">
                                            <i className="bi bi-person me-2 icon"></i> Trabajadores
                                        </Accordion.Header>

                                        <Accordion.Body className="p-0">

                                            <Link to="/Datos-Trabajador" onClick={handleCloseSidebar} className="d-block sidebar-link ps-5">
                                                Crear Trabajadores
                                            </Link>

                                            <Link to="/lista-trabajadores" onClick={handleCloseSidebar} className="d-block sidebar-link ps-5">
                                                Ver Trabajadores
                                            </Link>

                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>

                                {/* SUBITEM 2: Contratos */}
                                <Accordion>
                                    <Accordion.Item eventKey="Contratos" className="border-0">

                                        <Accordion.Header className="ps-4">
                                            <i className="bi bi-file-earmark-text me-2"></i> Contratos
                                        </Accordion.Header>

                                        <Accordion.Body className="p-0">

                                            <Link to="/contratos" onClick={handleCloseSidebar} className="d-block sidebar-link ps-5">
                                                Listar Contratos
                                            </Link>

                                            <Link to="/crear-plantilla" onClick={handleCloseSidebar} className="d-block sidebar-link ps-5">
                                                Crear Plantilla
                                            </Link>

                                            <Link to="/crear-contrato" onClick={handleCloseSidebar} className="d-block sidebar-link ps-5">
                                                Crear Contratos
                                            </Link>

                                            <Link to="/crear-clausula" onClick={handleCloseSidebar} className="d-block sidebar-link ps-5">
                                                Crear Cláusula
                                            </Link>

                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>

                                {/* SUBITEM 3: Prevención */}
                                <Accordion>
                                    <Accordion.Item eventKey="Prevencion" className="border-0">

                                        <Accordion.Header className="ps-4">
                                            <i className="bi-file-earmark-lock me-2"></i> Prevencion
                                        </Accordion.Header>

                                        <Accordion.Body className="p-0">

                                            <Link to="/rrhh/trabajadores/crear" onClick={handleCloseSidebar} className="d-block sidebar-link ps-5">
                                                REC R.I.O.H.S
                                            </Link>

                                            <Link to="/GestionEpp" onClick={handleCloseSidebar} className="d-block sidebar-link ps-5">
                                                REC EPP
                                            </Link>

                                            <Link to="/CrearEpp" onClick={handleCloseSidebar} className="d-block sidebar-link ps-5">
                                                REC DIE EPP
                                            </Link>

                                            <Link to="/Odi" onClick={handleCloseSidebar} className="d-block sidebar-link ps-5">
                                                REC ODI
                                            </Link>

                                            <Link to="/rrhh/trabajadores/ver" onClick={handleCloseSidebar} className="d-block sidebar-link ps-5">
                                                REC DIE ODI
                                            </Link>

                                            <Link to="/Cargos" onClick={handleCloseSidebar} className="d-block sidebar-link ps-5">
                                                REC CAP CARGO
                                            </Link>

                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>


                                {/* SUBITEM 4: Permisos */}
                                <Accordion>
                                    <Accordion.Item eventKey="Permisos" className="border-0">

                                        <Accordion.Header className="ps-4">
                                            <i className="bi-person-check me-2 icon"></i> Permisos
                                        </Accordion.Header>

                                        <Accordion.Body className="p-0">

                                            <Link to="/Permisos" onClick={handleCloseSidebar} className="d-block sidebar-link ps-5">
                                                Crear Solicitud De Permisos
                                            </Link>

                                        </Accordion.Body>
                                    </Accordion.Item>

                                
                                </Accordion>
                                {/* SUBITEM 5: Descargas de archivos */}   
                                <Accordion> 
                                    <Accordion.Item eventKey="Descargas" className="border-0">

                                        <Accordion.Header className="ps-3">
                                            <i className="bi bi-download me-2 icon"></i> Descargas
                                        </Accordion.Header>

                                        <Accordion.Body className="p-0">

                                            <Link to="/Descargas" onClick={handleCloseSidebar} className="d-block sidebar-link ps-4">
                                                Gestión de Descargas
                                            </Link>

                                        </Accordion.Body>
                                    </Accordion.Item>

                            </Accordion>

                            </Accordion.Body>
                        </Accordion.Item>


                    </Accordion>
                </Offcanvas.Body>
            </Offcanvas>

            {/* 3. CONTENIDO PRINCIPAL */}
            <div className="content">
                <Outlet />
            </div>
        </>
    );
}

export default SidebarAndHeader;