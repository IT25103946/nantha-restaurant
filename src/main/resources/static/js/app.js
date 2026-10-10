'use strict';

/* ============================================================
   Nantha Restaurant · POS Billing System
   ============================================================ */

const API_URL = '/api/food/items';

// Fallback menu with exact items, prices, and image URLs provided
const DEFAULT_MENU = [
    {
        id: 1,
        name: "Barotta",
        price: 50.00,
        imageUrl: "https://pngtree.com/freebackground/freshly-sliced-tomato-and-cucumber-served-with-a-plain-paratha-puri-photo_7685917.html",
        groupName: null
    },
    {
        id: 2,
        name: "Noodles",
        price: 150.00,
        imageUrl: "https://pngtree.com/freepng/bowl-of-noodles-with-chopsticks_20457900.html",
        groupName: null
    },
    {
        id: 3,
        name: "Milk Tea",
        price: 120.00,
        imageUrl: "https://pngtree.com/freepng/fresh-milk-tea-or-indian-kadak-chai-cup-transparent-free-vector_9029945.html",
        groupName: null
    },
    {
        id: 4,
        name: "Ulunthu Vada",
        price: 80.00,
        imageUrl: "https://pngtree.com/freepng/crispy-south-indian-medu-vada-with-sambar-and-chutney_23876270.html",
        groupName: null
    },
    {
        id: 5,
        name: "Poori",
        price: 100.00,
        imageUrl: "https://pngtree.com/freepng/palak-chole-and-poori-indian-dish-on-transparent-background_24646826.html",
        groupName: null
    },
    {
        id: 6,
        name: "Chicken Briyani (Normal)",
        price: 600.00,
        imageUrl: "https://pngtree.com/freepng/chicken-biryani-rice-traditional-indian-food-dish_21540889.html",
        groupName: "Chicken Briyani"
    },
    {
        id: 7,
        name: "Chicken Briyani (Large)",
        price: 800.00,
        imageUrl: "https://pngtree.com/freepng/chicken-biryani-rice-traditional-indian-food-dish_21540889.html",
        groupName: "Chicken Briyani"
    },
    {
        id: 8,
        name: "Idly",
        price: 40.00,
        imageUrl: "https://pngtree.com/freepng/south-indian-dish-idli-sambar-served-in-terracotta-plates-isolated-on-black-background_20937916.html",
        groupName: null
    },
    {
        id: 9,
        name: "Dhosa",
        price: 80.00,
        imageUrl: "https://pngtree.com/freepng/dosa-south-indian-food_9053469.html",
        groupName: null
    },
    {
        id: 10,
        name: "Samosa",
        price: 60.00,
        imageUrl: "https://pngtree.com/freepng/best-food-samosa_15743214.html",
        groupName: null
    }
];

// Local photos in static/food/ used for crisp, instant rendering
const LOCAL_IMAGE_FALLBACKS = {
    'barotta': 'food/barotta.jpg',
    'noodles': 'food/noodles.jpg',
    'milk tea': 'food/Milk Tea.jpg',
    'ulunthu vada': 'food/ulunthu vada.jpg',
    'poori': 'food/poori.jpg',
    'chicken briyani': 'food/chicken briyani.jpg',
    'chicken briyani (normal)': 'food/chicken briyani.jpg',
    'chicken briyani (large)': 'food/chicken briyani.jpg',
    'idly': 'food/idly.jpg',
    'dhosa': 'food/dhosa.jpg',
    'samosa': 'food/Samosa.jpg'
};

const state = {
    menu: [],
    cart: [],
    filter: ''
};

const els = {};

document.addEventListener('DOMContentLoaded', init);

