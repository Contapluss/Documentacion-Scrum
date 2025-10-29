import React, { useState } from 'react';
import TabButtons from '../../Components/auth/TabButtons';
import LoginForm from '../../Components/auth/LoginForm';
import RegisterForm from '../../Components/auth/RegisterForm';
import { Card } from 'react-bootstrap';
import '../../styles/LoginAndRegisterPage.css'

function LoginAndRegisterPage() {
  // Estado para saber qué formulario está activo (true = Login, false = Register)
  const [isLoginActive, setIsLoginActive] = useState(true);

  // Función para cambiar la pestaña activa
  const handleTabChange = (isLogin) => {
    setIsLoginActive(isLogin);
  };

  return (
    <div className="content d-flex justify-content-center align-items-center login-bg position-relative">
      
      {/* Fondo con opacidad */}
      <div className="login-bg-logo"></div>

      {/* Card principal: Reemplazar div.card con el componente Card */}
      <Card
        className="p-4 shadow-lg position-relative"
        style={{ maxWidth: '450px', width: '100%', borderRadius: '1rem', zIndex: 1 }}
      >
        <Card.Body className="p-0"> {/* Se recomienda usar Card.Body si el contenido no necesita el padding de Card */}
          <div className="text-center mb-3">
            <h2 className="fw-bold" style={{ color: 'var(--color-primario)' }}>
              MI CONTAPLUS
            </h2>
            <p className="text-muted mb-0">¡Bienvenido! Inicia sesión o crea tu cuenta</p>
          </div>

          {/* Componente de Pestañas */}
          <TabButtons isLoginActive={isLoginActive} onTabChange={handleTabChange} />

          {/* Contenedor de formularios */}
          <div className="form-wrapper position-relative w-100">
            {isLoginActive ? (
              <LoginForm />
            ) : (
              <RegisterForm onSwitchToLogin={() => handleTabChange(true)} />
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default LoginAndRegisterPage;