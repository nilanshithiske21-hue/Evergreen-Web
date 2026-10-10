
const products = [
    {
        id: 1,
        name: "Bamboo Water Bottle",
        category: "Featured",
        price: 499,
        oldPrice: 649,
        rating: 4.8,
        reviews: 214,
        badge: "Best Seller",
        image: "assets/images/products/water-bottle.jpg",
        description: "A reusable bottle for your everyday hydration."
    },
    {
        id: 2,
        name: "Bamboo Toothbrush Set",
        category: "Popular",
        price: 299,
        oldPrice: 399,
        rating: 4.7,
        reviews: 156,
        badge: "Popular",
        image: "assets/images/products/toothbrush-set.jpg",
        description: "A simple, eco-conscious addition to your daily routine."
    },
    {
        id: 3,
        name: "Organic Cotton Tote Bag",
        category: "Premium",
        price: 399,
        oldPrice: 499,
        rating: 4.9,
        reviews: 342,
        badge: "Premium",
        image: "assets/images/products/tote-bag.jpg",
        description: "A reusable tote for shopping and everyday use."
    },
    {
        id: 4,
        name: "Stainless Steel Lunch Box",
        category: "New",
        price: 649,
        oldPrice: 799,
        rating: 4.6,
        reviews: 58,
        badge: "New",
        image: "assets/images/products/lunch-box.jpg",
        description: "A reusable lunch box for meals on the go."
    },
    {
        id: 5,
        name: "Indoor Money Plant",
        category: "Featured",
        price: 349,
        oldPrice: 449,
        rating: 4.8,
        reviews: 189,
        badge: "Featured",
        image: "assets/images/products/indoor-plant.jpg",
        description: "Bring a little greenery into your living space."
    },
    {
        id: 6,
        name: "Recycled Paper Notebook",
        category: "Popular",
        price: 249,
        oldPrice: 349,
        rating: 4.5,
        reviews: 97,
        badge: "Value Pack",
        image: "assets/images/products/notebook.jpg",
        description: "A notebook for notes, lists, and new ideas."
    }
];

const money = amount =>
    "₹" + Number(amount).toLocaleString("en-IN");

function renderProducts(list = products) {
    const container =
        document.getElementById("productsGrid") ||
        document.getElementById("productGrid");

    if (!container) {
        console.error(
            "Product grid not found. Check the grid ID in products.html."
        );
        return;
    }

    if (list.length === 0) {
        container.innerHTML =
            '<p class="no-products">No products found. Try another search.</p>';
        return;
    }

    container.innerHTML = list.map(product => `
        <article class="product-card">
            <div class="product-image">
                <img
                    src="${product.image}"
                    alt="${product.name}"
                    class="product-photo"
                    loading="lazy"
                    onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='<p style=&quot;padding:50px 10px;text-align:center;color:#45634e&quot;>Image unavailable</p>';"
                >
                ${product.badge
                    ? `<span class="product-badge">${product.badge}</span>`
                    : ""}
            </div>

            <div class="product-info">
                <p class="product-category">${product.category}</p>
                <h3>${product.name}</h3>
                <p class="product-description">${product.description}</p>

                <div class="product-rating">
                    <span>★ ${product.rating}</span>
                    <span>(${product.reviews} reviews)</span>
                </div>

                <div class="product-price">
                    <strong>${money(product.price)}</strong>
                    <del>${money(product.oldPrice)}</del>
                </div>

                <button
                    class="add-to-cart-btn"
                    type="button"
                    onclick="addProductToCart(${product.id})"
                >
                    Add to Cart
                </button>
            </div>
        </article>
    `).join("");
}

function filterProducts(category = "All") {
    const searchInput = document.getElementById("productSearch");
    const query = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    let filtered = products.filter(product => {
        const matchesCategory =
            category === "All" ||
            product.category.toLowerCase() === category.toLowerCase();

        const matchesSearch =
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query);

        return matchesCategory && matchesSearch;
    });

    const sortSelect = document.getElementById("sortProducts");

    if (sortSelect) {
        switch (sortSelect.value) {
            case "price-low":
                filtered.sort((a, b) => a.price - b.price);
                break;
            case "price-high":
                filtered.sort((a, b) => b.price - a.price);
                break;
            case "name":
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                filtered.sort((a, b) => {
                    if (a.category === "Featured") return -1;
                    if (b.category === "Featured") return 1;
                    return a.id - b.id;
                });
        }
    }

    renderProducts(filtered);
}

function addProductToCart(id) {
    const product = products.find(item => item.id === Number(id));

    if (!product) {
        console.error("Product not found:", id);
        return;
    }

    // Use the same cart functions as the rest of the website.
    if (typeof getCart !== "function" ||
        typeof saveCart !== "function") {
        alert("Cart setup is missing. Please check js/main.js.");
        return;
    }

    const cart = getCart();
    const existing = cart.find(item => Number(item.id) === product.id);

    if (existing) {
        existing.quantity = Number(existing.quantity || 0) + 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    saveCart(cart);

    const toast = document.getElementById("toast");

    if (toast) {
        toast.textContent = `${product.name} added to cart!`;
        toast.classList.add("show");

        setTimeout(() => toast.classList.remove("show"), 2500);
    } else {
        alert(`${product.name} added to cart!`);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    renderProducts();

    const searchInput = document.getElementById("productSearch");
    if (searchInput) {
        searchInput.addEventListener("input", () => filterProducts());
    }

    const sortSelect = document.getElementById("sortProducts");
    if (sortSelect) {
        sortSelect.addEventListener("change", () => filterProducts());
    }

    document.querySelectorAll("[data-category]").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll("[data-category]").forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");
            filterProducts(button.dataset.category);
        });
    });
});
