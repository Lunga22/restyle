/* ==========================================================================
   RESTYLE THRIFTY - COMPLETE CORE SCRIPT WITH INTEGRATED ADMIN CONTROLS
   ========================================================================== */

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
let waitlist = [];

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
    loadWaitlist();
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
        renderComingSoonSection();
    }

    if (document.getElementById('admin-dashboard') || document.getElementById('admin-login-screen')) {
        initAdminPanel();
    }
});

/* --- PHONE VALIDATION & ESTIMATED DELIVERY LOGIC --- */
function isValidSAPhone(phone) {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    const saRegex = /^(\+27|0)[678]\d{8}$/;
    return saRegex.test(cleanPhone);
}

function formatSAPhone(phone) {
    let clean = phone.replace(/[\s\-\(\)]/g, '');
    if (clean.startsWith('0')) {
        clean = '+27' + clean.substring(1);
    }
    return clean;
}

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

function loadWaitlist() {
    const saved = localStorage.getItem('restyle_waitlist');
    try { waitlist = saved ? JSON.parse(saved) : []; } catch (e) { waitlist = []; }
}

function saveWaitlist() {
    localStorage.setItem('restyle_waitlist', JSON.stringify(waitlist));
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
                <div class="product-img-box" style="position:relative; width:100%; height:180px; overflow:hidden; border-radius:6px 6px 0 0;">
                    <img src="${product.image}" alt="${product.title}" style="width:100%; height:100%; object-fit:cover;">
                    ${statusBadge}
                </div>
                <div class="product-info" style="padding:10px; text-align:center;">
                    <h4 style="font-size:12px; margin:4px 0; color:#333; height:32px; overflow:hidden;">${product.title}</h4>
                    <div class="product-price" style="font-weight:bold; font-size:13px; margin-bottom:4px;">R${parseFloat(product.price).toFixed(2)}</div>
                    
                    <div class="stock-status" style="font-size:10px; margin-bottom:6px; font-weight:600; color: ${isComingSoon ? '#e65100' : (isOutOfStock ? '#d32f2f' : '#2e7d32')};">
                        ${isComingSoon ? '⏳ Launching Soon' : (isOutOfStock ? '✘ Out of Stock' : `✔ In Stock: ${stockQty}`)}
                    </div>

                    <button type="button" class="btn-dark full-btn" style="width:100%; padding:6px 0; font-size:11px;" ${(isOutOfStock || isComingSoon) ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''} onclick="addToCart('${product.id}')">
                        <i class="fas fa-shopping-bag"></i> ${isComingSoon ? 'COMING SOON' : (isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART')}
                    </button>
                </div>
            </div>
        `;
    }).join('');

    renderPagination(totalResults);
};

window.renderComingSoonSection = function() {
    const container = document.getElementById('coming-soon-container');
    if (!container) return;

    const teaserProducts = products.filter(p => p.status === 'coming_soon');

    if (teaserProducts.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:#777; width:100%; padding:20px; grid-column: 1 / -1;">No upcoming items at the moment. Check back soon!</p>`;
        return;
    }

    container.innerHTML = teaserProducts.map(product => `
        <div class="teaser-card product-card" style="border: 1px solid #ffe0b2; background: #fff8e1; border-radius: 8px; overflow: hidden; position: relative;">
            <div class="product-img-box" style="position:relative; width:100%; height:160px;">
                <img src="${product.image}" alt="${product.title}" style="width:100%; height:100%; object-fit:cover;">
                <span class="category-badge" style="background:#e65100; color:#fff;">🔥 Coming Soon</span>
            </div>
            <div style="padding:10px; text-align:center;">
                <h4 style="font-size:12px; margin:4px 0; color:#333;">${product.title}</h4>
                <div style="font-weight:bold; font-size:13px; color:#e65100; margin-bottom:6px;">R${parseFloat(product.price).toFixed(2)}</div>
                <button type="button" class="btn-dark full-btn" style="width:100%; padding:6px 0; font-size:11px; background:#e65100; border:none; color:#fff; cursor:pointer;">
                    NOTIFY ME
                </button>
            </div>
        </div>
    `).join('');

    initComingSoon();
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
        alert('Please enter a valid Email Address.');
        document.getElementById('checkout-email')?.focus();
        return null;
    }
    if (!phone || !isValidSAPhone(phone)) {
        alert('Please enter a valid South African phone number.');
        document.getElementById('checkout-phone')?.focus();
        return null;
    }
    if (!deliveryMethod) {
        alert('Please select a Delivery Method.');
        return null;
    }

    return { name, email, phone: formatSAPhone(phone), deliveryMethod, address: address || 'Local Pick Up' };
}

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

