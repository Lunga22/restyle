/* ==========================================================================
   RESTYLE THRIFTY - COMPLETE CORE SCRIPT WITH PAYMENT INTEGRATION & ADMIN
   ========================================================================== */

const DEFAULT_PRODUCTS = [
    { id: '1', title: 'Classic Quilted Shoulder Bag', price: 299.00, stock: 12, category: 'Handbags', color: 'black', material: 'PU Leather', status: 'available', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500' },
    { id: '2', title: 'Minimalist Leather Tote', price: 349.00, stock: 8, category: 'Tote Bags', color: 'brown', material: 'Leather', status: 'available', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600' },
    { id: '3', title: 'Compact Crossbody Pouch', price: 189.00, stock: 5, category: 'Crossbody Bags', color: 'beige', material: 'Fabric', status: 'available', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600' },
    { id: '4', title: 'Urban Daily Backpack', price: 399.00, stock: 15, category: 'Backpacks', color: 'black', material: 'Canvas', status: 'available', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500' },
    { id: '5', title: 'Evening Clutch Bag', price: 220.00, stock: 3, category: 'Clutches', color: 'white', material: 'PU Leather', status: 'available', image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=300' },
    { id: '6', title: 'Classic Shoulder Bag', price: 230.00, stock: 10, category: 'Shoulder Bags', color: 'pink', material: 'Leather', status: 'available', image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=500' },
    { id: '7', title: 'Travel Duffle Bag', price: 450.00, stock: 6, category: 'Shoulder Bags', color: 'olive', material: 'Canvas', status: 'available', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500' },
    { id: '8', title: 'Top Handle Bag', price: 300.00, stock: 7, category: 'Handbags', color: 'brown', material: 'Leather', status: 'available', image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=500' },
    { id: '9', title: 'Woven Tote Bag', price: 260.00, stock: 9, category: 'Tote Bags', color: 'beige', material: 'Fabric', status: 'available', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500' },
    { id: '10', title: 'Mini Crossbody Bag', price: 180.00, stock: 11, category: 'Crossbody Bags', color: 'pink', material: 'PU Leather', status: 'available', image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=500' },
    { id: '11', title: 'Trendy Backpack', price: 290.00, stock: 14, category: 'Backpacks', color: 'black', material: 'Canvas', status: 'available', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500' }
];

let products = [];
let cart = [];
let currentUser = null;
let orders = [];

// Storefront Filtering & Pagination State
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

    // Check URL parameters for search queries
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

    // Initialize Admin Panel if elements are on page
    if (document.getElementById('admin-dashboard') || document.getElementById('admin-login-screen')) {
        initAdminPanel();
    }
});

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

/* --- STOREFRONT FILTERING, SEARCH & PAGINATION --- */
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
                <p style="color:#777; font-size:13px; margin:0 auto 15px;">Try adjusting your price range, color, or material filters.</p>
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
                    
                    <div class="stock-status" style="font-size:11px; margin-bottom:8px; font-weight:bold; color: ${isComingSoon ? '#e65100' : (isOutOfStock ? '#d32f2f' : (stockQty < 5 ? '#e65100' : '#2e7d32'))};">
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

window.filterCategory = function(cat) {
    activeFilters.category = cat;
    activeFilters.page = 1;
    renderStorefrontProducts();
};

window.updatePriceFilter = function(val) {
    activeFilters.maxPrice = parseFloat(val);
    const priceDisplay = document.getElementById('price-val-display');
    if (priceDisplay) priceDisplay.innerText = `R${val}`;
    activeFilters.page = 1;
    renderStorefrontProducts();
};

window.toggleColorFilter = function(color, el) {
    color = color.toLowerCase();
    const index = activeFilters.selectedColors.indexOf(color);
    if (index > -1) {
        activeFilters.selectedColors.splice(index, 1);
        el.style.outline = 'none';
    } else {
        activeFilters.selectedColors.push(color);
        el.style.outline = '2px solid #222';
    }
    activeFilters.page = 1;
    renderStorefrontProducts();
};

window.toggleMaterialFilter = function(material, isChecked) {
    material = material.toLowerCase();
    if (isChecked) {
        if (!activeFilters.selectedMaterials.includes(material)) activeFilters.selectedMaterials.push(material);
    } else {
        activeFilters.selectedMaterials = activeFilters.selectedMaterials.filter(m => m !== material);
    }
    activeFilters.page = 1;
    renderStorefrontProducts();
};

window.resetAllFilters = function() {
    activeFilters = { category: 'all', maxPrice: 500, selectedColors: [], selectedMaterials: [], searchQuery: '', page: 1, itemsPerPage: 8 };
    document.querySelectorAll('.color-swatches .swatch').forEach(s => s.style.outline = 'none');
    document.querySelectorAll('.filter-list input[type="checkbox"]').forEach(cb => cb.checked = false);
    const rangeInput = document.getElementById('price-range');
    if (rangeInput) rangeInput.value = 500;
    const priceDisplay = document.getElementById('price-val-display');
    if (priceDisplay) priceDisplay.innerText = 'R500';
    renderStorefrontProducts();
};

window.performSearch = function() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    const query = searchInput.value.trim();
    activeFilters.searchQuery = query;
    activeFilters.page = 1;

    closeAllModals();

    if (document.getElementById('products-container')) {
        renderStorefrontProducts();
    } else {
        window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
    }
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

    if (itemToAdd.status === 'coming_soon') {
        alert(`"${itemToAdd.title}" is coming soon and cannot be added to the cart yet.`);
        return;
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
                    <div class="cart-item-row" style="display:flex; justify-space-between; align-items:center; padding:10px 0; border-bottom:1px solid #eee;">
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
}

/* --- CHECKOUT & PAYSTACK PAYMENT --- */
window.checkout = function() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const checkoutModal = document.getElementById('checkout-modal');
    if (checkoutModal) {
        showModal(checkoutModal);
    } else {
        payWithPaystack();
    }
};

window.payWithPaystack = function() {
    const totalInCents = Math.round(calculateCartTotal() * 100);
    if (totalInCents <= 0) {
        alert('Your cart total is invalid.');
        return;
    }

    const emailInput = document.getElementById('checkout-email') || document.getElementById('customer-email');
    const typedEmail = emailInput ? emailInput.value.trim() : '';

    const userEmail = (currentUser && currentUser.email) 
        ? currentUser.email 
        : (typedEmail !== '' ? typedEmail : 'customer@restylethrifty.com');

    if (!userEmail || !userEmail.includes('@')) {
        alert('Please enter a valid email address to continue.');
        if (emailInput) emailInput.focus();
        return;
    }

    if (typeof PaystackPop === 'undefined') {
        alert('Paystack library is not loaded. Please ensure the Paystack inline script tag is present in your HTML.');
        return;
    }

    let handler = PaystackPop.setup({
        key: 'pk_test_4949998eff8859d813c87a650de5202160e3f4ad',
        email: userEmail,
        amount: totalInCents,
        currency: 'ZAR',
        callback: function(response) {
            processOrderCompletion('Paystack Online', response.reference, userEmail);
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
    const emailInput = document.getElementById('checkout-email') || document.getElementById('customer-email');
    const typedEmail = emailInput ? emailInput.value.trim() : '';
    const userEmail = (currentUser && currentUser.email) ? currentUser.email : (typedEmail !== '' ? typedEmail : 'customer@restylethrifty.com');

    processOrderCompletion('Manual Bank Transfer (EFT)', 'EFT-PENDING-' + Math.floor(100000 + Math.random() * 900000), userEmail);
};

function processOrderCompletion(paymentMethod, reference, orderEmail) {
    let orderTotal = 0;
    let itemsSummary = [];

    cart.forEach(cartItem => {
        const prod = products.find(p => String(p.id) === String(cartItem.id));
        if (prod) prod.stock = Math.max(0, (parseInt(prod.stock) || 0) - cartItem.qty);
        const itemSubtotal = (parseFloat(cartItem.price) || 0) * cartItem.qty;
        orderTotal += itemSubtotal;
        itemsSummary.push(`${cartItem.qty}x ${cartItem.title}`);
    });

    loadOrders();
    const newOrder = {
        id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleString(),
        customer: currentUser ? currentUser.username : 'Guest Customer',
        email: orderEmail || (currentUser ? currentUser.email : 'customer@restylethrifty.com'),
        items: itemsSummary.join(', '),
        total: orderTotal,
        paymentMethod: paymentMethod,
        reference: reference
    };

    orders.unshift(newOrder);
    saveOrders();
    saveProducts();

    alert(`Thank you for shopping with Restyle Thrifty!\n\nOrder ${newOrder.id} confirmed.\nPayment Method: ${paymentMethod}\nReference: ${reference}`);
    cart = [];
    saveCart();
    closeAllModals();

    if (document.getElementById('products-container')) renderStorefrontProducts();
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
                if (typeof renderAdminWaitlist === 'function') renderAdminWaitlist();
            }
        });
    });
}

/* ==========================================================================
   ADMIN PANEL CONTROLLER & AUTHENTICATION (MATCHES admin.html SPEC)
   ========================================================================== */

function initAdminPanel() {
    const loginScreen = document.getElementById('admin-login-screen');
    const dashboard = document.getElementById('admin-dashboard');
    const loginForm = document.getElementById('admin-login-form');
    const logoutBtn = document.getElementById('admin-logout-btn');
    const addProductForm = document.getElementById('add-product-form');
    const resetBtn = document.getElementById('reset-defaults-btn');

    const isLoggedIn = localStorage.getItem('restyle_admin_logged_in') === 'true';

    // Toggle Screen Views
    if (isLoggedIn) {
        if (loginScreen) loginScreen.style.display = 'none';
        if (dashboard) dashboard.style.display = 'block';
        refreshAdminDashboard();
    } else {
        if (loginScreen) loginScreen.style.display = 'flex';
        if (dashboard) dashboard.style.display = 'none';
    }

    // Attach Admin Login Listener
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

    // Attach Admin Logout Listener
    if (logoutBtn && !logoutBtn.dataset.bound) {
        logoutBtn.dataset.bound = "true";
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('restyle_admin_logged_in');
            if (dashboard) dashboard.style.display = 'none';
            if (loginScreen) loginScreen.style.display = 'flex';
        });
    }

    // Attach Reset Defaults Listener
    if (resetBtn && !resetBtn.dataset.bound) {
        resetBtn.dataset.bound = "true";
        resetBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset product inventory to defaults?')) {
                products = [...DEFAULT_PRODUCTS];
                saveProducts();
                refreshAdminDashboard();
                alert('Product inventory reset successfully.');
            }
        });
    }

    // Attach Add Product Listener
    if (addProductForm && !addProductForm.dataset.bound) {
        addProductForm.dataset.bound = "true";
        addProductForm.addEventListener('submit', handleAddProductSubmit);
    }
}

function refreshAdminDashboard() {
    renderAdminStats();
    renderAdminProducts();
    renderAdminWaitlist();
    renderAdminSales();
}

/* --- ADMIN STATS OVERVIEW --- */
function renderAdminStats() {
    loadOrders();
    loadProducts();

    const revenueEl = document.getElementById('total-revenue-display');
    const ordersEl = document.getElementById('total-orders-display');
    const itemsSoldEl = document.getElementById('total-items-sold-display');
    const prodCountEl = document.getElementById('total-prod-count');

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
        } else {
            totalItems += 1;
        }
    });

    if (revenueEl) revenueEl.innerText = `E${totalRevenue.toFixed(2)}`;
    if (ordersEl) ordersEl.innerText = orders.length;
    if (itemsSoldEl) itemsSoldEl.innerText = totalItems;
    if (prodCountEl) prodCountEl.innerText = products.length;
}

