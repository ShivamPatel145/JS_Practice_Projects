document.addEventListener("DOMContentLoaded", function() {

    const products = [
        { id: 1, name: "Laptop", price: 799.99 },
        { id: 2, name: "Phone", price: 599.99 },
        { id: 3, name: "Headphones", price: 199.99 }
    ];

    let cart = [];

    const productList = document.getElementById("product-list");
    const cartItems = document.getElementById("cart-items");
    const emptyCartMessage = document.getElementById("empty-cart");
    const cartTotalMessage = document.getElementById("cart-total");
    const totalPriceDisplay = document.getElementById("total-price");
    const checkoutBtn = document.getElementById("checkout-btn");

    init();

    function init() {
        loadCartFromStorage();
        displayProducts();
        updateCartDisplay();
        setupEventListeners();
    }

    function displayProducts() {
        productList.innerHTML = "";

        products.forEach((product) => {
            const productDiv = document.createElement("div");
            productDiv.className = "product";
            productDiv.innerHTML = `
                <span>${product.name} - $${product.price.toFixed(2)}</span>
                <button onclick="addToCart(${product.id})">Add to Cart</button>
            `;
            productList.appendChild(productDiv);
        });
    }

    function updateCartDisplay() {
        cartItems.innerHTML = "";

        if (cart.length === 0) {
            showEmptyCart();
            return;
        }

        showCartItems();
        updateTotalPrice();
    }

    function showEmptyCart() {
        emptyCartMessage.classList.remove("hidden");
        cartTotalMessage.classList.add("hidden");
        totalPriceDisplay.textContent = "$0.00";
        cartItems.appendChild(emptyCartMessage);
    }

    function showCartItems() {
        emptyCartMessage.classList.add("hidden");
        cartTotalMessage.classList.remove("hidden");

        cart.forEach((item) => {
            const itemTotal = item.price * item.quantity;
            
            const cartItemDiv = document.createElement("div");
            cartItemDiv.className = "cart-item";
            cartItemDiv.innerHTML = `
                <div class="item-info">
                    <span>${item.name} - $${item.price.toFixed(2)}</span>
                </div>
                <div class="item-controls">
                    <button onclick="decreaseQuantity(${item.id})">-</button>
                    <span>Qty: ${item.quantity}</span>
                    <button onclick="increaseQuantity(${item.id})">+</button>
                    <button onclick="removeFromCart(${item.id})" class="remove-btn">Remove</button>
                </div>
                <div class="item-total">
                    Total: $${itemTotal.toFixed(2)}
                </div>
            `;
            cartItems.appendChild(cartItemDiv);
        });
    }

    function updateTotalPrice() {
        const totalPrice = cart.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);
        
        totalPriceDisplay.textContent = `$${totalPrice.toFixed(2)}`;
    }

    function addToCart(productId) {
        const product = findProductById(productId);
        
        if (!product) {
            showMessage("Product not found!", "error");
            return;
        }

        const existingItem = findCartItemById(productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }

        saveCartToStorage();
        updateCartDisplay();
        showMessage(`${product.name} added to cart!`);
    }

    function removeFromCart(productId) {
        const item = findCartItemById(productId);
        
        if (!item) return;

        cart = cart.filter((item) => item.id !== productId);

        saveCartToStorage();
        updateCartDisplay();
        showMessage(`${item.name} removed from cart!`);
    }

    function increaseQuantity(productId) {
        const item = findCartItemById(productId);
        
        if (item) {
            item.quantity += 1;
            saveCartToStorage();
            updateCartDisplay();
        }
    }

    function decreaseQuantity(productId) {
        const item = findCartItemById(productId);
        
        if (item) {
            if (item.quantity <= 1) {
                removeFromCart(productId);
            } else {
                item.quantity -= 1;
                saveCartToStorage();
                updateCartDisplay();
            }
        }
    }

    function clearCart() {
        if (cart.length === 0) {
            showMessage("Cart is already empty!", "warning");
            return;
        }

        if (confirm("Are you sure you want to clear your cart?")) {
            cart = [];
            clearCartFromStorage();
            updateCartDisplay();
            showMessage("Cart cleared!");
        }
    }

    function checkout() {
        if (cart.length === 0) {
            showMessage("Your cart is empty!", "error");
            return;
        }

        const total = cart.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

        const confirmMessage = `Checkout ${itemCount} items for $${total.toFixed(2)}?`;
        
        if (confirm(confirmMessage)) {
            cart = [];
            clearCartFromStorage();
            updateCartDisplay();
            showMessage("Thank you for your purchase! 🎉");
        }
    }

    function findProductById(id) {
        return products.find((product) => product.id === id);
    }

    function findCartItemById(id) {
        return cart.find((item) => item.id === id);
    }

    function showMessage(message, type = "success") {
        const colors = {
            success: "#27ae60",
            error: "#e74c3c",
            warning: "#f39c12"
        };

        const messageDiv = document.createElement("div");
        messageDiv.className = "message";
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(messageDiv);

        setTimeout(function() {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }

    function saveCartToStorage() {
        try {
            localStorage.setItem('shoppingCart', JSON.stringify(cart));
        } catch (error) {
            console.error('Failed to save cart:', error);
        }
    }

    function loadCartFromStorage() {
        try {
            const savedCart = localStorage.getItem('shoppingCart');
            if (savedCart) {
                cart = JSON.parse(savedCart);
            }
        } catch (error) {
            console.error('Failed to load cart:', error);
            cart = [];
        }
    }

    function clearCartFromStorage() {
        try {
            localStorage.removeItem('shoppingCart');
        } catch (error) {
            console.error('Failed to clear cart:', error);
        }
    }

    function setupEventListeners() {
        if (checkoutBtn) {
            checkoutBtn.addEventListener("click", checkout);
        }
    }

    window.addToCart = addToCart;
    window.removeFromCart = removeFromCart;
    window.increaseQuantity = increaseQuantity;
    window.decreaseQuantity = decreaseQuantity;
    window.clearCart = clearCart;
    window.checkout = checkout;
});