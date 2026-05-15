const API_URL = '/api/products';
const SALES_URL = '/api/sales';
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

async function checkout() {
    if (cart.length === 0) return alert("Cart is empty!");
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const saleData = {
        total_amount: totalAmount,
        items: cart.map(item => ({ id: item.product_id, qty: item.qty, price: item.price }))
    };
    try {
        const res = await fetch(SALES_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(saleData)
        });
        if (res.ok) {
            alert("Transaction Successful!");
            cart = [];
            renderCart();
            refreshData();
        }
    } catch (e) {
        console.error(e);
    }
}

document.getElementById('crud-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const data = {
        name: document.getElementById('prod-name').value,
        price: parseFloat(document.getElementById('prod-price').value),
        stock: parseInt(document.getElementById('prod-stock').value),
        category_id: parseInt(document.getElementById('prod-category').value)
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

function addToCart(id) {
    const item = inventory.find(p => p.product_id === id);
    const cartItem = cart.find(c => c.product_id === id);
    if (cartItem) cartItem.qty++; else cart.push({ ...item, qty: 1 });
    renderCart();
}

function renderCart() {
    const container = document.getElementById('cart-items');
    container.innerHTML = cart.map(item => `
        <div class="cart-row">
            <div><b>${item.name}</b><br>Qty: ${item.qty}</div>
            <div>$${(item.price * item.qty).toFixed(2)}</div>
        </div>
    `).join('');
    document.getElementById('cart-total').textContent = `$${cart.reduce((s, i) => s + (i.price * i.qty), 0).toFixed(2)}`;
}

function renderInventoryTable() {
    document.getElementById('inventory-table').innerHTML = inventory.map(item => `
        <tr>
            <td>${item.product_id}</td>
            <td>${item.name}</td>
            <td>$${parseFloat(item.price).toFixed(2)}</td>
            <td>${item.stock}</td>
            <td><button class="act-btn del" onclick="deleteItem(${item.product_id})">Delete</button></td>
        </tr>
    `).join('');
}

function renderTerminal() {
    document.getElementById('product-grid').innerHTML = inventory.map(item => `
        <div class="product-card" onclick="addToCart(${item.product_id})">
            <div class="card-name">${item.name}</div>
            <div class="card-price">$${parseFloat(item.price).toFixed(2)}</div>
        </div>
    `).join('');
}

async function deleteItem(id) {
    if (confirm('Delete this item?')) {
        await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' });
        refreshData();
    }
}

function switchView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`${viewName}-view`).classList.add('active-view');
    event.currentTarget.classList.add('active');
}

window.onload = refreshData;