window.payWithPaystack = function() {
    const customer = validateCheckoutForm();
    if (!customer) return;

    const totalQty = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    const subtotal = calculateCartTotal();
    const shippingCost = calculateShippingCost(customer.deliveryMethod, totalQty);
    const grandTotal = subtotal + shippingCost;

    let handler = PaystackPop.setup({
        key: 'pk_test_4949998eff8859d813c87a650de5202160e3f4ad',
        email: customer.email,
        amount: Math.round(grandTotal * 100),
        currency: 'ZAR',
        callback: function(response) {
            processOrderCompletion('Paystack Online', response.reference, { ...customer, subtotal, shippingCost, grandTotal });
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
    const customer = validateCheckoutForm();
    if (!customer) return;

    const totalQty = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    const subtotal = calculateCartTotal();
    const shippingCost = calculateShippingCost(customer.deliveryMethod, totalQty);
    const grandTotal = subtotal + shippingCost;

    processOrderCompletion('Manual Bank Transfer (EFT)', 'EFT-' + Date.now(), { ...customer, subtotal, shippingCost, grandTotal });
};

function processOrderCompletion(paymentMethod, reference, customerData) {
    let itemsSummary = cart.map(item => `${item.qty}x ${item.title}`);

    loadOrders();
    const newOrder = {
        id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleString(),
        customer: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address,
        deliveryMethod: customerData.deliveryMethod,
        estimatedDelivery: getEstimatedDeliveryTime(customerData.deliveryMethod),
        items: itemsSummary.join(', '),
        subtotal: customerData.subtotal,
        shippingCost: customerData.shippingCost,
        total: customerData.grandTotal,
        paymentMethod: paymentMethod,
        reference: reference
    };

    orders.unshift(newOrder);
    saveOrders();

    cart = [];
    saveCart();
    closeAllModals();

    alert(`🎉 THANK YOU FOR YOUR ORDER!\n\nOrder ID: ${newOrder.id}\nEstimated Delivery: ${newOrder.estimatedDelivery}`);
}

function initLogin() {
    const loginForm = document.getElementById('customer-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById('customer-username');
            const emailInput = document.getElementById('customer-email');
            currentUser = { username: usernameInput ? usernameInput.value.trim() : 'Customer', email: emailInput ? emailInput.value.trim() : '' };
            localStorage.setItem('restyle_user', JSON.stringify(currentUser));
            closeAllModals();
            updateUserHeader();
        });
    }

    const savedUser = localStorage.getItem('restyle_user');
    if (savedUser) { try { currentUser = JSON.parse(savedUser); updateUserHeader(); } catch (e) {} }
}

function updateUserHeader() {
    const accountIcon = document.getElementById('open-account');
    const nameLabel = document.getElementById('user-display-name');

    if (currentUser && currentUser.username) {
        if (accountIcon) accountIcon.className = 'fas fa-user-check';
        if (nameLabel) nameLabel.innerHTML = `Hi, ${currentUser.username}`;
    }
}

function initModals() {
    const openSearch = document.getElementById('open-search');
    const openAccount = document.getElementById('open-account');
    const openCart = document.getElementById('open-cart');

    const searchModal = document.getElementById('search-modal');
    const accountModal = document.getElementById('account-modal');
    const cartDrawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('overlay');

    if (openSearch) openSearch.addEventListener('click', () => showModal(searchModal));
    if (openAccount) openAccount.addEventListener('click', () => showModal(accountModal));
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
        const btn = e.target.closest('.add-to-cart-btn');
        if (btn && !btn.getAttribute('onclick')) {
            addToCart(btn.getAttribute('data-name') || 'Stylish Bag', btn.getAttribute('data-price') || 250, btn.getAttribute('data-image') || '');
        }
    });
}