function init() {
    els.menuGrid = document.getElementById('menu-grid');
    els.menuEmpty = document.getElementById('menu-empty');
    els.search = document.getElementById('menu-search');
    els.cartList = document.getElementById('cart-list');
    els.cartEmpty = document.getElementById('cart-empty');
    els.grandTotal = document.getElementById('grand-total');
    els.itemCount = document.getElementById('item-count');
    els.billNo = document.getElementById('bill-no');
    els.billDate = document.getElementById('bill-date');
    els.clock = document.getElementById('clock');
    els.printBtn = document.getElementById('print-btn');
    els.clearBtn = document.getElementById('clear-btn');

    // Modal elements
    els.modal = document.getElementById('portion-modal');
    els.modalClose = document.getElementById('modal-close-btn');
    els.modalTitle = document.getElementById('modal-item-title');
    els.modalImg = document.getElementById('modal-img');
    els.modalOptions = document.getElementById('modal-options');

    // Search filter
    els.search.addEventListener('input', e => {
        state.filter = e.target.value.trim().toLowerCase();
        renderMenu();
    });

    // Menu grid click handling
    els.menuGrid.addEventListener('click', e => {
        // If an add button (direct or variant) was clicked:
        const addBtn = e.target.closest('[data-add]');
        if (addBtn) {
            e.stopPropagation();
            addToCart(Number(addBtn.dataset.add));
            return;
        }

        // If Chicken Briyani card (outside buttons) was clicked:
        const groupCard = e.target.closest('[data-group-open]');
        if (groupCard) {
            openPortionModal(groupCard.dataset.groupOpen);
            return;
        }

        // If a standard food card was clicked:
        const singleCard = e.target.closest('[data-single-card]');
        if (singleCard) {
            addToCart(Number(singleCard.dataset.singleCard));
        }
    });

    // Modal close handlers
    if (els.modalClose) {
        els.modalClose.addEventListener('click', closePortionModal);
    }
    if (els.modal) {
        els.modal.addEventListener('click', e => {
            if (e.target === els.modal) closePortionModal();
        });
    }
    window.addEventListener('keydown', e => {
        if (e.key === 'Escape' && els.modal && !els.modal.classList.contains('hidden')) {
            closePortionModal();
        }
    });

    // Modal options click handling
    if (els.modalOptions) {
        els.modalOptions.addEventListener('click', e => {
            const btn = e.target.closest('[data-modal-add]');
            if (btn) {
                const id = Number(btn.dataset.modalAdd);
                addToCart(id);
                closePortionModal();
            }
        });
    }

    // Cart actions (inc, dec, remove)
    els.cartList.addEventListener('click', e => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const row = btn.closest('tr');
        if (!row) return;
        const id = Number(row.dataset.id);
        if (btn.dataset.action === 'inc') changeQuantity(id, 1);
        if (btn.dataset.action === 'dec') changeQuantity(id, -1);
        if (btn.dataset.action === 'remove') removeItem(id);
    });

    els.printBtn.addEventListener('click', printBill);
    els.clearBtn.addEventListener('click', clearBill);

    newBill();
    loadMenu();
    tickClock();
    setInterval(tickClock, 1000);
}

/* ---------------- Menu Loading & Rendering ---------------- */

async function loadMenu() {
    showMenuMessage('Loading menu items...');
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
            state.menu = data;
        } else {
            state.menu = DEFAULT_MENU;
        }
    } catch (error) {
        console.warn('API unavailable, loading default Nantha Restaurant menu:', error);
        state.menu = DEFAULT_MENU;
    }
    renderMenu();
}

function renderMenu() {
    const items = state.menu.filter(matchesFilter);

    if (items.length === 0) {
        showMenuMessage('No food items match your search.', false);
        els.menuGrid.innerHTML = '';
        return;
    }

    els.menuEmpty.classList.add('hidden');

    const html = [];
    const seenGroups = new Set();

    items.forEach(item => {
        if (item.groupName) {
            if (seenGroups.has(item.groupName)) return;
            seenGroups.add(item.groupName);
            const variants = items.filter(v => v.groupName === item.groupName);
            html.push(renderGroupCard(item.groupName, variants));
        } else {
            html.push(renderSingleCard(item));
        }
    });

    els.menuGrid.innerHTML = html.join('');
}

function matchesFilter(item) {
    if (!state.filter) return true;
    if (item.name.toLowerCase().includes(state.filter)) return true;
    return Boolean(item.groupName && item.groupName.toLowerCase().includes(state.filter));
}

// Standard Food Item Card: Clicking card adds 1 to bill summary
function renderSingleCard(item) {
    const name = escapeHtml(item.name);
    const qty = cartQuantity(item.id);
    const fallback = localImageFallback(item.name);

    return `
        <div class="food-card" data-single-card="${item.id}" data-add="${item.id}" role="button" tabindex="0" aria-label="Add ${name} to bill">
            <div class="food-card__media">
                <span class="food-card__emoji" aria-hidden="true">${emojiFor(item.name)}</span>
                ${fallback ? `<img class="food-card__img food-card__img--local" src="${fallback}" alt="${name}" loading="lazy">` : ''}
                ${item.imageUrl ? `<img class="food-card__img food-card__img--remote" src="${escapeHtml(item.imageUrl)}" alt="${name}" data-url="${escapeHtml(item.imageUrl)}" onerror="this.remove()">` : ''}
                <span class="food-card__badge-add">+ Add</span>
            </div>
            <div class="food-card__body">
                <div class="food-card__info">
                    <h3 class="food-card__name">${name}</h3>
                    <div class="food-card__footer">
                        <span class="food-card__price">${formatMoney(item.price)}</span>
                        ${qty ? `<span class="in-cart-badge">${qty} in bill</span>` : ''}
                    </div>
                </div>
            </div>
        </div>`;
}

