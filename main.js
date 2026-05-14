const API_URL = '/api/products';
let inventory = [];
let cart = [];

async function refreshData() {
    try {
        const res = await fetch(API_URL);
        inventory = await res.json();
        renderTerminal();
        renderInventoryTable();
    } catch (e) {
        console.error(e);
    }
}

function switchView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`${viewName}-view`).classList.add('active-view');
    event.currentTarget.classList.add('active');
}

function addToCart(id) {
    const item = inventory.find(p => p.product_id === id);
    const cartItem = cart.find(c => c.product_id === id);
    if (cartItem) {
        cartItem.qty++;
    } else {
        cart.push({ ...item, qty: 1 });
    }
    renderCart();
}

function renderCart() {
    const cartContainer = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    cartContainer.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        const div = document.createElement('div');
        div.className = 'cart-row';
        div.innerHTML = `
            <div>
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-qty">Qty: ${item.qty}</div>
            </div>
            <div class="cart-item-price">$${itemTotal.toFixed(2)}</div>
        `;
        cartContainer.appendChild(div);
    });
    totalEl.textContent = `$${total.toFixed(2)}`;
}

function checkout() {
    if (cart.length === 0) {
        alert("Cart is empty!");
        return;
    }
    alert(`Transaction Successful!\nTotal: ${document.getElementById('cart-total').textContent}`);
    cart = [];
    renderCart();
}

document.getElementById('crud-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const data = {
        name: document.getElementById('prod-name').value,
        price: parseFloat(document.getElementById('prod-price').value),
        stock: parseInt(document.getElementById('prod-stock').value)
    };
    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        this.reset();
        refreshData();
    } catch (err) {
        console.error(err);
    }
});

async function deleteItem(id) {
    if (confirm('Delete from database?')) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            refreshData();
        } catch (err) {
            console.error(err);
        }
    }
}

function renderInventoryTable() {
    const tbody = document.getElementById('inventory-table');
    tbody.innerHTML = inventory.map(item => `
        <tr>
            <td>${item.product_id}</td>
            <td>${item.name}</td>
            <td>$${parseFloat(item.price).toFixed(2)}</td>
            <td>${item.stock}</td>
            <td>
                <button class="act-btn del" onclick="deleteItem(${item.product_id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function renderTerminal() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = inventory.map(item => `
        <div class="product-card" onclick="addToCart(${item.product_id})">
            <div class="card-name">${item.name}</div>
            <div class="card-price">$${parseFloat(item.price).toFixed(2)}</div>
        </div>
    `).join('');
}

document.querySelector('.pay-btn').onclick = checkout;
window.onload = refreshData;
