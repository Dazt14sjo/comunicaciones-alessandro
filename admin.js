import { supabase } from "./config.js";

// ==========================================
// ACTUALIZAR ESTADO DEL PEDIDO
// ==========================================

async function actualizarEstadoPedido(idPedido, nuevoEstado) {

    try {

        const {
            data: { user },
            error: errorAuth
        } = await supabase.auth.getUser();

        if (errorAuth) {
            throw errorAuth;
        }

        if (!user) {
            alert("Debes iniciar sesión.");
            window.location.href = "login.html";
            return;
        }

        // Verificar que el usuario sea administrador
        const { data: usuario, error: errorUsuario } =
            await supabase
                .from("usuarios")
                .select("id, nombre, id_rol")
                .eq("id_auth", user.id)
                .single();

        if (errorUsuario) {
            throw errorUsuario;
        }

        if (usuario.id_rol !== 1) {

            alert(
                "Acceso denegado. Solo los administradores pueden modificar pedidos."
            );

            return;
        }

        // Actualizar estado en Supabase
        const { data, error } =
            await supabase
                .from("pedidos")
                .update({
                    estado: nuevoEstado
                })
                .eq("id", idPedido)
                .select()
                .single();

        if (error) {
            throw error;
        }

        console.log("Pedido actualizado:", data);

        alert(
            `Pedido #${idPedido} actualizado a: ${nuevoEstado}`
        );

        cargarPedidos();

    } catch (error) {

        console.error(
            "Error al actualizar pedido:",
            error
        );

        alert(
            "No se pudo actualizar el pedido: " +
            error.message
        );
    }
}


// ==========================================
// APROBAR PEDIDO
// ==========================================

async function aprobarPedido(idPedido) {

    await actualizarEstadoPedido(
        idPedido,
        "Aprobado"
    );
}


// ==========================================
// ANULAR PEDIDO
// ==========================================

async function anularPedido(idPedido) {

    const confirmar = confirm(
        `¿Seguro que deseas anular el pedido #${idPedido}?`
    );

    if (!confirmar) {
        return;
    }

    await actualizarEstadoPedido(
        idPedido,
        "Anulado"
    );
}


// ==========================================
// CARGAR PEDIDOS
// ==========================================

async function cargarPedidos() {

    const cuerpoTabla =
        document.getElementById("orders-table-body");

    if (!cuerpoTabla) {
        return;
    }

    try {

        const { data: pedidos, error } =
            await supabase
                .from("pedidos")
                .select(`
                    id,
                    id_usuario,
                    fecha,
                    total,
                    estado,
                    usuarios (
                        nombre,
                        correo
                    )
                `)
                .order("fecha", {
                    ascending: false
                });

        if (error) {
            throw error;
        }

        cuerpoTabla.innerHTML = "";

        if (!pedidos || pedidos.length === 0) {

            cuerpoTabla.innerHTML = `
                <tr>
                    <td colspan="6">
                        No hay pedidos registrados.
                    </td>
                </tr>
            `;

            return;
        }

        pedidos.forEach(pedido => {

            const fila =
                document.createElement("tr");

            const nombreUsuario =
                pedido.usuarios?.nombre ||
                "Usuario";

            const fecha =
                new Date(pedido.fecha)
                    .toLocaleString("es-PE");

            let claseEstado = "pending";

            if (pedido.estado === "Aprobado") {
                claseEstado = "delivered";
            }

            if (pedido.estado === "Anulado") {
                claseEstado = "cancelled";
            }

            fila.innerHTML = `
                <td>#${pedido.id}</td>

                <td>
                    ${nombreUsuario}
                </td>

                <td>
                    ${fecha}
                </td>

                <td>
                    S/ ${Number(pedido.total).toFixed(2)}
                </td>

                <td>
                    <span class="status ${claseEstado}">
                        ${pedido.estado}
                    </span>
                </td>

                <td>

                    <button
                        class="action-button"
                        onclick="aprobarPedido(${pedido.id})"
                        ${pedido.estado !== "Pendiente" ? "disabled" : ""}>
                        Aprobar
                    </button>

                    <button
                        class="action-button danger"
                        onclick="anularPedido(${pedido.id})"
                        ${pedido.estado !== "Pendiente" ? "disabled" : ""}>
                        Anular
                    </button>

                </td>
            `;

            cuerpoTabla.appendChild(fila);
        });

    } catch (error) {

        console.error(
            "Error al cargar pedidos:",
            error
        );

        cuerpoTabla.innerHTML = `
            <tr>
                <td colspan="6">
                    No se pudieron cargar los pedidos.
                </td>
            </tr>
        `;
    }
}


// ==========================================
// HACER FUNCIONES ACCESIBLES DESDE HTML
// ==========================================

window.aprobarPedido = aprobarPedido;
window.anularPedido = anularPedido;


// ==========================================
// CARGAR PEDIDOS AL INICIAR
// ==========================================

cargarPedidos();
// ==========================================
// ACTUALIZACIÓN EN TIEMPO REAL
// ==========================================

supabase
    .channel("pedidos-tiempo-real")
    .on(
        "postgres_changes",
        {
            event: "INSERT",
            schema: "public",
            table: "pedidos"
        },
        (payload) => {

            console.log(
                "Nuevo pedido recibido en tiempo real:",
                payload.new
            );

            cargarPedidos();
        }
    )
    .subscribe();