import { supabase } from "./config.js";

// ==========================================
// CARGAR RESEÑAS
// ==========================================

async function cargarResenas() {

    const contenedor = document.getElementById("reviews-container");

    if (!contenedor) return;

    try {

        const { data, error } = await supabase
            .from("reseñas")
            .select("*")
            .order("fecha", { ascending: false });

        if (error) {
            throw error;
        }

        contenedor.innerHTML = "";

        if (data.length === 0) {

            contenedor.innerHTML = `
                <p class="no-reviews">
                    Todavía no hay reseñas. ¡Sé el primero en publicar!
                </p>
            `;

            return;
        }

        data.forEach(resena => {
            mostrarResena(resena);
        });

    } catch (error) {

        console.error("Error al cargar reseñas:", error);

        contenedor.innerHTML = `
            <p class="no-reviews">
                No se pudieron cargar las reseñas.
            </p>
        `;
    }
}


// ==========================================
// MOSTRAR UNA RESEÑA
// ==========================================

function mostrarResena(resena) {

    const contenedor = document.getElementById("reviews-container");

    if (!contenedor) return;

    const tarjeta = document.createElement("article");

    tarjeta.className = "review-card";

    const estrellas = "★".repeat(resena.calificacion) +
        "☆".repeat(5 - resena.calificacion);

    const iniciales = resena.nombre_usuario
        .split(" ")
        .map(nombre => nombre.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase();

    tarjeta.innerHTML = `
        <div class="stars">
            ${estrellas}
        </div>

        <p>
            “${resena.comentario}”
        </p>

        <div class="review-user">

            <div class="avatar">
                ${iniciales}
            </div>

            <div>
                <strong>${resena.nombre_usuario}</strong>
                <small>Cliente verificado</small>
            </div>

        </div>
    `;

    contenedor.prepend(tarjeta);
}


// ==========================================
// PUBLICAR RESEÑA
// ==========================================

async function publicarResena(event) {

    event.preventDefault();

    const calificacion =
        parseInt(document.getElementById("reviewRating").value);

    const comentario =
        document.getElementById("reviewComment").value.trim();

    if (!calificacion || !comentario) {

        alert("Completa todos los campos.");

        return;
    }

    try {

        // Obtener usuario autenticado
        const {
            data: { user },
            error: errorAuth
        } = await supabase.auth.getUser();

        if (errorAuth) {
            throw errorAuth;
        }

        if (!user) {

            alert(
                "Debes iniciar sesión para publicar una reseña."
            );

            window.location.href = "login.html";

            return;
        }

        // Obtener datos del usuario
        const { data: usuario, error: errorUsuario } =
            await supabase
                .from("usuarios")
                .select("id, nombre")
                .eq("id_auth", user.id)
                .single();

        if (errorUsuario) {
            throw errorUsuario;
        }

        // Insertar reseña
        const { data: resena, error: errorResena } =
            await supabase
                .from("reseñas")
                .insert({
                    id_usuario: usuario.id,
                    nombre_usuario: usuario.nombre,
                    comentario: comentario,
                    calificacion: calificacion
                })
                .select()
                .single();

        if (errorResena) {
            throw errorResena;
        }

        console.log("Reseña publicada:", resena);

        alert("¡Reseña publicada correctamente!");

        // Limpiar formulario
        document.getElementById("reviewForm").reset();

    } catch (error) {

        console.error("Error al publicar reseña:", error);

        alert(
            "No se pudo publicar la reseña: " +
            error.message
        );
    }
}


// ==========================================
// EVENTO DEL FORMULARIO
// ==========================================

const formularioResena =
    document.getElementById("reviewForm");

if (formularioResena) {

    formularioResena.addEventListener(
        "submit",
        publicarResena
    );
}


// ==========================================
// REALTIME
// ==========================================

supabase
    .channel("resenas-tiempo-real")
    .on(
        "postgres_changes",
        {
            event: "INSERT",
            schema: "public",
            table: "reseñas"
        },
        (payload) => {

            console.log(
                "Nueva reseña recibida en tiempo real:",
                payload.new
            );

            mostrarResena(payload.new);
        }
    )
    .subscribe();


// ==========================================
// CARGAR AL INICIAR
// ==========================================

cargarResenas();