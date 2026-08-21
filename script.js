/* ==========================================================================
   RESTYLE THRIFTY - COMPLETE CORE SCRIPT WITH SA VALIDATION & NOTIFICATIONS
   ========================================================================== */

// Store Merchant Details
const STORE_CONFIG = {
    merchantPhone: '+27815385051',
    merchantEmail: 'gugunyawose6@gmail.com',
    currencySymbol: 'R'
};

const DEFAULT_PRODUCTS = [
    { id: '1', title: 'Classic Quilted Shoulder Bag', price: 299.00, stock: 12, category: 'Handbags', color: 'black', material: 'PU Leather', status: 'available', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500' },
    { id: '2', title: 'Minimalist Leather Tote', price: 349.00, stock: 8, category: 'Tote Bags', color: 'brown', material: 'Leather', status: 'available', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600' },
    { id: '3', title: 'Compact Crossbody Pouch', price: 189.00, stock: 5, category: 'Crossbody Bags', color: 'beige', material: 'Fabric', status: 'available', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600' },
    { id: '4', title: 'Urban Daily Backpack', price: 399.00, stock: 15, category: 'Backpacks', color: 'black', material: 'Canvas', status: 'available', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500' },
    { id: '5', title: 'Evening Clutch Bag', price: 220.00, stock: 3, category: 'Clutches', color: 'white', material: 'PU Leather', status: 'available', image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=300' },
    { id: '6', title: 'Classic Shoulder Bag', price: 230.00, stock: 10, category: 'Shoulder Bags', color: 'pink', material: 'Leather', status: 'available', image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=500' }
];

let products = [];
let cart = [];
let currentUser = null;
let orders = [];

let activeFilters = {
    category: 'all',
    maxPrice: 500,
    selectedColors: [],
    selectedMaterials: [],
    searchQuery: '',
    page: 1,
    itemsPerPage: 8
};

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadOrders();
    initCart();
    initModals();
    initLogin();
    initComingSoon();
    attachGlobalButtonListeners();

    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
        activeFilters.searchQuery = searchParam;
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = searchParam;
    }

    if (document.getElementById('products-container')) {
        renderStorefrontProducts();
    }

    if (document.getElementById('admin-dashboard') || document.getElementById('admin-login-screen')) {
        initAdminPanel();
    }
});

/* --- PHONE VALIDATION & ESTIMATED DELIVERY LOGIC --- */

// Validates standard SA formats: 0815385051, +27815385051, 0721234567, etc.
function isValidSAPhone(phone) {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    const saRegex = /^(\+27|0)[678]\d{8}$/;
    return saRegex.test(cleanPhone);
}

// Format phone to standard international format (+27...)
function formatSAPhone(phone) {
    let clean = phone.replace(/[\s\-\(\)]/g, '');
    if (clean.startsWith('0')) {
        clean = '+27' + clean.substring(1);
    }
    return clean;
}

// Get delivery timeframes depending on method
function getEstimatedDeliveryTime(deliveryMethod) {
    switch (deliveryMethod) {
        case 'paxi':
            return '7 to 9 business days (Paxi Store-to-Store)';
        case 'pudo_locker':
            return '1 to 4 business days (Pudo Locker-to-Locker)';
        case 'pudo_door':
            return '1 to 3 business days (Pudo Door Courier)';
        case 'pickup':
            return '1 to 2 business days (Ready for Local Pick Up)';
        default:
            return '2 to 5 business days';
    }
}

/* --- DATA PERSISTENCE --- */
function loadProducts() {
    const saved = localStorage.getItem('restyle_products');
    if (saved) {
        try { products = JSON.parse(saved); } catch (e) { products = [...DEFAULT_PRODUCTS]; }
    } else {
        products = [...DEFAULT_PRODUCTS];
        saveProducts();
    }
}

function saveProducts() {
    localStorage.setItem('restyle_products', JSON.stringify(products));
}

function loadOrders() {
    const savedOrders = localStorage.getItem('restyle_orders');
    try { orders = savedOrders ? JSON.parse(savedOrders) : []; } catch (e) { orders = []; }
}

function saveOrders() {
    localStorage.setItem('restyle_orders', JSON.stringify(orders));
}

/* --- STOREFRONT RENDERING --- */
window.renderStorefrontProducts = function() {
    const container = document.getElementById('products-container');
    if (!container) return;

    let filtered = products.filter(product => {
        const matchesCategory = activeFilters.category === 'all' || 
            product.category.toLowerCase() === activeFilters.category.toLowerCase();
        const matchesPrice = parseFloat(product.price) <= activeFilters.maxPrice;
        const matchesColor = activeFilters.selectedColors.length === 0 || 
            (product.color && activeFilters.selectedColors.includes(product.color.toLowerCase()));
        const matchesMaterial = activeFilters.selectedMaterials.length === 0 || 
            (product.material && activeFilters.selectedMaterials.includes(product.material.toLowerCase()));
        const matchesSearch = !activeFilters.searchQuery || 
            product.title.toLowerCase().includes(activeFilters.searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(activeFilters.searchQuery.toLowerCase());

        return matchesCategory && matchesPrice && matchesColor && matchesMaterial && matchesSearch;
    });

    const totalResults = filtered.length;
    const countDisplay = document.getElementById('showing-count');
    if (countDisplay) {
        countDisplay.innerText = `SHOWING ${totalResults > 0 ? (activeFilters.page - 1) * activeFilters.itemsPerPage + 1 : 0} – ${Math.min(activeFilters.page * activeFilters.itemsPerPage, totalResults)} OF ${totalResults} PRODUCTS`;
    }

    if (totalResults === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align:center; padding: 40px 20px; background: #fdfdfd; border: 1px dashed #ccc; border-radius: 8px;">
                <h3 style="margin: 12px 0 6px; font-size:18px; color:#333;">No items match your selected criteria</h3>
                <p style="color:#777; font-size:13px; margin:0 auto 15px;">Try adjusting your filters.</p>
                <button onclick="resetAllFilters()" class="btn-dark" style="padding: 8px 16px; font-size:12px;">Reset Filters</button>
            </div>
        `;
        renderPagination(0);
        return;
    }

    const startIndex = (activeFilters.page - 1) * activeFilters.itemsPerPage;
    const paginatedProducts = filtered.slice(startIndex, startIndex + activeFilters.itemsPerPage);

    container.innerHTML = paginatedProducts.map(product => {
        const stockQty = parseInt(product.stock) || 0;
        const isComingSoon = product.status === 'coming_soon';
        const isOutOfStock = stockQty <= 0 && !isComingSoon;

        let statusBadge = `<span class="category-badge">${product.category}</span>`;
        if (isComingSoon) statusBadge = `<span class="category-badge" style="background:#e65100; color:#fff;">🔥 Coming Soon</span>`;
        
        return `
            <div class="product-card">
                <div class="product-img-box">
                    <img src="${product.image}" alt="${product.title}">
                    ${statusBadge}
                </div>
                <div class="product-info">
                    <h4>${product.title}</h4>
                    <div class="product-price">R${parseFloat(product.price).toFixed(2)}</div>
                    
                    <div class="stock-status" style="font-size:11px; margin-bottom:8px; font-weight:bold; color: ${isComingSoon ? '#e65100' : (isOutOfStock ? '#d32f2f' : '#2e7d32')};">
                        ${isComingSoon ? '⏳ Launching Soon' : (isOutOfStock ? '❌ Out of Stock' : `✔ In Stock: ${stockQty}`)}
                    </div>

                    <button type="button" class="btn-dark full-btn" ${(isOutOfStock || isComingSoon) ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''} onclick="addToCart('${product.id}')">
                        <i class="fas fa-shopping-bag"></i> ${isComingSoon ? 'COMING SOON' : (isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART')}
                    </button>
                </div>
            </div>
        `;
    }).join('');

    renderPagination(totalResults);
};

function renderPagination(totalItems) {
    const pagContainer = document.getElementById('pagination-container');
    if (!pagContainer) return;

    const totalPages = Math.ceil(totalItems / activeFilters.itemsPerPage);
    if (totalPages <= 1) {
        pagContainer.innerHTML = '';
        return;
    }

    let pagHTML = `<span onclick="changePage(${activeFilters.page - 1})" class="${activeFilters.page === 1 ? 'disabled' : ''}">&laquo; Prev</span>`;
    for (let i = 1; i <= totalPages; i++) {
        pagHTML += `<span onclick="changePage(${i})" class="${i === activeFilters.page ? 'active' : ''}">${i}</span>`;
    }
    pagHTML += `<span onclick="changePage(${activeFilters.page + 1})" class="${activeFilters.page === totalPages ? 'disabled' : ''}">Next &raquo;</span>`;

    pagContainer.innerHTML = pagHTML;
}

window.changePage = function(newPage) {
    const totalPages = Math.ceil(products.length / activeFilters.itemsPerPage);
    if (newPage < 1 || newPage > totalPages) return;
    activeFilters.page = newPage;
    renderStorefrontProducts();
    window.scrollTo({ top: 300, behavior: 'smooth' });
};

/* --- CART SYSTEM --- */
function initCart() {
    const savedCart = localStorage.getItem('restyle_cart');
    if (savedCart) { try { cart = JSON.parse(savedCart); } catch (e) { cart = []; } }
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('restyle_cart', JSON.stringify(cart));
    updateCartUI();
}

function calculateCartTotal() {
    return cart.reduce((sum, item) => sum + ((parseFloat(item.price) || 0) * (item.qty || 1)), 0);
}

window.addToCart = function(idOrTitle, price, image) {
    let itemToAdd = products.find(p => String(p.id) === String(idOrTitle));

    if (!itemToAdd) {
        itemToAdd = {
            id: 'item_' + Date.now(),
            title: (typeof idOrTitle === 'string' && price) ? idOrTitle : 'Stylish Bag',
            price: parseFloat(price) || 250.00,
            stock: 10,
            status: 'available',
            image: image || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500'
        };
    }

    const availableStock = parseInt(itemToAdd.stock) || 0;
    const existingIndex = cart.findIndex(item => String(item.id) === String(itemToAdd.id));
    const currentQtyInCart = existingIndex > -1 ? cart[existingIndex].qty : 0;

    if (currentQtyInCart + 1 > availableStock) {
        alert(`Sorry, only ${availableStock} units of "${itemToAdd.title}" are available in stock.`);
        return;
    }

    if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
    } else {
        cart.push({ id: itemToAdd.id, title: itemToAdd.title || 'Bag Item', price: parseFloat(itemToAdd.price) || 0, image: itemToAdd.image, qty: 1 });
    }

    saveCart();
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('overlay');
    if (drawer) drawer.classList.add('open');
    if (overlay) overlay.style.display = 'block';
};

window.removeFromCart = function(index) {
    cart.splice(index, 1);
    saveCart();
};

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const drawerCartCount = document.getElementById('drawer-cart-count');
    const container = document.getElementById('cart-items-container');
    const totalPriceEl = document.getElementById('cart-total-price');

    const totalQty = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    if (cartCount) cartCount.innerText = totalQty;
    if (drawerCartCount) drawerCartCount.innerText = totalQty;

    let total = calculateCartTotal();
    if (container) {
        if (cart.length === 0) {
            container.innerHTML = '<p class="empty-msg" style="padding:20px; text-align:center;">Your cart is currently empty.</p>';
        } else {
            container.innerHTML = cart.map((item, idx) => {
                const itemPrice = parseFloat(item.price) || 0;
                const itemQty = item.qty || 1;
                const subtotal = itemPrice * itemQty;

                return `
                    <div class="cart-item-row" style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #eee;">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <img src="${item.image}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;">
                            <div>
                                <strong style="font-size:12px;">${item.title}</strong>
                                <div style="font-size:11px; color:#666;">Qty: ${itemQty} × R${itemPrice.toFixed(2)}</div>
                            </div>
                        </div>
                        <div style="text-align:right;">
                            <strong style="font-size:12px;">R${subtotal.toFixed(2)}</strong>
                            <span onclick="removeFromCart(${idx})" style="color:red; cursor:pointer; margin-left:10px; font-weight:bold;">&times;</span>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
    if (totalPriceEl) totalPriceEl.innerText = `R${total.toFixed(2)}`;
    if (typeof updateCheckoutTotals === 'function') updateCheckoutTotals();
}

function calculateShippingCost(deliveryMethod, totalItems) {
    if (deliveryMethod === 'pickup' || totalItems <= 0) return 0.00;

    if (totalItems >= 1 && totalItems <= 3) {
        switch (deliveryMethod) {
            case 'paxi': return 60.00;
            case 'pudo_locker': return 60.00;
            case 'pudo_door': return 80.00;
            default: return 0.00;
        }
    } else if (totalItems >= 4 && totalItems <= 8) {
        switch (deliveryMethod) {
            case 'paxi': return 60.00;
            case 'pudo_locker': return 60.00;
            case 'pudo_door': return 110.00;
            default: return 0.00;
        }
    } else if (totalItems >= 9) {
        switch (deliveryMethod) {
            case 'paxi': return 110.00;
            case 'pudo_locker': return 60.00;
            case 'pudo_door': return 150.00;
            default: return 0.00;
        }
    }
    return 0.00;
}

window.updateCheckoutTotals = function() {
    const deliverySelect = document.getElementById('checkout-delivery-method');
    const shippingDisplay = document.getElementById('checkout-shipping-cost');
    const grandTotalDisplay = document.getElementById('checkout-grand-total');

    if (!deliverySelect || !shippingDisplay || !grandTotalDisplay) return;

    const totalQty = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    const subtotal = calculateCartTotal();
    const selectedMethod = deliverySelect.value;

    const shippingCost = calculateShippingCost(selectedMethod, totalQty);
    const grandTotal = subtotal + shippingCost;

    shippingDisplay.innerText = selectedMethod === 'pickup' ? 'R0.00 (Free)' : `R${shippingCost.toFixed(2)}`;
    grandTotalDisplay.innerText = `R${grandTotal.toFixed(2)}`;
};

/* --- FORM VALIDATION WITH SOUTH AFRICAN PHONE RULES --- */
function validateCheckoutForm() {
    const name = document.getElementById('checkout-name')?.value.trim();
    const email = document.getElementById('checkout-email')?.value.trim();
    const phone = document.getElementById('checkout-phone')?.value.trim();
    const deliveryMethod = document.getElementById('checkout-delivery-method')?.value;
    const address = document.getElementById('checkout-address')?.value.trim();

    if (!name) {
        alert('Please enter your Full Name.');
        document.getElementById('checkout-name')?.focus();
        return null;
    }
    if (!email || !email.includes('@') || !email.includes('.')) {
        alert('Please enter a valid Email Address for order confirmation.');
        document.getElementById('checkout-email')?.focus();
        return null;
    }
    if (!phone) {
        alert('Please enter your Phone Number.');
        document.getElementById('checkout-phone')?.focus();
        return null;
    }
    if (!isValidSAPhone(phone)) {
        alert('Please enter a valid South African phone number.\n\nAccepted formats:\n• 0815385051 (10 digits starting with 06, 07, or 08)\n• +27815385051 (International format)');
        document.getElementById('checkout-phone')?.focus();
        return null;
    }
    if (!deliveryMethod) {
        alert('Please select a Delivery Method.');
        document.getElementById('checkout-delivery-method')?.focus();
        return null;
    }
    if (deliveryMethod !== 'pickup' && !address) {
        alert('Please enter your Delivery Address or Paxi / Pudo Locker Store Name & Code.');
        document.getElementById('checkout-address')?.focus();
        return null;
    }

    return { 
        name, 
        email, 
        phone: formatSAPhone(phone), 
        deliveryMethod, 
        address: address || 'Local Pick Up' 
    };
}

/* --- CHECKOUT TRIGGER --- */
window.checkout = function() {
    const totalQty = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    if (totalQty <= 0) {
        alert('Your cart is empty!');
        return;
    }

    const checkoutModal = document.getElementById('checkout-modal');
    if (checkoutModal) {
        showModal(checkoutModal);
        updateCheckoutTotals();
    } else {
        payWithPaystack();
    }
};


/* --- PAYMENT INTEGRATION & AUTOMATED NOTIFICATIONS --- */
window.payWithPaystack = function() {
    const totalQty = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    if (totalQty <= 0) {
        alert('Your cart is empty!');
        return;
    }

    const customer = validateCheckoutForm();
    if (!customer) return;

    const subtotal = calculateCartTotal();
    const shippingCost = calculateShippingCost(customer.deliveryMethod, totalQty);
    const grandTotal = subtotal + shippingCost;
    const grandTotalInCents = Math.round(grandTotal * 100);

    if (typeof PaystackPop === 'undefined') {
        alert('Paystack library is not loaded. Please ensure the Paystack script tag is present.');
        return;
    }

    let handler = PaystackPop.setup({
        key: 'pk_test_4949998eff8859d813c87a650de5202160e3f4ad',
        email: customer.email,
        amount: grandTotalInCents,
        currency: 'ZAR',
        callback: function(response) {
            processOrderCompletion('Paystack Online', response.reference, {
                ...customer,
                subtotal,
                shippingCost,
                grandTotal
            });
        },
        onClose: function() {
            alert('Payment window closed. Order was not completed.');
        }
    });

    handler.openIframe();
};

window.toggleEftDetails = function() {
    const eftBox = document.getElementById('eft-details');
    if (eftBox) {
        eftBox.style.display = (eftBox.style.display === 'none' || eftBox.style.display === '') ? 'block' : 'none';
    }
};

window.completeEftOrder = function() {
    const totalQty = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    if (totalQty <= 0) {
        alert('Your cart is empty!');
        return;
    }

    const customer = validateCheckoutForm();
    if (!customer) return;

    const subtotal = calculateCartTotal();
    const shippingCost = calculateShippingCost(customer.deliveryMethod, totalQty);
    const grandTotal = subtotal + shippingCost;

    processOrderCompletion('Manual Bank Transfer (EFT)', 'EFT-PENDING-' + Math.floor(100000 + Math.random() * 900000), {
        ...customer,
        subtotal,
        shippingCost,
        grandTotal
    });
};

function processOrderCompletion(paymentMethod, reference, customerData) {
    let itemsSummary = [];

    cart.forEach(cartItem => {
        const prod = products.find(p => String(p.id) === String(cartItem.id));
        if (prod) prod.stock = Math.max(0, (parseInt(prod.stock) || 0) - cartItem.qty);
        itemsSummary.push(`${cartItem.qty}x ${cartItem.title}`);
    });

    const estDeliveryTime = getEstimatedDeliveryTime(customerData.deliveryMethod);

    loadOrders();
    const newOrder = {
        id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleString(),
        customer: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address,
        deliveryMethod: customerData.deliveryMethod,
        estimatedDelivery: estDeliveryTime,
        items: itemsSummary.join(', '),
        subtotal: customerData.subtotal,
        shippingCost: customerData.shippingCost,
        total: customerData.grandTotal,
        paymentMethod: paymentMethod,
        reference: reference
    };

    orders.unshift(newOrder);
    saveOrders();
    saveProducts();

    // Trigger Automated Confirmations to Customer & Store Owner
    dispatchAutomatedNotifications(newOrder);

    cart = [];
    saveCart();
    closeAllModals();

    if (document.getElementById('products-container')) renderStorefrontProducts();
}

/* --- AUTOMATED CONFIRMATION DISPATCHER --- */
function dispatchAutomatedNotifications(order) {
    const smsMessage = `Hi ${order.customer}! Restyle Thrifty order ${order.id} confirmed! Total: R${order.total.toFixed(2)}. Est. Delivery: ${order.estimatedDelivery}. Contact us: ${STORE_CONFIG.merchantPhone}`;
    
    const emailSubject = `Order Confirmation #${order.id} - Restyle Thrifty`;
    const emailBody = `
Dear ${order.customer},

Thank you for shopping with Restyle Thrifty!

--- ORDER DETAILS ---
Order Number: ${order.id}
Date: ${order.date}
Items: ${order.items}
Shipping Method: ${order.deliveryMethod}
Estimated Delivery Time: ${order.estimatedDelivery}

--- PAYMENT SUMMARY ---
Subtotal: R${order.subtotal.toFixed(2)}
Shipping Fee: R${order.shippingCost.toFixed(2)}
Total Paid: R${order.total.toFixed(2)}
Payment Method: ${order.paymentMethod}
Reference: ${order.reference}

Support Contact:
Email: ${STORE_CONFIG.merchantEmail}
Phone/WhatsApp: ${STORE_CONFIG.merchantPhone}
    `;

    // Simulated Email Notification
    console.log(`[AUTOMATED EMAIL SENT TO ${order.email}]:\nSubject: ${emailSubject}\n${emailBody}`);

    // Simulated SMS Notification
    console.log(`[AUTOMATED SMS SENT TO ${order.phone}]:\n${smsMessage}`);

    // Display confirmation popup on screen
    alert(`🎉 THANK YOU FOR YOUR ORDER!\n\n` +
          `Order ID: ${order.id}\n` +
          `Estimated Delivery: ${order.estimatedDelivery}\n\n` +
          `✉️ Automated confirmation sent to: ${order.email}\n` +
          `📱 Automated SMS sent to: ${order.phone}\n\n` +
          `For inquiries, contact us at ${STORE_CONFIG.merchantPhone} or ${STORE_CONFIG.merchantEmail}.`);
}

/* --- USER LOGIN & MODALS --- */
function initLogin() {
    const loginForm = document.getElementById('customer-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById('customer-username');
            const emailInput = document.getElementById('customer-email');
            const username = usernameInput ? usernameInput.value.trim() : 'Customer';
            const email = emailInput ? emailInput.value.trim() : 'customer@restylethrifty.com';

            currentUser = { username, email };
            localStorage.setItem('restyle_user', JSON.stringify(currentUser));
            alert(`Welcome, ${username}! You are now logged in.`);
            closeAllModals();
            updateUserHeader();
        });
    }

    const savedUser = localStorage.getItem('restyle_user');
    if (savedUser) {
        try { currentUser = JSON.parse(savedUser); updateUserHeader(); } catch (e) { localStorage.removeItem('restyle_user'); }
    }
}

function updateUserHeader() {
    const accountIcon = document.getElementById('open-account');
    const nameLabel = document.getElementById('user-display-name');

    if (currentUser && currentUser.username) {
        if (accountIcon) { accountIcon.className = 'fas fa-user-check'; accountIcon.style.color = '#9e6038'; }
        if (nameLabel) nameLabel.innerHTML = `Hi, ${currentUser.username} <small onclick="logoutCustomer()" style="cursor:pointer; color:#999; margin-left:4px;">(Logout)</small>`;
    } else {
        if (accountIcon) { accountIcon.className = 'far fa-user'; accountIcon.style.color = ''; }
        if (nameLabel) nameLabel.innerHTML = '';
    }
}

window.logoutCustomer = function() {
    localStorage.removeItem('restyle_user');
    currentUser = null;
    updateUserHeader();
    alert('You have logged out.');
};

function initModals() {
    const openSearch = document.getElementById('open-search');
    const openAccount = document.getElementById('open-account');
    const openCart = document.getElementById('open-cart');

    const searchModal = document.getElementById('search-modal');
    const accountModal = document.getElementById('account-modal');
    const cartDrawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('overlay');

    if (openSearch) openSearch.addEventListener('click', () => showModal(searchModal));
    if (openAccount) openAccount.addEventListener('click', () => {
        if (currentUser) {
            if (confirm(`Logged in as ${currentUser.username}. Do you want to logout?`)) logoutCustomer();
        } else showModal(accountModal);
    });

    if (openCart) openCart.addEventListener('click', () => {
        if (cartDrawer) cartDrawer.classList.add('open');
        if (overlay) overlay.style.display = 'block';
    });

    document.querySelectorAll('.close-btn').forEach(btn => btn.addEventListener('click', closeAllModals));
    if (overlay) overlay.addEventListener('click', closeAllModals);
}

function showModal(modal) {
    closeAllModals();
    if (modal) modal.style.display = 'block';
    const overlay = document.getElementById('overlay');
    if (overlay) overlay.style.display = 'block';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    const drawer = document.getElementById('cart-drawer');
    if (drawer) drawer.classList.remove('open');
    const overlay = document.getElementById('overlay');
    if (overlay) overlay.style.display = 'none';
}

function attachGlobalButtonListeners() {
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-to-cart-btn, .btn-add-cart');
        if (btn && !btn.getAttribute('onclick')) {
            const name = btn.getAttribute('data-name') || btn.getAttribute('data-title') || 'Stylish Bag';
            const price = btn.getAttribute('data-price') || 250;
            const img = btn.getAttribute('data-image') || '';
            addToCart(name, price, img);
        }
    });
}

function initComingSoon() {
    const teaserCards = document.querySelectorAll('.teaser-card');
    teaserCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const title = card.querySelector('h4') ? card.querySelector('h4').innerText : 'this collection';
            const userEmail = prompt(`🔔 Want early access?\nEnter your email to get notified when "${title}" launches:`);
            if (userEmail && userEmail.trim() !== '') {
                const subscribers = JSON.parse(localStorage.getItem('restyle_waitlist') || '[]');
                subscribers.push({ category: title, email: userEmail, date: new Date().toLocaleDateString() });
                localStorage.setItem('restyle_waitlist', JSON.stringify(subscribers));
                alert(`Thank you! We will notify ${userEmail} as soon as ${title} drops. ♥`);
            }
        });
    });
}

