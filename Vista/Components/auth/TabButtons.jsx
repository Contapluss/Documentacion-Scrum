// TabButtons.jsx
import { Nav } from 'react-bootstrap'; 

function TabButtons({ isLoginActive, onTabChange }) {
  return (
    // Reemplazar div.nav.nav-tabs con Nav
    <Nav variant="tabs" className="justify-content-center border-0 mb-4" id="formTabs">
      
      {/* Enlace de Iniciar Sesión */}
      <Nav.Item>
        <Nav.Link
          id="btnLoginTab"
          // Mantenemos la clase 'active' con lógica condicional
          className={`fw-semibold px-3 ${isLoginActive ? 'active' : ''}`}
          onClick={() => onTabChange(true)} 
        >
          Iniciar Sesión
        </Nav.Link>
      </Nav.Item>
      
      {/* Enlace de Crear Cuenta */}
      <Nav.Item>
        <Nav.Link
          id="btnRegisterTab"
          // Mantenemos la clase 'active' con lógica condicional
          className={`fw-semibold px-3 ${!isLoginActive ? 'active' : ''}`}
          onClick={() => onTabChange(false)} 
        >
          Crear Cuenta
        </Nav.Link>
      </Nav.Item>
    </Nav>
  );
}

export default TabButtons;