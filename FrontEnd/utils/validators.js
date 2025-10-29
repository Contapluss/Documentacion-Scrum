/**
 * Valida la fortaleza de una contraseña.
 * Reglas: 8-20 caracteres, 1 mayúscula, 1 minúscula, 1 número.
 * @param {string} password - La contraseña a validar.
 * @returns {boolean} - True si es válida, false si no.
 */
export const validarPassword = (password) => {
    // ^                        # Inicio
    // (?=.*[a-z])              # Al menos una minúscula
    // (?=.*[A-Z])              # Al menos una mayúscula
    // (?=.*\d)                 # Al menos un dígito
    // .{8,20}                  # Longitud entre 8 y 20 caracteres
    // $                        # Fin
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,20}$/;
    return regex.test(password);
};

/**
 * Valida un formato de correo electrónico simple.
 * @param {string} email - El email a validar.
 * @returns {boolean} - True si es válido, false si no.
 */
export const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

// 💡 Aquí puedes agregar más validadores en el futuro,
// como validarRUT, validarTelefono, etc.