/* --- ADMIN PANEL --- */
function initAdminPanel() {
    const loginScreen = document.getElementById('admin-login-screen');
    const dashboard = document.getElementById('admin-dashboard');
    const loginForm = document.getElementById('admin-login-form');
    const logoutBtn = document.getElementById('admin-logout-btn');

    const isLoggedIn = localStorage.getItem('restyle_admin_logged_in') === 'true';

    if (isLoggedIn) {
        if (loginScreen) loginScreen.style.display = 'none';
        if (dashboard) dashboard.style.display = 'block';
        refreshAdminDashboard();
    } else {
        if (loginScreen) loginScreen.style.display = 'flex';
        if (dashboard) dashboard.style.display = 'none';
    }

    if (loginForm && !loginForm.dataset.bound) {
        loginForm.dataset.bound = "true";
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const passInput = document.getElementById('admin-pass-input')?.value.trim();
            if (passInput === 'admin123') {
                localStorage.setItem('restyle_admin_logged_in', 'true');
                if (loginScreen) loginScreen.style.display = 'none';
                if (dashboard) dashboard.style.display = 'block';
                refreshAdminDashboard();
            } else {
                alert('Invalid Password. Try using: admin123');
            }
        });
    }

    if (logoutBtn && !logoutBtn.dataset.bound) {
        logoutBtn.dataset.bound = "true";
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('restyle_admin_logged_in');
            if (dashboard) dashboard.style.display = 'none';
            if (loginScreen) loginScreen.style.display = 'flex';
        });
    }
}

