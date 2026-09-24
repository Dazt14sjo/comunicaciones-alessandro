import { supabase } from "./config.js";

// ==========================================
// REGISTRAR PEDIDO
// ==========================================

async function registrarPedido() {

    try {

        // Verificar que el carrito tenga productos
        if (!cart || cart.length === 0) {
            alert("Tu carrito está vacío.");
            return;
        }

        // Obtener usuario autenticado
        const {
            data: { user },
            error: errorAuth
        } = await supabase.auth.getUser();

        if (errorAuth) {
            throw errorAuth;
        }

        if (!user) {
            alert("Debes iniciar sesión para realizar un pedido.");
            window.location.href = "login.html";
            return;
        }

        // Buscar usuario en nuestra tabla usuarios
        const { data: usuario, error: errorUsuario } =
            await supabase
                .from("usuarios")
                .select("id")
                .eq("id_auth", user.id)
                .single();

        if (errorUsuario) {
            throw errorUsuario;
        }

        // Calcular total
        const total = cart.reduce(
            (suma, producto) =>
                suma + (producto.price * producto.quantity),
            0
        );

        // Registrar pedido
        const { data: pedido, error: errorPedido } =
            await supabase
                .from("pedidos")
                .insert({
                    id_usuario: usuario.id,
                    total: total,
                    estado: "Pendiente"
                })
                .select()
                .single();

        if (errorPedido) {
            throw errorPedido;
        }

        console.log("Pedido registrado:", pedido);

        alert(
            "¡Pedido registrado correctamente!\n" +
            "Número de pedido: #" + pedido.id
        );

        // Vaciar carrito
        cart.length = 0;
        updateCart();

    } catch (error) {

        console.error("Error al registrar pedido:", error);

        alert(
            "No se pudo registrar el pedido: " +
            error.message
        );
    }
}

window.registrarPedido = registrarPedido;