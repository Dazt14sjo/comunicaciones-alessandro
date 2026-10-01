import { supabase } from "./config.js";

async function verificarSesion() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
        console.error("Error al verificar la sesión:", error);
        window.location.href = "login.html";
        return;
    }

    if (!data.session) {
        window.location.href = "login.html";
    }
}

verificarSesion();