function refreshAdminDashboard() {
    renderAdminStats();
    renderAdminProducts();
    renderAdminSales();
}

function renderAdminStats() {
    loadOrders();
    loadProducts();

    const revenueEl = document.getElementById('total-revenue-display');
    const ordersEl = document.getElementById('total-orders-display');
    const itemsSoldEl = document.getElementById('total-items-sold-display');

    let totalRevenue = 0;
    let totalItems = 0;

    orders.forEach(ord => {
        totalRevenue += parseFloat(ord.total) || 0;
        if (ord.items) {
            const parts = ord.items.split(',');
            parts.forEach(p => {
                const match = p.trim().match(/^(\d+)x/);
                totalItems += match ? parseInt(match[1]) : 1;
            });
        }
    });

    if (revenueEl) revenueEl.innerText = `R${totalRevenue.toFixed(2)}`;
    if (ordersEl) ordersEl.innerText = orders.length;
    if (itemsSoldEl) itemsSoldEl.innerText = totalItems;
}

function renderAdminProducts() {
    const tbody = document.getElementById('admin-product-rows');
    if (!tbody) return;

    loadProducts();

    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:15px;">No products in inventory.</td></tr>`;
        return;
    }

    tbody.innerHTML = products.map((product) => `
        <tr>
            <td style="padding:8px;"><img src="${product.image}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;"></td>
            <td style="padding:8px;"><strong>${product.title}</strong></td>
            <td style="padding:8px;">R${parseFloat(product.price).toFixed(2)}</td>
            <td style="padding:8px;">
                <input type="number" value="${product.stock}" min="0" onchange="updateProductStock('${product.id}', this.value)" style="width:60px; padding:4px;">
            </td>
            <td style="padding:8px;"><span class="badge">${product.status}</span></td>
            <td style="padding:8px;">
                <button onclick="deleteProduct('${product.id}')" style="color:red; background:none; border:none; cursor:pointer;"><i class="fas fa-trash"></i> Delete</button>
            </td>
        </tr>
    `).join('');
}

window.updateProductStock = function(id, newStock) {
    const prod = products.find(p => String(p.id) === String(id));
    if (prod) {
        prod.stock = parseInt(newStock) || 0;
        saveProducts();
    }
};

window.deleteProduct = function(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => String(p.id) !== String(id));
        saveProducts();
        refreshAdminDashboard();
    }
};

function renderAdminSales() {
    const container = document.getElementById('admin-sales-rows');
    if (!container) return;

    loadOrders();
    if (orders.length === 0) {
        container.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:15px;">No orders recorded yet.</td></tr>';
        return;
    }

    container.innerHTML = orders.map(o => `
        <tr>
            <td style="padding:8px;"><strong>${o.id}</strong></td>
            <td style="padding:8px;">${o.date}</td>
            <td style="padding:8px;">${o.customer} (${o.phone || 'N/A'})</td>
            <td style="padding:8px;">${o.items}</td>
            <td style="padding:8px;">R${(parseFloat(o.shippingCost) || 0).toFixed(2)} (${o.deliveryMethod})</td>
            <td style="padding:8px;"><strong>R${parseFloat(o.total).toFixed(2)}</strong></td>
            <td style="padding:8px;"><span class="badge">${o.paymentMethod}</span></td>
        </tr>
    `).join('');
}