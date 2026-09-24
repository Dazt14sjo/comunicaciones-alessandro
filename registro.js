import { supabase } from "./config.js";

const formularioRegistro = document.getElementById("registroForm");

if (formularioRegistro) {
    formularioRegistro.addEventListener("submit", async (event) => {
        event.preventDefault();

        const nombre = document.getElementById("nombre").value.trim();
        const correo = document.getElementById("correo").value.trim();
        const contraseña = document.getElementById("contraseña").value;
        const confirmarContraseña =
            document.getElementById("confirmarContraseña").value;

        // Verificar que las contraseñas coincidan
        if (contraseña !== confirmarContraseña) {
            alert("Las contraseñas no coinciden.");
            return;
        }

        try {
            // 1. Crear usuario en Supabase Authentication
            const { data, error } = await supabase.auth.signUp({
                email: correo,
                password: contraseña
            });

            if (error) {
                throw error;
            }

            if (!data.user) {
                throw new Error("No se pudo crear el usuario.");
            }

            console.log("Usuario creado en Auth:", data.user);

            // El trigger de Supabase crea automáticamente
// el registro en public.usuarios con rol Cliente.

console.log("Usuario creado correctamente en Authentication.");

            alert("Cuenta creada correctamente.");

            window.location.href = "login.html";

        } catch (error) {
            console.error("Error durante el registro:", error);

            alert(
                "No se pudo crear la cuenta: " +
                error.message
            );
        }
    });
}