// ==========================================
// CARRITO DE COMPRAS
// ==========================================

let cart = [];

function addToCart(name, price) {

    const existingProduct = cart.find(
        product => product.name === name
    );

    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cart.push({
            name: name,
            price: price,
            quantity: 1
        });
    }

    updateCart();
}

function updateCart() {

    const cartItems = document.getElementById("cart-items");
    const cartCount = document.getElementById("cart-count");
    const cartProducts = document.getElementById("cart-products");
    const cartTotal = document.getElementById("cart-total");

    if (!cartItems) return;

    let totalProducts = 0;
    let total = 0;

    cartItems.innerHTML = "";

    if (cart.length === 0) {

        cartItems.innerHTML = `
            <div class="empty-cart">
                <span>🛒</span>
                <p>Tu carrito está vacío.</p>
                <small>Agrega productos del catálogo.</small>
            </div>
        `;

    } else {

        cart.forEach((product, index) => {

            const subtotal = product.price * product.quantity;

            totalProducts += product.quantity;
            total += subtotal;

            const item = document.createElement("div");

            item.style.display = "flex";
            item.style.justifyContent = "space-between";
            item.style.alignItems = "center";
            item.style.padding = "15px 0";
            item.style.borderBottom = "1px solid #dce8ef";

            item.innerHTML = `
                <div>
                    <strong>${product.name}</strong>
                    <p>
                        ${product.quantity} ×
                        S/ ${product.price.toFixed(2)}
                    </p>
                </div>

                <div>
                    <strong>S/ ${subtotal.toFixed(2)}</strong>

                    <button
                        onclick="removeFromCart(${index})"
                        style="
                            margin-left:10px;
                            border:none;
                            background:none;
                            color:#c84b4b;
                            cursor:pointer;
                        ">
                        Eliminar
                    </button>
                </div>
            `;

            cartItems.appendChild(item);
        });
    }

    if (cartCount) {
        cartCount.textContent = totalProducts;
    }

    if (cartProducts) {
        cartProducts.textContent = totalProducts;
    }

    if (cartTotal) {
        cartTotal.textContent = `S/ ${total.toFixed(2)}`;
    }
}

function removeFromCart(index) {

    cart.splice(index, 1);

    updateCart();
}

function scrollToCart() {

    const cartSection = document.getElementById("carrito");

    if (cartSection) {
        cartSection.scrollIntoView({
            behavior: "smooth"
        });
    }
}


// ==========================================
// CAMBIO DE ESTADO DE PEDIDOS - ADMIN
// ==========================================

function changeStatus(button) {

    const row = button.closest("tr");
    const status = row.querySelector(".status");

    if (status.classList.contains("pending")) {

        status.className = "status preparing";
        status.textContent = "Preparando";
        button.textContent = "Enviar";

    } else if (status.classList.contains("preparing")) {

        status.className = "status shipping";
        status.textContent = "Enviado";
        button.textContent = "Entregar";

    } else if (status.classList.contains("shipping")) {

        status.className = "status delivered";
        status.textContent = "Entregado";
        button.textContent = "Completado";

        button.disabled = true;
        button.classList.add("disabled");
    }
}