function initComingSoon() {
    document.querySelectorAll('.teaser-card').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const title = card.querySelector('h4') ? card.querySelector('h4').innerText : 'item';
            const email = prompt(`Get notified when "${title}" launches! Enter your email:`);
            if (email && email.includes('@')) {
                loadWaitlist();
                waitlist.unshift({
                    item: title,
                    email: email.trim(),
                    date: new Date().toLocaleDateString()
                });
                saveWaitlist();
                alert(`Thanks! We'll email you at ${email} as soon as this launches.`);
            }
        });
    });
}

/* --- ADMIN PANEL SYSTEM --- */
window.initAdminPanel = function() {
    const loginScreen = document.getElementById('admin-login-screen');
    const dashboard = document.getElementById('admin-dashboard');
    const loginForm = document.getElementById('admin-login-form');
    const logoutBtn = document.getElementById('admin-logout-btn');
    const addProductForm = document.getElementById('add-product-form');
    const resetBtn = document.getElementById('reset-defaults-btn');

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
                alert('Invalid Password. Try: admin123');
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

    if (addProductForm && !addProductForm.dataset.bound) {
        addProductForm.dataset.bound = "true";
        addProductForm.addEventListener('submit', handleAddProductSubmit);
    }

    if (resetBtn && !resetBtn.dataset.bound) {
        resetBtn.dataset.bound = "true";
        resetBtn.addEventListener('click', () => {
            if (confirm('Reset product inventory back to default demo items?')) {
                products = [...DEFAULT_PRODUCTS];
                saveProducts();
                refreshAdminDashboard();
            }
        });
    }
};

function handleAddProductSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('prod-title')?.value.trim();
    const price = parseFloat(document.getElementById('prod-price')?.value) || 0;
    const stock = parseInt(document.getElementById('prod-stock')?.value) || 0;
    const category = document.getElementById('prod-category')?.value || 'Handbags';
    const status = document.getElementById('prod-status')?.value || 'available';
    const imageUrl = document.getElementById('prod-image')?.value.trim();
    const fileInput = document.getElementById('prod-file');

    const saveAndPublish = (imgSrc) => {
        const newProduct = {
            id: 'prod_' + Date.now(),
            title: title,
            price: price,
            stock: stock,
            category: category,
            status: status,
            image: imgSrc || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500'
        };

        loadProducts();
        products.unshift(newProduct);
        saveProducts();
        refreshAdminDashboard();

        document.getElementById('add-product-form').reset();
        alert('✅ Product published successfully!');
    };

    if (fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            saveAndPublish(evt.target.result);
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        saveAndPublish(imageUrl);
    }
}

window.refreshAdminDashboard = function() {
    renderAdminStats();
    renderAdminProducts();
    renderAdminWaitlist();
    renderAdminSales();
    if (document.getElementById('products-container')) {
        renderStorefrontProducts();
        renderComingSoonSection();
    }
};

function renderAdminStats() {
    loadOrders();
    loadProducts();

    const revenueEl = document.getElementById('total-revenue-display');
    const ordersEl = document.getElementById('total-orders-display');
    const itemsSoldEl = document.getElementById('total-items-sold-display');
    const prodCountEl = document.getElementById('total-prod-count');

    let totalRevenue = orders.reduce((sum, ord) => sum + (parseFloat(ord.total) || 0), 0);

    if (revenueEl) revenueEl.innerText = `R${totalRevenue.toFixed(2)}`;
    if (ordersEl) ordersEl.innerText = orders.length;
    if (itemsSoldEl) itemsSoldEl.innerText = orders.length;
    if (prodCountEl) prodCountEl.innerText = products.length;
}

