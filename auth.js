import { supabase } from "./config.js";

async function iniciarSesion(correo, contraseña) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: correo,
            password: contraseña
        });

        if (error) {
            throw error;
        }

        console.log("Inicio de sesión exitoso:", data.user);

        const { data: usuario, error: errorUsuario } = await supabase
            .from("usuarios")
            .select("id, nombre, correo, id_rol")
            .eq("id_auth", data.user.id)
            .single();

        if (errorUsuario) {
            throw errorUsuario;
        }

        console.log("Usuario:", usuario);
        console.log("Nombre:", usuario.nombre);
        console.log("Rol:", usuario.id_rol);

        if (usuario.id_rol === 1) {
            window.location.href = "admin.html";
        } 
        else if (usuario.id_rol === 2) {
            window.location.href = "index.html";
        } 
        else {
            alert("El usuario no tiene un rol válido.");
        }

    } catch (error) {
        console.error("Error de inicio de sesión:", error);
        alert("No se pudo iniciar sesión: " + error.message);
    }
}

const formularioLogin = document.getElementById("loginForm");

if (formularioLogin) {
    formularioLogin.addEventListener("submit", async (event) => {
        event.preventDefault();

        const correo = document.getElementById("correo").value.trim();
        const contraseña = document.getElementById("contraseña").value;

        await iniciarSesion(correo, contraseña);
    });
}