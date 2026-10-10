
const CART_KEY = "evergreenCart";

function getCart() {
    // Support the old cart key too, so existing items aren't lost.
    try {
        let data = localStorage.getItem(CART_KEY);

        if (!data) {
            data = localStorage.getItem("cart");
        }

        if (!data) {
            data = localStorage.getItem("shoppingCart");
        }

        const cart = JSON.parse(data || "[]");
        return Array.isArray(cart) ? cart : [];
    } catch (error) {
        console.error("Could not read cart:", error);
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));

    // Keep older pages working if they use these keys.
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("shoppingCart", JSON.stringify(cart));

    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce(
        (total, item) => total + Number(item.quantity || 1),
        0
    );

    document.querySelectorAll("#cartCount, .cart-count").forEach(element => {
        element.textContent = count;
    });
}

document.addEventListener("DOMContentLoaded", updateCartCount);