function renderAdminProducts() {
    const tbody = document.getElementById('admin-product-rows');
    if (!tbody) return;

    loadProducts();

    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:15px;">No products in inventory.</td></tr>`;
        return;
    }

    tbody.innerHTML = products.map((product) => {
        const stockQty = parseInt(product.stock) || 0;
        const isTeaser = product.status === 'coming_soon';
        const isOutOfStock = stockQty <= 0 && !isTeaser;

        let badgeHtml = '';
        if (isTeaser) {
            badgeHtml = `<span style="background-color: #fff3e0; color: #e65100; font-weight: 600; padding: 4px 8px; border-radius: 4px; font-size: 11px;">Coming Soon</span>`;
        } else if (isOutOfStock) {
            badgeHtml = `<span style="background-color: #ffebee; color: #c62828; font-weight: 600; padding: 4px 8px; border-radius: 4px; font-size: 11px;">Out of Stock</span>`;
        } else {
            badgeHtml = `<span style="background-color: #e8f5e9; color: #2e7d32; font-weight: 600; padding: 4px 8px; border-radius: 4px; font-size: 11px;">In Stock (${stockQty})</span>`;
        }

        return `
            <tr>
                <td style="padding:10px;"><img src="${product.image}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;"></td>
                <td style="padding:10px;"><strong>${product.title}</strong></td>
                <td style="padding:10px; color:#555;">${product.category || 'N/A'}</td>
                <td style="padding:10px;">R${parseFloat(product.price).toFixed(2)}</td>
                <td style="padding:10px;">
                    ${badgeHtml}
                </td>
                <td style="padding:10px;">
                    <button onclick="toggleTeaserStatus('${product.id}')" class="btn-small" style="background: #e0e0e0; color: #333; margin-right: 5px; border: 1px solid #ccc; padding: 4px 8px; font-size: 11px; cursor:pointer;">
                        ${isTeaser ? 'Unset Teaser' : 'Set Teaser'}
                    </button>
                    <button onclick="deleteProduct('${product.id}')" class="btn-small btn-danger" style="padding: 4px 8px; font-size: 11px; cursor:pointer;">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

window.toggleTeaserStatus = function(id) {
    const prod = products.find(p => String(p.id) === String(id));
    if (prod) {
        prod.status = (prod.status === 'coming_soon') ? 'available' : 'coming_soon';
        saveProducts();
        refreshAdminDashboard();
    }
};

function renderAdminWaitlist() {
    const tbody = document.getElementById('admin-waitlist-rows');
    if (!tbody) return;

    loadWaitlist();

    if (waitlist.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:15px;">No subscribers yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = waitlist.map(w => `
        <tr>
            <td style="padding:8px;"><strong>${w.item}</strong></td>
            <td style="padding:8px;">${w.email}</td>
            <td style="padding:8px;">${w.date}</td>
        </tr>
    `).join('');
}

window.clearWaitlist = function() {
    if (confirm('Are you sure you want to clear the early access subscriber list?')) {
        waitlist = [];
        saveWaitlist();
        renderAdminWaitlist();
    }
};

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
        container.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:15px;">No orders recorded yet.</td></tr>';
        return;
    }

    container.innerHTML = orders.map(o => `
        <tr>
            <td style="padding:8px;"><strong>${o.id}</strong></td>
            <td style="padding:8px;">${o.date}</td>
            <td style="padding:8px;">${o.customer} (${o.phone || 'N/A'})</td>
            <td style="padding:8px;">${o.items}</td>
            <td style="padding:8px;"><strong>R${parseFloat(o.total).toFixed(2)}</strong></td>
        </tr>
    `).join('');
}