/* --- ADD NEW PRODUCT / TEASER FORM --- */
function handleAddProductSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('prod-title').value.trim();
    const price = parseFloat(document.getElementById('prod-price').value) || 0;
    const stock = parseInt(document.getElementById('prod-stock').value) || 0;
    const category = document.getElementById('prod-category').value;
    const status = document.getElementById('prod-status').value;
    const imageUrlInput = document.getElementById('prod-image').value.trim();
    const fileInput = document.getElementById('prod-file');

    const saveAndAdd = (imgUrl) => {
        const newProduct = {
            id: 'prod_' + Date.now(),
            title: title,
            price: price,
            stock: stock,
            category: category,
            color: 'black',
            material: 'PU Leather',
            status: status,
            image: imgUrl || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500'
        };

        products.unshift(newProduct);
        saveProducts();
        refreshAdminDashboard();
        e.target.reset();
        alert(`Product "${title}" published successfully!`);
    };

    if (fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            saveAndAdd(evt.target.result);
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        saveAndAdd(imageUrlInput);
    }
}

/* --- INVENTORY CONTROL TABLE --- */
function renderAdminProducts() {
    const tbody = document.getElementById('admin-product-rows');
    if (!tbody) return;

    loadProducts();

    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:15px;">No products in inventory.</td></tr>`;
        return;
    }

    tbody.innerHTML = products.map((product, idx) => {
        const isComingSoon = product.status === 'coming_soon';
        return `
            <tr>
                <td style="padding:8px;"><img src="${product.image}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;"></td>
                <td style="padding:8px;"><strong>${product.title}</strong></td>
                <td style="padding:8px;">${product.category}</td>
                <td style="padding:8px;">R${parseFloat(product.price).toFixed(2)}</td>
                <td style="padding:8px;">
                    <span style="font-size:11px; padding:3px 6px; border-radius:3px; background:${isComingSoon ? '#fff3e0' : (product.stock > 0 ? '#e8f5e9' : '#ffebee')}; color:${isComingSoon ? '#e65100' : (product.stock > 0 ? '#2e7d32' : '#c62828')}; font-weight:bold;">
                        ${isComingSoon ? '🔥 Coming Soon' : (product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock')}
                    </span>
                </td>
                <td style="padding:8px;">
                    <button onclick="toggleProductStatus(${idx})" style="padding:4px 8px; font-size:11px; cursor:pointer; margin-right:4px;">
                        ${isComingSoon ? 'Make Available' : 'Set Teaser'}
                    </button>
                    <button onclick="deleteProduct('${product.id}')" style="padding:4px 8px; font-size:11px; background:#d32f2f; color:#fff; border:none; cursor:pointer;">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

window.toggleProductStatus = function(index) {
    if (products[index]) {
        products[index].status = products[index].status === 'coming_soon' ? 'available' : 'coming_soon';
        saveProducts();
        refreshAdminDashboard();
    }
};

window.deleteProduct = function(id) {
    if (confirm('Delete this product permanently?')) {
        products = products.filter(p => String(p.id) !== String(id));
        saveProducts();
        refreshAdminDashboard();
    }
};

/* --- WAITLIST TABLE --- */
function renderAdminWaitlist() {
    const tbody = document.getElementById('admin-waitlist-rows');
    if (!tbody) return;

    const waitlist = JSON.parse(localStorage.getItem('restyle_waitlist') || '[]');

    if (waitlist.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:15px; color:#777;">No subscribers registered yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = waitlist.map(entry => `
        <tr>
            <td style="padding:8px;"><strong>${entry.category || 'General Teaser'}</strong></td>
            <td style="padding:8px;"><a href="mailto:${entry.email}">${entry.email}</a></td>
            <td style="padding:8px;">${entry.date ? new Date(entry.date).toLocaleDateString() : 'Recent'}</td>
        </tr>
    `).join('');
}

window.clearWaitlist = function() {
    if (confirm('Clear all waitlist subscribers?')) {
        localStorage.removeItem('restyle_waitlist');
        renderAdminWaitlist();
    }
};

/* --- SALES HISTORY TABLE --- */
function renderAdminSales() {
    const tbody = document.getElementById('admin-sales-rows');
    if (!tbody) return;

    loadOrders();

    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:15px; color:#777;">No customer orders placed yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = orders.map(order => `
        <tr>
            <td style="padding:8px;"><strong>${order.id}</strong></td>
            <td style="padding:8px;">${order.date}</td>
            <td style="padding:8px;">${order.customer} <br><small style="color:#666;">${order.email}</small></td>
            <td style="padding:8px;">${order.items}</td>
            <td style="padding:8px;"><strong>R${parseFloat(order.total).toFixed(2)}</strong></td>
        </tr>
    `).join('');
}

// Sync all static homepage images & category cards with Admin inventory
function syncHomepageStaticCards() {
    const savedProducts = localStorage.getItem('restyle_products');
    if (!savedProducts) return;
    
    try {
        const currentProducts = JSON.parse(savedProducts);
        const activeIds = currentProducts.map(p => String(p.id));
        const activeCategories = currentProducts.map(p => p.category);

        // 1. Sync elements with data-id (Hero, New Arrivals, Promo Grid, Teasers)
        document.querySelectorAll('[data-id]').forEach(el => {
            const cardId = String(el.getAttribute('data-id'));
            if (!activeIds.includes(cardId)) {
                el.style.display = 'none'; // Hides instantly if deleted from Admin
            } else {
                el.style.display = '';
            }
        });

        // 2. Sync Shop By Category cards (Hides category card if no products exist for it)
        document.querySelectorAll('.cat-card[data-category]').forEach(card => {
            const cat = card.getAttribute('data-category');
            if (!activeCategories.includes(cat)) {
                card.style.display = 'none';
            } else {
                card.style.display = '';
            }
        });

    } catch (e) {
        console.error('Error syncing homepage cards:', e);
    }
}

// Run sync automatically whenever homepage loads
document.addEventListener('DOMContentLoaded', syncHomepageStaticCards);
