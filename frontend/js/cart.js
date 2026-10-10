
const rupees = amount =>
    "₹" + Number(amount).toLocaleString("en-IN");

function renderCartPage() {
    const cart = getCart();
    const container = document.getElementById("cartItems");
    const message = document.getElementById("cartMessage");

    let subtotal = 0;

    if (cart.length === 0) {
        container.innerHTML = `
            <div style="padding:30px 0">
                <h3>Your cart is empty 🛒</h3>
                <p>Explore our collection and add something you love.</p>
                <a href="products.html">Browse products →</a>
            </div>
        `;

        document.getElementById("cartSubtotal").textContent = rupees(0);
        document.getElementById("cartDelivery").textContent = rupees(0);
        document.getElementById("cartTotal").textContent = rupees(0);
        document.getElementById("checkoutButton").disabled = true;
        updateCartCount();
        return;
    }

    document.getElementById("checkoutButton").disabled = false;

    container.innerHTML = cart.map((item, index) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 1;
        subtotal += price * quantity;

        return `
            <article style="display:flex;align-items:center;justify-content:space-between;gap:18px;padding:20px 0;border-bottom:1px solid #ddd">
                <div>
                    <h3 style="margin:0 0 5px">${escapeCartText(item.name)}</h3>
                    <p style="margin:0">${rupees(price)} each</p>

                    <div style="display:flex;align-items:center;gap:12px;margin-top:12px">
                        <button type="button" data-change="${index}" data-delta="-1">−</button>
                        <strong>${quantity}</strong>
                        <button type="button" data-change="${index}" data-delta="1">+</button>
                        <button type="button" data-remove="${index}">Remove</button>
                    </div>
                </div>
                <strong>${rupees(price * quantity)}</strong>
            </article>
        `;
    }).join("");

    const delivery = subtotal >= 999 ? 0 : 49;

    document.getElementById("cartSubtotal").textContent = rupees(subtotal);
    document.getElementById("cartDelivery").textContent = rupees(delivery);
    document.getElementById("cartTotal").textContent = rupees(subtotal + delivery);

    updateCartCount();
}

function escapeCartText(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

document.addEventListener("click", event => {
    const changeButton = event.target.closest("[data-change]");
    const removeButton = event.target.closest("[data-remove]");

    if (changeButton) {
        const cart = getCart();
        const index = Number(changeButton.dataset.change);
        const delta = Number(changeButton.dataset.delta);

        if (!cart[index]) return;

        cart[index].quantity = Number(cart[index].quantity) + delta;

        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }

        saveCart(cart);
        renderCartPage();
    }

    if (removeButton) {
        const cart = getCart();
        cart.splice(Number(removeButton.dataset.remove), 1);
        saveCart(cart);
        renderCartPage();
    }
});

document.getElementById("checkoutButton").addEventListener("click", () => {
    if (getCart().length === 0) return;

    // Change this destination to your existing checkout page if its filename differs.
    window.location.href = "checkout.html";
});

document.addEventListener("DOMContentLoaded", renderCartPage);