// Chicken Briyani Group Card: Shows buttons directly on card AND clicking card presents modal
function renderGroupCard(groupName, variants) {
    const name = escapeHtml(groupName);
    const rep = variants.find(v => v.imageUrl) || variants[0] || {};
    const fallback = localImageFallback(groupName);

    // Total quantity in cart across all variants
    const totalQty = variants.reduce((sum, v) => sum + cartQuantity(v.id), 0);

    // Render clear selection buttons directly on the card
    const buttons = variants.map(variant => {
        const portion = portionLabel(groupName, variant.name);
        const qty = cartQuantity(variant.id);
        const btnText = `${portion} (LKR ${Math.round(variant.price)})`;
        return `
            <button type="button" class="variant-btn" data-add="${variant.id}" title="Add ${name} ${portion} to bill">
                <span class="variant-btn__label">${escapeHtml(btnText)}</span>
                ${qty ? `<span class="variant-btn__qty">&times;${qty}</span>` : ''}
            </button>`;
    }).join('');

    return `
        <div class="food-card food-card--group" data-group-open="${name}" role="button" tabindex="0" aria-label="${name} - choose size">
            <div class="food-card__media">
                <span class="food-card__emoji" aria-hidden="true">${emojiFor(groupName)}</span>
                ${fallback ? `<img class="food-card__img food-card__img--local" src="${fallback}" alt="${name}" loading="lazy">` : ''}
                ${rep.imageUrl ? `<img class="food-card__img food-card__img--remote" src="${escapeHtml(rep.imageUrl)}" alt="${name}" data-url="${escapeHtml(rep.imageUrl)}" onerror="this.remove()">` : ''}
                <span class="food-card__badge-options">2 Sizes</span>
            </div>
            <div class="food-card__body">
                <div class="food-card__info">
                    <div class="food-card__title-row">
                        <h3 class="food-card__name">${name}</h3>
                        ${totalQty ? `<span class="in-cart-badge">${totalQty} in bill</span>` : ''}
                    </div>
                    <p class="food-card__group-sub">Normal: LKR 600.00 &middot; Large: LKR 800.00</p>
                </div>
                <div class="variant-actions" onclick="event.stopPropagation()">
                    ${buttons}
                </div>
            </div>
        </div>`;
}

// Portion selection modal for Chicken Briyani
function openPortionModal(groupName) {
    const variants = state.menu.filter(v => v.groupName === groupName);
    if (variants.length === 0) return;

    const rep = variants.find(v => v.imageUrl) || variants[0];
    const fallback = localImageFallback(groupName);

    els.modalTitle.textContent = groupName;
    els.modalImg.src = fallback || (rep ? rep.imageUrl : '');
    els.modalImg.alt = groupName;

    // Two clear selection buttons: "Normal (LKR 600)" and "Large (LKR 800)"
    els.modalOptions.innerHTML = variants.map(variant => {
        const portion = portionLabel(groupName, variant.name);
        const qty = cartQuantity(variant.id);
        const btnText = `${portion} (LKR ${Math.round(variant.price)})`;
        return `
            <button type="button" class="btn btn-modal-portion" data-modal-add="${variant.id}">
                <div class="btn-modal-portion__left">
                    <span class="btn-modal-portion__name">${escapeHtml(portion)} Portion</span>
                    <span class="btn-modal-portion__price">${formatMoney(variant.price)}</span>
                </div>
                <div class="btn-modal-portion__action">
                    <span class="btn-modal-portion__cta">${escapeHtml(btnText)}</span>
                    ${qty ? `<span class="btn-modal-portion__badge">${qty} in bill</span>` : ''}
                </div>
            </button>`;
    }).join('');

    els.modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closePortionModal() {
    if (!els.modal) return;
    els.modal.classList.add('hidden');
    document.body.style.overflow = '';
}

function portionLabel(groupName, name) {
    if (name.toLowerCase().startsWith(groupName.toLowerCase())) {
        const rest = name.slice(groupName.length)
            .replace(/^[\s\–—:(]+/, '')
            .replace(/[)\s]+$/, '');
        if (rest) return rest;
    }
    return name;
}

function showMenuMessage(text, isError) {
    els.menuGrid.innerHTML = '';
    els.menuEmpty.classList.remove('hidden');
    els.menuEmpty.classList.toggle('empty-state--error', Boolean(isError));
    els.menuEmpty.textContent = text;
}

/* ---------------- Cart Management ---------------- */

function addToCart(id) {
    const item = state.menu.find(i => i.id === id);
    if (!item) return;

    const existing = state.cart.find(c => c.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        state.cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1
        });
    }

    renderCart();
    renderMenu();
    popCardAnimation(id);
}

