import { useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/AuthContext';
import ProtectedRoute from './Components/auth/ProtectedRoute';
//Componente de Layout
import SidebarAndHeader from './Components/layouts/SidebarAndHeader'
import LoadingGif from './Components/layouts/GifComponent';
//Importacion de las paginas
import {
  LoginAndRegisterPage,
  RecoverPasswordPage,
  DatosEmpresa,
  NotFounder,
  DatosTrabajador,
  ListaTrabajadores,
  CrearContrato,
  CrearPlantilla,
  CrearClausula,
  ListarContratos,
  CrearAnexo,
  VerContrato,
  CorreoDespido
} from './pages';
import OdiPage from './pages/Odi/OdiPage';
import PermisosPage from './pages/Permisos/PermisosPage';
import GestionEppPage from './pages/Epp/GestionEppPage';
import CrearEppPage from './pages/Epp/CrearEppPage';
import CargosPage from './pages/Cargos/CargosPage';
import DescargasPage from './pages/Descargas/DescargasPage';



// Componentes de ejemplo para otras "páginas"
const AboutPage = () => <LoadingGif GifSource={"src/assets/tf2-bread.gif"} />;

function App() {
  const [count, setCount] = useState(0)


  return (
    <AuthProvider>
      <Routes>
        {/* ============================================== */}
        {/* 1. RUTAS SIN LAYOUT (LOGIN, RECUPERACIÓN)       */}
        {/* ============================================== */}
        <Route path="/" element={<LoginAndRegisterPage />} />
        <Route path="/recuperar-contrasena" element={<RecoverPasswordPage />} />

        {/* ============================================== */}
        {/* 2. RUTAS CON LAYOUT (PRIVADAS)                  */}
        {/* Usamos una Ruta Padre para el layout         */}
        {/* ============================================== */}
        {/*1. Capa de seguridad, verifica la autenticacion, si no estas autentificado te manda al login */}
        <Route element={<ProtectedRoute />}>
          {/*2. Capa del layout, Solo se aplica el sidevar y el nabvar si la seccion es valida */}
          <Route element={<SidebarAndHeader />}>

            <Route path="/datos-empresa" element={<DatosEmpresa />} />
            <Route path="/acerca-de" element={<AboutPage />} />
            <Route path="/permisos/goce-sueldo" element={<h1>Permisos con Goce de Sueldo</h1>} />

            {/* Ruta para EDITAR (con ID) - Debe coincidir con el Link de ListaTrabajadores */}
            <Route path="/Datos-Trabajador/:id" element={<DatosTrabajador />} />

            {/* Ruta para CREAR (sin ID) */}
            <Route path="/Datos-Trabajador" element={<DatosTrabajador />} />

            <Route path="/lista-trabajadores" element={<ListaTrabajadores />} />

            <Route path="/crear-contrato" element={<CrearContrato />} />

            <Route path='/crear-plantilla' element={<CrearPlantilla />} />

            <Route path='/crear-clausula' element={<CrearClausula />} />

            <Route path='/contratos' element={<ListarContratos />} />

            <Route path='/contratos/crear-anexo/:contratoId' element={<CrearAnexo />} />

            <Route path="/contratos/ver/:contratoId" element={<VerContrato />} />

            <Route path='/Correo-Despido' element={<CorreoDespido />} />

            <Route path="/Odi" element={<OdiPage />} />

            <Route path="/Permisos" element={<PermisosPage />} />

            <Route path="/GestionEpp" element={<GestionEppPage />} />

            <Route path="/CrearEpp" element={<CrearEppPage />} />

            <Route path="/Cargos" element={<CargosPage />} />

            <Route path="/Descargas" element={<DescargasPage />} />

          </Route>
        </Route>
        {/* PAgina de error 404*/}
        <Route path="*" element={<NotFounder />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