function changeQuantity(id, delta) {
    const cartItem = state.cart.find(c => c.id === id);
    if (!cartItem) return;

    cartItem.quantity += delta;
    if (cartItem.quantity <= 0) {
        removeItem(id);
        return;
    }
    renderCart();
    renderMenu();
}

function removeItem(id) {
    state.cart = state.cart.filter(c => c.id !== id);
    renderCart();
    renderMenu();
}

function clearBill() {
    if (state.cart.length === 0) return;
    if (!confirm('Clear all items from the current bill?')) return;
    newBill();
    renderCart();
    renderMenu();
}

function renderCart() {
    if (state.cart.length === 0) {
        els.cartList.innerHTML = '';
        els.cartEmpty.classList.remove('hidden');
    } else {
        els.cartEmpty.classList.add('hidden');
        els.cartList.innerHTML = state.cart.map(item => `
            <tr data-id="${item.id}">
                <td class="c-name">${escapeHtml(item.name)}</td>
                <td class="c-rate num">${formatMoney(item.price)}</td>
                <td class="c-qty">
                    <button type="button" class="qty-btn no-print" data-action="dec" aria-label="Decrease quantity">&minus;</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button type="button" class="qty-btn no-print" data-action="inc" aria-label="Increase quantity">+</button>
                </td>
                <td class="c-amount num">${formatMoney(item.price * item.quantity)}</td>
                <td class="remove-col no-print">
                    <button type="button" class="remove-btn" data-action="remove" title="Remove item" aria-label="Remove item">&times;</button>
                </td>
            </tr>`).join('');
    }

    const total = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);

    els.grandTotal.textContent = formatMoney(total);
    els.itemCount.textContent = String(count);
}

/* ---------------- Bill Info & Printing ---------------- */

function newBill() {
    state.cart = [];
    els.billNo.textContent = generateBillNumber();
    els.billDate.textContent = new Date().toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function generateBillNumber() {
    const d = new Date();
    const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const seq = String(Math.floor(Math.random() * 9000) + 1000);
    return `NTH-${ymd}-${seq}`;
}

function printBill() {
    if (state.cart.length === 0) {
        alert('Please add at least one food item to the bill before printing.');
        return;
    }
    window.print();
}

function tickClock() {
    els.clock.textContent = new Date().toLocaleString('en-GB', {
        weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
}

/* ---------------- Helpers & Image Fallback ---------------- */

function localImageFallback(name) {
    const key = String(name).toLowerCase().replace(/\s*\([^)]*\)\s*$/, '').trim();
    return LOCAL_IMAGE_FALLBACKS[key] || '';
}

function cartQuantity(id) {
    const item = state.cart.find(c => c.id === id);
    return item ? item.quantity : 0;
}

function popCardAnimation(id) {
    const target = els.menuGrid.querySelector(`[data-add="${id}"], [data-single-card="${id}"]`);
    if (!target) return;
    const card = target.closest('.food-card') || target;
    card.classList.remove('is-popped');
    void card.offsetWidth;
    card.classList.add('is-popped');
}

function emojiFor(name) {
    const n = name.toLowerCase();
    if (n.includes('briyani') || n.includes('biriyani')) return '\uD83C\uDF5B';
    if (n.includes('dhosa') || n.includes('dosa')) return '\uD83E\uDD5E';
    if (n.includes('idly') || n.includes('idli')) return '\uD83C\uDF5A';
    if (n.includes('vada') || n.includes('vadai')) return '\uD83C\uDF69';
    if (n.includes('samosa')) return '\uD83E\uDD5F';
    if (n.includes('barotta') || n.includes('parotta') || n.includes('poori') || n.includes('roti')) return '\uD83E\uDDED';
    if (n.includes('noodle')) return '\uD83C\uDF5C';
    if (n.includes('tea')) return '\uD83C\uDF75';
    if (n.includes('juice') || n.includes('lime') || n.includes('drink')) return '\uD83E\uDD64';
    if (n.includes('rice')) return '\uD83C\uDF5A';
    if (n.includes('curry')) return '\uD83C\uDF5B';
    return '\uD83C\uDF74';
}

function formatMoney(value) {
    return 'LKR ' + Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}
